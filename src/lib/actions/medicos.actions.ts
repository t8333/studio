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
    doctorsData[index] = { ...doctorsData[index], ...doctorData } as Doctor;
    revalidatePath('/medicos');
    revalidatePath('/'); // Revalidate dashboard
    return JSON.parse(JSON.stringify(doctorsData[index]));
  } else {
    // Create
    const newDoctor: Doctor = {
      ...doctorData,
      id: crypto.randomUUID(),
    } as Doctor;
    doctorsData.push(newDoctor);
    revalidatePath('/medicos');
    revalidatePath('/'); // Revalidate dashboard
    return JSON.parse(JSON.stringify(newDoctor));
  }
}

export async function deleteDoctor(id: string): Promise<void> {
  const index = doctorsData.findIndex(d => d.id === id);
  if (index === -1) throw new Error('Médico no encontrado');
  
  // Check for related visits before deleting - for now, skipping this complexity
  // const relatedVisits = visitsData.filter(v => v.medicoId === id);
  // if (relatedVisits.length > 0) {
  //   throw new Error('No se puede eliminar el médico porque tiene visitas asociadas.');
  // }

  doctorsData.splice(index, 1);
  revalidatePath('/medicos');
  revalidatePath('/'); // Revalidate dashboard
}
