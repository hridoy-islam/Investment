import { useEffect, useState } from 'react';
import { Plus, Pen, MoveLeft, Eye, Building2, ArrowLeftRightIcon } from 'lucide-react';
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

export default function InvestorInvestmentPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  const fetchInvestments = async () => {
    try {
      const res = await axiosInstance.get('/investments');
      setInvestments(res.data.data.result);
    } catch (err) {
      console.error('Error fetching investments:', err);
    }
  };

  const fetchProjects = async (page: number, limit: number, searchTerm = '') => {
    try {
      if (initialLoading) setInitialLoading(true);
      const res = await axiosInstance.get(`/investment-participants?investorId=${user._id}`, {
        params: { page, limit, ...(searchTerm ? { searchTerm } : {}) }
      });
      setProjects(res.data.data.result);
      setTotalPages(res.data.data.meta.totalPage);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
    fetchProjects(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  const calculateRate = (amount: number, investmentId: string) => {
    const investment = investments.find(inv => inv._id === investmentId);
    if (!investment || !investment.amountRequired) return 'N/A';
    const rate = (100 * amount) / investment.amountRequired;
    return `${rate.toFixed(2)}%`;
  };

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
                <TableHead>Profit Rate</TableHead>
                <TableHead className="text-center">Account History</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map(project => (
                <TableRow key={project?._id}>
                  <TableCell>{project?.investmentId?.title}</TableCell>
                  <TableCell>£{project?.amount}</TableCell>
                  <TableCell>{calculateRate(project?.amount, project?.investmentId?._id)}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="icon"
                      onClick={() =>
                        navigate(`/dashboard/investor/projects/account-history/${project._id}`)
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
                        navigate(`/dashboard/investments/view/${project.investmentId?._id}`)
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
