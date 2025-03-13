"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";

type Mood = {
  emoji: string;
  label: string;
};

const moods: Mood[] = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" },
  { emoji: "😴", label: "Tired" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "🤔", label: "Thoughtful" },
  { emoji: "🥳", label: "Excited" },
];

export default function MoodEntryForm({ userId }: { userId: string }) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number>(50);
  const [notes, setNotes] = useState<string>("");
  const [timestamp, setTimestamp] = useState<string>(
    new Date().toISOString().slice(0, 16),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleEnergyChange = (value: number[]) => {
    setEnergyLevel(value[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!selectedMood) {
      setError("Please select a mood");
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.from("mood_entries").insert({
        user_id: userId,
        mood: selectedMood.label,
        mood_emoji: selectedMood.emoji,
        energy_level: energyLevel,
        notes: notes,
        created_at: new Date(timestamp).toISOString(),
      });

      if (error) throw error;

      // Success - redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save mood entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBatteryIcon = (level: number) => {
    if (level < 20) return "🪫";
    if (level < 40) return "🔋";
    if (level < 60) return "🔋";
    if (level < 80) return "🔋";
    return "🔋";
  };

  const getEnergyLevelLabel = (level: number) => {
    if (level < 20) return "Very Low";
    if (level < 40) return "Low";
    if (level < 60) return "Medium";
    if (level < 80) return "High";
    return "Very High";
  };

  return (
    <div className="bg-card rounded-xl p-6 border shadow-sm max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mood Selector */}
        <div className="space-y-4">
          <Label className="text-lg font-medium">How are you feeling?</Label>
          <div className="grid grid-cols-4 gap-4">
            {moods.map((mood) => (
              <button
                key={mood.label}
                type="button"
                onClick={() => handleMoodSelect(mood)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
                  selectedMood?.label === mood.label
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-secondary hover:bg-secondary/80 border-2 border-transparent"
                }`}
              >
                <span className="text-4xl mb-2">{mood.emoji}</span>
                <span className="text-sm font-medium">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Energy Level Selector */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-medium">Energy Level</Label>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getBatteryIcon(energyLevel)}</span>
              <span className="font-medium">
                {getEnergyLevelLabel(energyLevel)}
              </span>
            </div>
          </div>
          <Slider
            value={[energyLevel]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleEnergyChange}
            className="py-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Low Energy</span>
            <span>High Energy</span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="notes" className="text-lg font-medium">
              Notes (Optional)
            </Label>
            <span className="text-sm text-muted-foreground">
              {notes.length}/280
            </span>
          </div>
          <Textarea
            id="notes"
            placeholder="Add some notes about how you're feeling..."
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 280))}
            className="resize-none h-24"
          />
        </div>

        {/* Timestamp */}
        <div className="space-y-2">
          <Label htmlFor="timestamp" className="text-lg font-medium">
            When did you feel this way?
          </Label>
          <Input
            id="timestamp"
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="text-destructive text-sm font-medium">{error}</div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full py-6 text-lg relative overflow-hidden group"
          disabled={isSubmitting}
        >
          <span className="relative z-10">
            {isSubmitting ? "Saving..." : "Save Mood Entry"}
          </span>
          <span className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-md pulse-animation"></span>
        </Button>
      </form>
    </div>
  );
}
