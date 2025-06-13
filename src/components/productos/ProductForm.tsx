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
import { saveProduct } from '@/lib/actions/productos.actions';
import type { Product, OptionalId } from '@/types';
import { useState, useEffect } from 'react';

const productFormSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }).max(100),
  // descripcion: z.string().min(5, { message: 'La descripción debe tener al menos 5 caracteres.' }).max(500), // Eliminado
  // identificadorUnico: z.string().min(1, { message: 'El identificador es obligatorio.' }).max(50), // Eliminado
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
      // descripcion: product?.descripcion || '', // Eliminado
      // identificadorUnico: product?.identificadorUnico || '', // Eliminado
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        nombre: product.nombre,
        // descripcion: product.descripcion, // Eliminado
        // identificadorUnico: product.identificadorUnico, // Eliminado
      });
    } else {
      form.reset({
        nombre: '',
      });
    }
  }, [product, form]);

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    try {
      const productToSave: OptionalId<Product> = {
        id: product?.id,
        nombre: data.nombre,
      };

      // Si es un nuevo producto, inicializa los campos opcionales
      if (!product?.id) {
        productToSave.descripcion = '';
        productToSave.identificadorUnico = '';
      } else {
        // Si estamos editando, mantenemos los valores existentes si no se modifican
        // (Aunque el formulario ya no los muestra, podrían existir en el objeto 'product')
        productToSave.descripcion = product.descripcion || '';
        productToSave.identificadorUnico = product.identificadorUnico || '';
      }

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
        {/* Campos eliminados: descripcion, identificadorUnico */}
        <Button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-accent/90">
          {isSubmitting ? 'Guardando...' : (product ? 'Actualizar Producto' : 'Guardar Producto')}
        </Button>
      </form>
    </Form>
  );
}
