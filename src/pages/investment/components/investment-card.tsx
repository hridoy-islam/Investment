import { TrendingUp, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Minimal interface subset needed by the card's rendering
interface Investment {
  _id: string;
  title: string;
  image: string | null;
  amountRequired: number;
  investmentAmount: number;
  adminCost: number;
//   status: 'active' | 'block';
  currencyType: string;
  saleAmount?: number;
}

interface InvestmentCardProps {
  investment: Investment;
  onViewDetails: (id: string) => void;
  // NOTE: Keeping this prop signature exactly as in your provided code
  formatCurrency: (amount: number, currencyCode: string) => string; 
}

// NOTE: All previously planned action dependencies like 'onRefresh' etc., are now REMOVED
export function InvestmentCard({
  investment,
  onViewDetails,
  formatCurrency,
}: InvestmentCardProps) {
  const dueAmount = (investment.investmentAmount || 0) - (investment.amountRequired || 0);
  const currency = investment.currencyType || 'GBP';
  const dueClass = dueAmount <= 0 ? 'text-green-600' : 'text-red-600';

  const handleCardClick = (e: React.MouseEvent) => {
    // Only view details when clicking on card body, not buttons.
    // NOTE: This logic now points to nothing, but keeping as is for future-proofing.
    if ((e.target as HTMLElement).closest('.action-button')) {
      return;
    }
    onViewDetails(investment._id);
  };


  return (
    <Card 
      className="group relative overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Card Image */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100">
        {investment.image ? (
          <img
            src={investment.image}
            alt={investment.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <TrendingUp className="h-20 w-20 text-orange-300" />
          </div>
        )}
        
        {/* Status Badge - Top Right (FIX: Removed the explicit 'Active/Inactive' text label) */}
        {/* <div className="absolute right-3 top-3">
          <Badge
            className={`
                h-6 w-6 p-0 flex items-center justify-center rounded-full text-white
                ${
                    investment.status === 'active'
                    ? 'bg-green-500' // Show just a solid color badge
                    : 'bg-gray-500'
                }`}
            title={investment.status === 'active' ? 'Active' : 'Block'}
          >
              <span className="sr-only">{investment.status === 'active' ? 'Active' : 'Blocked'}</span>
          </Badge>
        </div> */}
      </div>

      {/* Card Content */}
      <CardContent className="p-6">
        {/* Project Title */}
        <h3 className="mb-4 text-xl font-semibold text-gray-900 line-clamp-2">
          {investment.title}
        </h3>

        {/* Financial Grid */}
        <div className="space-y-3 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Investment Target</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(investment.amountRequired, currency)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Admin Cost</span>
            <span className="font-medium text-gray-900">
              {investment.adminCost ? `${investment.adminCost.toFixed(2)}%` : '0%'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Paid</span>
            <span className="font-semibold text-blue-600">
              {formatCurrency(investment.investmentAmount, currency)}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-sm font-semibold text-gray-900">Due Amount</span>
            <span className={`font-bold ${dueClass}`}>
              {formatCurrency(dueAmount, currency)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}