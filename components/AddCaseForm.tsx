import React, { useState } from 'react';
import { CaseData, CaseType, StorageLocation } from '../types';
import { Save, X, FilePlus2, Archive, MapPin, Link2, Trash2 } from 'lucide-react';

interface AddCaseFormProps {
  onSave: (newCase: CaseData) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  initialData?: CaseData | null;
}

const AddCaseForm: React.FC<AddCaseFormProps> = ({ onSave, onCancel, onDelete, initialData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<CaseData> & { year?: string }>(
    (initialData as any) || {
      caseType: CaseType.GUGATAN,
      year: new Date().getFullYear().toString(),
      decisionDate: new Date().toISOString().split('T')[0],
      isArchived: false
    }
  );

  const [storageLocation, setStorageLocation] = useState<StorageLocation>(
    initialData?.storage || { roomNo: '', shelfNo: '', levelNo: '', boxNo: '' }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let fullCaseNum = formData.caseNumber || '';
    if (!fullCaseNum.includes('/')) {
      fullCaseNum = `${formData.caseNumber}/${formData.caseType === CaseType.GUGATAN ? 'Pdt.G' : 'Pdt.P'}/${formData.year}/PA.Pbm`;
    }

    const finalCase: CaseData = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      caseNumber: fullCaseNum,
      caseType: (formData.caseType as CaseType) || CaseType.GUGATAN,
      classification: formData.classification as string,
      parties: formData.parties as string,
      decisionDate: formData.decisionDate as string,
      isArchived: !!formData.isArchived,
      storage: formData.isArchived ? storageLocation : undefined,
      pdfUrl: formData.pdfUrl // Menyimpan Link Teks (Drive/Dropbox)
    };

    onSave(finalCase);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className={`p-1 bg-gradient-to-r ${initialData ? 'from-blue-600 to-indigo-600' : 'from-emerald-600 to-teal-600'}`}></div>
      <div className="p-8">
        <h2 className="text-xl font-bold mb-6 text-slate-800">Form Kendali Perkara</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Nomor Perkara" className="p-3 bg-slate-50 border rounded-xl" onChange={e => setFormData({...formData, caseNumber: e.target.value})} defaultValue={initialData?.caseNumber.split('/')[0]} />
            <input type="text" placeholder="Klasifikasi" className="p-3 bg-slate-50 border rounded-xl" value={formData.classification || ''} onChange={e => setFormData({...formData, classification: e.target.value})} />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold">
              <Link2 className="w-5 h-5" />
              <span>Link Berkas Digital (Google Drive)</span>
            </div>
            <input 
              type="text" 
              placeholder="Paste Link Google Drive di sini..." 
              className="w-full p-3 border rounded-lg"
              value={formData.pdfUrl || ''}
              onChange={e => setFormData({...formData, pdfUrl: e.target.value})}
            />
            <p className="text-[10px] text-slate-400">*Gunakan link ini agar database tidak berat dan 100% gratis.</p>
          </div>

          {/* Bagian Lokasi Fisik tetap ada seperti kode sebelumnya */}
          
          <div className="flex gap-4">
            <button type="button" onClick={onCancel} className="flex-1 py-3 border rounded-xl font-bold">Batal</button>
            <button type="submit" disabled={isSubmitting} className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perkara'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCaseForm;
