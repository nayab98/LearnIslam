import { NextRequest, NextResponse } from "next/server";
import { getStaticHadithQuizPool } from "@/lib/hadith-store";
import { HadithDifficulty } from "@/lib/hadith-tiers";

const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

export function GET(request: NextRequest) {
  const difficultyParam = request.nextUrl.searchParams.get("difficulty") ?? "easy";
  const difficulty = VALID_DIFFICULTIES.has(difficultyParam) ? difficultyParam as HadithDifficulty : "easy";

  return NextResponse.json({ hadiths: getStaticHadithQuizPool(difficulty) });
}
