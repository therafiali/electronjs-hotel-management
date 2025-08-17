// Utility functions for invoice formatting

/**
 * Format invoice ID for display (converts long ID to nice format like RESORT-001)
 * @param invoiceId - The original invoice ID from database
 * @returns Formatted invoice number for display
 */
export const formatInvoiceIdForDisplay = (invoiceId: string): string => {
  // Extract the random part and convert to a sequential number
  const parts = invoiceId.split('_');
  if (parts.length >= 3) {
    const randomPart = parts[2];
    // Convert the random string to a number for consistent display
    const hash = randomPart.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    const sequenceNumber = (hash % 999) + 1;
    return `RESORT-${sequenceNumber.toString().padStart(3, '0')}`;
  }
  return invoiceId; // Fallback to original if format is unexpected
};

/**
 * Get the sequence number from an invoice ID
 * @param invoiceId - The original invoice ID from database
 * @returns The sequence number (1-999)
 */
export const getInvoiceSequenceNumber = (invoiceId: string): number => {
  const parts = invoiceId.split('_');
  if (parts.length >= 3) {
    const randomPart = parts[2];
    const hash = randomPart.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    return (hash % 999) + 1;
  }
  return 0;
};
