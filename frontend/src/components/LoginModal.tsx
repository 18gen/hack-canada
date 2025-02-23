"use client";

import React, { useState, useRef, useContext } from "react";
import { useRouter } from "next/navigation";
import CameraCapture from "@/components/CameraCapture";
import { UserContext } from "@/app/UserContext";

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (userId: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const { setUser } = useContext(UserContext)!;
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const router = useRouter();
  const cameraRef = useRef<{ capture: () => void }>(null);

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setError("");

    const endpoint = isSignUp ? "register" : "login";
    const url = `http://localhost:3001/api/${endpoint}`;

    if (cameraRef.current) {
      try {
        const imageData = await new Promise<string>((resolve, reject) => {
          const timeout = setTimeout(() => reject("Camera capture timeout"), 3000);
          cameraRef.current!.capture();
          const captureHandler = (img: string) => {
            clearTimeout(timeout);
            resolve(img);
          };
          setCapturedImage((prev) => {
            if (prev) captureHandler(prev);
            return prev;
          });
        });

        if (!imageData) {
          setError("Please capture an image first");
          return;
        }
        setCapturedImage(imageData);

        // Convert base64 to blob
        const base64Data = imageData.split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArrays.push(byteCharacters.charCodeAt(i));
        }
        const blob = new Blob([new Uint8Array(byteArrays)], {
          type: "image/jpeg",
        });

        // Create FormData and append fields
        const formData = new FormData();
        formData.append("image", blob, "captured-image.jpg");
        formData.append("email", email);
        if (isSignUp) {
          formData.append("first_name", firstName);
          formData.append("last_name", lastName);
          formData.append("birthday", birthday);
        }

        const response = await fetch(url, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const result = await response.json();
          setError(result.error || "An unknown error occurred");
          return;
        }

        const result = await response.json();
        if (result.user_id) {
          // Save the user_id in the context (and localStorage via the context effect)
          setUser(result.user_id);
          // Signal success to parent and close the modal
          onLoginSuccess(result.user_id);
          onClose();
          // Optionally, redirect immediately
          router.push(`/${result.user_id}`);
        }
      } catch (error) {
        console.error("Error:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      }
    } else {
      setError("Camera is not available");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-gray-900 text-gray-100 rounded-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 p-1 rounded-full hover:bg-gray-800"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold mb-5 text-center">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm mb-1">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-700 rounded-lg bg-gray-800"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm mb-1">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-700 rounded-lg bg-gray-800"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="birthday" className="block text-sm mb-1">Birthday</label>
                <input
                  type="date"
                  id="birthday"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-700 rounded-lg bg-gray-800"
                />
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-700 rounded-lg bg-gray-800"
              placeholder="you@example.com"
            />
          </div>

          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}

          <div className="pt-2">
            <div className="mb-4 h-60 rounded-lg overflow-hidden">
              <CameraCapture ref={cameraRef} onCapture={handleCapture} />
            </div>
            
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              {isSignUp ? "Create Account" : "Continue"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm mt-4 text-gray-400">
          {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            {isSignUp ? "Sign In" : "Create One"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;