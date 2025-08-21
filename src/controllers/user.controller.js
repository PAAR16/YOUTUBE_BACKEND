import {asynchandler} from "../utils/asynchandler.js";
import {ApiError} from "../utils/api_error.js";
import {User} from "../models/users.models.js";
import {uploadOnCloudinary} from "../utils/Cloudinary.js";
import {ApiResponse} from  "../utils/apiresponse.js";

const generateAcessAndRefereshtoken=async(userid)=>
{
    try {
        const user=await User.findById(userid);
        const accesstoken=user.generateAccesstoken();
        const refereshtoken=user.generateRefreshtoken();     

        user.refereshtoken=refereshtoken;
        await user.save({vaidateBeforeSave:false});

        return {accesstoken,refereshtoken};
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating access/referesh token")
    }
}


const register_user=asynchandler(async(req,res)=>{
    // res.status(200).json({
    //     message:"ok"
    // })

    //get user details from frontend
    //validation - not empty
    //check if user already exists
    //check for images 
    //upload them to cloudinary,avatar
    //create user object
    //remove password and refresh tokem from user object
    //check for user creation
    //return res
        
    
    const {fullname,email,username,password}=req.body;

    // if(fullname===""){
    //     throw new ApiError(400,"full name required")
    // }
        
    if(
        [fullname,email,username,password].some((field)=>
        field?.trim()==="")
    ){
        throw new Error(400,"all fields are required");
        
    }   

    const exisiting_user=User.findOne({
        $or:[{username} , {email}]
    })

    if(exisiting_user){
        throw new Error(409,"user with same username exists");
    }

    const avatarlocalpath= req.files?.avatar[0]?.path;
    const converimagelocalpath=req.files?.coverimage[0]?.path;

    if(!avatarlocalpath){
        throw new ApiError(400,"avatar file is requires");
    }

    const avatar = await uploadOnCloudinary(avatarlocalpath)
    if(!avatar){
        throw new ApiError(400,"avatar file is requires");
    }

    const coverimage=await uploadOnCloudinary(converimagelocalpath);

    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverimage:avatar?.url||"",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"something went wrong while regestring the user")
    }


    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    );
})

const loginUser=asynchandler(async (req,res)=>{
    //req body->user
    //username or email
    //find the user
    //password check
    //access or referesh token
    //send cookies

    const {email,username,password}=req.body;

    if(!username || !email){
        throw new ApiError(400,"either of the one is required");
    }

    const user=await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"user does not exist");
    }
    

    const ispasswordValid=await user.ispasswordcorrect(password);

    if(!ispasswordValid){
        throw new ApiError(401,"invalid password");
    }

    const{accesstoken,refereshtoken}= await generateAcessAndRefereshtoken(user._id);  

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

    const options  = {
        httplonly:true,
        secure:true,
    }

    return res.
    status(200).
    cookie("accessToken",accesstoken,options).
    cookie("refereshToken",refereshtoken,options).
    json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accesstoken,refereshtoken
            },
            "user logged in successfully"
        )
    )
})

const logoutUser=asynchandler(async (req,res)=>{
    //clear cookies
    //empty  or  remove the refersh token

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refereshtoken:undefined
            }
        },
        {
                new:true
        }
    )

    const options  = {
        httplonly:true,
        secure:true,
    }


    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refereshToken",options)
    .json(new ApiResponse(200,{},"user logged out"))
})

export {register_user,loginUser,logoutUser}