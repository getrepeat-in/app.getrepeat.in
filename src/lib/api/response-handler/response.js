import { NextResponse } from "next/server";

export function successResponse(
  data = null,
  message = "Operation completed successfully.",
  status = 200,
  extra = {}
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      ...extra,
    },
    { status }
  );
}

export function paginatedResponse(
  data = [],
  meta = { page: 1, limit: 10, totalCount: 0, totalPages: 1 },
  message = "Data fetched successfully.",
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      meta,
    },
    { status }
  );
}

export function errorResponse(
  message = "Internal Server Error",
  status = 500,
  code = "INTERNAL_SERVER_ERROR",
  details = null
) {
  return NextResponse.json(
    {
      success: false,
      message,
      code,
      ...(details !== null && details !== undefined && { details }),
    },
    { status }
  );
}