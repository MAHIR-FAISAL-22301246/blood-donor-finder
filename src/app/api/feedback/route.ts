import { NextRequest } from "next/server";
import {
  createFeedback,
  getFeedbacks,
} from "@/controllers/feedbackController";

export async function GET() {
  return getFeedbacks();
}

export async function POST(req: NextRequest) {
  return createFeedback(req);
}