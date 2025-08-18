import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  MessageCircle, 
  TrendingUp, 
  Bot, 
  UserCog,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  LogOut,
  Shield,
  RotateCw,
  Eye,
  ChevronRight,
  DollarSign,
  Database,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Cell, BarChart, Bar, ResponsiveContainer, Pie } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const SuperAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [superAdmin, setSuperAdmin] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const adminData = localStorage.getItem('superAdminData');
    if (adminData) {
      setSuperAdmin(JSON.parse(adminData));
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`${apiUrl}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err) {
      console.log(err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminData');
    window.location.href = '/login';
  };

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toLocaleString() || '0';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4 text-lg font-semibold">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold">SuperAdmin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={fetchDashboardData}
                variant="ghost"
                size="sm"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Welcome, {superAdmin?.name}</span>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Overview Stats - Enhanced with Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className='text-left'>
                <CardTitle className="text-sm font-medium text-blue-800">Total Clients</CardTitle>
                <div className="text-2xl font-bold text-blue-900">{dashboardData?.overview?.totalClients?.toLocaleString() || '0'}</div>
                <p className="text-xs text-blue-600">Registered clients</p>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <UserCog className="h-6 w-6 text-green-600" />
              </div>
              <div className='text-left'>
                <CardTitle className="text-sm font-medium text-green-800">Total Agents</CardTitle>
                <div className="text-2xl font-bold text-green-900">{dashboardData?.overview?.totalAgents?.toLocaleString() || '0'}</div>
                <p className="text-xs text-green-600">{dashboardData?.agents?.active} active</p>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className='text-left'>
                <CardTitle className="text-sm font-medium text-purple-800">Active Visitors</CardTitle>
                <div className="text-2xl font-bold text-purple-900">{dashboardData?.overview?.activeVisitors?.toLocaleString() || '0'}</div>
                <p className="text-xs text-purple-600">Open conversations</p>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="p-3 bg-orange-100 rounded-lg mr-4">
                <MessageCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className='text-left'>
                <CardTitle className="text-sm font-medium text-orange-800">Total Conversations</CardTitle>
                <div className="text-2xl font-bold text-orange-900">{dashboardData?.overview?.totalConversations?.toLocaleString() || '0'}</div>
                <p className="text-xs text-orange-600">All time</p>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="p-3 bg-emerald-100 rounded-lg mr-4">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div className='text-left'>
                <CardTitle className="text-sm font-medium text-emerald-800">Total Revenue</CardTitle>
                <div className="text-2xl font-bold text-emerald-900">{formatCurrency(dashboardData?.totalRevenue || 0)}</div>
                <p className="text-xs text-emerald-600">All clients</p>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Usage & Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 text-blue-500 mr-2" />
                OpenAI Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Tokens</span>
                <span className="font-semibold">{formatNumber(dashboardData?.openAIUsage?.totalTokens || 0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Cost</span>
                <span className="font-semibold text-blue-600">{formatCurrency(dashboardData?.openAIUsage?.totalCost || 0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Requests</span>
                <span className="font-semibold text-blue-600">{formatCurrency(dashboardData?.openAIUsage?.totalRequests || 0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 text-purple-500 mr-2" />
                Qdrant Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Vectors Added</span>
                <span className="font-semibold">{formatNumber(dashboardData?.qdrantUsage?.totalVectorsAdded || 0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Vectors Deleted</span>
                <span className="font-semibold">{formatNumber(dashboardData?.qdrantUsage?.totalVectorsDeleted || 0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Storage</span>
                <span className="font-semibold text-purple-600">{dashboardData?.qdrantUsage?.totalEstimatedCostStorage || 0} MB</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Requests</span>
                <span className="font-semibold text-purple-600">{dashboardData?.qdrantUsage?.totalEstimatedCostRequests || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Chat Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Today</span>
                <span className="font-semibold">{dashboardData?.chats?.today || 0}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">This Week</span>
                <span className="font-semibold">{dashboardData?.chats?.weekly || 0}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">This Month</span>
                <span className="font-semibold">{dashboardData?.chats?.monthly || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chat Volume */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Chat Volume (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData?.chartData?.last7Days || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="chats" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Agent Status */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Agents</span>
                <span className="font-semibold">{dashboardData?.agents?.total || 0}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Approved</span>
                <span className="font-semibold text-green-600">{dashboardData?.agents?.approved || 0}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active Now</span>
                <span className="font-semibold text-blue-600">{dashboardData?.agents?.active || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI vs Human and Message Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI vs Human Chat Ratio */}
          <Card>
            <CardHeader>
              <CardTitle>AI vs Human Chat Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'AI Chats', value: dashboardData?.chatRatio?.ai?.count || 0 },
                        { name: 'Human Chats', value: dashboardData?.chatRatio?.human?.count || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-sm text-muted-foreground">AI ({dashboardData?.chatRatio?.ai?.percentage || 0}%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full mr-2"></div>
                  <span className="text-sm text-muted-foreground">Human ({dashboardData?.chatRatio?.human?.percentage || 0}%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Message Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-3">Message Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-600">Bot Messages</span>
                    <span className="font-semibold">{formatNumber(dashboardData?.messages?.bot || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Agent Messages</span>
                    <span className="font-semibold">{formatNumber(dashboardData?.messages?.agent || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Visitor Messages</span>
                    <span className="font-semibold">{formatNumber(dashboardData?.messages?.visitor || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4"> 
                <div className="flex items-center justify-between">
                  <span className="text-green-800 font-medium">Total Messages</span>
                  <span className="text-green-600 font-bold text-xl">{formatNumber(dashboardData?.messages?.total || 0)}</span>
                </div>
              </div>

              {/* Message Type Chart */}
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[
                      { name: 'Bot', value: dashboardData?.messages?.bot || 0 },
                      { name: 'Agent', value: dashboardData?.messages?.agent || 0 },
                      { name: 'Visitor', value: dashboardData?.messages?.visitor || 0 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;