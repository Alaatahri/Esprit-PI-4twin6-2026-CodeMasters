'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Truck, Package, Map as MapIcon, BarChart3, 
  Settings, LogOut, Bell, User as UserIcon,
  LayoutDashboard, Menu, X
} from 'lucide-react';
import { getStoredUser } from '@/lib/auth';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      if (stored.role !== 'livreur' && stored.role !== 'admin') {
        router.push('/login');
      } else {
        setUser(stored);
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const navigation = [
    { name: 'Tableau de bord', href: '/espace-livreur', icon: LayoutDashboard },
    { name: 'Missions disponibles', href: '/espace-livreur/missions', icon: Package },
    { name: 'Mes livraisons', href: '/espace-livreur/mes-livraisons', icon: Truck },
    { name: 'Carte interactive', href: '/espace-livreur/carte', icon: MapIcon },
    { name: 'Statistiques', href: '/espace-livreur/stats', icon: BarChart3 },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950 flex text-foreground dark:text-white">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-card dark:bg-gray-900 border-r border-border dark:border-white/10 transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-gray-900" />
              </div>
              <span className="font-bold text-xl tracking-tight">BMP<span className="text-amber-500">.livreur</span></span>
            </div>
          ) : (
            <Truck className="w-8 h-8 text-amber-500 mx-auto" />
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-amber-500 text-gray-900 font-bold' 
                    : 'text-muted-foreground dark:text-gray-400 hover:bg-black/5 dark:bg-white/5 hover:text-foreground dark:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {isSidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border dark:border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border dark:border-white/10 bg-gray-900/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-black/5 dark:bg-white/5 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-4">
            <button className="p-2 text-muted-foreground dark:text-gray-400 hover:text-foreground dark:text-white relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-gray-900"></span>
            </button>
            <div className="h-8 w-px bg-black/5 dark:bg-white/10 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{user.nom}</p>
                <p className="text-[10px] text-amber-500 uppercase font-black">Livreur Certifié</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5">
                <div className="w-full h-full rounded-full bg-card dark:bg-gray-900 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
