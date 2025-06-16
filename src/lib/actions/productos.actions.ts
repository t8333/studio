
'use server';

import type { Product, OptionalId } from '@/types';
import { getProductsData, saveProductsData, getCyclesData, saveCyclesData } from './placeholder-data';
import { revalidatePath } from 'next/cache';

export async function getProducts(): Promise<Product[]> {
  return getProductsData();
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProductsData();
  return products.find(p => p.id === id);
}

export async function saveProduct(productData: OptionalId<Product>): Promise<Product> {
  let products = await getProductsData();
  let cycles = await getCyclesData();

  if (productData.id) {
    const index = products.findIndex(p => p.id === productData.id);
    if (index === -1) throw new Error('Producto no encontrado');
    products[index] = { 
      ...products[index],
      nombre: productData.nombre,
      descripcion: productData.descripcion ?? products[index].descripcion,
      identificadorUnico: productData.identificadorUnico ?? products[index].identificadorUnico,
    } as Product;
  } else {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      nombre: productData.nombre,
      descripcion: productData.descripcion || '', 
      identificadorUnico: productData.identificadorUnico || '',
    };
    products.push(newProduct);
    productData = newProduct; // to return the full object

    // Add this new product to all existing cycles with 0 stock
    cycles.forEach(cycle => {
      if (!cycle.stockProductos.find(sp => sp.productoId === newProduct.id)) {
        cycle.stockProductos.push({ productoId: newProduct.id, cantidad: 0 });
      }
    });
    await saveCyclesData(cycles);
  }

  await saveProductsData(products);
  revalidatePath('/productos');
  revalidatePath('/ciclos'); 
  revalidatePath('/stock');
  revalidatePath('/'); 
  return productData as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  let products = await getProductsData();
  const initialLength = products.length;
  products = products.filter(p => p.id !== id);
  if (products.length === initialLength) throw new Error('Producto no encontrado para eliminar');
  
  await saveProductsData(products);

  let cycles = await getCyclesData();
  cycles.forEach(cycle => {
    cycle.stockProductos = cycle.stockProductos.filter(sp => sp.productoId !== id);
  });
  await saveCyclesData(cycles);

  revalidatePath('/productos');
  revalidatePath('/ciclos');
  revalidatePath('/visitas');
  revalidatePath('/stock');
  revalidatePath('/'); 
}
