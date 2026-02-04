import {
  TrendingUp,
  ArrowUpRight,
  Target,
  Wallet,
  PieChart,
  Pencil
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Investment {
  _id: string;
  title: string;
  image: string | null;
  amountRequired: number;
  investmentAmount: number;
  adminCost: number;
  currencyType: string;
  saleAmount?: number;
}

interface InvestmentCardProps {
  investment: Investment;
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  formatCurrency: (amount: number, currencyCode: string) => string;
}

export function InvestmentCard({
  investment,
  onViewDetails,
  onEdit,
  formatCurrency
}: InvestmentCardProps) {
  // Calculations
  const dueAmount =
    (investment.investmentAmount || 0) - (investment.amountRequired || 0);
  const currency = investment.currencyType || 'GBP';

  // Logic for status colors
  const dueClass = dueAmount <= 0 ? 'text-emerald-600' : 'text-rose-600';
  const dueBg = dueAmount <= 0 ? 'bg-emerald-50/50' : 'bg-rose-50/50';

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.action-button')) {
      return;
    }
    onViewDetails(investment._id);
  };

  return (
    <Card
      // Added 'transform-gpu' to force hardware acceleration
      className="group relative transform-gpu cursor-pointer overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
      // This inline style fixes the "un-rounding" bug on Chrome/Safari during animations
      style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
      onClick={handleCardClick}
    >
      {/* --- Creative Image Header --- */}
      <div className="relative h-52 w-full overflow-hidden bg-gray-100">
        {/* Hover Gradient & Zoom Effect */}
        <div className="absolute inset-0 z-10 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <img
          src={investment.image || '/investment.jpg'}
          alt={investment.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Badge for Admin Cost */}
        <div className="absolute left-4 top-4 z-20">
          <Badge
            variant="secondary"
            className="rounded-full border border-white/40 bg-theme px-3 py-1 font-medium text-white shadow-sm backdrop-blur-md"
          >
            <PieChart className="mr-1.5 h-3.5 w-3.5" />
            Admin Fee:{' '}
            {investment.adminCost
              ? `${investment.adminCost.toFixed(2)}%`
              : '0%'}
          </Badge>
        </div>

        {/* Hover Action Arrow (Top Right) */}
        <div className="absolute right-4 top-4 z-20 translate-x-12 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-theme text-white shadow-lg">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* --- Card Content --- */}
      <CardContent className="p-6">
        {/* --- Header Row: Title & Edit Button --- */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <h3 className="line-clamp-2 flex-1 text-xl font-bold leading-snug text-black transition-colors group-hover:text-gray-700">
            {investment.title}
          </h3>

          <button
            onClick={(e) => {
              e.stopPropagation(); // Stop card click
              onEdit(investment._id);
            }}
            className="action-button flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-theme text-white shadow-sm transition-all hover:border-theme hover:bg-theme hover:text-white"
            title="Edit Investment"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>

        {/* --- Financial Table --- */}
        <div className="space-y-4">
          {/* Row 1: Target */}
          <div className="group/row flex items-center justify-between">
            <span className="flex items-center text-sm font-medium ">
              <Target className="mr-2 h-4 w-4  transition-colors group-hover/row:text-black" />
              Investment Target
            </span>
            <span className="text-base font-bold text-black">
              {formatCurrency(investment.amountRequired, currency)}
            </span>
          </div>

          <Separator className="bg-gray-100" />

          <div className="group/row flex items-center justify-between">
            <span className="flex items-center text-sm font-medium ">
              <Wallet className="mr-2 h-4 w-4  transition-colors group-hover/row:text-black" />
              Project Amount
            </span>
            <span className="text-base font-bold text-black">
              {formatCurrency(investment.investmentAmount, currency)}
            </span>
          </div>

          {/* Row 3: Due Amount */}
          <div
            className={`mt-4 flex items-center justify-between rounded-xl ${dueBg} border border-transparent p-4 transition-colors group-hover:border-gray-100`}
          >
            <span className="text-sm font-bold uppercase tracking-wide text-black">
              Due Amount
            </span>
            <span className={`text-lg font-black ${dueClass}`}>
              {formatCurrency(dueAmount, currency)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
