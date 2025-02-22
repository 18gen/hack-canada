"use client";

import React from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import VoteList from "@/components/VoteList";

interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  image: string;
  github?: string;
  instagram?: string;
}

const sampleUsers: Record<string, User> = {
  "12345": {
    id: "12345",
    name: "John Doe",
    email: "john@example.com",
    bio: "This is John's bio. Enjoy exploring your dashboard!",
    image: "/cat-face.jpg",
    github: "https://github.com/johndoe",
    instagram: "https://instagram.com/johndoe",
  },
  "user2": {
    id: "user2",
    name: "Jane Smith",
    email: "jane@example.com",
    bio: "This is Jane's bio. Welcome to your dashboard!",
    image: "/jane.jpg",
    github: "https://github.com/janesmith",
    instagram: "https://instagram.com/janesmith",
  },
  // Add additional sample users as needed...
};

export default function DashboardPage() {
  // Use the useParams hook to access the dynamic route parameter.
  const params = useParams();
  const userId = params.userId as string;
  const user = sampleUsers[userId];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl">User not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col">
      <Navbar />
      <div className="flex-1 p-4 md:px-10 flex flex-col gap-7">
        <div className="flex flex-col md:flex-row gap-7 h-full">
          {/* Left Column: User Card */}
          <div className="flex-1 flex flex-col gap-7">
            <div className="flex justify-center items-center">
              <Card
                id={user.id}
                name={user.name}
                image={user.image}
                github={user.github}
                instagram={user.instagram}
              />
            </div>
          </div>
          {/* Right Column: Vote List */}
          <div className="flex-1 flex justify-center items-start">
            <VoteList />
          </div>
        </div>
      </div>
    </div>
  );
}
