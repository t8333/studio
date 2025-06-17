
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lightbulb, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductSuggestions } from '@/lib/actions/sugerencias.actions';
import type { Doctor, Cycle } from '@/types';
import type { SuggestProductsForDoctorOutput } from '@/ai/flows/suggest-products-for-doctor';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const suggestionFormSchema = z.object({
  doctorId: z.string().min(1, { message: 'Debe seleccionar un médico.' }),
  cycleId: z.string().min(1, { message: 'Debe seleccionar un ciclo.' }),
});

type SuggestionFormValues = z.infer<typeof suggestionFormSchema>;

interface SuggestionToolProps {
  doctors: Doctor[];
  cycles: Cycle[];
}

export function SuggestionTool({ doctors, cycles }: SuggestionToolProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestProductsForDoctorOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SuggestionFormValues>({
    resolver: zodResolver(suggestionFormSchema),
    defaultValues: {
      doctorId: '',
      cycleId: '',
    },
  });

  async function onSubmit(data: SuggestionFormValues) {
    setIsLoading(true);
    setSuggestions(null);
    setError(null);
    try {
      const result = await getProductSuggestions(data.doctorId, data.cycleId);
      setSuggestions(result);
    } catch (err) {
      const errorMessage = (err as Error).message || 'Error desconocido al obtener sugerencias.';
      setError(errorMessage);
      toast({
        title: 'Error de Sugerencia',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const selectedDoctor = doctors.find(d => d.id === form.watch('doctorId'));
  const selectedCycle = cycles.find(c => c.id === form.watch('cycleId'));
  
  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Médico</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              name="cycleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciclo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Obteniendo Sugerencias...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Obtener Sugerencias
              </>
            )}
          </Button>
        </form>
      </Form>

      {selectedDoctor && (
        <Alert variant="default" className="mt-4">
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Información del Médico Seleccionado</AlertTitle>
          <AlertDescription>
            <p><span className="font-semibold">Nombre:</span> {selectedDoctor.nombre}</p>
            <p><span className="font-semibold">Especialidad:</span> {selectedDoctor.especialidad}</p>
            <p><span className="font-semibold">Intereses:</span> {selectedDoctor.intereses || 'No especificados'}</p>
          </AlertDescription>
        </Alert>
      )}

      {selectedCycle && (
         <Alert variant="default" className="mt-4">
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Información del Ciclo Seleccionado</AlertTitle>
          <AlertDescription>
            <p><span className="font-semibold">Nombre:</span> {selectedCycle.nombre}</p>
            {/* Marketing priorities line removed from here */}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error al generar sugerencias</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {suggestions && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center font-headline">
              <Lightbulb className="mr-2 h-5 w-5 text-primary" />
              Sugerencias de Productos
            </CardTitle>
            <CardDescription>
              Basado en la información proporcionada, estos son los productos recomendados:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground">Productos Sugeridos:</h4>
              {suggestions.suggestedProducts.length > 0 ? (
                <ul className="list-disc list-inside text-muted-foreground pl-4">
                  {suggestions.suggestedProducts.map((product, index) => (
                    <li key={index}>{product}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No se sugirieron productos específicos.</p>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Razonamiento:</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{suggestions.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
