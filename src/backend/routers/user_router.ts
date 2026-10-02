import { Router } from "express";
const router = Router();

import { uploadMulter } from '../utilities/general';
import { UpdateProfile } from "../utilities/user_rules";

// expands end-point root '/user'
router.post("/update", uploadMulter.single("pfp"), async (req, res) => {
    try {
        const { username, email, n_password_hash, password_hash } = req.body;
        
        console.log(req.body);

        const image = req.file;

        // jwt + password_hash used to check authorization
        const jwt = req.cookies.token;
        
        console.log(`[PROFILE-UPDATE ${new Date().toDateString()}] Trying to update user: ${jwt}`);
        
        const data = await UpdateProfile(
            username, email,
            n_password_hash, password_hash,
            image, jwt, res
        );
        return res.json(data);
    } catch (e) {
        console.error(`[REGISTER ${new Date().toDateString()}]`, e);
        res.status(500).send("Server Error");
    }
});

export default router;