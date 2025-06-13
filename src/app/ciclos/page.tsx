
import { AppLayout } from '@/components/layout/AppLayout';
import { getCycles } from '@/lib/actions/ciclos.actions';
import { getProducts } from '@/lib/actions/productos.actions';
import { CycleTable } from '@/components/ciclos/CycleTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddCycleButton } from './AddCycleButtonClient';

export default async function CiclosPage() {
  const cycles = await getCycles();
  const products = await getProducts();

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-headline">Gestión de Ciclos</h1>
            <p className="text-muted-foreground">
              Define ciclos de visita, gestiona el stock inicial de productos para cada uno.
            </p>
          </div>
          <AddCycleButton allProducts={products} />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Listado de Ciclos</CardTitle>
            <CardDescription>
              {cycles.length > 0 
                ? `Total de ${cycles.length} ciclos definidos.`
                : "No hay ciclos definidos todavía."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CycleTable cycles={cycles} allProducts={products} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export const dynamic = 'force-dynamic';
