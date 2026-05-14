import { HTTP_STATUS } from "../constants/httpCode.js";

export class AppError extends Error {
    constructor(
        public message: string,
        public status: number,
    ) {
        super(message);
    }
}

export class BadRequestError extends AppError {
    constructor(message = "Bad Request") {
        super(message, HTTP_STATUS.BAD_REQUEST);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, HTTP_STATUS.UNAUTHORIZED);
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Not Found") {
        super(message, HTTP_STATUS.NOT_FOUND);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, HTTP_STATUS.FORBIDDEN);
    }
}

export class UnprocessableEntityError extends AppError {
    constructor(message = "Unprocessable Entity") {
        super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
}

export class InternalServerError extends AppError {
    constructor(message = "Internal Server Error") {
        super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}
