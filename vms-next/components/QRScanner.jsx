'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { QrCode, Camera, X } from 'lucide-react'

export default function QRScanner({ onScan }) {
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef(null)

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner('reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      }, false)

      scanner.render((decodedText) => {
        onScan(decodedText)
        setIsScanning(false)
        scanner.clear()
      }, (error) => {
        // console.warn(error)
      })

      return () => {
        scanner.clear()
      }
    }
  }, [isScanning, onScan])

  return (
    <div className="flex flex-col items-center">
      {!isScanning ? (
        <button 
          onClick={() => setIsScanning(true)}
          className="flex flex-col items-center justify-center w-full aspect-square max-w-sm rounded-3xl border-4 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary hover:bg-primary/5 transition-all group"
        >
          <div className="p-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/20 group-hover:scale-110 transition-all mb-4">
            <Camera className="text-slate-400 group-hover:text-primary" size={48} />
          </div>
          <span className="text-lg font-bold text-slate-500 group-hover:text-primary">Start QR Scanner</span>
          <p className="text-sm text-slate-400 mt-1">Allow camera access to scan</p>
        </button>
      ) : (
        <div className="w-full max-w-sm relative bg-black rounded-3xl overflow-hidden shadow-2xl">
          <div id="reader" className="w-full"></div>
          <button 
            onClick={() => setIsScanning(false)}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold animate-pulse">
              Scanning for QR Code...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
