export interface Product {
  id: string;
  productName: string;
  category: string;
  status: "Active" | "Inactive";
}

let productSeq = 0;
export const nextProductId = () => `product-${Date.now()}-${productSeq++}`;

export const products: Product[] = [
  { id: nextProductId(), productName: "Gold Flower", category: "Edible Oils", status: "Active" },
  { id: nextProductId(), productName: "SunFlower Oil", category: "Edible Oils", status: "Active" },
  { id: nextProductId(), productName: "TestFishss", category: "TestFishFoods", status: "Active" },
  { id: nextProductId(), productName: "Testing1997", category: "Testing", status: "Active" },
];
