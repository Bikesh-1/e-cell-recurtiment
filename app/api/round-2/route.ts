import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

import {
  tablesDB,
  storage,
  DATABASE_ID,
  APPLICATIONS_TABLE_ID,
  ROUND2_TASKS_TABLE_ID,
  ROUND2_SUBMISSIONS_TABLE_ID,
  ROUND2_BUCKET_ID,
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
        Query.equal("clerkUserId", user.clerkUserId),
        Query.limit(1),
      ],
    });

    const application = applications.rows[0];

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    if (
      application.round1Status !== "selected" ||
      application.round2Status !== "unlocked"
    ) {
      return NextResponse.json(
        { error: "Round 2 is not available." },
        { status: 403 }
      );
    }

    if (!application.department) {
      return NextResponse.json(
        { error: "Department not assigned." },
        { status: 403 }
      );
    }

    const tasks = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: ROUND2_TASKS_TABLE_ID,
      queries: [
        Query.equal(
          "department",
          application.department
        ),
        Query.equal("active", true),
        Query.limit(1),
      ],
    });

    const task = tasks.rows[0];

    if (!task) {
      return NextResponse.json(
        { error: "No active task found." },
        { status: 404 }
      );
    }

    const submissions = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: ROUND2_SUBMISSIONS_TABLE_ID,
      queries: [
        Query.equal(
          "applicationId",
          application.$id
        ),
        Query.equal("taskId", task.$id),
        Query.limit(1),
      ],
    });

    return NextResponse.json({
      application: {
        id: application.$id,
        name: application.name,
        department: application.department,
      },
      task,
      submission: submissions.rows[0] ?? null,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load Round 2." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const textAnswer =
      String(formData.get("textAnswer") ?? "").trim();

    const submissionUrl =
      String(formData.get("submissionUrl") ?? "").trim();

    const file = formData.get("file");

    const applications = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: APPLICATIONS_TABLE_ID,
      queries: [
        Query.equal("clerkUserId", user.clerkUserId),
        Query.limit(1),
      ],
    });

    const application = applications.rows[0];

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    if (
      application.round1Status !== "selected" ||
      application.round2Status !== "unlocked"
    ) {
      return NextResponse.json(
        { error: "Round 2 is locked." },
        { status: 403 }
      );
    }

    if (!application.department) {
      return NextResponse.json(
        { error: "Department not assigned." },
        { status: 403 }
      );
    }

    const tasks = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: ROUND2_TASKS_TABLE_ID,
      queries: [
        Query.equal(
          "department",
          application.department
        ),
        Query.equal("active", true),
        Query.limit(1),
      ],
    });

    const task = tasks.rows[0];

    if (!task) {
      return NextResponse.json(
        { error: "Task not found." },
        { status: 404 }
      );
    }

    // Prevent duplicate submission
    const existing = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: ROUND2_SUBMISSIONS_TABLE_ID,
      queries: [
        Query.equal(
          "applicationId",
          application.$id
        ),
        Query.equal("taskId", task.$id),
        Query.limit(1),
      ],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        {
          error:
            "You have already submitted this task.",
        },
        { status: 409 }
      );
    }

    const hasFile = file instanceof File && file.size > 0;

    if (
      task.submissionType === "text" &&
      !textAnswer
    ) {
      return NextResponse.json(
        { error: "Answer is required." },
        { status: 400 }
      );
    }

    if (
      task.submissionType === "url" &&
      !submissionUrl
    ) {
      return NextResponse.json(
        { error: "Submission URL is required." },
        { status: 400 }
      );
    }

    if (
      task.submissionType === "file" &&
      !hasFile
    ) {
      return NextResponse.json(
        { error: "File is required." },
        { status: 400 }
      );
    }

    if (
      task.submissionType === "mixed" &&
      !textAnswer &&
      !submissionUrl &&
      !hasFile
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide an answer, URL or file.",
        },
        { status: 400 }
      );
    }

    let fileId = "";

    if (hasFile) {
      const maxSize = 10 * 1024 * 1024;

      if (file.size > maxSize) {
        return NextResponse.json(
          {
            error:
              "File size must be less than 10 MB.",
          },
          { status: 400 }
        );
      }

      const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "application/zip",
        "application/x-zip-compressed",
      ];

      if (
        file.type &&
        !allowedTypes.includes(file.type)
      ) {
        return NextResponse.json(
          {
            error:
              "Unsupported file type. Use PDF, PNG, JPG or ZIP.",
          },
          { status: 400 }
        );
      }

      const uploadedFile = await storage.createFile({
        bucketId: ROUND2_BUCKET_ID,
        fileId: ID.unique(),
        file,
      });

      fileId = uploadedFile.$id;
    }

    const submission = await tablesDB.createRow({
      databaseId: DATABASE_ID,
      tableId: ROUND2_SUBMISSIONS_TABLE_ID,
      rowId: ID.unique(),
      data: {
        applicationId: application.$id,
        clerkUserId: user.clerkUserId,
        taskId: task.$id,
        textAnswer,
        submissionUrl,
        fileId,
        submittedAt: new Date().toISOString(),
        status: "submitted",
      },
    });

    await tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: APPLICATIONS_TABLE_ID,
      rowId: application.$id,
      data: {
        round2Status: "submitted",
      },
    });

    return NextResponse.json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("Round 2 submission error:", error);

    return NextResponse.json(
      { error: "Failed to submit Round 2." },
      { status: 500 }
    );
  }
}