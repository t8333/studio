'use server';

import type { Product, OptionalId } from '@/types';
import { productsData, cyclesData, visitsData } from './placeholder-data';
import { revalidatePath } from 'next/cache';

export async function getProducts(): Promise<Product[]> {
  return JSON.parse(JSON.stringify(productsData));
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return JSON.parse(JSON.stringify(productsData.find(p => p.id === id)));
}

export async function saveProduct(productData: OptionalId<Product>): Promise<Product> {
  if (productData.id) {
    // Update
    const index = productsData.findIndex(p => p.id === productData.id);
    if (index === -1) throw new Error('Producto no encontrado');
    productsData[index] = { ...productsData[index], ...productData } as Product;
    revalidatePath('/productos');
    return JSON.parse(JSON.stringify(productsData[index]));
  } else {
    // Create
    const newProduct: Product = {
      ...productData,
      id: crypto.randomUUID(),
    } as Product;
    productsData.push(newProduct);

    // Add this new product to all existing cycles with 0 stock
    cyclesData.forEach(cycle => {
      if (!cycle.stockProductos.find(sp => sp.productoId === newProduct.id)) {
        cycle.stockProductos.push({ productoId: newProduct.id, cantidad: 0 });
      }
    });
    
    revalidatePath('/productos');
    revalidatePath('/ciclos'); // because cycles stock structure might change
    revalidatePath('/stock');
    return JSON.parse(JSON.stringify(newProduct));
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const index = productsData.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Producto no encontrado');

  // Check if product is in any cycle's stock or visits - for now, allow deletion
  // For a real app, you'd prevent deletion or handle cascading effects
  // const inCycleStock = cyclesData.some(c => c.stockProductos.some(sp => sp.productoId === id && sp.cantidad > 0));
  // const inVisits = visitsData.some(v => v.productosEntregados.some(vp => vp.productoId === id && vp.cantidadEntregada > 0));
  // if (inCycleStock || inVisits) {
  //   throw new Error('No se puede eliminar el producto porque está en uso en ciclos o visitas.');
  // }


  productsData.splice(index, 1);
  // Also remove from all cycle stocks
  cyclesData.forEach(cycle => {
    cycle.stockProductos = cycle.stockProductos.filter(sp => sp.productoId !== id);
  });

  revalidatePath('/productos');
  revalidatePath('/ciclos');
  revalidatePath('/visitas');
  revalidatePath('/stock');
}
