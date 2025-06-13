import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { getVisits } from '@/lib/actions/visitas.actions';
import { getDoctors } from '@/lib/actions/medicos.actions';
import { getCycles } from '@/lib/actions/ciclos.actions';
import { getProducts } from '@/lib/actions/productos.actions';
import { VisitTable } from '@/components/visitas/VisitTable';
import { VisitDialog } from '@/components/visitas/VisitDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function VisitasPage() {
  const visits = await getVisits();
  const doctors = await getDoctors();
  const cycles = await getCycles();
  const products = await getProducts();

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
           <div>
            <h1 className="text-3xl font-bold text-foreground font-headline">Planificación de Visitas</h1>
            <p className="text-muted-foreground">
              Registra, modifica o elimina visitas a médicos por ciclo.
            </p>
          </div>
          <VisitDialog
            doctors={doctors}
            cycles={cycles}
            allProducts={products}
            trigger={
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Registrar Visita
              </Button>
            }
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Historial de Visitas</CardTitle>
             <CardDescription>
              {visits.length > 0 
                ? `Total de ${visits.length} visitas registradas.`
                : "No hay visitas registradas todavía."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VisitTable
              visits={visits}
              doctors={doctors}
              cycles={cycles}
              allProducts={products}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export const dynamic = 'force-dynamic';
