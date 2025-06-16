
'use server';

import type { Visit, OptionalId } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, setDoc, deleteDoc, Timestamp, writeBatch, query, orderBy, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { getCycleById } from './ciclos.actions';
import { getProducts } from './productos.actions';

const visitsCollection = collection(db, 'visitas');

function mapVisitFromFirestore(docSnap: any): Visit {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    medicoId: data.medicoId,
    cicloId: data.cicloId,
    fecha: (data.fecha instanceof Timestamp ? data.fecha.toDate() : new Date(data.fecha)).toISOString(),
    productosEntregados: data.productosEntregados || [],
    notas: data.notas || '',
  } as Visit;
}

export async function getVisits(): Promise<Visit[]> {
  const q = query(visitsCollection, orderBy('fecha', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapVisitFromFirestore);
}

export async function getVisitById(id: string): Promise<Visit | undefined> {
  const docRef = doc(db, 'visitas', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return mapVisitFromFirestore(docSnap);
  }
  return undefined;
}

export async function saveVisit(visitData: OptionalId<Visit>): Promise<Visit> {
  const allProducts = await getProducts(); // Para verificar nombres en errores
  
  const dataToSave = {
    medicoId: visitData.medicoId,
    cicloId: visitData.cicloId,
    fecha: Timestamp.fromDate(new Date(visitData.fecha)),
    notas: visitData.notas || '',
    productosEntregados: visitData.productosEntregados || [], // Asegurarse de que es un array
  };

  if (!dataToSave.cicloId) throw new Error("El ID del ciclo es obligatorio para guardar la visita.");
  if (!dataToSave.medicoId) throw new Error("El ID del médico es obligatorio para guardar la visita.");


  const cycleForVisit = await getCycleById(dataToSave.cicloId);
  if (!cycleForVisit) throw new Error('Ciclo no encontrado para la visita');

  const batch = writeBatch(db);
  let savedVisitId = visitData.id; // Usar el ID existente si se está editando

  // Crear un mapa del stock actual del ciclo para facilitar la actualización
  const currentCycleStockMap = new Map(cycleForVisit.stockProductos.map(sp => [sp.productoId, sp.cantidad]));
  
  // Si es una edición, revertir el stock de la visita original
  if (visitData.id) {
    const originalVisitSnap = await getDoc(doc(db, 'visitas', visitData.id));
    if (!originalVisitSnap.exists()) throw new Error('Visita original no encontrada para actualizar');
    const originalVisit = mapVisitFromFirestore(originalVisitSnap);

    // Si el ciclo de la visita original es diferente al nuevo ciclo
    if (originalVisit.cicloId !== cycleForVisit.id) {
        const cycleForOriginalVisit = await getCycleById(originalVisit.cicloId);
        if (cycleForOriginalVisit) {
            const originalCycleStockMap = new Map(cycleForOriginalVisit.stockProductos.map(sp => [sp.productoId, sp.cantidad]));
            for (const prodEntregado of originalVisit.productosEntregados) {
                const currentQty = originalCycleStockMap.get(prodEntregado.productoId) || 0;
                originalCycleStockMap.set(prodEntregado.productoId, currentQty + prodEntregado.cantidadEntregada);
            }
            const originalCycleRef = doc(db, 'ciclos', originalVisit.cicloId);
            const updatedOriginalStock = Array.from(originalCycleStockMap.entries()).map(([productoId, cantidad]) => ({ productoId, cantidad }));
            batch.update(originalCycleRef, { stockProductos: updatedOriginalStock });
        }
    } else { // Si el ciclo es el mismo, ajustar el currentCycleStockMap directamente
        for (const prodEntregado of originalVisit.productosEntregados) {
             const currentQty = currentCycleStockMap.get(prodEntregado.productoId) || 0;
             currentCycleStockMap.set(prodEntregado.productoId, currentQty + prodEntregado.cantidadEntregada);
        }
    }
  }

  // Ajustar el stock del ciclo actual (o nuevo ciclo) con los productos de la visita que se guarda
  for (const prodEntregado of dataToSave.productosEntregados) {
    const stockDisponible = currentCycleStockMap.get(prodEntregado.productoId) || 0;
    if (stockDisponible < prodEntregado.cantidadEntregada) {
      const productName = allProducts.find(p => p.id === prodEntregado.productoId)?.nombre || prodEntregado.productoId;
      throw new Error(`Stock insuficiente para ${productName}. Disponible: ${stockDisponible}, Necesario: ${prodEntregado.cantidadEntregada}`);
    }
    currentCycleStockMap.set(prodEntregado.productoId, stockDisponible - prodEntregado.cantidadEntregada);
  }
  
  const cycleRef = doc(db, 'ciclos', dataToSave.cicloId);
  const finalCycleStock = Array.from(currentCycleStockMap.entries()).map(([productoId, cantidad]) => ({ productoId, cantidad }));
  batch.update(cycleRef, { stockProductos: finalCycleStock });

  // Guardar la visita (crear o actualizar)
  if (visitData.id) {
    const visitDocRef = doc(db, 'visitas', visitData.id);
    batch.set(visitDocRef, dataToSave); // set para reemplazar completamente si la estructura cambió
  } else {
    // Es una nueva visita, generar un nuevo ID y guardarlo
    const visitDocRef = doc(collection(db, 'visitas')); // Crea una referencia con un ID autogenerado
    batch.set(visitDocRef, dataToSave);
    savedVisitId = visitDocRef.id; // Guardar el nuevo ID
  }

  await batch.commit();

  revalidatePath('/visitas');
  revalidatePath('/stock');
  revalidatePath('/'); // Revalidar el dashboard por si muestra datos agregados

  if (!savedVisitId) throw new Error("No se pudo obtener el ID de la visita guardada.");
  
  return { 
    id: savedVisitId,
    ...visitData, // Usar visitData original para mantener propiedades que no están en dataToSave
    fecha: dataToSave.fecha.toDate().toISOString(), // Asegurar que la fecha sea ISO string
    productosEntregados: dataToSave.productosEntregados,
    notas: dataToSave.notas,
   };
}

export async function deleteVisit(id: string): Promise<void> {
  const visitDocRef = doc(db, 'visitas', id);
  const visitSnap = await getDoc(visitDocRef);

  if (!visitSnap.exists()) throw new Error('Visita no encontrada para eliminar');
  const visitToDelete = mapVisitFromFirestore(visitSnap);

  const batch = writeBatch(db);

  // Reintegrar el stock de los productos entregados en esta visita al ciclo correspondiente
  const cycleForVisit = await getCycleById(visitToDelete.cicloId);
  if (cycleForVisit) {
    const cycleRef = doc(db, 'ciclos', visitToDelete.cicloId);
    const updatedStockProductos = [...cycleForVisit.stockProductos]; // Clonar
    const stockMap = new Map(updatedStockProductos.map(sp => [sp.productoId, sp.cantidad]));

    for (const prodEntregado of visitToDelete.productosEntregados) {
      stockMap.set(prodEntregado.productoId, (stockMap.get(prodEntregado.productoId) || 0) + prodEntregado.cantidadEntregada);
    }
    
    const finalStock = Array.from(stockMap.entries()).map(([productoId, cantidad]) => ({ productoId, cantidad }));
    batch.update(cycleRef, { stockProductos: finalStock });
  }

  batch.delete(visitDocRef);
  await batch.commit();

  revalidatePath('/visitas');
  revalidatePath('/stock');
  revalidatePath('/');
}
