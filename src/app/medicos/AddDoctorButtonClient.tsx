
'use client';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { DoctorDialog } from '@/components/medicos/DoctorDialog';
import { useAuth } from '@/context/AuthContext';

export function AddDoctorButton() {
  const { user } = useAuth();
  const isGuest = user?.role === 'guest';

  if (isGuest) {
    return (
      <Button disabled>
        <PlusCircle className="mr-2 h-4 w-4" /> Añadir Médico
      </Button>
    );
  }

  return (
    <DoctorDialog trigger={
      <Button>
        <PlusCircle className="mr-2 h-4 w-4" /> Añadir Médico
      </Button>
    } />
  );
}
