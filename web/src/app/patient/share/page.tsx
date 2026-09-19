'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { grantDoctorAccess, getPatientAccessHistory } from '@/app/actions';
import { Upload, CheckCircle2, AlertCircle, ShieldCheck, ArrowLeft, Stethoscope, Clock, FileKey } from 'lucide-react';
import jsQR from 'jsqr';

export default function ShareProfilePage() {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [doctorPin, setDoctorPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const pid = localStorage.getItem('currentPatientId');
    if (!pid) {
      router.push('/');
    } else {
      setPatientId(pid);
      getPatientAccessHistory(pid).then(setHistory).catch(console.error);
    }
  }, [router]);

  const handleGrantAccess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!patientId || !doctorPin) return;
    
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await grantDoctorAccess(patientId, doctorPin, 'ongoing');
      setSuccess('Access successfully granted!');
      setDoctorPin('');
      
      // Refresh history
      const updatedHistory = await getPatientAccessHistory(patientId);
      setHistory(updatedHistory);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to grant access. Please check the PIN.');
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
              // The QR code contains `medikiosk:doctor:PIN`
              const data = qrCode.data;
              if (data.startsWith('medikiosk:doctor:')) {
                const pin = data.split(':')[2];
                if (pin && pin.length === 6) {
                  setDoctorPin(pin);
                  setError('');
                  // Note: user still needs to click "Grant Access" to confirm
                } else {
                  setError('QR code does not contain a valid 6-character access PIN.');
                }
              } else {
                 setError('Invalid Doctor QR code.');
              }
            } catch (err) {
              setError('Error parsing QR code.');
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

  if (!patientId) return null;

  return (
    <main className="min-h-screen bg-[#fafafa] font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/patient" className="flex items-center gap-2 text-sky-600 hover:text-sky-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-light tracking-wide text-sm">Share Clinical Profile</span>
        </Link>
        <div className="flex items-center gap-1.5 text-emerald-600">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-light text-xs tracking-wide">HIPAA Compliant Session</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center p-4 py-12">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-12 w-full max-w-lg border border-gray-50 text-center">
          
          <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-sky-600">
            <Stethoscope className="w-8 h-8" />
          </div>
          
          <h1 className="text-2xl font-light text-slate-800 mb-3 tracking-tight">Provide Doctor Access</h1>
          <p className="text-slate-400 font-light text-sm max-w-sm mx-auto mb-8 leading-relaxed">
            Enter your doctor's 6-character permanent Access PIN or upload a photo of their QR code to instantly grant them access to your records.
          </p>

          <form onSubmit={handleGrantAccess} className="space-y-6">
            
            {/* PIN Input */}
            <div>
              <input 
                type="text" 
                maxLength={6}
                value={doctorPin}
                onChange={e => setDoctorPin(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-2xl font-mono tracking-[0.5em] text-center focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-gray-200 text-slate-700 uppercase"
                placeholder="ABC123"
              />
            </div>

            {/* Error / Success Messages */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-medium flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-xs font-medium flex items-center gap-2 text-left">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            <div className="flex justify-center">
              <label className="cursor-pointer flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-slate-500 px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full border border-gray-200 border-dashed">
                <Upload className="w-4 h-4" />
                Upload Doctor's QR Code
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
              disabled={isLoading || doctorPin.length !== 6}
              className="w-full mt-2 px-10 py-3.5 bg-[#0277bd] hover:bg-[#0266a2] text-white font-medium rounded-xl transition-all disabled:opacity-50 text-sm tracking-wide"
            >
              {isLoading ? 'Verifying...' : 'Grant Access'}
            </button>
          </form>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs font-light text-slate-400 tracking-wide">
        Lumiere Patient Portal • E2E Encrypted Sync
      </footer>
    </main>
  );
}
