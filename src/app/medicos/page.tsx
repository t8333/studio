
import { AppLayout } from '@/components/layout/AppLayout';
import { getDoctors } from '@/lib/actions/medicos.actions';
import { DoctorTable } from '@/components/medicos/DoctorTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddDoctorButton } from './AddDoctorButtonClient';

export default async function MedicosPage() {
  const doctors = await getDoctors();

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-headline">Gestión de Médicos</h1>
            <p className="text-muted-foreground">
              Añade, modifica o elimina información de los médicos.
            </p>
          </div>
          <AddDoctorButton />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Listado de Médicos</CardTitle>
            <CardDescription>
              {doctors.length > 0 
                ? `Total de ${doctors.length} médicos registrados.` 
                : "No hay médicos registrados todavía."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DoctorTable doctors={doctors} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export const dynamic = 'force-dynamic';
