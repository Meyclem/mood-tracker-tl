import DashboardNavbar from "@/components/dashboard-navbar";
import WeeklyOverview from "@/components/dashboard/weekly-overview";
import MoodChart from "@/components/dashboard/mood-chart";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function WeeklyDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get the current date
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek;
  const weekStart = new Date(today.setDate(diff));

  // Get the end of the week (add 6 days to start of week)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Format dates for query
  const weekStartStr = weekStart.toISOString();
  const weekEndStr = weekEnd.toISOString();

  // Fetch mood entries for the current week
  const { data: moodEntries, error } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", weekStartStr)
    .lte("created_at", weekEndStr)
    .order("created_at", { ascending: false });

  // Fetch all mood entries for the past month for historical data
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const { data: allEntries } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", monthAgo.toISOString())
    .order("created_at", { ascending: false });

  return (
    <>
      <DashboardNavbar />
      <main className="w-full min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Mood Analytics Dashboard</h1>

          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="entries">Entries</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-8">
                <WeeklyOverview entries={allEntries || []} />
              </div>
            </TabsContent>

            <TabsContent value="chart" className="mt-6">
              <div className="grid gap-8">
                <MoodChart entries={allEntries || []} period="week" />
              </div>
            </TabsContent>

            <TabsContent value="entries" className="mt-6">
              <div className="bg-card rounded-xl p-6 border shadow-sm">
                <h2 className="font-semibold text-xl mb-4">
                  This Week's Entries
                </h2>

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
                            <p className="text-sm mt-1 line-clamp-2">
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
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground mb-4">
                      No mood entries for this week yet
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
