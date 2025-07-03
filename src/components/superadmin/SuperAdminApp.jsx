import React, { useState, useEffect } from 'react';
import { Shield, Home, Users, UserCog, MessageSquare, LogOut, Menu, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import SuperAdminLogin from './SuperAdminLogin';
import SuperAdminDashboard from './SuperAdminDashboard';
import ClientManagement from './ClientManagement';

const SuperAdminApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [superAdmin, setSuperAdmin] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('superAdminToken');
    const adminData = localStorage.getItem('superAdminData');
    
    if (token && adminData) {
      setIsAuthenticated(true);
      setSuperAdmin(JSON.parse(adminData));
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    const adminData = localStorage.getItem('superAdminData');
    if (adminData) {
      setSuperAdmin(JSON.parse(adminData));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminData');
    setIsAuthenticated(false);
    setSuperAdmin(null);
    setCurrentView('dashboard');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'clients', name: 'Clients', icon: Users },
    // { id: 'agents', name: 'Agents', icon: UserCog },
    // { id: 'conversations', name: 'Conversations', icon: MessageSquare },
  ];

  if (!isAuthenticated) {
    return <SuperAdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          variant="outline"
          size="sm"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-primary to-primary/80">
          <Shield className="w-8 h-8 text-primary-foreground mr-2" />
          <h1 className="text-xl font-bold text-primary-foreground">SuperAdmin</h1>
        </div>
        
        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* User Info and Logout */}
        <div className="absolute bottom-0 w-full p-4">
          <Separator className="mb-4" />
          <div className="flex items-center mb-3">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                {superAdmin?.name?.charAt(0)?.toUpperCase() || 'S'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{superAdmin?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{superAdmin?.email}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {currentView === 'dashboard' && (
          <SuperAdminDashboard onNavigate={handleNavigate} />
        )}
        {currentView === 'clients' && (
          <ClientManagement />
        )}
        {currentView === 'agents' && (
          <div className="p-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCog className="w-6 h-6 mr-2" />
                  Agent Management
                </CardTitle>
                <CardDescription>
                  Comprehensive agent management interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <UserCog className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Advanced agent management features including performance analytics, 
                    workload distribution, and agent training tools will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {currentView === 'conversations' && (
          <div className="p-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-6 h-6 mr-2" />
                  Conversation Management
                </CardTitle>
                <CardDescription>
                  Real-time conversation monitoring and management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Real-time conversation monitoring, message analytics, and conversation 
                    management tools will be available in this section.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminApp;