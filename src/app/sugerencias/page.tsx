import { AppLayout } from '@/components/layout/AppLayout';
import { SuggestionTool } from '@/components/sugerencias/SuggestionTool';
import { getDoctors } from '@/lib/actions/medicos.actions';
import { getCycles } from '@/lib/actions/ciclos.actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function SugerenciasPage() {
  const doctors = await getDoctors();
  const cycles = await getCycles();

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
         <div>
            <h1 className="text-3xl font-bold text-foreground font-headline">Sugerencias de Promoción</h1>
            <p className="text-muted-foreground">
              Obtén sugerencias de productos para promocionar a médicos específicos, basadas en IA.
            </p>
          </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Herramienta de Sugerencias Inteligentes</CardTitle>
            <CardDescription>
              Selecciona un médico y un ciclo para recibir recomendaciones personalizadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SuggestionTool doctors={doctors} cycles={cycles} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export const dynamic = 'force-dynamic';
