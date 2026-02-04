import { useEffect, useState } from 'react';
import { Plus, MoveLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
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
import { InvestmentCard } from './components/investment-card';

interface Investment {
  _id: string;
  title: string;
  image: string | null;
  details: string;
  amountRequired: number;
  investmentAmount: number;
  adminCost: number;
  status: 'active' | 'block';
  currencyType: string;
  saleAmount?: number;
  isCapitalRaise: boolean;
  documents: any[];
  createdAt: string;
  updatedAt: string;
}

export default function InvestmentPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedAmountRequired, setSelectedAmountRequired] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('GBP');

  // Raise Capital Dialog States
  const [raiseCapitalDialogOpen, setRaiseCapitalDialogOpen] = useState(false);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);
  const [raiseAmount, setRaiseAmount] = useState<number | ''>('');
  const [raiseLoading, setRaiseLoading] = useState(false);
  const [selectedCurrentAmountRequired, setSelectedCurrentAmountRequired] = useState<number>(0);
  const [selectedProjectName, setSelectedProjectName] = useState('');

  // Set Sale Price Dialog States
  const [salePriceDialogOpen, setSalePriceDialogOpen] = useState(false);
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [salePriceLoading, setSalePriceLoading] = useState(false);

  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);

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
      return `${currencyCode} ${amount.toFixed(2)}`;
    }
  };

  const fetchData = async (page: number, limit: number, searchTerm = '') => {
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

  const handleStatusChange = async (id: string, status: boolean) => {
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

  const handleEdit = (id: Investment) => {
    navigate(`/dashboard/investments/edit/${id}`);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/dashboard/investments/${id}`);
  };

  const handleViewInvestors = (id: string) => {
    navigate(`/dashboard/investments/participant/${id}`);
  };

  const handleViewProjectLog = (id: string) => {
    navigate(`/dashboard/investments/transactions/${id}`);
  };

  // Raise Capital Handlers
  const handleRaiseCapitalClick = (investment: Investment) => {
    setSelectedInvestmentId(investment._id);
    setRaiseAmount('');
    setSelectedCurrentAmountRequired(investment.amountRequired || 0);
    setSelectedProjectName(investment.title || '');
    setSelectedCurrency(investment.currencyType || 'GBP');
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
        toast({
          title: 'Success',
          description: 'Capital requirement updated successfully.',
          className: 'bg-theme border-none text-white'
        });
      
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
  const handleSetSalePriceClick = (investment: Investment) => {
    setSelectedInvestmentId(investment._id);
    setSalePrice('');
    setSelectedAmountRequired(investment.amountRequired || 0);
    setSelectedProjectName(investment.title || '');
    setSelectedCurrency(investment.currencyType || 'GBP');
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

 

  return (
    <div className="space-y-6 rounded-lg bg-white p-5 shadow-sm">
      {/* Header + Search (old style, adapted to new UI) */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* Left: Title + Search */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <h1 className="text-3xl font-bold text-gray-900">Project List</h1>

              {/* search bar layout */}
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                  placeholder="Search by project name"
                  className="h-8 w-full sm:w-[320px] lg:w-[400px]"
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

            
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-3 lg:pt-1">
          <Button
            className="border-none bg-theme text-white hover:bg-theme/90"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            className="border-none bg-theme text-white hover:bg-theme/90"
            size="sm"
            onClick={() => navigate('/dashboard/investments/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="r">
        {initialLoading ? (
          <div className="flex justify-center py-12">
            <BlinkingDots size="large" color="bg-theme" />
          </div>
        ) : investments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-6">
              <Plus className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No projects found
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              Get started by creating your first investment project
            </p>
            <Button
              className="border-none bg-theme text-white hover:bg-theme/90"
              onClick={() => navigate('/dashboard/investments/new')}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {investments.map((investment) => (
                <InvestmentCard
                  key={investment._id}
                  investment={investment}
                  onViewDetails={handleViewDetails}
                  formatCurrency={formatCurrency}
                  onEdit={handleEdit}
                />
              ))}
            </div>

            {investments.length > 40 && (
              <div className="mt-6 ">
                <DataTablePagination
                  pageSize={entriesPerPage}
                  setPageSize={setEntriesPerPage}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
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
            <div className="text-sm font-medium text-gray-700">
              Date:{' '}
              <span className="font-semibold">
                {moment().format('DD MMM YYYY')}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-700">
              Project:{' '}
              <span className="font-semibold">{selectedProjectName}</span>
            </div>

            <div className="text-sm font-medium text-gray-700">
              Current Investment Amount:{' '}
              <span className="font-semibold">
                {formatCurrency(
                  selectedCurrentAmountRequired,
                  selectedCurrency
                )}
              </span>
            </div>

            {typeof raiseAmount === 'number' && raiseAmount > 0 && (
              <div className="text-sm font-medium text-gray-700">
                Updated Investment Amount:{' '}
                <span className="font-semibold">
                  {formatCurrency(updatedAmountRequired, selectedCurrency)}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amountRequired">
                Raise Amount ({selectedCurrency})
              </Label>
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
                {moment().format('DD MMM YYYY')}
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