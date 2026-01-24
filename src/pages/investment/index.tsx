import { useEffect, useState } from 'react';
import {
  Plus,
  MoveLeft,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

export default function InvestmentPage() {
  const [investments, setInvestments] = useState<any>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingInvestment, setEditingInvestment] = useState<any>();
  const [selectedAmountRequired, setSelectedAmountRequired] =
    useState<number>(0);
    
  // Currency State
  const [selectedCurrency, setSelectedCurrency] = useState<string>('GBP');

  // Raise Capital Dialog States
  const [raiseCapitalDialogOpen, setRaiseCapitalDialogOpen] = useState(false);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<
    string | null
  >(null);
  const [raiseAmount, setRaiseAmount] = useState<number | ''>('');
  const [raiseLoading, setRaiseLoading] = useState(false);
  const [selectedCurrentAmountRequired, setSelectedCurrentAmountRequired] =
    useState<number>(0);
  const [selectedProjectName, setSelectedProjectName] = useState('');

  // Set Sale Price Dialog States
  const [salePriceDialogOpen, setSalePriceDialogOpen] = useState(false);
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [salePriceLoading, setSalePriceLoading] = useState(false);

  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  const increment = () => setCount((prev) => prev + 1);

  // Helper to format currency dynamically
  const formatCurrency = (amount: number, currencyCode: string = 'GBP') => {
    try {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      // Fallback if currency code is invalid
      return `${currencyCode} ${amount.toFixed(2)}`;
    }
  };

  const fetchData = async (page, limit, searchTerm = '') => {
    try {
      setInitialLoading(true);
      const response = await axiosInstance.get(`/investments`, {
        params: {
          page,
          limit,
          ...(searchTerm ? { searchTerm } : {})
        }
      });
      setInvestments(response.data?.data?.result || []);
      setTotalPages(response.data?.data?.meta?.totalPage || 1);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage, count]);

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
      toast({
        title: 'Failed to update status.',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (data) => {
    setEditingInvestment(data);
    navigate(`/dashboard/investments/edit/${data._id}`);
  };

  // Raise Capital Handlers
  const handleRaiseCapitalClick = (investment) => {
    setSelectedInvestmentId(investment._id);
    setRaiseAmount('');
    setSelectedCurrentAmountRequired(investment.amountRequired || 0);
    setSelectedProjectName(investment.title || '');
    setSelectedCurrency(investment.currencyType || 'GBP'); // Set currency
    setRaiseCapitalDialogOpen(true);
  };

  const updatedAmountRequired =
    typeof raiseAmount === 'number' && raiseAmount >= 0
      ? selectedCurrentAmountRequired + raiseAmount
      : selectedCurrentAmountRequired;

  const handleRaiseCapitalSubmit = async () => {
    if (
      !selectedInvestmentId ||
      typeof raiseAmount !== 'number' ||
      raiseAmount <= 0
    )
      return;

    setRaiseLoading(true);
    try {
      const response = await axiosInstance.patch(
        `/investments/${selectedInvestmentId}`,
        {
          amountRequired: raiseAmount,
          isCapitalRaise: true
        }
      );
      increment();
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Capital requirement updated successfully.',
          className: 'bg-theme border-none text-white'
        });
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update capital requirement.',
        variant: 'destructive'
      });
    } finally {
      setRaiseCapitalDialogOpen(false);
      setRaiseAmount('');
      setRaiseLoading(false);
    }
  };

  // Set Sale Price Handlers
  const handleSetSalePriceClick = (investment) => {
    setSelectedInvestmentId(investment._id);
    setSalePrice('');
    setSelectedAmountRequired(investment.amountRequired || 0);
    setSelectedProjectName(investment.title || '');
    setSelectedCurrency(investment.currencyType || 'GBP'); // Set currency
    setSalePriceDialogOpen(true);
  };

  const grossProfit =
    typeof salePrice === 'number' ? salePrice - selectedAmountRequired : null;

  const handleSetSalePriceSubmit = async () => {
    if (
      !selectedInvestmentId ||
      typeof salePrice !== 'number' ||
      salePrice <= 0
    )
      return;

    setSalePriceLoading(true);
    try {
      const response = await axiosInstance.patch(
        `/investments/${selectedInvestmentId}`,
        {
          saleAmount: salePrice
        }
      );
      increment();
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Sale price updated successfully.',
          className: 'bg-theme border-none text-white'
        });
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update sale price.',
        variant: 'destructive'
      });
    } finally {
      setSalePriceDialogOpen(false);
      setSalePrice('');
      setSalePriceLoading(false);
    }
  };
  const calculateDueAmount = (inv) => {
    const required = inv.amountRequired || 0;
    const investment = inv.investmentAmount || 0;
    return investment - required;
  };
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
                <TableHead className="w-[30vw]">Project Name</TableHead>
                <TableHead>Investment Amount</TableHead>
                <TableHead>Admin Cost</TableHead>
                <TableHead>Due Amount</TableHead>
                <TableHead className="text-center">Sale/CMV</TableHead>
                <TableHead className="text-center">Raise Capital</TableHead>

                <TableHead className="text-center">Project Log</TableHead>
                <TableHead className="text-center">Investors</TableHead>
                <TableHead className="text-center">Detail</TableHead>
                <TableHead className="text-center">Edit</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((investment) => {
                const due = calculateDueAmount(investment);
                const currency = investment.currencyType || 'GBP';

                return (
                  <TableRow key={investment._id}>
                    <TableCell>{investment.title}</TableCell>
                    <TableCell>
                      {investment?.amountRequired
                        ? formatCurrency(investment.amountRequired, currency)
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {`${investment?.adminCost?.toFixed(2)}%` || '-'}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(due, currency)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        onClick={() => handleSetSalePriceClick(investment)}
                        className="bg-red-600 text-white hover:bg-red-600/90"
                      >
                        Sale/CMV
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        onClick={() => handleRaiseCapitalClick(investment)}
                        className="hover:bg-indigo/90 bg-emerald-600 text-white"
                      >
                        Raise Capital
                      </Button>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/dashboard/investments/transactions/${investment._id}`
                          )
                        }
                        className="hover:bg-indigo/90 bg-lime-600 text-white"
                      >
                        Project Log
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/dashboard/investments/participant/${investment._id}`
                          )
                        }
                        className="bg-sky-600 text-white hover:bg-sky-600/90"
                      >
                        Investors
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        className="border-none bg-rose-500 text-white hover:bg-rose-500/90"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/dashboard/investments/view/${investment._id}`
                          )
                        }
                      >
                        Details
                      </Button>
                    </TableCell>
                    <TableCell className="flex flex-row items-center justify-center gap-2 text-center">
                      <Button
                        variant="ghost"
                        className="border-none bg-theme text-white hover:bg-theme/90"
                        size="sm"
                        onClick={() => handleEdit(investment)}
                      >
                        Edit
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
                          {investment.status === 'active'
                            ? 'Active'
                            : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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

      {/* Raise Capital Dialog */}
      <Dialog
        open={raiseCapitalDialogOpen}
        onOpenChange={setRaiseCapitalDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise Capital</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Project Name */}
            <div className="text-sm font-medium text-gray-700">
              Date:{' '}
              <span className="font-semibold">
                <span>{moment().format('DD MMM YYYY')}</span>
              </span>
            </div>
            <div className="text-sm font-medium text-gray-700">
              Project:{' '}
              <span className="font-semibold">{selectedProjectName}</span>
            </div>

            {/* Current Investment Amount */}
            <div className="text-sm font-medium text-gray-700">
              Current Investment Amount:{' '}
              <span className="font-semibold">
                {formatCurrency(selectedCurrentAmountRequired, selectedCurrency)}
              </span>
            </div>

            {/* Only show updated amount if raiseAmount is valid */}
            {typeof raiseAmount === 'number' && raiseAmount > 0 && (
              <div className="text-sm font-medium text-gray-700">
                Updated Investment Amount:{' '}
                <span className="font-semibold">
                  {formatCurrency(updatedAmountRequired, selectedCurrency)}
                </span>
              </div>
            )}

            {/* Raise Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amountRequired">Raise Amount ({selectedCurrency})</Label>
              <Input
                id="amountRequired"
                type="number"
                step="any"
                min="0"
                value={raiseAmount}
                onChange={(e) =>
                  setRaiseAmount(
                    e.target.value ? parseFloat(e.target.value) : ''
                  )
                }
                placeholder="Enter raise amount"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRaiseCapitalDialogOpen(false)}
                disabled={raiseLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-theme text-white hover:bg-theme/90"
                onClick={handleRaiseCapitalSubmit}
                disabled={
                  raiseLoading ||
                  typeof raiseAmount !== 'number' ||
                  raiseAmount <= 0
                }
              >
                {raiseLoading ? 'Submitting...' : 'Submit'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Set Sale Price Dialog */}
      <Dialog open={salePriceDialogOpen} onOpenChange={setSalePriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete your sell</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700">
              Date:{' '}
              <span className="font-semibold">
                <span>{moment().format('DD MMM YYYY')}</span>
              </span>
            </div>
            <div className="text-sm font-medium text-gray-700">
              Project:{' '}
              <span className="font-semibold">{selectedProjectName}</span>
            </div>
            <div className="text-sm font-medium text-gray-700">
              Investment Amount:{' '}
              <span className="font-semibold">
                {formatCurrency(selectedAmountRequired, selectedCurrency)}
              </span>
            </div>

            {grossProfit !== null && (
              <div className="pb-4 font-medium text-gray-700">
                Gross Profit:{' '}
                <span className="font-semibold">
                  {formatCurrency(grossProfit, selectedCurrency)}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="salePrice">Sale Price ({selectedCurrency})</Label>
              <Input
                id="salePrice"
                type="number"
                step="any"
                min="0"
                value={salePrice}
                onChange={(e) =>
                  setSalePrice(e.target.value ? parseFloat(e.target.value) : '')
                }
                placeholder="Enter sale price"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSalePriceDialogOpen(false)}
                disabled={salePriceLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-theme text-white hover:bg-theme/90"
                onClick={handleSetSalePriceSubmit}
                disabled={
                  salePriceLoading ||
                  typeof salePrice !== 'number' ||
                  salePrice <= 0
                }
              >
                {salePriceLoading ? 'Submitting...' : 'Submit'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}