import React, { useState, useRef } from 'react';
import { CaseData, CaseType, StorageLocation } from '../types';
import { Save, X, FilePlus2, Calendar, Archive, MapPin, FileUp, Loader2, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react';

// IMPORT SOLUSI PUNCAK
import { storage } from '../services/firebase'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

  const [pdfUrl, setPdfUrl] = useState<string | undefined>(initialData?.pdfUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // HANDLER FILE: Tidak lagi pakai FileReader (Base64) agar tidak error 1MB
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 10 * 1024 * 1024) { // Batasi 10MB
        alert("File terlalu besar, maksimal 10MB");
        return;
      }
      setSelectedFile(file);
      setPdfUrl(file.name); // Simpan nama file untuk tampilan sementara
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.caseNumber || !formData.classification || !formData.parties) return;

    setIsSubmitting(true);

    try {
      let finalPdfUrl = initialData?.pdfUrl || '';

      // PROSES UNGGAH KE FIREBASE STORAGE (PUNCAK SOLUSI)
      if (selectedFile) {
        setIsUploading(true);
        const fileRef = ref(storage, `berkas_pdf/${Date.now()}_${selectedFile.name}`);
        const uploadResult = await uploadBytes(fileRef, selectedFile);
        finalPdfUrl = await getDownloadURL(uploadResult.ref);
        setIsUploading(false);
      }

      let fullCaseNum = formData.caseNumber || '';
      if (!fullCaseNum.includes('/')) {
        fullCaseNum = `${formData.caseNumber}/${formData.caseType === CaseType.GUGATAN ? 'Pdt.G' : 'Pdt.P'}/${formData.year || new Date().getFullYear()}/PA.Pbm`;
      }

      const finalCase: CaseData = {
        id: initialData?.id || Math.random().toString(36).substr(2, 9),
        caseNumber: fullCaseNum,
        caseType: (formData.caseType as CaseType) || CaseType.GUGATAN,
        classification: formData.classification as string,
        parties: formData.parties as string,
        decisionDate: formData.decisionDate as string,
        bhtDate: formData.caseType === CaseType.GUGATAN ? formData.bhtDate : undefined,
        isArchived: !!formData.isArchived,
        storage: formData.isArchived ? storageLocation : undefined,
        pdfUrl: finalPdfUrl // Sekarang berisi Link URL pendek dari Storage
      };

      onSave(finalCase);
    } catch (error) {
      console.error("Error Detail:", error);
      alert("Gagal mengunggah file. Pastikan Firebase Storage sudah aktif!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className={`p-1 bg-gradient-to-r ${initialData ? 'from-blue-600 to-indigo-600' : 'from-emerald-600 to-teal-600'}`}></div>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className={`${initialData ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'} p-2 rounded-xl`}>
              {initialData ? <Archive className="w-6 h-6" /> : <FilePlus2 className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {initialData ? 'Update & Minutasi Perkara' : 'Input Perkara Baru'}
              </h2>
              <p className="text-slate-500 text-sm">Data akan tersimpan otomatis ke Cloud Database.</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Identitas Perkara</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nomor Perkara</label>
                  <input 
                    type="text" required placeholder="Contoh: 1234"
                    disabled={!!initialData}
                    defaultValue={initialData ? initialData.caseNumber.split('/')[0] : ''}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium disabled:opacity-50"
                    onChange={e => setFormData({...formData, caseNumber: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jenis</label>
                    <select 
                      disabled={!!initialData}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none disabled:opacity-50"
                      value={formData.caseType}
                      onChange={e => setFormData({...formData, caseType: e.target.value as CaseType})}
                    >
                      <option value={CaseType.GUGATAN}>Gugatan</option>
                      <option value={CaseType.PERMOHONAN}>Permohonan</option>
                    </select>
                  </div>
                  <div>
                    <label
