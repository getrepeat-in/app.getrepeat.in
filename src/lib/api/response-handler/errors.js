export class AppError extends Error {
  constructor(
    message = "Something went wrong. Please try again.",
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
    details = null
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Invalid request. Please verify your data.", details = null) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Please log in first to continue!", details = null) {
    super(message, 401, "UNAUTHORIZED", details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.", details = null) {
    super(message, 403, "FORBIDDEN", details);
  }
}

export class OutletLimitReachedError extends AppError {
  constructor(
    allowedOutlets = 1,
    message = `Outlet limit reached! You are allowed to create max ${allowedOutlets} outlet(s). Please upgrade your plan to create more.`,
    details = null
  ) {
    super(message, 403, "OUTLET_LIMIT_REACHED", details);
    this.allowedOutlets = allowedOutlets;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "The requested resource was not found.", details = null) {
    super(message, 404, "NOT_FOUND", details);
  }
}

export class RestaurantNotFoundError extends AppError {
  constructor(message = "Restaurant not found or you don't have access to it.", details = null) {
    super(message, 404, "RESTAURANT_NOT_FOUND", details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "A resource with this identifier already exists.", details = null) {
    super(message, 409, "CONFLICT", details);
  }
}

export class SlugAlreadyInUseError extends AppError {
  constructor(message = "Restaurant slug is already in use. Please choose a different slug.", details = null) {
    super(message, 409, "SLUG_ALREADY_IN_USE", details);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed. Please check the highlighted fields.", details = null) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error. Please try again later.", details = null) {
    super(message, 500, "INTERNAL_SERVER_ERROR", details);
  }
}