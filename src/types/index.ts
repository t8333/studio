
export interface Doctor {
  id: string;
  nombre: string;
  especialidad: string; // Ya no es opcional en el tipo base, pero sí en el form.
  telefono: string;
  email: string;
  intereses: string; 
}

export interface Product {
  id: string;
  nombre: string;
  descripcion: string; 
  identificadorUnico: string; 
}

export interface CycleProductStock {
  productoId: string;
  cantidad: number;
}

export interface Cycle {
  id: string;
  nombre: string;
  fechaInicio: string; // ISO date string
  fechaFin: string; // ISO date string
  stockProductos: CycleProductStock[];
  prioridadesMarketing?: string; // For GenAI suggestions
}

export interface VisitProduct {
  productoId: string;
  cantidadEntregada: number;
}

export interface Visit {
  id: string;
  cicloId: string;
  medicoId: string;
  fecha: string; // ISO date string
  productosEntregados: VisitProduct[];
  notas?: string;
}

export type OptionalId<T extends { id: string }> = Omit<T, 'id'> & { id?: string };
