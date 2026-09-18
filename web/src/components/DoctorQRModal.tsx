'use client';

import { X, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
};

export default function DoctorQRModal({ isOpen, onClose, doctorId }: Props) {
  if (!isOpen) return null;

  // We use the first 6 characters of the doctor's ID as their permanent PIN
  const doctorPin = doctorId.slice(0, 6).toUpperCase();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pt-8 pb-6 px-8 text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-50 to-transparent"></div>
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 relative z-10">
            <QrCode className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-4 relative z-10">
            My Access QR
          </h2>
          <p className="text-sm text-slate-500 mt-1 relative z-10 px-4">
            Show this to your patients. They can scan it to grant you permanent access to their medical records.
          </p>
        </div>

        {/* QR Code and PIN */}
        <div className="px-8 pb-8 flex flex-col items-center">
          
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 mb-6">
            <QRCodeSVG 
              value={`medikiosk:doctor:${doctorPin}`} 
              size={200}
              fgColor="#1e293b"
            />
          </div>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Or Use Permanent PIN</p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-8 w-full max-w-[200px] text-center shadow-inner">
            <span className="text-3xl font-black text-slate-800 tracking-[0.2em] font-mono">{doctorPin}</span>
          </div>

        </div>

      </div>
    </div>
  );
}
