
'use server';

import type { Cycle, OptionalId, CycleProductStock } from '@/types';
import { getCyclesData, saveCyclesData, getProductsData, getVisitsData, saveVisitsData } from './placeholder-data';
import { revalidatePath } from 'next/cache';

export async function getCycles(): Promise<Cycle[]> {
  return await getCyclesData();
}

export async function getCycleById(id: string): Promise<Cycle | undefined> {
  const cycles = await getCyclesData();
  return cycles.find(c => c.id === id);
}

export async function saveCycle(cycleData: OptionalId<Cycle>): Promise<Cycle> {
  let cycles = await getCyclesData();
  const allProducts = await getProductsData();
  let savedCycle: Cycle;

  const completeStock: CycleProductStock[] = allProducts.map(product => {
    const existingStockItem = (cycleData.stockProductos || []).find(sp => sp.productoId === product.id);
    return {
      productoId: product.id,
      cantidad: existingStockItem ? existingStockItem.cantidad : 0,
    };
  });

  const dataToSave = {
    nombre: cycleData.nombre,
    fechaInicio: new Date(cycleData.fechaInicio).toISOString(),
    fechaFin: new Date(cycleData.fechaFin).toISOString(),
    prioridadesMarketing: cycleData.prioridadesMarketing || '',
    stockProductos: completeStock,
  };

  if (cycleData.id) {
    const index = cycles.findIndex(c => c.id === cycleData.id);
    if (index === -1) throw new Error('Ciclo no encontrado para actualizar');
    savedCycle = { ...cycles[index], ...dataToSave, id: cycleData.id }; // Ensure id is preserved
    cycles[index] = savedCycle;
  } else {
    savedCycle = {
      ...dataToSave,
      id: String(Date.now() + Math.random()), // Simple unique ID
    } as Cycle; // Cast needed as id is now definitely present
    cycles.push(savedCycle);
  }

  await saveCyclesData(cycles);
  revalidatePath('/ciclos');
  revalidatePath('/stock');
  revalidatePath('/');
  return savedCycle;
}

export async function deleteCycle(id: string): Promise<void> {
  let cycles = await getCyclesData();
  const initialLength = cycles.length;
  cycles = cycles.filter(c => c.id !== id);
   if (cycles.length === initialLength && initialLength > 0) {
    // No error if not found
  }
  await saveCyclesData(cycles);

  // Delete associated visits
  let visits = await getVisitsData();
  visits = visits.filter(v => v.cicloId !== id);
  await saveVisitsData(visits);

  revalidatePath('/ciclos');
  revalidatePath('/visitas');
  revalidatePath('/stock');
  revalidatePath('/');
}

export async function updateCycleStock(cycleId: string, updatedStockItems: CycleProductStock[]): Promise<void> {
  let cycles = await getCyclesData();
  const cycleIndex = cycles.findIndex(c => c.id === cycleId);
  if (cycleIndex === -1) throw new Error('Ciclo no encontrado');

  const allProducts = await getProductsData();
  for (const stockItem of updatedStockItems) {
     if (!allProducts.find(p => p.id === stockItem.productoId)) {
      throw new Error(`Producto con ID ${stockItem.productoId} no encontrado en el catálogo general.`);
    }
    if (stockItem.cantidad < 0) {
      const productName = allProducts.find(p => p.id === stockItem.productoId)?.nombre || stockItem.productoId;
      throw new Error(`La cantidad de stock para el producto ${productName} no puede ser negativa.`);
    }
  }
  
  const completeStockList: CycleProductStock[] = allProducts.map(p => {
    const existingStockItem = updatedStockItems.find(us => us.productoId === p.id);
    return {
      productoId: p.id,
      cantidad: existingStockItem ? existingStockItem.cantidad : 0
    };
  });

  cycles[cycleIndex].stockProductos = completeStockList;
  await saveCyclesData(cycles);
  revalidatePath('/ciclos');
  revalidatePath('/stock');
  revalidatePath('/');
}
