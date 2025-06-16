
import type { Doctor, Product, Cycle, Visit } from '@/types';

// Extend the NodeJS.Global interface to declare our global variables
declare global {
  // eslint-disable-next-line no-var
  var __doctorsData: Doctor[] | undefined;
  // eslint-disable-next-line no-var
  var __productsData: Product[] | undefined;
  // eslint-disable-next-line no-var
  var __cyclesData: Cycle[] | undefined;
  // eslint-disable-next-line no-var
  var __visitsData: Visit[] | undefined;
}

// Attempt to use existing global data if available, otherwise initialize.
// This will persist data in memory for the lifetime of the server process.
// It's suitable for development and simple single-instance "test server" scenarios.
// For production with multiple instances or restarts, a proper database is needed.
if (!global.__doctorsData) {
  global.__doctorsData = [];
}
if (!global.__productsData) {
  global.__productsData = [];
}
if (!global.__cyclesData) {
  global.__cyclesData = [];
}
if (!global.__visitsData) {
  global.__visitsData = [];
}

export const doctorsData: Doctor[] = global.__doctorsData!;
export const productsData: Product[] = global.__productsData!;
export const cyclesData: Cycle[] = global.__cyclesData!;
export const visitsData: Visit[] = global.__visitsData!;
