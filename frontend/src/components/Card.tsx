"use client";

import React from "react";
import { FaGithub, FaInstagram } from "react-icons/fa";

interface CardProps {
  id: string;
  name: string;
  image: string;
  github?: string;
  instagram?: string;
}

const Card: React.FC<CardProps> = ({ id, name, image, github, instagram }) => {
  return (
    <div className="relative w-full h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-2xl overflow-hidden transition-all">
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
          <img
            src={image}
            alt={name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
          />
        </div>
        {/* ID Text */}
        <div className="mt-4">
          <p className="text-gray-600 text-sm">ID: {id}</p>
        </div>
        {/* Spacer */}
        <div className="flex-grow" />
        {/* Social Links */}
        <div className="mt-auto flex space-x-4">
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-blue-500 transition-colors"
            >
              <FaGithub size={24} />
            </a>
          )}
          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-pink-500 transition-colors"
            >
              <FaInstagram size={24} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
