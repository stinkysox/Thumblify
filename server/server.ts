import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db";
import session from "express-session";
import MongoStore from "connect-mongo";
import AuthRouter from "./Routes/AuthRoutes";
import ThumbnailRouter from "./Routes/ThumbnailRoutes";
import UserRouter from "./Routes/UserRoutes";

declare module "express-session" {
  interface SessionData {
    isLoggedIn: boolean;
    userId: string;
  }
}

const app = express();

app.use(
  cors({
    origin: [
      "http:/localhost:5173",
      "http:/localhost:3000",
      "https://thumblify-nine.vercel.app/",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL as string,
      collectionName: "sessions",
    }),
  })
);

app.get("/", (req, res) => {
  res.send("Server is Live!");
});

app.use("/api/auth", AuthRouter);
app.use("/api/thumbnail", ThumbnailRouter);
app.use("/api/user", UserRouter);

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to DB:", error);
    process.exit(1);
  }
};

startServer();
