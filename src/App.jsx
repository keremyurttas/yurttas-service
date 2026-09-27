import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Smartphone, User, FileText, Calendar, Lock, Clock, Trash2, Edit, CheckCircle, Printer, Download, LogOut, KeyRound, UserRound } from 'lucide-react';

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwakTj4VBQqTF3KEQ0Eq_mNJON-ID4000I5m5CSxd9sBW9Av0jBG3bo7HPWVu-oariR8A/exec";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  const [toast, setToast] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'tablo_tarihi', direction: 'desc' });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [formData, setFormData] = useState({
    fisno: "", tablo_tarihi: "", musteri: "", tel: "", marka: "", model: "", uacik: "", fiyat: "", sifre: "", uid: ""
  });

  useEffect(() => {
    const expiry = localStorage.getItem('auth_expiry');
    if (expiry && parseInt(expiry) > Date.now()) {
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('auth_expiry');
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => { setToast(null); }, 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const validUser = import.meta.env.VITE_APP_USERNAME;
    const validPass = import.meta.env.VITE_APP_PASSWORD;

    if (loginData.username === validUser && loginData.password === validPass) {
      const expiryTime = Date.now() + 43200000;
      localStorage.setItem('auth_expiry', expiryTime.toString());
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Hatalı kullanıcı adı veya şifre!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_expiry');
    setIsAuthenticated(false);
    setLoginData({ username: "", password: "" });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(WEB_APP_URL);
      if (!response.ok) throw new Error("Veri çekilemedi");
      const result = await response.json();
      setData(result);
    } catch (err) {
      showToast("Hata: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = (isModalOpen || isDetailModalOpen) ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen, isDetailModalOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      if (typeof dateString === 'string' && dateString.includes('T')) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
      }
      return dateString;
    } catch (e) { return dateString; }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      if (typeof dateString === 'string' && dateString.includes('T')) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      }
      return dateString;
    } catch (e) { return dateString; }
  };

  const safeStr = (val) => (val === null || val === undefined ? "" : String(val).toLowerCase());

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter((row) =>
      safeStr(row.musteri).includes(searchTerm.toLowerCase()) ||
      safeStr(row.marka).includes(searchTerm.toLowerCase()) ||
      safeStr(row.model).includes(searchTerm.toLowerCase()) ||
      safeStr(row.fisno).includes(searchTerm.toLowerCase()) ||
      safeStr(row.tel).includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key]; let valB = b[sortConfig.key];
        if (sortConfig.key === 'fiyat') { valA = parseFloat(valA) || 0; valB = parseFloat(valB) || 0; } 
        else { valA = safeStr(valA); valB = safeStr(valB); }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [data, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ChevronDown className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const handleOpenNewRecordModal = () => {
    const generateFisNo = () => {
      const now = new Date();
      return now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0') + String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0') + String(Math.floor(Math.random() * 900) + 100);
    };
    setFormData({
      uid: Math.floor(Math.random() * 900000) + 100000,
      fisno: generateFisNo(), tablo_tarihi: formatDateTime(new Date().toISOString()),
      musteri: "", tel: "", marka: "", model: "", uacik: "", fiyat: "", sifre: ""
    });
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record) => {
    setFormData(record);
    setModalMode("edit");
    setIsDetailModalOpen(false); 
    setIsModalOpen(true); 
  };

  const handleOverlayClick = (e, closeFunction) => {
    if (e.target === e.currentTarget) closeFunction();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "tel") {
      let phoneVal = value.replace(/\D/g, "");
      if (phoneVal.length > 0 && phoneVal[0] !== "5") phoneVal = "5" + phoneVal;
      if (phoneVal.length > 10) phoneVal = phoneVal.slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: phoneVal }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const submittedData = { ...formData };
    const payload = {
      action: modalMode === "edit" ? "update" : "create",
      uid: submittedData.uid,
      fisno: submittedData.fisno,
      data: submittedData
    };
    
    try {
      const response = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.status === "success") {
        if (modalMode === "edit") {
          setData(prev => prev.map(item => item.fisno === submittedData.fisno ? submittedData : item));
          showToast("Kayıt başarıyla güncellendi!");
        } else {
          setData(prev => [submittedData, ...prev]);
          showToast("Yeni kayıt başarıyla oluşturuldu!");
          setCurrentPage(1); 
        }
        setIsModalOpen(false);
      } else {
        showToast("Hata oluştu: " + result.message, "error");
      }
    } catch (err) {
      showToast("Bağlantı hatası: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`${record.musteri} adlı müşterinin kaydını SİLMEK istediğinize emin misiniz?`)) return;
    setLoading(true);
    try {
      const response = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "delete", uid: record.uid, fisno: record.fisno }),
      });
      const result = await response.json();
      if (result.status === "success") {
        setData(prev => prev.filter(item => item.fisno !== record.fisno));
        setIsDetailModalOpen(false);
        showToast("Kayıt sistemden kalıcı olarak silindi.");
        if (currentItems.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
      } else {
        showToast("Silinirken hata oluştu: " + result.message, "error");
      }
    } catch (err) {
      showToast("Bağlantı hatası: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    if (filteredAndSortedData.length === 0) {
      showToast("Dışa aktarılacak veri bulunamadı.", "error");
      return;
    }

    const headers = ["Fiş No", "Tarih", "Müşteri", "Telefon", "Marka", "Model", "Şifre", "İşlem/Arıza", "Tutar"];
    const csvRows = filteredAndSortedData.map(row => {
      return [
        `"${row.fisno || ''}"`,
        `"${formatDateTime(row.tablo_tarihi)}"`,
        `"${row.musteri || ''}"`,
        `"${row.tel || ''}"`,
        `"${row.marka || ''}"`,
        `"${row.model || ''}"`,
        `"${row.sifre || ''}"`,
        `"${(row.uacik || row.islem || '').replace(/"/g, '""')}"`,
        `"${row.fiyat || '0'}"`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    const fileName = `Yurttas-Iletisim-${dateStr}.csv`;

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Veriler başarıyla bilgisayarına indirildi!");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-[#001E3E] p-8 text-center">
            <h1 className="text-3xl font-black text-[#FEE227] tracking-tight">Yurttaş İletişim</h1>
            <p className="text-white/80 mt-2 font-medium">Yönetim Paneli Girişi</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-semibold border border-red-100">
                  {loginError}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Kullanıcı Adı</label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={loginData.username}
                    onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#001E3E] focus:ring-2 focus:ring-[#001E3E]/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Şifre</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input 
                    type="password" 
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#001E3E] focus:ring-2 focus:ring-[#001E3E]/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-[#001E3E] text-[#FEE227] font-bold py-3 px-4 rounded-xl hover:bg-[#001E3E]/90 transition-colors"
              >
                Giriş Yap
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen print:min-h-0 bg-gray-50 print:bg-white text-gray-800 font-sans relative flex flex-col">
      <style>
        {`
          @media print {
            @page {
              size: A5 portrait;
              margin: 0; 
            }
            html, body {
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              background-color: white !important;
            }
          }
        `}
      </style>

      {/* YAZDIRMA (PRINT) ALANI */}
      {selectedRecord && (
        <div className="hidden print:block w-full bg-white text-black pt-8 px-6 pb-2">
          <div className="max-w-md mx-auto border-2 border-gray-800 p-6 rounded-lg text-center font-mono">
            <h1 className="text-3xl font-black mb-2 uppercase border-b-2 border-black pb-2">BİLGİ FİŞİ</h1>
            <h2 className="text-xl font-bold mb-6">Yurttaş İletişim</h2>
            
            <div className="text-left space-y-4 text-lg border-b-2 border-dashed border-gray-400 pb-6 mb-6">
              <div className="flex justify-between">
                <span className="font-bold">Müşteri:</span>
                <span>{selectedRecord.musteri}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Tarih:</span>
                <span>{formatDateTime(selectedRecord.tablo_tarihi)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Fiş No:</span>
                <span>{selectedRecord.fisno}</span>
              </div>
            </div>

            <div className="text-left space-y-4 text-lg">
              <div>
                <span className="font-bold block mb-1 uppercase">Cihaz Bilgisi:</span>
                <span className="block p-2 bg-gray-100 rounded border">{selectedRecord.marka} {selectedRecord.model}</span>
              </div>
              <div>
                <span className="font-bold block mb-1 uppercase">Yapılan İşlem:</span>
                <span className="block p-2 bg-gray-100 rounded border whitespace-pre-wrap">{selectedRecord.uacik || selectedRecord.islem || "Belirtilmedi"}</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t-2 border-black text-sm text-center italic">
              <p>Bizi tercih ettiğiniz için teşekkür ederiz.</p>
              <p>Yurttaş İletişim - Mimaroba, Büyükçekmece</p>
            </div>
          </div>
        </div>
      )}

      {/* NORMAL EKRAN GÖRÜNÜMÜ */}
      <div className="print:hidden flex-1 flex flex-col">
        <header className="bg-[#001E3E] text-white p-4 md:p-6 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-[#FEE227]">Yurttaş İletişim</h1>
              <p className="text-sm opacity-80 mt-1">Premium Teknik Servis Yönetimi</p>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64 text-gray-800 order-3 sm:order-1 mt-2 sm:mt-0">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Müşteri, Marka, Fiş No..." className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-transparent focus:border-[#FEE227] focus:outline-none bg-white/90" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button onClick={handleOpenNewRecordModal} className="order-1 sm:order-2 bg-[#FEE227] text-[#001E3E] font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-yellow-400 transition-colors whitespace-nowrap">
                <Plus className="w-5 h-5" /> Yeni Kayıt
              </button>
              <button onClick={handleLogout} className="order-2 sm:order-3 bg-red-500/10 text-red-400 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Güvenli Çıkış Yap">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 md:p-6 flex-1 w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
              <span className="text-gray-500 font-medium">Toplam {filteredAndSortedData.length} kayıt bulunuyor</span>
              
              <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                <button 
                  onClick={exportToCSV}
                  disabled={loading || filteredAndSortedData.length === 0}
                  className="flex items-center gap-2 text-gray-600 font-semibold hover:text-[#001E3E] transition-colors disabled:opacity-50"
                  title="Görünen Tüm Verileri Excel'e İndir"
                >
                  <Download className="w-4 h-4" />
                  Dışa Aktar
                </button>

                {loading ? (
                  <span className="flex items-center gap-2 text-blue-600 font-medium">
                    <span className="animate-pulse h-2 w-2 bg-blue-600 rounded-full"></span> İşlem yapılıyor...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-green-600 font-medium">
                    <span className="h-2 w-2 bg-green-500 rounded-full"></span> Sistem Güncel
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#001E3E]/5 text-[#001E3E] text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold cursor-pointer hover:bg-[#001E3E]/10 whitespace-nowrap" onClick={() => handleSort('tablo_tarihi')}><div className="flex items-center gap-1">Tarih <SortIcon columnKey="tablo_tarihi" /></div></th>
                    <th className="p-4 font-semibold cursor-pointer hover:bg-[#001E3E]/10 whitespace-nowrap" onClick={() => handleSort('fisno')}><div className="flex items-center gap-1">Fiş No <SortIcon columnKey="fisno" /></div></th>
                    <th className="p-4 font-semibold cursor-pointer hover:bg-[#001E3E]/10" onClick={() => handleSort('musteri')}><div className="flex items-center gap-1">Müşteri <SortIcon columnKey="musteri" /></div></th>
                    <th className="p-4 font-semibold cursor-pointer hover:bg-[#001E3E]/10" onClick={() => handleSort('marka')}><div className="flex items-center gap-1">Marka/Model <SortIcon columnKey="marka" /></div></th>
                    <th className="p-4 font-semibold w-1/3">İşlem / Arıza</th>
                    <th className="p-4 font-semibold cursor-pointer hover:bg-[#001E3E]/10 whitespace-nowrap" onClick={() => handleSort('fiyat')}><div className="flex items-center gap-1">Tutar <SortIcon columnKey="fiyat" /></div></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentItems.length > 0 ? (
                    currentItems.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => { setSelectedRecord(row); setIsDetailModalOpen(true); }}>
                        <td className="p-4 text-gray-500 whitespace-nowrap">{formatDate(row.tablo_tarihi)}</td>
                        <td className="p-4 font-mono text-xs text-gray-500">{row.fisno}</td>
                        <td className="p-4">
                          <div className="font-semibold text-gray-800">{row.musteri}</div>
                          <div className="text-xs text-gray-500">{row.tel}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-[#001E3E]">{row.marka}</div>
                          <div className="text-sm text-gray-600">{row.model}</div>
                        </td>
                        <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{row.uacik || row.islem || "-"}</td>
                        <td className="p-4 font-bold text-gray-800 group-hover:text-[#001E3E] whitespace-nowrap">{row.fiyat ? `${row.fiyat} ₺` : "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">{loading ? "Yükleniyor..." : "Kayıt bulunamadı."}</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredAndSortedData.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                <div className="text-sm text-gray-500 text-center sm:text-left">
                  <span className="font-medium text-gray-800">{filteredAndSortedData.length}</span> kayıttan <span className="font-medium text-gray-800">{indexOfFirstItem + 1}</span> - <span className="font-medium text-gray-800">{Math.min(indexOfLastItem, filteredAndSortedData.length)}</span> arası
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors flex items-center"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-semibold text-[#001E3E] border border-gray-100">
                    Sayfa {currentPage} / {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors flex items-center"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* YENİ / DÜZENLE MODALI (MOBİL İÇİN DÜZELTİLDİ) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999] print:hidden" onClick={(e) => handleOverlayClick(e, () => setIsModalOpen(false))}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden">
            {/* Modal Başlığı - Sabit */}
            <div className="bg-[#001E3E] p-4 md:p-6 flex justify-between items-center text-white shrink-0">
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                {modalMode === 'edit' ? <Edit className="text-[#FEE227] w-5 h-5" /> : <Plus className="text-[#FEE227]" />}
                {modalMode === 'edit' ? "Kayıt Düzenle" : "Yeni Servis Fişi Oluştur"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            {/* Form Alanı - Kaydırılabilir */}
            <div className="p-4 md:p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Fiş Numarası</label>
                  <input type="text" name="fisno" value={formData.fisno} readOnly className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 font-mono text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Tarih ve Saat</label>
                  <input type="text" name="tablo_tarihi" value={formData.tablo_tarihi} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#001E3E] outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Müşteri Adı Soyadı</label>
                  <input type="text" name="musteri" value={formData.musteri} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#001E3E] outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Telefon Numarası</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-500">0</span>
                    <input type="tel" name="tel" value={formData.tel} onChange={handleInputChange} placeholder="5XX XXX XX XX" className="w-full pl-7 p-2.5 border border-gray-300 rounded-lg focus:border-[#001E3E] outline-none tracking-wider" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Cihaz Markası</label>
                  <input type="text" name="marka" value={formData.marka} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#001E3E] outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Cihaz Modeli</label>
                  <input type="text" name="model" value={formData.model} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#001E3E] outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Cihaz Şifresi</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input type="text" name="sifre" value={formData.sifre} onChange={handleInputChange} placeholder="Yoksa boş bırakın" className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg focus:border-[#001E3E] outline-none" />
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Arıza / Yapılan İşlem</label>
                  <textarea name="uacik" value={formData.uacik || formData.islem} onChange={handleInputChange} rows="2" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#001E3E] outline-none resize-none" required></textarea>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Toplam Tutar (TL)</label>
                  <input type="number" name="fiyat" value={formData.fiyat} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#001E3E] outline-none text-lg font-bold text-[#001E3E]" required />
                </div>
                <div className="md:col-span-2 pt-4 flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:flex-1 py-3 px-4 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors order-2 sm:order-1">İptal</button>
                  <button type="submit" disabled={loading} className="w-full sm:flex-1 py-3 px-4 bg-[#001E3E] text-white rounded-lg font-bold hover:bg-[#001E3E]/90 transition-colors flex items-center justify-center gap-2 order-1 sm:order-2">
                    {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> İşleniyor...</> : "Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DETAY MODALI (MOBİL İÇİN DÜZELTİLDİ) */}
      {isDetailModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999] print:hidden" onClick={(e) => handleOverlayClick(e, () => setIsDetailModalOpen(false))}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden">
            <div className="bg-[#001E3E] p-4 md:p-6 relative shrink-0">
              <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#FEE227] mb-2 md:mb-3 border-4 border-[#001E3E] shadow-lg"><User className="w-7 h-7 md:w-8 md:h-8 text-[#001E3E]" /></div>
                <h3 className="text-xl md:text-2xl font-bold text-white">{selectedRecord.musteri}</h3>
                <p className="text-[#FEE227] mt-1 font-mono text-sm">{selectedRecord.tel}</p>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <Clock className="w-4 h-4 text-orange-400 ml-1" />
                  <span className="font-medium tracking-wide text-sm">{formatDateTime(selectedRecord.tablo_tarihi)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="font-mono text-sm">{selectedRecord.fisno}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm hidden sm:block"><Smartphone className="w-6 h-6 text-[#001E3E]" /></div>
                  <div className="flex-1 w-full">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cihaz Bilgisi</p>
                    <p className="text-lg font-bold text-gray-800">{selectedRecord.marka} {selectedRecord.model}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold text-gray-600 flex items-center gap-1"><Lock className="w-4 h-4" /> Şifre:</span>
                      <span className={`px-2 py-0.5 rounded font-mono ${selectedRecord.sifre && selectedRecord.sifre !== "Şifre Yok" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{selectedRecord.sifre || "Bilinmiyor"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Yapılan İşlem / Arıza</p>
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-gray-700 text-sm">
                  {selectedRecord.uacik || selectedRecord.islem || "İşlem detayı girilmemiş."}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-gray-500 font-medium">Toplam Tutar</span>
                <span className="text-2xl md:text-3xl font-black text-[#001E3E]">{selectedRecord.fiyat ? `${selectedRecord.fiyat} ₺` : "Ücretsiz"}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
              <div className="flex gap-2 w-full sm:w-auto justify-center">
                <button onClick={() => handleDelete(selectedRecord)} disabled={loading} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Kaydı Sil">
                  <Trash2 className="w-5 h-5" />
                </button>
                <button onClick={() => handleOpenEditModal(selectedRecord)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Kaydı Düzenle">
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={handlePrint} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors ml-2 flex items-center gap-2 px-4 font-bold border border-green-200" title="Bilgi Fişi Yazdır">
                  <Printer className="w-5 h-5" />
                  Yazdır
                </button>
              </div>

              <button onClick={() => setIsDetailModalOpen(false)} className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST BİLDİRİMİ */}
      {toast && (
        <div className={`fixed bottom-6 right-6 left-6 md:left-auto z-[9999] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white font-medium transform transition-all duration-300 ease-in-out ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-6 h-6 shrink-0" /> : <X className="w-6 h-6 shrink-0" />}
          <span className="text-sm md:text-base">{toast.message}</span>
        </div>
      )}
    </div>
  );
}