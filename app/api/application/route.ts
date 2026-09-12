import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

import {tablesDB,DATABASE_ID,APPLICATIONS_TABLE_ID,} from "@/lib/appwrite";

import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const existing = await tablesDB.listRows(DATABASE_ID,APPLICATIONS_TABLE_ID,
      [
        Query.equal("clerkUserId", user.clerkUserId),
      ]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: true,
        application: existing.rows[0],
        existing: true,
      });
    }

    const application = await tablesDB.createRow(
      DATABASE_ID,
      APPLICATIONS_TABLE_ID,
      ID.unique(),
      {
        clerkUserId: user.clerkUserId,
        name: user.name,
        email: user.email,

        round1Status: "pending",
        round2Status: "locked",
        finalStatus: "pending",
      }
    );

    return NextResponse.json({
      success: true,
      application,
      existing: false,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}