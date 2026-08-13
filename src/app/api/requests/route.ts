import { NextRequest, NextResponse } from "next/server";
import { getBloodRequests, createBloodRequest } from "@/controllers/requestController";

export async function GET(req: NextRequest) {
  return getBloodRequests(req);
}

export async function POST(req: NextRequest) {
  return createBloodRequest(req);
}