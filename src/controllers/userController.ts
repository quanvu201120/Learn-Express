import { type RequestHandler } from "express";
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
} from "../services/userServices.js";
import { HTTP_STATUS, MONGO_ERROR_CODE } from "../constants/httpCode.js";
import jwt from "jsonwebtoken";
import z from "zod";

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
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: process.env.JWT_EXPIRES_IN as any,
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
