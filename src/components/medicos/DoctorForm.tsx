'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea'; // No longer needed
import { useToast } from '@/hooks/use-toast';
import { saveDoctor } from '@/lib/actions/medicos.actions';
import type { Doctor, OptionalId } from '@/types';
import { useState, useEffect } from 'react';

const doctorFormSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }).max(100),
  // especialidad: z.string().min(2, { message: 'La especialidad debe tener al menos 2 caracteres.' }).max(100), // Eliminado
  // telefono: z.string().max(20).optional().or(z.literal('')), // Eliminado
  // email: z.string().email({ message: 'Email inválido.' }).max(100).optional().or(z.literal('')), // Eliminado
  // intereses: z.string().max(500).optional().or(z.literal('')), // Eliminado
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

interface DoctorFormProps {
  doctor?: Doctor;
  onSuccess?: () => void;
}

export function DoctorForm({ doctor, onSuccess }: DoctorFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      nombre: doctor?.nombre || '',
      // especialidad: doctor?.especialidad || '', // Eliminado
      // telefono: doctor?.telefono || '', // Eliminado
      // email: doctor?.email || '', // Eliminado
      // intereses: doctor?.intereses || '', // Eliminado
    },
  });

  useEffect(() => {
    if (doctor) {
      form.reset({
        nombre: doctor.nombre,
        // especialidad: doctor.especialidad, // Eliminado
        // telefono: doctor.telefono || '', // Eliminado
        // email: doctor.email || '', // Eliminado
        // intereses: doctor.intereses || '', // Eliminado
      });
    } else {
      form.reset({
        nombre: '',
      });
    }
  }, [doctor, form]);

  async function onSubmit(data: DoctorFormValues) {
    setIsSubmitting(true);
    try {
      const doctorToSave: OptionalId<Doctor> = {
        id: doctor?.id,
        nombre: data.nombre,
        // Si se está creando, los campos opcionales se establecerán en la acción.
        // Si se está editando, solo se actualiza el nombre.
      };
      if (!doctor?.id) {
        // Valores por defecto para campos no presentes en el formulario al crear
        doctorToSave.especialidad = '';
        doctorToSave.telefono = '';
        doctorToSave.email = '';
        doctorToSave.intereses = '';
      }


      await saveDoctor(doctorToSave);
      toast({
        title: 'Éxito',
        description: `Médico ${doctor ? 'actualizado' : 'guardado'} correctamente.`,
        variant: 'default',
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || `Error al ${doctor ? 'actualizar' : 'guardar'} el médico.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Dr. Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Campos eliminados: especialidad, telefono, email, intereses */}
        <Button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-accent/90">
          {isSubmitting ? 'Guardando...' : (doctor ? 'Actualizar Médico' : 'Guardar Médico')}
        </Button>
      </form>
    </Form>
  );
}
