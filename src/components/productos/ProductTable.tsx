
'use client';

import type { Product } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { ProductDialog } from './ProductDialog';
import { DeleteDialog } from '@/components/shared/DeleteDialog';
import { deleteProduct } from '@/lib/actions/productos.actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const isGuest = user?.role === 'guest';

  const handleDelete = async (id: string) => {
    if (isGuest) {
      toast({ title: 'Acción no permitida', description: 'Los invitados no pueden eliminar productos.', variant: 'destructive' });
      return;
    }
    setIsDeleting(true);
    try {
      await deleteProduct(id);
      toast({ title: 'Éxito', description: 'Producto eliminado correctamente.' });
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message || 'No se pudo eliminar el producto.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (products.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No hay productos para mostrar.</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Identificador</TableHead>
            {!isGuest && <TableHead className="text-right w-[120px]">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.nombre}</TableCell>
              <TableCell className="max-w-xs truncate">{product.descripcion}</TableCell>
              <TableCell>{product.identificadorUnico}</TableCell>
              {!isGuest && (
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <ProductDialog
                      product={product}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label="Editar producto" disabled={isGuest}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DeleteDialog
                      onConfirm={() => handleDelete(product.id)}
                      itemName={product.nombre}
                      itemType="producto"
                      isDeleting={isDeleting}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label="Eliminar producto" disabled={isDeleting || isGuest}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      }
                    />
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
