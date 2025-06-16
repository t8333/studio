
'use server';

import type { Visit, OptionalId } from '@/types';
import { getVisitsData, saveVisitsData, getCyclesData, saveCyclesData, getProductsData } from './placeholder-data';
import { revalidatePath } from 'next/cache';

export async function getVisits(): Promise<Visit[]> {
  return await getVisitsData();
}

export async function getVisitById(id: string): Promise<Visit | undefined> {
  const visits = await getVisitsData();
  return visits.find(v => v.id === id);
}

export async function saveVisit(visitData: OptionalId<Visit>): Promise<Visit> {
  let visits = await getVisitsData();
  let cycles = await getCyclesData();
  const allProducts = await getProductsData();
  let savedVisit: Visit;

  if (!visitData.cicloId) throw new Error("El ID del ciclo es obligatorio para guardar la visita.");
  if (!visitData.medicoId) throw new Error("El ID del médico es obligatorio para guardar la visita.");

  const cycleIndex = cycles.findIndex(c => c.id === visitData.cicloId);
  if (cycleIndex === -1) throw new Error('Ciclo no encontrado para la visita');
  
  // IMPORTANT: Work with a deep copy of the cycle to avoid modifying the shared cyclesStore directly
  const cycleForVisit = JSON.parse(JSON.stringify(cycles[cycleIndex])); 


  const currentCycleStockMap = new Map(cycleForVisit.stockProductos.map((sp: { productoId: string; cantidad: number }) => [sp.productoId, sp.cantidad]));

  if (visitData.id) { // Editing an existing visit
    const visitIndex = visits.findIndex(v => v.id === visitData.id);
    if (visitIndex === -1) throw new Error('Visita no encontrada para actualizar');
    const originalVisit = visits[visitIndex];

    // Revert stock from original visit IF THE CYCLE IS THE SAME
    if (originalVisit.cicloId === visitData.cicloId) {
        (originalVisit.productosEntregados || []).forEach(p => {
            currentCycleStockMap.set(p.productoId, (currentCycleStockMap.get(p.productoId) || 0) + p.cantidadEntregada);
        });
    } else {
        // If cycle ID changed, we need to add stock back to the original cycle
        const originalCycleIndex = cycles.findIndex(c => c.id === originalVisit.cicloId);
        if (originalCycleIndex !== -1) {
            const originalCycleToUpdate = JSON.parse(JSON.stringify(cycles[originalCycleIndex]));
            const originalStockMap = new Map(originalCycleToUpdate.stockProductos.map((sp: { productoId: string; cantidad: number }) => [sp.productoId, sp.cantidad]));
            (originalVisit.productosEntregados || []).forEach(p => {
                originalStockMap.set(p.productoId, (originalStockMap.get(p.productoId) || 0) + p.cantidadEntregada);
            });
            originalCycleToUpdate.stockProductos = Array.from(originalStockMap.entries()).map(([productoId, cantidad]) => ({ productoId, cantidad }));
            cycles[originalCycleIndex] = originalCycleToUpdate; // Update the main cycles array
        }
    }


    // Now deduct from new (possibly different) cycle for the edited visit
    (visitData.productosEntregados || []).forEach(p => {
      const stockDisponible = currentCycleStockMap.get(p.productoId) || 0;
      if (stockDisponible < p.cantidadEntregada) {
        const productName = allProducts.find(prod => prod.id === p.productoId)?.nombre || p.productoId;
        throw new Error(`Stock insuficiente para ${productName}. Disponible: ${stockDisponible}, Necesario: ${p.cantidadEntregada}`);
      }
      currentCycleStockMap.set(p.productoId, stockDisponible - p.cantidadEntregada);
    });

    savedVisit = {
        ...originalVisit, // Start with original to preserve any fields not in visitData
        ...visitData,     // Overlay with new data
        id: originalVisit.id, // Ensure ID is preserved
        fecha: new Date(visitData.fecha).toISOString(),
        productosEntregados: visitData.productosEntregados || [],
    };
    visits[visitIndex] = savedVisit;

  } else { // Creating a new visit
    (visitData.productosEntregados || []).forEach(p => {
      const stockDisponible = currentCycleStockMap.get(p.productoId) || 0;
      if (stockDisponible < p.cantidadEntregada) {
        const productName = allProducts.find(prod => prod.id === p.productoId)?.nombre || p.productoId;
        throw new Error(`Stock insuficiente para ${productName}. Disponible: ${stockDisponible}, Necesario: ${p.cantidadEntregada}`);
      }
      currentCycleStockMap.set(p.productoId, stockDisponible - p.cantidadEntregada);
    });
    
    savedVisit = {
      medicoId: visitData.medicoId,
      cicloId: visitData.cicloId,
      fecha: new Date(visitData.fecha).toISOString(),
      productosEntregados: visitData.productosEntregados || [],
      notas: visitData.notas || '',
      id: String(Date.now() + Math.random()), // Simple unique ID
    };
    visits.push(savedVisit);
  }

  cycleForVisit.stockProductos = Array.from(currentCycleStockMap.entries()).map(([productoId, cantidad]) => ({ productoId, cantidad }));
  cycles[cycleIndex] = cycleForVisit; // Update the cycle in the main cycles array

  await saveCyclesData(cycles); // Save all cycles (original one might have been updated too if cycleId changed)
  await saveVisitsData(visits);

  revalidatePath('/visitas');
  revalidatePath('/stock');
  revalidatePath('/');
  return savedVisit;
}

export async function deleteVisit(id: string): Promise<void> {
  let visits = await getVisitsData();
  let cycles = await getCyclesData();

  const visitIndex = visits.findIndex(v => v.id === id);
  if (visitIndex === -1) {
    // If not found, do nothing or throw error based on desired behavior
    // console.warn(`Visit with id ${id} not found for deletion.`);
    return;
  }
  const visitToDelete = visits[visitIndex];

  // Re-integrate stock
  const cycleIndex = cycles.findIndex(c => c.id === visitToDelete.cicloId);
  if (cycleIndex !== -1) {
    const cycleToUpdate = JSON.parse(JSON.stringify(cycles[cycleIndex])); // Deep copy
    const stockMap = new Map(cycleToUpdate.stockProductos.map((sp: { productoId: string; cantidad: number }) => [sp.productoId, sp.cantidad]));
    (visitToDelete.productosEntregados || []).forEach(p => {
      stockMap.set(p.productoId, (stockMap.get(p.productoId) || 0) + p.cantidadEntregada);
    });
    cycleToUpdate.stockProductos = Array.from(stockMap.entries()).map(([productoId, cantidad]) => ({ productoId, cantidad }));
    cycles[cycleIndex] = cycleToUpdate;
    await saveCyclesData(cycles);
  }

  visits.splice(visitIndex, 1);
  await saveVisitsData(visits);

  revalidatePath('/visitas');
  revalidatePath('/stock');
  revalidatePath('/');
}
