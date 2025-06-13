
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Boxes, Package, UsersRound } from 'lucide-react';
import Image from 'next/image';
import { getDoctors } from '@/lib/actions/medicos.actions';
import { getProducts } from '@/lib/actions/productos.actions';
import { getCycles } from '@/lib/actions/ciclos.actions';

export default async function DashboardPage() {
  const doctors = await getDoctors();
  const products = await getProducts();
  const cycles = await getCycles();

  let totalStock = 0;
  cycles.forEach(cycle => {
    cycle.stockProductos.forEach(item => {
      totalStock += item.cantidad;
    });
  });

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-foreground font-headline">Bienvenido a MediStock</h1>
        <p className="text-lg text-muted-foreground">
          Gestiona eficientemente tus médicos, productos, ciclos y visitas. Optimiza tu inventario y estrategias de promoción.
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Médicos Registrados</CardTitle>
              <UsersRound className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{doctors.length}</div>
              <p className="text-xs text-muted-foreground">+0 esta semana</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">+0 este mes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Total en Ciclos</CardTitle>
              <Boxes className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStock}</div>
              <p className="text-xs text-muted-foreground">Unidades disponibles</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-center">
          <Image
            src="https://placehold.co/600x400.png"
            alt="Dashboard placeholder image"
            width={600}
            height={400}
            className="rounded-lg shadow-md"
            data-ai-hint="peeking bears"
          />
        </div>
        
      </div>
    </AppLayout>
  );
}

export const dynamic = 'force-dynamic'; // Ensures data is fetched on each request

