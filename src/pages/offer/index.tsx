
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/axios';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Landmark } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface InvestmentOffer {
  _id: string;
  title: string;
  details: string;
  status: 'active' | 'block';
  image?: string;
  documents?: any[];
}

interface InvestmentParticipant {
  _id: string;
  investorId: {
    _id: string;
  };
  investmentId: {
    _id: string;
  };
}

export default function OfferPage() {
  const { user } = useSelector((state: any) => state.auth);
  const [offers, setOffers] = useState<InvestmentOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'block'>('active');

  const [selectedInvestment, setSelectedInvestment] =
    useState<InvestmentOffer | null>(null);
  const [amount, setAmount] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const fetchData = async () => {
    try {
      setLoading(true);

      // Get all investments
      const invRes = await axiosInstance.get('/investments');
      const allInvestments = invRes.data.data?.result;

      // Get all participations
      const partRes = await axiosInstance.get('/investment-participants');
      const participations = partRes.data.data.result;

      const participatedIds = participations
        .filter((p: InvestmentParticipant) => p.investorId._id === user._id)
        .map((p: InvestmentParticipant) => p.investmentId._id);

      const filtered = allInvestments.filter(
        (inv: InvestmentOffer) =>
          inv.status === activeTab && !participatedIds.includes(inv._id)
      );

      setOffers(filtered);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user?._id) fetchData();
  }, [user, activeTab, toast]);

  const handleSubmit = async () => {
    if (!selectedInvestment) return;

    try {
      await axiosInstance.post('/investment-participants', {
        investorId: user._id,
        investmentId: selectedInvestment._id,
        amount,
    
      });

      toast({ title: 'Investment successful!' });
      fetchData();
      setShowModal(false);
      setAmount('');
    
      setSelectedInvestment(null);
    } catch (err) {
      console.error('Error submitting investment:', err);
      toast({
        title: err.response.message || 'Investment successful!',
        className: 'bg-destructive text-white border-none'
      });
    }
  };

  const navigate = useNavigate();
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Your Exclusive Offers
        </h1>
        <div className="mt-6 flex space-x-4">
          {/* <Button
            variant="default"
            onClick={() => setActiveTab('active')}
            className={
              activeTab === 'active' ? 'bg-theme text-white hover:bg-theme' : ''
            }
          >
            Live Offers
          </Button>
          <Button
            variant="default"
            onClick={() => setActiveTab('block')}
            className={
              activeTab === 'block' ? 'bg-theme text-white hover:bg-theme' : ''
            }
          >
            Blocked Offers
          </Button> */}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <Card
              key={offer._id}
              className="flex flex-col transition-shadow hover:shadow-lg"
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {offer.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-grow">
                <div
                  className="prose text-xs"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(offer.details || '')
                  }}
                />
              </CardContent>
              <CardFooter className="mt-auto flex justify-between">
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(`/dashboard/investments/view/${offer._id}`)
                  }
                >
                  More details
                </Button>
                <Button
                  className={`text-white ${activeTab === 'block' ? 'cursor-not-allowed bg-theme' : 'bg-theme hover:bg-theme/90'}`}
                  onClick={() => {
                    if (activeTab !== 'block') {
                      setSelectedInvestment(offer);
                      setShowModal(true);
                    }
                  }}
                  disabled={activeTab === 'block'}
                >
                  Invest now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!loading && offers.length === 0 && (
        <div className="py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Landmark className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No {activeTab === 'active' ? 'live' : 'blocked'} offers available
          </h3>
          <p className="mt-2 text-sm text-gray-800">
            {activeTab === 'active'
              ? 'Check back later for new investment opportunities'
              : 'Currently no blocked offers.'}
          </p>
        </div>
      )}

      {showModal && selectedInvestment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-[90%] max-w-md space-y-4 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">
              Invest in: {selectedInvestment.title}
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setAmount('');
                 
                  setSelectedInvestment(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
