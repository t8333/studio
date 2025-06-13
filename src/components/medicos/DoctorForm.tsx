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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { saveDoctor } from '@/lib/actions/medicos.actions';
import type { Doctor, OptionalId } from '@/types';
import { useState, useEffect } from 'react';

const doctorFormSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }).max(100),
  especialidad: z.string().min(2, { message: 'La especialidad debe tener al menos 2 caracteres.' }).max(100),
  telefono: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email({ message: 'Email inválido.' }).max(100).optional().or(z.literal('')),
  intereses: z.string().max(500).optional().or(z.literal('')),
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
      especialidad: doctor?.especialidad || '',
      telefono: doctor?.telefono || '',
      email: doctor?.email || '',
      intereses: doctor?.intereses || '',
    },
  });

  useEffect(() => {
    if (doctor) {
      form.reset({
        nombre: doctor.nombre,
        especialidad: doctor.especialidad,
        telefono: doctor.telefono || '',
        email: doctor.email || '',
        intereses: doctor.intereses || '',
      });
    }
  }, [doctor, form]);

  async function onSubmit(data: DoctorFormValues) {
    setIsSubmitting(true);
    try {
      const doctorToSave: OptionalId<Doctor> = {
        ...data,
        id: doctor?.id,
      };
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
        <FormField
          control={form.control}
          name="especialidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especialidad</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Cardiología" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono (Opcional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Ej: +34 123 456 789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Opcional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Ej: juan.perez@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="intereses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intereses / Notas (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: Interesado en nuevas terapias para diabetes, prefiere visitas por la mañana." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-accent/90">
          {isSubmitting ? 'Guardando...' : (doctor ? 'Actualizar Médico' : 'Guardar Médico')}
        </Button>
      </form>
    </Form>
  );
}
