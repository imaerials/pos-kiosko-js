import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service.js';

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const products = await productService.getAllProducts(categoryId);
    res.json(products);
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProductById(req.params.id as string);
    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function getProductByBarcode(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProductByBarcode(req.params.barcode as string);
    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.updateProduct(req.params.id as string, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await productService.deleteProduct(req.params.id as string);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
