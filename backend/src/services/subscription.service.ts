
import { PrismaClient, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class SubscriptionService {

    // Check if Organization can perform action based on Plan Limits
    async checkLimit(organizationId: string, featureToCheck: 'INVOICES' | 'USERS'): Promise<boolean> {
        const org = await prisma.organization.findUnique({
            where: { id: organizationId }
        });

        if (!org || org.subscriptionStatus !== 'ACTIVE') return false;

        const plan = org.subscriptionPlan;

        if (featureToCheck === 'INVOICES') {
            const count = await prisma.invoice.count({
                where: {
                    organizationId,
                    date: { // Current Month
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            });

            // Example Limits
            const maxInvoices = {
                FREE: 10,
                STARTER: 100,
                PROFESSIONAL: 1000,
                ENTERPRISE: Infinity
            };

            return count < maxInvoices[plan];
        }

        return true;
    }

    // Upgrade Subscription (Mock Payment Integration)
    async upgradeSubscription(organizationId: string, newPlan: SubscriptionPlan) {
        // 1. Process Payment via Stripe (omitted for brevity)
        // const paymentSuccess = await stripe.charges.create({...});
        const paymentSuccess = true;

        if (paymentSuccess) {
            // 2. Update DB
            return await prisma.organization.update({
                where: { id: organizationId },
                data: {
                    subscriptionPlan: newPlan,
                    subscriptionStatus: 'ACTIVE',
                    subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
                }
            });
        }
        throw new Error("Payment Failed");
    }
}
