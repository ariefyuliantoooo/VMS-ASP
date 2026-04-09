import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { ShieldCheck, CheckCircle, XCircle, Search, Users, LogIn, LogOut, Clock3, Briefcase, AlertCircle, Camera, Smartphone, Monitor, RefreshCw } from 'lucide-react';

const SecurityDashboard = () => {
  const [scanResult, setScanResult] = useState(null);
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
    setError('');

    try {
      const res = await api.post('/visit/scan', { qr_code: qrCodeText.trim() });
      setScanResult(res.data);
      setManualCode('');
      fetchVisits(); // Refresh daftar visit setelah scan
    } catch (err) {
      setError(err.response?.data?.message || 'Error memproses QR Code. Tidak valid atau sudah kadaluarsa.');
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center space-x-3 mb-6">
            <ShieldCheck className="h-8 w-8 text-indigo-600"/>
            <h1 className="text-3xl font-bold text-gray-900">Security Checkpoint</h1>
          </div>

          {/* ===== SECTION SCANNER QR ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bagian Scanner */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-indigo-600" />
                Scan QR Code Pengunjung
                <span className="ml-2 text-xs text-gray-400 flex items-center">
                  <Monitor className="w-3 h-3 mr-1" /> PC
                  <Smartphone className="w-3 h-3 ml-2 mr-1" /> HP
                </span>
              </h2>
              
              {/* Container Scanner */}
              <div 
                ref={scannerContainerRef}
                id="reader" 
                className="w-full bg-black rounded-lg overflow-hidden min-h-[300px] relative"
              ></div>
              
              {/* Pesan Error Kamera */}
              {cameraError && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-700">{cameraError}</p>
                      <button
                        onClick={resetScanner}
                        className="mt-2 inline-flex items-center text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Coba lagi akses kamera
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Panduan Izin Kamera */}
              {cameraPermission === false && !cameraError && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    Akses kamera diperlukan untuk scan QR. Silakan izinkan akses kamera di pengaturan browser Anda.
                  </p>
                </div>
              )}
              
              {/* Input Manual */}
              <div className="mt-6 border-t pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Atau masukkan Pass ID secara manual:</h3>
                <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Contoh: 123e4567-e89b-..." 
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={loading}
                  />
                  <button 
                    type="submit" 
                    disabled={!manualCode.trim() || loading} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Search className="h-5 w-5 inline-block mr-1" />
                    Verifikasi
                  </button>
                </form>
              </div>
            </div>

            {/* Bagian Status Hasil Scan */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col justify-center min-h-[400px]">
              {loading && (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-indigo-600 font-medium">Memproses...</p>
                </div>
              )}

              {!loading && !scanResult && !error && (
                <div className="text-center py-10 bg-gray-50 rounded-lg flex-grow flex flex-col justify-center border-2 border-dashed border-gray-200">
                  <ShieldCheck className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500 font-medium text-center">
                    Arahkan QR Code ke kamera<br/>
                    atau masukkan ID secara manual
                  </p>
                  <div className="mt-4 text-xs text-gray-400 flex items-center justify-center space-x-3">
                    <span className="flex items-center"><Monitor className="w-3 h-3 mr-1" /> Laptop/PC</span>
                    <span className="flex items-center"><Smartphone className="w-3 h-3 mr-1" /> Smartphone</span>
                  </div>
                </div>
              )}

              {!loading && error && (
                <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200 flex-grow flex flex-col justify-center">
                  <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                  <h3 className="text-xl font-bold text-red-800">Scan Gagal</h3>
                  <p className="text-red-600 mt-2 font-medium bg-white mx-4 py-2 rounded border border-red-100 break-all">{error}</p>
                </div>
              )}

              {!loading && scanResult && (
                <div className="text-center py-6 bg-green-50 rounded-lg border border-green-200 flex-grow">
                  <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-3" />
                  <h3 className="text-xl font-bold text-green-800 mb-1">{scanResult.message}</h3>
                  
                  <div className="mt-6 bg-white p-5 rounded-lg border border-green-100 text-left shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nama Pengunjung</p>
                        <p className="font-semibold text-gray-900 border-b pb-2">{scanResult.visit.full_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Perusahaan</p>
                        <p className="font-semibold text-gray-900 border-b pb-2">{scanResult.visit.company}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bertemu Dengan</p>
                        <p className="font-semibold text-gray-900 border-b pb-2">{scanResult.visit.person_to_meet}</p>
                      </div>
                      <div className="col-span-2 flex items-center justify-between pt-2">
                        <p className="text-sm font-medium text-gray-700">Status Akses</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold shadow-sm ${scanResult.visit.status === 'CHECKED_IN' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                          {scanResult.visit.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===== DAFTAR PENGUNJUNG ===== */}
          <div className="mt-4">
            <div className="flex items-center space-x-3 mb-5">
              <Users className="h-7 w-7 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Daftar Pengunjung</h2>
            </div>

            {/* Kartu Statistik - Responsif */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-100 rounded-lg">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{counts.ALL}</p>
                  <p className="text-xs text-gray-500 font-medium">Total Visit</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4 flex items-center space-x-3">
                <div className="p-2.5 bg-yellow-100 rounded-lg">
                  <Clock3 className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{counts.PENDING}</p>
                  <p className="text-xs text-gray-500 font-medium">Terdaftar</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4 flex items-center space-x-3">
                <div className="p-2.5 bg-green-100 rounded-lg">
                  <LogIn className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{counts.CHECKED_IN}</p>
                  <p className="text-xs text-gray-500 font-medium">Checked In</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-4 flex items-center space-x-3">
                <div className="p-2.5 bg-gray-100 rounded-lg">
                  <LogOut className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{counts.CHECKED_OUT}</p>
                  <p className="text-xs text-gray-500 font-medium">Checked Out</p>
                </div>
              </div>
            </div>

            {/* Tab Filter - Responsif untuk HP */}
            <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1 mb-5">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label === 'Semua' ? 'All' : tab.label.charAt(0)}</span>
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                      {counts[tab.key]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tabel Pengunjung - Responsif */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              {visitsLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-3 text-sm text-gray-500">Memuat data pengunjung...</p>
                </div>
              ) : filteredVisits.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
                  <p className="mt-1 text-sm text-gray-500">Belum ada pengunjung dengan status ini.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Perusahaan</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Bertemu</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Work Permit</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredVisits.map((visit) => (
                        <tr key={visit.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{visit.full_name}</div>
                            <div className="text-xs text-gray-400 sm:hidden">{visit.company}</div>
                            <div className="text-xs text-gray-400">{visit.phone}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">{visit.company}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">{visit.person_to_meet}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(visit.status)}</td>
                          <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">{getPermitBadge(visit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecurityDashboard;