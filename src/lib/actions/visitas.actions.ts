'use server';

import type { Visit, OptionalId, VisitProduct } from '@/types';
import { visitsData, cyclesData } from './placeholder-data';
import { revalidatePath } from 'next/cache';
import { adjustStockInCycle } from './ciclos.actions';

export async function getVisits(): Promise<Visit[]> {
  return JSON.parse(JSON.stringify(visitsData));
}

export async function getVisitById(id: string): Promise<Visit | undefined> {
  return JSON.parse(JSON.stringify(visitsData.find(v => v.id === id)));
}

export async function saveVisit(visitData: OptionalId<Visit>): Promise<Visit> {
  const cycle = cyclesData.find(c => c.id === visitData.cicloId);
  if (!cycle) throw new Error('Ciclo no encontrado para la visita');

  if (visitData.id) {
    // Update
    const index = visitsData.findIndex(v => v.id === visitData.id);
    if (index === -1) throw new Error('Visita no encontrada');
    
    const originalVisit = visitsData[index];

    // Revert stock from original visit
    for (const productDelivery of originalVisit.productosEntregados) {
      await adjustStockInCycle(originalVisit.cicloId, productDelivery.productoId, productDelivery.cantidadEntregada);
    }

    // Apply stock changes for new visit data
    for (const productDelivery of visitData.productosEntregados!) {
      // Check if enough stock BEFORE attempting to adjust
      const productStock = cycle.stockProductos.find(ps => ps.productoId === productDelivery.productoId);
      if (!productStock || productStock.cantidad < productDelivery.cantidadEntregada) {
         // Rollback stock changes made earlier in this update
         for (const pd of originalVisit.productosEntregados) {
           await adjustStockInCycle(originalVisit.cicloId, pd.productoId, -pd.cantidadEntregada);
         }
        throw new Error(`Stock insuficiente para ${productDelivery.productoId}. Disponible: ${productStock?.cantidad || 0}, Necesario: ${productDelivery.cantidadEntregada}`);
      }
      await adjustStockInCycle(visitData.cicloId!, productDelivery.productoId, -productDelivery.cantidadEntregada);
    }
    
    visitsData[index] = { ...originalVisit, ...visitData } as Visit;
    revalidatePath('/visitas');
    revalidatePath('/stock');
    return JSON.parse(JSON.stringify(visitsData[index]));

  } else {
    // Create
    for (const productDelivery of visitData.productosEntregados!) {
      const productStock = cycle.stockProductos.find(ps => ps.productoId === productDelivery.productoId);
      if (!productStock || productStock.cantidad < productDelivery.cantidadEntregada) {
        throw new Error(`Stock insuficiente para ${productDelivery.productoId}. Disponible: ${productStock?.cantidad || 0}, Necesario: ${productDelivery.cantidadEntregada}`);
      }
      await adjustStockInCycle(visitData.cicloId!, productDelivery.productoId, -productDelivery.cantidadEntregada);
    }

    const newVisit: Visit = {
      ...visitData,
      id: crypto.randomUUID(),
    } as Visit;
    visitsData.push(newVisit);
    revalidatePath('/visitas');
    revalidatePath('/stock');
    return JSON.parse(JSON.stringify(newVisit));
  }
}

export async function deleteVisit(id: string): Promise<void> {
  const index = visitsData.findIndex(v => v.id === id);
  if (index === -1) throw new Error('Visita no encontrada');

  const visitToDelete = visitsData[index];
  
  // Add stock back to cycle
  for (const productDelivery of visitToDelete.productosEntregados) {
    await adjustStockInCycle(visitToDelete.cicloId, productDelivery.productoId, productDelivery.cantidadEntregada);
  }

  visitsData.splice(index, 1);
  revalidatePath('/visitas');
  revalidatePath('/stock');
}
