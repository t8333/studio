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
import { VisitForm } from './VisitForm';
import type { Visit, Doctor, Cycle, Product } from '@/types';

interface VisitDialogProps {
  visit?: Visit;
  doctors: Doctor[];
  cycles: Cycle[];
  allProducts: Product[];
  trigger: React.ReactNode;
}

export function VisitDialog({ visit, doctors, cycles, allProducts, trigger }: VisitDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">{visit ? 'Editar Visita' : 'Registrar Nueva Visita'}</DialogTitle>
          <DialogDescription>
            {visit ? 'Modifica los detalles de la visita.' : 'Completa la información para registrar una nueva visita.'}
          </DialogDescription>
        </DialogHeader>
        <VisitForm
          visit={visit}
          doctors={doctors}
          cycles={cycles}
          allProducts={allProducts}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
