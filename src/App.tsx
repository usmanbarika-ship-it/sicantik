import React, { useState, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { 
  Search, QrCode, FileSearch, Scale, AlertCircle, Loader2, 
  PlusCircle, LayoutDashboard, ListFilter, CheckCircle2, X, LogOut, LogIn 
} from 'lucide-react';
import { CaseData, CaseType, SearchParams } from './types';
import { MOCK_CASES } from './constants';
import CaseDetails from './components/CaseDetails';
import Scanner from './components/Scanner';
import AddCaseForm from './components/AddCaseForm';
import CaseList from './components/CaseList';
import LoginModal from './components/LoginModal';

const App: React.FC = () => {
  // Ambil status login dari localStorage agar tidak hilang saat refresh
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('si_cantik_auth') === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Database lokal
  const [cases, setCases] = useState<CaseData[]>(() => {
    const saved = localStorage.getItem('e_minutasi_cases');
    return saved ? JSON.parse(saved) : MOCK_CASES;
  });
  
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

  // Simpan data ke localStorage setiap kali ada perubahan pada 'cases'
  useEffect(() => {
    localStorage.setItem('e_minutasi_cases', JSON.stringify(cases));
  }, [cases]);

  const triggerToast = (message: string) => {
    setShowToast({ show: true, message });
    setTimeout(() => setShowToast({ show: false, message: '' }), 3000);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('si_cantik_auth', 'true');
    setShowLoginModal(false);
    triggerToast("Login Berhasil");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('si_cantik_auth');
    setView('search');
    setActiveCase(null);
    triggerToast("Berhasil Logout");
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!params.caseNumber) return;

    setLoading(true);
    setError(null);
    setActiveCase(null);
    setView('search');
    
    setTimeout(() => {
      try {
        const formattedCaseNum = params.caseNumber.includes('/') 
          ? params.caseNumber 
          : `${params.caseNumber}/${params.caseType === CaseType.GUGATAN ? 'Pdt.G' : 'Pdt.P'}/${params.year}/PA.Pbm`;
        
        const found = cases.find(c => c.caseNumber.toLowerCase() === formattedCaseNum.toLowerCase());
        
        if (found) {
          setActiveCase(found);
        } else {
          setError(`Perkara nomor ${formattedCaseNum} tidak ditemukan. Pastikan data sudah diinput oleh admin.`);
        }
      } catch (err) {
        setError("Terjadi kesalahan saat mencari data.");
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleSaveOrUpdateCase = (finalCase: CaseData) => {
    const isUpdate = cases.some(c => c.id === finalCase.id);
    
    setCases(prev => {
      if (isUpdate) {
        return prev.map(c => c.id === finalCase.id ? finalCase : c);
      } else {
        return [finalCase, ...prev];
      }
    });
    
    triggerToast(isUpdate ? "Data Diperbarui" : "Data Berhasil Disimpan");
    setView('list');
    setActiveCase(null);
  };

  const handleDeleteCase = (id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
    if (activeCase?.id === id) setActiveCase(null);
    triggerToast("Data Berhasil Dihapus");
  };

  return (
    <Router>
      <div className="min-h-screen pb-20 bg-slate-50">
        {/* Toast Notification */}
        {showToast.show && (
          <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-right-10">
            <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm">{showToast.message}</span>
            </div>
          </div>
        )}

        {/* Header / Navbar */}
        <header className="bg-slate-900 text-white py-4 shadow-xl sticky top-0 z-40 border-b border-white/5">
          <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={() => {setView('search'); setActiveCase(null); setError(null);}}
            >
              <div className="bg-blue-600 p-2 rounded-xl">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">SI CANTIK</h1>
                <p className="text-slate-400 text-[9px] uppercase font-bold">PA Prabumulih</p>
              </div>
            </div>

            <nav className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => {setView('search'); setActiveCase(null); setError(null);}}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  view === 'search' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Cari
              </button>
              
              {isLoggedIn ? (
                <>
                  <button 
                    onClick={() => {setView('list'); setError(null);}}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      view === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ListFilter className="w-4 h-4" />
                    Data
                  </button>
                  <button 
                    onClick={() => {setView('add'); setActiveCase(null);}}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      view === 'add' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Input
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-slate-700 text-white hover:bg-slate-600"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
              )}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 pt-8">
          {view === 'add' && isLoggedIn ? (
            <AddCaseForm 
              initialData={activeCase}
              onSave={handleSaveOrUpdateCase} 
              onDelete={handleDeleteCase}
              onCancel={() => setView('list')} 
            />
          ) : view === 'list' && isLoggedIn ? (
            <CaseList 
              cases={cases} 
              onSelectCase={(c) => { setActiveCase(c); setView('add'); }}
              onDeleteCase={handleDeleteCase}
              onUpdateCase={handleSaveOrUpdateCase}
            />
          ) : (
            <div className="space-y-8">
              {/* Form Pencarian Publik */}
              <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Cari Berkas</h2>
                  <button onClick={() => setShowScanner(true)} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200">
                    <QrCode className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder="Nomor Perkara..."
                      value={params.caseNumber}
                      onChange={e => setParams({...params, caseNumber: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select 
                    value={params.caseType}
                    onChange={e => setParams({...params, caseType: e.target.value as CaseType})}
                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value={CaseType.GUGATAN}>Gugatan</option>
                    <option value={CaseType.PERMOHONAN}>Permohonan</option>
                  </select>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Cari"}
                  </button>
                </form>
              </section>

              {error && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {activeCase ? (
                <CaseDetails data={activeCase} />
              ) : (
                <div className="text-center py-20 text-slate-400">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Gunakan nomor perkara untuk melacak berkas.</p>
                </div>
              )}
            </div>
          )}
        </main>

        {showScanner && <Scanner onScan={handleScanSuccess} onClose={() => setShowScanner(false)} />}
        {showLoginModal && <LoginModal onSuccess={handleLoginSuccess} onClose={() => setShowLoginModal(false)} />}
      </div>
    </Router>
  );
};

export default App;
