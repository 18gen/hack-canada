// frontend/src/components/CameraCapture.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState("");

  // Start the video stream on component mount
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    }
    startCamera();
  }, []);

  const handleCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      // Set canvas dimensions to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Convert the canvas image to a data URL
        const imageData = canvas.toDataURL("image/png");
        setCapturedImage(imageData);
        setProcessingMessage("Sending image for facial recognition...");
        
        // Send the image data to your Python backend
        try {
          const response = await fetch("http://localhost:5000/api/face_recognition", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imageData }),
          });
          const result = await response.json();
          setProcessingMessage(result.message || "Processing complete");
        } catch (err) {
          console.error("Error sending image:", err);
          setProcessingMessage("Error sending image to server");
        }
      }
    }
  };

  return (
    <div>
      <h3>Facial Recognition Login</h3>
      <video ref={videoRef} autoPlay style={{ width: "100%" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <button onClick={handleCapture} className="mt-4 bg-blue-600 text-white py-2 px-4 rounded">
        Capture Face
      </button>
      {capturedImage && (
        <div className="mt-4">
          <p>Captured Image Preview:</p>
          <img src={capturedImage} alt="Captured" style={{ width: "100%" }} />
        </div>
      )}
      {processingMessage && <p>{processingMessage}</p>}
    </div>
  );
}
