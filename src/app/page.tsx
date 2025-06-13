
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Boxes, LineChart, Package, UsersRound } from 'lucide-react';
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
              <p className="text-xs text-muted-foreground">+0 esta semana</p> {/* Placeholder, adjust if dynamic data is available */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">+0 este mes</p> {/* Placeholder, adjust if dynamic data is available */}
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-headline">Visualiza tu Progreso</CardTitle>
            <CardDescription>Un vistazo rápido al rendimiento y actividad.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {/* Placeholder for a chart or more detailed stats */}
            <div className="h-[350px] w-full bg-muted rounded-lg flex items-center justify-center">
              <LineChart className="h-16 w-16 text-muted-foreground" />
               <p className="ml-4 text-muted-foreground">Gráfica de actividad próximamente</p>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 p-6 bg-card rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground mb-4 font-headline">Novedades y Consejos</h2>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                    <Image src="https://placehold.co/150x100.png" alt="Consejo 1" width={150} height={100} className="rounded-md object-cover" data-ai-hint="medical team discussion" />
                    <div>
                        <h3 className="font-semibold text-primary">Optimiza tu Ruta de Visitas</h3>
                        <p className="text-sm text-muted-foreground mt-1">Usa la función de planificación para organizar tus visitas de manera eficiente y ahorrar tiempo.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                     <Image src="https://placehold.co/150x100.png" alt="Consejo 2" width={150} height={100} className="rounded-md object-cover" data-ai-hint="pharmaceutical products" />
                    <div>
                        <h3 className="font-semibold text-primary">Mantén tu Stock al Día</h3>
                        <p className="text-sm text-muted-foreground mt-1">Revisa regularmente la sección de stock para asegurar la disponibilidad de productos clave.</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </AppLayout>
  );
}

export const dynamic = 'force-dynamic'; // Ensures data is fetched on each request
