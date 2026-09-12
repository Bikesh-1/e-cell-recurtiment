"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Application = {
  $id: string;
  name: string;
  email: string;
  usn?: string;
  branch?: string;
  year?: number;
  department?: string;
  round1Status: string;
  round2Status: string;
  finalStatus: string;
};

type Submission = {
  $id: string;
  applicationId: string;
  clerkUserId: string;
  taskId: string;
  textAnswer?: string;
  submissionUrl?: string;
  fileId?: string;
  submittedAt?: string;
  score?: number;
  feedback?: string;
  status?: string;
};

export default function Round2ReviewPage() {
  const params = useParams();
  const router = useRouter();

  const applicationId =
    params.applicationId as string;

  const [application, setApplication] =
    useState<Application | null>(null);

  const [submission, setSubmission] =
    useState<Submission | null>(null);

  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadSubmission() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/applications/${applicationId}/round-2`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load Round 2 submission."
          );
        }

        setApplication(data.application);

        const submissionData =
          data.submissions?.[0] ?? null;

        setSubmission(submissionData);

        if (
          submissionData?.score !== undefined &&
          submissionData?.score !== null
        ) {
          setScore(
            String(submissionData.score)
          );
        }

        setFeedback(
          submissionData?.feedback ?? ""
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load submission."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSubmission();
  }, [applicationId]);

  async function evaluate(
    decision:
      | "selected"
      | "waitlisted"
      | "rejected"
  ) {
    if (!submission) {
      setError("No Round 2 submission found.");
      return;
    }

    if (!score.trim()) {
      setError("Please enter a score.");
      return;
    }

    const numericScore = Number(score);

    if (
      !Number.isInteger(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      setError(
        "Score must be between 0 and 100."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/applications/${applicationId}/round-2`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            score: numericScore,
            feedback,
            decision,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to evaluate submission."
        );
      }

      setApplication(data.application);

      setSuccess(
        `Candidate marked as ${decision}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Evaluation failed."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />

          <p className="mt-5 text-gray-400">
            Loading Round 2 submission...
          </p>
        </div>
      </main>
    );
  }

  if (error && !application) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <h1 className="text-3xl font-bold">
            Unable to Load
          </h1>

          <p className="mt-4 text-gray-400">
            {error}
          </p>

          <button
            onClick={() => router.push("/admin")}
            className="mt-7 rounded-xl bg-white px-6 py-3 font-semibold text-black"
          >
            Back to Admin
          </button>
        </div>
      </main>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white md:px-8 md:py-14">
      <div className="mx-auto max-w-5xl">

        {/* Back */}

        <button
          onClick={() =>
            router.push(
              `/admin/applications/${applicationId}`
            )
          }
          className="mb-8 text-sm text-gray-400 transition hover:text-white"
        >
          ← Back to Candidate
        </button>

        {/* Candidate Header */}

        <div className="mb-10">
          <p className="text-sm tracking-[0.2em] text-gray-500">
            ADMIN · ROUND 2 REVIEW
          </p>

          <h1 className="mt-4 text-4xl font-bold">
            {application.name}
          </h1>

          <p className="mt-2 text-gray-400">
            {application.email}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {application.usn && (
              <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300">
                {application.usn}
              </span>
            )}

            {application.branch && (
              <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300">
                {application.branch}
              </span>
            )}

            {application.department && (
              <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300">
                {application.department}
              </span>
            )}

            <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300">
              Round 2: {application.round2Status}
            </span>

            <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300">
              Final: {application.finalStatus}
            </span>
          </div>
        </div>

        {/* No Submission */}

        {!submission ? (
          <section className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-8">
            <h2 className="text-2xl font-semibold">
              No Submission
            </h2>

            <p className="mt-3 text-gray-400">
              This candidate has not submitted their
              Round 2 task yet.
            </p>
          </section>
        ) : (
          <>
            {/* Submission */}

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold">
                  Submission
                </h2>

                {submission.submittedAt && (
                  <span className="text-sm text-gray-500">
                    {new Date(
                      submission.submittedAt
                    ).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                )}
              </div>

              {/* Text */}

              {submission.textAnswer && (
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-500">
                    Text Answer
                  </h3>

                  <div className="mt-3 whitespace-pre-wrap rounded-xl border border-white/10 bg-black p-5 leading-7 text-gray-300">
                    {submission.textAnswer}
                  </div>
                </div>
              )}

              {/* URL */}

              {submission.submissionUrl && (
                <div className="mt-7">
                  <h3 className="text-sm font-medium text-gray-500">
                    Submission URL
                  </h3>

                  <a
                    href={submission.submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block break-all rounded-xl border border-white/10 bg-black p-5 text-gray-300 underline underline-offset-4 transition hover:text-white"
                  >
                    {submission.submissionUrl}
                  </a>
                </div>
              )}

              {/* File */}

              {submission.fileId && (
                <div className="mt-7">
                  <h3 className="text-sm font-medium text-gray-500">
                    Uploaded File
                  </h3>

                  <a
                    href={`/api/admin/files/${submission.fileId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-gray-200"
                  >
                    View / Download File
                  </a>
                </div>
              )}
            </section>

            {/* Evaluation */}

            <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <h2 className="text-2xl font-semibold">
                Final Evaluation
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Evaluate the Round 2 submission and
                assign the final result.
              </p>

              {/* Score */}

              <div className="mt-7">
                <label
                  htmlFor="score"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Score
                </label>

                <input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(event) =>
                    setScore(event.target.value)
                  }
                  placeholder="0 - 100"
                  disabled={saving}
                  className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white outline-none focus:border-white/40 md:w-52"
                />
              </div>

              {/* Feedback */}

              <div className="mt-6">
                <label
                  htmlFor="feedback"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Feedback
                </label>

                <textarea
                  id="feedback"
                  rows={6}
                  value={feedback}
                  onChange={(event) =>
                    setFeedback(event.target.value)
                  }
                  placeholder="Write evaluation feedback..."
                  disabled={saving}
                  className="w-full resize-y rounded-xl border border-white/15 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-white/40"
                />
              </div>

              {/* Messages */}

              {error && (
                <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                  <p className="text-sm text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {success && (
                <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3">
                  <p className="text-sm text-green-400">
                    {success}
                  </p>
                </div>
              )}

              {/* Decisions */}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  disabled={saving}
                  onClick={() =>
                    evaluate("selected")
                  }
                  className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "✓ Select"}
                </button>

                <button
                  disabled={saving}
                  onClick={() =>
                    evaluate("waitlisted")
                  }
                  className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-6 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Waitlist
                </button>

                <button
                  disabled={saving}
                  onClick={() =>
                    evaluate("rejected")
                  }
                  className="rounded-xl border border-red-500/30 bg-red-500/5 px-6 py-3 font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}