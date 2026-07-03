import { prisma } from "../lib/prisma";
import { CreateProductInput } from "../types/product";


export const createProductService = async (data: CreateProductInput)=>{
    const product= await prisma.product.create({
        data
    })
    return product
}

export const getAllProductsService = async ()=>{
    const products= await prisma.product.findMany()
    return products
}

export const getProductByIdService = async (id:string)=>{
    const product= await prisma.product.findUnique({where:{id}})    
    return product
}

export const updateProductService = async (id:string,data: Partial<CreateProductInput>)=>{
    const product= await prisma.product.update({
        where:{id}, 
        data
    })
    return product
}

export const deleteProductService = async (id:string)=>{
    await prisma.product.delete({where:{id}})
    return
}   