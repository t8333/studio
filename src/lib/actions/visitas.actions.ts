
'use server';

import type { Visit, OptionalId } from '@/types';
import { getVisitsData, saveVisitsData, getCyclesData, saveCyclesData } from './placeholder-data';
import { revalidatePath } from 'next/cache';
import { adjustStockInCycle } from './ciclos.actions'; // We'll use this simplified stock adjustment

export async function getVisits(): Promise<Visit[]> {
  return getVisitsData();
}

export async function getVisitById(id: string): Promise<Visit | undefined> {
  const visits = await getVisitsData();
  return visits.find(v => v.id === id);
}

export async function saveVisit(visitData: OptionalId<Visit>): Promise<Visit> {
  let visits = await getVisitsData();
  let cycles = await getCyclesData(); // Needed for stock validation

  const cycleForVisit = cycles.find(c => c.id === visitData.cicloId);
  if (!cycleForVisit) throw new Error('Ciclo no encontrado para la visita');

  if (visitData.id) {
    // Update
    const index = visits.findIndex(v => v.id === visitData.id);
    if (index === -1) throw new Error('Visita no encontrada');
    
    const originalVisit = visits[index];

    // 1. Revert stock from original visit if cycleId is the same
    if (originalVisit.cicloId === visitData.cicloId) {
      for (const productDelivery of originalVisit.productosEntregados) {
        await adjustStockInCycle(originalVisit.cicloId, productDelivery.productoId, productDelivery.cantidadEntregada);
      }
    } else {
      // If cycleId changed, revert stock from old cycle
      for (const productDelivery of originalVisit.productosEntregados) {
        await adjustStockInCycle(originalVisit.cicloId, productDelivery.productoId, productDelivery.cantidadEntregada);
      }
    }

    // 2. Validate and apply stock changes for the new/updated visit data
    // We need to read cycles again as adjustStockInCycle modifies and saves it.
    cycles = await getCyclesData();
    const currentCycleForStock = cycles.find(c => c.id === visitData.cicloId);
    if (!currentCycleForStock) throw new Error('Ciclo de destino no encontrado para actualizar stock.');

    for (const productDelivery of visitData.productosEntregados!) {
      const productStock = currentCycleForStock.stockProductos.find(ps => ps.productoId === productDelivery.productoId);
      const availableStock = productStock ? productStock.cantidad : 0;
      if (availableStock < productDelivery.cantidadEntregada) {
        // Rollback stock changes made just before this check if any
        // This is complex, ideally transactions are needed. For JSON, we just error out.
        // For simplicity in this JSON model, we'll assume that if validation fails here, previous stock adjustments (reversions) stand.
        throw new Error(`Stock insuficiente para ${productDelivery.productoId} en el ciclo ${currentCycleForStock.nombre}. Disponible: ${availableStock}, Necesario: ${productDelivery.cantidadEntregada}`);
      }
      await adjustStockInCycle(visitData.cicloId!, productDelivery.productoId, -productDelivery.cantidadEntregada);
    }
    
    visits[index] = { ...originalVisit, ...visitData } as Visit;
    visitData = visits[index]; // To return the full object
  } else {
    // Create
    // Validate and apply stock changes
    for (const productDelivery of visitData.productosEntregados!) {
      const productStock = cycleForVisit.stockProductos.find(ps => ps.productoId === productDelivery.productoId);
      const availableStock = productStock ? productStock.cantidad : 0;
      if (availableStock < productDelivery.cantidadEntregada) {
        throw new Error(`Stock insuficiente para ${productDelivery.productoId} en el ciclo ${cycleForVisit.nombre}. Disponible: ${availableStock}, Necesario: ${productDelivery.cantidadEntregada}`);
      }
      // Deduct stock
      await adjustStockInCycle(visitData.cicloId!, productDelivery.productoId, -productDelivery.cantidadEntregada);
    }

    const newVisit: Visit = {
      ...visitData,
      id: crypto.randomUUID(),
    } as Visit;
    visits.push(newVisit);
    visitData = newVisit; // To return the full object
  }

  await saveVisitsData(visits);
  revalidatePath('/visitas');
  revalidatePath('/stock');
  revalidatePath('/');
  return visitData as Visit;
}

export async function deleteVisit(id: string): Promise<void> {
  let visits = await getVisitsData();
  const visitToDelete = visits.find(v => v.id === id);
  if (!visitToDelete) throw new Error('Visita no encontrada para eliminar');

  const initialLength = visits.length;
  visits = visits.filter(v => v.id !== id);
   if (visits.length === initialLength) throw new Error('Visita no encontrada para eliminar');
  
  // Add stock back to cycle
  for (const productDelivery of visitToDelete.productosEntregados) {
    await adjustStockInCycle(visitToDelete.cicloId, productDelivery.productoId, productDelivery.cantidadEntregada);
  }

  await saveVisitsData(visits);
  revalidatePath('/visitas');
  revalidatePath('/stock');
  revalidatePath('/');
}
