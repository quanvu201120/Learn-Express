import bcrypt from "bcryptjs";
import { MONGO_ERROR_CODE, SALT_ROUNDS } from "../constants/httpCode.js";
import { UserModel } from "../models/user.js";
import { UnauthorizedError } from "../utils/errors.js";

export const CreateUserService = async (
    name: string,
    email: string,
    password: string,
) => {
    const isExist = await UserModel.findOne({ email });
    if (isExist) {
        const error: any = new Error("Email đã tồn tại");
        error.code = MONGO_ERROR_CODE.DUPLICATE_KEY;
        throw error;
    }
    const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);

    return await UserModel.create({
        name,
        email,
        password: hashPassword,
    });
};
export const LoginUserService = async (email: string, password: string) => {
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
        throw new UnauthorizedError("Email hoặc mật khẩu không chính xác");
    }
    const comparePassword = await bcrypt.compare(password, user.password!);
    if (!comparePassword) {
        throw new UnauthorizedError("Email hoặc mật khẩu không chính xác");
    }
    return user;
};
