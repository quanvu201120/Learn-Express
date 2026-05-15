import mongoose from "mongoose";

const userSchemaMongoose = new mongoose.Schema(
    {
        name: String,
        email: { type: String, unique: true },
        password: { type: String, select: false },
        role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
        deleteAt: { type: String, default: null },
    },
    { timestamps: true },
);

export const UserModel = mongoose.model("User", userSchemaMongoose);
