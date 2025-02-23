"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import CameraCapture from "@/components/CameraCapture";

interface CheckModalProps {
  userId: string;
  onSuccess: () => void;
  onClose: () => void;
}

/**
 * Dummy face verification function.
 * Replace this with your actual face-checking API call.
 */
const verifyFace = async (imageData: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // For demo purposes, randomly decide if face verification passes or fails.
  return Math.random() > 0.3; // 70% chance to pass
};

const CheckModal: React.FC<CheckModalProps> = ({ userId, onSuccess, onClose }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [verifying, setVerifying] = useState<boolean>(false);
  const cameraRef = useRef<{ capture: () => void }>(null);
  const router = useRouter();

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setError("");
  };

  const handleVerify = async () => {
    if (!capturedImage) {
      setError("Please capture your face first.");
      return;
    }
    setVerifying(true);
    try {
      const isVerified = await verifyFace(capturedImage);
      if (isVerified) {
        onSuccess();
      } else {
        setError("Face verification failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during verification.");
    }
    setVerifying(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-gray-900 text-gray-100 rounded-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 p-1 rounded-full hover:bg-gray-800"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-5 text-center">
          Face Verification
        </h2>
        <p className="text-sm text-center mb-4">
          Please verify your face to continue.
        </p>
        <div className="mb-4 h-60 rounded-lg overflow-hidden">
          <CameraCapture ref={cameraRef} onCapture={handleCapture} />
        </div>
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button
          onClick={handleVerify}
          disabled={verifying}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
        >
          {verifying ? "Verifying..." : "Verify Face"}
        </button>
      </div>
    </div>
  );
};

export default CheckModal;
