import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, FileText, Globe, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DashboardOverview = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Companies Tracked',
      value: '12',
      change: '+2 this month',
      icon: Building2,
      color: 'text-primary'
    },
    {
      title: 'Documents Processed',
      value: '847',
      change: '+156 this week',
      icon: FileText,
      color: 'text-success'
    },
    {
      title: 'URLs Analyzed',
      value: '1,234',
      change: '+89 this week',
      icon: Globe,
      color: 'text-warning'
    },
    {
      title: 'Questions Asked',
      value: '3,567',
      change: '+234 today',
      icon: MessageSquare,
      color: 'text-accent'
    }
  ];

  const recentActivity = [
    {
      action: 'Uploaded annual report',
      company: 'Apple Inc.',
      time: '2 hours ago',
      type: 'pdf'
    },
    {
      action: 'Added news article',
      company: 'Microsoft Corp.',
      time: '4 hours ago',
      type: 'url'
    },
    {
      action: 'Asked about revenue trends',
      company: 'Google LLC',
      time: '6 hours ago',
      type: 'question'
    },
    {
      action: 'Processed quarterly report',
      company: 'Tesla Inc.',
      time: '1 day ago',
      type: 'pdf'
    }
  ];

  const quickActions = [
    {
      title: 'Upload PDF',
      description: 'Add a new financial document',
      icon: FileText,
      path: '/dashboard/upload',
      color: 'bg-primary'
    },
    {
      title: 'Add URL',
      description: 'Scrape web content',
      icon: Globe,
      path: '/dashboard/urls',
      color: 'bg-success'
    },
    {
      title: 'Ask Question',
      description: 'Query your data',
      icon: MessageSquare,
      path: '/dashboard/chat',
      color: 'bg-warning'
    },
    {
      title: 'Manage Companies',
      description: 'Add or remove companies',
      icon: Building2,
      path: '/dashboard/companies',
      color: 'bg-accent'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-2">
            Monitor your financial data analysis and insights
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/chat')} className="bg-gradient-primary">
          <MessageSquare className="w-4 h-4 mr-2" />
          Ask Question
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="glass-effect hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-success mt-1">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} bg-current/10 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2 glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex items-start space-x-3 hover:shadow-md transition-all"
                  onClick={() => navigate(action.path)}
                >
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'pdf' ? 'bg-primary/10 text-primary' :
                    activity.type === 'url' ? 'bg-success/10 text-success' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {activity.type === 'pdf' && <FileText className="w-4 h-4" />}
                    {activity.type === 'url' && <Globe className="w-4 h-4" />}
                    {activity.type === 'question' && <MessageSquare className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.company}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;