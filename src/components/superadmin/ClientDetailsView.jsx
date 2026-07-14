import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft, 
  UserCog, 
  MessageSquare, 
  Database, 
  Calendar,
  Mail,
  XCircle,
  HardDrive,
  BarChart3,
  Trash2,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Pencil,
  Check,
  X,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { superadminFetch } from '@/lib/superadminFetch';

/** Plan limits and custom limits maxStorage are stored in bytes; the form uses MB like PlanManagementPanel. */
const BYTES_PER_MB = 1024 * 1024;

const EMPTY_USAGE = {
  inputTokens: 0,
  outputTokens: 0,
  cacheTokens: 0,
  totalTokens: 0,
  inputCost: 0,
  outputCost: 0,
  cacheCost: 0,
  totalCost: 0,
  totalRequests: 0,
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount) || 0);

const formatNumber = (num) => {
  const n = Number(num) || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
};

/** Compact metrics box: input/output/cache tokens + costs (+ optional embedding) */
const OpenAIUsageMetricsBox = ({ title, usage, className = '', showEmbedding = false }) => {
  const u = usage || EMPTY_USAGE;
  return (
    <div className={`rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2 ${className}`}>
      {title ? (
        <div className="text-sm font-semibold flex items-center gap-1.5 text-slate-900">
          <Zap className="w-3.5 h-3.5 text-blue-600" />
          {title}
        </div>
      ) : null}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5 text-xs">
        <div className="flex justify-between gap-2">
          <span className="text-slate-500">Input tokens</span>
          <span className="font-semibold tabular-nums text-slate-900">{formatNumber(u.inputTokens)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-slate-500">Output tokens</span>
          <span className="font-semibold tabular-nums text-slate-900">{formatNumber(u.outputTokens)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-slate-500">Cache tokens</span>
          <span className="font-semibold tabular-nums text-slate-900">{formatNumber(u.cacheTokens)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-slate-500">Input cost</span>
          <span className="font-semibold text-blue-700 tabular-nums">{formatCurrency(u.inputCost)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-slate-500">Output cost</span>
          <span className="font-semibold text-blue-700 tabular-nums">{formatCurrency(u.outputCost)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-slate-500">Cache cost</span>
          <span className="font-semibold text-blue-700 tabular-nums">{formatCurrency(u.cacheCost)}</span>
        </div>
        {showEmbedding && (
          <>
            <div className="flex justify-between gap-2 col-span-2 sm:col-span-3 border-t border-slate-200 pt-1.5 mt-0.5">
              <span className="text-slate-500 font-medium">Embedding input tokens</span>
              <span className="font-semibold tabular-nums text-slate-900">
                {formatNumber(u.embeddingInputTokens || 0)}
              </span>
            </div>
            <div className="flex justify-between gap-2 col-span-2 sm:col-span-3">
              <span className="text-slate-500 font-medium">Embedding input cost</span>
              <span className="font-semibold text-blue-700 tabular-nums">
                {formatCurrency(u.embeddingInputCost || 0)}
              </span>
            </div>
          </>
        )}
        <div className="flex justify-between gap-2 col-span-2 sm:col-span-3 border-t border-slate-200 pt-1.5 mt-0.5">
          <span className="text-slate-600 font-medium">Total (chat)</span>
          <span className="font-semibold tabular-nums text-slate-900">
            {formatNumber(u.totalTokens)} tok · {formatCurrency(u.totalCost)}
          </span>
        </div>
      </div>
    </div>
  );
};

const ClientDetailsView = ({ clientId, onBack }) => {
  const [clientData, setClientData] = useState(null);
  const [aiAgents, setAiAgents] = useState([]);
  const [humanAgents, setHumanAgents] = useState([]);
  const [openAIUsageTotal, setOpenAIUsageTotal] = useState(EMPTY_USAGE);
  const [loading, setLoading] = useState(true);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [customLimitsLoading, setCustomLimitsLoading] = useState(false);
  const [customLimitsSuccess, setCustomLimitsSuccess] = useState('');
  const [customLimitsError, setCustomLimitsError] = useState('');
  /** Mirrors saved per-client limits from the API; used to merge when saving one field from Overview. */
  const [customLimitsForm, setCustomLimitsForm] = useState({
    maxQueries: '',
    maxHumanAgents: '',
    maxAgents: '',
    maxStorage: '',
  });
  /** Quick-edit limits from Overview Usage Details (PUT /clients/:id/custom-limits). */
  const [usageEditing, setUsageEditing] = useState(null);
  const [usageEditDraft, setUsageEditDraft] = useState('');

  /** AI chatbot conversations usage panel */
  const [selectedBot, setSelectedBot] = useState(null);
  const [botUsageLoading, setBotUsageLoading] = useState(false);
  const [botUsageError, setBotUsageError] = useState('');
  const [botConversations, setBotConversations] = useState([]);
  const [conversationsTotals, setConversationsTotals] = useState(EMPTY_USAGE);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchClientDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await superadminFetch(`${apiUrl}/clients/${clientId}`);

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          console.log(data.data,"data.data");
          setClientData(data.data);
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

  const fetchClientAgents = useCallback(async () => {
    if (!clientId) return;
    
    try {
      setAgentsLoading(true);
      const response = await superadminFetch(`${apiUrl}/clients/${clientId}/agents`);

      if (response.ok) {
        const data = await response.json();
        setAiAgents(data.data?.aiAgents || []);
        setHumanAgents(data.data?.humanAgents || []);
        setOpenAIUsageTotal(data.data?.openAIUsageTotal || EMPTY_USAGE);
      } else {
        console.error('Failed to fetch client agents');
      }
    } catch (error) {
      console.error('Network error occurred:', error);
    } finally {
      setAgentsLoading(false);
    }
  }, [clientId, apiUrl]);

  const closeBotUsagePanel = useCallback(() => {
    setSelectedBot(null);
    setBotConversations([]);
    setConversationsTotals(EMPTY_USAGE);
    setSelectedConversation(null);
    setBotUsageError('');
  }, []);

  const openBotUsagePanel = useCallback(
    async (bot) => {
      if (!clientId || !bot?._id) return;
      setSelectedBot(bot);
      setSelectedConversation(null);
      setBotUsageError('');
      setBotUsageLoading(true);
      setBotConversations([]);
      setConversationsTotals(EMPTY_USAGE);

      try {
        const response = await superadminFetch(
          `${apiUrl}/clients/${clientId}/agents/${bot._id}/conversations-usage`
        );
        if (response.ok) {
          const data = await response.json();
          setBotConversations(data.data?.conversations || []);
          setConversationsTotals(data.data?.conversationsTotals || EMPTY_USAGE);
        } else {
          setBotUsageError('Failed to load conversation usage');
        }
      } catch (err) {
        console.error(err);
        setBotUsageError('Network error loading conversation usage');
      } finally {
        setBotUsageLoading(false);
      }
    },
    [clientId, apiUrl]
  );

  const cancelSubscription = async () => {
    if (!clientId) return;
    
    try {
      setCancelLoading(true);
      const response = await superadminFetch(
        `${apiUrl}/cancel/sunscription/${clientId}`,
        { method: 'GET' }
      );

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

  const putCustomLimits = async (payload) => {
    setCustomLimitsSuccess('');
    setCustomLimitsError('');
    try {
      setCustomLimitsLoading(true);
      const response = await superadminFetch(
        `${apiUrl}/clients/${clientId}/custom-limits`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setCustomLimitsSuccess(data.message || 'Limits saved successfully');
        fetchClientDetails();
      } else {
        setCustomLimitsError(data.message || 'Failed to save limits');
      }
    } catch {
      setCustomLimitsError('Network error occurred');
    } finally {
      setCustomLimitsLoading(false);
    }
  };

  /** Saves overrides for this client; backend stores on client.customLimits (PlanService applies when isCustomLimits is true). */
  const saveUsageQuickEdit = async (partialForm) => {
    const merged = { ...customLimitsForm, ...partialForm };
    const ud = clientData?.usageDetails;
    const pickNum = (formVal, fallback) => {
      if (formVal !== '' && formVal != null && formVal !== undefined) {
        const num = Number(formVal);
        return Number.isFinite(num) ? num : null;
      }
      if (fallback != null && fallback !== '') return Number(fallback);
      return null;
    };
    const payload = {
      isCustomLimits: true,
      maxQueries: pickNum(merged.maxQueries, ud?.maxQueries),
      maxHumanAgents: pickNum(merged.maxHumanAgents, ud?.maxHumanAgents),
      maxAgents: pickNum(merged.maxAgents, ud?.maxAgents),
      maxStorage:
        merged.maxStorage !== '' && merged.maxStorage != null
          ? Math.round(Number(merged.maxStorage) * BYTES_PER_MB)
          : ud?.maxStorage != null
            ? Number(ud.maxStorage)
            : null,
    };
    await putCustomLimits(payload);
  };

  const usageEditFormKey = {
    maxStorage: 'maxStorage',
    maxAgents: 'maxAgents',
    maxHumanAgents: 'maxHumanAgents',
    maxQueries: 'maxQueries',
  };

  const startUsageEdit = (key) => {
    setCustomLimitsSuccess('');
    setCustomLimitsError('');
    const ud = clientData?.usageDetails;
    const f = customLimitsForm;
    if (key === 'maxStorage') {
      if (f.maxStorage !== '' && f.maxStorage != null) {
        setUsageEditDraft(String(f.maxStorage));
      } else if (ud?.maxStorage != null) {
        setUsageEditDraft(String(Number(ud.maxStorage) / BYTES_PER_MB));
      } else {
        setUsageEditDraft('');
      }
    } else {
      const fk = usageEditFormKey[key];
      if (f[fk] !== '' && f[fk] != null) {
        setUsageEditDraft(String(f[fk]));
      } else if (ud?.[fk] != null) {
        setUsageEditDraft(String(ud[fk]));
      } else {
        setUsageEditDraft('');
      }
    }
    setUsageEditing(key);
  };

  const cancelUsageEdit = () => {
    setUsageEditing(null);
    setUsageEditDraft('');
  };

  const commitUsageEdit = async () => {
    if (!usageEditing) return;
    const raw = usageEditDraft.trim();
    if (raw === '') {
      setCustomLimitsError('Enter a limit value.');
      return;
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || num < 0) {
      setCustomLimitsError('Enter a valid non-negative number.');
      return;
    }
    const fk = usageEditFormKey[usageEditing];
    const partial = { [fk]: raw };
    await saveUsageQuickEdit(partial);
    setUsageEditing(null);
    setUsageEditDraft('');
  };

  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId, fetchClientDetails]);

  useEffect(() => {
    if (!clientData) return;
    if (clientData.customLimits) {
      const rawStorage = clientData.customLimits.maxStorage;
      const maxStorageMb =
        rawStorage != null && rawStorage !== ''
          ? Number(rawStorage) / BYTES_PER_MB
          : '';
      setCustomLimitsForm({
        maxQueries: clientData.customLimits.maxQueries ?? '',
        maxHumanAgents: clientData.customLimits.maxHumanAgents ?? '',
        maxAgents: clientData.customLimits.maxAgents ?? '',
        maxStorage: maxStorageMb,
      });
    } else {
      setCustomLimitsForm({
        maxQueries: '',
        maxHumanAgents: '',
        maxAgents: '',
        maxStorage: '',
      });
    }
  }, [clientData]);

  useEffect(() => {
    if (activeTab === 'agents' && clientId) {
      fetchClientAgents();
    }
  }, [activeTab, clientId, fetchClientAgents]);

  useEffect(() => {
    setUsageEditing(null);
    setUsageEditDraft('');
  }, [activeTab]);

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

   const getPagesAddedFailedDisplay = (raw) => {
    if (raw == null) return { success: 0, failed: 0, usesDerived: false };
    if (typeof raw === 'number') {
      return { success: raw, failed: 0, usesDerived: false };
    }
    const success = Number(raw.success) || 0;
    const reportedFailed = Number(raw.failed) || 0;
    const total =
      raw.total != null && raw.total !== '' ? Number(raw.total) : null;
    if (total != null && total > 0) {
      return {
        success,
        failed: Math.max(0, total - success),
        usesDerived: true,
      };
    }
    return { success, failed: reportedFailed, usesDerived: false };
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
    { id: 'agents', name: 'Team & chatbots', icon: UserCog },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI chatbots</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientData?.usageDetails?.totalAiAgents ?? clientData?.usageDetails?.totalAgents ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                of {clientData?.usageDetails?.maxAgents || 0} allowed (plan)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Human agents</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientData?.usageDetails?.totalHumanAgents ?? 0}</div>
              <p className="text-xs text-muted-foreground">Team members (HumanAgent)</p>
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
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-muted-foreground shrink-0">Storage Used:</span>
                        <span className="font-medium">{formatFileSize(clientData?.currentDataSize)}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2 min-h-9">
                        <span className="text-muted-foreground shrink-0">Storage Limit:</span>
                        {usageEditing === 'maxStorage' ? (
                          <div className="flex items-center gap-1 flex-wrap justify-end">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={usageEditDraft}
                              onChange={(e) => setUsageEditDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitUsageEdit();
                                if (e.key === 'Escape') cancelUsageEdit();
                              }}
                              className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm"
                              disabled={customLimitsLoading}
                            />
                            <span className="text-xs text-muted-foreground">MB</span>
                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={commitUsageEdit} disabled={customLimitsLoading} title="Save">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={cancelUsageEdit} disabled={customLimitsLoading} title="Cancel">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{formatFileSize(clientData?.usageDetails?.maxStorage)}</span>
                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => startUsageEdit('maxStorage')} disabled={customLimitsLoading} title="Edit storage limit">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center gap-2 min-h-9">
                        <span className="text-muted-foreground shrink-0">AI chatbots:</span>
                        {usageEditing === 'maxAgents' ? (
                          <div className="flex items-center gap-1 flex-wrap justify-end">
                            <span className="text-sm text-muted-foreground">
                              {clientData?.usageDetails?.totalAiAgents ?? clientData?.usageDetails?.totalAgents ?? 0} /
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={usageEditDraft}
                              onChange={(e) => setUsageEditDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitUsageEdit();
                                if (e.key === 'Escape') cancelUsageEdit();
                              }}
                              className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm"
                              disabled={customLimitsLoading}
                            />
                            <span className="text-xs text-muted-foreground">max</span>
                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={commitUsageEdit} disabled={customLimitsLoading} title="Save">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={cancelUsageEdit} disabled={customLimitsLoading} title="Cancel">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              {clientData?.usageDetails?.totalAiAgents ?? clientData?.usageDetails?.totalAgents ?? 0} / {clientData?.usageDetails?.maxAgents || 0}
                            </span>
                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => startUsageEdit('maxAgents')} disabled={customLimitsLoading} title="Edit max AI chatbots">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center gap-2 min-h-9">
                        <span className="text-muted-foreground shrink-0">Human agents:</span>
                        {usageEditing === 'maxHumanAgents' ? (
                          <div className="flex items-center gap-1 flex-wrap justify-end">
                            <span className="text-sm text-muted-foreground">
                              {clientData?.usageDetails?.totalHumanAgents ?? 0} /
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={usageEditDraft}
                              onChange={(e) => setUsageEditDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitUsageEdit();
                                if (e.key === 'Escape') cancelUsageEdit();
                              }}
                              className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm"
                              disabled={customLimitsLoading}
                            />
                            <span className="text-xs text-muted-foreground">max</span>
                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={commitUsageEdit} disabled={customLimitsLoading} title="Save">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={cancelUsageEdit} disabled={customLimitsLoading} title="Cancel">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              {clientData?.usageDetails?.totalHumanAgents ?? 0} / {clientData?.usageDetails?.maxHumanAgents ?? 0}
                            </span>
                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => startUsageEdit('maxHumanAgents')} disabled={customLimitsLoading} title="Edit max human agents">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center gap-2 min-h-9">
                        <span className="text-muted-foreground shrink-0">Conversations:</span>
                        {usageEditing === 'maxQueries' ? (
                          <div className="flex items-center gap-1 flex-wrap justify-end">
                            <span className="text-sm text-muted-foreground">
                              {clientData?.usageDetails?.totalConversations || 0} /
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={usageEditDraft}
                              onChange={(e) => setUsageEditDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitUsageEdit();
                                if (e.key === 'Escape') cancelUsageEdit();
                              }}
                              className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm"
                              disabled={customLimitsLoading}
                            />
                            <span className="text-xs text-muted-foreground">max / mo</span>
                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={commitUsageEdit} disabled={customLimitsLoading} title="Save">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={cancelUsageEdit} disabled={customLimitsLoading} title="Cancel">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              {clientData?.usageDetails?.totalConversations || 0} / {clientData?.usageDetails?.maxQueries || 0}
                            </span>
                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => startUsageEdit('maxQueries')} disabled={customLimitsLoading} title="Edit max conversations">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {activeTab === 'overview' && (customLimitsSuccess || customLimitsError) && (
                        <div className="text-sm pt-2 border-t mt-1 space-y-1">
                          {customLimitsSuccess && (
                            <p className="text-green-700 flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4 shrink-0" />
                              {customLimitsSuccess}
                            </p>
                          )}
                          {customLimitsError && (
                            <p className="text-destructive flex items-center gap-1">
                              <XCircle className="h-4 w-4 shrink-0" />
                              {customLimitsError}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-muted-foreground shrink-0">Pages Added:</span>
                        <div className="text-right">
                          {(() => {
                            const p = getPagesAddedFailedDisplay(clientData?.pagesAdded);
                            return (
                              <>
                                <span className="font-medium">
                                  {p.success} success, {p.failed} failed
                                </span>
                                
                              </>
                            );
                          })()}
                        </div>
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
                  clientData?.upgradePlanStatus?.chatLimitExceeded ||
                  clientData?.upgradePlanStatus?.humanAgentLimitExceeded) && (
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
                        {clientData?.upgradePlanStatus?.humanAgentLimitExceeded && (
                          <div className="text-sm text-orange-700">⚠️ Human agent limit exceeded</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'agents' && (
              <div className="space-y-10">
                <div className="flex justify-between items-center">
                  {agentsLoading && (
                    <div className="text-sm text-muted-foreground">Loading…</div>
                  )}
                </div>
                
                {agentsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading team & chatbots…</p>
                  </div>
                ) : (
                  <>
                    <section>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <UserCog className="w-5 h-5" />
                        Human agents ({humanAgents.filter((ha) => !ha.isClient).length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                        {humanAgents.map((ha) => (
                          <Card key={ha._id}>
                            <CardContent className="p-4">
                              <div className="flex items-center mb-3">
                                <Avatar>
                                  <AvatarFallback className="bg-teal-100 text-teal-700">
                                    {(ha.name || '?').charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="ml-3 min-w-0">
                                  <h4 className="font-medium truncate">{ha.name}</h4>
                                  <p className="text-sm text-muted-foreground truncate">{ha.email}</p>
                                </div>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">humanAgentId</span>
                                  <span className="font-mono text-xs truncate max-w-[140px]" title={ha._id}>{ha._id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Status</span>
                                  <Badge variant={getStatusBadgeVariant(ha.status)}>{ha.status}</Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Online</span>
                                  <span className={ha.isActive ? 'text-green-600' : 'text-muted-foreground'}>
                                    {ha.isActive ? 'Yes' : 'No'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Assigned AI chatbots</span>
                                  <span>{Array.isArray(ha.assignedAgents) ? ha.assignedAgents.length : 0}</span>
                                </div>
                                {Array.isArray(ha.assignedAgents) && ha.assignedAgents.length > 0 && (
                                  <ul className="text-xs text-muted-foreground border-t pt-2 mt-2 space-y-1">
                                    {ha.assignedAgents.map((a) => (
                                      <li key={a._id} className="truncate">
                                        {a.agentName || a.website_name || a._id}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                <div className="flex justify-between text-muted-foreground">
                                  <span>Created</span>
                                  <span>{formatDate(ha.createdAt)}</span>
                                </div>
                                {ha.lastActive && (
                                  <div className="flex justify-between text-muted-foreground">
                                    <span>Last active</span>
                                    <span>{formatDate(ha.lastActive)}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        {/* Same card style as human agent cards — sits right of deskmoz */}
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center mb-3">
                              <Avatar>
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                  <Zap className="w-5 h-5" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-3 min-w-0">
                                <h4 className="font-medium truncate">OpenAI Usage</h4>
                                <p className="text-sm text-muted-foreground truncate">This client</p>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Tokens</span>
                                <span className="font-medium tabular-nums">{formatNumber(openAIUsageTotal.totalTokens)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Input Tokens</span>
                                <span className="font-medium text-blue-600 tabular-nums">{formatNumber(openAIUsageTotal.inputTokens)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Output Tokens</span>
                                <span className="font-medium text-blue-600 tabular-nums">{formatNumber(openAIUsageTotal.outputTokens)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Cache Tokens</span>
                                <span className="font-medium text-blue-600 tabular-nums">{formatNumber(openAIUsageTotal.cacheTokens)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Input Cost</span>
                                <span className="font-medium text-blue-600 tabular-nums">{formatCurrency(openAIUsageTotal.inputCost)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Output Cost</span>
                                <span className="font-medium text-blue-600 tabular-nums">{formatCurrency(openAIUsageTotal.outputCost)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Cache Cost</span>
                                <span className="font-medium text-blue-600 tabular-nums">{formatCurrency(openAIUsageTotal.cacheCost)}</span>
                              </div>
                              <div className="flex justify-between border-t pt-2 mt-1">
                                <span className="text-muted-foreground">Total Cost</span>
                                <span className="font-medium tabular-nums">{formatCurrency(openAIUsageTotal.totalCost)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      {!agentsLoading && humanAgents.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4">No human agents for this account.</p>
                      )}
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Bot className="w-5 h-5" />
                        AI chatbots ({aiAgents.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {aiAgents.map((bot) => {
                          const usage = bot.openAIUsage || EMPTY_USAGE;
                          const embedding = bot.embeddingUsage || EMPTY_USAGE;
                          return (
                            <Card
                              key={bot._id}
                              className="cursor-pointer hover:border-blue-300 hover:shadow-sm transition-colors"
                              onClick={() => openBotUsagePanel(bot)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center mb-3">
                                  <Avatar>
                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                      <Bot className="w-5 h-5" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="ml-3 min-w-0 flex-1">
                                    <h4 className="font-medium truncate">{bot.agentName || 'Unnamed bot'}</h4>
                                    <p className="text-sm text-muted-foreground truncate">{bot.website_name || '—'}</p>
                                  </div>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 shrink-0 text-blue-600"
                                    title="View chat conversation usage"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openBotUsagePanel(bot);
                                    }}
                                  >
                                    <Zap className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Agent (AI) id</span>
                                    <span className="font-mono text-xs truncate max-w-[140px]" title={bot._id}>{bot._id}</span>
                                  </div>
                                  {bot.email ? (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Contact email</span>
                                      <span className="truncate max-w-[180px]">{bot.email}</span>
                                    </div>
                                  ) : null}
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Active</span>
                                    <span className={bot.isActive ? 'text-green-600' : 'text-muted-foreground'}>
                                      {bot.isActive ? 'Yes' : 'No'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Live human support</span>
                                    <span>{bot.liveAgentSupport ? 'On' : 'Off'}</span>
                                  </div>
                                  <div className="flex justify-between text-muted-foreground">
                                    <span>Created</span>
                                    <span>{formatDate(bot.createdAt)}</span>
                                  </div>
                                  <div className="rounded-md border bg-blue-50/60 border-blue-100 px-2.5 py-2 mt-2 space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-blue-800">Total tokens</span>
                                      <span className="font-semibold text-blue-900 tabular-nums">{formatNumber(usage.totalTokens)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-blue-800">Total cost</span>
                                      <span className="font-semibold text-blue-900 tabular-nums">{formatCurrency(usage.totalCost)}</span>
                                    </div>
                                    <div className="border-t border-blue-100 pt-1 mt-1 space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-blue-800">Website training (embedding) tokens</span>
                                        <span className="font-semibold text-blue-900 tabular-nums">{formatNumber(embedding.totalTokens)}</span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-blue-800">Website training (embedding) cost</span>
                                        <span className="font-semibold text-blue-900 tabular-nums">{formatCurrency(embedding.totalCost)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                      {!agentsLoading && aiAgents.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4">No AI chatbots for this account.</p>
                      )}
                    </section>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Portal: opaque modal above all page content (avoids transparent bleed-through) */}
      {selectedBot &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
            style={{ isolation: 'isolate' }}
            onClick={closeBotUsagePanel}
            role="dialog"
            aria-modal="true"
            aria-label="AI chatbot usage"
          >
            <div
              className="bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-white shrink-0">
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg truncate flex items-center gap-2 text-slate-900">
                    <Zap className="w-4 h-4 text-blue-600 shrink-0" />
                    {selectedBot.agentName || 'AI chatbot'} — usage
                  </h3>
                  <p className="text-sm text-slate-500 truncate">
                    {selectedBot.website_name || selectedBot._id}
                  </p>
                </div>
                <Button type="button" size="icon" variant="ghost" onClick={closeBotUsagePanel}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="overflow-y-auto px-5 py-4 space-y-4 bg-white">
                {botUsageLoading ? (
                  <div className="text-center py-10">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Loading conversations…</p>
                  </div>
                ) : botUsageError ? (
                  <p className="text-sm text-red-600">{botUsageError}</p>
                ) : (
                  <>
                    <OpenAIUsageMetricsBox
                      title="All conversations total (chat)"
                      usage={conversationsTotals}
                      showEmbedding
                    />

                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-slate-900">
                        Conversations ({botConversations.length})
                      </h4>
                      {botConversations.length === 0 ? (
                        <p className="text-sm text-slate-500 py-4">
                          No conversation usage yet for this chatbot.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {botConversations.map((conv) => {
                            const isOpen =
                              selectedConversation?.conversationId === conv.conversationId;
                            return (
                              <div
                                key={conv.conversationId}
                                className="rounded-lg border border-slate-200 bg-white p-3 space-y-2"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="font-medium text-sm truncate text-slate-900">
                                      {conv.visitorName || 'Unknown visitor'}
                                    </div>
                                    <div
                                      className="font-mono text-[11px] text-slate-500 truncate"
                                      title={conv.conversationId}
                                    >
                                      {conv.conversationId}
                                    </div>
                                    <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5">
                                      <span>{formatNumber(conv.totalTokens)} chat tok</span>
                                      <span>{formatCurrency(conv.totalCost)}</span>
                                      <span>
                                        emb {formatNumber(conv.embeddingInputTokens || 0)} tok
                                      </span>
                                      <span>
                                        {formatCurrency(conv.embeddingInputCost || 0)}
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant={isOpen ? 'default' : 'outline'}
                                    className="h-8 w-8 shrink-0"
                                    title="Show token & cost breakdown"
                                    onClick={() =>
                                      setSelectedConversation(isOpen ? null : conv)
                                    }
                                  >
                                    <Zap className="w-4 h-4" />
                                  </Button>
                                </div>
                                {isOpen && (
                                  <OpenAIUsageMetricsBox
                                    title="Conversation tokens & cost"
                                    usage={conv}
                                    showEmbedding
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ClientDetailsView;