import { Request,Response } from "express";
import { SigninService,SignupService } from "../services/auth.services";
import { forgotPasswordService } from "../services/auth.services";
import { verifyResetTokenService } from "../services/auth.services";
import {resetPasswordService} from "../services/auth.services"
import { refreshTokenService } from "../services/auth.services";

export const Signup=async (req:Request,res:Response)=>{
    try {
        const {email,password,name}=req.body
        const result= await SignupService(email,password,name)
        res.status(201).json({
            message:"user created successfully",
            ...result
        })
    } catch (error:any) {
        res.status(400).json({
            message:error.message
        })
    }
}
export const Signin=async(req:Request,res:Response)=>{
    try {
         const {email,password}=req.body
    const result= await SigninService(email,password)

    res.status(200).json({
        message:"Login Successful",
        ...result
    })
    } catch (error:any) {
        res.status(400).json({
            message:error.message
        })
        
    }
}
export const forgotPassword=async(req:Request,res:Response)=>{
        try {
            const {email}=req.body
            const result= await forgotPasswordService(email)

            res.status(200).json({
                ...result,
                message:"password reset link sent to your email"
            })
        } catch (error:any) {
            res.status(400).json({
                message:error.message
            })
        }   
    }

export const verifyResetToken=async(req:Request,res:Response)=>{
    try {
        const {email,token}=req.body
        const result= await verifyResetTokenService(email,token)
        res.status(200).json({
            ...result,
            message:"token verified successfully"
        })
    } catch (error:any) {
        res.status(400).json({
            message:error.message
        })
    }
}

export const resetPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const { resetSessionToken, newPassword } = req.body;

    const result = await resetPasswordService(
      resetSessionToken,
      newPassword
    );

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

export const refreshToken=async(req:Request,res:Response)=>{
    try {
        const { refreshToken } = req.body;
        const result = await refreshTokenService(refreshToken);
        res.status(200).json(result);
    } catch (error:any) {
        res.status(400).json({
            message: error.message
        });
    }
}
