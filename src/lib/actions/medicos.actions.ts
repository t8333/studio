
'use server';

import type { Doctor, OptionalId } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

const doctorsCollection = collection(db, 'medicos');

export async function getDoctors(): Promise<Doctor[]> {
  const q = query(doctorsCollection, orderBy('nombre'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
}

export async function getDoctorById(id: string): Promise<Doctor | undefined> {
  const docRef = doc(db, 'medicos', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Doctor;
  }
  return undefined;
}

export async function saveDoctor(doctorData: OptionalId<Doctor>): Promise<Doctor> {
  const dataToSave = {
    nombre: doctorData.nombre,
    especialidad: doctorData.especialidad || '',
    telefono: doctorData.telefono || '',
    email: doctorData.email || '',
    intereses: doctorData.intereses || '',
  };

  let savedDoctorId: string;

  if (doctorData.id) {
    const docRef = doc(db, 'medicos', doctorData.id);
    await setDoc(docRef, dataToSave, { merge: true });
    savedDoctorId = doctorData.id;
  } else {
    const docRef = await addDoc(doctorsCollection, dataToSave);
    savedDoctorId = docRef.id;
  }

  revalidatePath('/medicos');
  revalidatePath('/');
  return { id: savedDoctorId, ...dataToSave };
}

export async function deleteDoctor(id: string): Promise<void> {
  const docRef = doc(db, 'medicos', id);
  await deleteDoc(docRef);
  revalidatePath('/medicos');
  revalidatePath('/');
}
