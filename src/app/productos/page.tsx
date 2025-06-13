import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { getProducts } from '@/lib/actions/productos.actions';
import { ProductTable } from '@/components/productos/ProductTable';
import { ProductDialog } from '@/components/productos/ProductDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ProductosPage() {
  const products = await getProducts();

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-headline">Gestión de Productos</h1>
            <p className="text-muted-foreground">
              Añade, modifica o elimina productos del catálogo.
            </p>
          </div>
          <ProductDialog trigger={
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Producto
            </Button>
          } />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Listado de Productos</CardTitle>
            <CardDescription>
              {products.length > 0 
                ? `Total de ${products.length} productos registrados.`
                : "No hay productos registrados todavía."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductTable products={products} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
export const dynamic = 'force-dynamic';
