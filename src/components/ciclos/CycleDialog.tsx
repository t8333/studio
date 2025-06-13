
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
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button'; // For disabled trigger case

interface CycleDialogProps {
  cycle?: Cycle;
  allProducts: Product[];
  trigger: React.ReactNode;
}

export function CycleDialog({ cycle, allProducts, trigger }: CycleDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const isGuest = user?.role === 'guest';

  const handleSuccess = () => {
    setOpen(false);
  };

  if (isGuest && cycle) { // If editing and guest, show a disabled trigger
     return (
      <Button variant="ghost" size="icon" aria-label="Editar ciclo" disabled>
        {trigger} 
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={isGuest && !cycle}>{trigger}</DialogTrigger>
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
