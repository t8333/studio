
'use client';

import type { Doctor } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { DoctorDialog } from './DoctorDialog';
import { DeleteDialog } from '@/components/shared/DeleteDialog';
import { deleteDoctor } from '@/lib/actions/medicos.actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface DoctorTableProps {
  doctors: Doctor[];
}

export function DoctorTable({ doctors }: DoctorTableProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const isGuest = user?.role === 'guest';

  const handleDelete = async (id: string) => {
    if (isGuest) {
      toast({ title: 'Acción no permitida', description: 'Los invitados no pueden eliminar médicos.', variant: 'destructive' });
      return;
    }
    setIsDeleting(true);
    try {
      await deleteDoctor(id);
      toast({ title: 'Éxito', description: 'Médico eliminado correctamente.' });
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message || 'No se pudo eliminar el médico.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (doctors.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No hay médicos para mostrar.</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Especialidad</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            {!isGuest && <TableHead className="text-right w-[120px]">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow key={doctor.id}>
              <TableCell className="font-medium">{doctor.nombre}</TableCell>
              <TableCell>{doctor.especialidad}</TableCell>
              <TableCell>{doctor.telefono || '-'}</TableCell>
              <TableCell>{doctor.email || '-'}</TableCell>
              {!isGuest && (
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <DoctorDialog
                      doctor={doctor}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label="Editar médico" disabled={isGuest}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DeleteDialog
                      onConfirm={() => handleDelete(doctor.id)}
                      itemName={doctor.nombre}
                      itemType="médico"
                      isDeleting={isDeleting}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label="Eliminar médico" disabled={isDeleting || isGuest}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      }
                    />
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
