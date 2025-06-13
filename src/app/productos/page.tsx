
import { AppLayout } from '@/components/layout/AppLayout';
import { getProducts } from '@/lib/actions/productos.actions';
import { ProductTable } from '@/components/productos/ProductTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddProductButton } from './AddProductButtonClient';

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
          <AddProductButton />
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
