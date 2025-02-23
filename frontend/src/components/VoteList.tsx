"use client";

import React, { useState, useEffect } from "react";
import {
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSortNumericDown,
  FaSortNumericUp,
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import VoteListItem from "./VoteListItem";
import { Poll } from "@/interfaces/vote";

interface VoteListProps {
  user_id: string;
}

const VoteList: React.FC<VoteListProps> = ({ user_id }) => {
  const [search, setSearch] = useState("");
  const [voteItems, setVoteItems] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [activeSortField, setActiveSortField] = useState<"name" | "endsAt">("name");
  const [nameSortAsc, setNameSortAsc] = useState(true);
  const [dateSortAsc, setDateSortAsc] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"open" | "closed" | "both">("both");

  // Fetch votes for the given user, joining with the option and related poll details.
  useEffect(() => {
    const fetchPolls = async () => {
      const { data, error } = await supabase
        .from("votes")
        .select(`
          options (
            id,
            option_text,
            poll:poll_id (
              id,
              title,
              ends_at,
              description,
              options:options ( id, option_text )
            )
          )
        `)
        .eq("user_id", user_id);

      if (error) {
        setError(error.message);
      } else if (data) {
        // Map each vote into a VoteItem using the nested poll data.
        const polls = data.map((vote: any) => {
          const poll = vote.options.poll;
          return {
            id: poll.id,
            title: poll.title,
            endsAt: poll.ends_at,
            description: poll.description,
            options: poll.options || [],
            // Store the ID of the option this user voted on
            selectedOptionId: vote.options.id,
          };
        });
        setVoteItems(polls);
      }
      setLoading(false);
    };

    fetchPolls();
  }, [user_id]);

  // Filter by search term and poll status
  const filteredItems = voteItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    // Determine if poll is open or closed based on the current date
    const now = new Date();
    const pollEndDate = new Date(item.endsAt);
    const isOpen = pollEndDate > now;
    let matchesStatus = true;
    if (statusFilter === "open") {
      matchesStatus = isOpen;
    } else if (statusFilter === "closed") {
      matchesStatus = !isOpen;
    }
    return matchesSearch && matchesStatus;
  });

  // Sort by name or end date
  const sortedItems = filteredItems.slice().sort((a, b) => {
    if (activeSortField === "name") {
      return nameSortAsc
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else {
      return dateSortAsc
        ? a.endsAt.localeCompare(b.endsAt)
        : b.endsAt.localeCompare(a.endsAt);
    }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="w-full px-2 max-w-xl rounded-xl shadow-inner flex flex-col h-full">
      {/* Search */}
      <input
        type="text"
        placeholder="Search polls..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full text-gray-800 px-4 py-2 mb-4 bg-gray-100 border border-gray-300 rounded-lg shadow-inner focus:outline-none"
      />

      {/* Combined Sorting and Filter Controls */}
      <div className="flex items-center gap-4 mb-4">
        {/* Sorting Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveSortField("name");
              setNameSortAsc((prev) => !prev);
              setExpandedItem(null);
            }}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            {activeSortField === "name" &&
              (nameSortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}
            Name
          </button>
          <button
            onClick={() => {
              setActiveSortField("endsAt");
              setDateSortAsc((prev) => !prev);
              setExpandedItem(null);
            }}
            className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
          >
            {activeSortField === "endsAt" &&
              (dateSortAsc ? <FaSortNumericDown /> : <FaSortNumericUp />)}
            End Date
          </button>
        </div>

        {/* Status Filter Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex bg-gray-800 rounded-lg p-1 gap-1">
          <button
              onClick={() => setStatusFilter("both")}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === "both"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-transparent hover:bg-gray-600"
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setStatusFilter("open")}
              className={`px-3 py-1 rounded-lg text-white transition-all ${
                statusFilter === "open"
                  ? "bg-indigo-600  shadow-md"
                  : "bg-transparent hover:bg-gray-600"
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setStatusFilter("closed")}
              className={`px-3 py-1 rounded-lg text-white transition-all ${
                statusFilter === "closed"
                  ? "bg-indigo-600  shadow-md"
                  : "bg-transparent hover:bg-gray-600"
              }`}
            >
              Closed
            </button>
          </div>
        </div>
      </div>

      {/* Poll List */}
      <div className="flex-1 overflow-y-auto max-h-[280px] sm:max-h-[400px] md:max-h-[calc(100vh-230px)]">
        <ul className="space-y-1">
          {sortedItems.map((item) => (
            <VoteListItem
              key={item.id}
              item={item}
              expanded={expandedItem === item.id}
              onToggle={() =>
                setExpandedItem((prev) => (prev === item.id ? null : item.id))
              }
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VoteList;