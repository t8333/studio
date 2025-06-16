
'use client';

import { useState, useMemo } from 'react';
import type { Doctor } from '@/types';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DoctorTable } from '@/components/medicos/DoctorTable';
import { AddDoctorButton } from './AddDoctorButtonClient';
import { Search } from 'lucide-react';

interface DoctorsDisplayProps {
  initialDoctors: Doctor[];
}

export function DoctorsDisplay({ initialDoctors }: DoctorsDisplayProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDoctors = useMemo(() => {
    if (!searchTerm) {
      return initialDoctors;
    }
    return initialDoctors.filter(doctor =>
      doctor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor.especialidad && doctor.especialidad.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [initialDoctors, searchTerm]);

  let cardDescriptionText;
  if (filteredDoctors.length > 0) {
    cardDescriptionText = `Total de ${filteredDoctors.length} médicos ${searchTerm ? 'encontrados' : 'registrados'}.`;
  } else {
    cardDescriptionText = searchTerm ? "No se encontraron médicos que coincidan con la búsqueda." : "No hay médicos registrados todavía.";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-headline">Gestión de Médicos</h1>
          <p className="text-muted-foreground">
            Añade, modifica o elimina información de los médicos.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 md:justify-end">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <AddDoctorButton />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Médicos</CardTitle>
          <CardDescription>
            {cardDescriptionText}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DoctorTable doctors={filteredDoctors} />
        </CardContent>
      </Card>
    </div>
  );
}
