import { prisma } from "@palash/db-client";

/**
 * Generate a meaningful membership ID in the format: MEM-YYYY-XXX
 * Example: MEM-2025-001, MEM-2025-002, etc.
 */
export async function generateMembershipId(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `MEM-${currentYear}`;

    // Find the latest membership ID for this year
    const latestMembership = await prisma.userMembership.findFirst({
        where: {
            id: {
                startsWith: prefix
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        select: {
            id: true
        }
    });

    let sequenceNumber = 1;

    if (latestMembership) {
        // Extract the sequence number from the ID (e.g., "MEM-2025-001" -> 1)
        const parts = latestMembership.id.split('-');
        const lastSequence = parseInt(parts[parts.length - 1], 10);
        
        if (!isNaN(lastSequence)) {
            sequenceNumber = lastSequence + 1;
        }
    }

    // Pad the sequence number with leading zeros (3 digits)
    const paddedSequence = sequenceNumber.toString().padStart(3, '0');
    
    return `${prefix}-${paddedSequence}`;
}

/**
 * Generate a meaningful payment order ID in the format: ORD-YYYY-MMDD-XXX
 * Example: ORD-2025-1012-001, ORD-2025-1012-002, etc.
 */
export async function generateOrderId(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const prefix = `ORD-${year}-${month}${day}`;

    // Find the latest order ID for today
    const latestPayment = await prisma.payment.findFirst({
        where: {
            order_id: {
                startsWith: prefix
            }
        },
        orderBy: {
            date: 'desc'
        },
        select: {
            order_id: true
        }
    });

    let sequenceNumber = 1;

    if (latestPayment) {
        // Extract the sequence number from the order ID
        const parts = latestPayment.order_id.split('-');
        const lastSequence = parseInt(parts[parts.length - 1], 10);
        
        if (!isNaN(lastSequence)) {
            sequenceNumber = lastSequence + 1;
        }
    }

    // Pad the sequence number with leading zeros (3 digits)
    const paddedSequence = sequenceNumber.toString().padStart(3, '0');
    
    return `${prefix}-${paddedSequence}`;
}

/**
 * Generate a meaningful payment ID in the format: PAY-YYYY-MMDD-XXX
 * Example: PAY-2025-1012-001, PAY-2025-1012-002, etc.
 */
export async function generatePaymentId(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const prefix = `PAY-${year}-${month}${day}`;

    // Find the latest payment ID for today
    const latestPayment = await prisma.payment.findFirst({
        where: {
            payment_id: {
                startsWith: prefix
            }
        },
        orderBy: {
            date: 'desc'
        },
        select: {
            payment_id: true
        }
    });

    let sequenceNumber = 1;

    if (latestPayment) {
        // Extract the sequence number from the payment ID
        const parts = latestPayment.payment_id.split('-');
        const lastSequence = parseInt(parts[parts.length - 1], 10);
        
        if (!isNaN(lastSequence)) {
            sequenceNumber = lastSequence + 1;
        }
    }

    // Pad the sequence number with leading zeros (3 digits)
    const paddedSequence = sequenceNumber.toString().padStart(3, '0');
    
    return `${prefix}-${paddedSequence}`;
}

