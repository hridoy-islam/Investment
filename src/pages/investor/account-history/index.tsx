import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Button } from '@/components/ui/button';
import { MoveLeft, PoundSterlingIcon } from 'lucide-react';
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

export default function InvestorAccountHistoryPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [note, setNote] = useState('');
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
 
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
      const res = await axiosInstance.get(`/investment-participants/${id}`);
      const participantData = res.data?.data || {};
      setData(participantData);

      if (
        participantData.investorId?._id &&
        participantData.investmentId?._id
      ) {
        const txRes = await axiosInstance.get(`/transactions`, {
          params: {
            investorId: participantData.investorId._id,
            investmentId: participantData.investmentId._id
          }
        });
        setTransactions(txRes.data?.data?.result || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, currentYear]);

  const handlePaymentConfirm = async () => {
    if (!paidAmount || !selectedTransaction) return;
    try {
      const payload = {
        paidAmount: parseFloat(paidAmount),
        note: note
      };
      await axiosInstance.patch(
        `/transactions/${selectedTransaction._id}`,
        payload
      );

      //  Optimistically update the transactions array
      setTransactions((prevTransactions) =>
        prevTransactions.map((tx) =>
          tx._id === selectedTransaction._id
            ? {
                ...tx,
                monthlyTotalPaid:
                  (tx.monthlyTotalPaid || 0) + payload.paidAmount,
                status:
                  payload.paidAmount >= tx.monthlyTotalDue ? 'paid' : 'partial',
                paymentLog: [
                  ...(tx.paymentLog || []),
                  {
                    paidAmount: payload.paidAmount,
                    note: payload.note,
                    createdAt: new Date().toISOString(),
                    transactionType: 'profitPayment'
                  }
                ]
              }
            : tx
        )
      );

      //  Optionally update totalPaid in data
      setData((prevData: any) => ({
        ...prevData,
        totalPaid: (prevData.totalPaid || 0) + payload.paidAmount
      }));

      setIsDialogOpen(false);
      setPaidAmount('');
      setNote('');
      toast({ title: 'Payment recorded successfully' });
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: error.response?.data?.message || 'Payment failed',
        variant: 'destructive'
      });
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
    const currentMonthIndex = now.getMonth(); // 0-based
    return [
      ...allMonths.slice(currentMonthIndex),
      ...allMonths.slice(0, currentMonthIndex)
    ];
  };

  const createTransactionMap = () => {
    const transactionMap: Record<string, any> = {};
    transactions.forEach((tx) => {
      if (tx.month) {
        transactionMap[tx.month] = tx;
      }
    });
    return transactionMap;
  };

  const transactionMap = createTransactionMap();

  return (
    <Card className="rounded-sm">
      <CardContent>
        <div className="flex flex-row items-center justify-between py-4">
          <h1 className="text-2xl font-bold">Account History</h1>
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
        ) : !data ? (
          <p>No data found.</p>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  label: 'Project Title',
                  value: data.investmentId?.title || 'N/A'
                },
                {
                  label: 'Investor Name',
                  value: data.investorId?.name || 'N/A'
                },
                { label: 'Amount', value: `£${data.amount || 0}` },
                { label: 'Rate', value: `${data.rate || 0}%` },
                { label: 'Total Due', value: `£${data.totalDue || 0}` },
                { label: 'Total Paid', value: `£${data.totalPaid || 0}` }
              ].map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <p className="text-sm font-medium text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-1 truncate text-lg font-semibold text-gray-800">
                    {item.value}
                  </p>
                </div>
              ))}
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

            <div className="grid grid-cols-1 gap-4">
              {getOrderedMonths().map((monthName, idx) => {
                const monthIndex = allMonths.indexOf(monthName); // Get original index
                const monthNumber = monthIndex + 1;
                const monthKey = `${currentYear}-${String(monthNumber).padStart(2, '0')}`;
                const transaction = transactionMap[monthKey];

                const profit = transaction?.profit || 0;
                const dueAmount = transaction?.monthlyTotalDue || 0;
                const paidAmount = transaction?.monthlyTotalPaid || 0;
                const status = transaction?.status || 'N/A';
                const paymentLogs = transaction?.paymentLog || [];

                return (
                  <Card
                    key={idx}
                    className={`border border-gray-200 transition-shadow hover:shadow-lg ${
                      status === 'paid' ? 'bg-green-50' : ''
                    }`}
                  >
                    <CardHeader>
                      <CardTitle className="flex flex-wrap items-center justify-between gap-4 text-lg">
                        <div>{`${monthName} ${currentYear}`}</div>
                        <p className="font-semibold">
                          <span className="font-medium">Profit:</span> £{profit}
                        </p>
                        <p className="font-semibold">
                          <span className="font-medium">Due:</span> £{dueAmount}
                        </p>
                        {/* <p className="font-semibold">
                          <span className="font-medium">Paid:</span> £
                          {paidAmount}
                        </p> */}
                        {status === 'paid' ? (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                            Paid
                          </span>
                        ) : status === 'partial' ? (
                          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                            Partial
                          </span>
                        ) : (
                          status === 'due' && (
                            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                              Due
                            </span>
                          )
                        )}

                        {user.role === 'admin' && transaction && profit > 0 && (
                          <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="border-none bg-theme text-white hover:bg-theme/90"
                                onClick={() => {
                                  setPaidAmount('');
                                  setNote('');
                                  setSelectedTransaction(transaction);
                                }}
                                disabled={status === 'paid'}
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
                                    type="text"
                                    onChange={(e) =>
                                      setPaidAmount(e.target.value)
                                    }
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-sm font-medium">
                                    Note
                                  </label>
                                  <Textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="border border-gray-300"
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
                                    className="bg-theme text-white hover:bg-theme/90"
                                    onClick={handlePaymentConfirm}
                                  >
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
                      {paymentLogs && paymentLogs.length > 1 && (
                        <div className="mt-4 space-y-2">
                          <h4 className="font-medium text-gray-700">
                            Payment History:
                          </h4>
                          {paymentLogs.map((log, logIndex) => (
                            <div
                              key={logIndex}
                              className="flex flex-col gap-2 rounded-md border border-gray-200 p-3 text-sm shadow-sm hover:shadow-lg sm:flex-row sm:items-center sm:justify-between sm:px-4"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                                <p className="text-gray-600">
                                  {log.createdAt
                                    ? new Date(
                                        log.createdAt
                                      ).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                      })
                                    : 'N/A'}
                                </p>
                                {log.transactionType === 'profitPayment' && (
                                  <div className="flex flex-row items-center gap-2">
                                    Payment Initiated{' '}
                                    {log.note && (
                                      <p className="text-gray-800">
                                        ({log.note})
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col items-start sm:items-end">
                                <p>
                                  <span className="font-medium text-gray-600">
                                    Amount Paid:
                                  </span>{' '}
                                  <span className="font-semibold text-black">
                                    £{log.paidAmount?.toFixed(2) || '0.00'}
                                  </span>
                                </p>
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
