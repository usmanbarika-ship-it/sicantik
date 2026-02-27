import React, { useState } from 'react';
import Login from './components/Login'; // Pastikan import ini ada
import CaseList from './components/CaseList';
// ... import lainnya

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Jika belum login, tampilkan hanya halaman Login
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  // Jika sudah login, baru tampilkan Dashboard dan Menu
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onLogout={() => setIsAuthenticated(false)} />
      {/* Konten Dashboard/CaseList Anda di sini */}
    </div>
  );
}
