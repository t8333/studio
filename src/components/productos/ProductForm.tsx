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

const productFormSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }).max(100),
  descripcion: z.string().min(5, { message: 'La descripción debe tener al menos 5 caracteres.' }).max(500),
  identificadorUnico: z.string().min(1, { message: 'El identificador es obligatorio.' }).max(50),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        descripcion: product.descripcion,
        identificadorUnico: product.identificadorUnico,
      });
    }
  }, [product, form]);

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    try {
      const productToSave: OptionalId<Product> = {
        ...data,
        id: product?.id,
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
                <Input placeholder="Ej: Analgésico Max" {...field} />
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
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: Alivio rápido para dolores musculares y de cabeza." {...field} />
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
              <FormLabel>Identificador Único (SKU)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: AMX-00123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-accent/90">
          {isSubmitting ? 'Guardando...' : (product ? 'Actualizar Producto' : 'Guardar Producto')}
        </Button>
      </form>
    </Form>
  );
}
