"use client";

import React, { useState, useRef } from "react";
import CameraCapture from "@/components/CameraCapture";

interface CheckModalProps {
	userId: string;
	onSuccess: () => void;
	onClose: () => void;
}

const verifyFace = async (
	imageData: string,
	userId: string
): Promise<boolean> => {
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

	const formData = new FormData();
	formData.append("image", blob, "captured-image.jpg");
	formData.append("user_id", userId);

	const response = await fetch("http://localhost:3001/api/verify", {
		method: "POST",
		body: formData,
	});

	if (!response.ok) {
		const result = await response.json();
		throw new Error(result.error || "An unknown error occurred");
	}

	const result = await response.json();
	return result.message === "Face verified successfully";
};

const CheckModal: React.FC<CheckModalProps> = ({
	userId,
	onSuccess,
	onClose,
}) => {
	const [capturedImage, setCapturedImage] = useState<string | null>(null);
	const [error, setError] = useState<string>("");
	const [verifying, setVerifying] = useState<boolean>(false);
	const cameraRef = useRef<{ capture: () => void }>(null);

	const handleCapture = (imageData: string) => {
		setCapturedImage(imageData);
		setError("");
	};

	const handleCaptureAndVerify = async () => {
		if (cameraRef.current) {
			try {
				const imageData = await new Promise<string>((resolve, reject) => {
					const timeout = setTimeout(
						() => reject("Camera capture timeout"),
						3000
					);

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

				setVerifying(true);
				const isVerified = await verifyFace(imageData, userId);
				if (isVerified) {
					onSuccess();
				} else {
					setError("Face verification failed. Please try again.");
				}
			} catch (err) {
				console.error("Error:", err);
				setError(
					err instanceof Error ? err.message : "An unknown error occurred"
				);
			} finally {
				setVerifying(false);
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
					className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 p-1 rounded-full hover:bg-gray-800">
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
					onClick={handleCaptureAndVerify}
					disabled={verifying}
					className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
					{verifying ? "Verifying..." : "Verify Face"}
				</button>
			</div>
		</div>
	);
};

export default CheckModal;
