"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Application = {
  id: string;
  name: string;
  email: string;
  usn: string;
  branch: string;
  year: number | null;
  round1Status: string;
  round2Status: string;
  finalStatus: string;
  department: string;
};

type RoundResult = {
  submittedAt?: string;
  score?: number | null;
  feedback?: string;
  status?: string;
};

type StatusData = {
  application: Application;
  round1: RoundResult | null;
  round2: RoundResult | null;
};

export default function StatusPage() {
  const router = useRouter();

  const [data, setData] =
    useState<StatusData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStatus() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/status",
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Failed to load status."
          );
        }

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load status."
        );
      } finally {
        setLoading(false);
      }
    }

    loadStatus();
  }, []);

  function getStatusClass(status: string) {
    switch (status) {
      case "selected":
        return "border-green-500/20 bg-green-500/10 text-green-400";

      case "rejected":
        return "border-red-500/20 bg-red-500/10 text-red-400";

      case "waitlisted":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

      case "submitted":
        return "border-blue-500/20 bg-blue-500/10 text-blue-400";

      case "unlocked":
        return "border-purple-500/20 bg-purple-500/10 text-purple-400";

      case "locked":
        return "border-white/10 bg-white/5 text-gray-400";

      case "pending":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

      default:
        return "border-white/10 bg-white/5 text-gray-400";
    }
  }

  function formatStatus(status: string) {
    if (!status) return "Not available";

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  function formatDate(date?: string) {
    if (!date) return "";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  // Loading

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />

          <p className="mt-5 text-gray-400">
            Loading your application...
          </p>
        </div>
      </main>
    );
  }

  // Error

  if (error || !data) {
    return (
      <main className="min-h-screen bg-black px-6 text-white flex items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <h1 className="text-3xl font-bold">
            Application Status
          </h1>

          <p className="mt-4 text-gray-400">
            {error || "Unable to load status."}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="mt-7 rounded-xl bg-white px-6 py-3 font-semibold text-black"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const { application, round1, round2 } =
    data;

  const round2Unlocked =
    application.round1Status ===
      "selected" &&
    application.round2Status ===
      "unlocked";

  const finalDecision =
    application.finalStatus === "selected" ||
    application.finalStatus === "rejected" ||
    application.finalStatus === "waitlisted";

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white md:px-8 md:py-14">
      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <div className="mb-10">
          <p className="text-sm tracking-[0.2em] text-gray-500">
            E-CELL RECRUITMENT
          </p>

          <h1 className="mt-4 text-4xl font-bold md:text-5xl">
            Application Status
          </h1>

          <p className="mt-3 text-gray-400">
            Track your recruitment journey.
          </p>
        </div>

        {/* Candidate Card */}

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div>
              <p className="text-sm text-gray-500">
                Candidate
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                {application.name}
              </h2>

              <p className="mt-1 text-gray-400">
                {application.email}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {application.usn && (
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                  {application.usn}
                </span>
              )}

              {application.branch && (
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                  {application.branch}
                </span>
              )}

              {application.year && (
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                  Year {application.year}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Progress */}

        <section className="mt-8">
          <h2 className="mb-5 text-2xl font-semibold">
            Recruitment Progress
          </h2>

          <div className="grid gap-5 md:grid-cols-3">

            {/* Round 1 */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    STEP 01
                  </p>

                  <h3 className="mt-2 text-xl font-semibold">
                    Round 1
                  </h3>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                    application.round1Status
                  )}`}
                >
                  {formatStatus(
                    application.round1Status
                  )}
                </span>
              </div>

              {round1?.submittedAt && (
                <p className="mt-6 text-xs text-gray-600">
                  Submitted{" "}
                  {formatDate(
                    round1.submittedAt
                  )}
                </p>
              )}

              {round1?.score !== null &&
                round1?.score !== undefined && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-500">
                      Score
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {round1.score}
                      <span className="text-base text-gray-600">
                        /100
                      </span>
                    </p>
                  </div>
                )}
            </div>

            {/* Round 2 */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    STEP 02
                  </p>

                  <h3 className="mt-2 text-xl font-semibold">
                    Round 2
                  </h3>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                    application.round2Status
                  )}`}
                >
                  {formatStatus(
                    application.round2Status
                  )}
                </span>
              </div>

              {application.department && (
                <div className="mt-6">
                  <p className="text-sm text-gray-500">
                    Department
                  </p>

                  <p className="mt-1 font-medium text-gray-300">
                    {application.department}
                  </p>
                </div>
              )}

              {round2?.score !== null &&
                round2?.score !== undefined && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-500">
                      Score
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {round2.score}
                      <span className="text-base text-gray-600">
                        /100
                      </span>
                    </p>
                  </div>
                )}

              {round2?.submittedAt && (
                <p className="mt-6 text-xs text-gray-600">
                  Submitted{" "}
                  {formatDate(
                    round2.submittedAt
                  )}
                </p>
              )}
            </div>

            {/* Final */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    STEP 03
                  </p>

                  <h3 className="mt-2 text-xl font-semibold">
                    Final Result
                  </h3>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                    application.finalStatus
                  )}`}
                >
                  {formatStatus(
                    application.finalStatus
                  )}
                </span>
              </div>

              <p className="mt-6 text-sm leading-6 text-gray-500">
                Your final recruitment result will
                appear here after Round 2 evaluation.
              </p>
            </div>
          </div>
        </section>

        {/* Department */}

        {application.department && (
          <section className="mt-8 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 md:p-8">
            <p className="text-sm text-purple-400">
              Assigned Department
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {application.department}
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-gray-400">
              You have been assigned to the{" "}
              <span className="text-gray-200">
                {application.department}
              </span>{" "}
              department for Round 2.
            </p>
          </section>
        )}

        {/* Round 2 CTA */}

        {round2Unlocked && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <h2 className="text-2xl font-semibold">
              Round 2 is Ready
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-gray-400">
              Your Round 2 task has been assigned.
              Open the task page to view the
              instructions and submit your work.
            </p>

            <button
              onClick={() =>
                router.push("/round-2")
              }
              className="mt-6 rounded-xl bg-white px-7 py-3 font-semibold text-black transition hover:bg-gray-200"
            >
              Open Round 2 →
            </button>
          </section>
        )}

        {/* Waiting for Round 2 */}

        {application.round1Status ===
          "selected" &&
          application.round2Status ===
            "locked" && (
            <section className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
              <h2 className="text-xl font-semibold text-yellow-400">
                Round 2 Pending
              </h2>

              <p className="mt-2 text-gray-400">
                You have been selected for Round 2.
                The task will appear here once the
                admin assigns your department.
              </p>
            </section>
          )}

        {/* Round 1 Feedback */}

        {round1?.feedback && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <p className="text-sm text-gray-500">
              ROUND 1 FEEDBACK
            </p>

            <p className="mt-4 whitespace-pre-wrap leading-7 text-gray-300">
              {round1.feedback}
            </p>
          </section>
        )}

        {/* Round 2 Feedback */}

        {round2?.feedback && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <p className="text-sm text-gray-500">
              ROUND 2 FEEDBACK
            </p>

            <p className="mt-4 whitespace-pre-wrap leading-7 text-gray-300">
              {round2.feedback}
            </p>
          </section>
        )}

        {/* Final Result */}

        {finalDecision && (
          <section
            className={`mt-8 rounded-2xl border p-8 ${
              application.finalStatus ===
              "selected"
                ? "border-green-500/20 bg-green-500/5"
                : application.finalStatus ===
                  "waitlisted"
                ? "border-yellow-500/20 bg-yellow-500/5"
                : "border-red-500/20 bg-red-500/5"
            }`}
          >
            <p className="text-sm text-gray-500">
              FINAL RESULT
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {application.finalStatus ===
              "selected"
                ? "Congratulations! 🎉"
                : application.finalStatus ===
                  "waitlisted"
                ? "You are Waitlisted"
                : "Application Not Selected"}
            </h2>

            <p className="mt-3 leading-7 text-gray-400">
              {application.finalStatus ===
              "selected"
                ? "Congratulations! You have been selected for E-Cell."
                : application.finalStatus ===
                  "waitlisted"
                ? "Your application has been placed on the waitlist. Further updates will be shared if your status changes."
                : "Thank you for participating in the E-Cell recruitment process. We appreciate your time and effort."}
            </p>
          </section>
        )}

        {/* Bottom */}

        <div className="mt-10 flex justify-center">
          <button
            onClick={() =>
              window.location.reload()
            }
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            Refresh Status
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-gray-600">
          E-Cell Recruitment Portal
        </p>
      </div>
    </main>
  );
}