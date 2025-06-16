
'use server';

import type { Cycle, OptionalId, CycleProductStock } from '@/types';
import { getCyclesData, saveCyclesData, getVisitsData, saveVisitsData } from './placeholder-data';
import { revalidatePath } from 'next/cache';
import { getProducts } from './productos.actions';


export async function getCycles(): Promise<Cycle[]> {
  return getCyclesData();
}

export async function getCycleById(id: string): Promise<Cycle | undefined> {
  const cycles = await getCyclesData();
  return cycles.find(c => c.id === id);
}

export async function saveCycle(cycleData: OptionalId<Cycle>): Promise<Cycle> {
  let cycles = await getCyclesData();
  const allProducts = await getProducts(); // Used for ensuring stock completeness

  if (cycleData.id) {
    const index = cycles.findIndex(c => c.id === cycleData.id);
    if (index === -1) throw new Error('Ciclo no encontrado');
    
    const currentCycle = cycles[index];
    const updatedStock = cycleData.stockProductos ? [...cycleData.stockProductos] : [...currentCycle.stockProductos];
    
    allProducts.forEach(p => {
      if (!updatedStock.find(sp => sp.productoId === p.id)) {
        updatedStock.push({ productoId: p.id, cantidad: 0 });
      }
    });
    
    cycles[index] = { 
      ...currentCycle, 
      ...cycleData,
      stockProductos: updatedStock
    } as Cycle;
    cycleData = cycles[index]; // to return the full object
  } else {
    const initialStock: CycleProductStock[] = allProducts.map(product => {
      const providedStock = cycleData.stockProductos?.find(sp => sp.productoId === product.id);
      return {
        productoId: product.id,
        cantidad: providedStock ? providedStock.cantidad : 0,
      };
    });

    const newCycle: Cycle = {
      ...cycleData,
      id: crypto.randomUUID(),
      stockProductos: initialStock,
    } as Cycle;
    cycles.push(newCycle);
    cycleData = newCycle; // to return the full object
  }

  await saveCyclesData(cycles);
  revalidatePath('/ciclos');
  revalidatePath('/stock');
  revalidatePath('/');
  return cycleData as Cycle;
}

export async function deleteCycle(id: string): Promise<void> {
  let cycles = await getCyclesData();
  const initialCyclesLength = cycles.length;
  cycles = cycles.filter(c => c.id !== id);
  if (cycles.length === initialCyclesLength) throw new Error('Ciclo no encontrado para eliminar');
  await saveCyclesData(cycles);

  let visits = await getVisitsData();
  visits = visits.filter(v => v.cicloId !== id);
  await saveVisitsData(visits);

  revalidatePath('/ciclos');
  revalidatePath('/visitas'); 
  revalidatePath('/stock');
  revalidatePath('/');
}

export async function adjustStockInCycle(cycleId: string, productId: string, changeAmount: number): Promise<void> {
  let cycles = await getCyclesData();
  const cycle = cycles.find(c => c.id === cycleId);
  if (!cycle) throw new Error('Ciclo no encontrado');

  const productStock = cycle.stockProductos.find(ps => ps.productoId === productId);
  if (!productStock) {
    // If product not in stock array, add it (could happen if product was added after cycle creation)
     cycle.stockProductos.push({ productoId: productId, cantidad: 0});
     // Find it again
     const newProductStock = cycle.stockProductos.find(ps => ps.productoId === productId)!;
     if (newProductStock.cantidad + changeAmount < 0) {
       throw new Error('No hay suficiente stock para esta operación (producto nuevo).');
     }
     newProductStock.cantidad += changeAmount;
  } else {
    if (productStock.cantidad + changeAmount < 0) {
      throw new Error('No hay suficiente stock para esta operación.');
    }
    productStock.cantidad += changeAmount;
  }
  
  await saveCyclesData(cycles);
  revalidatePath(`/ciclos`);
  revalidatePath(`/stock`);
  revalidatePath(`/visitas`); 
  revalidatePath('/');
}

export async function updateCycleStock(cycleId: string, updatedStock: CycleProductStock[]): Promise<void> {
  let cycles = await getCyclesData();
  const cycle = cycles.find(c => c.id === cycleId);
  if (!cycle) throw new Error('Ciclo no encontrado');

  const allAvailableProducts = await getProducts();
  for (const stockItem of updatedStock) {
    if (!allAvailableProducts.find(p => p.id === stockItem.productoId)) {
      throw new Error(`Producto con ID ${stockItem.productoId} no encontrado en el catálogo general.`);
    }
    if (stockItem.cantidad < 0) {
      throw new Error(`La cantidad de stock para el producto ${stockItem.productoId} no puede ser negativa.`);
    }
  }
  
  // Ensure all catalog products are represented in the cycle's stock, even if with 0 quantity
  const completeStockList: CycleProductStock[] = allAvailableProducts.map(p => {
    const existingStockItem = updatedStock.find(us => us.productoId === p.id);
    return {
      productoId: p.id,
      cantidad: existingStockItem ? existingStockItem.cantidad : 0
    };
  });

  cycle.stockProductos = completeStockList; 

  await saveCyclesData(cycles);
  revalidatePath(`/ciclos`);
  revalidatePath(`/stock`);
  revalidatePath('/');
}
