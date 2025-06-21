import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '@/lib/axios';
import { useNavigate } from 'react-router-dom';

export function InvestorDashboard({ user }) {
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [totalDue, setTotalDue] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    const fetchInvestmentData = async () => {
      try {
        // Await the response to make sure we get the actual data
        const response = await axiosInstance.get(
          `/investment-participants?investorId=${user._id}&limit=all`
        );
        const data = response?.data?.data;

        if (data) {
          const totalProjects = data?.meta?.total; // Get total projects from meta
          const totalAmount = data.result.reduce(
            (sum, participant) => sum + participant.amount,
            0
          ); // Sum all amounts
          const totalDue = data.result.reduce(
            (sum, participant) => sum + participant.totalDue,
            0
          );
          const totalPaid = data.result.reduce(
            (sum, participant) => sum + participant.totalPaid,
            0
          );
          setTotalProjects(totalProjects);
          setTotalAmount(totalAmount);
          setTotalDue(totalDue);
          setTotalPaid(totalPaid);
        }
      } catch (error) {
        console.error('Error fetching investment participants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestmentData();
  }, [user._id]);

  return (
    <div className="p-6">
      {/* Welcome message */}
      <motion.h1
        className="mb-2 text-3xl font-bold text-gray-800"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Welcome back, {user?.name || 'Investor'}!
      </motion.h1>

      <motion.p
        className="mb-6 text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Here’s an overview of your investments and project activity.
      </motion.p>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Total Projects Card */}
        <motion.div
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          onClick={() => navigate('/dashboard/investor/projects')}
        >
          <h2 className="mb-2 text-lg font-semibold text-gray-700">
            Total Projects
          </h2>
          {loading ? (
            <p className="text-3xl font-bold text-gray-400">Loading...</p>
          ) : (
            <p className="text-3xl font-bold text-orange-400">
              {totalProjects}
            </p>
          )}
        </motion.div>

        {/* Total Invested Amount */}
        <motion.div
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          onClick={() => navigate('/dashboard/investor/projects')}
        >
          <h2 className="mb-2 text-lg font-semibold text-gray-700">
            Total Invested
          </h2>
          {loading ? (
            <p className="text-3xl font-bold text-gray-400">Loading...</p>
          ) : (
            <p className="text-3xl font-bold text-orange-400">
              £{totalAmount.toLocaleString()}
            </p>
          )}
        </motion.div>
        <motion.div
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <h2 className="mb-2 text-lg font-semibold text-gray-700">
            Total Due
          </h2>
          {loading ? (
            <p className="text-3xl font-bold text-gray-400">Loading...</p>
          ) : (
            <p className="text-3xl font-bold text-orange-400">
              £{totalDue.toLocaleString()}
            </p>
          )}
        </motion.div>
        <motion.div
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <h2 className="mb-2 text-lg font-semibold text-gray-700">
            Total Paid
          </h2>
          {loading ? (
            <p className="text-3xl font-bold text-gray-400">Loading...</p>
          ) : (
            <p className="text-3xl font-bold text-orange-400">
              £{totalPaid.toLocaleString()}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
