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
import { Eye, MoveLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';

export default function InvestmentProjectPage() {
  const { id } = useParams();
  const [investor, setInvestor] = useState(null);
  const [projects, setprojects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
const {toast} = useToast()
  const fetchData = async (pageNumber = 1, limit = 10, searchTerm = '') => {
    try {
      // Fetch agent by ID
      const agentRes = await axiosInstance.get(`/users/${id}`);
      setInvestor(agentRes.data?.data);

      // Fetch referrals linked to this agent
      const referralRes = await axiosInstance.get(
        `/investment-participants?investorId=${id}`,
        {
          params: {
            page: pageNumber,
            limit,
            ...(searchTerm ? { searchTerm: searchTerm } : {})
          }
        }
      );
      setprojects(referralRes.data?.data?.result || []);
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

  
    const handleStatusChange = async (id, status) => {
      try {
        const updatedStatus = status ? "active" : "block";
        await axiosInstance.patch(`/investment-participants/${id}`, { status: updatedStatus });
        toast({ title: "Investor status successfully", className: "bg-theme border-none text-white", });
        fetchData(currentPage, entriesPerPage);
      } catch (error) {
        console.error("Error updating status:", error);
      }
    };


  return (
    <Card>
      <CardContent>
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-2 py-4">
            {investor && (
              <p className="text-xl font-semibold">
                Investor: {investor?.name}
              </p>
            )}
            <h1 className="text-xl font-semibold">Project List</h1>
          </div>
          <div>
            <Button
              className="border-none bg-theme text-white hover:bg-theme/90"
              size={'sm'}
              onClick={() => navigate('/dashboard/investors')}
            >
              <MoveLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
        {loading ? (
          <BlinkingDots size="large" color="bg-theme" />
        ) : projects.length === 0 ? (
          <p>No Projects found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Title</TableHead>
                <TableHead>Investment Amount</TableHead>
                <TableHead>Profit Rate</TableHead>
                <TableHead>Account History</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project, index) => (
                <TableRow key={project?._id}>
                  <TableCell
                    onClick={() =>
                      navigate(
                        `/dashboard/investments/view/${project?.investmentId?._id}`
                      )
                    }
                  >
                    {project?.investmentId?.title}
                  </TableCell>
                  <TableCell
                    onClick={() =>
                      navigate(
                        `/dashboard/investments/view/${project?.investmentId?._id}`
                      )
                    }
                  >
                    £{project?.amount}
                  </TableCell>
                  <TableCell
                    onClick={() =>
                      navigate(
                        `/dashboard/investments/view/${project?.investmentId?._id}`
                      )
                    }
                  >
                    {project?.rate}%
                  </TableCell>
                  <TableCell><Button onClick={()=> navigate(`/dashboard/investor/projects/account-history/${project?._id}`)} className='bg-theme text-white hover:bg-theme/90'>View</Button></TableCell>
                  <TableCell className="text-center">
                   <Switch
                     checked={project.status === 'active'}
                     onCheckedChange={(checked) =>
                       handleStatusChange(project._id, checked)
                     }
                     className="mx-auto"
                   />
                 </TableCell>
                  <TableCell className="text-right">
                    {' '}
                    <Button
                      variant="ghost"
                      className="border-none bg-theme text-white hover:bg-theme/90"
                      size="icon"
                      onClick={() =>
                        navigate(
                          `/dashboard/investments/view/${project?.investmentId?._id}`
                        )
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {projects.length > 0 && (
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
