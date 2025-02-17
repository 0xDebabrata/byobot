interface PaginationProps {
  slug: string;
  pageNumber: number;
  lastPage: number;
}

const Pagination: React.FC<PaginationProps> = ({ slug, pageNumber, lastPage }) => {
  return (
    <div className="flex mt-12 items-center justify-center text-sm text-slate-300">
      <a
        className={`border rounded-md px-2 py-1 w-[90px] text-center ${pageNumber ? '' : 'pointer-events-none opacity-30'}`}
        href={pageNumber ? `${slug}?page=${pageNumber}` : '#'}
      >
        ← Prev
      </a>
      <div className="px-6 font-bold">
        {pageNumber + 1} / {lastPage}
      </div>
      <a
        className={`border rounded-md px-2 py-1 w-[90px] text-center ${
          pageNumber >= lastPage - 1 ? 'pointer-events-none opacity-30' : ''
        }`}
        href={pageNumber >= lastPage - 1 ? '#' : `${slug}?page=${pageNumber + 2}`}
      >
        Next →
      </a>
    </div>
  );
};

export default Pagination;
