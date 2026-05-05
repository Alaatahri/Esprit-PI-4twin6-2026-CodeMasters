'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Wallet, Star, 
  Clock, Package, MapPin, ArrowUpRight,
  ChevronRight, Calendar, CheckCircle2
} from 'lucide-react';

export default function DriverStatsPage() {
  const stats = [
    { label: 'Revenus Totaux', value: '2,840 TND', icon: Wallet, color: 'text-amber-500', trend: '+12.5%' },
    { label: 'Courses Terminées', value: '142', icon: Package, color: 'text-emerald-500', trend: '+8.2%' },
    { label: 'Note Moyenne', value: '4.9', icon: Star, color: 'text-yellow-400', trend: '+0.1' },
    { label: 'Distance Parcourue', value: '840 km', icon: MapPin, color: 'text-blue-500', trend: '+15.4%' },
  ];

  const recentActivity = [
    { id: 1, title: 'Livraison réussie', date: 'Aujourd\'hui, 14:20', amount: '+45.00 TND', type: 'success' },
    { id: 2, title: 'Bonus performance', date: 'Hier, 18:30', amount: '+10.00 TND', type: 'bonus' },
    { id: 3, title: 'Livraison réussie', date: 'Hier, 11:15', amount: '+45.00 TND', type: 'success' },
    { id: 4, title: 'Livraison réussie', date: '28 Avr, 16:45', amount: '+35.00 TND', type: 'success' },
  ];

  return (
    <div className="p-6 space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-amber-500" />
            Mes Statistiques
          </h1>
          <p className="text-muted-foreground dark:text-gray-400 text-sm mt-1">Analysez vos performances et suivez vos gains en temps réel.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/10 text-xs font-bold text-foreground dark:text-white hover:bg-black/5 dark:bg-white/10 transition-all">
          <Calendar className="w-4 h-4" />
          Derniers 30 jours
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-16 h-16" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <p className="text-2xl font-black text-foreground dark:text-white">{stat.value}</p>
            <p className="text-xs text-foreground dark:text-gray-500 uppercase font-bold tracking-widest mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Earnings Chart Placeholder */}
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/5 border border-border dark:border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-foreground dark:text-white">Évolution des gains</h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-[10px] text-foreground dark:text-gray-500 font-bold uppercase">TND / Jour</span>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {[40, 65, 45, 90, 55, 80, 100, 75, 45, 60, 85, 95].map((val, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${val}%` }}
                className="flex-1 bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-lg relative group"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-amber-500 text-gray-900 text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {val * 1.5} TND
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-4 px-4 text-[10px] text-gray-600 font-black">
            <span>AVR 15</span>
            <span>AVR 20</span>
            <span>AVR 25</span>
            <span>AUJOURD'HUI</span>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/5 border border-border dark:border-white/10">
            <h3 className="text-lg font-black text-foreground dark:text-white mb-6">Activité récente</h3>
            <div className="space-y-6">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.type === 'bonus' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {item.type === 'bonus' ? <Star className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground dark:text-white group-hover:text-amber-400 transition-colors">{item.title}</p>
                      <p className="text-[10px] text-foreground dark:text-gray-500">{item.date}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-foreground dark:text-white">{item.amount}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border dark:border-white/10 text-xs font-bold text-foreground dark:text-white hover:bg-black/5 dark:bg-white/10 transition-all flex items-center justify-center gap-2">
              Voir tout l'historique
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-xs font-black text-amber-500 uppercase tracking-widest">Objectif hebdo</p>
            </div>
            <p className="text-sm text-muted-foreground dark:text-gray-400 leading-tight">Vous avez atteint <span className="text-foreground dark:text-white font-bold">85%</span> de votre objectif de gains pour cette semaine.</p>
            <div className="w-full h-2 bg-card dark:bg-gray-900 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-amber-500 w-[85%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
