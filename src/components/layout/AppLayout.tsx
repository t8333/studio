
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UsersRound, Package, CalendarClock, BriefcaseMedical, Boxes, Lightbulb, Settings, PanelLeft, LogOut } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/medicos', label: 'Médicos', icon: UsersRound },
  { href: '/productos', label: 'Productos', icon: Package },
  { href: '/ciclos', label: 'Ciclos', icon: CalendarClock },
  { href: '/visitas', label: 'Visitas', icon: BriefcaseMedical },
  { href: '/stock', label: 'Stock', icon: Boxes },
  { href: '/sugerencias', label: 'Sugerencias', icon: Lightbulb },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) {
    // This should ideally be handled by AuthProvider's redirect,
    // but as a fallback or if AuthProvider logic changes.
    return null; 
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  }

  return (
    <SidebarProvider defaultOpen>
      <SidebarDecorator>
        <Sidebar className="flex flex-col" variant="sidebar" collapsible="icon">
          <SidebarHeader className="p-4 flex items-center gap-2 justify-between">
             <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <Logo className="w-7 h-7 text-primary" />
                <h1 className="text-xl font-semibold text-sidebar-foreground font-headline">MediStock</h1>
              </Link>
              <div className="group-data-[collapsible=icon]:grow group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <SidebarTrigger asChild className="group-data-[collapsible=icon]:flex">
                  <Button variant="ghost" size="icon">
                    <PanelLeft />
                  </Button>
                </SidebarTrigger>
              </div>
          </SidebarHeader>
          <SidebarContent className="flex-1 p-2 overflow-y-auto">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                    tooltip={item.label}
                    className={cn(
                      "justify-start",
                      (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))) && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2">
             <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:hidden border-t border-sidebar-border">
              <Avatar className="h-8 w-8">
                {/* <AvatarImage src="https://placehold.co/40x40.png" alt={user.username} /> */}
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-sidebar-foreground capitalize">{user.username}</span>
                <span className="text-xs text-sidebar-foreground/70 capitalize">{user.role === 'admin' ? 'Administrador' : 'Invitado'}</span>
              </div>
            </div>
            <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/configuracion'}
                    tooltip="Configuración"
                    className={cn(
                      "justify-start",
                      pathname === '/configuracion' && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <Link href="/configuracion">
                        <Settings className="h-5 w-5" />
                        <span>Configuración</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={logout}
                    tooltip="Cerrar Sesión"
                    className="justify-start w-full hover:bg-destructive/20 hover:text-destructive"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Cerrar Sesión</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col">
           <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-lg font-semibold md:text-xl font-headline">
              {navItems.find(item => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))?.label || (pathname === '/configuracion' ? 'Configuración' : 'MediStock')}
            </h1>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarDecorator>
    </SidebarProvider>
  );
}

function SidebarDecorator({ children }: { children: React.ReactNode }) {
  return <div className="group/sidebar-wrapper flex min-h-svh w-full">{children}</div>;
}
