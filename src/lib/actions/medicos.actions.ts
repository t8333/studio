'use server';

import type { Doctor, OptionalId } from '@/types';
import { doctorsData } from './placeholder-data';
import { revalidatePath } from 'next/cache';

export async function getDoctors(): Promise<Doctor[]> {
  return JSON.parse(JSON.stringify(doctorsData));
}

export async function getDoctorById(id: string): Promise<Doctor | undefined> {
  return JSON.parse(JSON.stringify(doctorsData.find(d => d.id === id)));
}

export async function saveDoctor(doctorData: OptionalId<Doctor>): Promise<Doctor> {
  if (doctorData.id) {
    // Update
    const index = doctorsData.findIndex(d => d.id === doctorData.id);
    if (index === -1) throw new Error('Médico no encontrado');
    // Solo se actualiza el nombre si es lo único que viene del form simplificado
    // Si vienen más campos (ej. en un futuro si se edita desde otro lado), se actualizan también
    doctorsData[index] = { ...doctorsData[index], ...doctorData } as Doctor;
    revalidatePath('/medicos');
    revalidatePath('/'); 
    return JSON.parse(JSON.stringify(doctorsData[index]));
  } else {
    // Create
    const newDoctor: Doctor = {
      id: crypto.randomUUID(),
      nombre: doctorData.nombre,
      especialidad: doctorData.especialidad || '', // Asegurar valor por defecto
      telefono: doctorData.telefono || '', // Asegurar valor por defecto
      email: doctorData.email || '', // Asegurar valor por defecto
      intereses: doctorData.intereses || '', // Asegurar valor por defecto
    };
    doctorsData.push(newDoctor);
    revalidatePath('/medicos');
    revalidatePath('/'); 
    return JSON.parse(JSON.stringify(newDoctor));
  }
}

export async function deleteDoctor(id: string): Promise<void> {
  const index = doctorsData.findIndex(d => d.id === id);
  if (index === -1) throw new Error('Médico no encontrado');
  
  doctorsData.splice(index, 1);
  revalidatePath('/medicos');
  revalidatePath('/'); 
}
