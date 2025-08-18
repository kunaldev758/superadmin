import React, { useState, useEffect, Fragment } from 'react';
import { 
  Users, 
  Eye, 
  Search, 
  ArrowUpDown,
  Calendar,
  MessageSquare,
  UserCog,
  RotateCw,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const ClientListView = ({ onViewDetails }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState('desc');

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
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
        setClients(data.data);
      } else {
        console.error('Failed to fetch clients');
      }
    } catch (error) {
      console.error('Network error occurred:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredClients = clients.filter(client =>
    client.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.plan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedClients = [...filteredClients].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'email':
        aValue = a.userId?.email || '';
        bValue = b.userId?.email || '';
        break;
      case 'plan':
        aValue = a.plan || '';
        bValue = b.plan || '';
        break;
      case 'agents':
        aValue = a.usageDetails?.totalAgents || 0;
        bValue = b.usageDetails?.totalAgents || 0;
        break;
      case 'conversations':
        aValue = a.usageDetails?.totalConversations || 0;
        bValue = b.usageDetails?.totalConversations || 0;
        break;
      case 'contentSize':
        aValue = a.currentDataSize || 0;
        bValue = b.currentDataSize || 0;
        break;
      case 'totalAmountPaid':
        aValue = a.totalAmountPaid || 0;
        bValue = b.totalAmountPaid || 0;
        break;
      default:
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = sortedClients.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getPlanBadgeVariant = (plan) => {
    switch (plan?.toLowerCase()) {
      case 'premium':
        return 'default';
      case 'pro':
        return 'secondary';
      case 'free':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'cancelled':
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
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold">Client Management</h1>
            </div>
            <Button onClick={fetchClients} variant="default" size="sm">
              <RotateCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Info */}
        <div className='text-left mb-6'>
          <h4 className='text-lg font-bold'>Client Directory</h4>
          <p className='text-sm text-muted-foreground'>Manage and monitor all registered clients in your system</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Show {itemsPerPage} entries per page
                </span>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by email or plan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th 
                      onClick={() => handleSort('email')}
                      className="text-left p-4 font-medium cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Email</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('plan')}
                      className="text-left p-4 font-medium cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Plan</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('agents')}
                      className="text-left p-4 font-medium cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Agents</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('conversations')}
                      className="text-left p-4 font-medium cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Conversations</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('contentSize')}
                      className="text-left p-4 font-medium cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Storage Used</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('createdAt')}
                      className="text-left p-4 font-medium cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Joined</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th className="text-left p-4 font-medium">Plan Status</th>
                    <th className="text-left p-4 font-medium">Payment Status</th>
                    <th 
                      onClick={() => handleSort('totalAmountPaid')}
                      className="text-left p-4 font-medium cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Total Paid</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClients.map((client, index) => (
                    <tr 
                      key={client._id} 
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-medium">{client?.email || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant={getPlanBadgeVariant(client.plan)}>
                          {client.plan || 'Free'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <UserCog className="w-4 h-4 text-muted-foreground mr-1" />
                          <span>{client.usageDetails?.totalAgents || 0}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            /{client.usageDetails?.maxAgents || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 text-muted-foreground mr-1" />
                          <span>{client.usageDetails?.totalConversations || 0}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="text-sm">{formatFileSize(client.currentDataSize)}</div>
                          <div className="text-xs text-muted-foreground">
                            /{formatFileSize(client.usageDetails?.maxStorage)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground mr-1" />
                          {formatDate(client.createdAt)}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={getStatusBadgeVariant(client.planStatus)}>
                          {client.planStatus || 'Active'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={client.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                          {client.paymentStatus || 'Unpaid'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">
                          ${client.totalAmountPaid || 0}
                        </div>
                      </td>
                      <td className="p-4">
                        <Button
                          onClick={() => onViewDetails(client._id)}
                          variant="ghost"
                          size="sm"
                          className="hover:bg-primary/10"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {paginatedClients.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No clients found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'No clients registered yet.'}
                </p>
              </div>
            )}

            {/* Pagination */}
            {sortedClients.length > 0 && (
              <div className="flex items-center justify-between px-2 py-4 bg-gray-50 rounded-b-lg mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedClients.length)} of {sortedClients.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, array) => (
                        <Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        </Fragment>
                      ))
                    }
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientListView;