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
  Eye
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';


export function AdminDashboard() {


  const [currentPage, setCurrentPage] = useState(1);
  const [totalAgents, setTotalAgents] = useState(0);
  const [totalInvestors, setTotalInvestors] = useState(0);
  const [loading, setLoading] = useState(true);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  

  const fetchData = async () => {
    try {
      const [agentsRes, investorsRes] = await Promise.all([
        axiosInstance.get('/users?role=agent'),
        axiosInstance.get('/users?role=investor')
      ]);

      // Set total pages

      setTotalAgents(agentsRes.data.data?.meta?.total || 0);
      setTotalInvestors(investorsRes.data.data?.meta?.total || 0);
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
          className="cursor-pointer"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Agent
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAgents}</div>
          </CardContent>
        </Card>

        
        <Card
          onClick={() => navigate('/dashboard/agents')}
          className="cursor-pointer"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investor</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvestors}</div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
