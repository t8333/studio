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
import { DoctorForm } from './DoctorForm';
import type { Doctor } from '@/types';

interface DoctorDialogProps {
  doctor?: Doctor;
  trigger: React.ReactNode;
}

export function DoctorDialog({ doctor, trigger }: DoctorDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{doctor ? 'Editar Médico' : 'Añadir Nuevo Médico'}</DialogTitle>
          <DialogDescription>
            {doctor ? 'Modifica los detalles del médico.' : 'Completa la información para registrar un nuevo médico.'}
          </DialogDescription>
        </DialogHeader>
        <DoctorForm doctor={doctor} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
