"use client";

import { useEffect, useState } from "react";
import { round1Questions } from "./questions";
import { useRouter } from "next/navigation";

type Application = {
  $id: string;
  round1Status: string;
  round2Status: string;
  finalStatus: string;
};

export default function Round1Page() {
  const router = useRouter();
  const [answers, setAnswers] = useState<string[]>(
    Array(5).fill("")
  );

  const [application, setApplication] = useState<Application | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkApplication();
  }, []);

  const checkApplication = async () => {
    try {
      const response = await fetch(
        "/api/application/status"
      );

      const data = await response.json();

      if (response.ok && data.application) {
        setApplication(data.application);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setChecking(false);
    }
  };

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
      if (
        answers.some(
          (answer) => answer.trim() === ""
        )
      ) {
        throw new Error(
          "Please answer all five questions."
        );
      }

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
          applicationData.error ||
            "Failed to create application."
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
        throw new Error(
          data.error ||
            "Failed to submit Round 1."
        );
      }

      setMessage(
        "Round 1 submitted successfully!"
      );
      setTimeout(() => {
  router.push("/status");
}, 1000);
      await checkApplication();
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

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-gray-400">
          Loading application...
        </p>
      </main>
    );
  }

  // Already submitted
  if (
    application?.round1Status === "submitted" ||
    application?.round1Status === "selected" ||
    application?.round1Status === "rejected"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl text-black">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Round 1 Submitted
          </h1>

          <p className="mt-4 text-gray-400">
            Your Round 1 application has been
            successfully received.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 p-6">
            <p className="text-sm text-gray-500">
              Current Status
            </p>

            <p className="mt-2 text-xl font-semibold capitalize">
              {application.round1Status}
            </p>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Please wait for the E-Cell team to
            complete the evaluation.
          </p>
        </div>
      </main>
    );
  }

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