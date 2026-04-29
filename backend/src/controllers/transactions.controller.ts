import { RequestHandler } from 'express';
import * as transactionService from '../services/transaction.service.js';

export const getTransactions: RequestHandler = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const userId = req.user?.role === 'cashier' ? req.user.userId : undefined;
    const transactions = await transactionService.getAllTransactions(limit, offset, userId);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

export const getTransaction: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id);
    res.json(transaction);
  } catch (error) {
    next(error);
  }
};

export const createTransaction: RequestHandler = async (req, res, next) => {
  try {
    const { payment_method, amount_paid, discount_amount, customer_name, notes, items } = req.body;
    const userId = req.user?.userId;
    const transaction = await transactionService.createTransaction(
      items,
      userId,
      payment_method,
      amount_paid,
      discount_amount || 0,
      customer_name,
      notes
    );
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

export const refundTransaction: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const transaction = await transactionService.refundTransaction(req.params.id);
    res.json(transaction);
  } catch (error) {
    next(error);
  }
};
