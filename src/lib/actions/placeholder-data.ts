
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Doctor, Product, Cycle, Visit } from '@/types';

const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');
const IS_VERCEL = !!process.env.VERCEL;

// In-memory stores. These will be the primary source in Vercel or if file loading fails.
let doctorsStore: Doctor[] = [];
let productsStore: Product[] = [];
let cyclesStore: Cycle[] = [];
let visitsStore: Visit[] = [];

let dataInitialized = false;

async function ensureDataDirExists() {
  if (!IS_VERCEL) {
    try {
      await fs.access(dataDir);
    } catch {
      try {
        await fs.mkdir(dataDir, { recursive: true });
        // console.log(`Data directory created: ${dataDir}`);
      } catch (mkdirError) {
        console.error(`Failed to create data directory ${dataDir}:`, mkdirError);
      }
    }
  }
}

async function loadDataFromFile<T>(fileName: string, inMemoryStore: T[]): Promise<T[]> {
  if (IS_VERCEL && inMemoryStore.length > 0 && dataInitialized) { // In Vercel, after initial load, use memory
    return inMemoryStore.map(item => ({ ...item }));
  }

  const filePath = path.join(dataDir, fileName);
  try {
    await ensureDataDirExists(); // Ensure directory exists before trying to read/write
    const fileContent = await fs.readFile(filePath, 'utf-8');
    // console.log(`Successfully read ${fileName}`);
    return JSON.parse(fileContent) as T[];
  } catch (error: any) {
    // console.warn(`Could not read ${fileName}: ${error.message}. Using in-memory store or initializing as empty.`);
    if (!IS_VERCEL) { // If local and file doesn't exist or is corrupted, try to create it
      try {
        await fs.writeFile(filePath, JSON.stringify([], null, 2));
        // console.log(`Created empty ${fileName} locally.`);
      } catch (writeError: any) {
        console.error(`Failed to create empty ${fileName} locally: ${writeError.message}`);
      }
    }
    return []; // Return empty or current in-memory if Vercel
  }
}

async function saveDataToFile<T>(fileName: string, data: T[]): Promise<void> {
  if (IS_VERCEL) {
    // console.log(`Vercel environment: Skipping file write for ${fileName}. Data is in memory.`);
    return; // Don't write to file system on Vercel
  }
  await ensureDataDirExists();
  const filePath = path.join(dataDir, fileName);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    // console.log(`Successfully wrote to ${fileName}`);
  } catch (error: any) {
    console.error(`Failed to write to ${fileName}: ${error.message}`);
  }
}

async function initializeAllStores() {
  if (dataInitialized && IS_VERCEL) return; // In Vercel, only initialize once

  doctorsStore = await loadDataFromFile<Doctor>('doctors.json', doctorsStore);
  productsStore = await loadDataFromFile<Product>('products.json', productsStore);
  cyclesStore = await loadDataFromFile<Cycle>('cycles.json', cyclesStore);
  visitsStore = await loadDataFromFile<Visit>('visits.json', visitsStore);

  dataInitialized = true;
  // console.log("All data stores initialized.");
}

// Doctors
export async function getDoctorsData(): Promise<Doctor[]> {
  await initializeAllStores();
  return doctorsStore.map(d => ({ ...d })).sort((a, b) => a.nombre.localeCompare(b.nombre));
}
export async function saveDoctorsData(data: Doctor[]): Promise<void> {
  await initializeAllStores(); 
  doctorsStore = data.map(d => ({ ...d }));
  await saveDataToFile<Doctor>('doctors.json', doctorsStore);
}

// Products
export async function getProductsData(): Promise<Product[]> {
  await initializeAllStores();
  return productsStore.map(p => ({ ...p })).sort((a, b) => a.nombre.localeCompare(b.nombre));
}
export async function saveProductsData(data: Product[]): Promise<void> {
  await initializeAllStores();
  productsStore = data.map(p => ({ ...p }));
  await saveDataToFile<Product>('products.json', productsStore);
}

// Cycles
export async function getCyclesData(): Promise<Cycle[]> {
  await initializeAllStores();
  return cyclesStore.map(c => ({
    ...c,
    fechaInicio: new Date(c.fechaInicio).toISOString(),
    fechaFin: new Date(c.fechaFin).toISOString(),
    stockProductos: Array.isArray(c.stockProductos) ? c.stockProductos.map(sp => ({ ...sp })) : []
  })).sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime());
}
export async function saveCyclesData(data: Cycle[]): Promise<void> {
  await initializeAllStores();
  cyclesStore = data.map(c => ({
    ...c,
    stockProductos: Array.isArray(c.stockProductos) ? c.stockProductos.map(sp => ({ ...sp })) : []
  }));
  await saveDataToFile<Cycle>('cycles.json', cyclesStore);
}

// Visits
export async function getVisitsData(): Promise<Visit[]> {
  await initializeAllStores();
  return visitsStore.map(v => ({
    ...v,
    fecha: new Date(v.fecha).toISOString(),
    productosEntregados: Array.isArray(v.productosEntregados) ? v.productosEntregados.map(vp => ({ ...vp })) : []
  })).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}
export async function saveVisitsData(data: Visit[]): Promise<void> {
  await initializeAllStores();
  visitsStore = data.map(v => ({
    ...v,
    productosEntregados: Array.isArray(v.productosEntregados) ? v.productosEntregados.map(vp => ({ ...vp })) : []
  }));
  await saveDataToFile<Visit>('visits.json', visitsStore);
}
