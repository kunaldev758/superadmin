import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  User, 
  UserCog, 
  MessageSquare, 
  Database, 
  Calendar,
  Mail,
  XCircle,
  HardDrive,
  BarChart3,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const ClientDetailsView = ({ clientId, onBack }) => {
  const [clientData, setClientData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [cancelLoading, setCancelLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchClientDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`${apiUrl}/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const client = data.data.find(c => c._id === clientId);
        if (client) {
          console.log(client,"this is Client Data")
          setClientData(client);
        } else {
          setError('Client not found');
        }
      } else {
        setError('Failed to fetch client details');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [clientId, apiUrl]);

  const fetchAgents = useCallback(async () => {
    if (!clientId) return;
    
    try {
      setAgentsLoading(true);
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`${apiUrl}/agent/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAgents(data.data.agents || []);
      } else {
        console.error('Failed to fetch agents');
      }
    } catch (error) {
      console.error('Network error occurred:', error);
    } finally {
      setAgentsLoading(false);
    }
  }, [clientId, apiUrl]);

  const cancelSubscription = async () => {
    if (!clientId) return;
    
    try {
      setCancelLoading(true);
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`${apiUrl}/cancel/sunscription/${clientId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Subscription cancelled successfully');
        fetchClientDetails(); // Refresh client data
      } else {
        alert('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Error cancelling subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId, fetchClientDetails]);

  useEffect(() => {
    if (activeTab === 'agents' && clientId) {
      fetchAgents();
    }
  }, [activeTab, clientId, fetchAgents]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default';
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchClientDetails} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'agents', name: 'Agents', icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Clients
              </Button>
              <div className="flex items-center">
                <Avatar className="mr-3">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {clientData?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">{clientData?.email}</p>
                  <p className="text-xs text-muted-foreground">Plan: {clientData?.plan || 'Free'}</p>
                </div>
              </div>
            </div>
            {clientData?.plan !== 'free' && (
              <Button
                onClick={cancelSubscription}
                variant="destructive"
                size="sm"
                disabled={cancelLoading}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {cancelLoading ? 'Cancelling...' : 'Cancel Subscription'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agents</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientData?.usageDetails?.totalAgents || 0}</div>
              <p className="text-xs text-muted-foreground">
                of {clientData?.usageDetails?.maxAgents || 0} allowed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientData?.usageDetails?.totalConversations || 0}</div>
              <p className="text-xs text-muted-foreground">
                of {clientData?.usageDetails?.maxQueries || 0} allowed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFileSize(clientData?.currentDataSize)}</div>
              <p className="text-xs text-muted-foreground">
                of {formatFileSize(clientData?.usageDetails?.maxStorage)} allowed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${clientData?.totalAmountPaid || 0}</div>
              <p className="text-xs text-muted-foreground">
                {clientData?.billingCycle || 'monthly'} billing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </Button>
                );
              })}
            </div>
          </CardHeader>

          <CardContent>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Client Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Client Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-muted-foreground mr-3" />
                        <span className="text-muted-foreground">Email:</span>
                        <span className="ml-2 font-medium">{clientData?.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-muted-foreground mr-3" />
                        <span className="text-muted-foreground">Joined:</span>
                        <span className="ml-2 font-medium">{formatDate(clientData?.createdAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <Database className="w-5 h-5 text-muted-foreground mr-3" />
                        <span className="text-muted-foreground">Plan:</span>
                        <Badge variant="outline" className="ml-2">{clientData?.plan || 'Free'}</Badge>
                      </div>
                      <div className="flex items-center">
                        <Database className="w-5 h-5 text-muted-foreground mr-3" />
                        <span className="text-muted-foreground">Plan Status:</span>
                        <Badge variant={getStatusBadgeVariant(clientData?.planStatus)} className="ml-2">
                          {clientData?.planStatus || 'Active'}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <Database className="w-5 h-5 text-muted-foreground mr-3" />
                        <span className="text-muted-foreground">Payment Status:</span>
                        <Badge variant={clientData?.paymentStatus === 'paid' ? 'default' : 'secondary'} className="ml-2">
                          {clientData?.paymentStatus || 'Unpaid'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Usage Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Storage Used:</span>
                        <span className="font-medium">{formatFileSize(clientData?.currentDataSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Storage Limit:</span>
                        <span className="font-medium">{formatFileSize(clientData?.usageDetails?.maxStorage)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Agents:</span>
                        <span className="font-medium">
                          {clientData?.usageDetails?.totalAgents || 0} / {clientData?.usageDetails?.maxAgents || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Conversations:</span>
                        <span className="font-medium">
                          {clientData?.usageDetails?.totalConversations || 0} / {clientData?.usageDetails?.maxQueries || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pages Added:</span>
                        <span className="font-medium">
                          {clientData?.pagesAdded?.success || 0} success, {clientData?.pagesAdded?.failed || 0} failed
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Files Added:</span>
                        <span className="font-medium">{clientData?.filesAdded || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">FAQs Added:</span>
                        <span className="font-medium">{clientData?.faqsAdded || 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Upgrade Status */}
                {(clientData?.upgradePlanStatus?.storageLimitExceeded || 
                  clientData?.upgradePlanStatus?.agentLimitExceeded || 
                  clientData?.upgradePlanStatus?.chatLimitExceeded) && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-orange-800">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Upgrade Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {clientData?.upgradePlanStatus?.storageLimitExceeded && (
                          <div className="text-sm text-orange-700">⚠️ Storage limit exceeded</div>
                        )}
                        {clientData?.upgradePlanStatus?.agentLimitExceeded && (
                          <div className="text-sm text-orange-700">⚠️ Agent limit exceeded</div>
                        )}
                        {clientData?.upgradePlanStatus?.chatLimitExceeded && (
                          <div className="text-sm text-orange-700">⚠️ Chat limit exceeded</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'agents' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Agents ({agents.length})</h3>
                  {agentsLoading && (
                    <div className="text-sm text-muted-foreground">Loading agents...</div>
                  )}
                </div>
                
                {agentsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading agents...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agents.map((agent) => (
                      <Card key={agent._id}>
                        <CardContent className="p-4">
                          <div className="flex items-center mb-3">
                            <Avatar>
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                <UserCog className="w-5 h-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <h4 className="font-medium">{agent.name}</h4>
                              <p className="text-sm text-muted-foreground">{agent.email}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Status:</span>
                              <Badge variant={getStatusBadgeVariant(agent.status)}>
                                {agent.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Active:</span>
                              <span className={agent.isActive ? 'text-green-600' : 'text-muted-foreground'}>
                                {agent.isActive ? 'Online' : 'Offline'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Created:</span>
                              <span className="text-muted-foreground">
                                {formatDate(agent.createdAt)}
                              </span>
                            </div>
                            {agent.lastActive && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Last Active:</span>
                                <span className="text-muted-foreground">
                                  {formatDate(agent.lastActive)}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {!agentsLoading && agents.length === 0 && (
                  <div className="text-center py-8">
                    <UserCog className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No agents found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">This client hasn't added any agents yet.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDetailsView;