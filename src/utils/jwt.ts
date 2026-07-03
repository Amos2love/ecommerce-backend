import Jwt from "jsonwebtoken"


export const generateToken=(userId:string)=>{
    return Jwt.sign(
        {userId},
        process.env.JWT_ACCESS_SECRET as string,
        {expiresIn: "15m"}
    )
}

export const generateRefreshToken=(userId:string)=>{
    return Jwt.sign(
        {userId},
        process.env.JWT_REFRESH_SECRET as string,
        {expiresIn:"7d"}
    )
}