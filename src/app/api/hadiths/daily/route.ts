import { NextResponse } from "next/server";
import { getStaticDailyHadith } from "@/lib/hadith-store";

export function GET() {
  return NextResponse.json({ hadith: getStaticDailyHadith() });
}
