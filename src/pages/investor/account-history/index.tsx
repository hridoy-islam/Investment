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
import moment from 'moment';

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
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [count, setCount] = useState(0);
  const increment = () => setCount((prev) => prev + 1);

  const generateYears = () => {
    const years = [];
    const startYear = currentYear - 50;
    for (let i = 0; i < 100; i++) {
      years.push(startYear + i);
    }
    return years;
  };

  function sortByLatestCreatedAt(data) {
    return data.sort((a, b) => {
      const timeA = moment(a.createdAt);
      const timeB = moment(b.createdAt);
      return timeB.diff(timeA);
    });
  }
  const sortedItems = sortByLatestCreatedAt(transactions);

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

        // Compute the Rate if amountRequired is valid
        const computedRate =
          amountRequired > 0
            ? (100 * participantData.amount) / amountRequired
            : 0;

        // Add computedRate to participantData
        setData({
          ...participantData,
          computedRate: computedRate.toFixed(2) // Optional: round to 2 decimals
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
  }, [id, currentYear,count]);

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
        totalPaid: (prevData.totalPaid || 0) + payload.paidAmount,
        totalDue: Math.max((prevData.totalDue || 0) - payload.paidAmount, 0)
      }));

      setIsDialogOpen(false);
      setPaidAmount('');
      setNote('');
      toast({ title: 'Payment Completed successfully' });
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

  const getFilteredOrderedMonths = (transactionMap: Record<string, any>) => {
    const now = new Date();
    const currentMonthIndex = now.getMonth(); // 0-based
    const orderedMonths = [
      ...allMonths.slice(currentMonthIndex),
      ...allMonths.slice(0, currentMonthIndex)
    ];

    return orderedMonths.filter((monthName) => {
      const monthIndex = allMonths.indexOf(monthName); // 0-based
      const monthNumber = monthIndex + 1; // convert to 1-based for formatting
      const monthKey = `${currentYear}-${String(monthNumber).padStart(2, '0')}`;
      return transactionMap[monthKey]; // only keep if there's a transaction
    });
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

  const handleCloseProjectConfirm = async () => {
    if (!data) return;

    try {
      const payload = {
        totalDue: 0,
        totalPaid: data.totalDue,
        status: 'block',
        amount: 0
      };

      await axiosInstance.patch(`/investment-participants/${id}`, payload);

      setData((prev: any) => ({
        ...prev,
        ...payload
      }));
      increment()

      toast({
        title: 'Project successfully closed.',
        variant: 'default'
      });

      setIsCloseDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to close project:', error);
      toast({
        title: error.response?.data?.message || 'Failed to close project',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="rounded-sm">
      <CardContent>
        <div className="flex flex-row items-center justify-between py-4">
          <h1 className="text-2xl font-bold">Account History</h1>
             {data?.status === 'block' && (
  <p className="mt-2 text-sm text-red-500">
    Project is closed. No further actions allowed.
  </p>
)}
          <div className="flex flex-row items-center justify-center gap-4">
            <Dialog
              open={isCloseDialogOpen}
              onOpenChange={setIsCloseDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={data?.status === 'block'}
                >
                  Close Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Are you sure you want to close this project?
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-600">
                  This will mark all remaining due as paid and block this
                  investment participant from further updates.
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCloseDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-theme text-white hover:bg-theme/90"
                    onClick={handleCloseProjectConfirm}
                  >
                    Confirm
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              className="border-none bg-theme text-white hover:bg-theme/90"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <MoveLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
       
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
                { label: 'Share', value: `${data.computedRate || 0}%` },

                {
                  label: 'Total Due',
                  value:
                    data.totalDue != null
                      ? `£${data.totalDue.toFixed(2)}`
                      : '£0.00'
                },
                {
                  label: 'Total Paid',
                  value:
                    data.totalPaid != null
                      ? `£${data.totalPaid.toFixed(2)}`
                      : '£0.00'
                }
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
              {getFilteredOrderedMonths(transactionMap).map(
                (monthName, idx) => {
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
                          <p className="font-semibold text-blue-500">
                            <span className="font-medium text-black">
                              Profit:
                            </span>{' '}
                            £{profit.toFixed(2)}
                          </p>
                          <p className="font-semibold text-rose-500">
                            <span className="font-medium text-black">Due:</span>{' '}
                            £{dueAmount.toFixed(2)}
                          </p>
                          <p className="font-semibold text-green-500">
                            <span className="font-medium text-black">
                              Paid:
                            </span>{' '}
                            £{paidAmount.toFixed(2)}
                          </p>

                          {status === 'paid' ? (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-black">
                              Paid
                            </span>
                          ) : status === 'partial' ? (
                            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-black">
                              Partial
                            </span>
                          ) : (
                            status === 'due' && (
                              <span className="rounded-full bg-red-100 px-4 py-2 text-xs font-semibold text-black">
                                Due
                              </span>
                            )
                          )}

                          {user.role === 'admin' &&
                            transaction &&
                            profit > 0 && (
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
                                    disabled={
                                      status === 'paid' ||
                                      data?.status === 'block'
                                    }
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
                                        onChange={(e) =>
                                          setNote(e.target.value)
                                        }
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
                        {paymentLogs && paymentLogs.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <h4 className="font-medium text-gray-700">
                              Payment History:
                            </h4>
                            {[...paymentLogs]
                              .sort(
                                (a, b) =>
                                  new Date(b.createdAt).getTime() -
                                  new Date(a.createdAt).getTime()
                              )
                              .map((log, logIndex) => (
                                <div
                                  key={logIndex}
                                  className="flex flex-col gap-2 rounded-md border border-gray-200 p-3 text-sm shadow-sm  sm:flex-row sm:items-center sm:justify-between sm:px-4"
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
                                    {log.transactionType ===
                                      'profitPayment' && (
                                      <div className="flex flex-row items-center gap-2">
                                        Payment Initiated{' '}
                                        {log.note && (
                                          <p className="text-gray-800">
                                            ({log.note})
                                          </p>
                                        )}
                                      </div>
                                    )}
                                    {log.transactionType ===
                                      'closeProject' && (
                                      <div className="flex flex-row items-center gap-2">
                                        
                                        {log.note && (
                                          <p className="text-gray-800">
                                            {log.note}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                    {log.transactionType === 'investment' && (
                                      <div className="flex flex-row items-center gap-2">
                                        Initial investment successfully created{' '}
                                      </div>
                                    )}
                                  </div>
                                  {log.transactionType === 'profitPayment' || log.transactionType === 'closeProject' && (
                                    <div className="flex flex-row items-start sm:items-end gap-2">
                                      
                                        <span className="font-medium text-gray-600">
                                          Amount:
                                        </span>{' '}
                                        <span className="font-semibold text-black">
                                          {log.transactionType ===
                                            'profitPayment' || log.transactionType ===
                                            'closeProject' && (
                                            <div className="flex flex-row items-center gap-2"></div>
                                          )}
                                          £
                                          {log.paidAmount?.toFixed(2) || '0.00'}
                                        </span>
                                    
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
