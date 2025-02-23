"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FaTimes } from "react-icons/fa";

interface NewPollFormData {
  title: string;
  description: string;
  options: string[];
}

interface FormProps {
  userId: number;
  onPollCreated?: () => void;
}

const Form: React.FC<FormProps> = ({ userId, onPollCreated }) => {
  const [formData, setFormData] = useState<NewPollFormData>({
    title: "",
    description: "",
    options: [],
  });
  const [inputValue, setInputValue] = useState<string>("");
  const [pollDate, setPollDate] = useState<string>("");
  const [pollTime, setPollTime] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Check window width for mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOption = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, inputValue.trim()],
      }));
      setInputValue("");
    }
  };

  const handleRemoveOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title || !pollDate || !pollTime || formData.options.length < 2) {
      setError("Please fill all required fields and add at least two options.");
      return;
    }

    // Combine date and time
    const combinedEndsAt = `${pollDate}T${pollTime}`;

    // Insert the new poll and get the inserted record
    console.log("e", e);
    const { data, error } = await supabase
      .from("poll")
      .insert([
        {
          title: formData.title,
          description: formData.description,
          ends_at: combinedEndsAt,
          admin: userId,
        },
      ])
      .select();
    
    if (error || !data || data.length === 0) {
      setError(error?.message || "Failed to create poll.");
      return;
    }

    const pollId = data[0].id;
    console.log('pollId', pollId);
    // Insert options for the new poll
    const optionsPayload = formData.options.map((optionText) => ({
      poll_id: pollId,
      option_text: optionText,
    }));

    console.log("optionsPayload", optionsPayload);
    optionsPayload.map( async (option) => {
        console.log("option", option);

        const { error: optionsError } = await supabase
        .from("options")
        .insert(option);
      if (optionsError) {
        setError(optionsError.message);
        return;
      }
    })

    // Reset form and notify parent to refresh the vote list
    setFormData({ title: "", description: "", options: [] });
    setPollDate("");
    setPollTime("");
    setInputValue("");
    if (isMobile) setIsOpen(false);
    console.log("Poll created successfully, calling onPollCreated");
    if (onPollCreated) onPollCreated();
  };

  return (
    <div className="mt-1">
      {isMobile && (
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          {isOpen ? "Hide New Poll Form" : "Create New Poll"}
        </button>
      )}
      {(!isMobile || isOpen) && (
        <form
          onSubmit={handleSubmit}
          className="mx-auto bg-gray-800 p-6 rounded-lg shadow-md space-y-5"
        >
          {/* Title Input */}
          <div className="relative z-0 w-full group">
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleInputChange}
              className="block py-2 px-0 w-full text-sm text-gray-100 bg-transparent border-0 border-b-2 border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-indigo-500 peer"
              placeholder=" "
              required
            />
            <label
              htmlFor="title"
              className="peer-focus:font-medium absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-indigo-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0"
            >
              New Poll <span className="text-red-500">*</span>
            </label>
          </div>

          {/* Description Input */}
          <div className="relative z-0 w-full group">
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={1}
              className="block py-2 px-0 w-full text-sm text-gray-100 bg-transparent border-0 border-b-2 border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-indigo-500 peer"
              placeholder=" "
            ></textarea>
            <label
              htmlFor="description"
              className="peer-focus:font-medium absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-indigo-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0"
            >
              Description
            </label>
          </div>

          {/* Ends At Inputs: Date and Time */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-48">
              <input
                type="date"
                name="pollDate"
                id="pollDate"
                value={pollDate}
                onChange={(e) => setPollDate(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-gray-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                required
              />
            </div>
            <div className="relative">
              <input
                type="time"
                name="pollTime"
                id="pollTime"
                value={pollTime}
                onChange={(e) => setPollTime(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-gray-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                required
              />
            </div>
          </div>

          {/* Options Input */}
          <div className="relative z-0 w-full group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleAddOption}
              className="block py-2 px-0 w-full text-sm text-gray-100 bg-transparent border-0 border-b-2 border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-indigo-500 peer"
              placeholder=""
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full"
                >
                  <span>{option}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="hover:text-red-300"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
            <label
              htmlFor="description"
              className="peer-focus:font-medium absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-indigo-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0"
            >
              Options: Type and press Enter
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300"
          >
            Create Poll
          </button>
        </form>
      )}
    </div>
  );
};

export default Form;
