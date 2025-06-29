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

export default function InvestorAccountHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();

  const [data, setData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [note, setNote] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [count, setCount] = useState(0);

  // Loading flags for payments & logs
  const [loadingTxId, setLoadingTxId] = useState<string | null>(null);
  const [loadingLogTxId, setLoadingLogTxId] = useState<string | null>(null);

  const increment = () => setCount(prev => prev + 1);

  const generateYears = () => {
    const years = [];
    const startYear = currentYear - 50;
    for (let i = 0; i < 100; i++) {
      years.push(startYear + i);
    }
    return years;
  };

  const sortByLatestCreatedAt = (data: any[]) => 
    data.sort((a, b) =>
      moment(b.createdAt).diff(moment(a.createdAt))
    );

  // Fetch both participant and transactions
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/investment-participants/${id}`);
      const participantData = res.data?.data || {};
      setData(participantData);

      if (participantData.investorId?._id && participantData.investmentId?._id) {
        const [txRes, invRes] = await Promise.all([
          axiosInstance.get(`/transactions?limit=12`, {
            params: {
              investorId: participantData.investorId._id,
              investmentId: participantData.investmentId._id
            }
          }),
          axiosInstance.get(`/investments/${participantData.investmentId._id}`)
        ]);

        const investmentDetails = invRes.data?.data || {};
        const amountRequired = investmentDetails.amountRequired || 0;
        const computedRate = amountRequired > 0
          ? (100 * participantData.amount) / amountRequired
          : 0;

        setData(prev => ({
          ...participantData,
          computedRate: computedRate.toFixed(2),
          totalPaid: prev.totalPaid || 0,
          totalDue: prev.totalDue || 0
        }));

        setTransactions(txRes.data?.data?.result || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'Failed to load account data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, currentYear, count]);

  // Fetch specific transaction to update logs after payment
  const fetchSingleTransaction = async (txId: string) => {
    try {
      const response = await axiosInstance.get(`/transactions/${txId}`);
      const updatedTx = response.data?.data;
      if (updatedTx) {
        setTransactions(prev =>
          prev.map(tx =>
            tx._id === txId ? updatedTx : tx
          )
        );
      }
    } catch (e) {
      console.error('Error fetching single transaction:', e);
    }
  };

  const handlePaymentConfirm = async () => {
    if (!paidAmount || !selectedTransaction) return;
    const paidAmtNum = parseFloat(paidAmount);
    if (paidAmtNum <= 0) return;

    const txId = selectedTransaction._id;
    setLoadingTxId(txId);

    // Optimistic UI update
    setTransactions(prev =>
      prev.map(tx => {
        if (tx._id === txId) {
          const newPaid = (tx.monthlyTotalPaid || 0) + paidAmtNum;
          const due = tx.monthlyTotalDue || 0;
          const newStatus = newPaid >= due ? 'paid' : 'partial';

          const tempLog = {
            _id: 'temp-loading',
            transactionType: 'profitPayment',
            paidAmount: paidAmtNum,
            note,
            createdAt: new Date().toISOString(),
            isLoading: true,
          };

          return {
            ...tx,
            monthlyTotalPaid: newPaid,
            status: newStatus,
            paymentLog: [...(tx.paymentLog || []), tempLog],
          };
        }
        return tx;
      })
    );

    setData(prev => ({
      ...prev,
      totalPaid: (prev.totalPaid || 0) + paidAmtNum,
      totalDue: Math.max((prev.totalDue || 0) - paidAmtNum, 0)
    }));

    setIsDialogOpen(false);
    setPaidAmount('');
    setNote('');

    try {
      await axiosInstance.patch(`/transactions/${txId}`, {
        paidAmount: paidAmtNum,
        note
      });

      toast({ title: 'Payment completed successfully' });

      setLoadingLogTxId(txId);
      await fetchSingleTransaction(txId);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: error.response?.data?.message || 'Payment failed',
        variant: 'destructive'
      });
      fetchData(); // rollback
    } finally {
      setLoadingTxId(null);
      setLoadingLogTxId(null);
    }
  };

  const handleCloseProjectConfirm = async () => {
    if (!data) return;

    try {
      await axiosInstance.patch(`/investment-participants/${id}`, {
        totalDue: 0,
        totalPaid: data.totalDue,
        status: 'block',
        amount: 0
      });
      setData(prev => ({ ...prev, totalDue: 0, totalPaid: prev.totalDue, status: 'block', amount: 0 }));
      increment();
      toast({ title: 'Project successfully closed.' });
      setIsCloseDialogOpen(false);
    } catch (error: any) {
      console.error('Close project failed:', error);
      toast({
        title: error.response?.data?.message || 'Failed to close project',
        variant: 'destructive'
      });
    }
  };

  const allMonths = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const nowIndex = new Date().getMonth();

  const createTransactionMap = () => {
    const map: Record<string, any> = {};
    transactions.forEach(tx => {
      if (tx.month) {
        map[tx.month] = tx;
      }
    });
    return map;
  };
  const transactionMap = createTransactionMap();
  const orderedMonths = [...allMonths.slice(nowIndex), ...allMonths.slice(0, nowIndex)];

  return (
    <Card className="rounded-sm">
      <CardContent>
        {/* Header */}
        <div className="flex flex-row items-center justify-between py-4">
          <h1 className="text-2xl font-bold">Account History</h1>
          {data?.status === 'block' && (
            <p className="mt-2 text-sm text-red-500">
              Project is closed. No further actions allowed.
            </p>
          )}
          <div className="flex flex-row items-center gap-4">
            <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={data?.status === 'block'}>
                  Close Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure you want to close this project?</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-600">
                  This will mark all remaining due as paid and block this investment participant from further updates.
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>Cancel</Button>
                  <Button className="bg-theme text-white hover:bg-theme/90" onClick={handleCloseProjectConfirm}>Confirm</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm" className="bg-theme text-white hover:bg-theme/90" onClick={() => navigate(-1)}>
              <MoveLeft className="mr-2 h-4 w-4" />Back
            </Button>
          </div>
        </div>

        {/* Loading or Content */}
        {loading ? (
          <BlinkingDots size="large" color="bg-theme" />
        ) : !data ? (
          <p>No data found.</p>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: 'Project Title', value: data.investmentId?.title || 'N/A' },
                { label: 'Investor Name', value: data.investorId?.name || 'N/A' },
                { label: 'Amount', value: `£${data.amount || 0}` },
                { label: 'Share', value: `${data.computedRate || 0}%` },
                { label: 'Total Due', value: `£${(data.totalDue ?? 0).toFixed(2)}` },
                { label: 'Total Paid', value: `£${(data.totalPaid ?? 0).toFixed(2)}` },
              ].map((item, i) => (
                <div key={i} className="rounded-lg border bg-white p-3 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold text-gray-800 truncate">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Year Filter */}
            <div className="mb-6 flex items-center justify-start">
              <label htmlFor="year-select" className="mr-2 text-sm font-medium">
                Select Year:
              </label>
              <Select onValueChange={v => setCurrentYear(parseInt(v))} defaultValue={`${currentYear}`}>
                <SelectTrigger id="year-select" className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {generateYears().map(y => <SelectItem key={y} value={`${y}`}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Monthly Cards */}
            <div className="grid grid-cols-1 gap-4">
              {orderedMonths.filter(m => transactionMap[`${currentYear}-${String(allMonths.indexOf(m)+1).padStart(2,'0')}`])
                .map((monthName, idx) => {
                  const monthIdx = allMonths.indexOf(monthName) + 1;
                  const monthKey = `${currentYear}-${String(monthIdx).padStart(2,'0')}`;
                  const tx = transactionMap[monthKey];
                  const profit = tx.profit || 0;
                  const dueAmt = tx.monthlyTotalDue || 0;
                  const paidAmt = tx.monthlyTotalPaid || 0;
                  const status = tx.status || 'due';
                  const logs = [...(tx.logs || []), ...(tx.paymentLog || [])]
                    .filter(l => l.type !== 'commissionPaymentMade')
                    .sort((a, b) => new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime());

                  return (
                    <Card key={idx} className={`border border-gray-300 transition-shadow hover:shadow-lg ${status==='paid' ? 'bg-green-50' : ''}`}>
                      <CardHeader>
                        <CardTitle className="flex flex-wrap items-center justify-between gap-4 text-lg">
                          <div>{`${monthName} ${currentYear}`}</div>
                          <p className="text-blue-500 font-semibold"><span className="font-medium text-black">Profit:</span> £{profit.toFixed(2)}</p>
                          <p className="text-rose-500 font-semibold"><span className="font-medium text-black">Due:</span> £{dueAmt.toFixed(2)}</p>
                          <p className="text-green-500 font-semibold"><span className="font-medium text-black">Paid:</span> £{paidAmt.toFixed(2)}</p>

                          {status === 'paid' ? (
                            <span className="bg-green-100 rounded-full px-2 py-1 text-xs font-semibold text-black">Paid</span>
                          ) : status === 'partial' ? (
                            <span className="bg-yellow-100 rounded-full px-2 py-1 text-xs font-semibold text-black">Partial</span>
                          ) : (
                            <span className="bg-red-100 rounded-full px-2 py-1 text-xs font-semibold text-black">Due</span>
                          )}

                          {user.role === 'admin' && status !== 'paid' && profit > 0 && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="border-none bg-theme text-white hover:bg-theme/90"
                                  onClick={() => {
                                    setSelectedTransaction(tx);
                                    setPaidAmount('');
                                    setNote('');
                                  }}
                                  disabled={data?.status === 'block' || dueAmt=== 0 }
                                >
                                  Make Payment <PoundSterlingIcon className="ml-2 h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add Payment for {monthName}</DialogTitle>
                                </DialogHeader>
                                <div className="mt-4 flex flex-col gap-4">
                                  <div>
                                    <label className="mb-1 block text-sm font-medium">Paid Amount (£)</label>
                                    <Input type="number" step="0.01" min="0" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} />
                                  </div>
                                  <div>
                                    <label className="mb-1 block text-sm font-medium">Note</label>
                                    <Textarea value={note} onChange={e => setNote(e.target.value)} />
                                  </div>
                                  <div className="mt-4 flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button
                                      className="bg-theme text-white hover:bg-theme/90"
                                      onClick={handlePaymentConfirm}
                                      disabled={loadingTxId === tx._id}
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
                        {logs.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <h4 className="text-gray-700 font-medium">Transaction History:</h4>
                            {logs.map((log, i) => (
                              <div key={i} className="flex flex-col sm:flex-row sm:justify-between gap-2 border border-gray-300  p-3 rounded-md text-sm">
                                <div className="flex flex-row items-center gap-4">
                                  <p className="font-medium text-black">
                                    {moment(log.createdAt).format('DD MMM YYYY') }
                                  </p>

                                  {(log.isLoading || (loadingLogTxId === tx._id && log._id === 'temp-loading')) ? (
                                    <div className="flex items-center gap-2">
                                      <Loader2 className="animate-spin h-3 w-3" />
                                      <span className="text-gray-500 text-xs">Generating ID...</span>
                                    </div>
                                  ) : (
                                    <p className="text-black">{log._id}</p>
                                  )}

                                  {log.transactionType === 'profitPayment' && (
                                    <p className="text-green-600 text-sm">Payment Initiated</p>
                                  )}
                                  <p className="text-black">{log.note || log.message || ''}</p>
                                </div>

                                {(log.paidAmount || log.metadata?.amount) && (
                                  <span className="font-semibold text-black">
                                    £{(log.paidAmount || log.metadata?.amount || 0).toFixed(2)}
                                  </span>
                                )}
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
