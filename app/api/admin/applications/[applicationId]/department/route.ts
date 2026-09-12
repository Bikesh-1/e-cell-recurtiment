import { NextResponse } from "next/server";

import {
  tablesDB,
  DATABASE_ID,
  APPLICATIONS_TABLE_ID,
} from "@/lib/appwrite";

import { requireAdmin } from "@/lib/admin";

const departments = [
  "Corporate",
  "Operations",
  "Design & Media",
  "Events",
  "Tech",
];

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
    const { department } = await request.json();

    if (!departments.includes(department)) {
      return NextResponse.json(
        { error: "Invalid department." },
        { status: 400 }
      );
    }

    const application = await tablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: APPLICATIONS_TABLE_ID,
      rowId: applicationId,
    });

    if (application.round1Status !== "selected") {
      return NextResponse.json(
        {
          error:
            "Department can only be assigned to selected candidates.",
        },
        { status: 400 }
      );
    }

    const updatedApplication = await tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: APPLICATIONS_TABLE_ID,
      rowId: applicationId,
      data: {
        department,
        round2Status: "unlocked",
      },
    });

    return NextResponse.json({
      success: true,
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Department assignment error:", error);

    return NextResponse.json(
      { error: "Failed to assign department." },
      { status: 500 }
    );
  }
}