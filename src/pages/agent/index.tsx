import { useEffect, useState } from 'react';
import { Plus, Pen, MoveLeft, User2, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { AgentDialog } from './components/agent-dialog';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export default function AgentPage() {
  const [agents, setAgents] = useState<any>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchData = async (page, entriesPerPage, searchTerm = '') => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/users?role=agent`, {
        params: {
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {})
        }
      });
      setAgents(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  const handleSubmit = async (data) => {
    try {
      // Create payload and remove empty password field if necessary
      const payload = { ...data, role: 'agent' };

      if (payload.password === '') {
        delete payload.password;
      }

      let response;

      if (editingAgent) {
        // Remove password from update data regardless of value

        response = await axiosInstance.patch(
          `/users/${editingAgent?._id}`,
          payload
        );
      } else {
        response = await axiosInstance.post(`/auth/signup`, payload);
      }

      if (response.data && response.data.success === true) {
        toast({
          title: response.data.message || 'Investor created successfully',
          className: 'bg-theme border-none text-white'
        });
      } else if (response.data && response.data.success === false) {
        toast({
          title: response.data.message || 'Operation failed',
          className: 'bg-red-500 border-none text-white'
        });
      } else {
        toast({
          title: 'Unexpected response. Please try again.',
          className: 'bg-red-500 border-none text-white'
        });
      }

      // Refresh data
      fetchData(currentPage, entriesPerPage);
      setEditingAgent(undefined); // Reset editing state
    } catch (error) {
      toast({
        title: 'An error occurred. Please try again.',
        className: 'bg-red-500 border-none text-white'
      });
    }
  };

  const handleSearch = () => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  };

  const handleStatusChange = async (id, status) => {
    try {
      const updatedStatus = status ? 'active' : 'block';
      await axiosInstance.patch(`/users/${id}`, { status: updatedStatus });
      toast({
        title: 'Record updated successfully',
        className: 'bg-theme border-none text-white'
      });
      fetchData(currentPage, entriesPerPage);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEdit = (data) => {
    setEditingAgent(data);
    setDialogOpen(true);
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage); // Refresh data
  }, [currentPage, entriesPerPage]);

  const navigate = useNavigate();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-2xl font-semibold">Agent List</h1>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email"
              className="h-8 max-w-[400px]"
            />
            <Button
              onClick={handleSearch}
              size="sm"
              className="min-w-[100px] border-none bg-theme text-white hover:bg-theme/90"
            >
              Search
            </Button>
          </div>
        </div>
        <div className="flex flex-row items-center gap-4">
          <Button
            className="border-none bg-theme text-white hover:bg-theme/90"
            size={'sm'}
            onClick={() => navigate('/dashboard')}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            className="border-none bg-theme text-white hover:bg-theme/90"
            size={'sm'}
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Agent
          </Button>
        </div>
      </div>

      <div className="rounded-md bg-white p-4 shadow-2xl">
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-theme" />
          </div>
        ) : agents.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No records found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className='text-center'>View Referral</TableHead>
                <TableHead className="w-32 text-center">Status</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent._id}>
                  <TableCell>{agent.name}</TableCell>
                  <TableCell>{agent.email}</TableCell>
                  <TableCell className='text-center'>
                    <Button
                    size="icon"
                      className="hover:bg-thmem/90 bg-theme text-white"
                      onClick={() =>
                        navigate(`/dashboard/agents/referral/${agent?._id}`)
                      }
                    >
                      <Users2 className='h-4 w-4'/>
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Switch
                        checked={agent.status === 'active'}
                        onCheckedChange={(checked) =>
                          handleStatusChange(agent._id, checked)
                        }
                        className="mx-auto"
                      />
                      <Badge
                        className={`rounded-full px-2 py-1 text-xs font-semibold transition-colors ${
                          agent.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {agent.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      className="border-none bg-theme text-white hover:bg-theme/90"
                      size="icon"
                      onClick={() => handleEdit(agent)}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <DataTablePagination
          pageSize={entriesPerPage}
          setPageSize={setEntriesPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <AgentDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingAgent(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={editingAgent}
      />
    </div>
  );
}
