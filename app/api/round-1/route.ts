import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

import {
  tablesDB,
  DATABASE_ID,
  APPLICATIONS_TABLE_ID,
  ROUND1_TABLE_ID,
} from "@/lib/appwrite";

import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      applicationId,
      answers,
    } = body;

    // Basic validation
    if (
      !applicationId ||
      !Array.isArray(answers) ||
      answers.length !== 5
    ) {
      return NextResponse.json(
        {
          error:
            "Please answer all five questions.",
        },
        { status: 400 }
      );
    }

    // Make sure all answers contain something
    const hasEmptyAnswer = answers.some(
      (answer: unknown) =>
        typeof answer !== "string" ||
        answer.trim().length === 0
    );

    if (hasEmptyAnswer) {
      return NextResponse.json(
        {
          error:
            "All five questions are required.",
        },
        { status: 400 }
      );
    }

    // Verify application belongs to current user
    const application = await tablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: APPLICATIONS_TABLE_ID,
      rowId: applicationId,
    });

    if (
      application.clerkUserId !==
      user.clerkUserId
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Check if Round 1 is already submitted
    const existing = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: ROUND1_TABLE_ID,
      queries: [
        Query.equal(
          "applicationId",
          applicationId
        ),
      ],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        {
          error:
            "Round 1 has already been submitted.",
        },
        { status: 409 }
      );
    }

    // Create Round 1 submission
    const submission =
      await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: ROUND1_TABLE_ID,
        rowId: ID.unique(),
        data: {
          applicationId,
          clerkUserId: user.clerkUserId,

          answer1: answers[0],
          answer2: answers[1],
          answer3: answers[2],
          answer4: answers[3],
          answer5: answers[4],

          submittedAt:
            new Date().toISOString(),
        },
      });

    // Update application status
    await tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: APPLICATIONS_TABLE_ID,
      rowId: applicationId,
      data: {
        round1Status: "submitted",
      },
    });

    return NextResponse.json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error(
      "Round 1 submission error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to submit Round 1.",
      },
      {
        status: 500,
      }
    );
  }
}