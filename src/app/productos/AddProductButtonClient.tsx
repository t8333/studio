
'use client';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ProductDialog } from '@/components/productos/ProductDialog';
import { useAuth } from '@/context/AuthContext';

export function AddProductButton() {
  const { user } = useAuth();
  const isGuest = user?.role === 'guest';

  if (isGuest) {
    return (
      <Button disabled>
        <PlusCircle className="mr-2 h-4 w-4" /> Añadir Producto
      </Button>
    );
  }

  return (
    <ProductDialog trigger={
      <Button>
        <PlusCircle className="mr-2 h-4 w-4" /> Añadir Producto
      </Button>
    } />
  );
}
