
'use server';

import type { Doctor, OptionalId } from '@/types';
import { getDoctorsData, saveDoctorsData } from './placeholder-data';
import { revalidatePath } from 'next/cache';

export async function getDoctors(): Promise<Doctor[]> {
  return getDoctorsData();
}

export async function getDoctorById(id: string): Promise<Doctor | undefined> {
  const doctors = await getDoctorsData();
  return doctors.find(d => d.id === id);
}

export async function saveDoctor(doctorData: OptionalId<Doctor>): Promise<Doctor> {
  let doctors = await getDoctorsData();
  if (doctorData.id) {
    const index = doctors.findIndex(d => d.id === doctorData.id);
    if (index === -1) throw new Error('Médico no encontrado');
    doctors[index] = { 
      ...doctors[index],
      nombre: doctorData.nombre,
      especialidad: doctorData.especialidad ?? doctors[index].especialidad,
      telefono: doctorData.telefono ?? doctors[index].telefono,
      email: doctorData.email ?? doctors[index].email,
      intereses: doctorData.intereses ?? doctors[index].intereses,
    } as Doctor;
  } else {
    const newDoctor: Doctor = {
      id: crypto.randomUUID(),
      nombre: doctorData.nombre,
      especialidad: doctorData.especialidad || '',
      telefono: doctorData.telefono || '',
      email: doctorData.email || '',
      intereses: doctorData.intereses || '',
    };
    doctors.push(newDoctor);
    doctorData = newDoctor; // to return the full object
  }
  await saveDoctorsData(doctors);
  revalidatePath('/medicos');
  revalidatePath('/'); 
  return doctorData as Doctor;
}

export async function deleteDoctor(id: string): Promise<void> {
  let doctors = await getDoctorsData();
  const initialLength = doctors.length;
  doctors = doctors.filter(d => d.id !== id);
  if (doctors.length === initialLength) throw new Error('Médico no encontrado para eliminar');
  
  await saveDoctorsData(doctors);
  revalidatePath('/medicos');
  revalidatePath('/'); 
}
