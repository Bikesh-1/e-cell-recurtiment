import { NextResponse } from "next/server";

import {
  storage,
  ROUND2_BUCKET_ID,
} from "@/lib/appwrite";

import { requireAdmin } from "@/lib/admin";

type Props = {
  params: Promise<{
    fileId: string;
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

    const { fileId } = await params;

    const file = await storage.getFileView({
      bucketId: ROUND2_BUCKET_ID,
      fileId,
    });

    return new NextResponse(file as BodyInit, {
      headers: {
        "Content-Type":
          "application/octet-stream",
        "Content-Disposition":
          `inline; filename="submission-${fileId}"`,
      },
    });
  } catch (error) {
    console.error(
      "Admin file access error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to access file." },
      { status: 404 }
    );
  }
}