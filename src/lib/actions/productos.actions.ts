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
    // Preserve existing description and identifier if not provided in productData (e.g. from simplified form)
    productsData[index] = { 
      ...productsData[index], 
      nombre: productData.nombre,
      // If productData comes from a full form, these would be updated.
      // If from simplified form, they are undefined, so existing values are kept.
      descripcion: productData.descripcion !== undefined ? productData.descripcion : productsData[index].descripcion,
      identificadorUnico: productData.identificadorUnico !== undefined ? productData.identificadorUnico : productsData[index].identificadorUnico,
    } as Product;
    revalidatePath('/productos');
    revalidatePath('/'); // Revalidate dashboard
    return JSON.parse(JSON.stringify(productsData[index]));
  } else {
    // Create
    const newProduct: Product = {
      id: crypto.randomUUID(),
      nombre: productData.nombre,
      descripcion: productData.descripcion || '', // Default to empty string if not provided
      identificadorUnico: productData.identificadorUnico || '', // Default to empty string if not provided
    };
    productsData.push(newProduct);

    // Add this new product to all existing cycles with 0 stock
    cyclesData.forEach(cycle => {
      if (!cycle.stockProductos.find(sp => sp.productoId === newProduct.id)) {
        cycle.stockProductos.push({ productoId: newProduct.id, cantidad: 0 });
      }
    });
    
    revalidatePath('/productos');
    revalidatePath('/ciclos'); 
    revalidatePath('/stock');
    revalidatePath('/'); // Revalidate dashboard
    return JSON.parse(JSON.stringify(newProduct));
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const index = productsData.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Producto no encontrado');

  productsData.splice(index, 1);
  // Also remove from all cycle stocks
  cyclesData.forEach(cycle => {
    cycle.stockProductos = cycle.stockProductos.filter(sp => sp.productoId !== id);
  });

  revalidatePath('/productos');
  revalidatePath('/ciclos');
  revalidatePath('/visitas');
  revalidatePath('/stock');
  revalidatePath('/'); // Revalidate dashboard
}
