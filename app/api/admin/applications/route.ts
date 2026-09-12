import { NextResponse } from "next/server";
import { Query } from "node-appwrite";

import {
  tablesDB,
  DATABASE_ID,
  APPLICATIONS_TABLE_ID,
} from "@/lib/appwrite";

import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin.authorized) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: APPLICATIONS_TABLE_ID,
      queries: [
        Query.orderDesc("$createdAt"),
      ],
    });

    return NextResponse.json({
      applications: result.rows,
    });
  } catch (error) {
    console.error(
      "Admin applications error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch applications.",
      },
      { status: 500 }
    );
  }
}