
'use server';
import { suggestProductsForDoctor as suggestProductsForDoctorFlow, type SuggestProductsForDoctorInput, type SuggestProductsForDoctorOutput } from '@/ai/flows/suggest-products-for-doctor';
import { getDoctorById } from './medicos.actions';
import { getCycleById } from './ciclos.actions';
import { getProducts } from './productos.actions'; 
import type { Product } from '@/types';

export async function getProductSuggestions(
  doctorId: string, 
  cycleId: string
): Promise<SuggestProductsForDoctorOutput> {
  
  const doctor = await getDoctorById(doctorId);
  const cycle = await getCycleById(cycleId);
  const allProducts = await getProducts(); 

  if (!doctor) throw new Error("Médico no encontrado");
  if (!cycle) throw new Error("Ciclo no encontrado");

  const availableProductsWithStock = (cycle.stockProductos || [])
    .map(stockItem => {
      const productDetails = allProducts.find(p => p.id === stockItem.productoId);
      return productDetails && stockItem.cantidad > 0 
        ? { ...productDetails, stock: stockItem.cantidad } 
        : null;
    })
    .filter(p => p !== null) as (Product & { stock: number })[]; 


  const input: SuggestProductsForDoctorInput = {
    doctorId: doctor.id,
    cycleId: cycle.id,
    availableProducts: availableProductsWithStock.map(p => `${p.nombre} (Stock: ${p.stock}): ${p.descripcion || 'Sin descripción.'}`),
    doctorInterests: doctor.intereses || 'Intereses generales en medicina y avances farmacéuticos.',
  };

  try {
    const result = await suggestProductsForDoctorFlow(input);
    return result;
  } catch (error) {
    console.error("Error al obtener sugerencias de productos:", error);
    if (error instanceof Error) {
        throw new Error(`Falló la obtención de sugerencias de productos: ${error.message}`);
    }
    throw new Error("Falló la obtención de sugerencias de productos debido a un error desconocido.");
  }
}
