import React, { useState } from 'react';
import { CaseData, CaseType } from '../types';
import { 
  ChevronRight, Archive, Clock, Search, 
  Calendar, Info, Trash2, RotateCcw 
} from 'lucide-react';

interface CaseListProps {
  cases: CaseData[];
  onSelectCase: (caseData: CaseData) => void;
  onDeleteCase: (id: string) => void;
  onUpdateCase: (updatedCase: CaseData) => void;
}

const CaseList: React.FC<CaseListProps> = ({ cases, onSelectCase, onDeleteCase, onUpdateCase }) => {
  const [activeTab, setActiveTab] = useState<CaseType>(CaseType.GUGATAN);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter berdasarkan tab aktif dan keyword pencarian (Nomor Perkara atau Para Pihak)
  const filteredCases = cases.filter(c => 
    c.caseType === activeTab && 
    (c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.parties.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    gugatan: cases.filter(c => c.caseType === CaseType.GUGATAN).length,
    permohonan: cases.filter(c => c.caseType === CaseType.PERMOHONAN).length
  };

  const handleResetMinutasi = (caseData: CaseData) => {
    onUpdateCase({
      ...caseData,
      status: 'PROSES'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-1 bg-gradient-to-r from-slate-700 to-slate-900"></div>
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Daftar Berkas Terinput</h2>
              <p className="text-slate-500 text-sm">Manajemen registrasi dan monitoring status minutasi perkara.</p>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Cari nomor atau pihak..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6 w-fit">
            <button 
              onClick={() => setActiveTab(CaseType.GUGATAN)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === CaseType.GUGATAN 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Gugatan
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === CaseType.GUGATAN ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                {stats.gugatan}
              </span>
            </button>
            <button 
              onClick={() => setActiveTab(CaseType.PERMOHONAN)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === CaseType.PERMOHONAN 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Permohonan
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === CaseType.PERMOHONAN ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                {stats.permohonan}
              </span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">No. Perkara</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Para Pihak</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Tgl Input/Putus</th>
                  {activeTab === CaseType.GUGATAN && (
                    <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Tgl BHT</th>
                  )}
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCases.length > 0 ? (
                  filteredCases.map((c) => (
                    <tr key={c.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-5 px-4">
                        <div className="font-bold text-slate-800 text-sm leading-none">{c.caseNumber}</div>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase font-medium">{c.caseType}</div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="text-[11px] text-slate-600 font-medium leading-tight max-w-[250px]">
                          {c.parties || "Nama pihak belum diisi"}
                        </div>
                      </td>
                      <td className="py-5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 text-[11px] font-bold text-slate-600">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {c.date ? new Date(c.date).toLocaleDateString('id-ID') : '-'}
                        </div>
                      </td>
                      {activeTab === CaseType.GUGATAN && (
                        <td className="py-5 px-4 text-center">
                          {c.status === 'SELESAI' ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-lg border border-blue-100 text-[11px] font-bold text-blue-600">
                              <Info className="w-3 h-3 text-blue-400" />
                              BHT
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Belum BHT</span>
                          )}
                        </td>
                      )}
                      <td className="py-5 px-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                          c.status === 'SELESAI'
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {c.status === 'SELESAI' ? <Archive className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {c.status || 'PROSES'}
                        </div>
                      </td>
                      <td className="py-5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => onSelectCase(c)}
                            className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                            title="Edit / Detail"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          
                          {c.status === 'SELESAI' && (
                            <button 
                              onClick={() => handleResetMinutasi(c)}
                              className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 text-blue-500 rounded-lg hover:bg-blue-100 border border-transparent hover:border-blue-200 transition-all"
                              title="Kembalikan ke Proses"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-4 text-right">
                        <button 
                          onClick={() => onDeleteCase(c.id)}
                          className="inline-flex items-center justify-center w-8 h-8 bg-red-50 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all border border-red-100"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === CaseType.GUGATAN ? 7 : 6} className="py-12 text-center text-slate-400 italic text-sm">
                      Tidak ada data {activeTab.toLowerCase()} yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseList;