
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
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';


interface DeleteDialogProps {
  trigger: React.ReactNode;
  onConfirm: () => Promise<void> | void;
  itemName: string;
  itemType: string;
  isDeleting?: boolean;
}

export function DeleteDialog({ trigger, onConfirm, itemName, itemType, isDeleting = false }: DeleteDialogProps) {
  const { user } = useAuth();
  const isGuest = user?.role === 'guest';
  const { toast } = useToast();

  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault(); 
    if (isGuest) {
      toast({ title: 'Acción no permitida', description: `Los invitados no pueden eliminar ${itemType}s.`, variant: 'destructive' });
      return;
    }
    await onConfirm();
  };
  
  if (isGuest) {
     return (
      <Button variant="ghost" size="icon" aria-label={`Eliminar ${itemType}`} disabled>
        {trigger}
      </Button>
    );
  }

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
            onClick={handleConfirm}
            disabled={isDeleting || isGuest}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
