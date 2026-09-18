'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThreeJSTooth from '@/components/ThreeJSTooth';
import AuthModal from '@/components/AuthModal';
import { 
  Activity, ArrowRight, Sparkles, PlayCircle, ShieldCheck, Zap, Award, 
  Mic, BrainCircuit, CheckCircle, Layers, FileCheck2, Workflow, AudioLines, 
  Droplet, Check, Undo2, Sliders, Wifi, LayoutDashboard, Users, ClipboardList, 
  Bot, Calendar, BarChart3, Settings, Clock, AlertTriangle, UserCheck, 
  History, Scan, Image as ImageIcon, CheckSquare, ShieldAlert, Send
} from 'lucide-react';

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="bg-white text-brand-slate font-sans antialiased selection:bg-brand-cyan/20 selection:text-brand-navy">
      
      {/* Auth Modal Overlay */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* ========================================================================= */}
      {/* NAVBAR                                                                    */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-navy to-brand-blue flex items-center justify-center text-white shadow-md shadow-brand-blue/20 group-hover:scale-105 transition-transform duration-300">
              <Activity className="w-5 h-5 text-brand-cyan" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-brand-navy font-mono">LIFEBEAT<span className="text-brand-cyan font-sans font-medium text-xs ml-1.5 px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200/60 uppercase tracking-widest">Dental</span></span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-slate">
            <Link href="#platform" className="hover:text-brand-blue transition-colors">Platform</Link>
            <Link href="#voice-charting" className="hover:text-brand-blue transition-colors flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-ping"></span>
              Voice Charting
            </Link>
            <Link href="#clinical-intelligence" className="hover:text-brand-blue transition-colors">Clinical Intelligence</Link>
            <Link href="#dashboard" className="hover:text-brand-blue transition-colors">Dashboard</Link>
            <Link href="#workflow" className="hover:text-brand-blue transition-colors">Solutions</Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-4">
            <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-semibold text-brand-navy hover:text-brand-blue transition-colors px-3 py-2 cursor-pointer">Clinician Portal</button>
            <button onClick={() => setIsAuthModalOpen(true)} className="relative group overflow-hidden rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-glow-cyan transition-all duration-300 cursor-pointer">
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-brand-blue to-brand-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* HERO SECTION WITH INTERACTIVE THREE.JS 3D TOOTH                           */}
      {/* ========================================================================= */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 overflow-hidden bg-gradient-to-b from-slate-50/50 via-white to-white">
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/60 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-cyan pulse-node"></span>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue font-mono">Next-Gen Real-Time Clinical AI</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-navy tracking-tight leading-[1.12]">
                  The Future of Dental Care, <span className="shimmer-text">Powered by Intelligence.</span>
                </h1>
                <p className="text-lg font-medium text-brand-blue tracking-wide italic">
                  "Listen closer. Chart faster. Act sooner."
                </p>
                <p className="text-base sm:text-lg text-brand-muted max-w-xl font-normal leading-relaxed">
                  Lifebeat Dental brings sub-100ms real-time voice charting and multimodal clinical intelligence together—empowering dental teams to record periodontal metrics, review imaging, and manage patient care 100% hands-free.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="#voice-charting" className="px-7 py-3.5 rounded-full bg-brand-navy text-white text-sm font-semibold shadow-lg shadow-brand-navy/15 hover:shadow-glow-cyan hover:bg-brand-blue transition-all duration-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-cyan" />
                  Explore Platform
                </Link>
                <Link href="#workflow" className="px-7 py-3.5 rounded-full bg-white text-brand-navy border border-brand-border text-sm font-semibold hover:bg-slate-50 transition-all duration-300 flex items-center gap-2 shadow-sm">
                  <PlayCircle className="w-4 h-4 text-brand-muted" />
                  See How It Works
                </Link>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center gap-8 text-xs font-semibold text-brand-muted uppercase tracking-wider font-mono">
                <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-teal" /><span>HIPAA Compliant</span></div>
                <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-brand-blue" /><span>&lt;80ms Voice Latency</span></div>
                <div className="flex items-center gap-2"><Award className="w-4 h-4 text-brand-cyan" /><span>99.4% Accuracy</span></div>
              </div>
            </div>

            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="absolute inset-0 max-w-md mx-auto aspect-square rounded-full bg-gradient-to-tr from-cyan-200/30 to-blue-300/20 blur-3xl pointer-events-none"></div>

              {/* THREE.JS INTEGRATION */}
              <ThreeJSTooth />

              <div className="absolute top-4 left-2 sm:left-4 z-20 glass-card px-4 py-2.5 rounded-2xl shadow-float-pill flex items-center gap-3 border border-white/80 animate-bounce duration-[4000ms]">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center text-brand-cyan border border-cyan-100"><Mic className="w-4 h-4 animate-pulse" /></div>
                <div><p className="text-[11px] font-mono font-medium text-brand-muted">STATUS</p><p className="text-xs font-bold text-brand-navy">Voice Charting Active</p></div>
              </div>

              <div className="absolute top-10 right-2 sm:right-4 z-20 glass-card p-3 rounded-2xl shadow-float-pill border border-white/80 space-y-1 text-left">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span><span className="text-xs font-mono font-bold text-brand-navy">Pocket Depth: 4 mm</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span><span className="text-xs font-semibold text-rose-600">Bleeding: Detected (Tooth 36)</span></div>
              </div>

              <div className="absolute bottom-12 left-0 sm:left-2 z-20 glass-card px-4 py-3 rounded-2xl shadow-float-pill border border-white/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-navy to-brand-blue flex items-center justify-center text-white shadow-sm"><BrainCircuit className="w-5 h-5 text-brand-cyan" /></div>
                <div className="text-left"><span className="text-[10px] font-mono text-brand-cyan tracking-wider font-semibold uppercase">AI Assistant</span><p className="text-xs font-bold text-brand-navy">Subgingival Calculus Alert</p></div>
              </div>

              <div className="absolute bottom-6 right-2 sm:right-6 z-20 glass-card px-3.5 py-2 rounded-xl shadow-float-pill border border-emerald-100 flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /><span className="text-xs font-semibold text-brand-slate">Patient Record Synced</span>
              </div>

              <div className="absolute bottom-1 font-mono text-[10px] text-brand-muted/70 tracking-wider uppercase pointer-events-none">
                • Drag to rotate 3D anatomical model •
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: CLINICAL INTELLIGENCE FEATURES */}
      <section id="clinical-intelligence" className="py-24 bg-brand-surface relative border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-brand-border text-xs font-mono font-semibold text-brand-blue">
              INTELLIGENT DENTAL ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">Every Finding. One Intelligent Platform.</h2>
            <p className="text-base text-brand-muted">Eliminate disjointed charting software. Lifebeat Dental fuses real-time voice recognition with deep clinical decision support into a singular workflow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-subtle-card border border-brand-border hover:shadow-glow-cyan hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-100 text-brand-cyan flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-navy transition-all duration-300"><Mic className="w-7 h-7" /></div>
                <h3 className="text-lg font-bold text-brand-navy mb-3">Real-Time Voice Charting</h3>
                <p className="text-sm text-brand-muted leading-relaxed">Capture periodontal measurements naturally through speech. Sub-100ms structured data reflects directly into buccal and lingual slots without latency.</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-subtle-card border border-brand-border hover:shadow-glow-cyan hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-brand-blue flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-navy transition-all duration-300"><Layers className="w-7 h-7" /></div>
                <h3 className="text-lg font-bold text-brand-navy mb-3">Multimodal Intelligence</h3>
                <p className="text-sm text-brand-muted leading-relaxed">Bring together historical periodontal charts, high-res CBCT scans, bitewings, prescription logs, and pathology notes into a consolidated patient twin.</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-subtle-card border border-brand-border hover:shadow-glow-cyan hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-navy transition-all duration-300"><FileCheck2 className="w-7 h-7" /></div>
                <h3 className="text-lg font-bold text-brand-navy mb-3">Smart Patient Records</h3>
                <p className="text-sm text-brand-muted leading-relaxed">Maintain pristine dental and systemic health histories. Cross-reference drug interactions (e.g., blood thinners) during surgical charting automatically.</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-subtle-card border border-brand-border hover:shadow-glow-cyan hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-brand-teal flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-navy transition-all duration-300"><Workflow className="w-7 h-7" /></div>
                <h3 className="text-lg font-bold text-brand-navy mb-3">Practice Workflow</h3>
                <p className="text-sm text-brand-muted leading-relaxed">Automate operatory turns, clinical note transcription, ADA procedure code billing, and recall triggers seamlessly as the clinician works.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: REAL-TIME VOICE CHARTING */}
      <section id="voice-charting" className="py-28 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200/70 text-xs font-mono font-semibold text-cyan-800">
              <AudioLines className="w-3.5 h-3.5 text-brand-cyan" /> SUB-100MS VOICE ENGINE
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-brand-navy tracking-tight">Your Voice. Instantly Structured.</h2>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-brand-border shadow-2xl p-6 lg:p-10 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
                <div>
                  <p className="text-sm font-bold text-brand-navy">Active Perio Exam Session</p>
                  <p className="text-xs text-brand-muted font-mono">Patient: Emily Carter (ID: #PC-2489) • Provider: Dr. Sarah Jenkins</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
                <span className="text-brand-navy font-semibold">Microphone Live (Edge ASR Active)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center relative overflow-hidden">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-brand-navy to-brand-blue flex items-center justify-center text-white shadow-glow-cyan relative group cursor-pointer">
                    <Mic className="w-8 h-8 text-brand-cyan" />
                    <div className="absolute inset-0 rounded-full border-2 border-brand-cyan/40 pulse-node"></div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-brand-muted">Spoken Audio Stream:</span>
                    <p className="text-sm font-semibold text-brand-navy mt-1 bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-100 italic">
                      "Tooth 36, pocket depth 4 millimeters, bleeding, recession 1 millimeter."
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-blue">AI Parsed Structure</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">VALIDATED 99.8%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[11px] font-mono text-brand-muted">TARGET TOOTH</p>
                      <p className="text-base font-bold text-brand-navy">#36 (Lower Left 1st Molar)</p>
                    </div>
                    <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
                      <p className="text-[11px] font-mono text-amber-700">POCKET DEPTH</p>
                      <p className="text-base font-bold text-amber-900">4 mm</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-brand-navy">Universal Periodontal Arch</h4>
                  <p className="text-xs text-brand-muted mb-4">Mandibular & Maxillary Probing Depth Array</p>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="text-center font-mono text-[11px] text-brand-muted mb-2">ARCH VISUALIZATION</div>
                    <div className="h-32 bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-400 text-sm">
                      Interactive Odontogram Embedded Here
                      <Link href="/doctor" className="mt-2 text-brand-blue underline">Go to Charting Dashboard</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: CALL TO ACTION */}
      <section className="py-24 bg-brand-navy text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-brand-cyan">READY TO MODERNIZE YOUR OPERATORY?</div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Transform the Way Your <br className="hidden sm:inline" />
            <span className="shimmer-text">Dental Practice Works.</span>
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button onClick={() => setIsAuthModalOpen(true)} className="px-8 py-4 rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan text-brand-navy font-bold text-sm hover:shadow-glow-cyan hover:scale-105 transition-all duration-300">
              Explore the Platform
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-brand-border py-16 text-brand-slate">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-navy flex items-center justify-center text-brand-cyan"><Activity className="w-5 h-5" /></div>
              <span className="text-xl font-extrabold text-brand-navy font-mono">LIFEBEAT<span className="text-brand-blue font-sans">Dental</span></span>
            </div>
            <p className="text-xs text-brand-muted max-w-sm leading-relaxed">The next-generation clinical intelligence and real-time voice periodontal platform built for high-performance dental teams.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
