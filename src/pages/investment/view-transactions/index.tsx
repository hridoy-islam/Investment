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

export default function InvestmentTransactionPage() {
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
      const filtered = allTx.filter((tx: any) =>
        tx.month?.startsWith(currentYear)
      );
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

    const orderedMonths = [
      ...allMonths.slice(currentMonthIndex),
      ...allMonths.slice(0, currentMonthIndex)
    ];

    return orderedMonths.filter((monthName) => {
      const monthNumber = allMonths.indexOf(monthName) + 1;
      const monthKey = `${currentYear}-${String(monthNumber).padStart(2, '0')}`;
      return monthWiseMap[monthKey] && monthWiseMap[monthKey].length > 0;
    });
  };

  const monthWiseMap = getMonthWiseTransactions();

  // Helper to format camelCase to Title Case (e.g. adminCostDeclared -> Admin Cost Declared)
  const formatTransactionType = (type: string) => {
    if (!type) return 'Transaction';
    // Specific overrides for cleaner UI
    const map: Record<string, string> = {
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

    if (map[type]) return map[type];

    // Fallback: Split camelCase
    return type.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <Card className="rounded-md border-none bg-white shadow-sm">
      <CardContent className="px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-row items-center gap-4">
            <h1 className="text-2xl font-bold">
              {transactions[0]?.investmentId?.title}
            </h1>
            <div className="flex flex-row items-center gap-4">
              <h1 className="text-2xl font-medium">Transaction History</h1>
              {/* Year Selector */}
              <div className="flex items-center gap-3">
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
              <div className="grid grid-cols-1 gap-8">
                {getFilteredOrderedMonths().map((monthName, idx) => {
                  const monthNumber = allMonths.indexOf(monthName) + 1;
                  const monthKey = `${currentYear}-${String(monthNumber).padStart(2, '0')}`;
                  const monthTransactions = monthWiseMap[monthKey] || [];

                  const allLogs: Array<any> = [];

                  // Process logs
                  monthTransactions.forEach((tx) => {
                    if (tx.paymentLog && tx.paymentLog.length > 0) {
                      tx.paymentLog.forEach((log: any) => {
                        allLogs.push({
                          ...log,
                          investorName: tx.investorId?.name,
                          createdAt: log.createdAt || tx.createdAt,
                          isPaymentLog: true,
                          transactionType: 'profitPayment' // Explicit type for payments
                        });
                      });
                    }

                    if (tx.logs && tx.logs.length > 0) {
                      tx.logs.forEach((log: any) => {
                        allLogs.push({
                          ...log,
                          investorName: tx.investorId?.name,
                          createdAt: log.createdAt || tx.createdAt,
                          isPaymentLog: false
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
                      className="overflow-hidden rounded-md border border-gray-200 shadow-sm"
                    >
                      <CardHeader className=" pb-4">
                        <CardTitle className="text-lg font-semibold">
                          {monthName} {currentYear}
                        </CardTitle>
                      </CardHeader>

                      <div className="p-0">
                        {allLogs.length === 0 ? (
                          <p className="py-4 text-center text-gray-500">
                            No logs found.
                          </p>
                        ) : (
                          <div className="w-full">
                            {/* Table-like Header */}
                            <div className="grid grid-cols-12 gap-4 border-b  px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                              <div className="col-span-2">Date</div>
                              <div className="col-span-3">Transaction ID</div>
                              {/* <div className="col-span-2 text-right">Title</div> */}
                              <div className="col-span-3">Details</div>
                              <div className="col-span-2 text-right">Amount</div>
                            </div>

                            {/* Table-like Body */}
                            <div className="divide-y divide-gray-100">
                              {allLogs.map((log, index) => {
                                
                                // 1. Determine Title (Category/Type)
                                const titleText = formatTransactionType(log.transactionType || log.type);

                                // 2. Determine Details (Description/Message)
                                let detailsText = log.message || log.note || '-';
                                
                                // Special case adjustments for clearer details
                                if (log.transactionType === 'profitPayment') {
                                   detailsText = ` ${log.note ? `${log.note}` : ''}`;
                                } else if (log.transactionType === 'investment') {
                                   detailsText = log.metadata?.investorName
                                    ? `Investment from ${log.metadata.investorName}`
                                    : 'Initial Investment Added';
                                }

                                const amount =
                                  log.paidAmount > 0
                                    ? log.paidAmount
                                    : log.metadata?.amount > 0
                                    ? log.metadata.amount
                                    : 0;

                                return (
                                  <div
                                    key={index}
                                    className="grid grid-cols-12 gap-4 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/50 items-center"
                                  >
                                    {/* Date */}
                                    <div className="col-span-2 flex items-center font-medium text-gray-900">
                                      {moment(log.createdAt).format('D MMM YYYY')}
                                    </div>

                                    {/* Transaction ID */}
                                    <div className="col-span-3 flex items-center">
                                      <span
                                        className=" font-mono text-xs"
                                        title={log._id}
                                      >
                                        {log._id}
                                      </span>
                                    </div>

                                    {/* Title (Type) */}
                                    {/* <div className="col-span-2 flex items-center justify-end font-semibold text-blue-700">
                                      <span className="truncate" title={titleText}>
                                        {titleText}
                                      </span>
                                    </div> */}

                                    {/* Details (Message) */}
                                    <div className="col-span-3 flex items-center ">
                                      <span className="" title={detailsText}>
                                        {detailsText}
                                      </span>
                                    </div>

                                    {/* Amount */}
                                    <div className="col-span-2 flex items-center justify-end font-medium \">
                                      {amount > 0 ? `£${amount.toFixed(2)}` : '-'}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
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