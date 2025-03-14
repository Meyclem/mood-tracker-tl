import DashboardNavbar from "@/components/dashboard-navbar";
import MonthlyOverview from "@/components/dashboard/monthly-overview";
import MoodChart from "@/components/dashboard/mood-chart";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function MonthlyDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get the current date
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  lastDayOfMonth.setHours(23, 59, 59, 999);

  // Format dates for query
  const monthStartStr = firstDayOfMonth.toISOString();
  const monthEndStr = lastDayOfMonth.toISOString();

  // Fetch mood entries for the current month
  const { data: monthEntries, error } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", monthStartStr)
    .lte("created_at", monthEndStr)
    .order("created_at", { ascending: false });

  // Fetch all mood entries for the past 3 months for historical data
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const { data: allEntries } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", threeMonthsAgo.toISOString())
    .order("created_at", { ascending: false });

  return (
    <>
      <DashboardNavbar />
      <main className="w-full min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Monthly Mood Analytics</h1>

          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="entries">Entries</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-8">
                <MonthlyOverview entries={allEntries || []} />
              </div>
            </TabsContent>

            <TabsContent value="chart" className="mt-6">
              <div className="grid gap-8">
                <MoodChart entries={allEntries || []} period="month" />
              </div>
            </TabsContent>

            <TabsContent value="entries" className="mt-6">
              <div className="bg-card rounded-xl p-6 border shadow-sm">
                <h2 className="font-semibold text-xl mb-4">
                  This Month's Entries
                </h2>

                {monthEntries && monthEntries.length > 0 ? (
                  <div className="space-y-4">
                    {monthEntries.map((entry) => (
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
                      No mood entries for this month yet
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
