'use server';

import type { Cycle, OptionalId, CycleProductStock, Product } from '@/types';
import { cyclesData, productsData, visitsData } from './placeholder-data';
import { revalidatePath } from 'next/cache';
import { getProducts } from './productos.actions';


export async function getCycles(): Promise<Cycle[]> {
  return JSON.parse(JSON.stringify(cyclesData));
}

export async function getCycleById(id: string): Promise<Cycle | undefined> {
  return JSON.parse(JSON.stringify(cyclesData.find(c => c.id === id)));
}

export async function saveCycle(cycleData: OptionalId<Cycle>): Promise<Cycle> {
  const allProducts = await getProducts();

  if (cycleData.id) {
    // Update
    const index = cyclesData.findIndex(c => c.id === cycleData.id);
    if (index === -1) throw new Error('Ciclo no encontrado');
    
    const updatedStock = cycleData.stockProductos ? [...cycleData.stockProductos] : [...cyclesData[index].stockProductos];
    
    // Ensure all products are represented in stock
    allProducts.forEach(p => {
      if (!updatedStock.find(sp => sp.productoId === p.id)) {
        updatedStock.push({ productoId: p.id, cantidad: 0 });
      }
    });
    
    cyclesData[index] = { 
      ...cyclesData[index], 
      ...cycleData,
      stockProductos: updatedStock
    } as Cycle;
    revalidatePath('/ciclos');
    revalidatePath('/stock');
    return JSON.parse(JSON.stringify(cyclesData[index]));
  } else {
    // Create
    const initialStock: CycleProductStock[] = allProducts.map(product => {
      const providedStock = cycleData.stockProductos?.find(sp => sp.productoId === product.id);
      return {
        productoId: product.id,
        cantidad: providedStock ? providedStock.cantidad : 0, // Default to 0 if not provided
      };
    });

    const newCycle: Cycle = {
      ...cycleData,
      id: crypto.randomUUID(),
      stockProductos: initialStock,
    } as Cycle;
    cyclesData.push(newCycle);
    revalidatePath('/ciclos');
    revalidatePath('/stock');
    return JSON.parse(JSON.stringify(newCycle));
  }
}

export async function deleteCycle(id: string): Promise<void> {
  const index = cyclesData.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Ciclo no encontrado');

  // Check for related visits - for now, allow deletion
  // const relatedVisits = visitsData.filter(v => v.cicloId === id);
  // if (relatedVisits.length > 0) {
  //   throw new Error('No se puede eliminar el ciclo porque tiene visitas asociadas. Elimine primero las visitas.');
  // }
  
  // For simplicity, we'll delete associated visits if any. In real app, this might be restricted.
  const visitsToRemove = visitsData.filter(v => v.cicloId === id);
  visitsToRemove.forEach(v => {
    const visitIndex = visitsData.findIndex(visit => visit.id === v.id);
    if (visitIndex !== -1) visitsData.splice(visitIndex, 1);
  });


  cyclesData.splice(index, 1);
  revalidatePath('/ciclos');
  revalidatePath('/visitas'); // As visits might be deleted
  revalidatePath('/stock');
}

export async function adjustStockInCycle(cycleId: string, productId: string, changeAmount: number): Promise<void> {
  const cycle = cyclesData.find(c => c.id === cycleId);
  if (!cycle) throw new Error('Ciclo no encontrado');

  const productStock = cycle.stockProductos.find(ps => ps.productoId === productId);
  if (!productStock) throw new Error('Producto no encontrado en el stock del ciclo');

  if (productStock.cantidad + changeAmount < 0) {
    throw new Error('No hay suficiente stock para esta operación.');
  }
  productStock.cantidad += changeAmount;
  
  revalidatePath(`/ciclos`);
  revalidatePath(`/stock`);
  revalidatePath(`/visitas`); // Visits might depend on stock availability
}

export async function updateCycleStock(cycleId: string, updatedStock: CycleProductStock[]): Promise<void> {
  const cycle = cyclesData.find(c => c.id === cycleId);
  if (!cycle) throw new Error('Ciclo no encontrado');

  // Validate all product IDs exist
  const allProducts = await getProducts();
  for (const stockItem of updatedStock) {
    if (!allProducts.find(p => p.id === stockItem.productoId)) {
      throw new Error(`Producto con ID ${stockItem.productoId} no encontrado.`);
    }
    if (stockItem.cantidad < 0) {
      throw new Error(`La cantidad de stock para el producto ${stockItem.productoId} no puede ser negativa.`);
    }
  }
  
  cycle.stockProductos = updatedStock.map(s => ({...s})); // Ensure new array/objects for reactivity if needed

  revalidatePath(`/ciclos`);
  revalidatePath(`/stock`);
}
