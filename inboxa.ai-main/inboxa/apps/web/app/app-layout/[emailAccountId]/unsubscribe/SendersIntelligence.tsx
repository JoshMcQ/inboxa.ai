"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingContent } from "@/components/LoadingContent";
import { Users, Mail, X } from "lucide-react";

// Use real Gmail sender analytics from API
interface SenderData {
  name: string;
  value: number;
  domain?: string;
  category?: string;
  engagement?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

interface SendersResponse {
  mostActiveSenderEmails: SenderData[];
  mostActiveSenderDomains: SenderData[];
}

export function SendersIntelligence() {
  const [selectedSender, setSelectedSender] = useState<SenderData | null>(null);
  
  // Fetch real sender statistics from Gmail API
  const { data, error, isLoading } = useSWR<SendersResponse>(
    "/api/user/stats/senders",
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch sender stats');
      return response.json();
    }
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Senders Intelligence</h1>
            <p className="text-muted-foreground">
              Real-time insights into your email senders
            </p>
          </div>
        </div>

        {/* Sender Analytics */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users size={20} />
            Sender Analytics
          </h2>
          <LoadingContent loading={isLoading} error={error}>
            <div className="grid gap-4 md:grid-cols-2">
              {data?.mostActiveSenderEmails?.slice(0, 8).map((sender, index) => (
                <Card 
                  key={`${sender.name}-${index}`} 
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedSender(sender)}
                >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-medium truncate">{sender.name}</div>
                    <div className="text-sm text-muted-foreground">{sender.name.split('@')[1] || 'Unknown domain'}</div>
                  </div>
                  <Badge variant="outline">
                    Top Sender
                  </Badge>
                </div>

                <div className="text-center mb-3">
                  <div className="text-2xl font-bold">{sender.value}</div>
                  <div className="text-xs text-muted-foreground">Total emails</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Active sender
                  </div>
                  <Mail size={16} className="text-blue-600" />
                </div>
              </Card>
              ))}
            </div>
          </LoadingContent>
        </div>

        {/* Sender Detail Drawer */}
        {selectedSender && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="font-semibold">{selectedSender.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedSender.name.split('@')[1]}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelectedSender(null)}>
                  <X size={16} />
                </Button>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Stats */}
                <div>
                  <h4 className="font-medium mb-2">Email Volume</h4>
                  <div className="text-2xl font-bold">{selectedSender.value}</div>
                  <div className="text-sm text-muted-foreground">Total emails received</div>
                </div>

                {/* Volume Chart */}
                <div>
                  <h4 className="font-medium mb-2">Volume Trend</h4>
                  <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                    <Mail size={48} className="text-muted-foreground" />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Analysis based on recent email history
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <Mail size={16} className="mr-2" />
                      View All Emails
                    </Button>
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <Users size={16} className="mr-2" />
                      Sender Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
