
'use server';
import { suggestProductsForDoctor as suggestProductsForDoctorFlow, type SuggestProductsForDoctorInput, type SuggestProductsForDoctorOutput } from '@/ai/flows/suggest-products-for-doctor';
import { getDoctorById } from './medicos.actions';
import { getCycleById } from './ciclos.actions';
import { getProducts } from './productos.actions'; // Necesitamos los detalles de todos los productos
import type { Product } from '@/types';

export async function getProductSuggestions(
  doctorId: string, 
  cycleId: string
): Promise<SuggestProductsForDoctorOutput> {
  
  const doctor = await getDoctorById(doctorId);
  const cycle = await getCycleById(cycleId);
  const allProducts = await getProducts(); // Obtener todos los productos para buscar detalles

  if (!doctor) throw new Error("Médico no encontrado");
  if (!cycle) throw new Error("Ciclo no encontrado");

  // Mapear el stock del ciclo a productos con detalles completos y filtrar los que tienen stock
  const availableProductsWithStock = cycle.stockProductos
    .map(stockItem => {
      const productDetails = allProducts.find(p => p.id === stockItem.productoId);
      // Solo incluir si el producto existe y tiene stock
      return productDetails && stockItem.cantidad > 0 
        ? { ...productDetails, stock: stockItem.cantidad } 
        : null;
    })
    .filter(p => p !== null) as (Product & { stock: number })[]; // Asegurar que p no sea null


  const input: SuggestProductsForDoctorInput = {
    doctorId: doctor.id,
    cycleId: cycle.id,
    availableProducts: availableProductsWithStock.map(p => `${p.nombre} (Stock: ${p.stock}): ${p.descripcion || 'Sin descripción.'}`),
    doctorInterests: doctor.intereses || 'Intereses generales en medicina y avances farmacéuticos.',
    marketingPriorities: cycle.prioridadesMarketing || 'Prioridades de marketing generales del ciclo.',
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
