import React, { useState, useEffect, Fragment } from 'react';
import { 
  Users, 
  Eye, 
  Search, 
  ArrowUpDown,
  Calendar,
  MessageSquare,
  UserCog,
  Activity,
  ChevronRight,
  RotateCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const ClientListView = ({ onViewDetails }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState('desc');

  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(apiUrl,"apiUrl")

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
    } catch {
      console.error('Network error occurred');
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

  const filteredClients = clients.filter(client =>
    client.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.pineconeIndexName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedClients = [...filteredClients].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.userId?.name || '';
        bValue = b.userId?.name || '';
        break;
      case 'email':
        aValue = a.userId?.email || '';
        bValue = b.userId?.email || '';
        break;
      case 'conversations':
        aValue = a.metrics?.totalConversations || 0;
        bValue = b.metrics?.totalConversations || 0;
        break;
      case 'agents':
        aValue = a.metrics?.agentCount || 0;
        bValue = b.metrics?.agentCount || 0;
        break;
      case 'credits':
        aValue = a.credits?.total || 0;
        bValue = b.credits?.total || 0;
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
        {/* Summary Cards - Colorful */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-blue-800">Total Clients</CardTitle>
                <div className="text-2xl font-bold text-blue-900">{clients.length}</div>
                <p className="text-xs text-blue-600">Registered clients</p>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-green-800">Active Chats</CardTitle>
                <div className="text-2xl font-bold text-green-900">
                  {clients.reduce((sum, client) => sum + (client.metrics?.activeConversations || 0), 0)}
                </div>
                <p className="text-xs text-green-600">Currently open</p>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <UserCog className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-purple-800">Total Agents</CardTitle>
                <div className="text-2xl font-bold text-purple-900">
                  {clients.reduce((sum, client) => sum + (client.metrics?.agentCount || 0), 0)}
                </div>
                <p className="text-xs text-purple-600">Across all clients</p>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="p-3 bg-orange-100 rounded-lg mr-4">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-orange-800">Total Messages</CardTitle>
                <div className="text-2xl font-bold text-orange-900">
                  {clients.reduce((sum, client) => sum + (client.metrics?.totalMessages || 0), 0)}
                </div>
                <p className="text-xs text-orange-600">All conversations</p>
              </div>
            </CardHeader>
          </Card>
        </div> */}

        {/* Clients Table */}
        <div className='text-left mb-4'>
          <h4 className='text-lg font-bold'>Client Directory</h4>
          <p className='text-sm text-muted-foreground'>Manage and monitor all registered clients in your system</p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mt-4">
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
                  placeholder="Search by name, email, or index..."
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
                    {/* <th 
                      onClick={() => handleSort('name')}
                      className="text-left p-4 font-medium cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Client Name</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th> */}
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
                      onClick={() => handleSort('credits')}
                      className="text-left p-4 font-medium cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Credits</span>
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
                      {/* <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {client.details?.email[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {client.details?.email || 'Unknown'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {client._id.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td> */}
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-left">{client?.details?.email}</div>
                          {/* <div className="text-sm text-muted-foreground">{client.details?.email }</div> */}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <UserCog className="w-4 h-4 text-muted-foreground mr-1" />
                          <span>{client.metrics?.agentCount || 0}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div>Total: {client.metrics?.totalConversations || 0}</div>
                          <div className="text-sm text-green-600">
                            Active: {client.metrics?.activeConversations || 0}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div>{client.credits?.total?.toLocaleString() || 0}</div>
                          <div className="text-sm text-muted-foreground">
                            Used: {client.credits?.used?.toLocaleString() || 0}
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
                        <Button
                          onClick={() => onViewDetails(client._id)}
                          variant="ghost"
                          size="sm"
                          className="hover:bg-primary/10"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
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
                  {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first client.'}
                </p>
              </div>
            )}

            {/* Pagination */}
            {sortedClients.length > 0 && (
              <div className="flex items-center justify-between px-2 py-4 bg-gray-50 rounded-b-lg mt-2">
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