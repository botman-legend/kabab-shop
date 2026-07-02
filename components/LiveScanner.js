"use client";
import { useRef, useState } from "react";
import Image from "next/image";

export default function LiveScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // الافتراضي الكاميرا الخلفية

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      alert("تعذر تشغيل الكاميرا: " + err.message);
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    startCamera();
  };

  const captureFrame = (side) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(videoRef.current, 50, 35, 300, 180, 0, 0, 300, 180);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.5);

    if (side === "front") {
      setFrontImage(dataUrl);
    } else {
      setBackImage(dataUrl);
    }
  };

  const submitScan = async () => {
    if (!frontImage || !backImage) {
      alert("من فضلك امسح الوجه الأمامي والخلفي أولاً");
      return;
    }

    const res = await fetch("/api/verify-id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ front_image: frontImage, back_image: backImage }),
    });

    const result = await res.json();
    alert(JSON.stringify(result, null, 2));
  };

  return (
    <div>
      <div style={{ position: "relative", width: 400, height: 250 }}>
        <video ref={videoRef} autoPlay playsInline width="400" height="250" />
        <div
          style={{
            position: "absolute",
            border: "3px solid red",
            width: "300px",
            height: "180px",
            top: "35px",
            left: "50px",
            pointerEvents: "none",
          }}
        />
      </div>

      <canvas ref={canvasRef} width="300" height="180" style={{ display: "none" }} />

      <div style={{ marginTop: "10px" }}>
        <button onClick={startCamera}>تشغيل الكاميرا ({facingMode})</button>
        <button onClick={toggleCamera}>تبديل الكاميرا</button>
        <button onClick={() => captureFrame("front")}>مسح الوجه الأمامي</button>
        {frontImage && (
          <Image
            src={frontImage}
            alt="Front Preview"
            width={200}
            height={120}
            style={{ objectFit: "contain" }}
          />
        )}
        <button onClick={() => captureFrame("back")}>مسح الوجه الخلفي</button>
        {backImage && (
          <Image
            src={backImage}
            alt="Back Preview"
            width={200}
            height={120}
            style={{ objectFit: "contain" }}
          />
        )}
        <button onClick={submitScan}>إرسال للتحقق</button>
      </div>
    </div>
  );
}
