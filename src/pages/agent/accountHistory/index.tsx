import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Button } from '@/components/ui/button';
import { MoveLeft, PoundSterlingIcon, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSelector } from 'react-redux';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';

export default function AgentTransactionHistoryPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [agentTransactions, setAgentTransactions] = useState<any[]>([]);
  const [agentCommission, setAgentCommission] = useState<any>(null);
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [note, setNote] = useState('');
  const [loadingTxId, setLoadingTxId] = useState<string | null>(null);
  const [loadingLogTxId, setLoadingLogTxId] = useState<string | null>(null); // New state for log loading
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  const [investorInfo, setInvestorInfo] = useState<any>(null);

  const generateYears = () => {
    const years = [];
    const startYear = currentYear - 50;
    for (let i = 0; i < 100; i++) {
      years.push(startYear + i);
    }
    return years;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const investorRes = await axiosInstance.get(`/users/${id}`);
      setInvestorInfo(investorRes.data?.data);

      const agentTxRes = await axiosInstance.get('/agent-transactions', {
        params: { investorId: id }
      });
      const agentTxData = agentTxRes.data?.data?.result || [];
      setAgentTransactions(agentTxData);

      if (agentTxData.length > 0) {
        const agentId = agentTxData[0].agentId;
        const [commissionRes, userRes] = await Promise.all([
          axiosInstance.get(`/agent-commissions`, {
            params: { agentId, investorId: id }
          }),
          axiosInstance.get(`/users/${agentId}`)
        ]);
        setAgentCommission(commissionRes.data?.data?.result[0]);
        setAgentInfo(userRes.data?.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Failed to load agent transaction data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const commissionDue = selectedTx?.commissionDue || 0;
  const isOverPayment = parseFloat(paidAmount || '0') > commissionDue;

  // New function to fetch single transaction data
  const fetchSingleTransaction = async (txId: string) => {
    try {
      const response = await axiosInstance.get(`/agent-transactions/${txId}`);
      const updatedTx = response.data?.data;

      if (updatedTx) {
        setAgentTransactions((prevTxs) =>
          prevTxs.map((tx) => (tx._id === txId ? updatedTx : tx))
        );
      }
    } catch (error) {
      console.error('Error fetching single transaction:', error);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id, currentYear]);

  const handlePaymentConfirm = async () => {
    if (!selectedTx || !paidAmount) return;
    const paidAmtNum = parseFloat(paidAmount);
    if (paidAmtNum <= 0) return;

    setLoadingTxId(selectedTx._id);

    // Optimistically update UI first
    setAgentTransactions((prevTxs) =>
      prevTxs.map((tx) => {
        if (tx._id === selectedTx._id) {
          const newCommissionPaid = (tx.commissionPaid || 0) + paidAmtNum;
          const newCommissionDue = Math.max(
            0,
            (tx.commissionDue || 0) - paidAmtNum
          );

          let updatedStatus: 'due' | 'partial' | 'paid' = 'due';
          if (newCommissionDue === 0) {
            updatedStatus = 'paid';
          } else if (newCommissionPaid > 0) {
            updatedStatus = 'partial';
          }

          // Add optimistic payment log entry with loading flag
          const optimisticPaymentLogEntry = {
            _id: 'temp-loading', // Temporary ID to identify loading state
            transactionType: 'commissionPayment',
            dueAmount: tx.commissionDue,
            paidAmount: paidAmtNum,
            status: updatedStatus,
            note: note || '',
            createdAt: new Date().toISOString(),
            isLoading: true // Flag to show loading state
          };

          return {
            ...tx,
            commissionPaid: newCommissionPaid,
            commissionDue: newCommissionDue,
            status: updatedStatus,
            paymentLog: [...(tx.paymentLog || []), optimisticPaymentLogEntry]
          };
        }
        return tx;
      })
    );

    setAgentCommission((prev) => ({
      ...prev,
      totalCommissionPaid: (prev?.totalCommissionPaid || 0) + paidAmtNum,
      totalCommissionDue: Math.max(
        0,
        (prev?.totalCommissionDue || 0) - paidAmtNum
      )
    }));

    setIsDialogOpen(false);
    setPaidAmount('');
    setNote('');

    try {
      await axiosInstance.patch(`/agent-transactions/${selectedTx._id}`, {
        paidAmount: paidAmtNum,
        note
      });

      toast({ title: 'Payment completed successfully' });

      // Show loading state for log and fetch updated transaction
      setLoadingLogTxId(selectedTx._id);
      await fetchSingleTransaction(selectedTx._id);
    } catch (error: any) {
      console.error('Error making payment:', error);
      toast({
        title: error.response?.data?.message || 'Failed to complete payment',
        variant: 'destructive'
      });
    } finally {
      setLoadingTxId(null);
      setLoadingLogTxId(null);
    }
  };

  const allMonths = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const getOrderedMonths = () => {
    const now = new Date();
    const currentMonthIndex = now.getMonth();
    return [
      ...allMonths.slice(currentMonthIndex),
      ...allMonths.slice(0, currentMonthIndex)
    ];
  };

  const createTransactionMap = () => {
    const map: Record<string, any> = {};
    agentTransactions.forEach((tx) => {
      const txDate = moment(tx.month, 'YYYY-MM');
      if (txDate.year() === currentYear) {
        map[tx.month] = tx;
      }
    });
    return map;
  };

  const transactionMap = createTransactionMap();

  const filteredMonths = getOrderedMonths().filter((monthName) => {
    const monthIndex = allMonths.indexOf(monthName);
    const monthNumber = monthIndex + 1;
    const monthKey = `${currentYear}-${String(monthNumber).padStart(2, '0')}`;
    return transactionMap[monthKey];
  });

  return (
    <Card className="rounded-sm">
      <CardContent>
        <div className="flex flex-row items-center justify-between py-4">
          <h1 className="text-2xl font-bold">
            {agentInfo?.name || ''} Commission History
          </h1>
          <Button
            className="border-none bg-theme text-white hover:bg-theme/90"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {loading ? (
          <BlinkingDots size="large" color="bg-theme" />
        ) : agentTransactions.length === 0 ? (
          <p className="text-muted-foreground">No agent transactions found.</p>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Investor Name
                </p>
                <p className="mt-1 truncate text-lg font-semibold text-gray-800">
                  {investorInfo?.name || 'Investor'}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Total Due</p>
                <p className="mt-1 truncate text-lg font-semibold text-rose-500">
                  £{agentCommission?.totalCommissionDue?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Total Paid</p>
                <p className="mt-1 truncate text-lg font-semibold text-green-600">
                  £{agentCommission?.totalCommissionPaid?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            <div className="mb-6 flex items-center justify-start">
              <label htmlFor="year-select" className="mr-2 text-sm font-medium">
                Select Year:
              </label>
              <Select
                onValueChange={(value) => setCurrentYear(parseInt(value))}
                defaultValue={`${currentYear}`}
              >
                <SelectTrigger id="year-select" className="w-[120px]">
                  <SelectValue placeholder={currentYear} />
                </SelectTrigger>
                <SelectContent>
                  {generateYears().map((year) => (
                    <SelectItem key={year} value={`${year}`}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              {filteredMonths.map((monthName, idx) => {
                const monthIndex = allMonths.indexOf(monthName);
                const monthNumber = monthIndex + 1;
                const monthKey = `${currentYear}-${String(monthNumber).padStart(2, '0')}`;
                const tx = transactionMap[monthKey];
                const due = tx?.commissionDue || 0;
                const paid = tx?.commissionPaid || 0;
                const status = tx?.status || 'due';
                const profit = tx?.profit || 0;
                return (
                  <Card
                    key={idx}
                    className={`border border-gray-200 transition-shadow hover:shadow-md`}
                  >
                    <CardHeader>
                      <CardTitle className="flex flex-wrap items-center justify-between gap-4 text-lg">
                        <span>{`${monthName} ${currentYear}`}</span>

                        <span className="font-semibold text-blue-500">
                          Commission: £{profit.toFixed(2)}
                        </span>
                        <span className="font-semibold text-rose-500">
                          Due: £{due.toFixed(2)}
                        </span>
                        <span className="font-semibold text-green-600">
                          Paid: £{paid.toFixed(2)}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            status === 'paid'
                              ? 'bg-green-200 text-green-800'
                              : status === 'partial'
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {status.toUpperCase()}
                        </span>

                        {user.role === 'admin' && status !== 'paid' && (
                          <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                disabled={loadingTxId === tx._id}
                                variant="ghost"
                                size="sm"
                                className="border-none bg-theme text-white hover:bg-theme/90"
                                onClick={() => {
                                  setSelectedTx(tx);
                                  setPaidAmount('');
                                  setNote('');
                                }}
                              >
                                Make Payment{' '}
                                <PoundSterlingIcon className="ml-2 h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Add Payment for {monthName}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="mt-4 flex flex-col gap-4">
                                <div>
                                  <label className="mb-1 block text-sm font-medium">
                                    Paid Amount (£)
                                  </label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={paidAmount}
                                    onChange={(e) =>
                                      setPaidAmount(e.target.value)
                                    }
                                  />
                                  {isOverPayment && (
                                    <p className="mt-1 text-sm text-red-600">
                                      Paid amount cannot exceed the commission
                                      due (£{commissionDue.toFixed(2)})
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <label className="mb-1 block text-sm font-medium">
                                    Note
                                  </label>
                                  <Textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                  />
                                </div>
                                <div className="mt-4 flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    disabled={!!loadingTxId || isOverPayment}
                                    className="bg-theme text-white hover:bg-theme/90"
                                    onClick={handlePaymentConfirm}
                                  >
                                    {loadingTxId === tx._id && (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Confirm
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(tx.logs?.length > 0 || tx.paymentLog?.length > 0) && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700">
                            Transaction History:
                          </h4>
                          {[...(tx.logs || []), ...(tx.paymentLog || [])]
                            .filter(
                              (log) => log.type !== 'commissionPaymentMade'
                            )
                            .sort(
                              (a, b) =>
                                new Date(b.createdAt || b.timestamp).getTime() -
                                new Date(a.createdAt || a.timestamp).getTime()
                            )
                            .map((log, index) => (
                              <div
                                key={index}
                                className="flex flex-col gap-2 rounded-md border border-gray-100 p-3 text-sm sm:flex-row sm:justify-between"
                              >
                                <div className="flex flex-row items-center gap-4">
                                  <p className="font-medium text-black">
                                    {moment(log.createdAt).format('D MMM YYYY')}
                                  </p>

                                  {/* Show loading state or actual ID */}
                                  {log.isLoading ||
                                  (loadingLogTxId === tx._id &&
                                    log._id === 'temp-loading') ? (
                                    <div className="flex items-center gap-2">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      <span className="text-xs text-gray-500">
                                        Generating ID...
                                      </span>
                                    </div>
                                  ) : (
                                    <p className="text-black">{log._id}</p>
                                  )}

                                  {log.transactionType ===
                                    'commissionPayment' && (
                                    <p className="text-sm text-green-600">
                                      Payment Initiated
                                    </p>
                                  )}

                                  <p className="text-black">
                                    {log.message || log.note || ''}
                                  </p>
                                </div>
                                <div>
                                  {(log.paidAmount || log.metadata?.amount) && (
                                    <span className="font-semibold text-black">
                                      £
                                      {(
                                        log.paidAmount ||
                                        log.metadata?.amount ||
                                        0
                                      ).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
