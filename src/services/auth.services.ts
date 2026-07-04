import { prisma } from "../lib/prisma";
import { hashPassword,comparePassword} from "../utils/bcrypt";
import { generateToken,generateRefreshToken } from "../utils/jwt";
import { sendEmail } from "../utils/mail";
import {generate6DigitToken} from "../utils/token";
import Jwt  from "jsonwebtoken";
import { mergeGuestCartIntoUserCart } from "../services/cart.service";

export const SignupService = async (email:string,password:string,name:string)=>{
    const existingUser= await prisma.user.findUnique({where:{email},})


    if (existingUser){
        throw new Error("user already exist")
    }
    const hashedPassword=await hashPassword(password)
    
    const user= await prisma.user.create({
        data:{
        email,
        name,
        password:hashedPassword}
    })
    const accessToken=generateToken(user.id)
    const refreshToken=generateRefreshToken(user.id)

    return {
        user:{
            id:user.id,
            email:user.email,
            name:user.name
        },
        accessToken,
        refreshToken
    }
    
}

export const SigninService = async (
  email: string,
  password: string,
  sessionId?: string
) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("invalid credential");
  }

  const compare = await comparePassword(
    password,
    user.password
  );

  if (!compare) {
    throw new Error("invalid credential");
  }

  if (sessionId) {
    await mergeGuestCartIntoUserCart(
      sessionId,
      user.id
    );
  }

  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    refreshToken,
    accessToken,
  };
};


export const forgotPasswordService = async (email:string)=>{
    const user= await prisma.user.findUnique({where:{email}})
    if (!user){
        throw new Error("user not found")
    }
    const resetToken=generate6DigitToken()
    const resetTokenExpiry=new Date(Date.now()+15*60*1000) // 15 minutes

    await prisma.user.update({
        where:{email},
        data:{
             resetPasswordToken: resetToken,
             resetPasswordExp: resetTokenExpiry,
             tokenAttempts:0
        }
    })
    await sendEmail(user.email, resetToken);
    return {
        message:"password reset token sent to email",
        resetToken

        
    }
}
export const verifyResetTokenService=async(email:string,token:string)=>{
    const user= await prisma.user.findUnique({where:{email}}) 
    if (!user){
        throw new Error("user not found")
    }
    if ( !user.resetPasswordExp || user.resetPasswordExp < new Date()){
        throw new Error("invalid or expired token")
    }
    if (user.tokenAttempts >= 3){
        throw new Error("too many invalid attempts, please request a new token")
    }

    if (user.resetPasswordToken !== token){
        await prisma.user.update({
            where:{email},
            data:{tokenAttempts:{increment:1}}
        })
        throw new Error("invalid token")
    }

    const resetSessionToken = crypto.randomUUID();

    const resetSessionExpiry = new Date(
        Date.now() + 10 * 60 * 1000
    );

    await prisma.user.update({
        where:{email},
        data:{
            tokenAttempts:0,
            resetPasswordToken:null,
            resetPasswordExp:null,
            resetSessionToken,
            resetSessionExpiry
        }

            
    })

    return {
        message:"token verified, you can now reset your password",
        resetSessionToken
    }
} 

export const resetPasswordService = async (
  resetSessionToken: string,
  newPassword: string
) => {
  const user = await prisma.user.findFirst({
    where: {
      resetSessionToken,
      resetSessionExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new Error("Invalid or expired reset session");
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,

      // destroy session after use
      resetSessionToken: null,
      resetSessionExpiry: null,
    },
  });

  return {
    message: "Password reset successful",
  };
};

export const refreshTokenService = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new Error("Refresh token required");
  }

  const decoded = Jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET!
  );

  const user = await prisma.user.findFirst({
    where: { refreshToken },
  });

  if (!user) {
    throw new Error("Invalid refresh token");
  }

  const newAccessToken = generateToken(user.id);

  return {  
    accessToken: newAccessToken,
  };
};