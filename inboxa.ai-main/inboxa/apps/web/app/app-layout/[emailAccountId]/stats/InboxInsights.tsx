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

// Real data will be fetched from API
const INSIGHTS: any[] = [];
const METRICS_SUMMARY = {
  emailsProcessed: 0,
  timesSaved: "0h",
  responseTime: "0h", 
  automationRate: "0%",
  weeklyTrend: {
    processed: "0%",
    saved: "0%", 
    response: "0%",
    automation: "0%"
  }
};
const WEEKLY_PATTERN: any[] = [];
const TOP_SENDERS: any[] = [];

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
            </div>
            <div className="text-2xl font-bold">{METRICS_SUMMARY.emailsProcessed}</div>
            <div className="text-sm text-muted-foreground">Emails processed</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock size={20} className="text-primary" />
            </div>
            <div className="text-2xl font-bold">{METRICS_SUMMARY.timesSaved}</div>
            <div className="text-sm text-muted-foreground">Time saved</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle size={20} className="text-primary" />
            </div>
            <div className="text-2xl font-bold">{METRICS_SUMMARY.responseTime}</div>
            <div className="text-sm text-muted-foreground">Avg response time</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Lightning size={20} className="text-primary" />
            </div>
            <div className="text-2xl font-bold">{METRICS_SUMMARY.automationRate}</div>
            <div className="text-sm text-muted-foreground">Automation rate</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Insights */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">AI-Powered Insights</h2>
            {INSIGHTS.length === 0 ? (
              <Card className="p-8 text-center">
                <ChartLineUp size={48} className="mx-auto mb-4 text-muted-foreground" />
                <div className="font-medium mb-2">No insights available yet</div>
                <div className="text-sm text-muted-foreground">
                  Insights will appear here as you use the app
                </div>
              </Card>
            ) : (
              INSIGHTS.map((insight) => (
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
              ))
            )}
          </div>

          {/* Weekly Pattern & Top Senders */}
          <div className="space-y-6">
            {/* Weekly Pattern */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Weekly Pattern</h2>
              <Card className="p-4">
                {WEEKLY_PATTERN.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No weekly pattern data available
                  </div>
                ) : (
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
                )}
              </Card>
            </div>

            {/* Top Senders */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Top Senders</h2>
              <Card className="p-4">
                {TOP_SENDERS.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No sender data available
                  </div>
                ) : (
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
                )}
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
          <div className="text-center text-sm text-muted-foreground py-8">
            No recommended actions available yet
          </div>
        </Card>
      </div>
    </div>
  );
}