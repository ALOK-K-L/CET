'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authenticateUser, signupUser } from '@/app/actions';
import { X, User, Activity, AlertCircle, Sparkles } from 'lucide-react';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const result = await authenticateUser(role, email, password);
        if (role === 'patient') {
          localStorage.setItem('currentPatientId', result.patientId as string);
          router.push('/patient');
        } else {
          localStorage.setItem('currentDoctorId', result.doctorId as string);
          router.push('/doctor');
        }
      } else {
        const result = await signupUser(role, firstName, lastName, email, password);
        if (role === 'patient') {
          localStorage.setItem('currentPatientId', result.patientId as string);
          router.push('/patient');
        } else {
          localStorage.setItem('currentDoctorId', result.doctorId as string);
          router.push('/doctor');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
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

        {/* Header Graphic */}
        <div className="pt-8 pb-6 px-8 text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-brand-cyan/10 to-transparent"></div>
          <div className="w-16 h-16 bg-gradient-to-tr from-brand-navy to-brand-blue rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-brand-blue/30 relative z-10">
            {role === 'doctor' ? <Activity className="w-8 h-8 text-brand-cyan" /> : <User className="w-8 h-8 text-brand-cyan" />}
          </div>
          <h2 className="text-2xl font-extrabold text-brand-navy mt-4 relative z-10">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-brand-muted mt-1 relative z-10">
            {role === 'doctor' ? 'Clinician & Provider Portal' : 'Patient Health Portal'}
          </p>
        </div>

        {/* Role Toggle */}
        <div className="px-8 pb-6">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setRole('patient')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === 'patient' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Patient
            </button>
            <button
              onClick={() => setRole('doctor')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === 'doctor' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Doctor
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">First Name</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/50 transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Last Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/50 transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/50 transition-all"
              placeholder={role === 'doctor' ? 'doctor@clinic.com' : 'patient@email.com'}
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 bg-brand-navy hover:bg-brand-blue text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                {mode === 'login' && <Sparkles className="w-4 h-4 text-brand-cyan" />}
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="bg-slate-50 py-4 text-center border-t border-slate-100">
          <p className="text-xs text-brand-muted">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="font-bold text-brand-blue hover:text-brand-navy transition-colors"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
