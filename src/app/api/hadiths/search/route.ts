import { NextRequest, NextResponse } from "next/server";
import { searchStaticHadiths } from "@/lib/hadith-store";

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") ?? "";
  const limit = Number(searchParams.get("limit") ?? 50);

  return NextResponse.json({ hadiths: searchStaticHadiths(q, limit) });
}
