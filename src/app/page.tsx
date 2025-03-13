import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import {
  ArrowUpRight,
  CheckCircle2,
  Shield,
  Users,
  Zap,
  Smile,
  BarChart,
  Brain,
} from "lucide-react";
import { createClient } from "../../supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70" />

        <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
                Track Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Mood
                </span>{" "}
                Journey
              </h1>

              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                Understand your emotional patterns and improve your mental
                wellbeing with our simple mood tracking app.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href={user ? "/dashboard/mood" : "/sign-up"}
                  className="inline-flex items-center px-8 py-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                >
                  {user ? "Track Your Mood" : "Get Started Free"}
                  <ArrowUpRight className="ml-2 w-5 h-5" />
                </Link>

                <Link
                  href={user ? "/dashboard" : "/sign-in"}
                  className="inline-flex items-center px-8 py-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium"
                >
                  {user ? "View Dashboard" : "Sign In"}
                </Link>
              </div>

              <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Private & secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Track Your Emotional Wellbeing
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our mood tracker helps you understand your emotional patterns and
              improve your mental health.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Smile className="w-6 h-6" />,
                title: "Simple Mood Tracking",
                description: "Log your emotions with intuitive emoji selectors",
              },
              {
                icon: <BarChart className="w-6 h-6" />,
                title: "Track Energy Levels",
                description: "Monitor your energy throughout the day",
              },
              {
                icon: <Brain className="w-6 h-6" />,
                title: "Identify Patterns",
                description: "Discover what affects your mood over time",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Private & Secure",
                description: "Your emotional data stays private and protected",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Quick & Easy",
                description: "Log your mood in seconds, anytime, anywhere",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Mental Health Insights",
                description:
                  "Gain valuable insights about your emotional wellbeing",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emoji Grid Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Express How You Feel</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from a variety of emotions to accurately track your mood
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 max-w-3xl mx-auto">
            {[
              "😊",
              "😐",
              "😢",
              "😡",
              "😴",
              "😰",
              "🤔",
              "🥳",
              "😄",
              "😌",
              "😭",
              "😤",
              "😪",
              "😨",
              "🧐",
              "🤩",
            ].map((emoji, index) => (
              <div
                key={index}
                className="aspect-square flex items-center justify-center text-4xl sm:text-5xl bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer"
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Start Tracking Your Mood Today
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are improving their mental wellbeing
            through mood tracking.
          </p>
          <Link
            href={user ? "/dashboard/mood" : "/sign-up"}
            className="inline-flex items-center px-8 py-4 text-blue-600 bg-white rounded-lg hover:bg-gray-100 transition-colors text-lg font-medium"
          >
            {user ? "Track Your Mood" : "Sign Up Free"}
            <ArrowUpRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
