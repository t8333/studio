
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Doctor, Product, Cycle, Visit } from '@/types';

const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');
const IS_VERCEL = !!process.env.VERCEL;

// In-memory stores, primarily for Vercel after initial load.
let doctorsStore: Doctor[] | null = null;
let productsStore: Product[] | null = null;
let cyclesStore: Cycle[] | null = null;
let visitsStore: Visit[] | null = null;

async function ensureDataDirExists() {
  if (!IS_VERCEL) {
    try {
      await fs.access(dataDir);
    } catch {
      try {
        await fs.mkdir(dataDir, { recursive: true });
      } catch (mkdirError) {
        console.error(`Failed to create data directory ${dataDir}:`, mkdirError);
        // No lanzar error aquí, loadDataFromFile lo manejará o creará el archivo.
      }
    }
  }
}

async function loadDataFromFile<T>(fileName: string): Promise<T[]> {
  const filePath = path.join(dataDir, fileName);
  try {
    await ensureDataDirExists();
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as T[];
  } catch (error: any) {
    if (!IS_VERCEL) {
      try {
        // If file doesn't exist or is corrupted locally, create/overwrite with empty array
        await fs.writeFile(filePath, JSON.stringify([], null, 2));
        return [];
      } catch (writeError: any) {
        console.error(`Failed to create/initialize ${fileName} locally: ${writeError.message}`);
        return []; // Fallback to empty if creation also fails
      }
    }
    // In Vercel, if file read fails (e.g., not in build), return empty.
    // The in-memory store will be used if already populated.
    return [];
  }
}

async function saveDataToFile<T>(fileName: string, data: T[]): Promise<void> {
  if (IS_VERCEL) {
    // console.log(`Vercel environment: Skipping file write for ${fileName}. Data is in memory.`);
    return; 
  }
  await ensureDataDirExists();
  const filePath = path.join(dataDir, fileName);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error(`Failed to write to ${fileName}: ${error.message}`);
    // Consider re-throwing or handling more gracefully if persistence is critical
    throw error; // Re-throw to make save operations aware of the failure
  }
}

// Doctors
export async function getDoctorsData(): Promise<Doctor[]> {
  if (IS_VERCEL && doctorsStore !== null) {
    return doctorsStore.map(d => ({ ...d })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }
  const loadedData = await loadDataFromFile<Doctor>('doctors.json');
  doctorsStore = loadedData.map(d => ({ ...d }));
  return doctorsStore.map(d => ({ ...d })).sort((a, b) => a.nombre.localeCompare(b.nombre));
}
export async function saveDoctorsData(data: Doctor[]): Promise<void> {
  doctorsStore = data.map(d => ({ ...d }));
  if (!IS_VERCEL) {
    await saveDataToFile<Doctor>('doctors.json', doctorsStore);
  }
}

// Products
export async function getProductsData(): Promise<Product[]> {
  if (IS_VERCEL && productsStore !== null) {
    return productsStore.map(p => ({ ...p })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }
  const loadedData = await loadDataFromFile<Product>('products.json');
  productsStore = loadedData.map(p => ({ ...p }));
  return productsStore.map(p => ({ ...p })).sort((a, b) => a.nombre.localeCompare(b.nombre));
}
export async function saveProductsData(data: Product[]): Promise<void> {
  productsStore = data.map(p => ({ ...p }));
  if (!IS_VERCEL) {
    await saveDataToFile<Product>('products.json', productsStore);
  }
}

// Cycles
export async function getCyclesData(): Promise<Cycle[]> {
  if (IS_VERCEL && cyclesStore !== null) {
     return cyclesStore.map(c => ({
      ...c,
      fechaInicio: new Date(c.fechaInicio).toISOString(),
      fechaFin: new Date(c.fechaFin).toISOString(),
      stockProductos: Array.isArray(c.stockProductos) ? c.stockProductos.map(sp => ({ ...sp })) : []
    })).sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime());
  }
  const loadedData = await loadDataFromFile<Cycle>('cycles.json');
  cyclesStore = loadedData.map(c => ({ ...c }));
   return cyclesStore.map(c => ({
    ...c,
    fechaInicio: new Date(c.fechaInicio).toISOString(),
    fechaFin: new Date(c.fechaFin).toISOString(),
    stockProductos: Array.isArray(c.stockProductos) ? c.stockProductos.map(sp => ({ ...sp })) : []
  })).sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime());
}
export async function saveCyclesData(data: Cycle[]): Promise<void> {
  cyclesStore = data.map(c => ({
    ...c,
    stockProductos: Array.isArray(c.stockProductos) ? c.stockProductos.map(sp => ({ ...sp })) : []
  }));
  if (!IS_VERCEL) {
    await saveDataToFile<Cycle>('cycles.json', cyclesStore);
  }
}

// Visits
export async function getVisitsData(): Promise<Visit[]> {
  if (IS_VERCEL && visitsStore !== null) {
    return visitsStore.map(v => ({
      ...v,
      fecha: new Date(v.fecha).toISOString(),
      productosEntregados: Array.isArray(v.productosEntregados) ? v.productosEntregados.map(vp => ({ ...vp })) : []
    })).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }
  const loadedData = await loadDataFromFile<Visit>('visits.json');
  visitsStore = loadedData.map(v => ({ ...v }));
  return visitsStore.map(v => ({
    ...v,
    fecha: new Date(v.fecha).toISOString(),
    productosEntregados: Array.isArray(v.productosEntregados) ? v.productosEntregados.map(vp => ({ ...vp })) : []
  })).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}
export async function saveVisitsData(data: Visit[]): Promise<void> {
  visitsStore = data.map(v => ({
    ...v,
    productosEntregados: Array.isArray(v.productosEntregados) ? v.productosEntregados.map(vp => ({ ...vp })) : []
  }));
  if (!IS_VERCEL) {
    await saveDataToFile<Visit>('visits.json', visitsStore);
  }
}
