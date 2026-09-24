import { AppError } from "./errors";
import { errorResponse } from "./response";

export function withErrorHandler(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("[API Error Handler]:", error);
      if (error instanceof AppError || error?.isOperational) {
        return errorResponse(
          error.message,
          error.statusCode || 400,
          error.code,
          error.details
        );
      }

      if (error?.statusCode || error?.status) {
        return errorResponse(
          error.message,
          error.statusCode || error.status,
          error.code || "BAD_REQUEST",
          error.details
        );
      }

      if (error?.name === "ValidationError") {
        const fieldErrors = Object.keys(error.errors || {}).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {});

        const firstMessage = Object.values(fieldErrors)[0] || "Validation failed";
        return errorResponse(firstMessage, 400, "VALIDATION_ERROR", fieldErrors);
      }

      if (error?.name === "CastError") {
        return errorResponse(
          `Invalid identifier format for ${error.path || "resource"}`,
          400,
          "INVALID_IDENTIFIER",
          { path: error.path, value: error.value }
        );
      }

      if (error?.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || "field";
        const value = error.keyValue ? error.keyValue[field] : undefined;
        return errorResponse(
          `Duplicate value: '${field}' already exists.`,
          409,
          "DUPLICATE_RESOURCE",
          { field, value }
        );
      }

      if (error instanceof SyntaxError && error.message.includes("JSON")) {
        return errorResponse(
          "Malformed JSON payload in request body.",
          400,
          "MALFORMED_JSON"
        );
      }

      return errorResponse(
        "An unexpected error occurred. Please try again later.",
        500,
        "INTERNAL_SERVER_ERROR"
      );
    }
  };
}