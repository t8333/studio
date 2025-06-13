'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DeleteDialogProps {
  trigger: React.ReactNode;
  onConfirm: () => Promise<void> | void;
  itemName: string;
  itemType: string;
  isDeleting?: boolean;
}

export function DeleteDialog({ trigger, onConfirm, itemName, itemType, isDeleting = false }: DeleteDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline">¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente el {itemType} <span className="font-semibold">{itemName}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={async (e) => {
              e.preventDefault(); // Prevent dialog closing if onConfirm is async and errors
              await onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
