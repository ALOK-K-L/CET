'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyShareCode } from '@/app/actions';
import { X, Search, AlertCircle, ScanLine, Upload } from 'lucide-react';
import jsQR from 'jsqr';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
};

export default function GetPatientDataModal({ isOpen, onClose, doctorId }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyAndSubmit(code);
  };

  const verifyAndSubmit = async (pin: string) => {
    setError('');
    
    if (pin.length !== 6) {
      setError('Code must be exactly 6 digits.');
      return;
    }

    setIsLoading(true);
    try {
      const patientId = await verifyShareCode(pin, doctorId);
      router.push(`/doctor/patient/${patientId}`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
          if (qrCode) {
            try {
              const urlObj = new URL(qrCode.data);
              const extractedCode = urlObj.searchParams.get('code');
              if (extractedCode && extractedCode.length === 6) {
                setCode(extractedCode);
                setError('');
                // Optionally auto-submit: verifyAndSubmit(extractedCode);
              } else {
                setError('QR code does not contain a valid 6-digit access PIN.');
              }
            } catch (err) {
              setError('Invalid QR code URL format.');
            }
          } else {
            setError('No QR code detected in the image.');
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

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
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-50 to-transparent"></div>
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-500/30 relative z-10">
            <ScanLine className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-4 relative z-10">
            Access Patient Data
          </h2>
          <p className="text-sm text-slate-500 mt-1 relative z-10">
            Enter the 6-digit access PIN provided by the patient.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <div className="flex justify-center">
              <input 
                type="text" 
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))} // only numbers
                required
                className="w-full max-w-[240px] px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-3xl font-black font-mono tracking-[0.5em] text-center focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                placeholder="000000"
              />
            </div>
            <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">
              Numeric PIN generated from the patient app
            </p>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">Or</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="flex justify-center">
            <label className="cursor-pointer flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors w-full border border-slate-200 border-dashed">
              <Upload className="w-4 h-4" />
              Upload QR Code Image
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || code.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-pulse">Verifying...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Fetch Records</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
