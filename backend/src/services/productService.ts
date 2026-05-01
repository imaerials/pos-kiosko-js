import { productRepository } from '../repositories/productRepository.js';
import { inventoryRepository } from '../repositories/inventoryRepository.js';
import { CreateProductInput, UpdateProductInput } from '../utils/validation.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export const productService = {
  async getAll(categoryId?: string) {
    return productRepository.findAll({ categoryId });
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product');
    return product;
  },

  async getBySku(sku: string) {
    const product = await productRepository.findBySku(sku);
    if (!product) throw new NotFoundError('Product');
    return product;
  },

  async getByBarcode(barcode: string) {
    const product = await productRepository.findByBarcode(barcode);
    if (!product) throw new NotFoundError('Product');
    return product;
  },

  async search(query: string, page?: number, limit?: number) {
    return productRepository.search(query, { page, limit });
  },

  async create(data: CreateProductInput) {
    if (data.sku) {
      const existing = await productRepository.findBySku(data.sku);
      if (existing) throw new BadRequestError('SKU already exists');
    }
    if (data.barcode) {
      const existing = await productRepository.findByBarcode(data.barcode);
      if (existing) throw new BadRequestError('Barcode already exists');
    }

    const product = await productRepository.create(data);
    await inventoryRepository.upsert(product.id, { quantity: 0 });
    return product;
  },

  async update(id: string, data: UpdateProductInput) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product');

    if (data.sku && data.sku !== product.sku) {
      const existing = await productRepository.findBySku(data.sku);
      if (existing) throw new BadRequestError('SKU already exists');
    }
    if (data.barcode && data.barcode !== product.barcode) {
      const existing = await productRepository.findByBarcode(data.barcode);
      if (existing) throw new BadRequestError('Barcode already exists');
    }

    return productRepository.update(id, data);
  },

  async delete(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product');
    return productRepository.delete(id);
  },
};