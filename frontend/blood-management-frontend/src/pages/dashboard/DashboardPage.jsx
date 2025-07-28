import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  Droplets, 
  FileText, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, donationsAPI, requestsAPI, stockAPI } from '../../lib/api';
import { formatDate, formatRelativeTime, getStatusColor, getUrgencyColor, canDonateAgain, getNextDonationDate } from '../../lib/utils';

const DashboardPage = () => {
  const { user, isAdmin, isDonor, isRecipient } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        if (user) {
          const response = await usersAPI.getDashboard(user._id);
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const renderDonorDashboard = () => {
    const donations = dashboardData?.donations;
    const canDonate = canDonateAgain(user?.medicalInfo?.lastDonationDate);
    const nextDonationDate = getNextDonationDate(user?.medicalInfo?.lastDonationDate);

    return (
      <div className="space-y-6">
        {/* Donation Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Donation Status</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {canDonate ? (
                  <span className="text-green-600">Eligible</span>
                ) : (
                  <span className="text-orange-600">Not Eligible</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {canDonate 
                  ? 'You can donate blood now'
                  : `Next donation: ${formatDate(nextDonationDate)}`
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{donations?.totalDonations || 0}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime contributions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lives Saved</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(donations?.totalDonations || 0) * 3}</div>
              <p className="text-xs text-muted-foreground">
                Estimated impact
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild disabled={!canDonate}>
                <Link to="/dashboard/donate">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Donation
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/donations">
                  <FileText className="mr-2 h-4 w-4" />
                  View History
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Donations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Your latest donation activities</CardDescription>
          </CardHeader>
          <CardContent>
            {donations?.recent?.length > 0 ? (
              <div className="space-y-4">
                {donations.recent.map((donation) => (
                  <div key={donation._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Droplets className="h-8 w-8 text-red-600" />
                      <div>
                        <p className="font-medium">{donation.bloodGroup} - {donation.quantity}ml</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(donation.donationDate)} at {donation.location.center}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(donation.status)}>
                      {donation.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No donations yet. Start saving lives today!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRecipientDashboard = () => {
    const requests = dashboardData?.requests;

    return (
      <div className="space-y-6">
        {/* Request Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests?.totalRequests || 0}</div>
              <p className="text-xs text-muted-foreground">
                All time requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fulfilled</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {requests?.stats?.find(s => s._id === 'fulfilled')?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {requests?.stats?.find(s => s._id === 'pending')?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <Link to="/dashboard/request">
                  <Plus className="mr-2 h-4 w-4" />
                  New Request
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/requests">
                  <FileText className="mr-2 h-4 w-4" />
                  View Requests
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Your latest blood requests</CardDescription>
          </CardHeader>
          <CardContent>
            {requests?.recent?.length > 0 ? (
              <div className="space-y-4">
                {requests.recent.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Droplets className="h-8 w-8 text-red-600" />
                      <div>
                        <p className="font-medium">
                          {request.bloodType} - {request.quantity} units
                        </p>
                        <p className="text-sm text-muted-foreground">
                          For {request.patient.name} • {formatRelativeTime(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getUrgencyColor(request.urgency)}>
                        {request.urgency}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No requests yet. Create your first request when needed.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {getGreeting()}, {user?.name}! 👋
              </h1>
              <p className="text-red-100 text-lg">
                Welcome to your {user?.role} dashboard. Ready to make a difference today?
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Heart className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

      {/* User Info Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-600" />
            <span>Your Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Blood Group</p>
              <p className="font-semibold text-lg">{user?.bloodGroup}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Age</p>
              <p className="font-semibold">{user?.age} years</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-semibold">{user?.address?.city}, {user?.address?.state}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Status</p>
              <div className="flex items-center space-x-2">
                <Badge variant={user?.isVerified ? 'default' : 'secondary'}>
                  {user?.isVerified ? 'Verified' : 'Unverified'}
                </Badge>
                {user?.isActive && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-specific Dashboard */}
      {isDonor() && renderDonorDashboard()}
      {(isRecipient() || (!isDonor() && !isAdmin())) && renderRecipientDashboard()}

      {/* Admin Dashboard Link */}
      {isAdmin() && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>Manage the blood management system</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/admin">
                <TrendingUp className="mr-2 h-4 w-4" />
                Go to Admin Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
};

export default DashboardPage;

