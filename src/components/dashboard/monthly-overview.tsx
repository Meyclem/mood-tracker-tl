"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

type MoodEntry = {
  id: string;
  mood: string;
  mood_emoji: string;
  energy_level: number;
  notes: string | null;
  created_at: string;
  user_id: string;
};

type DayData = {
  date: Date;
  entries: MoodEntry[];
  averageEnergy: number;
  dominantMood: string;
  dominantEmoji: string;
};

export default function MonthlyOverview({ entries }: { entries: MoodEntry[] }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Generate the month days
  const monthDays = Array.from(
    {
      length: getDaysInMonth(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
      ),
    },
    (_, i) => {
      const date = new Date(currentMonth);
      date.setDate(i + 1);
      return date;
    },
  );

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { day: "numeric" });
  };

  // Format date for comparison with entries
  const formatDateForComparison = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  // Go to current month
  const goToCurrentMonth = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // Process data for each day of the month
  const monthData: DayData[] = monthDays.map((day) => {
    const dayStr = formatDateForComparison(day);
    const dayEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.created_at).toISOString().split("T")[0];
      return entryDate === dayStr;
    });

    // Calculate average energy level
    const avgEnergy =
      dayEntries.length > 0
        ? Math.round(
            dayEntries.reduce((sum, entry) => sum + entry.energy_level, 0) /
              dayEntries.length,
          )
        : 0;

    // Find dominant mood
    const moodCounts: Record<string, number> = {};
    dayEntries.forEach((entry) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    let dominantMood = "";
    let dominantEmoji = "";
    let maxCount = 0;

    for (const mood in moodCounts) {
      if (moodCounts[mood] > maxCount) {
        maxCount = moodCounts[mood];
        dominantMood = mood;
        // Find the emoji for this mood
        const entry = dayEntries.find((e) => e.mood === mood);
        dominantEmoji = entry ? entry.mood_emoji : "";
      }
    }

    return {
      date: day,
      entries: dayEntries,
      averageEnergy: avgEnergy,
      dominantMood,
      dominantEmoji,
    };
  });

  // Calculate monthly averages
  const monthlyEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.created_at);
    return (
      entryDate.getMonth() === currentMonth.getMonth() &&
      entryDate.getFullYear() === currentMonth.getFullYear()
    );
  });

  const monthlyAverageEnergy =
    monthlyEntries.length > 0
      ? Math.round(
          monthlyEntries.reduce((sum, entry) => sum + entry.energy_level, 0) /
            monthlyEntries.length,
        )
      : 0;

  // Find monthly dominant mood
  const monthlyMoodCounts: Record<string, number> = {};
  monthlyEntries.forEach((entry) => {
    monthlyMoodCounts[entry.mood] = (monthlyMoodCounts[entry.mood] || 0) + 1;
  });

  let monthlyDominantMood = "";
  let monthlyDominantEmoji = "";
  let monthlyMaxCount = 0;

  for (const mood in monthlyMoodCounts) {
    if (monthlyMoodCounts[mood] > monthlyMaxCount) {
      monthlyMaxCount = monthlyMoodCounts[mood];
      monthlyDominantMood = mood;
      // Find the emoji for this mood
      const entry = monthlyEntries.find((e) => e.mood === mood);
      monthlyDominantEmoji = entry ? entry.mood_emoji : "";
    }
  }

  // Get energy level color
  const getEnergyColor = (level: number) => {
    if (level === 0) return "bg-gray-200";
    if (level < 30) return "bg-red-500";
    if (level < 50) return "bg-orange-500";
    if (level < 70) return "bg-yellow-500";
    if (level < 90) return "bg-green-500";
    return "bg-blue-500";
  };

  // Get day of week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  ).getDay();

  // Create array for empty cells before the first day of the month
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  return (
    <Card className="w-full">
      <CardHeader className="pb-1 pt-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Monthly Overview</CardTitle>
            <div className="text-xs text-muted-foreground">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousMonth}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToCurrentMonth}
              className="h-7 w-7"
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              className="h-7 w-7"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Monthly Summary */}
        <div className="mb-3 p-2 bg-muted/30 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="text-2xl">{monthlyDominantEmoji || "😐"}</div>
              <div>
                <div className="text-sm font-medium">
                  {monthlyDominantMood || "No data"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Dominant mood
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{monthlyAverageEnergy}%</div>
              <div className="text-[10px] text-muted-foreground">
                Avg energy
              </div>
              <div className="w-16 h-1.5 mt-0.5 rounded-full overflow-hidden bg-gray-200">
                <div
                  className={`h-full ${getEnergyColor(monthlyAverageEnergy)}`}
                  style={{ width: `${monthlyAverageEnergy}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Header - Days of Week */}
        <div className="grid grid-cols-7 gap-0.5 mb-0.5">
          {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
            <div
              key={day}
              className="text-[10px] font-medium text-center py-0.5"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {/* Empty cells for days before the 1st of the month */}
          {emptyDays.map((i) => (
            <div key={`empty-${i}`} className="p-0.5"></div>
          ))}

          {/* Actual days of the month */}
          {monthData.map((day, index) => (
            <div
              key={index}
              className={`p-0.5 rounded-sm border ${new Date().toDateString() === day.date.toDateString() ? "border-primary" : "border-border"}`}
            >
              <div className="text-[10px] font-medium text-center">
                {formatDate(day.date)}
              </div>

              {day.entries.length > 0 ? (
                <div className="flex flex-col items-center">
                  <div className="text-sm">{day.dominantEmoji}</div>
                  <div className="w-full h-0.5 rounded-full overflow-hidden bg-gray-200 mt-0.5">
                    <div
                      className={`h-full ${getEnergyColor(day.averageEnergy)}`}
                      style={{ width: `${day.averageEnergy}%` }}
                    ></div>
                  </div>
                  {day.entries.length > 1 && (
                    <div className="text-[8px] text-muted-foreground">
                      {day.entries.length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[16px] text-muted-foreground">
                  <div className="text-[8px]">-</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
