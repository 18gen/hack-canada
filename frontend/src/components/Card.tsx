"use client";

import React from "react";
import { FaGithub, FaInstagram } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";

interface CardProps {
  id: string;
  name: string;
  image: string;
  email: string;
}

const Card: React.FC<CardProps> = ({ id, name, image, email }) => {
  return (
    <div className="relative w-full sm:h-80 h-56 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-2xl overflow-hidden transition-all">
      <div className="p-6 flex flex-col h-full">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-4xl font-bold text-gray-800">{name}</h2>
          <img
            src={image}
            alt={name}
            className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
          />
        </div>
        {/* <div className="flex-grow" /> */}
        <div className="mt-auto flex space-x-4">
          {email && (
            <a className="flex gap-2 text-gray-700 hover:text-blue-500 transition-colors">
              <MdOutlineMail size={24} /> {email}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
