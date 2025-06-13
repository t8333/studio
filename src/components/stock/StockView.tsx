'use client';

import { useState, useMemo } from 'react';
import type { Cycle, Product, CycleProductStock } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PackageOpen } from 'lucide-react';

interface StockViewProps {
  cycles: Cycle[];
  allProducts: Product[];
}

export function StockView({ cycles, allProducts }: StockViewProps) {
  const [selectedCycleId, setSelectedCycleId] = useState<string | undefined>(cycles[0]?.id);

  const selectedCycle = useMemo(() => {
    return cycles.find(c => c.id === selectedCycleId);
  }, [selectedCycleId, cycles]);

  const stockData = useMemo(() => {
    if (!selectedCycle) return [];
    return selectedCycle.stockProductos.map(sp => {
      const product = allProducts.find(p => p.id === sp.productoId);
      return {
        productName: product?.nombre || 'Producto Desconocido',
        productIdentifier: product?.identificadorUnico || '-',
        quantity: sp.cantidad,
      };
    }).sort((a,b) => a.productName.localeCompare(b.productName));
  }, [selectedCycle, allProducts]);

  if (cycles.length === 0) {
    return (
      <Alert>
        <PackageOpen className="h-4 w-4" />
        <AlertTitle>No hay ciclos disponibles</AlertTitle>
        <AlertDescription>
          No se pueden mostrar datos de stock porque no hay ciclos creados. Por favor, crea un ciclo primero.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="cycle-select" className="block text-sm font-medium text-foreground mb-1">
          Seleccionar Ciclo:
        </label>
        <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
          <SelectTrigger id="cycle-select" className="w-full md:w-[300px]">
            <SelectValue placeholder="Elige un ciclo..." />
          </SelectTrigger>
          <SelectContent>
            {cycles.map(cycle => (
              <SelectItem key={cycle.id} value={cycle.id}>
                {cycle.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCycle ? (
        stockData.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Identificador</TableHead>
                  <TableHead className="text-right">Cantidad en Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.productIdentifier}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Alert>
            <PackageOpen className="h-4 w-4" />
            <AlertTitle>Sin Productos</AlertTitle>
            <AlertDescription>
              El ciclo seleccionado ({selectedCycle.nombre}) no tiene productos con stock asignado o no hay productos en el sistema.
            </AlertDescription>
          </Alert>
        )
      ) : (
         <Alert variant="default">
            <PackageOpen className="h-4 w-4" />
            <AlertTitle>Seleccione un ciclo</AlertTitle>
            <AlertDescription>
              Por favor, elija un ciclo de la lista para ver su inventario de productos.
            </AlertDescription>
          </Alert>
      )}
    </div>
  );
}
