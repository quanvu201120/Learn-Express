import z from "zod";

export const registerBodyZod = z
    .object({
        name: z.string().trim().min(1, "Tên không được để trống"),
        email: z.string().trim().email("Email không hợp lệ"),
        password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
        confirmPassword: z
            .string()
            .min(8, "Mật khẩu nhập lại phải có ít nhất 8 ký tự"),
    })
    .strict()
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu nhập lại không khớp",
        path: ["confirmPassword"],
    });

export const loginBodyZod = z
    .object({
        email: z.string().trim().email("Email không hợp lệ"),
        password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    })
    .strict();

export const userResZod = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(["ADMIN", "USER"]),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type RegisterBodyType = z.infer<typeof registerBodyZod>;
export type LoginBodyType = z.infer<typeof loginBodyZod>;
export type UserResType = z.infer<typeof userResZod>;

export type LoginResType = UserResType;
export type RegisterResType = UserResType;

export type BaseResponseType<T> = {
    message: string;
    accessToken?: string | null;
    data: T;
};

export type UserRoleType = "ADMIN" | "USER";

export type PayloadJwtType = {
    id: string;
    role: UserRoleType;
};
