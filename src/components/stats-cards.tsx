"use client";

import { useEffect, useState } from "react";
import { Briefcase, Star, Send, MessageSquare } from "lucide-react";

interface Stats { totalJobs: number; newJobs: number; savedJobs: number; appliedJobs: number; interviewJobs: number; }

export function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats).catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 animate-pulse h-24 sm:h-28" />)}
      </div>
    );
  }

  const cards = [
    { label: "Total Jobs", value: stats.totalJobs, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "New", value: stats.newJobs, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Applied", value: stats.appliedJobs, icon: Send, color: "text-green-600", bg: "bg-green-50" },
    { label: "Interviews", value: stats.interviewJobs, icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">{card.label}</p>
              <p className="text-xl sm:text-3xl font-bold mt-1">{card.value}</p>
            </div>
            <div className={`${card.bg} p-2 sm:p-3 rounded-lg hidden sm:block`}>
              <card.icon className={card.color} size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}