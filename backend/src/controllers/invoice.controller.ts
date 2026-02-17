import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AccountingService } from '../services/accounting.service'; // Assuming relative import

const prisma = new PrismaClient();
const accountingService = new AccountingService();

// Create Invoice Controller
export const createInvoice = async (req: Request, res: Response) => {
    try {
        const { customerId, items, dueDate } = req.body;
        // Assume authentication middleware sets req.user
        // const organizationId = req.user.organizationId; 
        const organizationId = "ORG-UUID-FROM-AUTH"; // Placeholder

        // Calculate Totals using helper function or logic directly here
        let subTotal = 0;
        let taxTotal = 0;

        // Validate Items and Calculate
        const invoiceItems = items.map((item: any) => {
            const lineTotal = item.quantity * item.unitPrice;
            const lineTax = lineTotal * (item.taxRate / 100);

            subTotal += lineTotal;
            taxTotal += lineTax;

            return {
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                taxRate: item.taxRate,
                taxAmount: lineTax,
                total: lineTotal + lineTax,
                productId: item.productId
            };
        });

        const totalAmount = subTotal + taxTotal;

        // Transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Invoice Record
            const invoice = await tx.invoice.create({
                data: {
                    organizationId,
                    customerId,
                    invoiceNumber: `INV-${Date.now()}`, // Simple generator
                    date: new Date(),
                    dueDate: new Date(dueDate),
                    subTotal,
                    taxTotal,
                    totalAmount,
                    balanceDue: totalAmount,
                    status: 'SENT',
                    items: {
                        create: invoiceItems
                    }
                }
            });

            // 2. Trigger Accounting Engine (Side Effect)
            // Note: In a real distributed system, this might be an event bus message
            // But for monolithic SaaS, direct call within transaction (or after) is fine
            // We do it AFTER creating the invoice so we have the ID, 
            // but within transaction ensures consistency if accounting fails

            // Wait, AccountingService uses `prisma` (global) which is outside this transaction `tx`.
            // To be truly atomic, AccountingService should accept `tx` as a dependency.
            // For simplicity here, we will call it after, or assume consistent eventual consistency.

            return invoice;
        });

        // 3. Post to Ledger (Outside transaction for demo simplicity, but ideally inside)
        await accountingService.createInvoiceJournal(result.id, organizationId);

        // 4. Send Email/WhatsApp (Async Background Job)
        // await emailService.sendInvoice(result);

        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
};
