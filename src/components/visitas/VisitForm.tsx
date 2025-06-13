
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { saveVisit } from '@/lib/actions/visitas.actions';
import type { Visit, OptionalId, Doctor, Cycle, Product } from '@/types';
import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';

const visitFormSchema = z.object({
  medicoId: z.string().min(1, { message: 'Debe seleccionar un médico.' }),
  cicloId: z.string().min(1, { message: 'Debe seleccionar un ciclo.' }),
  fecha: z.date({ required_error: 'La fecha de la visita es obligatoria.' }),
  notas: z.string().max(500).optional().or(z.literal('')),
  productosEntregados: z.array(z.object({
    productoId: z.string(),
    cantidadEntregada: z.coerce.number().min(0, { message: 'La cantidad no puede ser negativa.' }),
  })).min(0),
});

type VisitFormValues = z.infer<typeof visitFormSchema>;

interface VisitFormProps {
  visit?: Visit;
  doctors: Doctor[];
  cycles: Cycle[];
  allProducts: Product[];
  onSuccess?: () => void;
}

export function VisitForm({ visit, doctors, cycles, allProducts, onSuccess }: VisitFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const isGuest = user?.role === 'guest';

  const form = useForm<VisitFormValues>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      medicoId: visit?.medicoId || '',
      cicloId: visit?.cicloId || '',
      fecha: visit?.fecha ? parseISO(visit.fecha) : new Date(),
      notas: visit?.notas || '',
      productosEntregados: visit?.productosEntregados 
        ? visit.productosEntregados.map(vp => ({ productoId: vp.productoId, cantidadEntregada: vp.cantidadEntregada }))
        : allProducts.map(p => ({ productoId: p.id, cantidadEntregada: 0 })),
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "productosEntregados",
  });

  const selectedCycleId = useWatch({ control: form.control, name: 'cicloId' });
  const selectedCycle = cycles.find(c => c.id === selectedCycleId);

  useEffect(() => {
    const initialProducts = visit?.productosEntregados
      ? visit.productosEntregados.map(vp => ({ productoId: vp.productoId, cantidadEntregada: vp.cantidadEntregada }))
      : allProducts.map(p => ({ productoId: p.id, cantidadEntregada: 0 }));

    const productsMap = new Map(initialProducts.map(item => [item.productoId, item.cantidadEntregada]));
    const fullProductArray = allProducts.map(p => ({
      productoId: p.id,
      cantidadEntregada: productsMap.get(p.id) || 0,
    }));
    
    replace(fullProductArray);

    if (visit) {
      form.reset({
        medicoId: visit.medicoId,
        cicloId: visit.cicloId,
        fecha: parseISO(visit.fecha),
        notas: visit.notas || '',
        productosEntregados: fullProductArray,
      });
    } else {
       form.reset({
        medicoId: '',
        cicloId: '',
        fecha: new Date(),
        notas: '',
        productosEntregados: allProducts.map(p => ({ productoId: p.id, cantidadEntregada: 0 }))
      });
    }
  }, [visit, allProducts, form, replace]);

  async function onSubmit(data: VisitFormValues) {
    if (isGuest) {
      toast({ title: 'Acción no permitida', description: 'Los invitados no pueden guardar cambios.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    const productosFiltrados = data.productosEntregados.filter(p => p.cantidadEntregada > 0);

    try {
      const visitToSave: OptionalId<Visit> = {
        id: visit?.id,
        medicoId: data.medicoId,
        cicloId: data.cicloId,
        fecha: data.fecha.toISOString(),
        notas: data.notas,
        productosEntregados: productosFiltrados,
      };
      await saveVisit(visitToSave);
      toast({
        title: 'Éxito',
        description: `Visita ${visit ? 'actualizada' : 'registrada'} correctamente.`,
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || `Error al ${visit ? 'actualizar' : 'registrar'} la visita.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="medicoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Médico</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isGuest}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un médico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map(doc => (
                      <SelectItem key={doc.id} value={doc.id}>{doc.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cicloId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciclo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isGuest}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un ciclo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cycles.map(cyc => (
                      <SelectItem key={cyc.id} value={cyc.id}>{cyc.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de la Visita</FormLabel>
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
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: Conversación sobre el nuevo estudio, próxima cita tentativa..." {...field} disabled={isGuest} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel>Productos Entregados</FormLabel>
          <FormDescription>
            Indica la cantidad de cada producto entregado. El stock se ajustará automáticamente.
            {selectedCycle ? ` (Stock del ciclo: ${selectedCycle.nombre})` : ' (Seleccione un ciclo para ver stock)'}
          </FormDescription>
          <ScrollArea className="h-[200px] mt-2 border rounded-md p-2">
            <div className="space-y-3 pr-3">
            {fields.map((field, index) => {
              const productDetails = allProducts.find(p => p.id === field.productoId);
              const stockInCycle = selectedCycle?.stockProductos.find(sp => sp.productoId === field.productoId)?.cantidad;
              const availableStock = visit?.productosEntregados.find(vp => vp.productoId === field.productoId && visit.cicloId === selectedCycleId) 
                                    ? (stockInCycle || 0) + (visit.productosEntregados.find(vp => vp.productoId === field.productoId)?.cantidadEntregada || 0)
                                    : (stockInCycle || 0);

              return (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`productosEntregados.${index}.cantidadEntregada`}
                  render={({ field: itemField }) => (
                    <FormItem className="flex items-center justify-between gap-2">
                       <div className="w-2/3">
                        <FormLabel className="text-sm whitespace-nowrap overflow-hidden text-ellipsis block" title={productDetails?.nombre}>
                          {productDetails?.nombre || `Producto ID: ${field.productoId}`}
                        </FormLabel>
                        {selectedCycle && (
                          <FormDescription className="text-xs">
                            Stock disp: {availableStock ?? 'N/A'}
                          </FormDescription>
                        )}
                      </div>
                      <div className="flex-1">
                        <FormControl>
                           <Input 
                            type="number" 
                            min="0" 
                            max={availableStock !== undefined ? String(availableStock) : undefined}
                            {...itemField} 
                            className="h-8 text-sm"
                            disabled={!selectedCycleId || isGuest}
                          />
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
        </div>

        <Button type="submit" disabled={isSubmitting || !selectedCycleId || isGuest} className="w-full bg-accent hover:bg-accent/90">
          {isSubmitting ? 'Guardando...' : (visit ? 'Actualizar Visita' : 'Registrar Visita')}
        </Button>
        {!selectedCycleId && <p className="text-sm text-destructive text-center">Por favor, seleccione un ciclo para habilitar el registro de productos.</p>}
      </form>
    </Form>
  );
}
