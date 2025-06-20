import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '@/lib/axios';
import { useNavigate } from 'react-router-dom';

export function AgentDashboard({ user }) {
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0); // New state for referrals
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
       

        // Fetch referrals
        const referralsRes = await axiosInstance.get(`/users?agent=${user._id}`);
        const referralsData = referralsRes?.data?.data.result;

        if (referralsData && Array.isArray(referralsData)) {
          setTotalReferrals(referralsData.length);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        Welcome back, {user?.name || 'Agent'}!
      </motion.h1>

      <motion.p
        className="text-gray-600 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Here’s an overview of your referral and activity.
      </motion.p>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
     
        

        <motion.div
          className="bg-white rounded-2xl shadow p-6 border border-gray-100 cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          onClick={() => navigate('/dashboard/agent/referral')} // Optional route
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Referrals</h2>
          {loading ? (
            <p className="text-3xl font-bold text-gray-400">Loading...</p>
          ) : (
            <p className="text-3xl font-bold text-orange-400">{totalReferrals}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}