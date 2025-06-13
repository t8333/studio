
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
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button'; // For disabled trigger case

interface DoctorDialogProps {
  doctor?: Doctor;
  trigger: React.ReactNode;
}

export function DoctorDialog({ doctor, trigger }: DoctorDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const isGuest = user?.role === 'guest';

  const handleSuccess = () => {
    setOpen(false);
  };
  
  if (isGuest && doctor) { // If editing and guest, show a disabled trigger
     return (
      <Button variant="ghost" size="icon" aria-label="Editar médico" disabled>
        {trigger} 
      </Button>
    );
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={isGuest && !doctor}>{trigger}</DialogTrigger>
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
