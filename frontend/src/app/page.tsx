"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import VoteList from "@/components/VoteList";
import VoteLocationMap from "@/components/VoteLocationMap";

export default function Home() {
  // Example vote location.
  const voteLocation = "1600 Amphitheatre Parkway, Mountain View, CA";

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col">
      <Navbar />
      <div className="flex-1 p-4 md:px-10 flex flex-col gap-7">
        <div className="flex flex-col md:flex-row gap-7 h-full">
          <div className="flex-1 flex flex-col gap-7">
            <div className="flex justify-center items-center">
              <Card
                id="12345"
                name="John Doe"
                image="/cat-face.jpg"
                github="https://github.com/johndoe"
                instagram="https://instagram.com/johndoe"
              />
            </div>
          </div>
          <div className="flex-1 flex justify-center items-start">
            <VoteList />
          </div>
        </div>
      </div>
    </div>
  );
}
