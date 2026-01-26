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
      <div className="text-sm text-gray-500">
        Mostrando <span className="font-medium text-gray-900">{((page - 1) * pagination.limit) + 1}</span> - <span className="font-medium text-gray-900">{Math.min(page * pagination.limit, total)}</span> de <span className="font-medium text-gray-900">{total}</span> resultados
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((pageNum, idx) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
            ) : (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "w-9",
                  pageNum === page && "bg-blue-600 hover:bg-blue-700"
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
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}