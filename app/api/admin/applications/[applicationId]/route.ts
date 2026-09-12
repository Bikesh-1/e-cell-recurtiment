import { NextResponse } from "next/server";
import { Query } from "node-appwrite";

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

export async function GET(_: Request, { params }: Props) {
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
      tableId: ROUND1_TABLE_ID,
      queries: [
        Query.equal("applicationId", applicationId),
        Query.limit(1),
      ],
    });

    return NextResponse.json({
      application,
      round1Submission: submissions.rows[0] ?? null,
    });
  } catch (error) {
    console.error("Admin candidate error:", error);

    return NextResponse.json(
      { error: "Failed to fetch candidate." },
      { status: 500 }
    );
  }
}