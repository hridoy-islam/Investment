import { useEffect, useState } from 'react';
import { MoveLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export default function InvestorTransactionPage() {
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/transactions?investorId=${user._id}`
      );
      const data = response.data.data.result;

      const flattened = data.flatMap((transaction) =>
        transaction.paymentLog.map((log) => ({
          ...log,
          investmentTitle: transaction?.investmentId?.title || 'N/A',
          month: transaction.month,
          createdAt: log.createdAt,
          paidAmount: log.paidAmount,
          note: log.note,
          transactionType: log.transactionType
        }))
      );

      setAllTransactions(flattened);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setAllTransactions([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const filtered = allTransactions
      .filter((tx) => tx.month?.startsWith(selectedYear))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    setTransactions(filtered);
  }, [selectedYear, allTransactions]);

  useEffect(() => {
    if (user._id) {
      fetchAllTransactions();
    }
  }, [user._id]);

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());
  };

  return (
    <Card>
      <CardContent className="space-y-3 rounded-md bg-white p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex w-full flex-row items-center justify-between gap-4">
            <div className='flex flex-row items-center gap-6'>

            <h1 className="text-2xl font-semibold">Transaction Logs</h1>
            <div className="flex justify-end">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {generateYears().map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="bg-theme text-white hover:bg-theme/90"
            >
              <MoveLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>

        {/* Year Filter */}
        

        {/* Transaction List */}
        <div>
          {loading ? (
            <div className="flex justify-center py-6">
              <BlinkingDots size="large" color="bg-theme" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex justify-center py-6 text-gray-500">
              No transaction logs found.
            </div>
          ) : (
            <div className="min-h-[65vh] space-y-2 overflow-y-auto ">
              {transactions.map((log, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-1 rounded-md border border-gray-200 bg-gray-50 px-4  py-1 shadow-sm hover:bg-gray-100 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-row items-center gap-8 text-sm text-gray-700">
                    <p className="font-semibold">
                      {new Date(log.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>

                    <p className="font-semibold">{log.investmentTitle}</p>
                    {log.transactionType === 'profitPayment' ? (
                      <div className="italic text-gray-600">
                        Payment Initiated{log.note ? ` (${log.note})` : ''}
                      </div>
                    ) : (
                      <p className="italic text-gray-600">{log.note || ''}</p>
                    )}
                  </div>
                  <div className="text-right font-semibold text-gray-900">
                    £{log.paidAmount || 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
