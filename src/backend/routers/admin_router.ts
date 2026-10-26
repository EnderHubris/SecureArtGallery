import { Router, Request, Response, NextFunction } from "express";
import { ChangeRole, CreateNewEmployee, DeleteUser, HandleUserBan } from "../utilities/admin_rules";
import { AccessCheck } from "../utilities/session_utils";
import { GetAllGalleryImages, GetAllUsers, KickUser, uploadMulter } from "../utilities/general";
import { GetAllRooms } from "../utilities/room_rules";
import { DeleteGallaryImage, MoveImage, UpdateVisibility, UploadToGallary } from "../utilities/gallery_rules";
import { GetActionLogs } from "../utilities/log_rules";
const router = Router();

/**
 * This is a special permission checker where
 * before continuing with a request in /admin
 * authorization is performed, keeps the code DRY
 * 
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const jwt = req.cookies.token;
    if (!jwt || jwt.length === 0 || !AccessCheck(jwt, "admin"))
        return res.status(401).json({ success: false, message: "Access Denied" });
    next();
};
router.use(requireAdmin);

// expands end-point root '/admin'
router.post("/get_users", async (req, res) => {
    try {
        const { page } = req.body;
        console.log("[!] Admin Fetching Users");
        return res.json(await GetAllUsers(Number(page ?? 1)));
    } catch (e) {
        return res.status(500).send("Server Error");
    }
});

router.post("/delete_user", async (req, res) => {
    try {
        const jwt = req.cookies.token;
        const { uid } = req.body;
        
        console.log(`[DELETE-USER ${new Date().toDateString()}]`);

        return res.json(await DeleteUser(jwt, uid));
    } catch (e) {
        return res.status(500).send("Server Error");
    }
});
router.post("/kick_user", async (req, res) => {
    try {
        const jwt = req.cookies.token;
        const { uid } = req.body;
        
        console.log(`[KICK-USER ${new Date().toDateString()}]`);

        return res.json(await KickUser(jwt, uid));
    } catch (e) {
        return res.status(500).send("Server Error");
    }
});
router.post("/ban_user", async (req, res) => {
    try {
        const jwt = req.cookies.token;
        const { uid } = req.body;
        
        console.log(`[BAN-USER ${new Date().toDateString()}]`);

        return res.json(await HandleUserBan(jwt, uid));
    } catch (e) {
        return res.status(500).send("Server Error");
    }
});
router.post("/unban_user", async (req, res) => {
    try {
        const jwt = req.cookies.token;
        const { uid } = req.body;
        
        console.log(`[UNBAN-USER ${new Date().toDateString()}]`);

        return res.json(await HandleUserBan(jwt, uid, false));
    } catch (e) {
        return res.status(500).send("Server Error");
    }
});

router.post("/set_role", async (req, res) => {
    try {
        const jwt = req.cookies.token;
        const { uid, role } = req.body;
        
        console.log(`[SET-ROLE ${new Date().toDateString()}]`);

        return res.json(await ChangeRole(jwt, uid, role));
    } catch (e) {
        return res.status(500).send("Server Error");
    }
});

router.post("/create_user", async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        console.log(`[CREATE-USER ${new Date().toDateString()}]`);

        return res.json(await CreateNewEmployee(username, email, password, role));
    } catch (e) {
        return res.status(500).send("Server Error");
    }
});

router.get("/get_rooms", async (req, res) => {
    try {
        console.log("[!] Admin Fetching Rooms");
        return res.json(await GetAllRooms());
    } catch (e) {
        return res.status(500).send("Server Error");
    }
});

router.post("/get_content", async (req, res) => {
    try {
        const { page } = req.body;
        console.log("[!] Admin Fetching Gallery Content");
        return res.json(await GetAllGalleryImages(Number(page ?? 1)));
    } catch (e) {
        return res.status(500).send("Server Error");
    }
});

router.post("/upload_content", uploadMulter.array("g_img", 10), async (req, res) => {
    return UploadToGallary(req, res);
});

router.post("/get_actions", async (req, res) => {
    try {
        const { page } = req.body;
        console.log("[!] Admin Fetching Action Logs");
        return res.json(await GetActionLogs(Number(page ?? 1)));
    } catch (e) {
        return res.status(500).send("Server Error");
    }
});

// patch requests are for modifying a resource without using a post
router.patch("/gallery/:id/room", async (req, res) => {
    try {
        const roomId = req.body.room_id;
        if (!roomId)
            return res.json({ success: false, message: "Missing Required Data" })
        
        console.log(`[!] Relocating Image ID: ${req.params.id} -> Room ID:`, roomId);

        return res.json(await MoveImage(req.params.id, roomId));
    } catch (e) {
        console.error(`[GALLERY-ROOM ${new Date().toISOString()}]`, e);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
});

router.patch("/gallery/:id/visibility", async (req, res) => {
    try {
        const visible = req.body.visible;
        if (!visible) {
            return res.json({ success: false, message: "Missing Required Data" })
        }
        
        console.log(`[!] Image ID: ${req.params.id}`, visible ? "VISIBLE" : "HIDDEN");

        if (typeof visible !== "boolean") {
            return res.status(400).json({ success: false, message: "Invalid visibility" });
        }

        return res.json(await UpdateVisibility(req.params.id, visible));
    } catch (e) {
        console.error(`[GALLERY-VISIBILITY ${new Date().toISOString()}]`, e);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
});

// A delete request tells the server to delete a resource
router.delete("/gallery/:id", async (req, res) => {
    try {
        console.log("[!] Deleting Image ID:", req.params.id);
        return res.json(await DeleteGallaryImage(req.params.id));
    } catch (e) {
        console.error(`[GALLERY-DELETE ${new Date().toISOString()}]`, e);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
});

export default router;