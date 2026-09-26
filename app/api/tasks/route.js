import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/api";
import { createTask, getTaskList } from "@/lib/service";
import { todayKey } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export const GET = handle(() => getTaskList(todayKey()));

export const POST = handle(async (request) => {
  const task = await createTask(await readJson(request));
  return NextResponse.json(task, { status: 201 });
});
