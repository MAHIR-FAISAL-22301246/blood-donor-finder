import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Feedback from "@/models/Feedback";

export async function createFeedback(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    const { rating, comment, anonymous } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be between 1 and 5",
        },
        { status: 400 }
      );
    }

    const feedback = await Feedback.create({
      rating,
      comment: comment || "",
      anonymous: anonymous || false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Feedback submitted successfully",
        data: feedback,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE FEEDBACK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit feedback",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function getFeedbacks() {
  try {
    await dbConnect();

    const feedbacks = await Feedback.find().sort({
      createdAt: -1,
    });

    return NextResponse.json(
      {
        success: true,
        data: feedbacks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET FEEDBACK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch feedback",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
