import { NextResponse } from "next/server";
import { Query } from "node-appwrite";

import {
  tablesDB,
  DATABASE_ID,
  APPLICATIONS_TABLE_ID,
  ROUND1_TABLE_ID,
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
      return NextResponse.json({
        exists: false,
        submitted: false,
      });
    }

    const submissions = await tablesDB.listRows({
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

    return NextResponse.json({
      exists: true,
      submitted: submissions.rows.length > 0,
      round1Status: application.round1Status,
      round2Status: application.round2Status,
      finalStatus: application.finalStatus,
    });
  } catch (error) {
    console.error(
      "Application status error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to check application status.",
      },
      { status: 500 }
    );
  }
}