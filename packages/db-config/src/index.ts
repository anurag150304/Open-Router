import { prisma } from "./client.js";

export const userDB = prisma.user;
export const apiDB = prisma.aPI_Key;
export const companiesDB = prisma.companies;
export const providersDB = prisma.providers;
export const modelsDB = prisma.models;
export const modelProvidersDB = prisma.modelProviders;
export const conversationsDB = prisma.conversations;
export const transactionsDB = prisma.transactions;

export { prisma as DB };
export { default } from "./client.js";
