import { NextResponse } from "next/server";
import { Query } from "node-appwrite";

import {
  tablesDB,
  DATABASE_ID,
  APPLICATIONS_TABLE_ID,
  ROUND2_SUBMISSIONS_TABLE_ID,
} from "@/lib/appwrite";

import { requireAdmin } from "@/lib/admin";

type Props = {
  params: Promise<{
    applicationId: string;
  }>;
};

export async function GET(
  _: Request,
  { params }: Props
) {
  try {
    const admin = await requireAdmin();

    if (!admin.authorized) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { applicationId } = await params;

    const application = await tablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: APPLICATIONS_TABLE_ID,
      rowId: applicationId,
    });

    const submissions = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: ROUND2_SUBMISSIONS_TABLE_ID,
      queries: [
        Query.equal(
          "applicationId",
          applicationId
        ),
      ],
    });

    return NextResponse.json({
      application,
      submissions: submissions.rows,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load Round 2 review." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: Props
) {
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
    const feedback = String(
      body.feedback ?? ""
    ).trim();

    const decision = String(
      body.decision ?? ""
    );

    if (
      !Number.isInteger(score) ||
      score < 0 ||
      score > 100
    ) {
      return NextResponse.json(
        {
          error:
            "Score must be between 0 and 100.",
        },
        { status: 400 }
      );
    }

    if (
      !["selected", "rejected", "waitlisted"].includes(
        decision
      )
    ) {
      return NextResponse.json(
        { error: "Invalid decision." },
        { status: 400 }
      );
    }

    const submissions = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: ROUND2_SUBMISSIONS_TABLE_ID,
      queries: [
        Query.equal(
          "applicationId",
          applicationId
        ),
        Query.limit(1),
      ],
    });

    const submission = submissions.rows[0];

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found." },
        { status: 404 }
      );
    }

    await tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: ROUND2_SUBMISSIONS_TABLE_ID,
      rowId: submission.$id,
      data: {
        score,
        feedback,
        status: decision,
      },
    });

    const application =
      await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: APPLICATIONS_TABLE_ID,
        rowId: applicationId,
        data: {
          round2Status: decision,
          finalStatus: decision,
        },
      });

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error(
      "Round 2 evaluation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to evaluate Round 2.",
      },
      { status: 500 }
    );
  }
}