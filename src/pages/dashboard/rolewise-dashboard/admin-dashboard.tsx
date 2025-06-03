'use client';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Users,
  Briefcase,
  GraduationCap,
  Calendar,
  BookOpen,
  FolderOpen,
  Eye,
  PlusCircle
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';


export function AdminDashboard() {


  const [currentPage, setCurrentPage] = useState(1);
  const [totalAgents, setTotalAgents] = useState(0);
  const [totalInvestors, setTotalInvestors] = useState(0);
  const [totalInvestments, setTotalInvestments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  

  const fetchData = async () => {
    try {
      const [agentsRes, investorsRes, projectres] = await Promise.all([
        axiosInstance.get('/users?role=agent'),
        axiosInstance.get('/users?role=investor'),
        axiosInstance.get('/investments')

      ]);

      // Set total pages

      setTotalAgents(agentsRes.data.data?.meta?.total || 0);
      setTotalInvestors(investorsRes.data.data?.meta?.total || 0);
      setTotalInvestments(projectres.data.data?.meta?.total || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const navigate = useNavigate();

  return (
    <div className="flex-1 space-y-4  ">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <Card
          onClick={() => navigate('/dashboard/agents')}
          className="flex cursor-pointer flex-col items-center justify-center"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Total Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAgents}</div>
          </CardContent>
        </Card>

        <Card
          onClick={() => navigate('/dashboard/investors')}
          className="flex cursor-pointer flex-col items-center justify-center"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">
              Total Investor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvestors}</div>
          </CardContent>
        </Card>
        <Card
          onClick={() => navigate('/dashboard/investments')}
          className="flex cursor-pointer flex-col items-center justify-center"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvestments}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
