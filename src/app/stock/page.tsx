import { AppLayout } from '@/components/layout/AppLayout';
import { StockView } from '@/components/stock/StockView';
import { getCycles } from '@/lib/actions/ciclos.actions';
import { getProducts } from '@/lib/actions/productos.actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function StockPage() {
  const cycles = await getCycles();
  const products = await getProducts();

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
         <div>
            <h1 className="text-3xl font-bold text-foreground font-headline">Visualización de Stock</h1>
            <p className="text-muted-foreground">
              Consulta el stock actual de productos por ciclo.
            </p>
          </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Stock por Ciclo</CardTitle>
            <CardDescription>
              Selecciona un ciclo para ver el detalle del inventario de productos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StockView cycles={cycles} allProducts={products} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export const dynamic = 'force-dynamic';
