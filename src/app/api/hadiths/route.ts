import { NextRequest, NextResponse } from "next/server";
import { getStaticHadithPage } from "@/lib/hadith-store";

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tier = searchParams.get("tier") ?? "must_know";
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 25);

  return NextResponse.json(getStaticHadithPage(tier, page, pageSize));
}
