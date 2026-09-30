import { Router, Request, Response, NextFunction } from "express";
import { ChangeRole, CreateNewEmployee, DeleteUser, GetAllUsers } from "../admin_rules";
import { AccessCheck } from "../utilities/session_utils";
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
        const { username, email, password_hash, role } = req.body;
        
        console.log(`[CREATE-USER ${new Date().toDateString()}]`);

        return res.json(await CreateNewEmployee(username, email, password_hash, role));
    } catch (e) {
        return res.status(500).send("Server Error");
    }
});

export default router;