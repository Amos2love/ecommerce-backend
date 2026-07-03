export type ProductParams = {
  id: string;
};

export type CreateProductInput = {
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  imageId: string;
};