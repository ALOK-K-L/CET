'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPatientRecord } from '@/app/actions';
import { FileUp, PlusCircle, X } from 'lucide-react';

export default function DoctorUploadForm({ patientId }: { patientId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'medicine'>('general');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (!note && !file)) {
      alert('Please provide a name and either a note or a file.');
      return;
    }

    setIsSubmitting(true);
    try {
      let content = note;
      let baseType = 'text';

      if (file) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
        content = base64;
        baseType = file.type.includes('pdf') ? 'pdf' : 'image';
      }

      const finalType = `doctor_${activeTab === 'medicine' ? `medicine_${baseType}` : baseType}`;
      await createPatientRecord(patientId, name, finalType, content);
      
      // Reset form
      setName('');
      setNote('');
      setFile(null);
      setIsOpen(false);
      
      // Refresh the server component to show the new record
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Upload failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-[#0277bd] hover:bg-[#0266a2] text-white font-medium text-sm py-2 px-5 rounded-lg transition-all"
      >
        <PlusCircle className="w-4 h-4" />
        Add Clinical Record
      </button>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-gray-50 mb-8 animate-in fade-in slide-in-from-top-4 duration-300 relative">
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-xl font-light text-slate-800 mb-2 flex items-center gap-2 tracking-tight">
        <FileUp className="w-5 h-5 text-sky-500" />
        Add New Record
      </h2>
      <p className="text-sm font-light text-slate-400 mb-8">
        Records added here will be immediately visible to the patient on their dashboard.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-50 p-1 rounded-xl w-fit border border-gray-100">
        <button 
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'general' ? 'bg-white text-sky-700 shadow-sm border border-gray-100' : 'text-slate-500 hover:text-slate-700'}`}
        >
          General Note / Report
        </button>
        <button 
          onClick={() => setActiveTab('medicine')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'medicine' ? 'bg-white text-emerald-700 shadow-sm border border-gray-100' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Prescription / Medicine
        </button>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {activeTab === 'medicine' ? 'Prescription Name' : 'Record Name'}
          </label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={activeTab === 'medicine' ? 'e.g., Amoxicillin 500mg' : 'e.g., Blood Test Analysis'}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Clinical Note
            </label>
            <textarea 
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Write observation or instructions..."
              className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none resize-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Attach File (Optional)
            </label>
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-32 relative hover:bg-sky-50 hover:border-sky-200 transition-colors">
              <input 
                type="file" 
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <p className="text-sm font-medium text-slate-700">Select PDF or Image</p>
              {file && <div className="mt-2 text-xs font-medium text-sky-700 bg-sky-100 px-3 py-1 rounded-full truncate max-w-full">{file.name}</div>}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#0277bd] hover:bg-[#0266a2] text-white font-medium text-sm rounded-xl transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save to Patient Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
