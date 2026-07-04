"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductService = exports.updateProductService = exports.getProductByIdService = exports.getAllProductsService = exports.createProductService = void 0;
const prisma_1 = require("../lib/prisma");
const createProductService = async (data) => {
    const product = await prisma_1.prisma.product.create({
        data
    });
    return product;
};
exports.createProductService = createProductService;
const getAllProductsService = async () => {
    const products = await prisma_1.prisma.product.findMany();
    return products;
};
exports.getAllProductsService = getAllProductsService;
const getProductByIdService = async (id) => {
    const product = await prisma_1.prisma.product.findUnique({ where: { id } });
    return product;
};
exports.getProductByIdService = getProductByIdService;
const updateProductService = async (id, data) => {
    const product = await prisma_1.prisma.product.update({
        where: { id },
        data
    });
    return product;
};
exports.updateProductService = updateProductService;
const deleteProductService = async (id) => {
    await prisma_1.prisma.product.delete({ where: { id } });
    return;
};
exports.deleteProductService = deleteProductService;
