import { auth } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/utils/prisma";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CalendarIcon,
  MailIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  RefreshCwIcon
} from "lucide-react";
import { cn } from "@/utils";
import Link from "next/link";
import { prefixPath } from "@/utils/path";

export default async function HomePage(props: {
  params: Promise<{ emailAccountId: string }>;
}) {
  const params = await props.params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <div>Please log in to view your agenda.</div>;
  }

  // Fetch real agenda items from database (fail-safe)
  let items: Array<any> = [];
  try {
    items = await prisma.agendaItem.findMany({
      where: {
        userId,
        status: { not: "done" },
      },
      orderBy: [
        { priority: "desc" },
        { dueAt: "asc" },
        { updatedAt: "desc" },
      ],
      take: 100,
    });
  } catch (err) {
    console.error("Failed to fetch AgendaItem records", err);
  }

  const currentTime = new Date();
  const greeting = getGreeting(currentTime);
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {greeting}, {session.user?.name || "there"}
            </h1>
            <p className="text-muted-foreground">
              {new Intl.DateTimeFormat('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              }).format(currentTime)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <form action="/api/calendar/sync" method="post">
              <Button type="submit" variant="outline" size="sm">
                <RefreshCwIcon className="size-4 mr-2" />
                Sync Calendar
              </Button>
            </form>
          </div>
        </div>

        {/* Real Agenda Items */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Today's Agenda</h2>
          {items.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">
                No agenda items found. Try syncing your calendar or check your email for tasks.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.id} className={cn(
                  "p-4 transition-colors",
                  item.priority >= 2 && "border-destructive bg-destructive/5"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {item.source === 'calendar' && <CalendarIcon className="size-4" />}
                          {item.source === 'gmail' && <MailIcon className="size-4" />}
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {item.actionNeeded && <Badge variant="secondary">Action needed</Badge>}
                          {item.priority >= 2 && <Badge variant="destructive">Urgent</Badge>}
                          {item.priority === 1 && <Badge>High Priority</Badge>}
                        </div>
                      </div>
                      
                      {item.subtitle && (
                        <div className="text-sm text-muted-foreground mb-1">{item.subtitle}</div>
                      )}
                      
                      {item.dueAt && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ClockIcon className="size-3" />
                          Due {item.dueAt.toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    <Button size="sm" variant="ghost">
                      <CheckCircleIcon className="size-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function getGreeting(time: Date): string {
  const hour = time.getHours();
  
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
