'use client';

import type { Cycle, Product } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Boxes } from 'lucide-react';
import { CycleDialog } from './CycleDialog';
import { DeleteDialog } from '@/components/shared/DeleteDialog';
import { ManageStockDialog } from './ManageStockDialog';
import { deleteCycle } from '@/lib/actions/ciclos.actions';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

interface CycleTableProps {
  cycles: Cycle[];
  allProducts: Product[];
}

export function CycleTable({ cycles, allProducts }: CycleTableProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteCycle(id);
      toast({ title: 'Éxito', description: 'Ciclo eliminado correctamente.' });
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message || 'No se pudo eliminar el ciclo.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (cycles.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No hay ciclos para mostrar.</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Fecha Inicio</TableHead>
            <TableHead>Fecha Fin</TableHead>
            <TableHead className="text-right w-[180px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cycles.map((cycle) => (
            <TableRow key={cycle.id}>
              <TableCell className="font-medium">{cycle.nombre}</TableCell>
              <TableCell>{format(parseISO(cycle.fechaInicio), "PPP", { locale: es })}</TableCell>
              <TableCell>{format(parseISO(cycle.fechaFin), "PPP", { locale: es })}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <ManageStockDialog
                    cycle={cycle}
                    allProducts={allProducts}
                    trigger={
                       <Button variant="ghost" size="icon" aria-label="Gestionar stock">
                        <Boxes className="h-4 w-4 text-primary" />
                      </Button>
                    }
                  />
                  <CycleDialog
                    cycle={cycle}
                    allProducts={allProducts}
                    trigger={
                      <Button variant="ghost" size="icon" aria-label="Editar ciclo">
                        <Edit className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <DeleteDialog
                    onConfirm={() => handleDelete(cycle.id)}
                    itemName={cycle.nombre}
                    itemType="ciclo"
                    isDeleting={isDeleting}
                    trigger={
                      <Button variant="ghost" size="icon" aria-label="Eliminar ciclo" disabled={isDeleting}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    }
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
