
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Doctor, Product, Cycle, Visit } from '@/types';

const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');

// Helper function to ensure data directory exists
async function ensureDataDirExists() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Helper function to read data from a JSON file
async function readData<T>(fileName: string): Promise<T[]> {
  await ensureDataDirExists();
  const filePath = path.join(dataDir, fileName);
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as T[];
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array and create/overwrite it
    await fs.writeFile(filePath, JSON.stringify([], null, 2));
    return [];
  }
}

// Helper function to write data to a JSON file
async function writeData<T>(fileName: string, data: T[]): Promise<void> {
  await ensureDataDirExists();
  const filePath = path.join(dataDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Doctors
export async function getDoctorsData(): Promise<Doctor[]> {
  return readData<Doctor>('doctors.json');
}
export async function saveDoctorsData(data: Doctor[]): Promise<void> {
  return writeData<Doctor>('doctors.json', data);
}

// Products
export async function getProductsData(): Promise<Product[]> {
  return readData<Product>('products.json');
}
export async function saveProductsData(data: Product[]): Promise<void> {
  return writeData<Product>('products.json', data);
}

// Cycles
export async function getCyclesData(): Promise<Cycle[]> {
  return readData<Cycle>('cycles.json');
}
export async function saveCyclesData(data: Cycle[]): Promise<void> {
  return writeData<Cycle>('cycles.json', data);
}

// Visits
export async function getVisitsData(): Promise<Visit[]> {
  return readData<Visit>('visits.json');
}
export async function saveVisitsData(data: Visit[]): Promise<void> {
  return writeData<Visit>('visits.json', data);
}
