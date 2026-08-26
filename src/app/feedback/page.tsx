"use client";

import { useState } from "react";

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitFeedback = async () => {
    if (rating === 0) {
      setMessage("Please select a rating.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          rating,
          comment,
          anonymous,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage("Feedback submitted successfully!");

        // Clear form after successful submission
        setRating(0);
        setComment("");
        setAnonymous(false);
      } else {
        setMessage(
          data.message || "Failed to submit feedback."
        );
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="bg-[#1e293b] text-white pb-24 pt-12 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <span className="text-red-400">🩸</span>
                Share Your Feedback
              </h1>
              <p className="text-slate-300 text-lg max-w-xl">
                Rate your blood donation experience and share your thoughts.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 pb-12 flex items-center justify-center -mt-20 relative z-20">
        <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-red-600">Feedback Form</h2>
            <p className="text-gray-500 mt-2">Rate your blood donation experience</p>
          </div>
        <div className="mb-6">

          <p className="text-center font-semibold text-gray-700 mb-3">
            Rate Your Experience
          </p>

          <div className="flex justify-center gap-3">

            {[1, 2, 3, 4, 5].map((star) => (

              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="
                  text-5xl
                  transition
                  hover:scale-110
                "
              >
                {star <= rating ? "⭐" : "☆"}
              </button>

            ))}

          </div>

          <p className="text-center mt-4 text-gray-600">

            Selected Rating:{" "}

            <span className="font-bold text-red-600">
              {rating === 0
                ? "None"
                : `${rating}/5`}
            </span>

          </p>

        </div>


        {/* Text Comment */}
        <div className="mb-5">

          <label
            htmlFor="comment"
            className="
              block
              font-semibold
              text-gray-700
              mb-2
            "
          >
            Your Comment
          </label>

          <textarea
            id="comment"
            value={comment}
            onChange={(e) =>
              setComment(e.target.value)
            }
            placeholder="Write your feedback..."
            rows={4}
            className="
              w-full
              border
              border-gray-300
              rounded-xl
              p-3
              resize-none
              focus:outline-none
              focus:ring-2
              focus:ring-red-400
            "
          />

        </div>


        {/* Anonymous Feedback */}
        <label
          className="
            flex
            items-center
            gap-3
            mb-6
            text-gray-700
            cursor-pointer
          "
        >

          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) =>
              setAnonymous(e.target.checked)
            }
            className="w-5 h-5"
          />

          <span>
            Submit feedback anonymously
          </span>

        </label>


        {/* Submit Button */}
        <button
          onClick={submitFeedback}
          disabled={submitting}
          className="
            w-full
            bg-gradient-to-r
            from-red-500
            to-pink-500
            text-white
            py-3
            rounded-xl
            font-semibold
            hover:scale-105
            transition
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {submitting
            ? "Submitting..."
            : "Submit Feedback"}
        </button>


        {/* Result Message */}
        {message && (

          <div
            className={`
              mt-5
              text-center
              p-3
              rounded-xl
              font-medium
              ${
                message.includes("successfully")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }
            `}
          >
            {message}
          </div>

        )}

      </div>
      </main>
    </>
  );
}