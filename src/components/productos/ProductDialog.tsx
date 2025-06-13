
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProductForm } from './ProductForm';
import type { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface ProductDialogProps {
  product?: Product;
  trigger: React.ReactNode;
}

export function ProductDialog({ product, trigger }: ProductDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const isGuest = user?.role === 'guest';

  const handleSuccess = () => {
    setOpen(false);
  };

  if (isGuest && product) { // If editing and guest, show a disabled trigger
     return (
      <Button variant="ghost" size="icon" aria-label="Editar producto" disabled>
        {trigger} 
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={isGuest && !product}>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{product ? 'Editar Producto' : 'Añadir Nuevo Producto'}</DialogTitle>
          <DialogDescription>
            {product ? 'Modifica los detalles del producto.' : 'Completa la información para registrar un nuevo producto.'}
          </DialogDescription>
        </DialogHeader>
        <ProductForm product={product} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
