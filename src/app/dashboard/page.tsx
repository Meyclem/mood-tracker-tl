import DashboardNavbar from "@/components/dashboard-navbar";
import { InfoIcon, UserCircle, PlusCircle, Calendar } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch recent mood entries
  const { data: moodEntries, error } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Mood Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Track and monitor your emotional wellbeing
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/weekly">
                <Button variant="outline" size="lg" className="gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly View
                </Button>
              </Link>
              <Link href="/dashboard/mood">
                <Button size="lg" className="gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Add Mood Entry
                </Button>
              </Link>
            </div>
          </header>

          {/* Recent Moods Section */}
          <section className="bg-card rounded-xl p-6 border shadow-sm">
            <h2 className="font-semibold text-xl mb-4">Recent Mood Entries</h2>

            {moodEntries && moodEntries.length > 0 ? (
              <div className="space-y-4">
                {moodEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center p-4 bg-background rounded-lg border"
                  >
                    <div className="text-4xl mr-4">{entry.mood_emoji}</div>
                    <div className="flex-1">
                      <div className="font-medium">{entry.mood}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(entry.created_at).toLocaleString()}
                      </div>
                      {entry.notes && (
                        <p className="text-sm mt-1 line-clamp-1">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Energy</div>
                      <div className="text-sm">{entry.energy_level}%</div>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-6">
                  <Link href="/dashboard/weekly">
                    <Button variant="outline" className="gap-2">
                      <Calendar className="h-4 w-4" />
                      View Weekly Summary
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">
                  No mood entries yet
                </div>
                <Link href="/dashboard/mood">
                  <Button variant="outline" className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Add Your First Mood
                  </Button>
                </Link>
              </div>
            )}
          </section>

          {/* User Profile Section */}
          <section className="bg-card rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <UserCircle size={48} className="text-primary" />
              <div>
                <h2 className="font-semibold text-xl">User Profile</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 overflow-hidden">
              <pre className="text-xs font-mono max-h-48 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
