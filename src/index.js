require('dotenv').config(path: './env')

import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from 'express'
import connectDB from "./db/index.js";



connectDB











/*const app=express()
;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("error :",error);
            throw error;
        })

        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on PORT ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("error",error);
        throw error
    }
})()
*/