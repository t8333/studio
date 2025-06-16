
'use server';

import type { Product, OptionalId } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, setDoc, deleteDoc, writeBatch, query, orderBy } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { getCycles } from './ciclos.actions';

const productsCollection = collection(db, 'productos');

export async function getProducts(): Promise<Product[]> {
  const q = query(productsCollection, orderBy('nombre'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const docRef = doc(db, 'productos', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Product;
  }
  return undefined;
}

export async function saveProduct(productData: OptionalId<Product>): Promise<Product> {
  const dataToSave = {
    nombre: productData.nombre,
    descripcion: productData.descripcion || '',
    identificadorUnico: productData.identificadorUnico || '',
  };

  let savedProductId: string;

  if (productData.id) {
    const docRef = doc(db, 'productos', productData.id);
    await setDoc(docRef, dataToSave, { merge: true });
    savedProductId = productData.id;
  } else {
    const docRef = await addDoc(productsCollection, dataToSave);
    savedProductId = docRef.id;

    // Cuando se crea un nuevo producto, asegurarse de que se añade a la lista de stock de todos los ciclos con cantidad 0
    const cycles = await getCycles();
    const batch = writeBatch(db);
    cycles.forEach(cycle => {
      const cycleRef = doc(db, 'ciclos', cycle.id);
      const newStockProductos = [...cycle.stockProductos]; // Clonar array
      if (!newStockProductos.find(sp => sp.productoId === savedProductId)) {
        newStockProductos.push({ productoId: savedProductId, cantidad: 0 });
      }
      batch.update(cycleRef, { stockProductos: newStockProductos });
    });
    await batch.commit();
  }

  revalidatePath('/productos');
  revalidatePath('/ciclos'); // Revalidar ciclos porque su stock puede haber cambiado
  revalidatePath('/stock');
  revalidatePath('/');
  return { id: savedProductId, ...dataToSave };
}

export async function deleteProduct(id: string): Promise<void> {
  const productDocRef = doc(db, 'productos', id);
  await deleteDoc(productDocRef);

  // Eliminar el producto del stock de todos los ciclos
  const cycles = await getCycles();
  const batch = writeBatch(db);
  cycles.forEach(cycle => {
    const cycleRef = doc(db, 'ciclos', cycle.id);
    const updatedStockProductos = cycle.stockProductos.filter(sp => sp.productoId !== id);
    batch.update(cycleRef, { stockProductos: updatedStockProductos });
  });
  await batch.commit();

  revalidatePath('/productos');
  revalidatePath('/ciclos'); // Revalidar ciclos
  revalidatePath('/visitas'); // Revalidar visitas por si se referenciaba el producto
  revalidatePath('/stock');
  revalidatePath('/');
}
