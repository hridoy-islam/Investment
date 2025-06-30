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
import {
  ArrowLeftRight,
  Eye,
  FolderClock,
  MoveLeft,
  Pen,
  Plus,
  Wallet
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from 'react-select'; // Import React Select

// Zod schema for validation
const addInvestmentSchema = z.object({
  investmentId: z.string().min(1, 'Please select a project'),
  amount: z.number().positive('Amount must be greater than zero'),
  agentCommissionRate: z.number().nonnegative('Must be 0 or greater')
});
type AddInvestmentFormData = z.infer<typeof addInvestmentSchema>;

export default function InvestmentProjectPage() {
  const { id } = useParams(); // investor ID from URL
  const [investor, setInvestor] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [allInvestments, setAllInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(
    null
  );
  const { toast } = useToast();
  const navigate = useNavigate();
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  // Form hook with validation
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<AddInvestmentFormData>({
    resolver: zodResolver(addInvestmentSchema),
    defaultValues: {
      investmentId: '',
      amount: 0,
      agentCommissionRate: 0
    }
  });

  // Fetch data for current page
  const fetchData = async (pageNumber = 1, limit = 10, searchTerm = '') => {
    try {
      const agentRes = await axiosInstance.get(`/users/${id}`);
      setInvestor(agentRes.data?.data);

      const referralRes = await axiosInstance.get(
        `/investment-participants?investorId=${id}`,
        {
          params: {
            page: pageNumber,
            limit,
            ...(searchTerm ? { searchTerm } : {})
          }
        }
      );

      setProjects(referralRes.data?.data?.result || []);
      setTotalPages(referralRes.data.data.meta.totalPage || 1);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestments = async () => {
    try {
      const [investmentsRes, participantsRes] = await Promise.all([
        axiosInstance.get('/investments'),
        axiosInstance.get(`/investment-participants?investorId=${id}`)
      ]);

      const all = investmentsRes.data?.data.result || [];
      const existing = participantsRes.data?.data?.result || [];

      // Get list of investment IDs already associated with this investor
      const existingInvestmentIds = new Set(
        existing.map((p: any) => p.investmentId?._id)
      );

      // Filter out those already linked
      const available = all.filter(
        (inv: any) => !existingInvestmentIds.has(inv._id)
      );

      setAllInvestments(available);
    } catch (error) {
      toast({
        title:
          error?.response?.data?.message ||
          'Failed to load investment projects.',
        className: 'bg-destructive text-white border-none'
      });
    }
  };

  const handleInvestmentSelect = (investmentId: string) => {
    setSelectedInvestment(investmentId);
    setValue('investmentId', investmentId);
  };

  const handleStatusChange = async (projectId: string, status: boolean) => {
    try {
      const updatedStatus = status ? 'active' : 'block';
      await axiosInstance.patch(`/investment-participants/${projectId}`, {
        status: updatedStatus
      });

      toast({
        title: 'Investor status successfully updated',
        className: 'bg-theme border-none text-white'
      });

      fetchData(currentPage, entriesPerPage);
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update investor status.',
        variant: 'destructive'
      });
    }
  };

  const handleAddProjectClick = () => {
    setSelectedInvestment(null);
    reset({ investmentId: '', amount: 0 });
    fetchInvestments();
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: AddInvestmentFormData) => {
    try {
      await axiosInstance.post('/investment-participants', {
        investmentId: data.investmentId,
        investorId: id,
        amount: data.amount,
        agentCommissionRate: data.agentCommissionRate
      });

      toast({
        title: 'Success',
        description: 'Project added successfully.',
        className: 'bg-theme border-none text-white'
      });

      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title:
          error.response?.data?.message || 'Failed to add investment project.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (id) {
      fetchData(currentPage, entriesPerPage);
    }
  }, [id, currentPage, toast, isDialogOpen, entriesPerPage]);

  return (
    <Card>
      <CardContent>
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-2 py-4">
           
              <p className="text-xl font-semibold">
                Investor: {investor?.name} Project List
              </p>
          
          </div>
          <div className="flex flex-row items-center gap-4">
            <Button
              size="sm"
              className="border-none bg-theme text-white hover:bg-theme/90"
              onClick={() => {
                handleAddProjectClick();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Projects
            </Button>

            {/* Custom Modal */}
            {isDialogOpen && (
              <div
                className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50"
                onClick={() => setIsDialogOpen(false)}
              >
                <div
                  className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="mb-4 text-lg font-semibold">
                    Add New Project
                  </h3>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="investmentId">
                        Select Investment Project
                      </Label>
                      <Select
                        options={allInvestments.map((inv) => ({
                          value: inv._id,
                          label: inv.title
                        }))}
                        onChange={(option) =>
                          handleInvestmentSelect(option?.value ?? '')
                        }
                        placeholder="Select an investment..."
                        isSearchable
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          menu: (base) => ({ ...base, zIndex: 9999 }),
                          control: (base) => ({ ...base, zIndex: 'auto' })
                        }}
                      />
                      {errors.investmentId && (
                        <p className="text-sm text-red-500">
                          {errors.investmentId.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Investment Amount (£)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="any"
                        {...register('amount', { valueAsNumber: true })}
                        placeholder="Enter amount"
                      />
                      {errors.amount && (
                        <p className="text-sm text-red-500">
                          {errors.amount.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Agent Commission(%)</Label>
                      <Input
                        id="agentCommissionRate"
                        type="number"
                        step="any"
                        {...register('agentCommissionRate', {
                          valueAsNumber: true
                        })}
                        placeholder="Enter Percentage"
                      />

                      {errors.agentCommissionRate && (
                        <p className="text-sm text-red-500">
                          {errors.agentCommissionRate.message}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-theme text-white hover:bg-theme/90"
                      >
                        Submit
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

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
                <TableHead>Share</TableHead>
                <TableHead className="text-center">
                  Agent Commission (%)
                </TableHead>

                <TableHead className="text-center">Add Capital</TableHead>
                <TableHead className="text-center">Account History</TableHead>
                <TableHead className="text-center">Project Details</TableHead>
                <TableHead className="w-32 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
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
                    {project?.investmentId?.amountRequired
                      ? `${((100 * project?.amount) / project?.investmentId?.amountRequired).toFixed(2)}%`
                      : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-4">
                      <p className="font-medium">
                        {project.agentCommissionRate ?? '—'}%
                      </p>
                      <Dialog
                        open={openDialogId === `commission-${project._id}`}
                        onOpenChange={(isOpen) =>
                          setOpenDialogId(
                            isOpen ? `commission-${project._id}` : null
                          )
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="icon"
                            className="bg-rose-500 text-white hover:bg-rose-500/90"
                            onClick={() =>
                              setOpenDialogId(`commission-${project._id}`)
                            }
                          >
                            <Pen className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Agent Commission</DialogTitle>
                          </DialogHeader>

                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              const newRate = parseFloat(
                                formData.get('newCommission') as string
                              );

                              if (isNaN(newRate) || newRate < 0) {
                                toast({
                                  title: 'Invalid commission rate',
                                  description: 'Enter a valid number ≥ 0',
                                  variant: 'destructive'
                                });
                                return;
                              }

                              try {
                                await axiosInstance.patch(
                                  `/investment-participants/${project._id}`,
                                  {
                                    agentCommissionRate: newRate
                                  }
                                );

                                toast({
                                  title: 'Success',
                                  description: 'Commission rate updated.',
                                  className: 'bg-theme border-none text-white'
                                });

                                setOpenDialogId(null);
                                fetchData(currentPage, entriesPerPage); // refresh
                              } catch (error) {
                                toast({
                                  title: 'Error',
                                  description: 'Failed to update commission.',
                                  variant: 'destructive'
                                });
                              }
                            }}
                            className="space-y-4 pt-4"
                          >
                            <div className="flex flex-col items-start gap-4">
                              <Label htmlFor="newCommission">
                                Agent Commission (%)
                              </Label>
                              <Input
                                id="newCommission"
                                name="newCommission"
                                type="number"
                                step="any"
                                defaultValue={
                                  project?.agentCommissionRate ?? ''
                                }
                                placeholder="Enter commission rate"
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
                                className="bg-theme text-white hover:bg-theme/90"
                              >
                                Update
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <Dialog
                      open={project._id === openDialogId}
                      onOpenChange={(isOpen) =>
                        setOpenDialogId(isOpen ? project._id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          className="bg-blue-500 text-white hover:bg-blue-600"
                          onClick={() => setOpenDialogId(project._id)}
                        >
                          <Wallet className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Raise Fund</DialogTitle>
                          <DialogTitle>Investor Name: {investor?.name || ''}</DialogTitle>
                        </DialogHeader>

                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();

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
                              return;
                            }

                            try {
                              await axiosInstance.patch(
                                `/investment-participants/${project._id}`,
                                {
                                  amount: amountToAdd
                                }
                              );

                              toast({
                                title: 'Success',
                                description:
                                  'Additional investment added successfully',
                                className: 'bg-theme border-none text-white'
                              });

                              setOpenDialogId(null); // Close dialog
                              fetchData(currentPage, entriesPerPage); // Refresh data
                            } catch (error) {
                              toast({
                                title:
                                  error.response?.data?.message ||
                                  'Failed to add more capital',
                                variant: 'destructive'
                              });
                               setOpenDialogId(null);
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
                    <Button
                      size="icon"
                      onClick={() =>
                        navigate(
                          `/dashboard/investor/projects/account-history/${project?._id}`
                        )
                      }
                      className="bg-emerald-500 text-white hover:bg-emerald-500/90"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
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
                  <TableCell className="flex flex-row items-center gap-1 text-center">
                    <Switch
                      checked={project.status === 'active'}
                      onCheckedChange={(checked) =>
                        handleStatusChange(project._id, checked)
                      }
                      className="mx-auto"
                    />
                    <Badge
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      {project.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
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
