
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
import { saveProduct } from '@/lib/actions/productos.actions';
import type { Product, OptionalId } from '@/types';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const productFormSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }).max(100),
  descripcion: z.string().max(500).optional().or(z.literal('')),
  identificadorUnico: z.string().max(50).optional().or(z.literal('')),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const isGuest = user?.role === 'guest';

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      nombre: product?.nombre || '',
      descripcion: product?.descripcion || '',
      identificadorUnico: product?.identificadorUnico || '',
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        nombre: product.nombre,
        descripcion: product.descripcion || '',
        identificadorUnico: product.identificadorUnico || '',
      });
    } else {
      form.reset({
        nombre: '',
        descripcion: '',
        identificadorUnico: '',
      });
    }
  }, [product, form]);

  async function onSubmit(data: ProductFormValues) {
    if (isGuest) {
      toast({ title: 'Acción no permitida', description: 'Los invitados no pueden guardar cambios.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const productToSave: OptionalId<Product> = {
        id: product?.id,
        ...data,
      };

      await saveProduct(productToSave);
      toast({
        title: 'Éxito',
        description: `Producto ${product ? 'actualizado' : 'guardado'} correctamente.`,
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || `Error al ${product ? 'actualizar' : 'guardar'} el producto.`,
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
              <FormLabel>Nombre del Producto</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Analgésico Max" {...field} disabled={isGuest} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: Alivia dolores musculares y de cabeza." {...field} disabled={isGuest} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="identificadorUnico"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identificador Único (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: SKU12345" {...field} disabled={isGuest} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting || isGuest} className="w-full bg-accent hover:bg-accent/90">
          {isSubmitting ? 'Guardando...' : (product ? 'Actualizar Producto' : 'Guardar Producto')}
        </Button>
      </form>
    </Form>
  );
}
