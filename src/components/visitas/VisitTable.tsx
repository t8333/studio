'use client';

import type { Visit, Doctor, Cycle, Product } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, PackageSearch } from 'lucide-react';
import { VisitDialog } from './VisitDialog';
import { DeleteDialog } from '@/components/shared/DeleteDialog';
import { deleteVisit } from '@/lib/actions/visitas.actions';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VisitTableProps {
  visits: Visit[];
  doctors: Doctor[];
  cycles: Cycle[];
  allProducts: Product[];
}

export function VisitTable({ visits, doctors, cycles, allProducts }: VisitTableProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteVisit(id);
      toast({ title: 'Éxito', description: 'Visita eliminada correctamente.' });
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message || 'No se pudo eliminar la visita.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const getDoctorName = (id: string) => doctors.find(d => d.id === id)?.nombre || 'Desconocido';
  const getCycleName = (id: string) => cycles.find(c => c.id === id)?.nombre || 'Desconocido';
  const getProductName = (id: string) => allProducts.find(p => p.id === id)?.nombre || 'Desconocido';

  if (visits.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No hay visitas para mostrar.</p>;
  }

  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Médico</TableHead>
              <TableHead>Ciclo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Productos Entregados</TableHead>
              <TableHead className="text-right w-[120px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visits.map((visit) => (
              <TableRow key={visit.id}>
                <TableCell className="font-medium">{getDoctorName(visit.medicoId)}</TableCell>
                <TableCell>{getCycleName(visit.cicloId)}</TableCell>
                <TableCell>{format(parseISO(visit.fecha), "PPP", { locale: es })}</TableCell>
                <TableCell>
                  {visit.productosEntregados.length > 0 ? (
                     <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="cursor-pointer">
                          {visit.productosEntregados.length} producto(s) <PackageSearch className="ml-1 h-3 w-3"/>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <ul className="list-disc pl-4">
                          {visit.productosEntregados.map(vp => (
                            <li key={vp.productoId}>
                              {getProductName(vp.productoId)}: {vp.cantidadEntregada} uds.
                            </li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Badge variant="outline">Ninguno</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <VisitDialog
                      visit={visit}
                      doctors={doctors}
                      cycles={cycles}
                      allProducts={allProducts}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label="Editar visita">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DeleteDialog
                      onConfirm={() => handleDelete(visit.id)}
                      itemName={`visita del ${format(parseISO(visit.fecha), "P", { locale: es })} a ${getDoctorName(visit.medicoId)}`}
                      itemType="visita"
                      isDeleting={isDeleting}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label="Eliminar visita" disabled={isDeleting}>
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
    </TooltipProvider>
  );
}
