import { useEffect, useState } from 'react';
import { Plus, Pen, MoveLeft, Eye, Users, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { investmentDialog } from './components/investment-dialog';
import { useNavigate } from 'react-router-dom';
import { InvestmentDialog } from './components/invesment-dialog';
import { Badge } from '@/components/ui/badge';

export default function InvestmentPage() {
  const [investments, setInvestments] = useState<any>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<any>();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchData = async (page, entriesPerPage, searchTerm = '') => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/investments`, {
        params: {
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {})
        }
      });
      setInvestments(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  const handleSubmit = async (data) => {
    try {
      let response;
      if (editingInvestment) {
        response = await axiosInstance.patch(
          `/investments/${editingInvestment?._id}`,
          data
        );
      } else {
        response = await axiosInstance.post(`/investments`, data);
      }

      if (response.data && response.data.success === true) {
        toast({
          title: response.data.message || 'Investments created successfully',
          className: 'bg-theme border-none text-white'
        });
      } else if (response.data && response.data.success === false) {
        toast({
          title: response.data.message || 'Operation failed',
          className: 'bg-red-500 border-none text-white'
        });
      } else {
        toast({
          title: 'Unexpected response. Please try again.',
          className: 'bg-red-500 border-none text-white'
        });
      }

      // Refresh data
      fetchData(currentPage, entriesPerPage);
      setEditingInvestment(undefined); // Reset editing state
    } catch (error) {
      toast({
        title: 'An error occurred. Please try again.',
        className: 'bg-red-500 border-none text-white'
      });
    }
  };

  const handleSearch = () => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  };

  const handleStatusChange = async (id, status) => {
    try {
      const updatedStatus = status ? 'active' : 'block';
      await axiosInstance.patch(`/investments/${id}`, {
        status: updatedStatus
      });
      toast({
        title: 'Record updated successfully',
        className: 'bg-theme border-none text-white'
      });
      fetchData(currentPage, entriesPerPage);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEdit = (data) => {
    setEditingInvestment(data);
    setDialogOpen(true);
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage); // Refresh data
  }, [currentPage, entriesPerPage]);

  const navigate = useNavigate();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-2xl font-semibold">Project List</h1>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by project name"
              className="h-8 max-w-[400px]"
            />
            <Button
              onClick={handleSearch}
              size="sm"
              className="min-w-[100px] border-none bg-theme text-white hover:bg-theme/90"
            >
              Search
            </Button>
          </div>
        </div>
        <div className="flex flex-row items-center gap-4">
          <Button
            className="border-none bg-theme text-white hover:bg-theme/90"
            size={'sm'}
            onClick={() => navigate('/dashboard')}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            className="border-none bg-theme text-white hover:bg-theme/90"
            size={'sm'}
            onClick={() => navigate('/dashboard/investments/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <div className="rounded-md bg-white p-4 shadow-2xl">
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-theme" />
          </div>
        ) : investments.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No records found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60vw]">Project Name</TableHead>
                <TableHead className=" text-center">Transations</TableHead>
                <TableHead className=" text-center">Investors</TableHead>
                <TableHead className=" text-center">Detail</TableHead>
                <TableHead className=" text-center">Edit</TableHead>
                <TableHead className=" text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((investment) => (
                <TableRow key={investment._id}>
                  <TableCell>{investment.title}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="icon"
                      onClick={() =>
                        navigate(
                          `/dashboard/investments/transactions/${investment._id}`
                        )
                      }
                      className="hover:bg-indigo/90 bg-indigo-600 text-white"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </Button>
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      size="icon"
                      onClick={() =>
                        navigate(
                          `/dashboard/investments/participant/${investment._id}`
                        )
                      }
                      className="bg-emerald-500 text-white hover:bg-emerald-500/90"
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      className="border-none bg-rose-500 text-white hover:bg-rose-500/90"
                      size="icon"
                      onClick={() =>
                        navigate(
                          `/dashboard/investments/view/${investment._id}`
                        )
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="flex flex-row items-center justify-center gap-2 text-center">
                    <Button
                      variant="ghost"
                      className="border-none bg-theme text-white hover:bg-theme/90"
                      size="icon"
                      onClick={() =>
                        navigate(
                          `/dashboard/investments/edit/${investment._id}`
                        )
                      }
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-row items-center gap-1">
                      <Switch
                        checked={investment.status === 'active'}
                        onCheckedChange={(checked) =>
                          handleStatusChange(investment._id, checked)
                        }
                        className="mx-auto"
                      />
                      <Badge
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          investment.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        {investment.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
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

      <InvestmentDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingInvestment(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={editingInvestment}
      />
    </div>
  );
}
