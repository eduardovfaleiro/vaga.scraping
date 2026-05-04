'use client';

import { Button } from './Button';

interface PaginationProps {
  page: number;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function Pagination({ page, hasNext, onPrev, onNext }: PaginationProps) {
  return (
    <div className="flex items-center gap-4 justify-center mt-8">
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={page <= 1}
        className="!py-1.5"
      >
        Anterior
      </Button>
      <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Página {page}</span>
      <Button
        onClick={onNext}
        disabled={!hasNext}
        className="!py-1.5"
      >
        Próxima
      </Button>
    </div>
  );
}
