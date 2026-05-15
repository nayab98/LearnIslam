import { NextResponse } from "next/server";
import { getStaticHadithCounts } from "@/lib/hadith-store";

export function GET() {
  return NextResponse.json({ counts: getStaticHadithCounts() });
}
