import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prefixPath } from "@/utils/path";
import { checkUserOwnsEmailAccount } from "@/utils/email-account";
import {
  MailIcon,
  ClockIcon,
  TrendingUpIcon,
  UsersIcon,
  ArrowRightIcon,
  CalendarIcon,
  ChevronRightIcon,
} from "lucide-react";

/**
 * InboxA.AI Insights Page
 * 
 * Features per spec:
 * - KPI tiles (Received, Awaiting reply, Avg response time, Top senders)
 * - One trend chart only
 * - Actions from tiles route to actionable destinations
 * - Clean, focused analytics experience
 */
export default async function InsightsPage(props: {
  params: Promise<{ emailAccountId: string }>;
}) {
  const { emailAccountId } = await props.params;
  await checkUserOwnsEmailAccount({ emailAccountId });

  return (
    <div className="max-w-canvas px-4 py-6 section-padding">
      <InsightsHeader />
      
      <div className="section-gap">
        <KPITiles emailAccountId={emailAccountId} />
      </div>
      
      <div className="section-gap">
        <TrendChart />
      </div>
      
      <div className="section-gap">
        <ActionableInsights emailAccountId={emailAccountId} />
      </div>
    </div>
  );
}

function InsightsHeader() {
  return (
    <div className="mb-6">
      <h1 className="text-h1 font-bold text-gray-900 mb-2">
        Insights
      </h1>
      <p className="text-body text-gray-600">
        Track your email patterns and productivity metrics
      </p>
    </div>
  );
}

function KPITiles({ emailAccountId }: { emailAccountId: string }) {
  const kpis = [
    {
      title: "Received (7d)",
      value: "247",
      change: "+12%",
      trend: "up" as const,
      icon: <MailIcon className="w-5 h-5 text-blue-500" />,
      action: () => {},
    },
    {
      title: "Awaiting reply",
      value: "6",
      change: "-2",
      trend: "down" as const,
      icon: <ClockIcon className="w-5 h-5 text-yellow-500" />,
      href: prefixPath(emailAccountId, "/r-zero"),
    },
    {
      title: "Avg response time",
      value: "2.4h",
      change: "-30min",
      trend: "down" as const,
      icon: <TrendingUpIcon className="w-5 h-5 text-green-500" />,
      action: () => {},
    },
    {
      title: "Top senders",
      value: "12",
      change: "Weekly",
      trend: "neutral" as const,
      icon: <UsersIcon className="w-5 h-5 text-purple-500" />,
      href: prefixPath(emailAccountId, "/stats"),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <KPITile key={index} {...kpi} />
      ))}
    </div>
  );
}

function KPITile({
  title,
  value,
  change,
  trend,
  icon,
  href,
  action,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
}) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const content = (
    <div
      className={`action-card group transition-all duration-200 ${
        (href || action) ? "cursor-pointer hover:shadow-lg" : ""
      }`}
      onClick={action}
      role={action && !href ? "button" : undefined}
      tabIndex={action && !href ? 0 : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        {(href || action) && (
          <ChevronRightIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className={`text-sm font-medium ${getTrendColor()}`}>
          {change}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function TrendChart() {
  // Mock data for demonstration
  const chartData = [
    { day: "Mon", emails: 45 },
    { day: "Tue", emails: 52 },
    { day: "Wed", emails: 38 },
    { day: "Thu", emails: 61 },
    { day: "Fri", emails: 28 },
    { day: "Sat", emails: 12 },
    { day: "Sun", emails: 8 },
  ];

  const maxValue = Math.max(...chartData.map(d => d.emails));

  return (
    <Card className="action-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Email Volume (7 days)</h3>
          <p className="text-sm text-gray-600">Daily email patterns this week</p>
        </div>
      </div>
      
      <div className="flex items-end justify-between h-48 gap-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="flex-1 flex items-end w-full">
              <div 
                className="w-full bg-indigo-500 rounded-t-sm hover:bg-indigo-600 transition-colors"
                style={{ 
                  height: `${(item.emails / maxValue) * 100}%`,
                  minHeight: '4px'
                }}
              />
            </div>
            <div className="text-xs font-medium text-gray-600 mt-2">
              {item.day}
            </div>
            <div className="text-xs text-gray-500">
              {item.emails}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActionableInsights({ emailAccountId }: { emailAccountId: string }) {
  const insights = [
    {
      title: "Most active senders",
      description: "Review your top email contacts",
      value: "12 senders",
      icon: <UsersIcon className="w-5 h-5 text-purple-500" />,
      href: prefixPath(emailAccountId, "/stats"),
    },
    {
      title: "Unread emails",
      description: "Process your pending messages",
      value: "23 unread",
      icon: <MailIcon className="w-5 h-5 text-blue-500" />,
      href: prefixPath(emailAccountId, "/mail"),
    },
    {
      title: "Newsletter cleanup",
      description: "Clean up subscription emails",
      value: "18 senders",
      icon: <TrendingUpIcon className="w-5 h-5 text-orange-500" />,
      href: prefixPath(emailAccountId, "/unsubscribe"),
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <Link key={index} href={insight.href}>
            <Card className="action-card group cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {insight.icon}
                  <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
              <div className="text-lg font-semibold text-indigo-600">
                {insight.value}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}