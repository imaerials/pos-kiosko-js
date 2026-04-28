import * as productRepo from '../repositories/product.repository.js';
import { NotFoundError } from '../utils/errors.js';

export async function getAllProducts(categoryId?: string) {
  return productRepo.findAllProducts(categoryId);
}

export async function getProductById(id: string) {
  const product = await productRepo.findProductById(id);
  if (!product) {
    throw new NotFoundError('Product');
  }
  return product;
}

export async function getProductByBarcode(barcode: string) {
  const product = await productRepo.findProductByBarcode(barcode);
  if (!product) {
    throw new NotFoundError('Product');
  }
  return product;
}

export async function createProduct(data: {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  category_id?: string;
  image_url?: string;
}) {
  const existing = await productRepo.findProductBySku(data.sku);
  if (existing) {
    throw new Error('Product with this SKU already exists');
  }
  return productRepo.createProduct(data);
}

export async function updateProduct(
  id: string,
  data: Partial<{
    sku: string;
    barcode: string;
    name: string;
    description: string;
    price: number;
    cost: number;
    category_id: string;
    image_url: string;
  }>
) {
  const product = await productRepo.updateProduct(id, data);
  if (!product) {
    throw new NotFoundError('Product');
  }
  return product;
}

export async function deleteProduct(id: string) {
  const deleted = await productRepo.deleteProduct(id);
  if (!deleted) {
    throw new NotFoundError('Product');
  }
  return { success: true };
}
