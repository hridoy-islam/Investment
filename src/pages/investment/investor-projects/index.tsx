import { useEffect, useState } from 'react';
import {
  MoveLeft,
  Eye,
  ArrowLeftRightIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Badge } from '@/components/ui/badge';

// Helper to format currency dynamically
const formatCurrency = (amount: number | undefined | null, currencyCode: string = 'GBP') => {
  if (amount === undefined || amount === null) return '—';
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is invalid or not standard
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
};

export default function InvestorInvestmentPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  const fetchProjects = async (
    page: number,
    limit: number,
    searchTerm = ''
  ) => {
    try {
      if (initialLoading) setInitialLoading(true);
      const res = await axiosInstance.get(
        `/investment-participants?investorId=${user._id}`,
        {
          params: { page, limit, ...(searchTerm ? { searchTerm } : {}) }
        }
      );
      // Based on the provided response structure: data.data.result
      setProjects(res.data.data.result);
      setTotalPages(res.data.data.meta.totalPage);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Project List</h1>
        <Button
          className="border-none bg-theme text-white hover:bg-theme/90"
          size="sm"
          onClick={() => navigate('/dashboard')}
        >
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="rounded-md bg-white p-4 shadow-2xl">
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-theme" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No records found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Investment Amount</TableHead>
                <TableHead>Share</TableHead>
                <TableHead className="text-center">Account History</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project?._id}>
                  <TableCell className="flex items-center gap-2">
                    {project?.investmentId?.title || 'Untitled Project'}{' '}
                    <Badge
                      className={`rounded-full px-2 py-1 text-xs font-semibold 
                        ${project.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                        ${project.status === 'block' ? 'bg-red-100 text-red-700' : ''}
                      `}
                    >
                      {project.status === 'active' ? 'Active' : 'Close'}
                    </Badge>
                  </TableCell>
                  
                  {/* Updated Investment Amount Column */}
                  <TableCell>
                    {formatCurrency(
                      project?.amount, 
                      project?.investmentId?.currencyType || 'GBP'
                    )}
                  </TableCell>

                  {/* Updated Share Column */}
                  <TableCell>
                    {project?.projectShare ? `${project.projectShare}%` : '0%'}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Button
                      size="icon"
                      onClick={() =>
                        navigate(
                          `/dashboard/investor/projects/account-history/${project._id}`
                        )
                      }
                      className="bg-indigo-500 text-white hover:bg-indigo-500/90"
                    >
                      <ArrowLeftRightIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="flex flex-row items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      className="border-none bg-theme text-white hover:bg-theme/90"
                      size="icon"
                      onClick={() =>
                        navigate(
                          `/dashboard/investments/view/${project.investmentId?._id}`
                        )
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <DataTablePagination
          pageSize={entriesPerPage}
          setPageSize={setEntriesPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}