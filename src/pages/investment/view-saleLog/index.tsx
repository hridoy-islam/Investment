import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Button } from '@/components/ui/button';
import { MoveLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';

export default function SaleLogTransactionPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);

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

  const generateYears = () => {
    const years = [];
    const startYear = currentYear - 50;
    for (let i = 0; i < 100; i++) years.push(startYear + i);
    return years;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/transactions`, {
        params: { investmentId: id }
      });
      const allTx = res.data?.data?.result || [];
      const filtered = allTx.filter((tx) => tx.month?.startsWith(currentYear));
      setTransactions(filtered);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id, currentYear]);

  const investorProfitsMap = transactions.reduce(
    (acc, tx) => {
      const investorId = tx.investorId?._id;
      if (!investorId) return acc;
      if (!acc[investorId]) {
        acc[investorId] = { name: tx.investorId.name, totalProfit: 0 };
      }
      acc[investorId].totalProfit += tx.profit || 0;
      return acc;
    },
    {} as Record<string, { name: string; totalProfit: number }>
  );

  const getMonthWiseTransactions = () => {
    const monthMap: Record<string, any[]> = {};
    transactions.forEach((tx) => {
      const key = tx.month;
      if (!monthMap[key]) monthMap[key] = [];
      monthMap[key].push(tx);
    });
    return monthMap;
  };

  const getFilteredOrderedMonths = () => {
    const now = new Date();
    const currentMonthIndex = now.getMonth();

    // Create ordered months starting from current month (like your getOrderedMonths)
    const orderedMonths = [
      ...allMonths.slice(currentMonthIndex),
      ...allMonths.slice(0, currentMonthIndex)
    ];

    // Filter months that have transactions
    return orderedMonths.filter((monthName) => {
      const monthNumber = allMonths.indexOf(monthName) + 1; // 1-based month number
      const monthKey = `${currentYear}-${String(monthNumber).padStart(2, '0')}`;
      return monthWiseMap[monthKey] && monthWiseMap[monthKey].length > 0;
    });
  };

  const monthWiseMap = getMonthWiseTransactions();

  return (
    <Card className="rounded-md border-none bg-white shadow-sm">
      <CardContent className="px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {transactions[0]?.investmentId?.title}
            </h1>
            <div className="flex flex-row items-start gap-4">
              <h1 className="text-2xl font-medium">Transaction History</h1>
              {/* Year Selector */}
              <div className="mb-6 flex items-center gap-3">
                <label htmlFor="year-select" className="text-sm font-medium">
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
            </div>
          </div>
          <Button
            className="bg-theme text-white hover:bg-theme/90"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {loading ? (
          <BlinkingDots size="large" color="bg-theme" />
        ) : (
          <>
            {transactions.length === 0 ? (
              <p className="mb-6 text-sm text-gray-600">
                No transaction data found for {currentYear}.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {getFilteredOrderedMonths().map((monthName, idx) => {
                  const monthNumber = allMonths.indexOf(monthName) + 1;
                  const monthKey = `${currentYear}-${String(monthNumber).padStart(2, '0')}`;
                  const monthTransactions = monthWiseMap[monthKey] || [];

                  const allLogs: Array<{
                    investorName?: string;
                    createdAt?: string;
                    paidAmount?: number;
                    note?: string;
                    [key: string]: any;
                  }> = [];
                  monthTransactions.forEach((tx) => {
                    if (tx.logs && tx.logs.length > 0) {
                      tx.logs.forEach((log: any) => {
                        allLogs.push({
                          ...log,
                          investorName: tx.investorId?.name,
                          createdAt: log.createdAt || tx.createdAt,
                          note: log.message // using message from TransactionLog as note
                        });
                      });
                    }
                  });

                  allLogs.sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  );

                  return (
                    <Card
                      key={idx}
                      className="rounded-md border border-gray-200 shadow-sm"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">
                          {monthName} {currentYear}
                        </CardTitle>
                      </CardHeader>

                      <div className=" -mt-2  space-y-2 px-4 pb-4">
                        {allLogs.length === 0 ? (
                          <p className="text-center text-sm text-gray-500">
                            No logs found.
                          </p>
                        ) : (
                          allLogs.map((log, index) => (
                            <div
                              key={index}
                              className="flex flex-col gap-1 rounded-md border border-gray-200 bg-white px-4 py-1 shadow-sm  sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex flex-row gap-4 text-sm text-gray-700">
                                
                                  
                                    <p className="font-medium">
                                      {moment(log?.createdAt).format(
                                        'D MMM YYYY'
                                      )}
                                    </p>
                                    <p className="font-semibold">
                                      {log.investorName}
                                    </p>
                                    <p className="italic text-gray-600">
                                      {log?.note || ''}
                                    </p>
                                
                             
                              </div>

                              
                            </div>
                          ))
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
