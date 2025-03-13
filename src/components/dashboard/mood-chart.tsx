"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MoodEntry = {
  id: string;
  mood: string;
  mood_emoji: string;
  energy_level: number;
  notes: string | null;
  created_at: string;
  user_id: string;
};

type MoodChartProps = {
  entries: MoodEntry[];
  period: "week" | "month" | "year";
};

export default function MoodChart({
  entries,
  period = "week",
}: MoodChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sort entries by date
  const sortedEntries = [...entries].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  useEffect(() => {
    if (!canvasRef.current || entries.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Chart dimensions
    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = "#e2e8f0"; // Tailwind gray-200
    ctx.lineWidth = 1;
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, chartHeight + padding);
    ctx.lineTo(chartWidth + padding, chartHeight + padding);
    ctx.stroke();

    // Get date range
    const dateRange = getDateRange(period);
    const startDate = dateRange.start;
    const endDate = dateRange.end;
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Draw x-axis labels (dates)
    ctx.fillStyle = "#64748b"; // Tailwind slate-500
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";

    const labelCount = period === "week" ? 7 : period === "month" ? 4 : 12;
    for (let i = 0; i <= labelCount; i++) {
      const x = padding + (i * chartWidth) / labelCount;
      const date = new Date(startDate);
      date.setDate(
        startDate.getDate() + Math.floor((i * totalDays) / labelCount),
      );
      const label = formatDate(date, period);
      ctx.fillText(label, x, chartHeight + padding + 15);

      // Draw grid lines
      ctx.beginPath();
      ctx.strokeStyle = "#e2e8f0"; // Tailwind gray-200
      ctx.lineWidth = 0.5;
      ctx.moveTo(x, padding);
      ctx.lineTo(x, chartHeight + padding);
      ctx.stroke();
    }

    // Draw y-axis labels (energy levels)
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      const y = chartHeight + padding - (i * chartHeight) / 5;
      const label = `${i * 20}%`;
      ctx.fillText(label, padding - 10, y + 3);

      // Draw grid lines
      ctx.beginPath();
      ctx.strokeStyle = "#e2e8f0"; // Tailwind gray-200
      ctx.lineWidth = 0.5;
      ctx.moveTo(padding, y);
      ctx.lineTo(chartWidth + padding, y);
      ctx.stroke();
    }

    // Group entries by day
    const entriesByDay = new Map<string, MoodEntry[]>();
    sortedEntries.forEach((entry) => {
      const date = new Date(entry.created_at);
      if (date >= startDate && date <= endDate) {
        const dateKey = date.toISOString().split("T")[0];
        if (!entriesByDay.has(dateKey)) {
          entriesByDay.set(dateKey, []);
        }
        entriesByDay.get(dateKey)?.push(entry);
      }
    });

    // Calculate average energy level for each day
    const dataPoints: {
      date: Date;
      energy: number;
      mood: string;
      emoji: string;
    }[] = [];
    entriesByDay.forEach((dayEntries, dateKey) => {
      const avgEnergy =
        dayEntries.reduce((sum, entry) => sum + entry.energy_level, 0) /
        dayEntries.length;

      // Find most common mood
      const moodCounts = new Map<string, number>();
      dayEntries.forEach((entry) => {
        moodCounts.set(entry.mood, (moodCounts.get(entry.mood) || 0) + 1);
      });

      let dominantMood = "";
      let dominantEmoji = "";
      let maxCount = 0;

      moodCounts.forEach((count, mood) => {
        if (count > maxCount) {
          maxCount = count;
          dominantMood = mood;
          dominantEmoji =
            dayEntries.find((e) => e.mood === mood)?.mood_emoji || "";
        }
      });

      dataPoints.push({
        date: new Date(dateKey),
        energy: avgEnergy,
        mood: dominantMood,
        emoji: dominantEmoji,
      });
    });

    // Sort data points by date
    dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Draw energy level line
    if (dataPoints.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = "#3b82f6"; // Tailwind blue-500
      ctx.lineWidth = 2;

      dataPoints.forEach((point, index) => {
        const x =
          padding +
          ((point.date.getTime() - startDate.getTime()) /
            (endDate.getTime() - startDate.getTime())) *
            chartWidth;
        const y = chartHeight + padding - (point.energy / 100) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        // Draw point
        ctx.fillStyle = "#3b82f6"; // Tailwind blue-500
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw emoji above point
        ctx.font = "16px sans-serif";
        ctx.fillText(point.emoji, x, y - 15);
      });

      ctx.stroke();
    }

    // Draw legend
    ctx.fillStyle = "#64748b"; // Tailwind slate-500
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Energy Level", padding, padding - 15);
  }, [entries, period, sortedEntries]);

  // Helper function to get date range based on period
  function getDateRange(period: "week" | "month" | "year") {
    const end = new Date();
    const start = new Date();

    if (period === "week") {
      start.setDate(end.getDate() - 6); // Last 7 days including today
    } else if (period === "month") {
      start.setDate(end.getDate() - 29); // Last 30 days including today
    } else {
      start.setFullYear(end.getFullYear() - 1); // Last 365 days including today
    }

    // Set to start of day
    start.setHours(0, 0, 0, 0);
    // Set to end of day
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  // Helper function to format date based on period
  function formatDate(date: Date, period: "week" | "month" | "year") {
    if (period === "week") {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
      });
    } else if (period === "month") {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mood Evolution Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px] relative">
          {entries.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              No mood data available for this period
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ display: "block" }}
            ></canvas>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
