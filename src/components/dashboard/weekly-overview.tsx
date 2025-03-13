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

export default function WeeklyOverview({ entries }: { entries: MoodEntry[] }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek;
    return new Date(today.setDate(diff));
  });

  // Generate the week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Format date for comparison with entries
  const formatDateForComparison = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  // Go to current week
  const goToCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek;
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  // Process data for each day of the week
  const weekData: DayData[] = weekDays.map((day) => {
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

  // Calculate weekly averages
  const weeklyEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.created_at);
    const entryDateStr = formatDateForComparison(entryDate);
    return weekDays.some(
      (day) => formatDateForComparison(day) === entryDateStr,
    );
  });

  const weeklyAverageEnergy =
    weeklyEntries.length > 0
      ? Math.round(
          weeklyEntries.reduce((sum, entry) => sum + entry.energy_level, 0) /
            weeklyEntries.length,
        )
      : 0;

  // Find weekly dominant mood
  const weeklyMoodCounts: Record<string, number> = {};
  weeklyEntries.forEach((entry) => {
    weeklyMoodCounts[entry.mood] = (weeklyMoodCounts[entry.mood] || 0) + 1;
  });

  let weeklyDominantMood = "";
  let weeklyDominantEmoji = "";
  let weeklyMaxCount = 0;

  for (const mood in weeklyMoodCounts) {
    if (weeklyMoodCounts[mood] > weeklyMaxCount) {
      weeklyMaxCount = weeklyMoodCounts[mood];
      weeklyDominantMood = mood;
      // Find the emoji for this mood
      const entry = weeklyEntries.find((e) => e.mood === mood);
      weeklyDominantEmoji = entry ? entry.mood_emoji : "";
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

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Weekly Mood Overview</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
              <Calendar className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {formatDate(currentWeekStart)} - {formatDate(weekDays[6])}
        </div>
      </CardHeader>
      <CardContent>
        {/* Weekly Summary */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Weekly Summary</h3>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{weeklyDominantEmoji || "😐"}</div>
              <div>
                <div className="font-medium">
                  {weeklyDominantMood || "No data"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Dominant mood
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{weeklyAverageEnergy}%</div>
              <div className="text-xs text-muted-foreground">Avg energy</div>
              <div className="w-16 h-2 mt-1 rounded-full overflow-hidden bg-gray-200">
                <div
                  className={`h-full ${getEnergyColor(weeklyAverageEnergy)}`}
                  style={{ width: `${weeklyAverageEnergy}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Overview */}
        <div className="grid grid-cols-7 gap-2">
          {weekData.map((day, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg border ${new Date().toDateString() === day.date.toDateString() ? "border-primary" : "border-border"}`}
            >
              <div className="text-xs font-medium mb-1 text-center">
                {day.date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="text-xs text-center mb-2">
                {formatDate(day.date)}
              </div>

              {day.entries.length > 0 ? (
                <div className="flex flex-col items-center">
                  <div className="text-2xl mb-1">{day.dominantEmoji}</div>
                  <div className="w-full h-1 rounded-full overflow-hidden bg-gray-200 mt-1">
                    <div
                      className={`h-full ${getEnergyColor(day.averageEnergy)}`}
                      style={{ width: `${day.averageEnergy}%` }}
                    ></div>
                  </div>
                  <div className="text-xs mt-1 text-center">
                    {day.entries.length} entries
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-16 text-muted-foreground">
                  <div className="text-xs">No data</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
