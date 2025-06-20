import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from "@/lib/axios";
import { useNavigate } from 'react-router-dom';

export function InvestorDashboard({ user }) {
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
const navigate = useNavigate()
  useEffect(() => {
    const fetchInvestmentData = async () => {
      try {
        // Await the response to make sure we get the actual data
        const response = await axiosInstance.get(`/investment-participants?investorId=${user._id}&limit=all`);
        const data = response?.data?.data;

        if (data) {
          const totalProjects = data?.meta?.total; // Get total projects from meta
          const totalAmount = data.result.reduce((sum, participant) => sum + participant.amount, 0); // Sum all amounts

          setTotalProjects(totalProjects);
          setTotalAmount(totalAmount);
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
        className="text-3xl font-bold text-gray-800 mb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Welcome back, {user?.name || 'Investor'}!
      </motion.h1>

      <motion.p
        className="text-gray-600 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Here’s an overview of your investments and project activity.
      </motion.p>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Projects Card */}
        <motion.div
          className="bg-white rounded-2xl shadow p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          onClick={()=> navigate("/dashboard/investor/projects")}
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Projects</h2>
          {loading ? (
            <p className="text-3xl font-bold text-gray-400">Loading...</p>
          ) : (
            <p className="text-3xl font-bold text-orange-400">{totalProjects}</p>
          )}
        </motion.div>

        {/* Total Invested Amount */}
        <motion.div
          className="bg-white rounded-2xl shadow p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          onClick={()=> navigate("/dashboard/investor/projects")}
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Invested</h2>
          {loading ? (
            <p className="text-3xl font-bold text-gray-400">Loading...</p>
          ) : (
            <p className="text-3xl font-bold text-orange-400">£{totalAmount.toLocaleString()}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
