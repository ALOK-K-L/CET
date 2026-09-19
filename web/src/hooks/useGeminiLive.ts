'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality, Session } from '@google/genai/web';

// ── Helpers ──────────────────────────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}

// ── Types ────────────────────────────────────────────────────────────────

export type PeriodontalChartUpdate = {
  tooth_number: number;
  site?: 'mesio_facial' | 'facial' | 'disto_facial' | 'mesio_lingual' | 'lingual' | 'disto_lingual';
  pocket_depth?: number;
  recession?: number;
  bleeding?: boolean;
  is_missing?: boolean;
  is_correction?: boolean;
  is_clear_tooth?: boolean;
  is_normal?: boolean;
  plaque?: boolean;
  calculus?: boolean;
  suppuration?: boolean;
  mobility?: number | null;
  furcation?: number | null;
};

export type ChatMessage = {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  isFinal?: boolean;
  timestamp: number;
};

// ── Constants ────────────────────────────────────────────────────────────

const LIVE_API_MODEL = 'gemini-2.5-flash-native-audio-latest';

const SYSTEM_INSTRUCTION = `You are a clinical periodontal scribe assistant. Listen to the doctor dictate periodontal exams and immediately trigger the update_periodontal_chart tool.
- Vocabulary: Map 'mesial', 'mesio-facial', or 'mf' to mesio_facial; 'distal', 'disto-facial', or 'df' to disto_facial; 'facial', 'buccal', 'f', or 'b' to facial; 'lingual', 'palatal', 'l', or 'p' to lingual; 'ml' to mesio_lingual; 'dl' to disto_lingual.
- Default Site: If the doctor says "Tooth 4 bleeding" without specifying a site, you MUST default to "facial" for the site parameter.
- Homophones & Audio Nuance: You are listening to raw audio. Dentists speak quickly. If you hear 'tooth for', it means Tooth 4. 'Too' or 'to' means 2. 'Won' means 1. 'Ate' means 8. 'Tree' means 3. Always convert homophones logically to numeric tooth numbers and pocket depths.
- Normal/Healthy: If the doctor says 'normal' or 'healthy', record is_normal as true and bleeding as false. Do NOT record a pocket_depth.
- Deep pocket: If the doctor says 'deep pocket' without a measurement, record pocket_depth as 5.
- Cadence: If the doctor recites numbers sequentially (e.g., 'Tooth 3: 4, 3, 5 bleeding' or 'Tooth 4, 2 2 3 facial'), map them sequentially to the 3 sites of that surface. For facial: disto_facial, facial, mesio_facial (or mesio_facial, facial, disto_facial). Fire ONE tool call for EACH of the 3 measurements! For example, for '2 2 3 facial', fire three tool calls simultaneously for the three facial sites.
- Additional Findings: Capture plaque, calculus, suppuration (pus), mobility (class 1-3), and furcation (class 1-4) when dictated (e.g., 'Tooth 4 mobility 2', 'Tooth 5 plaque', 'Tooth 6 suppuration'). Mobility applies to the whole tooth but can be recorded under the site.
- Corrections (Same Tooth): If the doctor says 'scratch that', 'change to', 'make distal 4', or 'not bleeding', trigger the tool with the new values (e.g., bleeding: false) and is_correction: true.
- Erase / Clear Tooth: If the doctor explicitly asks to 'erase', 'clear', 'remove', or 'delete' a tooth (e.g., 'erase the status of tooth 9'), you MUST trigger the tool for that tooth with is_clear_tooth: true.
- Cross-Tooth Corrections & Stuttering: If the doctor rapidly changes the tooth number (e.g., 'bleeding tooth 4... no no it's 5... wait, 6') or says 'sorry I meant tooth X', you MUST immediately fire tool calls to clear any mistakenly identified teeth using is_clear_tooth: true, and fire ONE tool call for the final intended tooth with the correct measurements applied.
- Missing: If the doctor says 'tooth 5 missing' or 'extracted', trigger the tool with is_missing: true.
- Batch / Bulk commands: If the doctor says 'all remaining normal', 'rest are normal', 'everything else normal', 'mark remaining teeth normal', or similar batch phrases, you MUST call update_periodontal_chart ONCE FOR EACH uncharted tooth (teeth 1 through 32) with is_normal=true and bleeding=false. Do NOT provide a pocket_depth. Fire all the tool calls in rapid succession. Confirm verbally with something like "Marked all remaining teeth as normal."
- View Past Records: If the doctor says 'pull the past record', 'show previous exam', 'open history', or similar, you MUST trigger the toggle_past_record tool with show: true. Do NOT verbally claim whether records exist or not, just trigger the tool and say "Opening past record". If they say 'close record', 'hide history', or similar, trigger it with show: false.
- Save and Share: If the doctor says 'save this and send to patient', 'save and share', 'send report to patient', or similar, you MUST trigger the save_and_share_chart tool. Confirm verbally with "Saving and sending report to patient."
- Audio Confirmations: You MUST explicitly speak aloud a brief confirmation for EVERY measurement or correction you process (e.g., say "Tooth 4 bleeding", "Cleared Tooth 2, updated Tooth 3", or "Corrected to 3"). Do not stay silent.`;

const TOOL_DECLARATION: any = {
  name: "update_periodontal_chart",
  description: "Record periodontal measurements, conditions, or corrections for a specific tooth and site.",
  parameters: {
    type: "OBJECT" as const,
    properties: {
      tooth_number: { type: "INTEGER" as const, description: "Universal tooth number from 1 to 32." },
      site: {
        type: "STRING" as const,
        enum: ["mesio_facial", "facial", "disto_facial", "mesio_lingual", "lingual", "disto_lingual"],
        description: "Specific site on the tooth being measured."
      },
      pocket_depth: { type: "INTEGER" as const, description: "Exact pocket depth measurement in millimeters (1 to 12)." },
      bleeding: { type: "BOOLEAN" as const, description: "True if Bleeding on Probing (BOP) is present." },
      recession: { type: "INTEGER" as const, description: "Gingival recession in millimeters." },
      is_missing: { type: "BOOLEAN" as const, description: "True if the tooth is declared missing or extracted." },
      is_correction: { type: "BOOLEAN" as const, description: "True if the dentist is explicitly correcting a previous entry on the same tooth." },
      is_clear_tooth: { type: "BOOLEAN" as const, description: "True to completely wipe all data for this tooth. Use when the doctor says they meant a different tooth." },
      is_normal: { type: "BOOLEAN" as const, description: "True if the tooth is explicitly declared normal or healthy without a specific pocket depth measurement." },
      plaque: { type: "BOOLEAN" as const, description: "True if plaque is present." },
      calculus: { type: "BOOLEAN" as const, description: "True if calculus (tartar) is present." },
      suppuration: { type: "BOOLEAN" as const, description: "True if suppuration or pus is present." },
      mobility: { type: "INTEGER" as const, description: "Tooth mobility class (1, 2, or 3)." },
      furcation: { type: "INTEGER" as const, description: "Furcation involvement class (1, 2, 3, or 4)." }
    },
    required: ["tooth_number"]
  }
};

const TOGGLE_RECORD_TOOL: any = {
  name: "toggle_past_record",
  description: "Open or close the patient's past examination records view.",
  parameters: {
    type: "OBJECT" as const,
    properties: {
      show: { type: "BOOLEAN" as const, description: "True to open/show the past record, false to close/hide it." }
    },
    required: ["show"]
  }
};

const SAVE_AND_SHARE_TOOL: any = {
  name: "save_and_share_chart",
  description: "Trigger this when the doctor explicitly says 'save this and send to patient', 'save and share', or 'send report to patient'. This instantly saves the chart to the database and uploads the visual odontogram to the patient's portal.",
  parameters: {
    type: "OBJECT" as const,
    properties: {}
  }
};

// ── Clinical Dictation Parser ────────────────────────────────────────────

const NUMBER_WORDS: Record<string, number> = {
  one: 1, won: 1, first: 1,
  two: 2, second: 2,
  three: 3, tree: 3, third: 3,
  four: 4, fourth: 4,
  five: 5, fifth: 5,
  six: 6, sex: 6, sixth: 6,
  seven: 7, seventh: 7,
  eight: 8, ate: 8, eighth: 8,
  nine: 9, ninth: 9,
  ten: 10, tenth: 10,
  eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  'twenty-one': 21, 'twenty-two': 22, 'twenty-three': 23, 'twenty-four': 24,
  'twenty-five': 25, 'twenty-six': 26, 'twenty-seven': 27, 'twenty-eight': 28,
  'twenty-nine': 29, thirty: 30, 'thirty-one': 31, 'thirty-two': 32,
};

// Correction phrases that indicate the user is changing the tooth number, not dictating new data.
// The local parser should NOT handle these — they should be deferred to Gemini.
const CORRECTION_PHRASES = [
  'sorry', 'meant', 'actually', 'i meant', 'i mean',
  'no no', 'wait', 'scratch that', 'scratch', 'undo',
  'was talking about', 'talking about', 'wrong tooth',
  'not that', 'correction', 'correct that'
];

function containsCorrectionPhrase(text: string): boolean {
  const lower = text.toLowerCase();
  return CORRECTION_PHRASES.some(phrase => lower.includes(phrase));
}

function parseClinicalDictation(raw: string): PeriodontalChartUpdate | null {
  if (!raw) return null;
  let text = raw.toLowerCase()
    .replace(/[#,\-\.]/g, ' ')
    .replace(/\b(number|num|no\.?|chief)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If this contains a correction phrase, the local parser should NOT handle it.
  // Gemini (which has memory of the session) will handle cross-tooth corrections.
  if (containsCorrectionPhrase(text)) return null;

  // Pre-normalize common speech recognition mishearings BEFORE number conversion
  // Only include high-confidence substitutions that won't cause false positives
  const MISHEARING_MAP: Record<string, string> = {
    // "tooth" mishearings (conservative — only words that wouldn't appear in normal speech near numbers)
    'cute': 'tooth', 'toot': 'tooth', 'toof': 'tooth', 'tuth': 'tooth',
    'teats': 'tooth', 'teth': 'tooth', 'teeth': 'tooth', 'toots': 'tooth',
    'dooth': 'tooth', 'twoth': 'tooth',
    // "bleeding" mishearings
    'playing': 'bleeding', 'pleading': 'bleeding', 'plating': 'bleeding',
    'plaiting': 'bleeding', 'bleeds': 'bleeding', 'bleedings': 'bleeding',
    'bleed': 'bleeding', 'blood': 'bleeding',
    // "missing" mishearings
    'kissing': 'missing', 'hissing': 'missing', 'misting': 'missing',
    // "pocket" mishearings
    'packet': 'pocket', 'socket': 'pocket', 'pockets': 'pocket',
    // "depth" mishearings
    'death': 'depth', 'depths': 'depth',
    // "recession" mishearings
    'reception': 'recession',
    // "extracted" mishearings
    'attracted': 'extracted',
  };

  for (const [mishearing, correction] of Object.entries(MISHEARING_MAP)) {
    text = text.replace(new RegExp(`\\b${mishearing}\\b`, 'g'), correction);
  }

  // Convert number words to digits to simplify all subsequent parsing
  for (const [word, num] of Object.entries(NUMBER_WORDS)) {
    text = text.replace(new RegExp(`\\b${word}\\b`, 'g'), String(num));
  }

  const tokens = text.split(' ').filter(Boolean);

  // ── Tooth number extraction ────────────────────────────────────────
  let toothNum: number | null = null;

  // Strategy: "tooth" or "number" keyword followed by a digit
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === 'tooth' || tokens[i] === 'number' || tokens[i] === 'teeth') {
      const next = tokens[i + 1];
      if (next) {
        const parsed = parseInt(next, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 32) {
          toothNum = parsed;
          break;
        }
      }
    }
  }

  // If we can't safely extract a tooth number, let Gemini AI handle it!
  if (!toothNum) return null;

  // ── Site extraction ────────────────────────────────────────────────
  let site = 'facial';
  const words = text.split(' ');
  
  if (text.includes('mesio facial') || text.includes('mesiofacial') || words.includes('mf')) site = 'mesio_facial';
  else if (text.includes('disto facial') || text.includes('distofacial') || words.includes('df')) site = 'disto_facial';
  else if (text.includes('mesio lingual') || text.includes('mesiolingual') || words.includes('ml')) site = 'mesio_lingual';
  else if (text.includes('disto lingual') || text.includes('distolingual') || words.includes('dl')) site = 'disto_lingual';
  else if (text.includes('lingual') || text.includes('palatal') || words.includes('l')) site = 'lingual';
  else if (text.includes('facial') || text.includes('buccal') || words.includes('f') || words.includes('b')) site = 'facial';
  else if (text.includes('mesial')) site = 'mesio_facial';
  else if (text.includes('distal')) site = 'disto_facial';

  const res: PeriodontalChartUpdate = { tooth_number: toothNum, site };

  // ── Clear / Erase Explicit Commands ────────────────────────────────
  if (text.includes('clear') || text.includes('erase') || text.includes('remove') || text.includes('delete') || text.includes('reset')) {
    res.is_clear_tooth = true;
    return res;
  }

  // ── Conditions ─────────────────────────────────────────────────────
  if (text.includes('not bleed') || text.includes('no bleed') || text.includes('without bleed') || text.includes('not bleeding') || text.includes('no bleeding')) {
    res.bleeding = false;
    res.is_correction = true;
  } else if (text.includes('bleed') || text.includes('bop') || text.includes('blood')) {
    res.bleeding = true;
  }
  if (text.includes('miss') || text.includes('extract')) {
    res.is_missing = true;
  }

  // ── Pocket depth ───────────────────────────────────────────────────
  const pdMatch = text.match(/(\d+)\s*(?:mm|millimeters?|depth|pocket)/) || text.match(/(?:depth|pocket|is|measure|deep|at)\s*(\d+)/);
  let pd: number | null = null;
  if (pdMatch) {
    pd = parseInt(pdMatch[1], 10);
  } else {
    const allNumbers: number[] = [];
    const regex = /\b(\d+)\b/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      allNumbers.push(parseInt(match[1], 10));
    }
    const tIndex = toothNum ? allNumbers.indexOf(toothNum) : -1;
    if (tIndex !== -1) allNumbers.splice(tIndex, 1);
    
    const potentialPds = allNumbers.filter(n => n >= 1 && n <= 15);
    if (potentialPds.length > 0) {
      pd = potentialPds[0];
    }
  }

  if (pd !== null && pd >= 1 && pd <= 15) {
    res.pocket_depth = pd;
  } else if (text.includes('deep pocket') || text.includes('deep')) {
    res.pocket_depth = 5;
  } else if (text.includes('normal') || text.includes('healthy')) {
    res.bleeding = false;
    res.is_normal = true;
  }

  // ── Recession ──────────────────────────────────────────────────────
  const recMatch = text.match(/(?:recession|rec)\s*(\d+)/) || text.match(/(\d+)\s*(?:mm\s*)?recession/);
  if (recMatch) {
    const rec = parseInt(recMatch[1], 10);
    if (rec >= 0 && rec <= 10) res.recession = rec;
  }

  if (res.pocket_depth === undefined && res.bleeding === undefined && res.is_missing === undefined && res.recession === undefined && !res.is_correction) {
    return null;
  }

  return res;
}

// ── Hook ─────────────────────────────────────────────────────────────────

export function useGeminiLive(
  onMeasurementReceived: (data: PeriodontalChartUpdate) => void,
  onTogglePastRecord: (show: boolean) => void,
  onSaveAndShare: () => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);

  // Use refs for callbacks to prevent stale closures inside WebSocket event listeners
  const onMeasurementReceivedRef = useRef(onMeasurementReceived);
  const onTogglePastRecordRef = useRef(onTogglePastRecord);
  const onSaveAndShareRef = useRef(onSaveAndShare);

  useEffect(() => {
    onMeasurementReceivedRef.current = onMeasurementReceived;
    onTogglePastRecordRef.current = onTogglePastRecord;
    onSaveAndShareRef.current = onSaveAndShare;
  }, [onMeasurementReceived, onTogglePastRecord, onSaveAndShare]);

  const isExamActiveRef = useRef(false);
  const lastProcessedKeyRef = useRef<string>('');
  const lastChartedToothRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  // ── Helper: add message to chat log ────────────────────────────────

  const addMessage = useCallback((sender: ChatMessage['sender'], text: string) => {
    setChatLog(prev => [...prev, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sender,
      text,
      isFinal: true,
      timestamp: Date.now(),
    }]);
  }, []);

  // ── Playback (24 kHz PCM from Gemini) ──────────────────────────────
  
  const nextAudioTimeRef = useRef<number>(0);

  const playAudio = useCallback((base64Audio: string) => {
    if (!playbackContextRef.current) {
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
      nextAudioTimeRef.current = playbackContextRef.current.currentTime;
    }
    const ctx = playbackContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const binary = window.atob(base64Audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;

    const buf = ctx.createBuffer(1, float32.length, 24000);
    buf.copyToChannel(float32, 0);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    
    const startTime = Math.max(ctx.currentTime, nextAudioTimeRef.current);
    src.start(startTime);
    nextAudioTimeRef.current = startTime + buf.duration;
  }, []);

  // ── Speech Recognition (Continuous & Resilient) ────────────────────

  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const activeText = (finalTranscript || interimTranscript).trim();

      // Real-time zero-latency dictation parser
      // NOTE: If the text contains a correction phrase (sorry, meant, actually, etc.)
      // parseClinicalDictation returns null so we defer entirely to Gemini AI,
      // which has session memory and can fire is_clear_tooth + new data.
      if (activeText) {
        const parsed = parseClinicalDictation(activeText);
        if (parsed) {
          const actionKey = `${parsed.tooth_number}_${parsed.site}_${parsed.bleeding}_${parsed.pocket_depth}_${parsed.is_missing}`;
          if (lastProcessedKeyRef.current !== actionKey) {
            lastProcessedKeyRef.current = actionKey;
            lastChartedToothRef.current = parsed.tooth_number;
            onMeasurementReceivedRef.current(parsed);

            const parts: string[] = [`Tooth ${parsed.tooth_number}`];
            if (parsed.is_missing) parts.push('MISSING');
            if (parsed.site) parts.push(parsed.site.replace(/_/g, ' '));
            if (parsed.pocket_depth) parts.push(`PD: ${parsed.pocket_depth}mm`);
            if (parsed.recession) parts.push(`Rec: ${parsed.recession}mm`);
            if (parsed.bleeding) parts.push('BOP');
            addMessage('ai', `📋 ${parts.join(' · ')}`);
          }
        }
      }

      if (finalTranscript) {
        const text = finalTranscript.trim();
        setChatLog(prev => {
          const filtered = prev.filter(m => m.id !== 'interim-user');
          return [...filtered, {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            sender: 'user' as const,
            text,
            isFinal: true,
            timestamp: Date.now(),
          }];
        });

        // Forward to live Gemini session
        if (sessionRef.current) {
          try {
            sessionRef.current.sendRealtimeInput({ text });
          } catch (_) {}
        }
      } else if (interimTranscript) {
        setChatLog(prev => {
          const filtered = prev.filter(m => m.id !== 'interim-user');
          return [...filtered, {
            id: 'interim-user',
            sender: 'user' as const,
            text: interimTranscript,
            isFinal: false,
            timestamp: Date.now(),
          }];
        });
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return;
      console.warn('[Live] SpeechRecognition error:', event.error);
      // Force stop to guarantee onend fires and restarts it
      try { recognition.stop(); } catch (_) {}
    };

    recognition.onend = () => {
      if (isExamActiveRef.current) {
        setTimeout(() => {
          if (isExamActiveRef.current) {
            try {
              recognition.start();
            } catch (_) {}
          }
        }, 150);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('[Live] SpeechRecognition start failed:', e);
    }
  }, [onMeasurementReceived, addMessage]);

  // ── Gemini Live Session Connector (with auto-reconnect) ───────────

  const connectGemini = useCallback(async () => {
    if (!isExamActiveRef.current) return;

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set in .env');

      const ai = new GoogleGenAI({ apiKey });

      const session = await ai.live.connect({
        model: LIVE_API_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Aoede',
              }
            }
          },
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
          },
          tools: [{
            functionDeclarations: [TOOL_DECLARATION, TOGGLE_RECORD_TOOL, SAVE_AND_SHARE_TOOL]
          }]
        },
        callbacks: {
          onopen: () => {
            console.log('[Live] WebSocket connected');
            setIsConnected(true);
          },
          onmessage: (msg: any) => {
            // Handle tool calls
            if (msg.toolCall) {
              const calls = msg.toolCall.functionCalls ?? [];
              for (const call of calls) {
                if (call.name === 'update_periodontal_chart') {
                  const args = call.args as PeriodontalChartUpdate;
                  console.log('[Live] Chart update:', args);
                  onMeasurementReceivedRef.current(args);

                  // Handle is_clear_tooth — just show a "Cleared" message
                  if (args.is_clear_tooth) {
                    addMessage('ai', `🗑️ Cleared Tooth ${args.tooth_number}`);
                  } else {
                    // Track last charted tooth for correction context
                    lastChartedToothRef.current = args.tooth_number;

                    // Build a clean clinical transcript from the AI's interpretation
                    const clinicalParts: string[] = [`Tooth ${args.tooth_number}`];
                    if (args.is_missing) clinicalParts.push('is missing');
                    else {
                      if (args.site) clinicalParts.push(args.site.replace(/_/g, ' '));
                      if (args.pocket_depth) clinicalParts.push(`${args.pocket_depth}mm`);
                      if (args.bleeding === true) clinicalParts.push('bleeding');
                      if (args.bleeding === false && args.is_correction) clinicalParts.push('not bleeding');
                      if (args.recession) clinicalParts.push(`recession ${args.recession}mm`);
                    }
                    const cleanTranscript = clinicalParts.join(' ');

                    // Replace the most recent user message with the clean clinical version
                    setChatLog(prev => {
                      const updated = [...prev];
                      for (let i = updated.length - 1; i >= 0; i--) {
                        if (updated[i].sender === 'user') {
                          updated[i] = { ...updated[i], text: cleanTranscript };
                          break;
                        }
                      }
                      return updated;
                    });

                    const summaryParts: string[] = [`Tooth ${args.tooth_number}`];
                  if (args.is_missing) summaryParts.push('MISSING');
                  if (args.site) summaryParts.push(args.site.replace(/_/g, ' '));
                  if (args.pocket_depth) summaryParts.push(`PD: ${args.pocket_depth}mm`);
                  if (args.recession) summaryParts.push(`Rec: ${args.recession}mm`);
                  if (args.bleeding) summaryParts.push('BOP');
                  if (args.is_correction) summaryParts.push('(corrected)');
                  addMessage('ai', `📋 ${summaryParts.join(' · ')}`);
                  } // end else (not is_clear_tooth)

                  // Send standard function response (always, for both clear and normal)
                  try {
                    sessionRef.current?.sendToolResponse({
                      functionResponses: [{
                        id: call.id,
                        name: call.name,
                        response: { output: { status: "OK" } }
                      }]
                    });
                  } catch (toolErr) {
                    console.warn('[Live] Error sending tool response:', toolErr);
                  }
                } else if (call.name === 'toggle_past_record') {
                  const args = call.args as { show: boolean };
                  console.log('[Live] Toggle past record:', args);
                  onTogglePastRecordRef.current(args.show);
                  addMessage('ai', args.show ? '📂 Opening past record...' : '📂 Closing past record');
                  
                  try {
                    sessionRef.current?.sendToolResponse({
                      functionResponses: [{
                        id: call.id,
                        name: call.name,
                        response: { output: { status: "OK" } }
                      }]
                    });
                  } catch (toolErr) {
                    console.warn('[Live] Error sending tool response:', toolErr);
                  }
                } else if (call.name === 'save_and_share_chart') {
                  console.log('[Live] Save and Share triggered');
                  onSaveAndShareRef.current();
                  addMessage('ai', '💾 Saving and sharing report to patient portal...');
                  
                  try {
                    sessionRef.current?.sendToolResponse({
                      functionResponses: [{
                        id: call.id,
                        name: call.name,
                        response: { output: { status: "OK" } }
                      }]
                    });
                  } catch (toolErr) {
                    console.warn('[Live] Error sending tool response:', toolErr);
                  }
                }
              }
            }

            // Audio playback from Gemini
            if (msg.serverContent?.modelTurn?.parts) {
              for (const part of msg.serverContent.modelTurn.parts) {
                if (part.inlineData?.mimeType?.startsWith('audio/pcm')) {
                  playAudio(part.inlineData.data);
                }
              }
            }
          },
          onerror: (err: any) => {
            console.error('[Live] WebSocket error:', err);
          },
          onclose: (ev: any) => {
            console.log('[Live] WebSocket closed:', ev);
            if (isExamActiveRef.current) {
              console.log('[Live] Exam still active, auto-reconnecting Gemini Live in 1s...');
              sessionRef.current = null;
              if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
              reconnectTimeoutRef.current = setTimeout(() => {
                if (isExamActiveRef.current) {
                  connectGemini();
                }
              }, 1000);
            } else {
              setIsConnected(false);
              setIsRecording(false);
              addMessage('system', 'Session ended');
            }
          }
        }
      });

      sessionRef.current = session;
      setIsConnected(true);
    } catch (err: any) {
      console.error('[Live] Failed to connect to Gemini Live:', err);
      // If exam is still active, retry after 2 seconds
      if (isExamActiveRef.current) {
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isExamActiveRef.current) connectGemini();
        }, 2000);
      }
    }
  }, [onMeasurementReceived, playAudio, addMessage]);

  // ── Start exam ─────────────────────────────────────────────────────

  const startExam = useCallback(async () => {
    try {
      setConnectionError(null);
      setChatLog([]);
      isExamActiveRef.current = true;
      setIsRecording(true);

      addMessage('system', 'Connecting to Gemini Live API...');

      // 1. Grab microphone stream
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone not available — use localhost or HTTPS');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      (window as any).__dentalVoiceProcessor = processor;

      processor.onaudioprocess = (e) => {
        if (!isExamActiveRef.current || !sessionRef.current) return;
        try {
          const pcm16 = floatTo16BitPCM(e.inputBuffer.getChannelData(0));
          const b64 = arrayBufferToBase64(pcm16.buffer as ArrayBuffer);
          sessionRef.current.sendRealtimeInput({
            audio: { mimeType: 'audio/pcm;rate=16000', data: b64 }
          });
        } catch (_) {
          // Socket might be temporarily reconnecting
        }
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

      // 2. Start continuous speech recognition
      startSpeechRecognition();

      // 3. Connect to Gemini Live API
      await connectGemini();

      addMessage('system', '✅ Connected — listening continuously until you click Stop Exam');

    } catch (error: any) {
      console.error('Failed to start exam:', error);
      isExamActiveRef.current = false;
      setConnectionError(error.message || String(error));
      addMessage('system', `❌ Failed: ${error.message}`);
      setIsConnected(false);
      setIsRecording(false);
    }
  }, [connectGemini, startSpeechRecognition, addMessage]);

  // ── Stop exam ──────────────────────────────────────────────────────

  const stopExam = useCallback(() => {
    isExamActiveRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    processorRef.current?.disconnect();
    audioContextRef.current?.close().catch(() => {});
    streamRef.current?.getTracks().forEach(t => t.stop());

    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (_) {}
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }

    sessionRef.current = null;
    processorRef.current = null;
    audioContextRef.current = null;
    streamRef.current = null;

    setIsRecording(false);
    setIsConnected(false);
    addMessage('system', 'Exam stopped — data preserved');
  }, [addMessage]);

  return { isConnected, isRecording, startExam, stopExam, connectionError, chatLog };
}
