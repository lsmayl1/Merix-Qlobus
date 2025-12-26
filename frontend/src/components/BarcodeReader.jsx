import React, { useEffect, useRef, useState } from "react";
import {
  BrowserMultiFormatReader,
  DecodeHintType,
  BarcodeFormat,
  NotFoundException,
} from "@zxing/library";

export const BarcodeReader = ({ handleCloseReader, setBarcode }) => {
  const [error, setError] = useState(null);
  const [hasScanned, setHasScanned] = useState(false); // Yeni state
  const videoRef = useRef(null);
  const controlsRef = useRef(null);

  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.CODE_128,
    BarcodeFormat.EAN_13,
    BarcodeFormat.UPC_A,
  ]);

  const codeReader = useRef(new BrowserMultiFormatReader(hints));

  useEffect(() => {
    const startScanner = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();

          controlsRef.current = await codeReader.current.decodeFromVideoDevice(
            null,
            videoRef.current,
            (result, err) => {
              if (result && !hasScanned) {
                setBarcode(result.getText()); // Okunan barkodu üst bileşene gönder
                setHasScanned(true); // Barkod bir kez tarandı
              }
              if (err) {
                if (!(err instanceof NotFoundException)) {
                  console.error("Tarama hatası:", err);
                  setError(`Tarama hatası: ${err.message}`);
                }
              }
            }
          );
        }
      } catch (err) {
        console.error("Hata:", err);
        setError(`Kamera hatası: ${err.message}`);
      }
    };

    startScanner();

    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [hasScanned]); // hasScanned bağımlılığı eklendi

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white absolute z-50">
      <button
        onClick={handleCloseReader}
        className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Bağla
      </button>
      <h2>Barkod Oxut</h2>
      {error && <p className="text-red-500">{error}</p>}
      <video
        ref={videoRef}
        style={{
          width: "50%",
          maxWidth: "300px",
          border: "1px solid black",
        }}
        playsInline // iOS için gerekli
        muted // Otomatik oynatma için
      />
    </div>
  );
};
