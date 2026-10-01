import cookieParser from "cookie-parser"
import express from "express";
import cors from 'cors';
import path from "node:path";

import { DeleteSession, FindUserBySession, Login, Register, UPLOAD_DIR as PFP_DIR } from "./utilities/user_rules";
import { UPLOAD_DIR as GALLERY_DIR, GetImagesByRoom, ImageInRoom } from "./utilities/gallery_rules";

import { TestSession, uploadMulter } from "./utilities/general";

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

// routes are used to divide backend routing logic into
// separate files to reduce clustering multiple
// endpoints into a single file
import userRoutes from "./routers/user_router";
import { CheckSession, GetSession, SESSION_LIFETIME } from "./utilities/session_utils";
app.use("/user", userRoutes);

import adminRoutes from "./routers/admin_router";
import { EnterRoom, FindAdjacentRooms, FindRoomFromToken, GetRoomCount, lobbyRoom } from "./utilities/room_rules";
app.use("/admin", adminRoutes);

import employeeRoutes from "./routers/employee_router";
app.use("/employee", employeeRoutes);

app.get("/", async (req, res) => {
    return res.send("Hello World!");
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
            maxAge: SESSION_LIFETIME,
        });

        return res.json(data);
    } catch (e) {
        console.error(`[LOGIN ${new Date().toDateString()}]`, e);
        return res.status(500).send("Server Error");
    }
});

app.post("/register", uploadMulter.single("pfp"), async (req, res) => {
    try {
        const { username, email, password_hash } = req.body;
        const image = req.file;
        
        console.log(`[REGISTER ${new Date().toDateString()}] Trying to register user: ${username}`);
        
        const data = await Register(username, email, password_hash, image);
        return res.json(data);
    } catch (e) {
        console.error(`[REGISTER ${new Date().toDateString()}]`, e);
        return res.status(500).send("Server Error");
    }
});

app.post("/logout", async (req, res) => {
    try {
        const jwt = req.cookies.token;
        const data = await DeleteSession(jwt);
        
        res.clearCookie("token", {
            httpOnly: true, // prevent cookie stealing
            secure: process.env.PROD === "production",
            sameSite: "lax",
            path: "/",
        });

        return res.json({ "success": true });
    } catch (e) {
        console.error(`[LOGOUT ${new Date().toDateString()}]`, e);
        return res.status(500).json({ "success": false });
    }
});

app.post("/info", async (req, res) => {
    try {
        const jwt = req.cookies.token;

        const data = await FindUserBySession(jwt);
        const user = data ?? defaultUser

        return res.json({
            "success": (data !== null) && (data !== undefined),
            "user": user
        });
    } catch (e) {
        console.error(`[INFO ${new Date().toDateString()}]`, e);
        return res.status(500).send("Server Error");
    }
});

app.post("/verify", async (req, res) => {
    try {
        const jwt = req.cookies.token;
        if (!jwt) return res.json({ "success": false });

        return res.json({ "success": await TestSession(jwt, res) });
    } catch (e) {
        return res.status(500).send("Server Error");
    }
});

app.get("/get_room", async (req, res) => {
    try {
        const jwt = req.cookies.token;
        const defaultData = {
            room: lobbyRoom,
            adjacent: [],
            peopleInRoom: 1
        }

        if (!jwt || !await TestSession(jwt, res)) {
            return res.json(defaultData);
        }

        // only those with tokens can get adjacent rooms
        const currRoom = await FindRoomFromToken(jwt);
        const data = {
            room: currRoom,
            adjacent: await FindAdjacentRooms(currRoom.id),
            peopleInRoom: await GetRoomCount(currRoom)
        }
        
        console.log(data);

        return res.json(data);
    } catch (e) {
        return res.status(500).send("Server Error");
    }
});

app.post("/enter_room", async (req, res) => {
    try {
        const jwt = req.cookies.token;
        const { id } = req.body;

        if (!jwt || !id)
            return {
                success: false,
                message: "Could not enter at this time!"
            }

        if (!await TestSession(jwt, res)) {
            return {
                success: id === 1,
                message: (id === 1) ? "Welcome to the Lobby!" : "Could not enter at this time!"
            }
        }

        return res.json(await EnterRoom(jwt, id));
    } catch (e) {
        return res.status(500).send("Server Error");
    }
});

app.get("/image/:file", async (req, res) => {
    try {
        const { file } = req.params;
        const filePath = path.resolve(path.join(PFP_DIR, path.normalize(file)));
    
        console.log("[*] User Attempting to access:", filePath);
        if (!filePath.startsWith(PFP_DIR))
            return res.status(404).send("Invalid File");
    
        const f = Bun.file(filePath);
        if (!(await f.exists())) {
            return res.status(404).send("File not found");
        }
    
        return res.sendFile(filePath);
    } catch {
        return res.status(500).send("Server Error");
    }
});

app.get("/gallery/:file", async (req, res) => {
    try {
        const { file } = req.params;
        const filePath = path.resolve(path.join(GALLERY_DIR, path.normalize(file)));
        
        console.log("[*] User Attempting to access:", filePath);
        if (!filePath.startsWith(GALLERY_DIR))
            return res.status(404).send("Invalid File");
        
        // check if token is valid
        const jwt = req.cookies.token;
        if (jwt && await TestSession(req.cookies.token, res)) {
            // valid JWT
            let room_id = 1;
            const user = await FindUserBySession(jwt);

            if (user && user.role === "guest") {
                console.warn("[!] Performing Room Check before sending Image...");

                // find the room this guest user is currently in
                const session = await GetSession(jwt);
                room_id = session?.room_id ?? 1;

                if (!await ImageInRoom(filePath, room_id)) {
                    return res.status(403).send("Not viewable in this room");
                }
            }
        } else {
            // unauthenticated user
            if (!await ImageInRoom(filePath, 1)) {
                return res.status(403).send("Not viewable in this room");
            }
        }

        const f = Bun.file(filePath);
        if (!(await f.exists())) {
            return res.status(404).send("File not found");
        }

        return res.sendFile(filePath);
    } catch {
        return res.status(500).send("Server Error");
    }
});

app.get("/room_content", async (req, res) => {
    try {
        // use JWT to find the current room
        const jwt = req.cookies.token;
        if (!jwt)
            return res.json(await GetImagesByRoom(1));

        if (!await TestSession(jwt, res)) {
            return [];
        }

        const session = await GetSession(jwt);
        if (!session) return [];

        return res.json(await GetImagesByRoom(session.room_id));
    } catch {
        return res.status(500).send("Server Error");
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});