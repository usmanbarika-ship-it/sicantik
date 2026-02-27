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
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('si_cantik_auth') === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  
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
  const [showToast, setShowToast] = useState({ show: false, message: '' });

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
    triggerToast("Berhasil Logout");
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!params.caseNumber) return;

    setLoading(true);
    setError(null);
    setActiveCase(null);
    
    setTimeout(() => {
      try {
        const formattedCaseNum = params.caseNumber.includes('/') 
          ? params.caseNumber 
          : `${params.caseNumber}/${params.caseType === CaseType.GUGATAN ? 'Pdt.G' : 'Pdt.P'}/${params.year}/PA.Pbm`;
        
        const found = cases.find(c => c.caseNumber.toLowerCase() === formattedCaseNum.toLowerCase());
        
        if (found) {
          setActiveCase(found);
        } else {
          setError(`Perkara nomor ${formattedCaseNum} tidak ditemukan.`);
        }
      } catch (err) {
        setError("Terjadi kesalahan sistem.");
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  return (
    <Router>
      <div className="min-h-screen pb-20 bg-slate-50 animate-in fade-in duration-700">
        {showToast.show && (
          <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-right-10 duration-300">
            <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-bold text-sm">{showToast.message}</span>
            </div>
          </div>
        )}

        <header className="bg-slate-900 text-white py-4 shadow-xl sticky top-0 z-40 border-b border-white/5">
          <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Scale className="w-8 h-8" />
              </div>
              <div onClick={() => setView('search')} className="cursor-pointer uppercase">
                <h1 className="text-xl font-bold tracking-tight">SI CANTIK</h1>
                <p className="text-slate-400 text-[10px] font-bold">PA PRABUMULIH KELAS II</p>
              </div>
            </div>

            <nav className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => setView('search')}
                className={`px-4 py-2 rounded-lg text-sm font-bold ${view === 'search' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Dashboard
              </button>
              
              {isLoggedIn ? (
                <>
                  <button onClick={() => setView('list')} className={`px-4 py-2 rounded-lg text-sm font-bold ${view === 'list' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>
                    Berkas Terinput
                  </button>
                  <button onClick={() => setView('add')} className={`px-4 py-2 rounded-lg text-sm font-bold ${view === 'add' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
                    Input Perkara
                  </button>
                  <button onClick={handleLogout} className="px-4 py-2 text-red-400 hover:text-white text-sm font-bold flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <button onClick={() => setShowLoginModal(true)} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Admin Login
                </button>
              )}
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 pt-8">
          {view === 'add' && isLoggedIn ? (
            <AddCaseForm onSave={(c) => {setCases([c, ...cases]); setView('list');}} onCancel={() => setView('list')} />
          ) : view === 'list' && isLoggedIn ? (
            <CaseList cases={cases} onSelectCase={(c) => {setActiveCase(c); setView('add');}} onDeleteCase={(id) => setCases(cases.filter(c => c.id !== id))} onUpdateCase={() => {}} />
          ) : (
            <>
              <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-slate-800">Cari Berkas Perkara</h2>
                  <button onClick={() => setShowScanner(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                    <QrCode className="w-5 h-5" /> Scan QR
                  </button>
                </div>

                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <input 
                      type="text" 
                      placeholder="Nomor Perkara (Contoh: 123)"
                      value={params.caseNumber}
                      onChange={e => setParams({...params, caseNumber: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <select value={params.caseType} onChange={e => setParams({...params, caseType: e.target.value as CaseType})} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value={CaseType.GUGATAN}>Gugatan</option>
                    <option value={CaseType.PERMOHONAN}>Permohonan</option>
                  </select>
                  <input type="number" value={params.year} onChange={e => setParams({...params, year: e.target.value})} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  <button type="submit" disabled={loading} className="md:col-span-4 bg-blue-600 text-white py-4 rounded-xl font-bold">
                    {loading ? 'Mencari...' : 'Cari Data'}
                  </button>
                </form>
              </section>

              {error && <div className="p-4 bg-amber-50 text-amber-800 rounded-xl mb-8">{error}</div>}
              {activeCase ? <CaseDetails data={activeCase} /> : <div className="text-center py-20 text-slate-400">SI CANTIK Digital System - PA Prabumulih</div>}
            </>
          )}
        </main>

        {showScanner && <Scanner onScan={(res) => {setParams({...params, caseNumber: res}); setShowScanner(false); handleSearch();}} onClose={() => setShowScanner(false)} />}
        {showLoginModal && <LoginModal onSuccess={handleLoginSuccess} onClose={() => setShowLoginModal(false)} />}
      </div>
    </Router>
  );
};

export default App;
