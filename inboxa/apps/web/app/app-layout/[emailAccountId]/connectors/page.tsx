import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PlusIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  CalendarIcon,
  MailIcon,
  MessageSquareIcon,
  FileTextIcon
} from "lucide-react";
import { cn } from "@/utils";
import { SlackConnectButton } from "@/components/SlackConnectButton";


const AVAILABLE_CONNECTORS = [
  {
    name: "Google Calendar",
    description: "Sync calendar events to your agenda",
    icon: CalendarIcon,
    status: "connected" as const,
    category: "productivity",
    color: "text-blue-600"
  },
  {
    name: "Gmail",
    description: "Process emails and extract tasks",
    icon: MailIcon,
    status: "connected" as const,
    category: "email",
    color: "text-red-600"
  },
  {
    name: "Slack", 
    description: "Monitor channels and DMs for action items",
    icon: MessageSquareIcon,
    status: "available" as const,
    category: "communication",
    color: "text-purple-600"
  },
  {
    name: "Notion",
    description: "Sync databases and pages to agenda",
    icon: FileTextIcon,
    status: "coming_soon" as const,
    category: "productivity",
    color: "text-gray-600"
  }
];

export default async function ConnectorsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await auth();
  const resolvedSearchParams = await searchParams;

  if (!session?.user?.id) {
    return <div>Please log in to manage connectors.</div>;
  }

  // Check if Slack was just connected (in real app, check database)
  const isSlackConnected = resolvedSearchParams.success === 'slack_connected';

  // Update connectors status dynamically
  const connectors = AVAILABLE_CONNECTORS.map(connector => {
    if (connector.name === 'Slack' && isSlackConnected) {
      return { ...connector, status: 'connected' as const };
    }
    return connector;
  });


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Connectors</h1>
            <p className="text-muted-foreground">
              Connect your tools to automatically populate your agenda
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {resolvedSearchParams.success === 'slack_connected' && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Slack Connected Successfully!</div>
                <div className="text-sm text-green-700">
                  You can now monitor Slack channels and DMs for action items.
                </div>
              </div>
            </div>
          </Card>
        )}
        
        {resolvedSearchParams.error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <ExternalLinkIcon className="h-5 w-5 text-red-600" />
              <div>
                <div className="font-medium text-red-900">Connection Failed</div>
                <div className="text-sm text-red-700">
                  {resolvedSearchParams.error === 'invalid_callback' && "Invalid callback parameters."}
                  {resolvedSearchParams.error === 'config_error' && "Configuration error."}
                  {resolvedSearchParams.error === 'callback_failed' && "Connection failed."}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Connected Services */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Connected Services</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {connectors.filter(c => c.status === 'connected').map((connector) => (
              <Card key={connector.name} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <connector.icon className={`h-5 w-5 ${connector.color}`} />
                    </div>
                    <div>
                      <div className="font-medium">{connector.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {connector.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-500/10 text-green-700">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                    <Button size="sm" variant="ghost">
                      <ExternalLinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Available Connectors */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Connectors</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {connectors.filter(c => c.status !== 'connected').map((connector) => (
              <Card key={connector.name} className={cn(
                "p-4",
                connector.status === 'coming_soon' && "opacity-60"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                      <connector.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{connector.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {connector.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {connector.status === 'available' && (
                      <>
                        {connector.name === 'Slack' ? (
                          <SlackConnectButton />
                        ) : (
                          <Button size="sm">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        )}
                      </>
                    )}
                    {connector.status === 'coming_soon' && (
                      <Badge variant="outline">Coming Soon</Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Integration Instructions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">How Connectors Work</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Connectors automatically sync data from your tools to create agenda items</p>
            <p>• Each connector can be configured with custom filters and priority rules</p>
            <p>• Data is processed in real-time and appears in your Home agenda</p>
            <p>• You can disconnect or reconfigure any connector at any time</p>
          </div>
        </Card>
      </div>
    </div>
  );
}