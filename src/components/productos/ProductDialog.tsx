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

interface ProductDialogProps {
  product?: Product;
  trigger: React.ReactNode;
}

export function ProductDialog({ product, trigger }: ProductDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
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
