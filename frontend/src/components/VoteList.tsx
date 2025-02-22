"use client";

import React, { useState } from "react";
import {
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSortNumericDown,
  FaSortNumericUp,
} from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import VoteLocationMap from "@/components/VoteLocationMap";

interface VoteItem {
  id: number;
  title: string;
  endsAt: string;
  location: string;
}

interface VoteListItemProps {
  item: VoteItem;
  expanded: boolean;
  onToggle: () => void;
}

const VoteListItem: React.FC<VoteListItemProps> = ({
  item,
  expanded,
  onToggle,
}) => {
  return (
    <li
      onClick={onToggle}
      className="cursor-pointer px-4 py-3 bg-gray-800 rounded-lg shadow-inner transition-all"
    >
      <div className="flex justify-between items-center">
        <span>{item.title}</span>
        <span className="text-sm text-gray-300">
          {expanded ? <IoIosArrowDown /> : <IoIosArrowForward />}
        </span>
      </div>
      {expanded && (
        <div className="mt-2 text-gray-300 text-sm">
          <p>Ends at: {item.endsAt}</p>
          <p>Details about {item.title} go here.</p>
          <div className="mt-2">
            <VoteLocationMap location={item.location} />
          </div>
        </div>
      )}
    </li>
  );
};

const VoteList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [activeSortField, setActiveSortField] = useState<"name" | "endsAt">(
    "name",
  );
  const [nameSortAsc, setNameSortAsc] = useState(true);
  const [dateSortAsc, setDateSortAsc] = useState(true);

  // will replace with actual db
  const voteItems: VoteItem[] = [
    {
      id: 1,
      title: "Vote for Option A",
      endsAt: "2025-01-01",
      location: "1600 Amphitheatre Parkway, Mountain View, CA",
    },
    {
      id: 2,
      title: "Vote for Option B",
      endsAt: "2024-12-15",
      location: "1600 Amphitheatre Parkway, Mountain View, CA",
    },
    {
      id: 3,
      title: "Vote for Option C",
      endsAt: "2025-02-10",
      location: "1600 Amphitheatre Parkway, Mountain View, CA",
    },
    {
      id: 4,
      title: "Vote for Option D",
      endsAt: "2024-11-20",
      location: "1600 Amphitheatre Parkway, Mountain View, CA",
    },
    {
      id: 5,
      title: "Vote for Option E",
      endsAt: "2025-03-05",
      location: "1600 Amphitheatre Parkway, Mountain View, CA",
    },
    {
      id: 6,
      title: "Vote for Option F",
      endsAt: "2024-12-01",
      location: "1600 Amphitheatre Parkway, Mountain View, CA",
    },
    {
      id: 7,
      title: "Vote for Option G",
      endsAt: "2025-01-15",
      location: "1600 Amphitheatre Parkway, Mountain View, CA",
    },
    {
      id: 8,
      title: "Vote for Option H",
      endsAt: "2025-04-01",
      location: "1600 Amphitheatre Parkway, Mountain View, CA",
    },
    {
      id: 9,
      title: "Vote for Option I",
      endsAt: "2024-10-30",
      location: "1600 Amphitheatre Parkway, Mountain View, CA",
    },
    {
      id: 10,
      title: "Vote for Option J",
      endsAt: "2025-02-20",
      location: "1600 Amphitheatre Parkway, Mountain View, CA",
    },
    {
      id: 11,
      title: "Vote for Option K",
      endsAt: "2025-03-15",
      location: "1600 Amphitheatre Parkway, Mountain View, CA",
    },
    {
      id: 12,
      title: "Vote for Option L",
      endsAt: "2024-09-25",
      location: "1600 Amphitheatre Parkway, Mountain View, CA",
    },
  ];

  const filteredItems = voteItems.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );

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

  return (
    <div className="w-full py-2 max-w-xl p-6 rounded-xl shadow-inner flex flex-col h-full">
      <input
        type="text"
        placeholder="Search votes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full text-gray-800 px-4 py-2 mb-4 bg-gray-100 border border-gray-300 rounded-lg shadow-inner focus:outline-none"
      />

      {/* Sorting Controls */}
      <div className="flex gap-4 mb-4">
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
          Sort by Name
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
          Sort by End Date
        </button>
      </div>

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
