import React from 'react';
import { clsx } from 'clsx';

export type MonogramStyle = 'black' | 'prestige' | 'graphite' | 'emerald';

export interface MonogramConfig {
  id: MonogramStyle;
  name: string;
  desc: string;
  previewClass: string;
}

export const MONOGRAM_STYLES: MonogramConfig[] = [
  {
    id: 'black',
    name: 'Preto Acetinado',
    desc: 'Preto profundo com tipografia em dourado nobre',
    previewClass: 'bg-stone-950 text-amber-400 border border-amber-500/50 shadow-md shadow-amber-950/50',
  },
  {
    id: 'prestige',
    name: 'Dourado Vertus',
    desc: 'Ouro metálico com tipografia escura de alto contraste',
    previewClass: 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-stone-950 border border-amber-300 shadow-md shadow-amber-500/25',
  },
  {
    id: 'graphite',
    name: 'Grafite Minimalista',
    desc: 'Titânio escuro editorial com acabamento sutil',
    previewClass: 'bg-stone-900 text-stone-200 border border-stone-700/80 shadow-sm',
  },
  {
    id: 'emerald',
    name: 'Esmeralda Nobre',
    desc: 'Tom esmeralda cirúrgico com toques dourados',
    previewClass: 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950/50',
  },
];

export function getInitials(name: string): string {
  if (!name) return 'V';
  const clean = name.replace(/^(Dra?\.|Dr\.)\s*/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'V';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  styleType?: MonogramStyle;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 'md',
  styleType = 'black',
  className
}) => {
  const initials = getInitials(name);
  const selectedConfig = MONOGRAM_STYLES.find(s => s.id === styleType) || MONOGRAM_STYLES[0];

  const sizeClasses = {
    sm: 'w-7 h-7 text-[11px] rounded-lg',
    md: 'w-8 h-8 text-xs rounded-xl',
    lg: 'w-14 h-14 text-lg rounded-2xl',
    xl: 'w-24 h-24 sm:w-28 sm:h-28 text-3xl sm:text-4xl rounded-3xl',
  }[size];

  return (
    <div
      className={clsx(
        "flex items-center justify-center font-serif font-bold select-none shrink-0 tracking-wider transition-all duration-200",
        sizeClasses,
        selectedConfig.previewClass,
        className
      )}
    >
      <span>{initials}</span>
    </div>
  );
};
