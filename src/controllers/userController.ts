import type { RequestHandler, Request, Response } from "express";
import {
    userResZod,
    type BaseResponseType,
    type LoginBodyType,
    type PayloadJwtType,
    type RegisterBodyType,
    type UserResType,
} from "../validations/auth.schema.js";
import {
    CreateUserService,
    GetAllUsersService,
    LoginUserService,
    RemoveRefreshTokenService,
} from "../services/userServices.js";
import { HTTP_STATUS, MONGO_ERROR_CODE } from "../constants/httpCode.js";
import jwt from "jsonwebtoken";
import z from "zod";
import { UserModel } from "../models/user.js";
import { UnauthorizedError } from "../utils/errors.js";

export const createUser: RequestHandler<
    {}, //Req params
    BaseResponseType<UserResType | null>, //Res
    RegisterBodyType, //Req Body
    {} //Req Search params
> = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const result = await CreateUserService(name, email, password);
        const safeData = userResZod.parse(result);
        return res
            .status(HTTP_STATUS.CREATED)
            .json({ message: "Create user success", data: safeData });
    } catch (error: any) {
        if (error.code === MONGO_ERROR_CODE.DUPLICATE_KEY) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: "Email đã tồn tại, vui lòng sử dụng email khác",
                data: null,
            });
        }
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            message: "Đã có lỗi xảy ra trên hệ thống",
            data: null,
        });
    }
};

export const LoginUser: RequestHandler<
    {}, //Req params
    BaseResponseType<UserResType | null>, //Res
    LoginBodyType, //Req Body
    {} //Req Search params
> = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await LoginUserService(email, password);
        const safeData = userResZod.parse(user);
        const payload: PayloadJwtType = {
            id: safeData.id,
            role: safeData.role,
        };
        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET!,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as any,
            },
        );

        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_SECRET!,
            {
                expiresIn: process.env.REFRESH_TOKEN_MAX_AGE_DB as any,
            },
        );

        await UserModel.updateOne(
            {
                _id: safeData.id,
            },
            {
                $push: {
                    refreshToken: {
                        token: refreshToken,
                    },
                },
            },
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE_CLIENT),
        });

        return res.status(HTTP_STATUS.OK).json({
            message: "Đăng nhập thành công",
            accessToken,
            data: safeData,
        });
    } catch (error: any) {
        const status = error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const message =
            status === HTTP_STATUS.INTERNAL_SERVER_ERROR
                ? "Đã có lỗi xảy ra trên hệ thống"
                : error.message;
        return res.status(status).json({ message, data: null });
    }
};

export const GetUser: RequestHandler<
    {}, //Req params
    BaseResponseType<UserResType[] | null>, //Res
    LoginBodyType, //Req Body
    {} //Req Search params
> = async (req, res) => {
    try {
        const userList = await GetAllUsersService();
        const transformListUsers = userList.map((item) => ({
            ...item,
            id: item._id.toString(),
        }));

        const safeData: UserResType[] = z
            .array(userResZod)
            .parse(transformListUsers);

        return res.status(HTTP_STATUS.OK).json({
            message: "Get user success",
            data: safeData,
        });
    } catch (error: any) {
        const status = error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const message =
            status === HTTP_STATUS.INTERNAL_SERVER_ERROR
                ? "Đã có lỗi xảy ra trên hệ thống"
                : error.message;
        return res.status(status).json({ message, data: null });
    }
};

export const RefreshToken: RequestHandler<
    {},
    BaseResponseType<null>,
    {},
    {}
> = async (req, res) => {
    const token = req.cookies.refreshToken as string;
    if (!token) {
        throw new UnauthorizedError("Không có token");
    }
    const user = await UserModel.findOne({ "refreshToken.token": token });
    if (!user) {
        throw new UnauthorizedError("Token không hợp lệ hoặc đã hết hạn");
    }

    try {
        const decodedPayloadRefreshToken = jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET!,
        ) as PayloadJwtType;

        const payloadAccessToken: PayloadJwtType = {
            id: decodedPayloadRefreshToken.id,
            role: decodedPayloadRefreshToken.role,
        };
        const accessToken = jwt.sign(
            payloadAccessToken,
            process.env.ACCESS_TOKEN_SECRET!,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as any,
            },
        );

        return res.status(HTTP_STATUS.OK).json({
            message: "Refresh token success",
            accessToken,
            data: null,
        });
    } catch (error: any) {
        const errJWT =
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError";

        if (error.name === "TokenExpiredError") {
            await RemoveRefreshTokenService(token, res);
        }

        const status = errJWT
            ? HTTP_STATUS.UNAUTHORIZED
            : error.status
              ? error.status
              : HTTP_STATUS.INTERNAL_SERVER_ERROR;

        const message = errJWT
            ? "Token không hợp lệ hoặc đã hết hạn"
            : status === HTTP_STATUS.INTERNAL_SERVER_ERROR
              ? "Đã có lỗi xảy ra trên hệ thống"
              : error.message;

        return res.status(status).json({ message, data: null });
    }
};

export const LogoutUser: RequestHandler<
    {},
    BaseResponseType<null>,
    {},
    {}
> = async (req, res) => {
    const token = req.cookies.refreshToken as string;
    try {
        await RemoveRefreshTokenService(token, res);
    } catch (error) {
    } finally {
        return res.status(HTTP_STATUS.OK).json({
            message: "Đăng xuất thành công",
            data: null,
        });
    }
};
