import React, { useState, useEffect } from 'react';
// ... import lainnya tetap sama ...
import { db } from './services/firebase'; // Pastikan file ini sudah dibuat
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';

const App: React.FC = () => {
  const [cases, setCases] = useState<CaseData[]>([]); // Default kosong, akan diisi dari Firebase
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

  // 1. Sinkronisasi Real-time dengan Firebase Firestore
  useEffect(() => {
    const q = query(collection(db, 'cases'), orderBy('caseNumber', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const casesArray: CaseData[] = [];
      querySnapshot.forEach((doc) => {
        casesArray.push({ ...doc.data(), id: doc.id } as CaseData);
      });
      setCases(casesArray);
    });

    return () => unsubscribe(); // Stop listening saat app ditutup
  }, []);

  // 2. Handler Simpan/Update ke Firebase
  const handleSaveOrUpdateCase = async (finalCase: CaseData) => {
    try {
      if (finalCase.id && cases.some(c => c.id === finalCase.id)) {
        // Update Data
        const caseRef = doc(db, 'cases', finalCase.id);
        await updateDoc(caseRef, { ...finalCase });
        triggerToast("Data Berhasil Diperbarui Online");
      } else {
        // Simpan Data Baru
        await addDoc(collection(db, 'cases'), {
          ...finalCase,
          createdAt: new Date().toISOString()
        });
        triggerToast("Data Berhasil Tersimpan di Cloud");
      }
      setView('list');
      setActiveCase(null);
    } catch (err) {
      triggerToast("Gagal menyimpan data ke database");
    }
  };

  // 3. Handler Hapus dari Firebase
  const handleDeleteCase = async (id: string) => {
    if (window.confirm("Hapus data ini secara permanen dari server?")) {
      try {
        await deleteDoc(doc(db, 'cases', id));
        triggerToast("Data Berhasil Dihapus dari Server");
        setView('list');
      } catch (err) {
        triggerToast("Gagal menghapus data");
      }
    }
  };

  // ... Sisa fungsi handleSearch, handleScanSuccess tetap sama ...
