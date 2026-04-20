import { NextResponse } from "next/server";
import { ApiError } from "./api-types";

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function errorResponse(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[api] unhandled", err);
  return NextResponse.json({ error: "internal_error" }, { status: 500 });
}
