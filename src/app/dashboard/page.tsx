"use client";

import { useEffect, useState } from "react";

type Feedback = {
  _id: string;
  rating: number;
  comment?: string;
  anonymous: boolean;
  createdAt: string;
};

export default function DashboardPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch("/api/feedback", {
        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFeedbacks(data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();

    // Real-time polling every 3 seconds
    const interval = setInterval(() => {
      fetchFeedbacks();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const totalFeedback = feedbacks.length;

  const averageRating =
    totalFeedback === 0
      ? 0
      : feedbacks.reduce(
          (sum, feedback) => sum + feedback.rating,
          0
        ) / totalFeedback;

  const anonymousCount = feedbacks.filter(
    (feedback) => feedback.anonymous
  ).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 p-8">

      {/* Header */}
      <div className="text-center mb-10">

        <div className="text-5xl mb-3">
          🩸
        </div>

        <h1 className="text-4xl font-bold text-red-600">
          Real-Time Feedback Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Live monitoring of donor feedback
        </p>

        {lastUpdated && (
          <p className="text-sm text-gray-400 mt-2">
            Last updated:{" "}
            {lastUpdated.toLocaleTimeString()}
          </p>
        )}

      </div>


      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-10">

        {/* Total Feedback */}
        <div className="bg-white rounded-3xl shadow-lg p-6 text-center">

          <p className="text-gray-500 mb-2">
            Total Feedback
          </p>

          <h2 className="text-4xl font-bold text-red-600">
            {totalFeedback}
          </h2>

        </div>


        {/* Average Rating */}
        <div className="bg-white rounded-3xl shadow-lg p-6 text-center">

          <p className="text-gray-500 mb-2">
            Average Rating
          </p>

          <h2 className="text-4xl font-bold text-yellow-500">
            {averageRating.toFixed(1)} ⭐
          </h2>

        </div>


        {/* Anonymous Feedback */}
        <div className="bg-white rounded-3xl shadow-lg p-6 text-center">

          <p className="text-gray-500 mb-2">
            Anonymous Feedback
          </p>

          <h2 className="text-4xl font-bold text-purple-600">
            {anonymousCount}
          </h2>

        </div>

      </div>


      {/* Live Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">

        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>

        <span className="text-green-600 font-semibold">
          Live Dashboard
        </span>

      </div>


      {/* Feedback List */}
      <div className="max-w-4xl mx-auto">

        <h2 className="text-2xl font-bold text-gray-800 mb-5">
          Recent Feedback
        </h2>

        {loading ? (

          <div className="text-center text-gray-500">
            Loading feedback...
          </div>

        ) : feedbacks.length === 0 ? (

          <div className="bg-white rounded-xl p-6 text-center text-gray-500">
            No feedback available yet.
          </div>

        ) : (

          <div className="space-y-4">

            {feedbacks.map((feedback) => (

              <div
                key={feedback._id}
                className="
                  bg-white
                  rounded-2xl
                  shadow
                  p-5
                  border
                  border-gray-100
                "
              >

                <div className="flex justify-between items-center mb-3">

                  <span className="text-xl">
                    {"⭐".repeat(feedback.rating)}
                  </span>

                  <span
                    className={
                      feedback.anonymous
                        ? "text-purple-600 font-semibold"
                        : "text-gray-600 font-semibold"
                    }
                  >
                    {feedback.anonymous
                      ? "Anonymous"
                      : "User Feedback"}
                  </span>

                </div>


                {feedback.comment ? (

                  <p className="text-gray-700">
                    {feedback.comment}
                  </p>

                ) : (

                  <p className="text-gray-400 italic">
                    No comment provided
                  </p>

                )}


                <p className="text-xs text-gray-400 mt-3">
                  {new Date(
                    feedback.createdAt
                  ).toLocaleString()}
                </p>

              </div>

            ))}

          </div>

        )}

      </div>

    </main>
  );
}