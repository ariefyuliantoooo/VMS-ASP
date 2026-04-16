import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import { ShieldCheck, CheckCircle, XCircle, Search, Users, LogIn, LogOut, Clock3, Briefcase, AlertCircle, Camera, Smartphone, Monitor, RefreshCw, Building2, Phone, User as UserIcon } from 'lucide-react';

const SecurityDashboard = () => {
  const [scanResult, setScanResult] = useState(null);
  const [scanInfo, setScanInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState(''); // Error kamera
  const [cameraPermission, setCameraPermission] = useState(null); // Status izin kamera
  const [isScanning, setIsScanning] = useState(true);
  
  // State untuk daftar visit
  const [visits, setVisits] = useState([]);
  const [visitsLoading, setVisitsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  
  // Reference untuk scanner
  const scannerRef = useRef(null);
  const scannerContainerRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Ambil daftar visit
  const fetchVisits = async () => {
    try {
      const res = await api.get('/visits');
      setVisits(res.data);
    } catch (err) {
      console.error('Gagal mengambil data visit', err);
    } finally {
      setVisitsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  // Cek izin kamera saat komponen dimuat
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        // Cek apakah browser support kamera
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          setCameraError('Browser tidak mendukung akses kamera');
          setCameraPermission(false);
          return;
        }

        // Cek apakah ada kamera yang terdeteksi
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          setCameraError('Tidak ditemukan kamera pada perangkat ini');
          setCameraPermission(false);
          return;
        }

        // Coba akses kamera untuk cek izin
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          .catch(err => {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              setCameraError('Izin kamera ditolak. Silakan izinkan akses kamera dan refresh halaman.');
              setCameraPermission(false);
            } else if (err.name === 'NotFoundError') {
              setCameraError('Tidak ada perangkat kamera yang ditemukan');
              setCameraPermission(false);
            } else {
              setCameraError(`Error kamera: ${err.message}`);
              setCameraPermission(false);
            }
            return null;
          });
        
        if (stream) {
          // Izin diberikan, bersihkan stream
          stream.getTracks().forEach(track => track.stop());
          setCameraPermission(true);
          setCameraError('');
        }
      } catch (err) {
        console.error('Error pengecekan kamera:', err);
        setCameraError('Tidak dapat mengakses kamera. Periksa pengaturan browser Anda.');
        setCameraPermission(false);
      }
    };

    checkCameraPermission();
  }, []);

  // Inisialisasi scanner hanya jika izin kamera diberikan
  useEffect(() => {
    if (cameraPermission === true && !isInitializedRef.current && scannerContainerRef.current) {
      initializeScanner();
    }

    // Bersihkan scanner saat komponen dilepas
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(error => console.error("Gagal membersihkan scanner", error));
        } catch (err) {
          console.error("Error membersihkan scanner:", err);
        }
        scannerRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, [cameraPermission]);

  const initializeScanner = () => {
    try {
      // Kosongkan container sebelum membuat scanner baru
      if (scannerContainerRef.current) {
        scannerContainerRef.current.innerHTML = '';
      }

      // Konfigurasi scanner yang kompatibel dengan berbagai perangkat
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [Html5QrcodeScanner.QR_CODE],
        showTorchButtonIfSupported: true, // Tombol senter untuk HP
        showZoomSliderIfSupported: true,   // Slider zoom untuk HP
        defaultZoomValueIfSupported: 2,
      };

      scannerRef.current = new Html5QrcodeScanner(
        'reader',
        config,
        false
      );

      scannerRef.current.render(onScanSuccess, onScanError);
      isInitializedRef.current = true;
      setIsScanning(true);
    } catch (err) {
      console.error('Gagal menginisialisasi scanner:', err);
      setCameraError('Gagal menginisialisasi kamera. Silakan refresh halaman.');
    }
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    if (!loading && decodedText) {
      handleScanRequest(decodedText);
      // Jeda scanning setelah berhasil untuk mencegah multiple scan
      if (scannerRef.current && isScanning) {
        scannerRef.current.pause(true);
        setIsScanning(false);
        
        // Lanjutkan scanning setelah 3 detik
        setTimeout(() => {
          if (scannerRef.current) {
            scannerRef.current.resume();
            setIsScanning(true);
          }
        }, 3000);
      }
    }
  };

  const onScanError = (err) => {
    // Abaikan error scanning latar belakang - ini normal saat tidak ada QR di view
    if (err && err.includes && !err.includes('No MultiFormat Readers')) {
      console.debug('Error scan:', err);
    }
  };

  const handleScanRequest = async (qrCodeText) => {
    if (!qrCodeText.trim()) return;
    
    setLoading(true);
    setScanResult(null);
    setScanInfo(null);
    setError('');

    try {
      const res = await api.get(`/visit/qr/${encodeURIComponent(qrCodeText.trim())}`);
      setScanInfo(res.data.visit);
      setManualCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error memproses QR Code. Tidak valid atau sudah kadaluarsa.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    setLoading(true);
    try {
        const res = await api.patch(`/visit/${scanInfo.id}/status`, { status });
        setScanResult({ message: `Visit marked as ${status}`, visit: res.data.visit });
        setScanInfo(null);
        fetchVisits();
    } catch (err) {
        setError(err.response?.data?.message || 'Error updating status');
    } finally {
        setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScanRequest(manualCode);
    }
  };

  const resetScanner = () => {
    // Reset dan coba lagi akses kamera
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error membersihkan scanner:', err);
      }
      scannerRef.current = null;
      isInitializedRef.current = false;
    }
    setCameraPermission(null);
    setCameraError('');
    // Cek ulang izin kamera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
        setCameraPermission(true);
      })
      .catch(err => {
        setCameraPermission(false);
        setCameraError('Izin kamera ditolak. Silakan izinkan akses kamera.');
      });
  };

  // Helper untuk statistik visit
  const counts = {
    ALL: visits.length,
    PENDING: visits.filter(v => v.status === 'PENDING').length,
    CHECKED_IN: visits.filter(v => v.status === 'CHECKED_IN').length,
    CHECKED_OUT: visits.filter(v => v.status === 'CHECKED_OUT').length,
  };

  const filteredVisits = activeTab === 'ALL' ? visits : visits.filter(v => v.status === activeTab);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200"><Clock3 className="w-3 h-3 mr-1"/>Terdaftar</span>;
      case 'CHECKED_IN':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200"><LogIn className="w-3 h-3 mr-1"/>Checked In</span>;
      case 'CHECKED_OUT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 border border-gray-300"><LogOut className="w-3 h-3 mr-1"/>Checked Out</span>;
      default:
        return null;
    }
  };

  const getPermitBadge = (visit) => {
    if (visit.WorkPermit) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          <Briefcase className="w-3 h-3 mr-1" />Ada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
        <AlertCircle className="w-3 h-3 mr-1" />Tidak Ada
      </span>
    );
  };

  const tabs = [
    { key: 'ALL', label: 'Semua', icon: Users },
    { key: 'PENDING', label: 'Terdaftar', icon: Clock3 },
    { key: 'CHECKED_IN', label: 'Checked In', icon: LogIn },
    { key: 'CHECKED_OUT', label: 'Checked Out', icon: LogOut },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-[480px] mx-auto px-4 pt-5 pb-24 space-y-5">
        {/* ── Header ── */}
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            <h1 className="text-lg font-black text-gray-900">Security Checkpoint</h1>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 ml-7">Scan QR atau masukkan Pass ID pengunjung</p>
        </div>

        {/* ===== SCANNER QR ===== */}
        <div className="space-y-3">
          {/* Scanner Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-gray-800">Scan QR Code</h2>
              <span className="ml-auto text-[10px] text-gray-400 flex items-center gap-1">
                <Monitor className="w-3 h-3" /> PC <Smartphone className="w-3 h-3 ml-1" /> HP
              </span>
            </div>

            <div ref={scannerContainerRef} id="reader" className="w-full bg-black overflow-hidden min-h-[240px]" />

            {cameraError && (
              <div className="mx-4 mt-3 p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-red-700">{cameraError}</p>
                  <button onClick={resetScanner} className="mt-1.5 inline-flex items-center gap-1 text-xs text-red-600 font-semibold">
                    <RefreshCw className="w-3 h-3" /> Coba lagi
                  </button>
                </div>
              </div>
            )}

            {cameraPermission === false && !cameraError && (
              <div className="mx-4 mt-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                <p className="text-xs text-yellow-700">Izinkan akses kamera di browser untuk scan QR.</p>
              </div>
            )}

            {/* Input Manual */}
            <div className="px-4 pt-4 pb-4 border-t border-gray-100 mt-3">
              <p className="text-xs font-semibold text-gray-400 mb-2">Masukkan Pass ID manual:</p>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Pass ID pengunjung..."
                  className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!manualCode.trim() || loading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl disabled:opacity-50 hover:bg-indigo-700 flex-shrink-0 transition-all"
                >
                  <Search className="h-3.5 w-3.5" /> Cek
                </button>
              </form>
            </div>
          </div>

          {/* Scan Result */}
          {loading && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-xs text-indigo-600 font-semibold">Memproses...</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 rounded-2xl border border-red-100 p-4 flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800">Scan Gagal</p>
                <p className="text-xs text-red-600 mt-1 break-all">{error}</p>
              </div>
            </div>
          )}

          {/* Modul Validasi (Scan Info) */}
          {!loading && scanInfo && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5">
                  <div className="flex items-center gap-2 mb-4 border-b pb-3">
                      <UserIcon className="h-5 w-5 text-indigo-600" />
                      <h3 className="text-md font-black text-gray-900">Validasi Pengunjung</h3>
                      <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${scanInfo.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : scanInfo.status === 'CHECKED_IN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                          {scanInfo.status}
                      </span>
                  </div>

                  <div className="space-y-2 mb-5">
                      {[['Nama', scanInfo.full_name], ['Perusahaan', scanInfo.company], ['Tujuan Bertemu', scanInfo.person_to_meet], ['Keperluan', scanInfo.visit_purpose]].map(([k, v]) => (
                          <div key={k} className="flex flex-col text-sm border-b border-gray-50 pb-1">
                              <span className="text-gray-400 text-xs">{k}</span>
                              <span className="font-bold text-gray-900">{v}</span>
                          </div>
                      ))}
                  </div>

                  <div className="flex gap-2">
                       {scanInfo.status === 'PENDING' ? (
                           <>
                               <button onClick={() => handleUpdateStatus('CHECKED_IN')} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm flex justify-center items-center gap-1.5 transition-colors shadow-sm">
                                   <LogIn className="w-4 h-4" /> Approve & Masuk
                               </button>
                               <button onClick={() => handleUpdateStatus('REJECTED')} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2.5 rounded-xl text-sm flex justify-center items-center gap-1.5 transition-colors">
                                   <XCircle className="w-4 h-4" /> Reject (Tolak)
                               </button>
                           </>
                       ) : scanInfo.status === 'CHECKED_IN' ? (
                           <button onClick={() => handleUpdateStatus('DONE')} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2.5 rounded-xl text-sm flex justify-center items-center gap-1.5 transition-colors shadow-sm">
                               <LogOut className="w-4 h-4" /> Check-Out (Selesai)
                           </button>
                       ) : (
                           <div className="w-full bg-gray-100 text-center text-gray-500 font-bold py-2.5 rounded-xl text-sm">
                               Kunjungan ini sudah selesai.
                           </div>
                       )}
                  </div>
              </div>
          )}

          {!loading && scanResult && !scanInfo && (
            <div className="bg-green-50 rounded-2xl border border-green-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm font-bold text-green-800">Aksi Sukses</p>
              </div>
              <div className="bg-white rounded-xl border border-green-100 p-3 space-y-2">
                <p className="text-xs font-semibold">{scanResult.message}</p>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-100">
                  <span className="text-gray-400">Status Saat Ini</span>
                  <span className="px-2 py-0.5 rounded-full font-bold bg-green-100 text-green-800">
                    {scanResult.visit.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== DAFTAR PENGUNJUNG ===== */}
        <div className="space-y-4">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Daftar Pengunjung</p>

          {/* Stats 2-col grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatsCard icon={Users}  value={counts.ALL}         label="Total Visit"  colorClass="bg-indigo-50"  iconColorClass="text-indigo-600" borderColor="border-indigo-100" />
            <StatsCard icon={Clock3} value={counts.PENDING}     label="Terdaftar"    colorClass="bg-yellow-50" iconColorClass="text-yellow-600" borderColor="border-yellow-100" />
            <StatsCard icon={LogIn}  value={counts.CHECKED_IN}  label="Checked In"   colorClass="bg-green-50"  iconColorClass="text-green-600"  borderColor="border-green-100" />
            <StatsCard icon={LogOut} value={counts.CHECKED_OUT} label="Checked Out"  colorClass="bg-gray-50"   iconColorClass="text-gray-500"   borderColor="border-gray-200" />
          </div>

          {/* Tab filter – scrollable, no overflow */}
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 overflow-x-auto no-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isTabActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                    isTabActive ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isTabActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'
                  }`}>{counts[tab.key]}</span>
                </button>
              );
            })}
          </div>

          {/* Visitor list */}
          {visitsLoading ? (
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-3 shadow-sm border border-gray-100">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-xs text-gray-400 font-medium">Memuat data pengunjung...</p>
            </div>
          ) : filteredVisits.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-3 shadow-sm border border-gray-100">
              <Users className="h-10 w-10 text-gray-200" />
              <p className="text-sm text-gray-400 font-medium">Belum ada pengunjung dengan status ini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVisits.map((visit) => {
                const statusCfg = {
                  PENDING:     { bar: 'bg-yellow-50 border-yellow-100 text-yellow-700', Icon: Clock3,  label: 'Terdaftar' },
                  CHECKED_IN:  { bar: 'bg-green-50 border-green-100 text-green-700',   Icon: LogIn,   label: 'Check In' },
                  CHECKED_OUT: { bar: 'bg-gray-50 border-gray-100 text-gray-500',     Icon: LogOut,  label: 'Check Out' },
                }[visit.status] || { bar: 'bg-gray-50 border-gray-100 text-gray-500', Icon: Clock3, label: visit.status };
                const { Icon: SIcon } = statusCfg;
                return (
                  <div key={visit.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className={`flex items-center justify-between px-4 py-2 border-b ${statusCfg.bar}`}>
                      <div className={`flex items-center gap-1.5 text-xs font-semibold ${statusCfg.text}`}>
                        <SIcon className="w-3 h-3" />{statusCfg.label}
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {new Date(visit.visit_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="px-4 pt-3 pb-3">
                      <p className="text-[15px] font-bold text-gray-900 truncate mb-1">{visit.full_name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <Building2 className="w-3 h-3 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{visit.company}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5"><UserIcon className="w-3 h-3 text-gray-400" />{visit.person_to_meet}</span>
                        {visit.phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-gray-400" />{visit.phone}</span>}
                        <span className="flex items-center gap-1.5">
                          {visit.WorkPermit
                            ? <><Briefcase className="w-3 h-3 text-blue-500" /><span className="text-blue-600 font-medium">Work Permit Ada</span></>
                            : <><AlertCircle className="w-3 h-3 text-red-400" /><span className="text-red-500 font-medium">Tidak Ada Work Permit</span></>}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SecurityDashboard;