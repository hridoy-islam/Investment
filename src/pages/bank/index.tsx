import { useEffect, useState } from 'react';
import { Plus, Pen, MoveLeft, Eye } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Badge } from '@/components/ui/badge';

export default function BankPage() {
  const [banks, setBanks] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useSelector((state: any) => state.auth);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const navigate = useNavigate();

  const fetchData = async (page: number, limit: number, searchTerm = '') => {
    try {
      setInitialLoading(true);
      const response = await axiosInstance.get(`/banks`, {
        params: {
          userId: user._id,
          page,
          limit,
          ...(searchTerm ? { searchTerm } : {})
        }
      });
      setBanks(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching banks:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSearch = () => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  };

  const handleStatusChange = async (id: string, status: boolean) => {
    try {
      const updatedStatus = status ? 'active' : 'block';
      await axiosInstance.patch(`/banks/${id}`, { status: updatedStatus });
      toast({
        title: 'Status updated successfully',
        className: 'bg-theme border-none text-white'
      });
      fetchData(currentPage, entriesPerPage);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-2xl font-semibold">Bank Account List</h1>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by bank name or account"
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
            onClick={() => navigate('/dashboard/banks/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Account
          </Button>
        </div>
      </div>

      <div className="rounded-md bg-white p-4 shadow-2xl">
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-theme" />
          </div>
        ) : banks.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No bank accounts found.
          </div>
        ) : (
     <Table>
  <TableHeader>
    <TableRow>
      <TableHead>Bank Name</TableHead>
      <TableHead>Beneficiary Name</TableHead>
      <TableHead>Account No.</TableHead>
      <TableHead>Currency</TableHead>
      <TableHead>Bank Country</TableHead>
      <TableHead>Beneficiary Country</TableHead>
      <TableHead>Beneficiary Address</TableHead>
      <TableHead>City</TableHead>
      <TableHead>SWIFT/BIC</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-end">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {banks.map((bank) => (
      <TableRow key={bank._id}>
        <TableCell>{bank.beneficiaryBankName}</TableCell>
        <TableCell>
          {bank.beneficiaryFirstName} {bank.beneficiaryLastName}
        </TableCell>
        <TableCell>{bank.accountNumber}</TableCell>
        <TableCell>{bank.currency || '-'}</TableCell>
        <TableCell>{bank.bankCountry || '-'}</TableCell>
        <TableCell>{bank.BeneficiaryCountry || '-'}</TableCell>
        <TableCell>{bank.beneficiaryAddress || '-'}</TableCell>
        <TableCell>{bank.beneficiaryCity || '-'}</TableCell>
        <TableCell>{bank.swift || '-'}</TableCell>
       <TableCell className="text-center">
  <div className="flex items-center justify-center gap-2 flex-col">
    <Switch
      checked={bank.status === 'active'}
      onCheckedChange={(checked) => handleStatusChange(bank._id, checked)}
      className="mx-auto"
    />
    
    <Badge
      className={`text-sm rounded-full font-semibold ${bank.status === 'active' ? 'bg-green-200 text-green-600' : 'bg-gray-200 text-gray-600'}`}
    >
      {bank.status === 'active' ? 'Active' : 'Inactive'}
    </Badge>
  </div>
</TableCell>

        <TableCell className="flex justify-end gap-2">
          <Button
            variant="ghost"
            className="bg-theme text-white hover:bg-theme/90"
            size="icon"
            onClick={() => navigate(`/dashboard/banks/view/${bank._id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="bg-theme text-white hover:bg-theme/90"
            size="icon"
            onClick={() => navigate(`/dashboard/banks/edit/${bank._id}`)}
          >
            <Pen className="h-4 w-4" />
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
