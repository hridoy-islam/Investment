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
import { MoveLeft, Eye, PlusCircle, Pen, Wallet } from 'lucide-react';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import Select from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditRateModalOpen, setIsEditRateModalOpen] = useState(false);
  const [editingRateParticipant, setEditingRateParticipant] =
    useState<InvestorParticipant | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState<number | null>(
    null
  );
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  const { id } = useParams(); // investmentId
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (data: {
    amount: number;
    agentCommissionRate: number;
  }) => {
    setSubmitLoading(true);
    setIsSubmitting(true);
    try {
      if (!selectedInvestor?.value) return;

      await axiosInstance.post('/investment-participants', {
        investorId: selectedInvestor.value,
        investmentId: id,
        agentCommissionRate: Number(data.agentCommissionRate),
        amount: Number(data.amount)
      });

      fetchParticipants(currentPage, entriesPerPage);
      toast({
        title: 'Investment Created'
      });
      closeModal();
    } catch (error) {
      console.error('Error submitting participant:', error);
      toast({
        title:
          error?.response?.data?.message ||
          'Failed to add investment participant.',
        className: 'bg-destructive text-white border-none'
      });
      closeModal();
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
    setIsEditMode(false);
    setSelectedInvestor(null);
    reset();
  };

  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      agentCommissionRate: 0,
      amount: 0
    }
  });

  useEffect(() => {
    fetchParticipants(currentPage, entriesPerPage);
    fetchProject();
  }, [currentPage, entriesPerPage]);

  const addedInvestorIds = participants.map((p) => p.investorId?._id);

  {
    /* Filter investors not yet added */
  }
  const filteredInvestorOptions = investors.filter(
    (investor) => !addedInvestorIds.includes(investor.value)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-row gap-2">
          <h2 className="text-xl font-bold">{project?.title}</h2>
          <h2 className="text-xl font-bold">Investor Participants</h2>
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
                <TableHead>Project Name</TableHead>
                <TableHead>Invested Amount</TableHead>
                <TableHead>Share</TableHead>
                <TableHead className="text-center">Add Capital</TableHead>
                <TableHead className="text-center">
                  Agent Commission %
                </TableHead>
                <TableHead className="text-right">Transaction Log</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant._id}>
                  <TableCell className="font-medium">
                    {participant.investorId?.name || 'N/A'}{' '}
                    <Badge
                      className={`rounded-full px-2 py-1 text-xs font-semibold 
    ${participant.status === 'active' ? 'bg-green-100 text-green-700' : ''}
    ${participant.status === 'block' ? 'bg-red-100 text-red-700' : ''}
  `}
                    >
                      {participant.status === 'active' ? 'Active' : 'Close'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {participant.investorId?.email || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {participant.investmentId?.title || 'N/A'}
                  </TableCell>
                  <TableCell>
                    £
                    {typeof participant?.amount === 'number'
                      ? participant.amount.toFixed(2)
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {participant?.projectShare != null
                      ? `${participant.projectShare.toFixed(2)}%`
                      : '—'}
                  </TableCell>

                  <TableCell className="text-center">
                    <Dialog
                      open={participant._id === openDialogId}
                      onOpenChange={(isOpen) =>
                        setOpenDialogId(isOpen ? participant._id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          className="bg-blue-500 text-white hover:bg-blue-600"
                          onClick={() => setOpenDialogId(participant._id)}
                        >
                          <Wallet className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Raise Fund For{' '}
                            {participant.investorId?.name || 'N/A'}
                          </DialogTitle>
                        </DialogHeader>

                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            setIsSubmitting(true);
                            const form = e.currentTarget;
                            const formData = new FormData(form);
                            const amountToAdd = parseFloat(
                              formData.get('extraAmount') as string
                            );

                            if (isNaN(amountToAdd) || amountToAdd <= 0) {
                              toast({
                                title: 'Invalid amount',
                                description:
                                  'Please enter a valid amount greater than 0',
                                variant: 'destructive'
                              });
                              setIsSubmitting(false);
                              return;
                            }

                            try {
                              const res = await axiosInstance.patch(
                                `/investment-participants/${participant._id}`,
                                {
                                  amount: amountToAdd
                                }
                              );
                              const updatedParticipant = res.data.data;

                              toast({
                                title: 'Success',
                                description:
                                  'Additional investment added successfully',
                                className: 'bg-theme border-none text-white'
                              });

                              setOpenDialogId(null); // Close dialog
                              setParticipants((prev) =>
                                prev.map((p) =>
                                  p._id === participant._id
                                    ? {
                                        ...p,
                                        amount: updatedParticipant.amount,
                                        projectShare:
                                          updatedParticipant.projectShare
                                      }
                                    : p
                                )
                              );
                            } catch (error) {
                              toast({
                                title:
                                  error.response?.data?.message ||
                                  'Failed to add more capital',
                                variant: 'destructive'
                              });
                              setOpenDialogId(null);
                            } finally {
                              setIsSubmitting(false);
                            }
                          }}
                          className="space-y-4 pt-4"
                        >
                          <div>
                            <Label htmlFor="extraAmount">Amount (£)</Label>
                            <Input
                              name="extraAmount"
                              id="extraAmount"
                              type="number"
                              step="any"
                              min="0"
                              placeholder="Enter amount"
                            />
                          </div>

                          <DialogFooter className="flex justify-end gap-2">
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline">
                                Cancel
                              </Button>
                            </DialogTrigger>
                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="bg-theme text-white hover:bg-theme/90"
                            >
                              Submit
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex flex-row items-center justify-center gap-4">
                      <p>{`${participant?.agentCommissionRate}%` || '-'} </p>
                      <Button
                        variant="ghost"
                        className="bg-theme text-white hover:bg-theme/90"
                        size="icon"
                        onClick={() => {
                          setEditingRateParticipant(participant);
                          setNewCommissionRate(
                            participant.agentCommissionRate || 0
                          );
                          setIsEditRateModalOpen(true);
                        }}
                      >
                        <Pen className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>

                  <TableCell className=" gap-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        navigate(
                          `/dashboard/investor/projects/account-history/${participant._id}`
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
        <div className="fixed inset-0 -top-8 z-[10000] flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Add Investor</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                  Select Investor
                </label>
                <Select
                  options={filteredInvestorOptions}
                  value={selectedInvestor}
                  onChange={(option) => setSelectedInvestor(option)}
                  placeholder="Search investor..."
                />
              </div>

              {selectedInvestor && (
                <div>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium">
                      Amount (&pound;)
                    </label>
                    <Controller
                      name="amount"
                      control={control}
                      rules={{ required: true, min: 0 }}
                      render={({ field }) => (
                        <input
                          type="number"
                          {...field}
                          className="w-full rounded border border-gray-300 px-3 py-2"
                          placeholder="Enter Amount"
                          min="0"
                          step="0.01"
                        />
                      )}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium">
                      Agent Commission (%)
                    </label>
                    <Controller
                      name="agentCommissionRate"
                      control={control}
                      rules={{ required: true, min: 0 }}
                      render={({ field }) => (
                        <input
                          type="number"
                          {...field}
                          className="w-full rounded border border-gray-300 px-3 py-2"
                          placeholder="Enter commission rate"
                          min="0"
                          step="0.01"
                        />
                      )}
                    />
                  </div>
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
                  disabled={(!selectedInvestor && !isEditMode) || submitLoading}
                >
                  {submitLoading ? <BlinkingDots size="small" /> : 'Add'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditRateModalOpen && editingRateParticipant && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">
              Edit Agent Commission Rate
            </h3>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Agent Commission Rate (%)
              </label>
              <input
                type="number"
                value={newCommissionRate === null ? '' : newCommissionRate}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewCommissionRate(value === '' ? null : Number(value));
                }}
                min="0"
                step="0.01"
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditRateModalOpen(false);
                  setEditingRateParticipant(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-theme text-white hover:bg-theme/90"
                onClick={async () => {
                  try {
                    await axiosInstance.patch(
                      `/investment-participants/${editingRateParticipant._id}`,
                      { agentCommissionRate: Number(newCommissionRate) }
                    );
                    setParticipants((prev) =>
                      prev.map((p) =>
                        p._id === editingRateParticipant._id
                          ? {
                              ...p,
                              agentCommissionRate: Number(newCommissionRate)
                            }
                          : p
                      )
                    );
                    setIsEditRateModalOpen(false);
                    setEditingRateParticipant(null);
                  } catch (error) {
                    console.error('Error updating commission rate:', error);
                  }
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
