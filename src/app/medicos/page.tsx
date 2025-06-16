
import { AppLayout } from '@/components/layout/AppLayout';
import { getDoctors } from '@/lib/actions/medicos.actions';
import { DoctorsDisplay } from './DoctorsDisplay';

export default async function MedicosPage() {
  const doctors = await getDoctors();

  return (
    <AppLayout>
      <DoctorsDisplay initialDoctors={doctors} />
    </AppLayout>
  );
}

export const dynamic = 'force-dynamic';
