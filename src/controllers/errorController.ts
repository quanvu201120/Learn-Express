import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const status = (err as any).status || 500;
    const message =
        status === 500 ? "Đã có lỗi xảy ra trên hệ thống" : err.message;

    res.status(status).json({
        message,
        data: null,
    });
};
