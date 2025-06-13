import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function ConfiguracionPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-headline">Configuración</h1>
          <p className="text-muted-foreground">
            Ajusta las preferencias y configuraciones de la aplicación.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Opciones Generales
            </CardTitle>
            <CardDescription>
              Esta sección está en desarrollo. Próximamente podrás configurar varios aspectos de MediStock.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center bg-muted rounded-md">
              <p className="text-muted-foreground">Contenido de configuración próximamente...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
