// components/CameraCapture.tsx
"use client";

import React, { useRef, useEffect, forwardRef, useState } from "react";

type CameraCaptureProps = {
  onCapture: (imageData: string) => void;
};

type CameraHandle = {
  capture: () => void;
};

const CameraCapture = forwardRef<CameraHandle, CameraCaptureProps>(
  ({ onCapture }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const flashRef = useRef<HTMLDivElement>(null);
    const [audioReady, setAudioReady] = useState(false);
    const audioRef = useRef<HTMLAudioElement>();

    const triggerFlash = () => {
      // Visual flash
      flashRef.current?.classList.add("animate-flash");
      setTimeout(() => {
        flashRef.current?.classList.remove("animate-flash");
      }, 300);
      
      // Audio flash
      if (audioRef.current) {
        audioRef.current.currentTime = 0; // Reset audio to start
        audioRef.current.play().catch(error => {
          console.error("Audio playback failed:", error);
        });
      }
    };

    React.useImperativeHandle(ref, () => ({
      capture: () => {
        if (canvasRef.current && videoRef.current) {
          const context = canvasRef.current.getContext("2d");
          context?.drawImage(videoRef.current, 0, 0, 640, 480);
          const imageData = canvasRef.current.toDataURL("image/jpeg");
          triggerFlash();
          onCapture(imageData);
        }
      },
    }));

    useEffect(() => {
      // Initialize audio
      audioRef.current = new Audio('/sounds/flash.mp3');
      audioRef.current.preload = "auto";
      
      // Set up camera stream
      let stream: MediaStream | null = null;
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user" } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        });

      return () => {
        stream?.getTracks().forEach((track) => track.stop());
        audioRef.current?.remove();
      };
    }, []);

    return (
      <div className="relative aspect-[4/3] w-full max-w-4xl bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <div
          ref={flashRef}
          className="absolute inset-0 bg-white opacity-0 pointer-events-none"
        />
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-gray-900 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-900 to-transparent" />
        <canvas ref={canvasRef} className="hidden" width={640} height={480} />
      </div>
    );
  }
);

CameraCapture.displayName = "CameraCapture";

export default CameraCapture;