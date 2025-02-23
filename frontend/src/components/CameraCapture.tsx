"use client";

import React, {
	useRef,
	useEffect,
	forwardRef,
	useImperativeHandle,
} from "react";

interface CameraCaptureProps {
	onCapture: (imageData: string) => void;
}

const CameraCapture = forwardRef(({ onCapture }: CameraCaptureProps, ref) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Start the video stream on component mount
	useEffect(() => {
		async function startCamera() {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
				});
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
				}
			} catch (error) {
				console.error("Error accessing camera:", error);
			}
		}
		startCamera();
	}, []);

	const handleCapture = () => {
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
				const imageData = canvas.toDataURL("image/jpg");
				onCapture(imageData);
			}
		}
	};

	useImperativeHandle(ref, () => ({
		capture: handleCapture,
	}));

	return (
		<div>
			<video ref={videoRef} autoPlay style={{ width: "100%" }} />
			<canvas ref={canvasRef} style={{ display: "none" }} />
		</div>
	);
});

export default CameraCapture;
