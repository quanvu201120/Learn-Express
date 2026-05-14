import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodTypeAny } from "zod";

export const validateReqBody =
    (schema: ZodTypeAny) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error: any) {
            if (error instanceof ZodError) {
                const formattedErrors = error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                }));
                return res.status(400).json({
                    message: "Dữ liệu không hợp lệ",
                    errors: formattedErrors,
                });
            }
            return res.status(500).json({
                message: "Lỗi hệ thống",
            });
        }
    };
