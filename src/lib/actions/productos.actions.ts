
'use server';

import type { Product, OptionalId } from '@/types';
import { getProductsData, saveProductsData, getCyclesData, saveCyclesData } from './placeholder-data';
import { revalidatePath } from 'next/cache';

export async function getProducts(): Promise<Product[]> {
  return await getProductsData();
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProductsData();
  return products.find(p => p.id === id);
}

export async function saveProduct(productData: OptionalId<Product>): Promise<Product> {
  let products = await getProductsData();
  let savedProduct: Product;

  if (productData.id) {
    const index = products.findIndex(p => p.id === productData.id);
    if (index === -1) throw new Error('Producto no encontrado para actualizar');
    savedProduct = { ...products[index], ...productData, id: productData.id }; // Ensure id is preserved
    products[index] = savedProduct;
  } else {
    savedProduct = {
      nombre: productData.nombre,
      descripcion: productData.descripcion || '',
      identificadorUnico: productData.identificadorUnico || '',
      id: String(Date.now() + Math.random()), // Simple unique ID
    };
    products.push(savedProduct);

    // Add new product to all cycles' stock with quantity 0
    let cycles = await getCyclesData();
    cycles = cycles.map(cycle => {
      const newStockProductos = [...(cycle.stockProductos || [])];
      if (!newStockProductos.find(sp => sp.productoId === savedProduct.id)) {
        newStockProductos.push({ productoId: savedProduct.id, cantidad: 0 });
      }
      return { ...cycle, stockProductos: newStockProductos };
    });
    await saveCyclesData(cycles);
  }

  await saveProductsData(products);
  revalidatePath('/productos');
  revalidatePath('/ciclos');
  revalidatePath('/stock');
  revalidatePath('/');
  return savedProduct;
}

export async function deleteProduct(id: string): Promise<void> {
  let products = await getProductsData();
  const initialLength = products.length;
  products = products.filter(p => p.id !== id);
   if (products.length === initialLength && initialLength > 0) {
    // No error if product not found, just means no action taken.
  }
  
  await saveProductsData(products);

  // Remove product from all cycles' stock
  let cycles = await getCyclesData();
  cycles = cycles.map(cycle => ({
    ...cycle,
    stockProductos: (cycle.stockProductos || []).filter(sp => sp.productoId !== id)
  }));
  await saveCyclesData(cycles);

  revalidatePath('/productos');
  revalidatePath('/ciclos');
  revalidatePath('/visitas');
  revalidatePath('/stock');
  revalidatePath('/');
}
