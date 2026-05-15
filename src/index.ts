import express, { urlencoded, type Request, type Response } from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import routerAuth from "./routes/auth.js";
import { verifyToken } from "./middlewares/auth.middleware.js";
import { errorHandler } from "./controllers/errorController.js";

const app = express();
app.use(
    cors({
        origin: "http://localhost:3000", // Chỉ cho phép NextJs của bạn gọi vào
    }),
);

const PORT = process.env.PORT;

// Middleware để đọc được dữ liệu JSON từ client gửi lên
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Khai báo Routes
app.use(verifyToken);

app.use("/auth", routerAuth);

app.use(errorHandler);

try {
    // Kết nối Database
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server đang chạy tại: http://localhost:${PORT}`);
    });
} catch (error) {
    console.log("error connect db => ", error);
    process.exit(1);
}
