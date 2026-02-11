import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  ArrowLeft,
  TrendingUp,
  Wallet,
  History,
  Users,
  Plus,
  Activity,
  Pen,
  PlusCircle,
  Pencil,
  Filter,
  X,
  Banknote
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import axiosInstance from '@/lib/axios';
import { format } from 'date-fns';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import moment from 'moment';

// ==================== TYPES ====================

interface Investment {
  _id: string;
  title: string;
  image?: string;
  details: string;
  projectAmount: number;
  amountRequired: number;
  saleAmount?: number;
  paidAmount: number;
  adminCost: number;
  currencyType: string;
  projectDuration: number;
  installmentNumber: number;
  status: 'active' | 'block';
  isCapitalRaise: boolean;
  createdAt: string;
  updatedAt: string;
  totalAmountPaid: number;
}

interface Participant {
  _id: string;
  investorId: {
    _id: string;
    name: string;
    email: string;
  };
  investmentId: string;
  amount: number;
  totalDue: number;
  totalPaid: number;
  agentCommissionRate: number;
  projectShare: number;
  installmentNumber: number;
  installmentPaidAmount: number;
  status: 'active' | 'block';
}

interface TransactionLog {
  _id: string;
  transactionType: string;
  message?: string;
  note?: string;
  paidAmount?: number;
  createdAt: string;
  metadata?: {
    amount?: number;
    investorName?: string;
  };
  investorName?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

// ==================== HELPER FUNCTIONS ====================

const formatCurrency = (
  amount: number | undefined | null,
  currency: string = 'GBP'
): string => {
  if (amount === undefined || amount === null) return '—';
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    return `${currency}${Number(amount).toFixed(2)}`;
  }
};

const formatDate = (date: string): string => {
  try {
    return format(new Date(date), 'd MMM yyyy');
  } catch {
    return 'Invalid date';
  }
};

// ==================== MAIN COMPONENT ====================

export default function InvestmentManagementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ==================== STATE ====================

  const [investment, setInvestment] = useState<Investment | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [transactions, setTransactions] = useState<TransactionLog[]>([]);

  const [loadingStates, setLoadingStates] = useState({
    investment: true,
    participants: true,
    transactions: true
  });

  // Modal States
  const [isInstallmentOpen, setIsInstallmentOpen] = useState(false);
  const [isRaiseOpen, setIsRaiseOpen] = useState(false);
  const [isSaleOpen, setIsSaleOpen] = useState(false);
  const [isAddInvestorOpen, setIsAddInvestorOpen] = useState(false);
  const [isAddCapitalOpen, setIsAddCapitalOpen] = useState(false);
  const [isEditCommissionOpen, setIsEditCommissionOpen] = useState(false);

  // Form Data States
  const [availableInvestors, setAvailableInvestors] = useState<SelectOption[]>(
    []
  );
  const [newInvestorAmount, setNewInvestorAmount] = useState<string>('');
  const [newInvestorCommission, setNewInvestorCommission] =
    useState<string>('');
  const [selectedNewInvestor, setSelectedNewInvestor] =
    useState<SelectOption | null>(null);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState<string>('');
  const [selectedInvestor, setSelectedInvestor] = useState<SelectOption | null>(
    null
  );
  const [selectedCapitalInvestor, setSelectedCapitalInvestor] =
    useState<SelectOption | null>(null);
  const [capitalAmount, setCapitalAmount] = useState<string>('');
  const [installmentAmount, setInstallmentAmount] = useState<string>('');
  const [raiseAmount, setRaiseAmount] = useState<string>('');
  const [saleAmount, setSaleAmount] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null
  ]);
  const [historyStartDate, historyEndDate] = dateRange;
  const [selectedHistoryInvestor, setSelectedHistoryInvestor] =
    useState<SelectOption | null>(null);

  const isLoading = useMemo(
    () => Object.values(loadingStates).some((state) => state),
    [loadingStates]
  );

  const currencyCode = investment?.currencyType || 'GBP';

  const investorOptions = useMemo(() => {
    if (!Array.isArray(participants)) return [];
    return participants
      .filter((p) => p.status === 'active')
      .map((p) => ({
        value: p._id,
        label: `${p.investorId?.name || 'Unknown'}`
      }));
  }, [participants]);

  // --- FILTERED TRANSACTIONS ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const tDate = new Date(t.createdAt);

      // Date Range Filter
      if (historyStartDate && tDate < historyStartDate) return false;
      if (historyEndDate) {
        // Set end date to end of day (23:59:59) for inclusive filtering
        const end = new Date(historyEndDate);
        end.setHours(23, 59, 59, 999);
        if (tDate > end) return false;
      }

      // Investor Filter
      if (selectedHistoryInvestor) {
        if (t.investorName !== selectedHistoryInvestor.label) return false;
      }

      return true;
    });
  }, [transactions, historyStartDate, historyEndDate, selectedHistoryInvestor]);

  const latestDistribution = useMemo(() => {
    if (!transactions.length || !participants.length) return null;

    const netProfitLog = transactions.find((t) => {
      const message = t.message || t.note || '';
      return (
        t.transactionType === 'netProfit' ||
        message.includes('Net Profit Allocated') ||
        message.includes('Net Profit for')
      );
    });

    if (!netProfitLog) return null;

    const netProfitDate = new Date(netProfitLog.createdAt);
    const totalNetProfit =
      netProfitLog.metadata?.amount || netProfitLog.paidAmount || 0;

    const distributionLogs = transactions.filter((t) => {
      const message = t.message || t.note || '';
      const hasDistributionMessage = message.includes('Profit for');
      const isDistributionType = t.transactionType === 'profitDistributed';

      if (!hasDistributionMessage && !isDistributionType) return false;

      const logDate = new Date(t.createdAt);
      const timeDiff = Math.abs(logDate.getTime() - netProfitDate.getTime());
      return timeDiff < 60000;
    });

    const payoutMap = new Map();

    distributionLogs.forEach((log) => {
      const investorName = log.investorName || log.metadata?.investorName;
      if (investorName) {
        const amount = log.metadata?.amount || log.paidAmount || 0;
        if (!payoutMap.has(investorName) || amount > 0) {
          payoutMap.set(investorName, { ...log, amount: amount });
        }
      }
    });

    return {
      totalNetProfit: totalNetProfit,
      date: netProfitLog.createdAt,
      payouts: payoutMap
    };
  }, [transactions, participants]);

  // --- SALE CALCULATIONS FOR MODAL ---
  const saleCalculations = useMemo(() => {
    if (!investment) return null;

    const saleVal = parseFloat(saleAmount) || 0;
    const projectAmount = investment.projectAmount || 0;
    
    // Correct Calculation: Sale - Project Amount
    const grossProfit = saleVal - projectAmount;
    
    // Admin Fee on Gross Profit
    const adminFee = grossProfit > 0 ? grossProfit * (investment.adminCost / 100) : 0;
    
    const netProfit = grossProfit - adminFee;

    return {
      projectAmount,
      grossProfit,
      adminFee,
      netProfit
    };
  }, [saleAmount, investment]);

  // --- EXISTING SALE HISTORY (If sold) ---
  const existingSaleStats = useMemo(() => {
    if (!investment?.saleAmount) return null;

    const saleVal = investment.saleAmount;
    const projectAmount = investment.projectAmount || 0;
    const grossProfit = saleVal - projectAmount;
    const adminFee = grossProfit > 0 ? grossProfit * (investment.adminCost / 100) : 0;
    const netProfit = grossProfit - adminFee;

    return {
      saleAmount: saleVal,
      projectAmount,
      grossProfit,
      adminFee,
      netProfit
    };
  }, [investment]);

  // Reset state when Sale modal opens/closes
  useEffect(() => {
    if (!isSaleOpen) {
      setSaleAmount('');
    }
  }, [isSaleOpen]);

  // ==================== FETCH FUNCTIONS ====================

  const fetchInvestment = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingStates((prev) => ({ ...prev, investment: true }));
      const response = await axiosInstance.get(`/investments/${id}`);
      setInvestment(response.data?.data || null);
    } catch (error: any) {
      toast({
        title: 'Error Loading Project',
        description:
          error.response?.data?.message || 'Failed to load project details',
        variant: 'destructive'
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, investment: false }));
    }
  }, [id, toast]);

  const fetchParticipants = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingStates((prev) => ({ ...prev, participants: true }));
      const response = await axiosInstance.get(
        `/investment-participants?investmentId=${id}`
      );
      const data = response.data?.data;
      const participantsArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.result)
          ? data.result
          : [];
      setParticipants(participantsArray);
    } catch (error: any) {
      toast({
        title: 'Error Loading Investors',
        description:
          error.response?.data?.message || 'Failed to load investor data',
        variant: 'destructive'
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, participants: false }));
    }
  }, [id, toast]);

  const fetchTransactions = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingStates((prev) => ({ ...prev, transactions: true }));
      const response = await axiosInstance.get(
        `/transactions?investmentId=${id}&limit=all`
      );
      const allTx = response.data?.data?.result || [];
      const allLogs: TransactionLog[] = [];

      allTx.forEach((tx: any) => {
        if (tx.paymentLog && Array.isArray(tx.paymentLog)) {
          tx.paymentLog.forEach((log: any) => {
            allLogs.push({
              ...log,
              investorName: tx.investorId?.name,
              transactionType: 'profitPayment'
            });
          });
        }
        if (tx.logs && Array.isArray(tx.logs)) {
          tx.logs.forEach((log: any) => {
            allLogs.push({
              ...log,
              investorName: tx.investorId?.name
            });
          });
        }
      });

      allLogs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTransactions(allLogs);
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, transactions: false }));
    }
  }, [id]);

  const fetchAvailableInvestors = async () => {
    try {
      const res = await axiosInstance.get('/users?role=investor');
      const addedInvestorIds = participants.map((p) => p.investorId?._id);

      const options = res.data.data.result
        .filter((inv: any) => !addedInvestorIds.includes(inv._id))
        .map((inv: any) => ({
          value: inv._id,
          label: `${inv.name} (${inv.email})`
        }));
      setAvailableInvestors(options);
    } catch (error) {
      console.error('Error fetching investors:', error);
    }
  };

  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchInvestment(),
      fetchParticipants(),
      fetchTransactions()
    ]);
  }, [fetchInvestment, fetchParticipants, fetchTransactions]);

  useEffect(() => {
    if (id) {
      fetchAllData();
    }
  }, [id, fetchAllData]);

  // ==================== HANDLERS ====================

  const handleOpenAddInvestor = () => {
    setIsAddInvestorOpen(true);
    fetchAvailableInvestors();
  };

  const handleAddInvestor = async () => {
    if (!selectedNewInvestor) return;
    setIsSubmitting(true);
    try {
      await axiosInstance.post('/investment-participants', {
        investorId: selectedNewInvestor.value,
        investmentId: id,
        agentCommissionRate: Number(newInvestorCommission),
        amount: Number(newInvestorAmount)
      });
      toast({ title: 'Investor Added Successfully' });
      setIsAddInvestorOpen(false);
      setNewInvestorAmount('');
      setNewInvestorCommission('');
      setSelectedNewInvestor(null);
      await fetchAllData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to add investor',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCapital = async () => {
    if (!selectedCapitalInvestor || !capitalAmount) return;
    const amountToAdd = parseFloat(capitalAmount);
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      await axiosInstance.patch(
        `/investment-participants/${selectedCapitalInvestor.value}`,
        {
          amount: amountToAdd
        }
      );
      toast({
        title: 'Capital Added Successfully',
        className: 'bg-theme text-white'
      });
      setIsAddCapitalOpen(false);
      setSelectedCapitalInvestor(null);
      setCapitalAmount('');
      await fetchAllData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add capital',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditCommission = (participant: Participant) => {
    setSelectedParticipant(participant);
    setNewCommissionRate(participant.agentCommissionRate?.toString() || '0');
    setIsEditCommissionOpen(true);
  };

  const handleUpdateCommission = async () => {
    if (!selectedParticipant) return;
    setIsSubmitting(true);
    try {
      await axiosInstance.patch(
        `/investment-participants/${selectedParticipant._id}`,
        {
          agentCommissionRate: Number(newCommissionRate)
        }
      );
      toast({
        title: 'Commission Rate Updated',
        className: 'bg-theme text-white'
      });
      setIsEditCommissionOpen(false);
      setSelectedParticipant(null);
      await fetchAllData();
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || 'Error',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddInstallment = async () => {
    if (!selectedInvestor || !installmentAmount) return;
    setIsSubmitting(true);
    try {
      await axiosInstance.post(`/investments/${id}/installment`, {
        participantId: selectedInvestor.value,
        investmentId: id,
        amount: parseFloat(installmentAmount)
      });
      toast({ title: 'Success', description: 'Installment recorded' });
      setIsInstallmentOpen(false);
      setInstallmentAmount('');
      setSelectedInvestor(null);
      await fetchAllData();
    } catch (error: any) {
      toast({ title: error?.response?.data?.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRaiseAmount = async () => {
    if (!raiseAmount) return;
    setIsSubmitting(true);
    try {
      const newTotal = parseFloat(raiseAmount);
      await axiosInstance.patch(`/investments/${id}`, {
        projectAmount: newTotal,
        isCapitalRaise: true
      });
      toast({ title: 'Success', description: 'Capital raised successfully' });
      setIsRaiseOpen(false);
      setRaiseAmount('');
      await fetchAllData();
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || 'Error',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordSale = async () => {
    if (!saleAmount) return;

    setIsSubmitting(true);
    try {
      await axiosInstance.patch(`/investments/${id}`, {
        saleAmount: parseFloat(saleAmount),
        deductOutstanding: false // removed functionality, default to false
      });
      toast({ title: 'Success', description: 'Sale recorded successfully' });
      setIsSaleOpen(false);
      await fetchAllData();
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || 'Error',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== RENDER ====================

  if (isLoading && !investment) {
    return (
      <div className="container mx-auto p-6">
        <BlinkingDots size="large" color="bg-theme" />
      </div>
    );
  }

  if (!investment) return <div className="p-6">Project not found</div>;

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold ">{investment.title}</h1>
          <Badge
            variant={investment.status === 'active' ? 'default' : 'destructive'}
          >
            {investment.status}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {/* Add Investor Button */}
          <Button size="sm" variant="outline" onClick={handleOpenAddInvestor}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Investor
          </Button>

          {/* Add Capital Button */}
          <Dialog open={isAddCapitalOpen} onOpenChange={setIsAddCapitalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Wallet className="mr-2 h-4 w-4" />
                Raise Investor Capital
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Raise Investor Capital</DialogTitle>
                <DialogDescription>
                  Raise investment amount for an investor
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Investor</Label>
                  <Select
                    value={selectedCapitalInvestor}
                    onChange={setSelectedCapitalInvestor}
                    options={investorOptions}
                    placeholder="Choose an investor..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount ({currencyCode})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={capitalAmount}
                    onChange={(e) => setCapitalAmount(e.target.value)}
                    placeholder="Enter amount to add"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddCapitalOpen(false);
                    setCapitalAmount('');
                    setSelectedCapitalInvestor(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCapital}
                  disabled={
                    isSubmitting || !selectedCapitalInvestor || !capitalAmount
                  }
                >
                  Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Installment Button */}
          {/* <Dialog open={isInstallmentOpen} onOpenChange={setIsInstallmentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Installment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Installment Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Investor</Label>
                  <Select
                    value={selectedInvestor}
                    onChange={setSelectedInvestor}
                    options={investorOptions}
                    placeholder="Choose an investor..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount ({currencyCode})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={installmentAmount}
                    onChange={(e) => setInstallmentAmount(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsInstallmentOpen(false);
                    setInstallmentAmount('');
                    setSelectedInvestor(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddInstallment}
                  disabled={isSubmitting || !selectedInvestor}
                >
                  Record Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog> */}

          {/* Raise Capital Dialog */}
          <Dialog open={isRaiseOpen} onOpenChange={setIsRaiseOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                Raise Project Amount
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Raise Capital</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-4">
                  <div className="text-sm font-medium text-gray-700">
                    Date:{' '}
                    <span className="font-semibold">
                      {moment().format('DD MMM YYYY')}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    Project:{' '}
                    <span className="font-semibold">{investment.title}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    Current Project Amount:{' '}
                    <span className="font-semibold">
                      {formatCurrency(investment.projectAmount, currencyCode)}
                    </span>
                  </div>
                  {raiseAmount && parseFloat(raiseAmount) > 0 && (
                    <div className="text-sm font-medium text-gray-700">
                      Updated Project Amount:{' '}
                      <span className="font-semibold">
                        {formatCurrency(
                          investment.projectAmount + parseFloat(raiseAmount),
                          currencyCode
                        )}
                      </span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="amountRequired">
                      Raise Amount ({currencyCode})
                    </Label>
                    <Input
                      id="amountRequired"
                      type="number"
                      step="any"
                      min="0"
                      value={raiseAmount}
                      onChange={(e) => setRaiseAmount(e.target.value)}
                      placeholder="Enter raise amount"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRaiseOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleRaiseAmount}
                  disabled={isSubmitting || !raiseAmount}
                >
                  Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Sale/CMV Dialog */}
          <Dialog open={isSaleOpen} onOpenChange={setIsSaleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Activity className="mr-2 h-4 w-4" />
                Sale/CMV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Sale Price ({currencyCode})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={saleAmount}
                    onChange={(e) => setSaleAmount(e.target.value)}
                  />
                </div>

                {/* Calculation Summary */}
                {saleAmount && saleCalculations && (
                    <div className="mt-4 rounded-md border border-gray-200 bg-slate-50 p-3 text-xs">
                      <div className="flex justify-between py-1">
                        <span className="">Sale Amount:</span>
                        <span className="font-semibold">
                          {formatCurrency(parseFloat(saleAmount), currencyCode)}
                        </span>
                      </div>
                    
                     
                      <div className="flex justify-between py-1 pt-2">
                        <span className="">Project Amount:</span>
                        <span className="text-rose-600">
                          -{' '}
                          {formatCurrency(
                            saleCalculations.projectAmount,
                            currencyCode
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 font-bold">
                        <span>Gross Profit:</span>
                        <span
                          className={
                            saleCalculations.grossProfit >= 0
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }
                        >
                          {formatCurrency(
                            saleCalculations.grossProfit,
                            currencyCode
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="">
                          Admin Fee ({investment.adminCost}%):
                        </span>
                        <span>
                          {formatCurrency(
                            saleCalculations.adminFee,
                            currencyCode
                          )}
                        </span>
                      </div>
                      <div className="mt-1 flex justify-between border-t border-gray-200 py-1 pt-2 font-bold">
                        <span>Net Distributable:</span>
                        <span className="text-emerald-600">
                          {formatCurrency(
                            saleCalculations.netProfit,
                            currencyCode
                          )}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSaleOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleRecordSale}
                  disabled={isSubmitting || !saleAmount}
                >
                  Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant={'outline'}
            size="sm"
            onClick={() => navigate(`/dashboard/investments/edit/${id}`)}
          >
            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Project
          </Button>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-12">
        {/* === COLUMN 1: Investors List === */}
        <div className="space-y-4 lg:col-span-4">
          <Card className=" flex flex-col">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-theme" />
                Investors
              </CardTitle>
            </CardHeader>
            <CardContent className=" p-4 pt-0">
              <Table>
                <TableHeader className="">
                  <TableRow className="text-xs">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold text-center">Invested Amount</TableHead>
                    <TableHead className="text-center font-semibold">
                      Share
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Agent Commission
                    </TableHead>
                    {/* <TableHead className="text-center font-semibold">
                      Installment Amount
                    </TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingStates.participants ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ) : participants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-4 text-center">
                        No investors yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    participants.map((p) => (
                      <TableRow key={p._id} className="text-xs">
                        <TableCell>
                          <div className='flex gap-3'>

                          <div className="font-medium">
                            {p.investorId?.name || 'Unknown'}
                          </div>
                         
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {formatCurrency(p.amount, currencyCode)}
                        </TableCell>
                        <TableCell className="text-center">
                          {p.projectShare?.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span>{p.agentCommissionRate}%</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 "
                              onClick={() => handleOpenEditCommission(p)}
                            >
                              <Pen className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        {/* <TableCell className="text-center">
                          {investment.installmentNumber > 0
                            ? formatCurrency(
                                (((investment.projectAmount ?? 0) -
                                  (investment.totalAmountPaid ?? 0)) *
                                  (p.projectShare / 100)) /
                                  investment.installmentNumber,
                                currencyCode
                              )
                            : '—'}
                        </TableCell> */}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader className=" p-4 pb-0">
              <CardTitle className="flex items-center gap-2 text-base">
                Installment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <>
                <Table>
                  <TableHeader className="">
                    <TableRow>
                      <TableHead className=" text-xs font-semibold">
                        Investor
                      </TableHead>
                      <TableHead className="text-center text-xs font-semibold">
                        Installment Paid
                      </TableHead>
                      <TableHead className="text-right text-xs font-semibold">
                        Total Paid
                      </TableHead>
                      <TableHead className="text-right text-xs font-semibold">
                        Total Due
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingStates.participants ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="mx-auto h-6 w-6" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="ml-auto h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="ml-auto h-4 w-20" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : participants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center ">
                          No payment data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      participants.map((p) => (
                        <TableRow key={p._id}>
                          <TableCell className="text-xs ">
                            {p.investorId?.name || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-center text-xs font-semibold ">
                            {p.installmentNumber}
                          </TableCell>
                          <TableCell className="text-right text-xs font-semibold text-emerald-600">
                            {formatCurrency(
                              p.installmentPaidAmount,
                              currencyCode
                            )}
                          </TableCell>
                          <TableCell className="text-right text-xs font-semibold text-rose-600">
                            {formatCurrency(
                              ((investment.projectAmount ?? 0) -
                                (investment.totalAmountPaid ?? 0)) *
                                (p.projectShare / 100),
                              currencyCode
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </>
            </CardContent>
          </Card> */}
        </div>

        {/* === COLUMN 2: Financial Overview (3 Columns) === */}
        <div className="space-y-4 lg:col-span-5">
         

          <Card className="border-none bg-slate-900 text-white shadow-lg">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Wallet className="h-4 w-4 text-theme" />
                  Financials
                </h3>
                <Badge
                  variant="outline"
                  className="border-white/20 text-xs text-white"
                >
                  {currencyCode}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-x-2 gap-y-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wider text-white">
                    Project Amount
                  </p>
                  <p className="text-base font-bold">
                    {formatCurrency(investment.projectAmount, currencyCode)}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wider text-white">
                    Invested Amount
                  </p>
                  <p className="text-base font-bold text-blue-300">
                    {formatCurrency(investment.totalAmountPaid, currencyCode)}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wider text-white">
                    Total Due
                  </p>
                  <p className="text-sm font-semibold text-amber-400">
                    {formatCurrency(
                      investment.projectAmount - investment.totalAmountPaid,
                      currencyCode
                    )}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wider text-white">
                    Admin Fee
                  </p>
                  <p className="text-sm font-semibold text-amber-400">
                    {investment.adminCost}%
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wider text-white">
                    Duration
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {investment.projectDuration} Years
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wider text-white">
                    Installments
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {investment.installmentNumber}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit Distribution */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex flex-row items-center justify-between text-sm">
                <span>Latest Profit Distribution</span>
                {latestDistribution && (
                  <CardDescription className="text-xs font-semibold text-black">
                    Last sale: {formatDate(latestDistribution.date)}
                  </CardDescription>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0">
              {!latestDistribution ? (
                <div className="py-4 text-center text-xs">
                  No profit distribution yet
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs">
                        <TableHead className="h-8">Investor</TableHead>
                        <TableHead className="h-8 text-right">
                          Total Paid
                        </TableHead>
                        <TableHead className="h-8 text-right">Profit</TableHead>
                        <TableHead className="h-8 text-right">Total</TableHead>
                        <TableHead className="h-8 text-right">Gain</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participants.map((p) => {
                        const profitData = latestDistribution.payouts.get(
                          p.investorId?.name
                        );
                        const profitAmount = profitData ? profitData.amount : 0;
                        const profitGainPercent =
                          p.amount > 0 ? (profitAmount / p.amount) * 100 : 0;
                        return (
                          <TableRow key={p._id} className="text-xs">
                            <TableCell className="p-2 font-medium">
                              {p.investorId?.name}
                            </TableCell>
                            {/* <TableCell className="p-2 text-right">
                              {formatCurrency(p.amount, currencyCode)}
                            </TableCell> */}
                            <TableCell className="p-2 text-right">
                              {formatCurrency(p.amount, currencyCode)}
                            </TableCell>
                            <TableCell className="p-2 text-right font-bold text-emerald-600">
                              {formatCurrency(profitAmount, currencyCode)}
                            </TableCell>
                            <TableCell className="p-2 text-right font-bold text-orange-600">
                              {formatCurrency(
                                p.amount + profitAmount,
                                currencyCode
                              )}
                            </TableCell>
                            <TableCell className="p-2 text-right font-bold text-blue-600">
                              {profitGainPercent.toFixed(2)}%
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* === COLUMN 3: Transaction History with Filter === */}
        <div className="lg:col-span-3">
          <Card className="flex h-[calc(100vh-22vh)] flex-col border-l-4 border-l-theme">
            <CardHeader className="p-3 pb-2">
              <div className="mb-2 flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="h-4 w-4 text-theme" />
                  History
                </CardTitle>

                {/* Clear Filter Button */}
                {(historyStartDate ||
                  historyEndDate ||
                  selectedHistoryInvestor) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDateRange([null, null]);
                      setSelectedHistoryInvestor(null);
                    }}
                  >
                    <X className="mr-1 h-3 w-3" /> Clear
                  </Button>
                )}
              </div>

              {/* Filters Container */}
              <div className="grid grid-cols-2 items-end gap-1">
                {/* Date Picker Range */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold ">
                    Date Range
                  </Label>
                  <DatePicker
                    selectsRange
                    startDate={historyStartDate}
                    endDate={historyEndDate}
                    onChange={(update) => setDateRange(update)}
                    placeholderText="Start & end date"
                    className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-theme/20"
                  />
                </div>

                {/* Investor Select */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold ">Investor</Label>
                  <Select
                    options={investorOptions}
                    value={selectedHistoryInvestor}
                    onChange={setSelectedHistoryInvestor}
                    placeholder="All Investors"
                    isClearable
                    className="text-[11px]"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '28px',
                        height: '28px',
                        borderRadius: '0.375rem',
                        borderColor: '#d1d5db',
                        fontSize: '11px',
                        boxShadow: 'none'
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        padding: '0 6px'
                      }),
                      indicatorsContainer: (base) => ({
                        ...base,
                        height: '28px'
                      }),
                      dropdownIndicator: (base) => ({
                        ...base,
                        padding: '2px 6px'
                      }),
                      clearIndicator: (base) => ({
                        ...base,
                        padding: '2px 6px'
                      })
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-2">
                {loadingStates.transactions ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="flex h-full  flex-col items-center justify-center py-8 text-center text-sm">
                    <Filter className="mb-2 h-6 w-6 text-gray-300" />
                    <p>No transactions found</p>
                  </div>
                ) : (
                  <div className="relative ml-1 space-y-1 border-l-2 border-slate-200 pb-2 pl-5">
                    {filteredTransactions.map((log, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full border-2 border-white bg-theme" />
                        <div className="space-y-1">
                          <p className="text-[10px]  font-medium">
                            {formatDate(log.createdAt)}
                          </p>
                          <div className="rounded border border-gray-200 bg-white p-2 text-xs shadow-sm">
                            <p className="">{log.message || log.note || '-'}</p>
                            <div className="mb-1 flex justify-end font-semibold">
                              {log.paidAmount || log.metadata?.amount ? (
                                <span className="text-emerald-600">
                                  {formatCurrency(
                                    log.paidAmount || log.metadata?.amount,
                                    currencyCode
                                  )}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- EXTRA DIALOGS --- */}

      <Dialog open={isAddInvestorOpen} onOpenChange={setIsAddInvestorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Investor</DialogTitle>
            <DialogDescription>
              Add a new investor to this project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Select Investor</Label>
              <Select
                options={availableInvestors}
                value={selectedNewInvestor}
                onChange={setSelectedNewInvestor}
                placeholder="Search investor..."
              />
            </div>
            {selectedNewInvestor && (
              <>
                <div className="space-y-2">
                  <Label>Amount ({currencyCode})</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newInvestorAmount}
                    onChange={(e) => setNewInvestorAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Agent Commission (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newInvestorCommission}
                    onChange={(e) => setNewInvestorCommission(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddInvestorOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-theme text-white hover:bg-theme/90"
              onClick={handleAddInvestor}
              disabled={isSubmitting || !selectedNewInvestor}
            >
              {isSubmitting ? 'Adding...' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditCommissionOpen}
        onOpenChange={setIsEditCommissionOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Commission Rate</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label>Agent Commission Rate (%)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={newCommissionRate}
              onChange={(e) => setNewCommissionRate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditCommissionOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-theme text-white hover:bg-theme/90"
              onClick={handleUpdateCommission}
              disabled={isSubmitting}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}