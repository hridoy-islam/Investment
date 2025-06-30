import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { Button } from '@/components/ui/button';
import { MoveLeft, Wallet } from 'lucide-react';

export default function ReferralPage() {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchData = async (pageNumber = 1, limit = 10, searchTerm = '') => {
    try {
      // Fetch agent by ID
      const agentRes = await axiosInstance.get(`/users/${id}`);
      setAgent(agentRes.data?.data);

      // Fetch referrals linked to this agent
      const referralRes = await axiosInstance.get(`/users?agent=${id}`, {
        params: {
          page: pageNumber,
          limit,
          ...(searchTerm ? { searchTerm: searchTerm } : {})
        }
      });
      setReferrals(referralRes.data?.data?.result || []);
      setTotalPages(referralRes.data.data.meta.totalPage || 1);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData(currentPage, entriesPerPage);
    }
  }, [id, currentPage, entriesPerPage]);
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent>
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-2 py-4">
            {agent && (
              <p className="text-xl font-semibold">Agent: {agent?.name} Referrals</p>
            )}
            
          </div>
          <div>
            <Button
              className="border-none bg-theme text-white hover:bg-theme/90"
              size={'sm'}
              onClick={() => navigate('/dashboard/agents')}
            >
              <MoveLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>

        {loading ? (
          <BlinkingDots size="large" color="bg-theme" />
        ) : referrals.length === 0 ? (
          <p>No referrals found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Account History</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((user, index) => (
                <TableRow key={user?._id}>
                  <TableCell>{user?.name}</TableCell>
                  <TableCell>{user?.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        navigate(
                          `/dashboard/agents/referral/account-history/${user._id}`
                        )
                      }
                      className="hover:bg-indigo/90 bg-lime-600 text-white"
                    >
                      <Wallet className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {referrals.length > 0 && (
          <DataTablePagination
            pageSize={entriesPerPage}
            setPageSize={setEntriesPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </CardContent>
    </Card>
  );
}
