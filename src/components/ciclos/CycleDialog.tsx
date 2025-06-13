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
import { CycleForm } from './CycleForm';
import type { Cycle, Product } from '@/types';

interface CycleDialogProps {
  cycle?: Cycle;
  allProducts: Product[];
  trigger: React.ReactNode;
}

export function CycleDialog({ cycle, allProducts, trigger }: CycleDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">{cycle ? 'Editar Ciclo' : 'Crear Nuevo Ciclo'}</DialogTitle>
          <DialogDescription>
            {cycle ? 'Modifica los detalles del ciclo y su stock inicial.' : 'Completa la información para registrar un nuevo ciclo y su stock inicial.'}
          </DialogDescription>
        </DialogHeader>
        <CycleForm cycle={cycle} allProducts={allProducts} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
