"use client";

import React from "react";

interface VoteLocationMapProps {
  location?: string;
}

const VoteLocationMap: React.FC<VoteLocationMapProps> = ({ location }) => {
  if (!location) return null;

  // Create an embed URL for the provided location.
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    location,
  )}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="w-full h-auto rounded-lg overflow-hidden shadow-lg">
      <iframe
        title="Vote Location"
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        src={mapUrl}
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default VoteLocationMap;
