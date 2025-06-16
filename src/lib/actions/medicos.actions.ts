
'use server';

import type { Doctor, OptionalId } from '@/types';
import { getDoctorsData, saveDoctorsData } from './placeholder-data';
import { revalidatePath } from 'next/cache';

export async function getDoctors(): Promise<Doctor[]> {
  return await getDoctorsData();
}

export async function getDoctorById(id: string): Promise<Doctor | undefined> {
  const doctors = await getDoctorsData();
  return doctors.find(doc => doc.id === id);
}

export async function saveDoctor(doctorData: OptionalId<Doctor>): Promise<Doctor> {
  let doctors = await getDoctorsData();
  let savedDoctor: Doctor;

  if (doctorData.id) {
    const index = doctors.findIndex(d => d.id === doctorData.id);
    if (index === -1) throw new Error('Médico no encontrado para actualizar');
    savedDoctor = { ...doctors[index], ...doctorData, id: doctorData.id }; // Ensure id is preserved
    doctors[index] = savedDoctor;
  } else {
    savedDoctor = {
      nombre: doctorData.nombre,
      especialidad: doctorData.especialidad || '',
      telefono: doctorData.telefono || '',
      email: doctorData.email || '',
      intereses: doctorData.intereses || '',
      id: String(Date.now() + Math.random()), // Simple unique ID for placeholder
    };
    doctors.push(savedDoctor);
  }

  await saveDoctorsData(doctors);
  revalidatePath('/medicos');
  revalidatePath('/');
  return savedDoctor;
}

export async function deleteDoctor(id: string): Promise<void> {
  let doctors = await getDoctorsData();
  const initialLength = doctors.length;
  doctors = doctors.filter(d => d.id !== id);
  if (doctors.length === initialLength && initialLength > 0) { // Check if an element was actually removed
    // Only throw error if the doctor was expected to be there.
    // If doctors array was empty, no error.
  }
  
  await saveDoctorsData(doctors);
  revalidatePath('/medicos');
  revalidatePath('/');
}
