import { NextResponse } from "next/server";
import { Query } from "node-appwrite";

import {
  tablesDB,
  DATABASE_ID,
  APPLICATIONS_TABLE_ID,
  ROUND1_TABLE_ID,
  ROUND2_SUBMISSIONS_TABLE_ID,
} from "@/lib/appwrite";

import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find candidate application
    const applications = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: APPLICATIONS_TABLE_ID,
      queries: [
        Query.equal(
          "clerkUserId",
          user.clerkUserId
        ),
        Query.limit(1),
      ],
    });

    const application = applications.rows[0];

    if (!application) {
      return NextResponse.json(
        {
          error: "Application not found.",
        },
        { status: 404 }
      );
    }

    // Round 1 submission
    const round1Submissions =
      await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: ROUND1_TABLE_ID,
        queries: [
          Query.equal(
            "applicationId",
            application.$id
          ),
          Query.limit(1),
        ],
      });

    const round1Submission =
      round1Submissions.rows[0] ?? null;

    // Round 2 submission
    const round2Submissions =
      await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: ROUND2_SUBMISSIONS_TABLE_ID,
        queries: [
          Query.equal(
            "applicationId",
            application.$id
          ),
          Query.limit(1),
        ],
      });

    const round2Submission =
      round2Submissions.rows[0] ?? null;

    return NextResponse.json({
      application: {
        id: application.$id,
        name: application.name,
        email: application.email,
        usn: application.usn ?? "",
        branch: application.branch ?? "",
        year: application.year ?? null,

        round1Status:
          application.round1Status,

        round2Status:
          application.round2Status,

        finalStatus:
          application.finalStatus,

        department:
          application.department ?? "",
      },

      round1: round1Submission
        ? {
            submittedAt:
              round1Submission.submittedAt,

            score:
              round1Submission.score ?? null,

            feedback:
              round1Submission.feedback ?? "",
          }
        : null,

      round2: round2Submission
        ? {
            submittedAt:
              round2Submission.submittedAt,

            score:
              round2Submission.score ?? null,

            feedback:
              round2Submission.feedback ?? "",

            status:
              round2Submission.status ?? "submitted",
          }
        : null,
    });
  } catch (error) {
    console.error(
      "Candidate status error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load application status.",
      },
      { status: 500 }
    );
  }
}