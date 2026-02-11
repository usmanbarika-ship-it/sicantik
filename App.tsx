import React, { useState, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { 
  Search, QrCode, FileSearch, Scale, AlertCircle, Loader2, 
  PlusCircle, LayoutDashboard, ListFilter, CheckCircle2, X 
} from 'lucide-react';
import { CaseData, CaseType, SearchParams } from './types';
import CaseDetails from './components/CaseDetails';
import Scanner from './components/Scanner';
import AddCaseForm from './components/AddCaseForm';
import CaseList from './components/CaseList';

// Import koneksi Firebase
import { db } from './services/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';

const App: React.FC = () => {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [view, setView] = useState<'search' | 'add' | 'list'>('search');
  const [params, setParams] = useState<SearchParams>({
    caseNumber: '',
    caseType: CaseType.GUGATAN,
    year: new Date().getFullYear().toString()
  });
  
  const [activeCase, setActiveCase] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showToast, setShowToast] = useState<{show: boolean, message: string}>({ show: false, message: '' });

  // 1. Sinkronisasi Database Online (Firebase)
  useEffect(() => {
    const q = query(collection(db, 'cases'), orderBy('caseNumber', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const casesArray: CaseData[] = [];
      querySnapshot.forEach((doc) => {
        casesArray.push({ ...doc.data(), id: doc.id } as CaseData);
      });
      setCases(casesArray);
    }, (err) => {
      console.error("Firestore Error:", err);
    });

    return () => unsubscribe();
  }, []);

  const triggerToast = (message: string) => {
    setShowToast({ show: true, message });
    setTimeout(() => setShowToast({ show: false, message: '' }), 3000);
  };

  // 2. Handler Cari Data (Mencari di dalam state cases yang sudah tersinkron Firebase)
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!params.caseNumber) return;

    setLoading(true);
    setError(null);
    setActiveCase(null);
    setView('search');
    
    // Simulasi loading sebentar agar UX terasa nyata
    setTimeout(() => {
      try {
        const formattedCaseNum = params.caseNumber.includes('/') 
          ? params.caseNumber 
          : `${params.caseNumber}/${params.caseType === CaseType.GUGATAN ? 'Pdt.G' : 'Pdt.P'}/${params.year}/PA.Pbm`;
        
        const found = cases.find(c => c.caseNumber.toLowerCase() === formattedCaseNum.toLowerCase());
        
        if (found) {
          setActiveCase(found);
        } else {
          setError(`Perkara nomor ${formattedCaseNum} tidak ditemukan di database online.`);
        }
      } catch (err) {
        setError("Terjadi kesalahan sistem saat pencarian.");
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  // 3. Handler Simpan/Update Online
  const handleSaveOrUpdateCase = async (finalCase: CaseData) => {
    try {
      if (finalCase.id && cases.some(c => c.id === finalCase.id)) {
        const caseRef = doc(db, 'cases', finalCase.id);
        const { id, ...dataToUpdate } = finalCase; // hapus ID agar tidak double di doc
        await updateDoc(caseRef, dataToUpdate);
        triggerToast("Data Berhasil Diperbarui Online");
      } else {
        await addDoc(collection(db, 'cases'), {
          ...finalCase,
          createdAt: new Date().toISOString()
        });
        triggerToast("Data Berhasil Tersimpan di Cloud");
      }
      setView('list');
      setActiveCase(null);
    } catch (err) {
      console.error(err);
      triggerToast("Gagal menyimpan ke Database Online");
    }
  };

  // 4. Handler Hapus Online
  const handleDeleteCase = async (id: string) => {
    if (window.confirm("Hapus data ini dari server?")) {
      try {
        await deleteDoc(doc(db, 'cases', id));
        triggerToast("Data Terhapus");
        setView('list');
        setActiveCase(null);
      } catch (err) {
        triggerToast("Gagal menghapus data");
      }
    }
  };

  const handleScanSuccess = (result: string) => {
    setParams(prev => ({ ...prev, caseNumber: result }));
    setShowScanner(false);
    setTimeout(() => handleSearch(), 200);
  };

  const selectCaseForEdit = (caseData: CaseData) => {
    setActiveCase(caseData);
    setView('add');
  };

  return (
    <Router>
      <div className="min-h-screen pb-20 bg-slate-50">
        {showToast.show && (
          <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-right-10">
            <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-bold text-sm">{showToast.message}</span>
              <button onClick={() => setShowToast({show: false, message: ''})} className="ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <header className="bg-slate-900 text-white py-4 shadow-xl sticky top-0 z-40 border-b border-white/5">
          <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg">
                <Scale className="w-8 h-8" />
              </div>
              <div onClick={() => {setView('search'); setActiveCase(null); setError(null);}} className="cursor-pointer group">
                <h1 className="text-xl font-bold leading-tight uppercase">SI CANTIK</h1>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">PA PRABUMULIH KELAS II</p>
              </div>
            </div>

            <nav className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl">
              <button onClick={() => {setView('search'); setActiveCase(null); setError(null);}}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'search' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </button>
              <button onClick={() => {setView('list'); setError(null);}}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'list' ? 'bg-slate-600 text-white shadow-lg' : 'text-slate-400'}`}>
                <ListFilter className="w-4 h-4" /> Berkas Terinput
              </button>
              <button onClick={() => {setView('add'); setActiveCase(null); setError(null);}}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'add' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>
                <PlusCircle className="w-4 h-4" /> Input Perkara
              </button>
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 pt-8">
          {view === 'add' ? (
            <AddCaseForm initialData={activeCase} onSave={handleSaveOrUpdateCase} onDelete={handleDeleteCase} onCancel={() => setView('list')} />
          ) : view === 'list' ? (
            <CaseList cases={cases} onSelectCase={selectCaseForEdit} onDeleteCase={handleDeleteCase} onUpdateCase={handleSaveOrUpdateCase} />
          ) : (
            <>
              <section className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8">
                <div className="p-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <div className="p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Cari Berkas Perkara</h2>
                      <p className="text-slate-500 text-sm">Status dan lokasi fisik arsip (Cloud Database).</p>
                    </div>
                    <button onClick={() => setShowScanner(true)} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold active:scale-95 shadow-lg">
                      <QrCode className="w-5 h-5" /> Scan QR Perkara
                    </button>
                  </div>

                  <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nomor Perkara</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input type="text" placeholder="Contoh: 123" value={params.caseNumber} onChange={e => setParams({...params, caseNumber: e.target.value})}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jenis</label>
                      <select value={params.caseType} onChange={e => setParams({...params, caseType: e.target.value as CaseType})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none">
                        <option value={CaseType.GUGATAN}>Gugatan</option>
                        <option value={CaseType.PERMOHONAN}>Permohonan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tahun</label>
                      <input type="number" value={params.year} onChange={e => setParams({...params, year: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                    </div>
                    <div className="md:col-span-4 mt-2">
                      <button type="submit" disabled={loading || !params.caseNumber}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-blue-100">
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sedang Mencari...</> : <><FileSearch className="w-5 h-5" /> Cari Data Perkara</>}
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              {error && (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-4 text-amber-800 mb-8 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <div><h4 className="font-bold">Tidak Ditemukan</h4><p>{error}</p></div>
                </div>
              )}

              {activeCase ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CaseDetails data={activeCase} />
                </div>
              ) : !loading && !error && (
                <div className="text-center py-20 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-800 mb-2">SI CANTIK Digital System (Online)</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">Database telah dialihkan ke Google Firebase Cloud Storage.</p>
                </div>
              )}
            </>
          )}
        </main>

        {showScanner && <Scanner onScan={handleScanSuccess} onClose={() => setShowScanner(false)} />}
        
        <footer className="mt-12 py-8 border-t border-slate-200 bg-white text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">PA PRABUMULIH KELAS II &copy; 2026</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
