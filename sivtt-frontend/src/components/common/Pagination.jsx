import { Button } from '@components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null

  const { page, totalPages, total } = pagination

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages)
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Mostrando{' '}
        <span className="font-medium text-foreground tabular-nums">
          {((page - 1) * pagination.limit) + 1}
        </span>
        {' '}-{' '}
        <span className="font-medium text-foreground tabular-nums">
          {Math.min(page * pagination.limit, total)}
        </span>
        {' '}de{' '}
        <span className="font-medium text-foreground tabular-nums">
          {total}
        </span>
        {' '}resultados
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((pageNum, idx) => (
            pageNum === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-1.5 text-muted-foreground select-none"
              >
                ···
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "w-9 tabular-nums",
                  pageNum !== page && "text-muted-foreground hover:text-foreground"
                )}
              >
                {pageNum}
              </Button>
            )
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="gap-1"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}