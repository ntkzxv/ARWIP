// src/services/bankService.ts
export const bankProvider = {
  generateTransactionId: () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `TXN${date}${random}`;
  }
};