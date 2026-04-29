import { Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cart.service.js';

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const sessionId = req.headers['x-session-id'] as string | undefined;
    const cart = await cartService.getCart(userId, sessionId);
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

export async function addItem(req: Request, res: Response, next: NextFunction) {
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
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const sessionId = req.headers['x-session-id'] as string | undefined;
    const { quantity } = req.body;

    const cart = await cartService.getCart(userId, sessionId);
    const item = await cartService.updateCartItem(req.params.id as string, cart.id, quantity);
    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function removeItem(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const sessionId = req.headers['x-session-id'] as string | undefined;

    const cart = await cartService.getCart(userId, sessionId);
    const result = await cartService.removeCartItem(req.params.id as string, cart.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const sessionId = req.headers['x-session-id'] as string | undefined;

    const cart = await cartService.getCart(userId, sessionId);
    await cartService.clearCart(cart.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
