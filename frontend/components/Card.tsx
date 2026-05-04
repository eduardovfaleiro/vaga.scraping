'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-surface rounded-lg shadow-card border border-border-subtle p-4 ${className}`}>
      {children}
    </div>
  );
}
