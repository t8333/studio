
'use client';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { CycleDialog } from '@/components/ciclos/CycleDialog';
import { useAuth } from '@/context/AuthContext';
import type { Product } from '@/types';

interface AddCycleButtonProps {
  allProducts: Product[];
}

export function AddCycleButton({ allProducts }: AddCycleButtonProps) {
  const { user } = useAuth();
  const isGuest = user?.role === 'guest';

  if (isGuest) {
    return (
      <Button disabled>
        <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Ciclo
      </Button>
    );
  }

  return (
    <CycleDialog 
      allProducts={allProducts} 
      trigger={
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Ciclo
        </Button>
      } 
    />
  );
}
