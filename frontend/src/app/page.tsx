"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CameraCapture from "@/components/CameraCapture";

export default function Home() {
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

		if (!isSignUp) {
			// Sign-in process
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

					const response = await fetch("http://localhost:3001/api/login", {
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
						router.push(`/${result.user_id}`);
					}
				} catch (error) {
					console.error("Error:", error);
					setError(
						error instanceof Error ? error.message : "An unknown error occurred"
					);
				}
			} else {
				setError("Camera is not available");
			}
		} else {
			try {
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
            formData.append("first_name", firstName);
            formData.append("last_name", lastName);
            formData.append("birthday", birthday);

						const response = await fetch("http://localhost:3001/api/register", {
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
							router.push(`/${result.user_id}`);
						}
					} catch (error) {
						console.error("Error:", error);
						setError(
							error instanceof Error
								? error.message
								: "An unknown error occurred"
						);
					}
				} else {
					setError("Camera is not available");
				}
      } catch (error) {
        console.error("Error:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        )
      }
		}
	};


	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />

			<div className="items-center justify-center">
				{/* Container to split the sections into two columns */}
				<h2 className="text-2xl font-bold mb-6 text-center">
					{isSignUp ? "Sign Up" : "Sign In"}
				</h2>
				<div className="flex flex-col md:flex-row items-center justify-center gap-8">
					{/* Left: Input/Form Section */}
					<div className="w-full md:w-1/2 max-w-md p-8 rounded-lg shadow-md">
						<form onSubmit={handleSubmit} className="space-y-4">
							{isSignUp && (
								<>
									<div>
										<label htmlFor="firstName" className="block mb-1">
											First Name
										</label>
										<input
											type="text"
											id="firstName"
											value={firstName}
											onChange={(e) => setFirstName(e.target.value)}
											className="w-full px-3 py-2 border border-gray-800 text-gray-800 rounded-lg focus:outline-none focus:ring focus:ring-blue-600"
											placeholder="Enter your first name"
										/>
									</div>
									<div>
										<label htmlFor="lastName" className="block mb-1">
											Last Name
										</label>
										<input
											type="text"
											id="lastName"
											value={lastName}
											onChange={(e) => setLastName(e.target.value)}
											className="w-full px-3 py-2 border border-gray-800 text-gray-800 rounded-lg focus:outline-none focus:ring focus:ring-blue-600"
											placeholder="Enter your last name"
										/>
                  </div>
                  <div>
                    <label htmlFor="birthday" className="block mb-1">
                      Birthday
                    </label>
                    <input
                      type="date"
                      id="birthday"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-800 text-gray-800 rounded-lg focus:outline-none focus:ring focus:ring-blue-600"
                      placeholder="Enter your birthday"
                    />
                  </div>
								</>
							)}
							<div>
								<label htmlFor="email" className="block mb-1">
									Email
								</label>
								<input
									type="email"
									id="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full px-3 py-2 border border-gray-800 text-gray-800 rounded-lg focus:outline-none focus:ring focus:ring-blue-600"
									placeholder="Enter your email"
								/>
							</div>
							{error && <p className="text-red-500 text-sm">{error}</p>}
							<button
								type="submit"
								className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
								{isSignUp ? "Sign Up" : "Sign In"}
							</button>
						</form>
						<p className="text-center mt-4">
							{isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
							<button
								onClick={() => setIsSignUp(!isSignUp)}
								className="text-blue-600 hover:underline">
								{isSignUp ? "Sign In" : "Sign Up"}
							</button>
						</p>
					</div>

					{/* Right: Video/Camera Section */}
					<div className="w-3/4 md:w-1/2 max-w-md p-8  rounded-lg shadow-md">
						<CameraCapture ref={cameraRef} onCapture={handleCapture} />
					</div>
				</div>
			</div>
		</div>
	);
}
