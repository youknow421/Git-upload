export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  category?: string;
  image: string;
  stock?: number;
};