
'use server';

import type { Cycle, OptionalId, CycleProductStock, Product } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, setDoc, deleteDoc, Timestamp, writeBatch, query, orderBy, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { getProducts } from './productos.actions';
import { getVisits } from './visitas.actions';

const cyclesCollection = collection(db, 'ciclos');

function mapCycleFromFirestore(docSnap: any): Cycle {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    nombre: data.nombre,
    fechaInicio: (data.fechaInicio instanceof Timestamp ? data.fechaInicio.toDate() : new Date(data.fechaInicio)).toISOString(),
    fechaFin: (data.fechaFin instanceof Timestamp ? data.fechaFin.toDate() : new Date(data.fechaFin)).toISOString(),
    stockProductos: data.stockProductos || [],
    prioridadesMarketing: data.prioridadesMarketing || '',
  } as Cycle;
}

export async function getCycles(): Promise<Cycle[]> {
  const q = query(cyclesCollection, orderBy('fechaInicio', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapCycleFromFirestore);
}

export async function getCycleById(id: string): Promise<Cycle | undefined> {
  const docRef = doc(db, 'ciclos', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return mapCycleFromFirestore(docSnap);
  }
  return undefined;
}

export async function saveCycle(cycleData: OptionalId<Cycle>): Promise<Cycle> {
  const allProducts = await getProducts();
  let currentStock = cycleData.stockProductos || [];
  const stockMap = new Map(currentStock.map(item => [item.productoId, item.cantidad]));
  
  const completeStock: CycleProductStock[] = allProducts.map(product => ({
    productoId: product.id,
    cantidad: stockMap.get(product.id) || 0,
  }));

  const dataToSave = {
    nombre: cycleData.nombre,
    fechaInicio: Timestamp.fromDate(new Date(cycleData.fechaInicio)),
    fechaFin: Timestamp.fromDate(new Date(cycleData.fechaFin)),
    prioridadesMarketing: cycleData.prioridadesMarketing || '',
    stockProductos: completeStock,
  };

  let savedCycleId: string;

  if (cycleData.id) {
    const docRef = doc(db, 'ciclos', cycleData.id);
    await setDoc(docRef, dataToSave, { merge: true });
    savedCycleId = cycleData.id;
  } else {
    const docRef = await addDoc(cyclesCollection, dataToSave);
    savedCycleId = docRef.id;
  }

  revalidatePath('/ciclos');
  revalidatePath('/stock');
  revalidatePath('/');
  
  return { 
    id: savedCycleId,
    ...cycleData,
    fechaInicio: dataToSave.fechaInicio.toDate().toISOString(),
    fechaFin: dataToSave.fechaFin.toDate().toISOString(),
    stockProductos: dataToSave.stockProductos,
    prioridadesMarketing: dataToSave.prioridadesMarketing,
  };
}

export async function deleteCycle(id: string): Promise<void> {
  const batch = writeBatch(db);
  const cycleDocRef = doc(db, 'ciclos', id);
  batch.delete(cycleDocRef);

  const visits = await getVisits();
  const visitsToDelete = visits.filter(v => v.cicloId === id);
  visitsToDelete.forEach(visit => {
    const visitDocRef = doc(db, 'visitas', visit.id);
    batch.delete(visitDocRef);
  });

  await batch.commit();
  revalidatePath('/ciclos');
  revalidatePath('/visitas');
  revalidatePath('/stock');
  revalidatePath('/');
}

export async function updateCycleStock(cycleId: string, updatedStockItems: CycleProductStock[]): Promise<void> {
  const cycleRef = doc(db, 'ciclos', cycleId);
  const cycleSnap = await getDoc(cycleRef);

  if (!cycleSnap.exists()) throw new Error('Ciclo no encontrado');
  
  const allProducts = await getProducts();
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

  await setDoc(cycleRef, { stockProductos: completeStockList }, { merge: true });
  revalidatePath('/ciclos');
  revalidatePath('/stock');
  revalidatePath('/');
}
