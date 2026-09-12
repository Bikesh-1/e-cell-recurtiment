"use client";

import { useState } from "react";
import { round1Questions } from "./questions";

export default function Round1Page() {
  const [answers, setAnswers] = useState<string[]>(
    Array(5).fill("")
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAnswerChange = (
    index: number,
    value: string
  ) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  setLoading(true);
  setMessage("");

  try {
    // Create or get application
    const applicationResponse = await fetch(
      "/api/application",
      {
        method: "POST",
      }
    );

    const applicationData =
      await applicationResponse.json();

    if (!applicationResponse.ok) {
      throw new Error(
        applicationData.error
      );
    }

    const applicationId =
      applicationData.application.$id;

    // Submit Round 1
    const response = await fetch(
      "/api/round-1",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          applicationId,
          answers,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    setMessage(
      "🎉 Round 1 submitted successfully!"
    );

  } catch (error) {
    console.error(error);

    setMessage(
      error instanceof Error
        ? error.message
        : "Something went wrong."
    );

  } finally {
    setLoading(false);
  }
};

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">

        <p className="text-sm uppercase tracking-widest text-gray-500">
          E-Cell Recruitment 2026
        </p>

        <h1 className="mt-4 text-4xl font-bold">
          Round 1
        </h1>

        <p className="mt-3 text-gray-400">
          Answer all five questions thoughtfully.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-12 space-y-10"
        >
          {round1Questions.map((item, index) => (
            <div key={item.id}>

              <label className="mb-3 block text-lg font-medium">
                {item.id}. {item.question}
              </label>

              <textarea
                value={answers[index]}
                onChange={(e) =>
                  handleAnswerChange(
                    index,
                    e.target.value
                  )
                }
                placeholder="Write your answer..."
                required
                rows={7}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 outline-none placeholder:text-gray-600 focus:border-white/30"
              />

            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-6 py-4 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Submitting..."
              : "Submit Round 1"}
          </button>

          {message && (
            <p className="rounded-xl border border-white/10 p-4 text-center">
              {message}
            </p>
          )}

        </form>
      </div>
    </main>
  );
}