import { Router } from "express";
import { register_user } from "../controllers/user.controller.js";

const router=Router();

router.route("/register").post(register_user)

export default router