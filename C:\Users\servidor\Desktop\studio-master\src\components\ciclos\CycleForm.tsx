
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { saveCycle } from '@/lib/actions/ciclos.actions';
import type { Cycle, OptionalId, Product } from '@/types';
import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PackageOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const cycleFormSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }).max(100),
  fechaInicio: z.date({ required_error: 'La fecha de inicio es obligatoria.' }),
  fechaFin: z.date({ required_error: 'La fecha de fin es obligatoria.' }),
  stockProductos: z.array(z.object({
    productoId: z.string(),
    cantidad: z.coerce.number().min(0, { message: 'La cantidad no puede ser negativa.' }),
  })).optional(),
}).refine(data => data.fechaFin >= data.fechaInicio, {
  message: "La fecha de fin no puede ser anterior a la fecha de inicio.",
  path: ["fechaFin"],
});

type CycleFormValues = z.infer<typeof cycleFormSchema>;

interface CycleFormProps {
  cycle?: Cycle;
  allProducts: Product[];
  onSuccess?: () => void;
}

export function CycleForm({ cycle, allProducts, onSuccess }: CycleFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const isGuest = user?.role === 'guest';

  const form = useForm<CycleFormValues>({
    resolver: zodResolver(cycleFormSchema),
    defaultValues: {
      nombre: cycle?.nombre || '',
      fechaInicio: cycle?.fechaInicio ? parseISO(cycle.fechaInicio) : new Date(),
      fechaFin: cycle?.fechaFin ? parseISO(cycle.fechaFin) : new Date(),
      stockProductos: cycle?.stockProductos
        ? cycle.stockProductos.map(sp => ({ productoId: sp.productoId, cantidad: sp.cantidad }))
        : allProducts.map(p => ({ productoId: p.id, cantidad: 0 })),
    },
  });
  
  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "stockProductos",
  });

  useEffect(() => {
    let stockArrayForForm: { productoId: string; cantidad: number }[];

    if (cycle) { 
      const cycleStockMap = new Map((cycle.stockProductos || []).map(item => [item.productoId, item.cantidad]));
      stockArrayForForm = allProducts.map(p => ({
        productoId: p.id,
        cantidad: cycleStockMap.get(p.id) || 0,
      }));
      form.reset({
        nombre: cycle.nombre,
        fechaInicio: parseISO(cycle.fechaInicio),
        fechaFin: parseISO(cycle.fechaFin),
        stockProductos: stockArrayForForm,
      });
    } else { 
      stockArrayForForm = allProducts.map(p => ({
        productoId: p.id,
        cantidad: 0,
      }));
      form.reset({ 
        nombre: '',
        fechaInicio: new Date(),
        fechaFin: new Date(),
        stockProductos: stockArrayForForm,
      });
    }
    replace(stockArrayForForm);
  }, [cycle, allProducts, form, replace]);


  async function onSubmit(data: CycleFormValues) {
    if (isGuest) {
      toast({ title: 'Acción no permitida', description: 'Los invitados no pueden guardar cambios.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const cycleToSave: OptionalId<Cycle> = {
        id: cycle?.id,
        nombre: data.nombre,
        fechaInicio: data.fechaInicio.toISOString(),
        fechaFin: data.fechaFin.toISOString(),
        stockProductos: data.stockProductos || [],
      };
      await saveCycle(cycleToSave);
      toast({
        title: 'Éxito',
        description: `Ciclo ${cycle ? 'actualizado' : 'creado'} correctamente.`,
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || `Error al ${cycle ? 'actualizar' : 'crear'} el ciclo.`,
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
              <FormLabel>Nombre del Ciclo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Ciclo Q1 2024" {...field} disabled={isGuest} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fechaInicio"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Inicio</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isGuest}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01") || isGuest}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fechaFin"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Fin</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isGuest}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < (form.getValues("fechaInicio") || new Date("1900-01-01")) || isGuest}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
                
        <div>
          <FormLabel>Stock Inicial de Productos</FormLabel>
          <FormDescription>Define la cantidad inicial de cada producto para este ciclo.</FormDescription>
          {allProducts.length === 0 ? (
             <Alert variant="default" className="mt-2">
              <PackageOpen className="h-4 w-4" />
              <AlertTitle>No hay productos</AlertTitle>
              <AlertDescription>
                No hay productos disponibles en el sistema. Por favor, añada productos primero desde la sección &apos;Productos&apos; para poder asignarles stock.
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-[280px] mt-2 border rounded-md p-2">
              <div className="space-y-3 pr-3">
              {fields.map((field, index) => {
                const productDetails = allProducts.find(p => p.id === field.productoId);
                return (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`stockProductos.${index}.cantidad`}
                    render={({ field: itemField }) => (
                      <FormItem className="flex items-center justify-between gap-2">
                        <FormLabel className="text-sm whitespace-nowrap overflow-hidden text-ellipsis w-2/3" title={productDetails?.nombre}>
                          {productDetails?.nombre || `Producto ID: ${field.productoId}`}
                        </FormLabel>
                        <div className="flex-1">
                          <FormControl>
                            <Input type="number" min="0" {...itemField} className="h-8 text-sm" disabled={isGuest}/>
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
          )}
        </div>

        <Button type="submit" disabled={isSubmitting || isGuest} className="w-full bg-accent hover:bg-accent/90">
          {isSubmitting ? 'Guardando...' : (cycle ? 'Actualizar Ciclo' : 'Crear Ciclo')}
        </Button>
      </form>
    </Form>
  );
}
