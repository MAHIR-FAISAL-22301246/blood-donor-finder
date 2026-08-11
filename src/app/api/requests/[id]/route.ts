import { NextRequest, NextResponse } from "next/server";
import { updateRequestStatus } from "@/controllers/requestController";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!["open", "fulfilled", "cancelled"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status",
        },
        { status: 400 }
      );
    }

    return updateRequestStatus(id,status);
    
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update request",
        error: String(error),
      },
      { status: 500 }
    );
  }
}


