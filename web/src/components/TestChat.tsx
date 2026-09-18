'use client';

import { useState } from 'react';
import { GoogleGenAI } from '@google/genai/web';

export default function TestChat() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;
    setIsLoading(true);
    setResponse('');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: input,
      });
      setResponse(result.text || 'No response text');
    } catch (err: any) {
      console.error(err);
      setResponse(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-12 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-6xl mx-auto font-sans">
      <h3 className="text-xl font-bold mb-4">Gemini API Tester</h3>
      <p className="text-gray-500 mb-4 text-sm">Send a message to gemini-2.5-flash to verify your API key is working.</p>
      
      <form onSubmit={testAPI} className="flex gap-2 mb-4">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Say hello to Gemini..." 
          className="flex-1 px-4 py-2 text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Test API'}
        </button>
      </form>
      
      {response && (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 whitespace-pre-wrap">
          <strong className="text-gray-700">Response:</strong>
          <p className="mt-2 text-gray-800">{response}</p>
        </div>
      )}
    </div>
  );
}
