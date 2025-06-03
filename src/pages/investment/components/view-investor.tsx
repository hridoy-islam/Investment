import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoveLeft, Eye, PlusCircle } from 'lucide-react';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import Select from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

interface InvestorParticipant {
  _id: string;
  investorId?: {
    name?: string;
    email?: string;
  };
  investmentId?: {
    title?: string;
  };
}

interface InvestorOption {
  value: string;
  label: string;
}

export default function ViewInvestorPage() {
  const [participants, setParticipants] = useState<InvestorParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [investors, setInvestors] = useState<InvestorOption[]>([]);
  const [selectedInvestor, setSelectedInvestor] =
    useState<InvestorOption | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [project, setProject] = useState<any>(null);

  const { id } = useParams(); // investmentId
  const navigate = useNavigate();

  const fetchParticipants = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/investment-participants`, {
        params: {
          investmentId: id,
          page,
          limit
        }
      });

      setParticipants(res.data.data.result || []);
      setTotalPages(res.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching investment participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async () => {
    try {
      const res = await axiosInstance.get(`/investments/${id}`);

      setProject(res.data.data);
    } catch (error) {
      console.error('Error fetching investors:', error);
    }
  };

  const fetchInvestors = async () => {
    try {
      const res = await axiosInstance.get('/users?role=investor');
      const options = res.data.data.result.map((inv: any) => ({
        value: inv._id,
        label: `${inv.name} (${inv.email})`
      }));
      setInvestors(options);
    } catch (error) {
      console.error('Error fetching investors:', error);
    }
  };

  const onSubmit = async (data: { rate: number }) => {
    if (!selectedInvestor?.value) return;

    setSubmitLoading(true);
    try {
      await axiosInstance.post('/investment-participants', {
        investorId: selectedInvestor.value,
        investmentId: id,
        rate: data.rate
      });
      fetchParticipants(currentPage, entriesPerPage); // Refresh table
      closeModal();
    } catch (error) {
      console.error('Error adding participant:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    fetchInvestors();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvestor(null);
    reset();
  };

  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      rate: 0
    }
  });

  useEffect(() => {
    fetchParticipants(currentPage, entriesPerPage);
    fetchProject();
  }, [currentPage, entriesPerPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold">{project?.title}</h2>
          <h2 className="text-lg font-medium">Investor Participants</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            className="bg-theme text-white hover:bg-theme/90"
            onClick={() => navigate('/dashboard/investments')}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            className="bg-theme text-white hover:bg-theme/90"
            onClick={openModal}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Investor
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md bg-white p-4 shadow-2xl">
        {loading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-theme" />
          </div>
        ) : participants.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No participants found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investor Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Investment Title</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant._id}>
                  <TableCell className="font-medium">
                    {participant.investorId?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {participant.investorId?.email || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {participant.investmentId?.title || 'N/A'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      className="bg-theme text-white hover:bg-theme/90"
                      size="icon"
                      onClick={() =>
                        navigate(
                          `/dashboard/investor/${participant.investorId?._id}`
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

        {/* Pagination */}
        <DataTablePagination
          pageSize={entriesPerPage}
          setPageSize={setEntriesPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Add Investor</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                  Select Investor
                </label>
                <Select
                  options={investors}
                  value={selectedInvestor}
                  onChange={(option) => setSelectedInvestor(option)}
                  placeholder="Search investor..."
                />
              </div>

              {selectedInvestor && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium">
                    Rate (%)
                  </label>
                  <Controller
                    name="rate"
                    control={control}
                    rules={{ required: true, min: 0 }}
                    render={({ field }) => (
                      <input
                        type="number"
                        {...field}
                        className="w-full rounded border px-3 py-2"
                        placeholder="Enter rate"
                        min="0"
                        step="0.01"
                      />
                    )}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={submitLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-theme text-white hover:bg-theme/90"
                  disabled={!selectedInvestor || submitLoading}
                >
                  {submitLoading ? <BlinkingDots size="small" /> : 'Add'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
