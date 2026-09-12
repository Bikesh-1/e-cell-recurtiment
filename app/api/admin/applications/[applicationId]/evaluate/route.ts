import { NextResponse } from "next/server";

import {
  tablesDB,
  DATABASE_ID,
  APPLICATIONS_TABLE_ID,
  ROUND1_TABLE_ID,
} from "@/lib/appwrite";

import { requireAdmin } from "@/lib/admin";

type Props = {
  params: Promise<{
    applicationId: string;
  }>;
};

export async function POST(request: Request, { params }: Props) {
  try {
    const admin = await requireAdmin();

    if (!admin.authorized) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { applicationId } = await params;

    const body = await request.json();

    const score = Number(body.score);
    const feedback = String(body.feedback ?? "").trim();
    const decision = String(body.decision ?? "");

    if (!Number.isInteger(score) || score < 0 || score > 100) {
      return NextResponse.json(
        { error: "Score must be between 0 and 100." },
        { status: 400 }
      );
    }

    if (!["selected", "rejected"].includes(decision)) {
      return NextResponse.json(
        { error: "Invalid decision." },
        { status: 400 }
      );
    }

    const application = await tablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: APPLICATIONS_TABLE_ID,
      rowId: applicationId,
    });

    const submissions = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: ROUND1_TABLE_ID,
      queries: [
        // Query.equal("applicationId", applicationId)
      ],
    });

    const submission = submissions.rows.find(
      (row) => row.applicationId === applicationId
    );

    if (!submission) {
      return NextResponse.json(
        { error: "Round 1 submission not found." },
        { status: 404 }
      );
    }

    await tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: ROUND1_TABLE_ID,
      rowId: submission.$id,
      data: {
        score,
        feedback,
      },
    });

    const updatedApplication = await tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: APPLICATIONS_TABLE_ID,
      rowId: applicationId,
      data: {
        round1Status: decision,
        round2Status:
          decision === "selected" ? "locked" : "locked",
      },
    });

    return NextResponse.json({
      success: true,
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Evaluation error:", error);

    return NextResponse.json(
      { error: "Failed to evaluate candidate." },
      { status: 500 }
    );
  }
}