"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Task = {
  $id: string;
  department: string;
  title: string;
  description: string;
  instructions?: string;
  submissionType: "text" | "url" | "file" | "mixed";
  deadline?: string;
};

type Submission = {
  $id: string;
  textAnswer?: string;
  submissionUrl?: string;
  fileId?: string;
  submittedAt?: string;
  status?: string;
};

export default function Round2Page() {
  const [task, setTask] = useState<Task | null>(null);
  const [department, setDepartment] = useState("");

  const [textAnswer, setTextAnswer] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [submission, setSubmission] =
    useState<Submission | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadRound2() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/round-2", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load Round 2."
          );
        }

        setTask(data.task);
        setDepartment(data.application.department);

        if (data.submission) {
          setSubmission(data.submission);
          setSubmitted(true);

          setTextAnswer(
            data.submission.textAnswer ?? ""
          );

          setSubmissionUrl(
            data.submission.submissionUrl ?? ""
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Round 2."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRound2();
  }, []);

  async function submitTask(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!task) return;

    setError("");
    setSuccess("");

    // Basic frontend validation
    if (
      (task.submissionType === "text" ||
        task.submissionType === "mixed") &&
      !textAnswer.trim() &&
      !submissionUrl.trim() &&
      !file
    ) {
      setError(
        "Please provide your answer, URL or file."
      );
      return;
    }

    if (
      task.submissionType === "url" &&
      !submissionUrl.trim()
    ) {
      setError("Please enter your submission URL.");
      return;
    }

    if (
      task.submissionType === "text" &&
      !textAnswer.trim()
    ) {
      setError("Please write your answer.");
      return;
    }

    if (
      task.submissionType === "file" &&
      !file
    ) {
      setError("Please select a file.");
      return;
    }

    // File size check
    if (file) {
      const maxSize = 10 * 1024 * 1024;

      if (file.size > maxSize) {
        setError(
          "File size must be less than 10 MB."
        );
        return;
      }
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append(
        "textAnswer",
        textAnswer.trim()
      );

      formData.append(
        "submissionUrl",
        submissionUrl.trim()
      );

      if (file) {
        formData.append("file", file);
      }

      const response = await fetch("/api/round-2", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Submission failed."
        );
      }

      setSubmission(data.submission);
      setSubmitted(true);

      setSuccess(
        "Round 2 submitted successfully!"
      );

      setFile(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Submission failed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // -----------------------------
  // Loading
  // -----------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />

          <p className="mt-5 text-gray-400">
            Loading Round 2...
          </p>
        </div>
      </main>
    );
  }

  // -----------------------------
  // Error / Locked
  // -----------------------------

  if (error && !task) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl">
            !
          </div>

          <h1 className="mt-5 text-3xl font-bold">
            Round 2
          </h1>

          <p className="mt-4 leading-7 text-gray-400">
            {error}
          </p>

          <Link
            href="/"
            className="mt-7 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
          >
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  if (!task) {
    return null;
  }

  // -----------------------------
  // Main Page
  // -----------------------------

  return (
    <main className="min-h-screen bg-black text-white px-5 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-4xl">

        {/* Header */}

        <div className="mb-10">
          <p className="text-sm font-medium tracking-[0.2em] text-gray-500">
            E-CELL RECRUITMENT
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
              ROUND 2
            </span>

            {department && (
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                {department}
              </span>
            )}
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            {task.title}
          </h1>

          <p className="mt-4 max-w-2xl text-gray-400">
            Complete the assigned task and submit your
            response before the deadline.
          </p>
        </div>

        {/* Deadline */}

        {task.deadline && (
          <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-4">
            <p className="text-sm text-yellow-400">
              Deadline
            </p>

            <p className="mt-1 text-gray-300">
              {new Date(
                task.deadline
              ).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        )}

        {/* Task Description */}

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <h2 className="text-2xl font-semibold">
            Task
          </h2>

          <p className="mt-5 whitespace-pre-wrap leading-8 text-gray-300">
            {task.description}
          </p>

          {task.instructions && (
            <div className="mt-8 border-t border-white/10 pt-7">
              <h3 className="text-lg font-semibold">
                Instructions
              </h3>

              <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-400">
                {task.instructions}
              </p>
            </div>
          )}
        </section>

        {/* Submission Received */}

        {submitted ? (
          <section className="mt-8 rounded-2xl border border-green-500/20 bg-green-500/5 p-7 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xl text-green-400">
                ✓
              </div>

              <div>
                <h2 className="text-2xl font-semibold">
                  Submission Received
                </h2>

                <p className="mt-2 leading-7 text-gray-400">
                  Your Round 2 task has been
                  successfully submitted. You cannot
                  submit the same task again.
                </p>
              </div>
            </div>

            {submission?.submittedAt && (
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-sm text-gray-500">
                  Submitted on
                </p>

                <p className="mt-1 text-gray-300">
                  {new Date(
                    submission.submittedAt
                  ).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            )}

            {submission?.submissionUrl && (
              <div className="mt-5">
                <p className="text-sm text-gray-500">
                  Submitted URL
                </p>

                <a
                  href={submission.submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block break-all text-gray-300 underline underline-offset-4 hover:text-white"
                >
                  {submission.submissionUrl}
                </a>
              </div>
            )}
          </section>
        ) : (
          /* Submission Form */

          <form
            onSubmit={submitTask}
            className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
          >
            <div className="mb-7">
              <h2 className="text-2xl font-semibold">
                Submit Your Work
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Make sure everything is correct before
                submitting. Duplicate submissions are
                not allowed.
              </p>
            </div>

            {/* Text Answer */}

            {(task.submissionType === "text" ||
              task.submissionType === "mixed") && (
              <div>
                <label
                  htmlFor="textAnswer"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Your Answer
                </label>

                <textarea
                  id="textAnswer"
                  value={textAnswer}
                  onChange={(event) =>
                    setTextAnswer(event.target.value)
                  }
                  rows={10}
                  placeholder="Write your response here..."
                  disabled={submitting}
                  className="w-full resize-y rounded-xl border border-white/15 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-white/40 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            )}

            {/* URL */}

            {(task.submissionType === "url" ||
              task.submissionType === "mixed") && (
              <div
                className={
                  task.submissionType === "mixed"
                    ? "mt-6"
                    : ""
                }
              >
                <label
                  htmlFor="submissionUrl"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Submission URL
                </label>

                <input
                  id="submissionUrl"
                  type="url"
                  value={submissionUrl}
                  onChange={(event) =>
                    setSubmissionUrl(event.target.value)
                  }
                  placeholder="https://github.com/... or https://..."
                  disabled={submitting}
                  className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-white/40 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <p className="mt-2 text-xs text-gray-600">
                  You can submit a GitHub repository,
                  live website or other relevant link.
                </p>
              </div>
            )}

            {/* File */}

            {(task.submissionType === "file" ||
              task.submissionType === "mixed") && (
              <div className="mt-6">
                <label
                  htmlFor="file"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Upload File
                </label>

                <input
                  id="file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.zip"
                  disabled={submitting}
                  onChange={(event) => {
                    const selectedFile =
                      event.target.files?.[0] ?? null;

                    if (selectedFile) {
                      const maxSize =
                        10 * 1024 * 1024;

                      if (
                        selectedFile.size >
                        maxSize
                      ) {
                        setError(
                          "File size must be less than 10 MB."
                        );

                        event.target.value = "";
                        setFile(null);
                        return;
                      }

                      setError("");
                      setFile(selectedFile);
                    } else {
                      setFile(null);
                    }
                  }}
                  className="block w-full cursor-pointer rounded-xl border border-white/15 bg-black text-sm text-gray-400 file:mr-4 file:border-0 file:bg-white file:px-5 file:py-3 file:font-medium file:text-black hover:file:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <p className="mt-2 text-xs text-gray-600">
                  Allowed: PDF, PNG, JPG, JPEG and ZIP.
                  Maximum size: 10 MB.
                </p>

                {file && (
                  <div className="mt-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                    <p className="break-all text-sm text-gray-300">
                      Selected: {file.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {(
                        file.size /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Error */}

            {error && (
              <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                <p className="text-sm text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Success */}

            {success && (
              <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3">
                <p className="text-sm text-green-400">
                  {success}
                </p>
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={submitting}
              className="mt-7 w-full rounded-xl bg-white px-7 py-3.5 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              {submitting
                ? "Submitting..."
                : "Submit Round 2"}
            </button>
          </form>
        )}

        {/* Bottom Note */}

        <p className="mt-8 text-center text-xs leading-6 text-gray-600">
          Please ensure your submission is final before
          submitting. You will not be able to submit the
          same Round 2 task again.
        </p>
      </div>
    </main>
  );
}