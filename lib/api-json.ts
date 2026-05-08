import { NextResponse } from "next/server";

/** Plan0 §15–20 — consistent JSON envelope for app APIs (webhooks / health may differ). */
export type ApiSuccess<T> = { data: T; error: null };
export type ApiFailure = { data: null; error: { message: string; code?: string } };

export function apiOk<T>(data: T, init?: ResponseInit): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data, error: null } satisfies ApiSuccess<T>, init);
}

export function apiErr(message: string, status = 400, code?: string): NextResponse<ApiFailure> {
  return NextResponse.json(
    { data: null, error: { message, ...(code ? { code } : {}) } } satisfies ApiFailure,
    { status },
  );
}
