"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function AdminPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<
    Application[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/admin/applications",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load applications."
          );
        }

        setApplications(data.applications || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load applications."
        );
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  const total = applications.length;

  const pending = applications.filter(
    (application) =>
      application.round1Status === "pending"
  ).length;

  const selected = applications.filter(
    (application) =>
      application.round1Status === "selected"
  ).length;

  const rejected = applications.filter(
    (application) =>
      application.round1Status === "rejected"
  ).length;

  const round2Submitted = applications.filter(
    (application) =>
      application.round2Status === "submitted"
  ).length;

  const finalSelected = applications.filter(
    (application) =>
      application.finalStatus === "selected"
  ).length;

  function getStatusClass(status: string) {
    switch (status) {
      case "selected":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      case "waitlisted":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      case "submitted":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      case "unlocked":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";

      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      default:
        return "bg-white/5 text-gray-400 border-white/10";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />

          <p className="mt-5 text-gray-400">
            Loading applications...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <h1 className="text-3xl font-bold">
            Admin Access
          </h1>

          <p className="mt-4 text-red-400">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-7 rounded-xl bg-white px-6 py-3 font-semibold text-black"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white md:px-8 md:py-14">
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-10">
          <p className="text-sm tracking-[0.2em] text-gray-500">
            E-CELL RECRUITMENT
          </p>

          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Admin Dashboard
              </h1>

              <p className="mt-3 text-gray-400">
                Manage applications and evaluate
                candidates.
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500">
              Total
            </p>

            <p className="mt-2 text-3xl font-bold">
              {total}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold">
              {pending}
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/10 bg-green-500/[0.03] p-5">
            <p className="text-sm text-gray-500">
              Selected
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {selected}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-5">
            <p className="text-sm text-gray-500">
              Rejected
            </p>

            <p className="mt-2 text-3xl font-bold text-red-400">
              {rejected}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-500/10 bg-blue-500/[0.03] p-5">
            <p className="text-sm text-gray-500">
              R2 Submitted
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-400">
              {round2Submitted}
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/10 bg-purple-500/[0.03] p-5">
            <p className="text-sm text-gray-500">
              Final Selected
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-400">
              {finalSelected}
            </p>
          </div>
        </div>

        {/* Applications */}

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                Applications
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Review and manage candidates.
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400">
              {applications.length} candidates
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <p className="text-gray-400">
                No applications yet.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead className="border-b border-white/10 bg-white/[0.03]">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                        Candidate
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                        Academic
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                        Round 1
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                        Department
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                        Round 2
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                        Final
                      </th>

                      <th className="px-5 py-4 text-right text-sm font-medium text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {applications.map(
                      (application) => (
                        <tr
                          key={application.$id}
                          className="transition hover:bg-white/[0.02]"
                        >
                          {/* Candidate */}

                          <td className="px-5 py-5">
                            <div>
                              <p className="font-medium">
                                {application.name ||
                                  "Unnamed"}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                {application.email}
                              </p>

                              {application.usn && (
                                <p className="mt-1 text-xs text-gray-600">
                                  {
                                    application.usn
                                  }
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Academic */}

                          <td className="px-5 py-5">
                            <p className="text-sm text-gray-300">
                              {application.branch ||
                                "N/A"}
                            </p>

                            <p className="mt-1 text-xs text-gray-600">
                              Year{" "}
                              {application.year ||
                                "N/A"}
                            </p>
                          </td>

                          {/* Round 1 */}

                          <td className="px-5 py-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                                application.round1Status
                              )}`}
                            >
                              {
                                application.round1Status
                              }
                            </span>
                          </td>

                          {/* Department */}

                          <td className="px-5 py-5">
                            {application.department ? (
                              <span className="text-sm text-gray-300">
                                {
                                  application.department
                                }
                              </span>
                            ) : (
                              <span className="text-sm text-gray-600">
                                Not assigned
                              </span>
                            )}
                          </td>

                          {/* Round 2 */}

                          <td className="px-5 py-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                                application.round2Status
                              )}`}
                            >
                              {
                                application.round2Status
                              }
                            </span>
                          </td>

                          {/* Final */}

                          <td className="px-5 py-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                                application.finalStatus
                              )}`}
                            >
                              {
                                application.finalStatus
                              }
                            </span>
                          </td>

                          {/* Action */}

                          <td className="px-5 py-5 text-right">
                            <div className="flex justify-end gap-2">

                              {/* Round 1 Review */}

                              <button
                                onClick={() =>
                                  router.push(
                                    `/admin/applications/${application.$id}`
                                  )
                                }
                                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
                              >
                                Review R1
                              </button>

                              {/* Round 2 Review */}

                              {application.round2Status ===
                                "submitted" && (
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/admin/applications/${application.$id}/round-2`
                                    )
                                  }
                                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-200"
                                >
                                  Review R2
                                </button>
                              )}

                              {/* Waiting for Round 2 */}

                              {application.round1Status ===
                                "selected" &&
                                application.round2Status !==
                                  "submitted" &&
                                application.round2Status !==
                                  "selected" &&
                                application.round2Status !==
                                  "rejected" &&
                                application.round2Status !==
                                  "waitlisted" && (
                                  <span className="flex items-center px-2 text-xs text-gray-600">
                                    Waiting for R2
                                  </span>
                                )}

                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Footer */}

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-center text-xs text-gray-600">
            E-Cell Recruitment Admin Panel
          </p>
        </div>
      </div>
    </main>
  );
}