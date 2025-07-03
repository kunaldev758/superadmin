import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  User, 
  UserCog, 
  MessageSquare, 
  Database, 
  Activity,
  Calendar,
  Mail,
  CreditCard,
  FileText,
  Globe,
  Upload,
  MessageCircle,
  Bot,
  Users,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  HardDrive,
  Zap,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const ClientDetailsView = ({ clientId, onBack }) => {
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchClientDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('superAdminToken');
      const response = await fetch(`${apiUrl}/clients/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClientData(data.data);
      } else {
        setError('Failed to fetch client details');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId, fetchClientDetails]);

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
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTrainingTypeLabel = (type) => {
    const types = {
      0: 'Web Page',
      1: 'File',
      2: 'Snippet',
      3: 'FAQ'
    };
    return types[type] || 'Unknown';
  };

  const getTrainingStatusLabel = (status) => {
    const statuses = {
      1: 'Listed',
      2: 'Crawled',
      3: 'Minified',
      4: 'Mapped'
    };
    return statuses[status] || 'Unknown';
  };

  const getStatusVariant = (status) => {
    const variants = {
      1: 'secondary',
      2: 'default',
      3: 'outline',
      4: 'default'
    };
    return variants[status] || 'secondary';
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

  const messageChartData = [
    { name: 'Bot', value: clientData?.messages?.bot || 0, color: '#8B5CF6' },
    { name: 'Agent', value: clientData?.messages?.agent || 0, color: '#06B6D4' },
    { name: 'Visitor', value: clientData?.messages?.visitor || 0, color: '#10B981' },
    { name: 'Assistant', value: clientData?.messages?.assistant || 0, color: '#F59E0B' }
  ];

  const trainingStatsData = [
    { name: 'Web Pages', count: clientData?.content?.stats?.webPage || 0 },
    { name: 'Files', count: clientData?.content?.stats?.file || 0 },
    { name: 'Snippets', count: clientData?.content?.stats?.snippet || 0 },
    { name: 'FAQs', count: clientData?.content?.stats?.faq || 0 }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'agents', name: 'Agents', icon: UserCog },
    { id: 'conversations', name: 'Conversations', icon: MessageSquare },
    { id: 'content', name: 'Training Content', icon: Database }
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
                    {clientData?.client?.userId?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  {/* <h1 className="text-xl font-bold">
                    {clientData?.client?.userId?.name || 'Unknown Client'}
                  </h1> */}
                  <p className="text-sm text-muted-foreground">{clientData?.client?.userId?.email}</p>
                </div>
              </div>
            </div>
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
              <div className="text-2xl font-bold">{clientData?.agents?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientData?.conversations?.stats?.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientData?.conversations?.stats?.open || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Size</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFileSize(clientData?.content?.size || 0)}</div>
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
                      {/* <div className="flex items-center">
                        <User className="w-5 h-5 text-muted-foreground mr-3" />
                        <span className="text-muted-foreground">Name:</span>
                        <span className="ml-2 font-medium">{clientData?.client?.userId?.name}</span>
                      </div> */}
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-muted-foreground mr-3" />
                        <span className="text-muted-foreground">Email:</span>
                        <span className="ml-2 font-medium">{clientData?.client?.userId?.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-muted-foreground mr-3" />
                        <span className="text-muted-foreground">Joined:</span>
                        <span className="ml-2 font-medium">{formatDate(clientData?.client?.createdAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <Database className="w-5 h-5 text-muted-foreground mr-3" />
                        <span className="text-muted-foreground">Index:</span>
                        <span className="ml-2 font-medium text-sm">{clientData?.client?.pineconeIndexName}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Credits & Usage</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Credits:</span>
                        <span className="font-medium">{clientData?.client?.credits?.total?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Used Credits:</span>
                        <span className="font-medium">{clientData?.client?.credits?.used?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Remaining:</span>
                        <span className="font-medium text-green-600">
                          {((clientData?.client?.credits?.total || 0) - (clientData?.client?.credits?.used || 0)).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${((clientData?.client?.credits?.used || 0) / (clientData?.client?.credits?.total || 1)) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Message Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={messageChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {messageChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center space-x-4 mt-4">
                        {messageChartData.map((item) => (
                          <div key={item.name} className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Training Content Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={trainingStatsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8B5CF6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'agents' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Agents ({clientData?.agents?.length || 0})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clientData?.agents?.map((agent) => (
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
                            <Badge variant={agent.status === 'approved' ? 'default' : 'secondary'}>
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
                            <span className="text-muted-foreground">Last Active:</span>
                            <span className="text-muted-foreground">
                              {agent.lastActive ? formatDate(agent.lastActive) : 'Never'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {clientData?.agents?.length === 0 && (
                  <div className="text-center py-8">
                    <UserCog className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No agents found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">This client hasn't added any agents yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'conversations' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <MessageSquare className="w-8 h-8 text-blue-600" />
                        <div className="ml-3">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-xl font-bold">{clientData?.conversations?.stats?.total || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Activity className="w-8 h-8 text-green-600" />
                        <div className="ml-3">
                          <p className="text-sm text-muted-foreground">Open</p>
                          <p className="text-xl font-bold">{clientData?.conversations?.stats?.open || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-8 h-8 text-purple-600" />
                        <div className="ml-3">
                          <p className="text-sm text-muted-foreground">Closed</p>
                          <p className="text-xl font-bold">{clientData?.conversations?.stats?.closed || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <h4 className="text-md font-semibold mb-4">Active Conversations</h4>
                <div className="space-y-3">
                  {clientData?.conversations?.active?.map((conversation) => (
                    <Card key={conversation._id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Conversation #{conversation._id.slice(-6)}</p>
                            <p className="text-sm text-muted-foreground">Visitor: {conversation.visitor}</p>
                            {conversation.agentId && (
                              <p className="text-sm text-blue-600">Agent: {conversation.agentId.name}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge variant={conversation.aiChat ? 'default' : 'secondary'}>
                              {conversation.aiChat ? 'AI Chat' : 'Human Chat'}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDate(conversation.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {clientData?.conversations?.active?.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No active conversations</h3>
                    <p className="mt-1 text-sm text-muted-foreground">All conversations are currently closed.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'content' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Globe className="w-8 h-8 text-blue-600" />
                        <div className="ml-3">
                          <p className="text-sm text-muted-foreground">Web Pages</p>
                          <p className="text-xl font-bold">{clientData?.content?.stats?.webPage || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Upload className="w-8 h-8 text-green-600" />
                        <div className="ml-3">
                          <p className="text-sm text-muted-foreground">Files</p>
                          <p className="text-xl font-bold">{clientData?.content?.stats?.file || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <FileText className="w-8 h-8 text-purple-600" />
                        <div className="ml-3">
                          <p className="text-sm text-muted-foreground">Snippets</p>
                          <p className="text-xl font-bold">{clientData?.content?.stats?.snippet || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <MessageCircle className="w-8 h-8 text-orange-600" />
                        <div className="ml-3">
                          <p className="text-sm text-muted-foreground">FAQs</p>
                          <p className="text-xl font-bold">{clientData?.content?.stats?.faq || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Content Size:</span>
                      <span className="font-bold text-lg">{formatFileSize(clientData?.content?.size || 0)}</span>
                    </div>
                  </CardContent>
                </Card>

                <h4 className="text-md font-semibold mb-4">Training Content Items</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {clientData?.content?.items?.map((item) => (
                    <Card key={item._id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2 space-x-2">
                              <Badge variant={getStatusVariant(item.trainingStatus)}>
                                {getTrainingStatusLabel(item.trainingStatus)}
                              </Badge>
                              <Badge variant="outline">
                                {getTrainingTypeLabel(item.type)}
                              </Badge>
                            </div>
                            <h5 className="font-medium mb-1">
                              {item.title || item.webPage?.title || item.file?.fileName || item.snippet?.title || item.faq?.question || 'Untitled'}
                            </h5>
                            {item.webPage?.url && (
                              <p className="text-sm text-blue-600 break-all">{item.webPage.url}</p>
                            )}
                            {item.file?.originalFileName && (
                              <p className="text-sm text-muted-foreground">{item.file.originalFileName}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm text-muted-foreground">
                              {formatDate(item.lastEdit)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {clientData?.content?.items?.length === 0 && (
                  <div className="text-center py-8">
                    <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No training content</h3>
                    <p className="mt-1 text-sm text-muted-foreground">This client hasn't uploaded any training content yet.</p>
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