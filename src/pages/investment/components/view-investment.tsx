import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useEffect, useState } from 'react';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { MoveLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types
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
        setInvestment(response.data.data); // as per your backend structure
      } catch (err) {
        console.error('Error fetching investment:', err);
        setError('Failed to load investment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvestment();
  }, [id]);

  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <BlinkingDots size="large" color="bg-theme" />
      </div>
    );
  }

  if (error || !investment) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center text-red-500">
        <p>{error || 'Investment not found.'}</p>
        <Link to="/dashboard" className="text-blue-500 underline">
          Back to Investments
        </Link>
      </div>
    );
  }

  return (
    <div className=" mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
        <div className="mb-6  flex flex-col justify-start gap-4 md:flex-row md:items-center">
          <h1 className="text-2xl font-bold">{investment.title}</h1>
          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
              investment.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            } md:mt-0`}
          >
            {investment.status.charAt(0).toUpperCase() +
              investment.status.slice(1)}
          </span>
        </div>
        {/* Back Button */}
        <Button
          onClick={() => navigate('/dashboard/investments')}
          className="mb-6 inline-flex items-center bg-theme text-sm font-medium text-white hover:bg-theme/90"
        >
          <MoveLeft /> Back to Investments
        </Button>
      </div>

      {/* Image Section */}
      <div className="mb-6 overflow-hidden rounded-lg   shadow-sm">
        {investment.image ? (
          <img
            src={investment.image}
            alt={investment.title}
            className="h-64 w-full object-cover"
          />
        ) : (
          <div className="flex h-64 items-center justify-center bg-gray-100 text-gray-500">
            No Image Available
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="mb-8  p-6 ">
        <h2 className="mb-4 text-xl font-semibold">Investment Details</h2>
        <div
          className="prose max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: investment.details || '' }}
        />{' '}
      </div>

      {/* Documents Section */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Documents</h2>
        {investment.documents && investment.documents.length > 0 ? (
          <ul className="space-y-2">
            {investment.documents.map((doc, index) => (
              <li key={index}>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {doc.name || 'Document'}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No documents available.</p>
        )}
      </div>
    </div>
  );
}
