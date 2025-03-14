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

// Helper function to get mood score from mood name
function getMoodScore(mood: string): number {
  const moodScores: Record<string, number> = {
    Happy: 90,
    Excited: 100,
    Thoughtful: 60,
    Neutral: 50,
    Anxious: 30,
    Tired: 20,
    Sad: 10,
    Angry: 0,
  };
  return moodScores[mood] || 50; // Default to neutral if mood not found
}

// Helper function to get mood color based on score
function getMoodColor(score: number): string {
  if (score <= 20) return "#ef4444"; // Red for lowest moods
  if (score <= 40) return "#f97316"; // Orange for low moods
  if (score <= 60) return "#eab308"; // Yellow for neutral moods
  if (score <= 80) return "#22c55e"; // Green for good moods
  return "#3b82f6"; // Blue for highest moods
}

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

    // Determine number of labels based on period
    let labelCount, groupingPeriod;
    if (period === "week") {
      labelCount = 7;
      groupingPeriod = "day";
    } else if (period === "month") {
      labelCount = Math.min(
        4,
        new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate() /
          7,
      );
      groupingPeriod = "week";
    } else {
      labelCount = 12;
      groupingPeriod = "month";
    }

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

    // Draw y-axis labels (percentage)
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

    // Group entries by period (day, week, or month)
    const entriesByPeriod = new Map<string, MoodEntry[]>();
    sortedEntries.forEach((entry) => {
      const date = new Date(entry.created_at);
      if (date >= startDate && date <= endDate) {
        let periodKey;
        if (groupingPeriod === "day") {
          periodKey = date.toISOString().split("T")[0];
        } else if (groupingPeriod === "week") {
          // Group by week (0-indexed from start of month)
          const weekNum = Math.floor(date.getDate() / 7);
          periodKey = `${date.getFullYear()}-${date.getMonth()}-week-${weekNum}`;
        } else {
          // Group by month
          periodKey = `${date.getFullYear()}-${date.getMonth()}`;
        }

        if (!entriesByPeriod.has(periodKey)) {
          entriesByPeriod.set(periodKey, []);
        }
        entriesByPeriod.get(periodKey)?.push(entry);
      }
    });

    // Calculate average energy level and mood score for each period
    const dataPoints: {
      date: Date;
      energy: number;
      moodScore: number;
      label: string;
    }[] = [];

    // Create data points based on the period
    if (period === "week") {
      // For week view, create a data point for each day
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateKey = date.toISOString().split("T")[0];
        const entries = entriesByPeriod.get(dateKey) || [];

        if (entries.length > 0) {
          const avgEnergy =
            entries.reduce((sum, entry) => sum + entry.energy_level, 0) /
            entries.length;

          // Calculate average mood score
          const moodScores = entries.map((entry) => getMoodScore(entry.mood));
          const avgMoodScore =
            moodScores.reduce((sum, score) => sum + score, 0) /
            moodScores.length;

          dataPoints.push({
            date,
            energy: avgEnergy,
            moodScore: avgMoodScore,
            label: date.toLocaleDateString("en-US", { weekday: "short" }),
          });
        } else {
          // Add empty data point to maintain timeline
          dataPoints.push({
            date,
            energy: 0,
            moodScore: 0,
            label: date.toLocaleDateString("en-US", { weekday: "short" }),
          });
        }
      }
    } else if (period === "month") {
      // For month view, create data points by week
      const weeksInMonth = Math.ceil(totalDays / 7);
      for (let i = 0; i < weeksInMonth; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + i * 7);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        // Find entries for this week
        const weekEntries: MoodEntry[] = [];
        entriesByPeriod.forEach((entries, key) => {
          if (key.includes(`week-${i}`)) {
            weekEntries.push(...entries);
          }
        });

        if (weekEntries.length > 0) {
          const avgEnergy =
            weekEntries.reduce((sum, entry) => sum + entry.energy_level, 0) /
            weekEntries.length;

          // Calculate average mood score
          const moodScores = weekEntries.map((entry) =>
            getMoodScore(entry.mood),
          );
          const avgMoodScore =
            moodScores.reduce((sum, score) => sum + score, 0) /
            moodScores.length;

          dataPoints.push({
            date: weekStart,
            energy: avgEnergy,
            moodScore: avgMoodScore,
            label: `Week ${i + 1}`,
          });
        } else {
          // Add empty data point
          dataPoints.push({
            date: weekStart,
            energy: 0,
            moodScore: 0,
            label: `Week ${i + 1}`,
          });
        }
      }
    } else {
      // For year view, create data points by month
      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + i,
          1,
        );
        const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
        const monthEntries = entriesByPeriod.get(monthKey) || [];

        if (monthEntries.length > 0) {
          const avgEnergy =
            monthEntries.reduce((sum, entry) => sum + entry.energy_level, 0) /
            monthEntries.length;

          // Calculate average mood score
          const moodScores = monthEntries.map((entry) =>
            getMoodScore(entry.mood),
          );
          const avgMoodScore =
            moodScores.reduce((sum, score) => sum + score, 0) /
            moodScores.length;

          dataPoints.push({
            date: monthDate,
            energy: avgEnergy,
            moodScore: avgMoodScore,
            label: monthDate.toLocaleDateString("en-US", { month: "short" }),
          });
        } else {
          // Add empty data point
          dataPoints.push({
            date: monthDate,
            energy: 0,
            moodScore: 0,
            label: monthDate.toLocaleDateString("en-US", { month: "short" }),
          });
        }
      }
    }

    // Sort data points by date
    dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Filter out empty data points
    const validDataPoints = dataPoints.filter(
      (point) => point.energy > 0 || point.moodScore > 0,
    );

    if (validDataPoints.length > 1) {
      // Draw lines connecting data points
      // Energy level line (green)
      ctx.beginPath();
      ctx.strokeStyle = "#22c55e"; // Green for energy (Dataset 1 in reference)
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";

      validDataPoints.forEach((point, index) => {
        const x = padding + (index / (validDataPoints.length - 1)) * chartWidth;
        const y = chartHeight + padding - (point.energy / 100) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Add data points on the energy line
      validDataPoints.forEach((point, index) => {
        const x = padding + (index / (validDataPoints.length - 1)) * chartWidth;
        const y = chartHeight + padding - (point.energy / 100) * chartHeight;

        ctx.beginPath();
        ctx.fillStyle = "#22c55e";
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Mood score line (color changing based on score)
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";

      // Use gradient for mood line
      for (let i = 0; i < validDataPoints.length - 1; i++) {
        const startX =
          padding + (i / (validDataPoints.length - 1)) * chartWidth;
        const startY =
          chartHeight +
          padding -
          (validDataPoints[i].moodScore / 100) * chartHeight;
        const endX =
          padding + ((i + 1) / (validDataPoints.length - 1)) * chartWidth;
        const endY =
          chartHeight +
          padding -
          (validDataPoints[i + 1].moodScore / 100) * chartHeight;

        // Get color based on mood score (average of the two points)
        const avgScore =
          (validDataPoints[i].moodScore + validDataPoints[i + 1].moodScore) / 2;
        ctx.strokeStyle = getMoodColor(avgScore);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      validDataPoints.forEach((point, index) => {
        const x = padding + (index / (validDataPoints.length - 1)) * chartWidth;
        const y = chartHeight + padding - (point.moodScore / 100) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Add data points on the mood line
      validDataPoints.forEach((point, index) => {
        const x = padding + (index / (validDataPoints.length - 1)) * chartWidth;
        const y = chartHeight + padding - (point.moodScore / 100) * chartHeight;

        // Get color based on mood score
        const pointColor = getMoodColor(point.moodScore);
        ctx.beginPath();
        ctx.fillStyle = pointColor;
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Add labels for each data point
      validDataPoints.forEach((point, index) => {
        const x = padding + (index / (validDataPoints.length - 1)) * chartWidth;

        ctx.fillStyle = "#64748b";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(point.label, x, chartHeight + padding + 15);
      });
    }

    // Draw legend
    ctx.fillStyle = "#64748b";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";

    // Energy legend (green)
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding - 18);
    ctx.lineTo(padding + 30, padding - 18);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = "#22c55e";
    ctx.arc(padding + 15, padding - 18, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#64748b";
    ctx.fillText("Energy Level", padding + 40, padding - 15);

    // Mood legend (gradient)
    // Create a mini gradient for the legend
    const legendWidth = 30;
    const legendX = padding + 150;
    const legendY = padding - 18;

    // Draw gradient line for mood
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];
    const segments = colors.length - 1;

    for (let i = 0; i < segments; i++) {
      const gradientX = legendX + (i * legendWidth) / segments;
      const gradientWidth = legendWidth / segments;

      ctx.beginPath();
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 2;
      ctx.moveTo(gradientX, legendY);
      ctx.lineTo(gradientX + gradientWidth, legendY);
      ctx.stroke();
    }

    // Add point in the middle
    ctx.beginPath();
    ctx.fillStyle = "#eab308"; // Middle color
    ctx.arc(legendX + legendWidth / 2, legendY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#64748b";
    ctx.fillText("Mood Score", legendX + legendWidth + 10, legendY + 3);
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
        <CardTitle>Mood & Energy Evolution</CardTitle>
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
