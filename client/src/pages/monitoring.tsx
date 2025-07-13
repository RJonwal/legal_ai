import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Database, 
  Server, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Monitor,
  Zap,
  HardDrive,
  Cpu,
  MemoryStick
} from '@/lib/icons';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function HealthStatus({ status }: { status: string }) {
  const config = {
    healthy: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    degraded: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    unhealthy: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' }
  };
  
  const { icon: Icon, color, bg } = config[status as keyof typeof config] || config.unhealthy;
  
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${bg}`}>
      <Icon className={`h-5 w-5 ${color}`} />
      <span className={`font-medium ${color} capitalize`}>{status}</span>
    </div>
  );
}

export default function MonitoringPage() {
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['/health'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/monitoring/metrics'],
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['/api/monitoring/performance'],
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const { data: cacheData, isLoading: cacheLoading } = useQuery({
    queryKey: ['/api/monitoring/cache/stats'],
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  if (healthLoading || metricsLoading || performanceLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Monitor className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">System Monitoring</h1>
            <p className="text-gray-600">Real-time system health and performance metrics</p>
          </div>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Monitor className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">System Monitoring</h1>
          <p className="text-gray-600">Real-time system health and performance metrics</p>
        </div>
      </div>

      <Tabs defaultValue="health" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Overall Health</span>
                  <HealthStatus status={healthData?.status || 'unknown'} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Uptime</span>
                  <Badge variant="outline">
                    {formatUptime(healthData?.uptime || 0)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Check</span>
                  <span className="text-sm text-gray-500">
                    {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : 'Unknown'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Health Checks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(healthData?.checks || {}).map(([check, status]) => (
                  <div key={check} className="flex items-center justify-between">
                    <span className="capitalize">{check.replace('_', ' ')}</span>
                    <Badge variant={status ? 'default' : 'destructive'}>
                      {status ? 'Healthy' : 'Failed'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {performanceData?.cpu ? 
                    `${((performanceData.cpu.user + performanceData.cpu.system) / 1000000).toFixed(1)}%` : 
                    'N/A'}
                </div>
                <Progress value={performanceData?.cpu ? 
                  ((performanceData.cpu.user + performanceData.cpu.system) / 1000000) : 0} 
                  className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <MemoryStick className="h-5 w-5" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {performanceData?.memory ? 
                    formatBytes(performanceData.memory.heapUsed) : 'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                  Total: {performanceData?.memory ? formatBytes(performanceData.memory.heapTotal) : 'N/A'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Uptime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {formatUptime(performanceData?.uptime || 0)}
                </div>
                <div className="text-sm text-gray-500">
                  Since startup
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Cache Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {performanceData?.cache?.connected ? 'Connected' : 'Disconnected'}
                </div>
                <Badge variant={performanceData?.cache?.connected ? 'default' : 'destructive'}>
                  {performanceData?.cache?.connected ? 'Healthy' : 'Offline'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Memory Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Heap Used:</span>
                      <span>{performanceData?.memory ? formatBytes(performanceData.memory.heapUsed) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Heap Total:</span>
                      <span>{performanceData?.memory ? formatBytes(performanceData.memory.heapTotal) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>External:</span>
                      <span>{performanceData?.memory ? formatBytes(performanceData.memory.external) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>RSS:</span>
                      <span>{performanceData?.memory ? formatBytes(performanceData.memory.rss) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Process Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Process ID:</span>
                      <span>{process.pid || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Node Version:</span>
                      <span>{process.version || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform:</span>
                      <span>{process.platform || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Architecture:</span>
                      <span>{process.arch || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metricsData?.summary?.totalRequests || 0}
                </div>
                <div className="text-sm text-gray-500">
                  All time
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Total Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {metricsData?.summary?.totalErrors || 0}
                </div>
                <div className="text-sm text-gray-500">
                  All time
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Avg Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metricsData?.summary?.averageResponseTime ? 
                    `${metricsData.summary.averageResponseTime.toFixed(0)}ms` : 
                    'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                  Average
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Uptime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatUptime(metricsData?.summary?.uptime || 0)}
                </div>
                <div className="text-sm text-gray-500">
                  Since startup
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Request Metrics</CardTitle>
              <CardDescription>
                API endpoint performance and usage statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metricsData?.requests || {}).map(([endpoint, count]) => (
                  <div key={endpoint} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-mono text-sm">{endpoint}</span>
                    <Badge variant="outline">{count} requests</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Cache Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Connection</span>
                  <Badge variant={cacheData?.connected ? 'default' : 'destructive'}>
                    {cacheData?.connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Keys</span>
                  <span className="font-mono">{cacheData?.keyCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <span className="text-sm text-gray-500">
                    {cacheData?.connected ? 'Operational' : 'Offline'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Cache Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // Clear cache functionality
                    fetch('/api/monitoring/cache/clear', { method: 'POST' })
                      .then(() => window.location.reload());
                  }}
                >
                  Clear Cache
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  Refresh Stats
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}