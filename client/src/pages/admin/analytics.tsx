
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Activity,
  Download,
  Calendar,
  Eye,
  DollarSign,
  TrendingDown,
  Zap,
  Calculator,
  Filter,
  Search
} from "lucide-react";
import { useState } from "react";

interface AIUsageRecord {
  id: string;
  userId: string;
  userName: string;
  provider: string;
  model: string;
  tokens: number;
  cost: number;
  timestamp: string;
  caseId?: string;
  caseTitle?: string;
}

interface UserProfitability {
  userId: string;
  userName: string;
  subscription: string;
  monthlyRevenue: number;
  aiCosts: number;
  otherCosts: number;
  totalCosts: number;
  profit: number;
  margin: number;
  status: 'profitable' | 'break-even' | 'loss';
}

interface PLReportItem {
  category: string;
  subcategory: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState("30d");
  const [filterProvider, setFilterProvider] = useState("all");
  const [searchUser, setSearchUser] = useState("");
  const [sortField, setSortField] = useState("profit");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Mock AI usage data
  const aiUsageData: AIUsageRecord[] = [
    {
      id: "1",
      userId: "user_1",
      userName: "Sarah Johnson",
      provider: "OpenAI",
      model: "gpt-4o",
      tokens: 2500,
      cost: 0.075,
      timestamp: "2024-03-15T10:30:00Z",
      caseId: "case_1",
      caseTitle: "Smith v. Johnson"
    },
    {
      id: "2", 
      userId: "user_2",
      userName: "Mike Wilson",
      provider: "Anthropic",
      model: "claude-3-sonnet",
      tokens: 1800,
      cost: 0.054,
      timestamp: "2024-03-15T09:15:00Z",
      caseId: "case_2",
      caseTitle: "ABC Corp Merger"
    },
    {
      id: "3",
      userId: "user_1",
      userName: "Sarah Johnson", 
      provider: "OpenAI",
      model: "gpt-4o-mini",
      tokens: 5000,
      cost: 0.025,
      timestamp: "2024-03-15T08:45:00Z"
    }
  ];

  // Mock user profitability data
  const userProfitability: UserProfitability[] = [
    {
      userId: "user_1",
      userName: "Sarah Johnson",
      subscription: "Professional",
      monthlyRevenue: 99,
      aiCosts: 12.50,
      otherCosts: 15.20,
      totalCosts: 27.70,
      profit: 71.30,
      margin: 72.0,
      status: 'profitable'
    },
    {
      userId: "user_2", 
      userName: "Mike Wilson",
      subscription: "Pro Se",
      monthlyRevenue: 29,
      aiCosts: 8.75,
      otherCosts: 12.10,
      totalCosts: 20.85,
      profit: 8.15,
      margin: 28.1,
      status: 'profitable'
    },
    {
      userId: "user_3",
      userName: "Robert Davis",
      subscription: "Enterprise", 
      monthlyRevenue: 299,
      aiCosts: 45.20,
      otherCosts: 35.80,
      totalCosts: 81.00,
      profit: 218.00,
      margin: 72.9,
      status: 'profitable'
    }
  ];

  // Mock P&L data
  const plData: PLReportItem[] = [
    {
      category: "Revenue",
      subcategory: "Subscription Revenue",
      amount: 24750,
      percentage: 85.2,
      trend: "up",
      trendValue: 12.5
    },
    {
      category: "Revenue",
      subcategory: "Token Purchases", 
      amount: 4290,
      percentage: 14.8,
      trend: "up",
      trendValue: 8.2
    },
    {
      category: "Costs",
      subcategory: "AI API Costs",
      amount: -3850,
      percentage: 45.2,
      trend: "up",
      trendValue: 15.3
    },
    {
      category: "Costs",
      subcategory: "Infrastructure",
      amount: -2100,
      percentage: 24.6,
      trend: "stable",
      trendValue: 0.5
    },
    {
      category: "Costs",
      subcategory: "Support & Operations",
      amount: -1580,
      percentage: 18.5,
      trend: "down",
      trendValue: -3.2
    },
    {
      category: "Costs", 
      subcategory: "Other Expenses",
      amount: -990,
      percentage: 11.6,
      trend: "stable",
      trendValue: 1.1
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'profitable': return 'text-green-600 bg-green-100';
      case 'break-even': return 'text-yellow-600 bg-yellow-100';
      case 'loss': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredUsageData = aiUsageData.filter(record => {
    const providerMatch = filterProvider === "all" || record.provider.toLowerCase().includes(filterProvider.toLowerCase());
    const userMatch = searchUser === "" || record.userName.toLowerCase().includes(searchUser.toLowerCase());
    return providerMatch && userMatch;
  });

  const sortedProfitability = [...userProfitability].sort((a, b) => {
    const aValue = a[sortField as keyof UserProfitability] as number;
    const bValue = b[sortField as keyof UserProfitability] as number;
    return sortDirection === "desc" ? bValue - aValue : aValue - bValue;
  });

  const downloadReport = async (reportType: string) => {
    try {
      console.log(`Downloading ${reportType} report...`);
      const response = await fetch(`/api/admin/reports/export/${reportType}?dateRange=${dateRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${reportType}-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const scheduleReport = async () => {
    try {
      const response = await fetch('/api/admin/reports/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: 'comprehensive',
          frequency: 'weekly',
          dateRange,
          format: 'pdf',
          recipients: ['admin@legalai.com']
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule report');
      }

      const result = await response.json();
      alert(`Report scheduled successfully! Schedule ID: ${result.scheduleId}`);
    } catch (error) {
      console.error('Error scheduling report:', error);
      alert('Failed to schedule report. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-2">Comprehensive platform analytics and financial insights</p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => downloadReport('comprehensive')}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={scheduleReport}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="ai-costs" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            AI Costs
          </TabsTrigger>
          <TabsTrigger value="profitability" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Profitability
          </TabsTrigger>
          <TabsTrigger value="profit-loss" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            P&L Reports
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Analytics
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$29,040</div>
                <p className="text-xs text-muted-foreground">+12.5% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Costs</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$3,850</div>
                <p className="text-xs text-muted-foreground">+15.3% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$20,520</div>
                <p className="text-xs text-muted-foreground">+8.2% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">70.6%</div>
                <p className="text-xs text-muted-foreground">-2.1% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>Revenue, costs, and profitability trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Financial Dashboard</h3>
                <p className="text-gray-600 mb-4">Interactive charts and detailed financial insights</p>
                <Button variant="outline">View Full Dashboard</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-costs">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total AI Spend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">$3,850</div>
                  <p className="text-sm text-gray-600">This month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cost per Token</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">$0.00003</div>
                  <p className="text-sm text-gray-600">Average rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Provider</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-purple-600">OpenAI</div>
                  <p className="text-sm text-gray-600">65% of total costs</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>AI Usage Tracking</CardTitle>
                    <CardDescription>Detailed breakdown of AI API usage and costs</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterProvider} onValueChange={setFilterProvider}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Providers</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="deepseek">Deepseek</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        className="pl-9 w-40"
                      />
                    </div>
                    <Button size="sm" onClick={() => downloadReport('ai-usage')}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Tokens</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Case</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsageData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.userName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.provider}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{record.model}</TableCell>
                        <TableCell>{record.tokens.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">${record.cost.toFixed(3)}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {record.caseTitle || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(record.timestamp).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profitability">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profitable Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">127</div>
                  <p className="text-sm text-gray-600">92% of active users</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Avg. User Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">$99.15</div>
                  <p className="text-sm text-gray-600">Per month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Best Margin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">84.2%</div>
                  <p className="text-sm text-gray-600">Enterprise tier</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">At-Risk Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">8</div>
                  <p className="text-sm text-gray-600">Low/negative margins</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Profitability Analysis</CardTitle>
                    <CardDescription>Revenue vs costs breakdown per user</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={sortField} onValueChange={setSortField}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="profit">Profit</SelectItem>
                        <SelectItem value="margin">Margin %</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="aiCosts">AI Costs</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSortDirection(sortDirection === "desc" ? "asc" : "desc")}
                    >
                      {sortDirection === "desc" ? "↓" : "↑"}
                    </Button>
                    <Button size="sm" onClick={() => downloadReport('profitability')}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>AI Costs</TableHead>
                      <TableHead>Other Costs</TableHead>
                      <TableHead>Total Costs</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Margin</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProfitability.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell className="font-medium">{user.userName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.subscription}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">${user.monthlyRevenue}</TableCell>
                        <TableCell className="text-red-600">${user.aiCosts.toFixed(2)}</TableCell>
                        <TableCell className="text-red-600">${user.otherCosts.toFixed(2)}</TableCell>
                        <TableCell className="text-red-600">${user.totalCosts.toFixed(2)}</TableCell>
                        <TableCell className={user.profit > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                          ${user.profit.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-medium">{user.margin.toFixed(1)}%</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profit-loss">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">$29,040</div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12.5% vs last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">$8,520</div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +8.7% vs last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Net Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">$20,520</div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +14.2% vs last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profit & Loss Statement</CardTitle>
                    <CardDescription>Detailed financial breakdown and trends</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => downloadReport('pl-statement')}>
                      <Download className="mr-2 h-4 w-4" />
                      Download P&L
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadReport('financial-summary')}>
                      <FileText className="mr-2 h-4 w-4" />
                      Summary Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>% of Total</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead>Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell>{item.subcategory}</TableCell>
                        <TableCell className={`font-medium ${item.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${Math.abs(item.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>{item.percentage}%</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(item.trend)}
                          </div>
                        </TableCell>
                        <TableCell className={`text-sm ${item.trendValue > 0 ? 'text-green-600' : item.trendValue < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {item.trendValue > 0 ? '+' : ''}{item.trendValue}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Detailed user behavior and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">User Behavior Analytics</h3>
                <p className="text-gray-600 mb-4">User engagement, retention, and activity patterns</p>
                <Button variant="outline">View User Analytics</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Platform performance and technical metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Response Time</span>
                  <Badge variant="outline" className="text-green-600">
                    120ms
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Performance</span>
                  <Badge variant="outline" className="text-green-600">
                    Excellent
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Error Rate</span>
                  <Badge variant="outline" className="text-green-600">
                    0.01%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <Badge variant="outline" className="text-green-600">
                    99.9%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
