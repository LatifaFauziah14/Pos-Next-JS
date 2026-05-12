import { NextResponse } from "next/server";
import { DashboardService } from "@/services/dashboard-service";
import { normalizeDateOnly } from "@/lib/date";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const service = new DashboardService();
  const defaultRange = await service.getDefaultAnalyticsRange();
  const startDate = normalizeDateOnly(searchParams.get("start")) || defaultRange.start;
  const endDate = normalizeDateOnly(searchParams.get("end")) || defaultRange.end;
  const data = await service.getDashboardAnalytics({ startDate, endDate });

  return NextResponse.json({ data });
}
