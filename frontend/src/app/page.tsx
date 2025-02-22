"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import CameraCapture from "@/components/CameraCapture";

export default function Home() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setError("");

    if (isSignUp) {
      if (!firstName.trim() || !lastName.trim()) {
        setError("First and last name are required");
        return;
      }

      // Check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        setError("Error checking existing user");
        return;
      }

      if (existingUser) {
        setError("User with this email already exists. Please log in.");
        return;
      }

      // Insert new user if not found
      const { data, error } = await supabase
        .from("users")
        .insert([{ first_name: firstName, last_name: lastName, email }])
        .select("id")
        .single();

      if (error) {
        setError(error.message);
      } else {
        router.push(`/${data.id}`);
      }
    } else {
      // Login logic
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .ilike("email", email)
        .single();

      if (error || !data) {
        setError("User not found");
      } else {
        router.push(`/${data.id}`);
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
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isSignUp ? "Sign Up" : "Sign In"}
              </button>
            </form>
            <p className="text-center mt-4">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:underline"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>

          {/* Right: Video/Camera Section */}
          <div className="w-full md:w-1/2 max-w-md p-8 rounded-lg shadow-md">
            <CameraCapture />
          </div>
        </div>
      </div>
    </div>
  );
}
