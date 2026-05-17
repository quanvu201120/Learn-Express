import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";
import jwt from "jsonwebtoken";
import type { PayloadJwtType } from "../validations/auth.schema.js";

const whiteList = ["/auth/register", "/auth/login", "/auth/refreshToken"];
const adminList = ["/auth/admin"];

export const verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (whiteList.includes(req.path)) {
        return next();
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        throw new UnauthorizedError("Vui lòng đăng nhập");
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET as string,
        ) as PayloadJwtType;

        if (adminList.some((route) => req.path.startsWith(route))) {
            if (decoded.role !== "ADMIN") {
                throw new ForbiddenError("Bạn không có quyền truy cập");
            }
        }

        req.user = decoded;
        next();
    } catch (error: any) {
        if (error.status) {
            throw error;
        }

        throw new UnauthorizedError("Token không hợp lệ");
    }
};
