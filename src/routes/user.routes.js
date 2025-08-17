import { Router } from "express";
import { register_user } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";


const router=Router();

router.route("/register").post(
    upload.fields([ 
         {
            name:"avatar",
            maxcount:1
        },
        {
            
        } 
    ]),
    register_user
)

export default router