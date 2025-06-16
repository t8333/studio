
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Doctor, Product, Cycle, Visit } from '@/types';

const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');
const IS_VERCEL = !!process.env.VERCEL;

// Almacenes en memoria, usados principalmente en Vercel para escrituras temporales.
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
      await fs.mkdir(dataDir, { recursive: true });
    }
  }
}

async function loadDataFromFile<T>(fileName: string): Promise<T[]> {
  await ensureDataDirExists();
  const filePath = path.join(dataDir, fileName);
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as T[];
  } catch (error) {
    if (!IS_VERCEL) {
      // En local, si el archivo no existe o hay error, lo creamos vacío.
      await fs.writeFile(filePath, JSON.stringify([], null, 2));
    }
    // En Vercel, si el archivo no está en el build, o local si hay error, devolvemos vacío.
    return [];
  }
}

async function initializeStores() {
  if (dataInitialized) return;

  // Cargar desde archivos a los stores en memoria.
  // Esto es importante para que Vercel tenga los datos del build como base.
  doctorsStore = await loadDataFromFile<Doctor>('doctors.json');
  productsStore = await loadDataFromFile<Product>('products.json');
  cyclesStore = await loadDataFromFile<Cycle>('cycles.json');
  visitsStore = await loadDataFromFile<Visit>('visits.json');
  
  dataInitialized = true;
}


// Doctors
export async function getDoctorsData(): Promise<Doctor[]> {
  await initializeStores();
  return doctorsStore.map(d => ({ ...d })); // Devolver copia
}
export async function saveDoctorsData(data: Doctor[]): Promise<void> {
  await initializeStores();
  doctorsStore = data.map(d => ({ ...d })); // Actualizar store en memoria con copia
  if (!IS_VERCEL) {
    const filePath = path.join(dataDir, 'doctors.json');
    await fs.writeFile(filePath, JSON.stringify(doctorsStore, null, 2));
  }
}

// Products
export async function getProductsData(): Promise<Product[]> {
  await initializeStores();
  return productsStore.map(p => ({ ...p }));
}
export async function saveProductsData(data: Product[]): Promise<void> {
  await initializeStores();
  productsStore = data.map(p => ({ ...p }));
  if (!IS_VERCEL) {
    const filePath = path.join(dataDir, 'products.json');
    await fs.writeFile(filePath, JSON.stringify(productsStore, null, 2));
  }
}

// Cycles
export async function getCyclesData(): Promise<Cycle[]> {
  await initializeStores();
  return cyclesStore.map(c => ({ 
    ...c, 
    stockProductos: c.stockProductos.map(sp => ({...sp})) // Copia profunda para array anidado
  }));
}
export async function saveCyclesData(data: Cycle[]): Promise<void> {
  await initializeStores();
  cyclesStore = data.map(c => ({ 
    ...c,
    stockProductos: c.stockProductos.map(sp => ({...sp}))
  }));
  if (!IS_VERCEL) {
    const filePath = path.join(dataDir, 'cycles.json');
    await fs.writeFile(filePath, JSON.stringify(cyclesStore, null, 2));
  }
}

// Visits
export async function getVisitsData(): Promise<Visit[]> {
  await initializeStores();
  return visitsStore.map(v => ({ 
    ...v,
    productosEntregados: v.productosEntregados.map(vp => ({...vp})) // Copia profunda para array anidado
  }));
}
export async function saveVisitsData(data: Visit[]): Promise<void> {
  await initializeStores();
  visitsStore = data.map(v => ({ 
    ...v,
    productosEntregados: v.productosEntregados.map(vp => ({...vp}))
  }));
  if (!IS_VERCEL) {
    const filePath = path.join(dataDir, 'visits.json');
    await fs.writeFile(filePath, JSON.stringify(visitsStore, null, 2));
  }
}
