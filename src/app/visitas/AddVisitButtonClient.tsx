
'use client';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { VisitDialog } from '@/components/visitas/VisitDialog';
import { useAuth } from '@/context/AuthContext';
import type { Doctor, Cycle, Product } from '@/types';

interface AddVisitButtonProps {
  doctors: Doctor[];
  cycles: Cycle[];
  allProducts: Product[];
}

export function AddVisitButton({ doctors, cycles, allProducts }: AddVisitButtonProps) {
  const { user } = useAuth();
  const isGuest = user?.role === 'guest';

  if (isGuest) {
    return (
      <Button disabled>
        <PlusCircle className="mr-2 h-4 w-4" /> Registrar Visita
      </Button>
    );
  }

  return (
    <VisitDialog
      doctors={doctors}
      cycles={cycles}
      allProducts={allProducts}
      trigger={
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Registrar Visita
        </Button>
      }
    />
  );
}
