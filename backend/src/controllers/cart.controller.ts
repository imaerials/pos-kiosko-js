import { RequestHandler } from 'express';
import * as cartService from '../services/cart.service.js';

export const getCart: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.headers['x-session-id'] as string | undefined;
    const cart = await cartService.getCart(userId, sessionId);
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

export const addItem: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.headers['x-session-id'] as string | undefined;
    const { product_id, quantity } = req.body;

    const cart = await cartService.getCart(userId, sessionId);
    const item = await cartService.addItemToCart(cart.id, product_id, quantity);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const updateItem: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.headers['x-session-id'] as string | undefined;
    const { quantity } = req.body;

    const cart = await cartService.getCart(userId, sessionId);
    const item = await cartService.updateCartItem(req.params.id, cart.id, quantity);
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const removeItem: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.headers['x-session-id'] as string | undefined;

    const cart = await cartService.getCart(userId, sessionId);
    const result = await cartService.removeCartItem(req.params.id, cart.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const clearCart: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.headers['x-session-id'] as string | undefined;

    const cart = await cartService.getCart(userId, sessionId);
    await cartService.clearCart(cart.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
