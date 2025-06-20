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
import { Badge } from '@/components/ui/badge';

export default function InvestorAccountHistoryPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedProfit, setSelectedProfit] = useState<any>(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [note, setNote] = useState('');
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();

  // Generate 100 years: 50 years before and after current year
  const generateYears = () => {
    const years = [];
    const startYear = currentYear - 50;
    for (let i = 0; i < 100; i++) {
      years.push(startYear + i);
    }
    return years;
  };

  // Fetch data for selected year
  const fetchData = async () => {
    try {
      const res = await axiosInstance.get(`/investment-participants/${id}`, {
        params: { year: currentYear }
      });
      setData(res.data?.data || {});
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
    if (!paidAmount) return;
    try {
      const payload = {
        monthlyProfits: [
          {
            _id: selectedProfit._id,
            month: selectedProfit.month,
            paidAmount: parseFloat(paidAmount),
            note: note
          }
        ]
      };
      await axiosInstance.patch(`/investment-participants/${id}`, payload);
      setIsDialogOpen(false);
      setPaidAmount('');
      setNote('');
      fetchData(); // Refresh data
      toast({ title: 'Paid amount successfully' });
    } catch (error) {
      console.error('Error updating payment:', error);
      setIsDialogOpen(false);
      toast({
        title: error.response?.data?.message || 'Transaction Failed',
        className: 'bg-destructive text-white'
      });
    }
  };

  // Get ordered list of months
  const getOrderedMonths = () => {
    const today = new Date();
    const currentMonthIndex = today.getMonth();
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
    // Rotate array so current month is first
    return [
      ...allMonths.slice(currentMonthIndex),
      ...allMonths.slice(0, currentMonthIndex)
    ];
  };

  // Map monthlyProfits to a hash by month key (e.g., '2025-06')
  const profitMap = {};
  if (data?.monthlyProfits && Array.isArray(data.monthlyProfits)) {
    data.monthlyProfits.forEach((item) => {
      profitMap[item.month] = item;
    });
  }

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
            {/* Info Summary Block */}
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

            {/* Year Selector Dropdown */}
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

            {/* Grid of Monthly Cards (Current Month First) */}
            <div className="grid grid-cols-1 gap-4">
              {getOrderedMonths().map((monthName, idx) => {
                const monthNumber = String(
                  idx + (((new Date().getMonth() + idx) % 12) + 1)
                ).padStart(2, '0');
                const monthKey = `${currentYear}-${String(monthNumber).padStart(2, '0')}`;
                const profitItem = profitMap[monthKey];
                const lastLogIndex = profitItem?.paymentLog?.length - 1;
                const lastPaymentLog = profitItem?.paymentLog?.[lastLogIndex];
                const dueAmount = lastPaymentLog?.dueAmount || 0;
                const status = lastPaymentLog?.status || 'N/A';

                return (
                  <Card
                    key={idx}
 className={`cursor-pointer border border-gray-200 transition-shadow hover:shadow-lg ${
    status === 'paid' ? 'bg-green-50' : ''
  }`}                  >
                    <CardHeader>
                      <CardTitle className="flex flex-row items-center justify-between text-lg">
                        <div>{`${monthName} ${currentYear}`}</div>
                        <p className="font-semibold">
                          <span className="font-medium">Profit:</span> £
                          {profitItem?.profit || 0}
                        </p>
                        {status === 'paid' && (
                          <p className="font-semibold">
                           
                              Paid
                        
                          </p>
                        )}

                        <p className="font-semibold">
                          <span className="font-medium">Due:</span> £{dueAmount}
                        </p>
                        <div>
                          {user.role === 'admin' && profitItem?.profit && (
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
                                    setSelectedProfit(profitItem);
                                  }}
                                  disabled={status === 'paid'}
                                >
                                  Make Payment{' '}
                                  <PoundSterlingIcon className="h-4 w-4" />
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
                                      value={paidAmount}
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
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mt-4 space-y-2">
                        {profitItem?.paymentLog?.length > 1 &&
                          profitItem.paymentLog.slice(1).map((log: any) => (
                            <div
                              key={log._id}
                              className="flex px-4 flex-row items-center justify-between rounded-md border border-gray-200 p-2 text-sm shadow-sm hover:shadow-lg"
                            ><div className='flex flex-row items-start gap-8'>

                              <p>
                                {new Date(log.createdAt).toLocaleDateString()}
                              </p>
                              {log.note && (
                                <p>
                                  <span className="font-medium">Note:</span>{' '}
                                  {log.note}
                                </p>
                              )}
                              </div>
                              <p>
                                <span className="font-medium">Amount:</span>{' '}
                                <span className="font-semibold">
                                  £{log.paidAmount}
                                </span>
                              </p>
                            </div>
                          ))}
                      </div>
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
