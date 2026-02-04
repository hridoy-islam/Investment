import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
  ArrowLeft,
  TrendingUp,
  Wallet,
  PieChart,
  History,
  Users,
  DollarSign,
  Plus,
  Activity
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
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import axiosInstance from '@/lib/axios';
import { format } from 'date-fns';

// ==================== TYPES ====================

interface Investment {
  _id: string;
  title: string;
  image?: string;
  details: string;
  amountRequired: number;
  investmentAmount: number;
  saleAmount?: number;
  adminCost: number;
  currencyType: string;
  projectDuration: number;
  installmentNumber: number;
  status: 'active' | 'block';
  isCapitalRaise: boolean;
  createdAt: string;
  updatedAt: string;
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

// ==================== CONSTANTS ====================

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  saleDeclared: 'Sale Declared',
  grossProfit: 'Gross Profit',
  adminCostDeclared: 'Admin Cost',
  netProfit: 'Net Profit',
  profitDistributed: 'Profit Distributed',
  commissionCalculated: 'Agent Commission',
  investmentUpdated: 'Project Update',
  profitPayment: 'Payout',
  investment: 'Investment'
};

// ==================== HELPER FUNCTIONS ====================

const formatCurrency = (amount: number, currency: string = 'GBP'): string => {
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

const formatTransactionType = (type: string | undefined | null): string => {
  if (!type) return 'Transaction';

  return (
    TRANSACTION_TYPE_LABELS[type] ||
    type.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
  );
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

  // Form States
  const [selectedInvestor, setSelectedInvestor] = useState<SelectOption | null>(
    null
  );
  const [installmentAmount, setInstallmentAmount] = useState<string>('');
  const [raiseAmount, setRaiseAmount] = useState<string>('');
  const [saleAmount, setSaleAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==================== COMPUTED VALUES ====================

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
        label: `${p.investorId?.name || 'Unknown'} (${p.projectShare}% share)`
      }));
  }, [participants]);

  const totals = useMemo(() => {
    if (!Array.isArray(participants)) {
      return { paid: 0, due: 0 };
    }

    return participants.reduce(
      (acc, curr) => ({
        paid: acc.paid + (curr.totalPaid || 0),
        due: acc.due + (curr.totalDue || 0)
      }),
      { paid: 0, due: 0 }
    );
  }, [participants]);

  const fundingProgress = useMemo(() => {
    if (!investment?.amountRequired) return 0;
    return Math.min((totals.paid / investment.amountRequired) * 100, 100);
  }, [totals.paid, investment?.amountRequired]);

  // ==================== DATA FETCHING ====================

  const fetchInvestment = useCallback(async () => {
    if (!id) return;

    try {
      setLoadingStates((prev) => ({ ...prev, investment: true }));
      const response = await axiosInstance.get(`/investments/${id}`);
      setInvestment(response.data?.data || null);
    } catch (error: any) {
      console.error('Failed to fetch investment:', error);
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

      // Ensure we always get an array
      const data = response.data?.data;
      const participantsArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.result)
          ? data.result
          : [];

      setParticipants(participantsArray);
    } catch (error: any) {
      console.error('Failed to fetch participants:', error);
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
        `/transactions?investmentId=${id}`
      );

      // Process transactions to extract logs
      const allTx = response.data?.data?.result || [];
      const allLogs: TransactionLog[] = [];

      allTx.forEach((tx: any) => {
        // Payment logs
        if (tx.paymentLog && Array.isArray(tx.paymentLog)) {
          tx.paymentLog.forEach((log: any) => {
            allLogs.push({
              ...log,
              investorName: tx.investorId?.name,
              transactionType: 'profitPayment'
            });
          });
        }

        // Regular logs
        if (tx.logs && Array.isArray(tx.logs)) {
          tx.logs.forEach((log: any) => {
            allLogs.push({
              ...log,
              investorName: tx.investorId?.name
            });
          });
        }
      });

      // Sort by date (newest first)
      allLogs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setTransactions(allLogs);
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      toast({
        title: 'Error Loading History',
        description:
          error.response?.data?.message || 'Failed to load transaction history',
        variant: 'destructive'
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, transactions: false }));
    }
  }, [id, toast]);

  useEffect(() => {
    if (id) {
      fetchInvestment();
      fetchParticipants();
      fetchTransactions();
    }
  }, [id, fetchInvestment, fetchParticipants, fetchTransactions]);

  // ==================== HANDLERS ====================

  const handleAddInstallment = async () => {
    if (!selectedInvestor || !installmentAmount) {
      toast({
        title: 'Missing Information',
        description: 'Please select an investor and enter an amount',
        variant: 'destructive'
      });
      return;
    }

    const amount = parseFloat(installmentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid positive amount',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // await axiosInstance.post(`/transactions`, {
      //   participantId: selectedInvestor.value,
      //   investmentId: id,
      //   amount: amount
      // });

      toast({
        title: 'Success',
        description: 'Installment recorded successfully'
      });

      // Reset form and close modal
      setIsInstallmentOpen(false);
      setInstallmentAmount('');
      setSelectedInvestor(null);

      // Refresh data
      await Promise.all([fetchParticipants(), fetchTransactions()]);
    } catch (error: any) {
      console.error('Failed to add installment:', error);
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to record installment',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRaiseAmount = async () => {
    if (!raiseAmount) {
      toast({
        title: 'Missing Amount',
        description: 'Please enter the raise amount',
        variant: 'destructive'
      });
      return;
    }

    const amount = parseFloat(raiseAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid positive amount',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.patch(`/investments/${id}`, {
        investmentAmount: (investment?.investmentAmount || 0) + amount,
        isCapitalRaise: true
      });

      toast({
        title: 'Success',
        description: 'Capital raised successfully'
      });

      setIsRaiseOpen(false);
      setRaiseAmount('');
      await fetchInvestment();
    } catch (error: any) {
      console.error('Failed to raise capital:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to raise capital',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordSale = async () => {
    if (!saleAmount) {
      toast({
        title: 'Missing Amount',
        description: 'Please enter the sale/CMV amount',
        variant: 'destructive'
      });
      return;
    }

    const amount = parseFloat(saleAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid positive amount',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.patch(`/investments/${id}`, {
        saleAmount: amount
      });

      toast({
        title: 'Success',
        description: 'Sale/CMV recorded successfully'
      });

      setIsSaleOpen(false);
      setSaleAmount('');
      await fetchInvestment();
    } catch (error: any) {
      console.error('Failed to record sale:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to record sale',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== LOADING STATE ====================

  if (isLoading && !investment) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-4">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[200px]" />
          </div>
          <div className="space-y-6 lg:col-span-5">
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-[400px]" />
          </div>
          <div className="space-y-6 lg:col-span-3">
            <Skeleton className="h-[700px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!investment) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-lg text-slate-600">Project not found</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== RENDER ====================

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900">
            {investment.title}
          </h1>
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
          <Dialog open={isInstallmentOpen} onOpenChange={setIsInstallmentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Installment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Installment Payment</DialogTitle>
                <DialogDescription>
                  Record an installment payment from an investor
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="investor-select">Select Investor</Label>
                  <Select
                    id="investor-select"
                    value={selectedInvestor}
                    onChange={setSelectedInvestor}
                    options={investorOptions}
                    placeholder="Choose an investor..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installment-amount">
                    Amount ({currencyCode})
                  </Label>
                  <Input
                    id="installment-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={installmentAmount}
                    onChange={(e) => setInstallmentAmount(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsInstallmentOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddInstallment}
                  disabled={
                    isSubmitting || !selectedInvestor || !installmentAmount
                  }
                >
                  {isSubmitting ? 'Recording...' : 'Record Payment'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isRaiseOpen} onOpenChange={setIsRaiseOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                Raise Amount
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Raise Capital</DialogTitle>
                <DialogDescription>
                  Increase the project value with additional capital
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="raise-amount">
                    Additional Amount ({currencyCode})
                  </Label>
                  <Input
                    id="raise-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={raiseAmount}
                    onChange={(e) => setRaiseAmount(e.target.value)}
                  />
                  <p className="text-sm text-slate-500">
                    Current:{' '}
                    {formatCurrency(investment.investmentAmount, currencyCode)}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsRaiseOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRaiseAmount}
                  disabled={isSubmitting || !raiseAmount}
                >
                  {isSubmitting ? 'Raising...' : 'Raise Capital'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isSaleOpen} onOpenChange={setIsSaleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Activity className="mr-2 h-4 w-4" />
                Sale/CMV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Sale/CMV</DialogTitle>
                <DialogDescription>
                  Record the sale amount or current market value
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="sale-amount">
                    Sale/CMV Amount ({currencyCode})
                  </Label>
                  <Input
                    id="sale-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={saleAmount}
                    onChange={(e) => setSaleAmount(e.target.value)}
                  />
                  {investment.saleAmount && (
                    <p className="text-sm text-slate-500">
                      Current:{' '}
                      {formatCurrency(investment.saleAmount, currencyCode)}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsSaleOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRecordSale}
                  disabled={isSubmitting || !saleAmount}
                >
                  {isSubmitting ? 'Recording...' : 'Record Sale'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* === COLUMN 1: Investors List === */}
        <div className="space-y-6 lg:col-span-4">
          {/* Investors Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Investors
              </CardTitle>
              <CardDescription>
                {participants.length} active investor
                {participants.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[350px]">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-center">Share</TableHead>
                      <TableHead className="text-center">
                        Agent Commision.
                      </TableHead>
                      <TableHead className="text-center">
                        Installment.
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingStates.participants ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : participants.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-slate-500"
                        >
                          No investors yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      participants.map((p) => (
                        <TableRow key={p._id}>
                          <TableCell className="font-medium">
                            {p.investorId?.name || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-center">
                            {p.projectShare}%
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {p.agentCommissionRate}%
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">
                              {p.installmentNumber}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Profit Distribution (Demo) */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChart className="h-5 w-5 text-emerald-500" />
                Profit Distribution
              </CardTitle>
              <CardDescription>
                Estimated returns based on current performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Investor Pool (80%)
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(
                      investment.investmentAmount * 0.8,
                      currencyCode
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Platform Fee (5%)
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(
                      investment.investmentAmount * 0.05,
                      currencyCode
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    Admin Commission
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(
                      investment.investmentAmount * 0.15,
                      currencyCode
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* === COLUMN 2: Financial Overview === */}
        <div className="space-y-6 lg:col-span-5">
          {/* Financial Stats */}
          <Card className="border-none bg-slate-900 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Wallet className="h-5 w-5" />
                  Financial Overview
                </h3>
                <Badge variant="secondary" className="bg-white/10 text-white">
                  {currencyCode}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Project Amount
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(investment.investmentAmount, currencyCode)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Required Amount
                  </p>
                  <p className="text-2xl font-bold text-blue-300">
                    {formatCurrency(investment.amountRequired, currencyCode)}
                  </p>
                </div>

                <div className="col-span-2 my-2 h-px bg-white/10" />

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Total Investment Amount paid
                  </p>
                  <p className="text-xl font-bold text-rose-400">
                    {formatCurrency(totals.paid, currencyCode)}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Total Due
                  </p>
                  <p className="text-xl font-bold text-amber-400">
                    {formatCurrency(totals.due, currencyCode)}
                  </p>
                </div>

                {investment.saleAmount && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase text-slate-400">
                        Admin Fee
                      </p>
                      <p className="text-xl font-bold text-amber-400">
                        {investment.adminCost}%
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Installment Status Table */}
          <Card>
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-5 w-5 text-emerald-500" />
                Installment Status
              </CardTitle>
              <CardDescription>Payment breakdown by investor</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[350px]">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow>
                      <TableHead>Investor</TableHead>
                      <TableHead className="text-center">Installment</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Due</TableHead>
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
                        <TableCell
                          colSpan={4}
                          className="text-center text-slate-500"
                        >
                          No payment data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      participants.map((p) => (
                        <TableRow key={p._id}>
                          <TableCell className="font-medium text-slate-700">
                            {p.investorId?.name || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                              {p.installmentNumber}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium text-emerald-600">
                            {formatCurrency(p.totalPaid, currencyCode)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-rose-600">
                            {formatCurrency(p.totalDue, currencyCode)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* === COLUMN 3: Transaction History === */}
        <div className="space-y-6 lg:col-span-3">
          <Card className="h-[80vh] border-l-4 border-l-theme">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-theme" />
                Transaction History
              </CardTitle>
              <CardDescription>Recent activity and logs</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[70vh] p-4">
                {loadingStates.transactions ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="mb-3 h-12 w-12 text-slate-300" />
                    <p className="text-sm text-slate-500">
                      No transaction history yet
                    </p>
                  </div>
                ) : (
                  <div className="relative ml-2 space-y-6 border-l-2 border-slate-200 pl-6">
                    {transactions.slice(0, 50).map((log, index) => {
                      const detailsText =
                        log.transactionType === 'profitPayment'
                          ? log.note || 'Profit payment'
                          : log.transactionType === 'investment'
                            ? log.metadata?.investorName
                              ? `Investment from ${log.metadata.investorName}`
                              : 'Initial Investment'
                            : log.message || log.note || '-';

                      const amount = ``;
                      log.paidAmount || log.metadata?.amount || 0;

                      return (
                        <div key={log._id || index} className="group relative">
                          {/* Timeline dot */}
                          <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-white bg-theme ring-2 ring-purple-100" />

                          <div className="space-y-2">
                            {/* Date */}
                            <p className="text-xs font-medium text-slate-500">
                              {formatDate(log.createdAt)}
                            </p>

                            {/* Transaction Card */}
                            <div className="rounded-lg border border-slate-300 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
                              <div className="mb-2 flex items-start justify-between gap-2">
                                {amount > 0 && (
                                  <span className="text-sm font-bold text-emerald-600">
                                    +{formatCurrency(amount, currencyCode)}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-600">
                                {detailsText}
                              </p>

                              {log.investorName && (
                                <p className="mt-1 text-xs font-medium text-slate-700">
                                  {log.investorName}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
