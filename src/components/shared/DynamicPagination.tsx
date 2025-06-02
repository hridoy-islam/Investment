// // DynamicPagination.js
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious
// } from '@/components/ui/pagination';

// const DynamicPagination = ({ currentPage, totalPages, onPageChange }) => {
//   const handlePrevious = (e) => {
//     e.preventDefault();
//     if (currentPage > 1) {
//       onPageChange(currentPage - 1);
//     }
//   };

//   const handleNext = (e) => {
//     e.preventDefault();
//     if (currentPage < totalPages) {
//       onPageChange(currentPage + 1);
//     }
//   };

//   return (
//     <Pagination className="mt-6">
//       <PaginationContent>
//         <PaginationItem>
//           <PaginationPrevious href="#" onClick={handlePrevious} />
//         </PaginationItem>
//         {Array.from({ length: totalPages }, (_, index) => (
//           <PaginationItem key={index + 1}>
//             <PaginationLink
//               href="#"
//               isActive={currentPage === index + 1}
//               onClick={(e) => {
//                 e.preventDefault();
//                 onPageChange(index + 1);
//               }}
//             >
//               {index + 1}
//             </PaginationLink>
//           </PaginationItem>
//         ))}
//         <PaginationItem>
//           <PaginationNext href="#" onClick={handleNext} />
//         </PaginationItem>
//       </PaginationContent>
//     </Pagination>
//   );
// };

// export default DynamicPagination;
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';

const DynamicPagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = (e) => {
    if (currentPage === 1) {
      e.preventDefault(); // Prevent action when disabled
      return;
    }
    onPageChange(currentPage - 1);
  };

  const handleNext = (e) => {
    if (currentPage === totalPages) {
      e.preventDefault(); // Prevent action when disabled
      return;
    }
    onPageChange(currentPage + 1);
  };

  return (
    <Pagination className="flex justify-center">
      <PaginationContent className="flex items-center gap-2">
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={handlePrevious}
            className={`rounded-full p-2 ${
              currentPage === 1
                ? 'cursor-not-allowed text-gray-400'
                : 'text-black'
            }`}
          >
            <span>&lt;</span>
          </PaginationPrevious>
        </PaginationItem>

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={handleNext}
            className={`rounded-full p-2 ${
              currentPage === totalPages
                ? 'cursor-not-allowed text-gray-400'
                : 'text-black'
            }`}
          >
            <span>&gt;</span>
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default DynamicPagination;
