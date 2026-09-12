"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const departments = [
  "Corporate",
  "Operations",
  "Design & Media",
  "Events",
  "Tech",
];

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
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  answer5: string;
  score?: number;
  feedback?: string;
};

export default function CandidateReviewPage() {
  const params = useParams();
  const router = useRouter();

  const applicationId = params.applicationId as string;

  const [application, setApplication] =
    useState<Application | null>(null);

  const [submission, setSubmission] =
    useState<Submission | null>(null);

  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [department, setDepartment] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCandidate() {
      try {
        const response = await fetch(
          `/api/admin/applications/${applicationId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setApplication(data.application);
        setSubmission(data.round1Submission);

        if (data.round1Submission?.score !== undefined) {
          setScore(String(data.round1Submission.score));
        }

        setFeedback(data.round1Submission?.feedback ?? "");
        setDepartment(data.application.department ?? "");
      } catch (error) {
        console.error(error);
        setMessage("Failed to load candidate.");
      } finally {
        setLoading(false);
      }
    }

    loadCandidate();
  }, [applicationId]);

  async function evaluate(decision: "selected" | "rejected") {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/applications/${applicationId}/evaluate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            score,
            feedback,
            decision,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setApplication(data.application);

      setMessage(
        decision === "selected"
          ? "Candidate selected."
          : "Candidate rejected."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function assignDepartment() {
    if (!department) {
      setMessage("Please select a department.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/applications/${applicationId}/department`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            department,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setApplication(data.application);

      setMessage("Department assigned. Round 2 unlocked.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to assign department."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading candidate...
      </main>
    );
  }

  if (!application || !submission) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <p>{message || "Candidate not found."}</p>
      </main>
    );
  }

  const answers = [
    submission.answer1,
    submission.answer2,
    submission.answer3,
    submission.answer4,
    submission.answer5,
  ];

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.push("/admin")}
          className="text-gray-400 hover:text-white mb-8"
        >
          ← Back to Admin
        </button>

        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            {application.name}
          </h1>

          <p className="text-gray-400 mt-2">
            {application.email}
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <span className="px-3 py-1 rounded-full bg-white/10">
              {application.usn || "USN not provided"}
            </span>

            <span className="px-3 py-1 rounded-full bg-white/10">
              {application.branch || "Branch not provided"}
            </span>

            <span className="px-3 py-1 rounded-full bg-white/10">
              Year {application.year || "N/A"}
            </span>

            <span className="px-3 py-1 rounded-full bg-white/10">
              {application.round1Status}
            </span>
          </div>
        </div>

        {/* Answers */}

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">
            Round 1 Answers
          </h2>

          {answers.map((answer, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <p className="text-gray-400 mb-3">
                Question {index + 1}
              </p>

              <p className="leading-7 whitespace-pre-wrap">
                {answer}
              </p>
            </div>
          ))}
        </section>

        {/* Evaluation */}

        <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-semibold mb-6">
            Evaluation
          </h2>

          <label className="block text-sm text-gray-400 mb-2">
            Score (0–100)
          </label>

          <input
            type="number"
            min="0"
            max="100"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full md:w-48 bg-black border border-white/20 rounded-lg px-4 py-3 outline-none"
          />

          <label className="block text-sm text-gray-400 mt-6 mb-2">
            Feedback
          </label>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 outline-none"
            placeholder="Write feedback..."
          />

          <div className="flex gap-4 mt-6">
            <button
              disabled={saving}
              onClick={() => evaluate("selected")}
              className="px-6 py-3 rounded-lg bg-white text-black font-semibold disabled:opacity-50"
            >
              Select Candidate
            </button>

            <button
              disabled={saving}
              onClick={() => evaluate("rejected")}
              className="px-6 py-3 rounded-lg border border-red-500/40 text-red-400 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </section>

        {/* Department */}

        {application.round1Status === "selected" && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold mb-6">
              Assign Department
            </h2>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-black border border-white/20 rounded-lg px-4 py-3"
            >
              <option value="">Select department</option>

              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              disabled={saving}
              onClick={assignDepartment}
              className="mt-5 px-6 py-3 rounded-lg bg-white text-black font-semibold disabled:opacity-50"
            >
              Assign & Unlock Round 2
            </button>
          </section>
        )}

        {message && (
          <div className="mt-6 rounded-lg border border-white/10 p-4">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}