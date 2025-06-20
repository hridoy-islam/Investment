import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useEffect, useState } from 'react';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import {
  MoveLeft,
  FileText,
  ExternalLink,
  Info,
  AlertCircle,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Document {
  name?: string;
  url?: string;
}

interface Investment {
  title: string;
  image?: string;
  details: string;
  status: 'active' | 'block';
  documents: Document[];
  returnRate?: string;
  minInvestment?: string;
  term?: string;
}

export default function ViewInvestmentPage() {
  const { id } = useParams<{ id: string }>();
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvestment = async () => {
      try {
        const response = await axiosInstance.get(`/investments/${id}`);
        console.log('Investment data:', response.data);
        setInvestment(response.data.data);
      } catch (err) {
        console.error('Error fetching investment:', err);
        setError('Failed to load investment details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInvestment();
    } else {
      setError('Investment ID is missing');
      setLoading(false);
    }
  }, [id]);

  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="text-center">
          <BlinkingDots
            size="large"
            color="bg-gradient-to-r from-orange-500 to-orange-700"
          />
        </div>
      </div>
    );
  }

  if (error || !investment) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">
            Oops! Something went wrong
          </h2>
          <p className="mb-6 text-lg text-red-600">
            {error || 'Investment not found.'}
          </p>
          <div
            onClick={() => navigate(-1)}
            className="inline-flex items-center rounded-lg bg-orange-400 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600"
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className=" px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-6 rounded-xl border border-white/20 text-slate-600 backdrop-blur-sm hover:bg-white/50 hover:text-slate-900"
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="mb-4 text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
                {investment.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4">
                <span
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-sm ${
                    investment.status === 'active'
                      ? 'border border-emerald-200/50 bg-emerald-100/80 text-emerald-800'
                      : 'border border-red-200/50 bg-red-100/80 text-red-800'
                  }`}
                >
                  <div
                    className={`mr-2 h-2 w-2 rounded-full ${
                      investment.status === 'active'
                        ? 'bg-emerald-500'
                        : 'bg-red-500'
                    }`}
                  />
                  {investment.status === 'active'
                    ? 'Actively Earning'
                    : 'Currently Blocked'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Media Gallery */}

            <div className="relative">
              <div className="rounded-3xl border border-white/20 bg-white/80  shadow-xl backdrop-blur-sm">
                <div className="group relative cursor-pointer">
                  <img
                    src={investment.image || '/project.jpg'}
                    alt={investment.title}
                    className="h-72 w-full transform rounded-3xl object-cover shadow-lg transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Investment Details */}
            <div className="">
              <div className="py-8">
                {investment.details ? (
                  <div
                    className="prose prose-lg prose-slate max-w-none leading-relaxed text-slate-700"
                    dangerouslySetInnerHTML={{ __html: investment.details }}
                  />
                ) : (
                  <div className="py-12 text-center">
                    <Info className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                    <p className="text-lg text-slate-500">
                      No detailed information available for this investment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Documents */}
            <div className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
              <h3 className="mb-6 flex items-center text-xl font-bold text-slate-900">
                <FileText className="mr-2 h-5 w-5 text-orange-400" />
                Investment Documents
              </h3>
              {investment.documents && investment.documents.length > 0 ? (
                <div className="space-y-3">
                  {investment.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="rounded-xl bg-indigo-100 p-3 transition-colors duration-200 group-hover:bg-indigo-200">
                          <FileText className="h-5 w-5 text-orange-400" />
                        </div>
                        <div>
                          <span className="block font-semibold text-slate-900">
                            {doc.name || 'Investment Document'}
                          </span>
                          <span className="text-sm text-slate-500">
                            PDF Document
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Download className="h-4 w-4 text-slate-400 transition-colors duration-200 group-hover:text-orange-400" />
                        <ExternalLink className="h-4 w-4 text-slate-400 transition-colors duration-200 group-hover:text-orange-400" />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  <FileText className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                  <p className="font-medium">No documents available</p>
                  <p className="text-sm">
                    Documents will appear here when uploaded
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full rounded-2xl bg-gradient-to-r from-orange-400 to-orange-600 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:from-orange-600 hover:to-orange-600 hover:shadow-xl">
                <FileText className="mr-2 h-5 w-5" />
                View Terms & Conditions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
