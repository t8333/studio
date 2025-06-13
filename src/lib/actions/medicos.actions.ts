
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
    const index = doctorsData.findIndex(d => d.id === doctorData.id);
    if (index === -1) throw new Error('Médico no encontrado');
    doctorsData[index] = { 
      ...doctorsData[index], // Preserve existing fields not in form
      nombre: doctorData.nombre,
      especialidad: doctorData.especialidad ?? doctorsData[index].especialidad,
      telefono: doctorData.telefono ?? doctorsData[index].telefono,
      email: doctorData.email ?? doctorsData[index].email,
      intereses: doctorData.intereses ?? doctorsData[index].intereses,
    } as Doctor;
    revalidatePath('/medicos');
    revalidatePath('/'); 
    return JSON.parse(JSON.stringify(doctorsData[index]));
  } else {
    const newDoctor: Doctor = {
      id: crypto.randomUUID(),
      nombre: doctorData.nombre,
      especialidad: doctorData.especialidad || '',
      telefono: doctorData.telefono || '',
      email: doctorData.email || '',
      intereses: doctorData.intereses || '',
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
