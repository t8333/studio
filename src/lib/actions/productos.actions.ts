
'use server';

import type { Product, OptionalId } from '@/types';
import { productsData, cyclesData } from './placeholder-data';
import { revalidatePath } from 'next/cache';

export async function getProducts(): Promise<Product[]> {
  return JSON.parse(JSON.stringify(productsData));
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return JSON.parse(JSON.stringify(productsData.find(p => p.id === id)));
}

export async function saveProduct(productData: OptionalId<Product>): Promise<Product> {
  if (productData.id) {
    const index = productsData.findIndex(p => p.id === productData.id);
    if (index === -1) throw new Error('Producto no encontrado');
    productsData[index] = { 
      ...productsData[index], // Preserve existing fields not in form
      nombre: productData.nombre,
      descripcion: productData.descripcion ?? productsData[index].descripcion,
      identificadorUnico: productData.identificadorUnico ?? productsData[index].identificadorUnico,
    } as Product;
    revalidatePath('/productos');
    revalidatePath('/'); 
    return JSON.parse(JSON.stringify(productsData[index]));
  } else {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      nombre: productData.nombre,
      descripcion: productData.descripcion || '', 
      identificadorUnico: productData.identificadorUnico || '',
    };
    productsData.push(newProduct);

    cyclesData.forEach(cycle => {
      if (!cycle.stockProductos.find(sp => sp.productoId === newProduct.id)) {
        cycle.stockProductos.push({ productoId: newProduct.id, cantidad: 0 });
      }
    });
    
    revalidatePath('/productos');
    revalidatePath('/ciclos'); 
    revalidatePath('/stock');
    revalidatePath('/'); 
    return JSON.parse(JSON.stringify(newProduct));
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const index = productsData.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Producto no encontrado');

  productsData.splice(index, 1);
  cyclesData.forEach(cycle => {
    cycle.stockProductos = cycle.stockProductos.filter(sp => sp.productoId !== id);
  });

  revalidatePath('/productos');
  revalidatePath('/ciclos');
  revalidatePath('/visitas');
  revalidatePath('/stock');
  revalidatePath('/'); 
}
