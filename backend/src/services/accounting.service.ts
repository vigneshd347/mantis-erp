
import { PrismaClient, Invoice, Payment, Expense } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------
// ACCOUNTING SERVICE
// ---------------------------------------
// Comprehensive Double-Entry Logic
// Ensure every specialized accounting function updates the General Ledger via Journal Entries.

export class AccountingService {

    /**
     * Post Journal Entry for a Sales Invoice to the General Ledger
     * DR Accounts Receivable (Asset)
     * CR Sales Revenue (Income)
     * CR Sales Tax Payable (Liability)
     */
    async createInvoiceJournal(invoiceId: string, organizationId: string) {
        // 1. Fetch Invoice with items
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { items: true }
        });

        if (!invoice) throw new Error("Invoice not found");

        // 2. Fetch or Create System Accounts (In a real app, these are pre-configured)
        // Using placeholders for demonstration. System accounts should be looked up by code.
        const arAccount = await this.getSystemAccount(organizationId, 'ACCOUNTS_RECEIVABLE');
        const salesTaxAccount = await this.getSystemAccount(organizationId, 'SALES_TAX_PAYABLE');
        // Default Sales Account if not specified per item
        const defaultSalesAccount = await this.getSystemAccount(organizationId, 'SALES_REVENUE');

        // 3. Prepare Journal Lines
        const lines = [];

        // DR Accounts Receivable (Total Amount including Tax)
        lines.push({
            accountId: arAccount.id,
            debit: invoice.totalAmount,
            credit: 0,
            description: `Invoice #${invoice.invoiceNumber} - Customer`
        });

        // CR Sales Revenue (Subtotal)
        // Iterate items to credit specific revenue accounts if needed
        for (const item of invoice.items) {
            const revenueAccount = item.accountId ? item.accountId : defaultSalesAccount.id;

            lines.push({
                accountId: revenueAccount, // item specific revenue account or default
                debit: 0,
                credit: item.total.sub(item.taxAmount || 0), // Net sales amount
                description: `Revenue - ${item.description}`
            });
        }

        // CR Sales Tax (Total Tax)
        if (invoice.taxTotal.gt(0)) {
            lines.push({
                accountId: salesTaxAccount.id,
                debit: 0,
                credit: invoice.taxTotal,
                description: `Sales Tax for Invoice #${invoice.invoiceNumber}`
            });
        }

        // 4. Create Journal Entry
        const journal = await prisma.journalEntry.create({
            data: {
                organizationId,
                entryNumber: `JE-${Date.now()}`, // Simple generator
                date: new Date(), // Booking date usually Invoice Date
                reference: invoice.invoiceNumber,
                description: `Journal for Invoice #${invoice.invoiceNumber}`,
                lines: {
                    create: lines
                },
                // Link back to Invoice
                invoice: { connect: { id: invoice.id } }
            }
        });

        // 5. Update Invoice with Journal Link
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: { journalEntryId: journal.id }
        });

        return journal;
    }

    /**
     * Post Journal Entry for Payment Received
     * DR Bank/Cash (Asset)
     * CR Accounts Receivable (Asset)
     */
    async createPaymentReceivedJournal(paymentId: string, organizationId: string) {
        const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment) throw new Error("Payment not found");

        const bankAccount = payment.accountId; // The bank account funds were deposited to
        const arAccount = (await this.getSystemAccount(organizationId, 'ACCOUNTS_RECEIVABLE')).id;

        const lines = [
            // DR Bank (Asset increases)
            {
                accountId: bankAccount,
                debit: payment.amount,
                credit: 0,
                description: `Payment Received - ${payment.reference}`
            },
            // CR Accounts Receivable (Asset decreases)
            {
                accountId: arAccount,
                debit: 0,
                credit: payment.amount,
                description: `Payment for Invoice`
            }
        ];

        return await prisma.journalEntry.create({
            data: {
                organizationId,
                entryNumber: `JE-PAY-${Date.now()}`,
                date: payment.date,
                reference: payment.paymentNumber,
                description: `Payment Received ${payment.paymentNumber}`,
                lines: { create: lines },
                payment: { connect: { id: payment.id } }
            }
        });
    }

    // Helper to fetch system accounts by code/type
    private async getSystemAccount(organizationId: string, type: string) {
        // In production, this would look up by specific codes mapped in settings
        // For demo, we are mocking the return of an account object
        // You MUST implement the initialization of Chart of Accounts for each tenant
        const account = await prisma.account.findFirst({
            where: { organizationId, name: type } // Simplified lookup
        });

        if (!account) {
            throw new Error(`System Account ${type} not configured for organization.`);
        }
        return account;
    }
}
