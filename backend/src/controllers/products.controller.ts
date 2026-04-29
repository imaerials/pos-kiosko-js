import { RequestHandler } from 'express';
import * as productService from '../services/product.service.js';

export const getProducts: RequestHandler = async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const products = await productService.getAllProducts(categoryId);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getProduct: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const getProductByBarcode: RequestHandler<{ barcode: string }> = async (req, res, next) => {
  try {
    const product = await productService.getProductByBarcode(req.params.barcode);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct: RequestHandler = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
