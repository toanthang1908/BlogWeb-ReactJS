import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY; // Thay đổi từ API_KEY thành GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "API Key không được cấu hình" }, { status: 500 });
  }
  return NextResponse.json({ apiKey });
}