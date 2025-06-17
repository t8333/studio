
export interface Doctor {
  id: string; // Firestore ID
  nombre: string;
  especialidad: string;
  telefono: string;
  email: string;
  intereses: string;
}

export interface Product {
  id: string; // Firestore ID
  nombre: string;
  descripcion: string;
  identificadorUnico: string;
}

export interface CycleProductStock {
  productoId: string; // ID del producto
  cantidad: number;
}

export interface Cycle {
  id: string; // Firestore ID
  nombre: string;
  fechaInicio: string; // Almacenado como Timestamp en Firestore, convertido a ISO string en la app
  fechaFin: string;   // Almacenado como Timestamp en Firestore, convertido a ISO string en la app
  stockProductos: CycleProductStock[];
}

export interface VisitProduct {
  productoId: string; // ID del producto
  cantidadEntregada: number;
}

export interface Visit {
  id: string; // Firestore ID
  cicloId: string;
  medicoId: string;
  fecha: string; // Almacenado como Timestamp en Firestore, convertido a ISO string en la app
  productosEntregados: VisitProduct[];
  notas?: string;
}

// Para formularios, cuando el ID es opcional (al crear un nuevo documento)
export type OptionalId<T extends { id: string }> = Omit<T, 'id'> & { id?: string };

