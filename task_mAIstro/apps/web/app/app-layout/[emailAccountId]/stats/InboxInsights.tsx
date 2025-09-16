"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChartLineUp,
  TrendUp,
  TrendDown,
  Clock,
  CheckCircle,
  Archive,
  Trash,
  Envelope,
  Users,
  Calendar,
  Lightning
} from "@phosphor-icons/react";

// Mock insight data
const INSIGHTS = [
  {
    id: 1,
    title: "Peak productivity detected",
    description: "You process emails 45% faster on Tuesday mornings",
    type: "productivity",
    impact: "high",
    timeframe: "last 30 days",
    metric: "+45%",
    trend: "up",
    actionable: true,
    suggestion: "Consider scheduling important email reviews for Tuesday 9-11am"
  },
  {
    id: 2,
    title: "Response time optimization",
    description: "Your average response time to clients improved by 2.3 hours",
    type: "performance", 
    impact: "medium",
    timeframe: "last 7 days",
    metric: "-2.3h",
    trend: "up",
    actionable: false,
    suggestion: null
  },
  {
    id: 3,
    title: "Newsletter overwhelm risk",
    description: "Marketing emails increased 78% but engagement dropped to 3%",
    type: "attention",
    impact: "high", 
    timeframe: "last 14 days",
    metric: "+78%",
    trend: "down",
    actionable: true,
    suggestion: "Consider enabling newsletter digest or bulk unsubscribing"
  },
  {
    id: 4,
    title: "Calendar conflict correlation",
    description: "Email response delays spike 3x during back-to-back meetings",
    type: "calendar",
    impact: "medium",
    timeframe: "ongoing",
    metric: "3x delay", 
    trend: "neutral",
    actionable: true,
    suggestion: "Block 15min buffers between meetings for email triage"
  }
];

const METRICS_SUMMARY = {
  emailsProcessed: 2847,
  timesSaved: "12.4h",
  responseTime: "2.1h", 
  automationRate: "67%",
  weeklyTrend: {
    processed: "+18%",
    saved: "+23%", 
    response: "-12%",
    automation: "+5%"
  }
};

const WEEKLY_PATTERN = [
  { day: "Mon", emails: 89, processed: 76, pending: 13 },
  { day: "Tue", emails: 123, processed: 118, pending: 5 },
  { day: "Wed", emails: 97, processed: 89, pending: 8 },
  { day: "Thu", emails: 145, processed: 132, pending: 13 },
  { day: "Fri", emails: 67, processed: 61, pending: 6 },
  { day: "Sat", emails: 23, processed: 18, pending: 5 },
  { day: "Sun", emails: 12, processed: 9, pending: 3 }
];

const TOP_SENDERS = [
  { name: "GitHub", emails: 234, category: "productivity", growth: "+12%" },
  { name: "Slack", emails: 189, category: "communication", growth: "-5%" },
  { name: "LinkedIn", emails: 156, category: "social", growth: "+78%" },
  { name: "Stripe", emails: 89, category: "business", growth: "+23%" },
  { name: "Calendar", emails: 67, category: "productivity", growth: "+4%" }
];

export function InboxInsights() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendUp size={16} className="text-green-600" />;
      case "down": return <TrendDown size={16} className="text-red-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ChartLineUp size={32} className="text-primary" />
              Inbox Insights
            </h1>
            <p className="text-muted-foreground">
              AI-powered analysis of your email patterns and productivity
            </p>
          </div>
          <div className="flex items-center gap-2">
            {["7d", "30d", "90d"].map((period) => (
              <Button
                key={period}
                size="sm"
                variant={selectedTimeframe === period ? "default" : "outline"}
                onClick={() => setSelectedTimeframe(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Envelope size={20} className="text-primary" />
              <Badge className="bg-green-50 text-green-700">
                {METRICS_SUMMARY.weeklyTrend.processed}
              </Badge>
            </div>
            <div className="text-2xl font-bold">{METRICS_SUMMARY.emailsProcessed}</div>
            <div className="text-sm text-muted-foreground">Emails processed</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock size={20} className="text-primary" />
              <Badge className="bg-green-50 text-green-700">
                {METRICS_SUMMARY.weeklyTrend.saved}
              </Badge>
            </div>
            <div className="text-2xl font-bold">{METRICS_SUMMARY.timesSaved}</div>
            <div className="text-sm text-muted-foreground">Time saved</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle size={20} className="text-primary" />
              <Badge className="bg-blue-50 text-blue-700">
                {METRICS_SUMMARY.weeklyTrend.response}
              </Badge>
            </div>
            <div className="text-2xl font-bold">{METRICS_SUMMARY.responseTime}</div>
            <div className="text-sm text-muted-foreground">Avg response time</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Lightning size={20} className="text-primary" />
              <Badge className="bg-purple-50 text-purple-700">
                {METRICS_SUMMARY.weeklyTrend.automation}
              </Badge>
            </div>
            <div className="text-2xl font-bold">{METRICS_SUMMARY.automationRate}</div>
            <div className="text-sm text-muted-foreground">Automation rate</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Insights */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">AI-Powered Insights</h2>
            {INSIGHTS.map((insight) => (
              <Card key={insight.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium">{insight.title}</div>
                      {getTrendIcon(insight.trend)}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{insight.timeframe}</span>
                      <span>•</span>
                      <span className="font-medium">{insight.metric}</span>
                    </div>
                  </div>
                  <Badge className={`${getImpactColor(insight.impact)} text-xs`}>
                    {insight.impact}
                  </Badge>
                </div>
                
                {insight.actionable && insight.suggestion && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">💡 Suggestion:</div>
                    <div className="text-sm">{insight.suggestion}</div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Weekly Pattern & Top Senders */}
          <div className="space-y-6">
            {/* Weekly Pattern */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Weekly Pattern</h2>
              <Card className="p-4">
                <div className="space-y-3">
                  {WEEKLY_PATTERN.map((day) => (
                    <div key={day.day} className="flex items-center gap-4">
                      <div className="w-12 text-sm font-medium">{day.day}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-sm">{day.emails} emails</span>
                          <span className="text-xs text-muted-foreground">
                            ({day.processed} processed)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(day.processed / day.emails) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Top Senders */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Top Senders</h2>
              <Card className="p-4">
                <div className="space-y-3">
                  {TOP_SENDERS.map((sender, index) => (
                    <div key={sender.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-muted-foreground">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{sender.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {sender.category}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{sender.emails}</div>
                        <div className={`text-xs ${
                          sender.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {sender.growth}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Action Center */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lightning size={20} />
            Recommended Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-blue-200 bg-blue-50/50 rounded-lg">
              <Users size={20} className="text-blue-600 mb-2" />
              <div className="font-medium mb-1">Optimize Newsletter Digests</div>
              <div className="text-sm text-muted-foreground mb-3">
                Bundle 23 low-engagement senders into daily digest
              </div>
              <Button size="sm" className="w-full">Set Up Digest</Button>
            </div>

            <div className="p-4 border border-purple-200 bg-purple-50/50 rounded-lg">
              <Calendar size={20} className="text-purple-600 mb-2" />
              <div className="font-medium mb-1">Schedule Email Blocks</div>
              <div className="text-sm text-muted-foreground mb-3">
                Add focused email time to your calendar
              </div>
              <Button size="sm" variant="outline" className="w-full">
                Add to Calendar
              </Button>
            </div>

            <div className="p-4 border border-green-200 bg-green-50/50 rounded-lg">
              <Archive size={20} className="text-green-600 mb-2" />
              <div className="font-medium mb-1">Auto-Archive Rules</div>
              <div className="text-sm text-muted-foreground mb-3">
                Create rules for your 7 lowest-engagement senders
              </div>
              <Button size="sm" variant="outline" className="w-full">
                Create Rules
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}