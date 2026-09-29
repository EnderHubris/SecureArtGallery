import cookieParser from "cookie-parser"
import express from "express";
import multer from "multer";
import cors from 'cors';
import path from "node:path";

import { DeleteSession, FindUserBySession, Login, Register } from "./user_rules";
import { UPLOAD_DIR } from "./utilities";

const app = express();
const port = 8888;

const allowedOrigins = [
    "http://localhost:5173",
];

const defaultUser = {
    id: "0",
    username: "guest",
    email: "",
    role: "guest",
    image: "guest.png"
}

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json()); // middleware to handle JSON
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
app.disable('x-powered-by');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
});

app.get("/", async (req, res) => {
    res.send("Hello World!");
});

app.post("/login", async (req, res) => {
    try {
        const { username, password_hash } = req.body;

        const data = await Login(username, password_hash);

        // apply the JWT to the user's session
        res.cookie("token", data.jwt, {
            httpOnly: true, // prevent cookie stealing
            secure: process.env.PROD === "production",
            sameSite: "lax",
            maxAge: data.maxAge,
        });

        return res.json(data);
    } catch (e) {
        console.error(`[LOGIN ${new Date().toDateString()}]`, e);
        res.status(500).send("Server Error");
    }
});

app.post("/register", upload.single("pfp"), async (req, res) => {
    try {
        const { username, email, password_hash } = req.body;
        const image = req.file;
        console.log(image);
        
        console.log(`[REGISTER ${new Date().toDateString()}] Trying to register user: ${username}`);
        
        const data = await Register(username, email, password_hash, image);
        return res.json(data);
    } catch (e) {
        console.error(`[REGISTER ${new Date().toDateString()}]`, e);
        res.status(500).send("Server Error");
    }
});

app.post("/logout", async (req, res) => {
    try {
        const jwt = req.cookies.token;
        const data = await DeleteSession(jwt);
        return res.json({ "success": true });
    } catch (e) {
        console.error(`[LOGOUT ${new Date().toDateString()}]`, e);
        res.status(500).json({ "success": false });
    }
});

app.post("/info", async (req, res) => {
    try {
        const jwt = req.cookies.token;
        const data = await FindUserBySession(jwt);
        return res.json({
            "success": (data !== null) && (data !== undefined),
            "user": data ?? defaultUser
        });
    } catch (e) {
        console.error(`[INFO ${new Date().toDateString()}]`, e);
        res.status(500).send("Server Error");
    }
});

app.get("/image/:file", async (req, res) => {
    const { file } = req.params;
    const filePath = path.resolve(path.join(UPLOAD_DIR, path.normalize(file)));

    console.log("[*] User Attempting to access:", filePath);
    if (!filePath.startsWith(UPLOAD_DIR))
        return res.status(404).send("Invalid File");

    const f = Bun.file(filePath);
    if (!(await f.exists())) {
        return res.status(404).send("File not found");
    }

    res.sendFile(filePath);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});