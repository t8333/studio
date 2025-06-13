
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { updateCycleStock } from '@/lib/actions/ciclos.actions';
import type { Cycle, Product, CycleProductStock } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PackageOpen } from 'lucide-react';

const manageStockFormSchema = z.object({
  stockProductos: z.array(z.object({
    productoId: z.string(),
    cantidad: z.coerce.number().min(0, { message: 'La cantidad no puede ser negativa.' }),
  })),
});

type ManageStockFormValues = z.infer<typeof manageStockFormSchema>;

interface ManageStockDialogProps {
  cycle: Cycle;
  allProducts: Product[];
  trigger: React.ReactNode;
}

export function ManageStockDialog({ cycle, allProducts, trigger }: ManageStockDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ManageStockFormValues>({
    resolver: zodResolver(manageStockFormSchema),
    defaultValues: {
      stockProductos: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "stockProductos"
  });
  
  useEffect(() => {
    if (open) {
      const currentStockMap = new Map(cycle.stockProductos.map(item => [item.productoId, item.cantidad]));
      const fullStockArray = allProducts.map(product => ({
        productoId: product.id,
        cantidad: currentStockMap.get(product.id) || 0,
      }));
      replace(fullStockArray); 
      form.reset({ stockProductos: fullStockArray }); 
    }
  }, [open, cycle, allProducts, form, replace]);


  async function onSubmit(data: ManageStockFormValues) {
    setIsSubmitting(true);
    try {
      await updateCycleStock(cycle.id, data.stockProductos);
      toast({
        title: 'Éxito',
        description: 'Stock del ciclo actualizado correctamente.',
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Error al actualizar el stock del ciclo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Gestionar Stock del Ciclo: {cycle.nombre}</DialogTitle>
          <DialogDescription>
            Ajusta las cantidades de stock para cada producto en este ciclo.
          </DialogDescription>
        </DialogHeader>
        {allProducts.length === 0 ? (
           <Alert variant="default" className="my-4">
            <PackageOpen className="h-4 w-4" />
            <AlertTitle>No hay productos</AlertTitle>
            <AlertDescription>
              No hay productos disponibles en el sistema para gestionar stock. Por favor, añada productos primero.
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <ScrollArea className="h-[300px] my-4 pr-3">
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const productDetails = allProducts.find(p => p.id === field.productoId);
                    return (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`stockProductos.${index}.cantidad`}
                        render={({ field: itemField }) => (
                          <FormItem className="flex items-center justify-between gap-2">
                            <FormLabel className="text-sm whitespace-nowrap overflow-hidden text-ellipsis w-2/3 pt-1" title={productDetails?.nombre}>
                              {productDetails?.nombre || `Producto ID: ${field.productoId}`}
                            </FormLabel>
                            <div className="flex-1">
                              <FormControl>
                                <Input type="number" min="0" {...itemField} className="h-8 text-sm"/>
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </div>
                          </FormItem>
                        )}
                      />
                    );
                  })}
                </div>
              </ScrollArea>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting || allProducts.length === 0} className="bg-accent hover:bg-accent/90">
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
