"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ScissorsIcon,
  CalendarIcon,
  MoreVerticalIcon,
  ShieldIcon,
  ArchiveIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  MailIcon,
} from "lucide-react";

interface Sender {
  id: string;
  email: string;
  name: string;
  count: number;
  readRate: number;
  archivedRate: number;
  lastSeen: string;
  risk: "low" | "medium" | "high";
  method: "unsubscribe" | "block" | "skip";
  examples?: Array<{
    subject: string;
    date: string;
    snippet: string;
  }>;
}

interface UnsubscribePageClientProps {
  emailAccountId: string;
}

// Mock data
const mockSenders: Sender[] = [
  {
    id: "1",
    email: "newsletter@techcrunch.com",
    name: "TechCrunch",
    count: 45,
    readRate: 15,
    archivedRate: 85,
    lastSeen: "2 days ago",
    risk: "low",
    method: "unsubscribe",
    examples: [
      {
        subject: "The daily crunch: Meta's new AR glasses",
        date: "2 days ago",
        snippet: "Meta unveiled its newest augmented reality glasses at Connect 2024..."
      },
      {
        subject: "Tesla's robotaxi event: What to expect",
        date: "1 week ago", 
        snippet: "Elon Musk will unveil Tesla's long-awaited robotaxi service..."
      }
    ]
  },
  {
    id: "2",
    email: "deals@amazon.com",
    name: "Amazon Deals",
    count: 28,
    readRate: 25,
    archivedRate: 75,
    lastSeen: "1 day ago",
    risk: "medium",
    method: "unsubscribe"
  },
  {
    id: "3",
    email: "updates@linkedin.com",
    name: "LinkedIn",
    count: 22,
    readRate: 45,
    archivedRate: 55,
    lastSeen: "Today",
    risk: "low",
    method: "skip",
  },
];

export function UnsubscribePageClient({ emailAccountId }: UnsubscribePageClientProps) {
  const [selectedSenders, setSelectedSenders] = useState<Set<string>>(new Set());
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSender, setSelectedSender] = useState<Sender | null>(null);
  const [sweepModalOpen, setSweepModalOpen] = useState(false);
  const [sweepProgress, setSweepProgress] = useState(0);
  const [dateRange] = useState("Last 90 days");

  const totalSenders = mockSenders.length;
  const totalEmails = mockSenders.reduce((sum, sender) => sum + sender.count, 0);

  const handleSelectSender = (senderId: string, checked: boolean) => {
    const newSelected = new Set(selectedSenders);
    if (checked) {
      newSelected.add(senderId);
    } else {
      newSelected.delete(senderId);
    }
    setSelectedSenders(newSelected);
  };

  const handleSenderClick = (sender: Sender) => {
    setSelectedSender(sender);
    setDetailsOpen(true);
  };

  const handleRunSweep = () => {
    setSweepModalOpen(true);
    setSweepProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setSweepProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">Safe</span>;
      case "medium":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">Review</span>;
      case "high":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">Risky</span>;
      default:
        return null;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "unsubscribe":
        return <ScissorsIcon className="w-4 h-4 text-orange-500" />;
      case "block":
        return <ShieldIcon className="w-4 h-4 text-red-500" />;
      case "skip":
        return <ArchiveIcon className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-canvas px-4 py-6 section-padding">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-h1 font-bold text-gray-900 mb-2">
          Unsubscribe & Archive
        </h1>
        <p className="text-body text-gray-600">
          Clean up newsletters and promotional emails with one sweep
        </p>
      </div>

      {/* Summary Bar */}
      <Card className="action-card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalSenders}</div>
              <div className="text-sm text-gray-600">senders found</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalEmails}</div>
              <div className="text-sm text-gray-600">total emails</div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarIcon className="w-4 h-4" />
              {dateRange}
            </div>
          </div>
          <Button 
            onClick={handleRunSweep}
            disabled={selectedSenders.size === 0}
            className="btn-primary flex items-center gap-2"
          >
            <ScissorsIcon className="w-4 h-4" />
            Run sweep ({selectedSenders.size})
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card className="action-card">
        <div className="overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-700">
            <div className="col-span-1">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedSenders(new Set(mockSenders.map(s => s.id)));
                  } else {
                    setSelectedSenders(new Set());
                  }
                }}
                checked={selectedSenders.size === mockSenders.length}
              />
            </div>
            <div className="col-span-3">Sender</div>
            <div className="col-span-2">Emails</div>
            <div className="col-span-1">Read%</div>
            <div className="col-span-1">Archived%</div>
            <div className="col-span-2">Last seen</div>
            <div className="col-span-1">Risk</div>
            <div className="col-span-1">Action</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-200">
            {mockSenders.map((sender) => (
              <div
                key={sender.id}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSenderClick(sender)}
              >
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedSenders.has(sender.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectSender(sender.id, e.target.checked);
                    }}
                  />
                </div>
                <div className="col-span-3">
                  <div className="font-medium text-gray-900">{sender.name}</div>
                  <div className="text-sm text-gray-500">{sender.email}</div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${Math.min(sender.count / 50 * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{sender.count}</span>
                  </div>
                </div>
                <div className="col-span-1 text-sm text-gray-700">
                  {sender.readRate}%
                </div>
                <div className="col-span-1 text-sm text-gray-700">
                  {sender.archivedRate}%
                </div>
                <div className="col-span-2 text-sm text-gray-700">
                  {sender.lastSeen}
                </div>
                <div className="col-span-1">
                  {getRiskBadge(sender.risk)}
                </div>
                <div className="col-span-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreVerticalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <ScissorsIcon className="w-4 h-4 mr-2" />
                        Unsubscribe
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ShieldIcon className="w-4 h-4 mr-2" />
                        Block sender
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ArchiveIcon className="w-4 h-4 mr-2" />
                        Skip inbox
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MailIcon className="w-5 h-5 text-blue-500" />
              {selectedSender?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSender && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <div className="text-gray-900">{selectedSender.email}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Total emails:</span>
                  <div className="text-gray-900">{selectedSender.count}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Read rate:</span>
                  <div className="text-gray-900">{selectedSender.readRate}%</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Risk level:</span>
                  <div>{getRiskBadge(selectedSender.risk)}</div>
                </div>
              </div>
              
              {selectedSender.examples && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recent emails:</h4>
                  <div className="space-y-3">
                    {selectedSender.examples.map((example, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="font-medium text-gray-900 mb-1">
                          {example.subject}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          {example.date}
                        </div>
                        <div className="text-sm text-gray-700">
                          {example.snippet}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4 border-t">
                <Button className="btn-primary flex items-center gap-2">
                  <ScissorsIcon className="w-4 h-4" />
                  Unsubscribe
                </Button>
                <Button variant="outline" className="btn-secondary">
                  Skip this sender
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sweep Progress Modal */}
      <Dialog open={sweepModalOpen} onOpenChange={setSweepModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScissorsIcon className="w-5 h-5 text-orange-500" />
              Running sweep...
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{sweepProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${sweepProgress}%` }}
                />
              </div>
            </div>
            
            {sweepProgress === 100 ? (
              <div className="text-center">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <div className="font-medium text-gray-900 mb-1">
                  Sweep completed!
                </div>
                <div className="text-sm text-gray-600">
                  Processed {selectedSenders.size} senders
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-gray-600">
                Processing {selectedSenders.size} senders...
              </div>
            )}
            
            <div className="flex gap-2">
              {sweepProgress === 100 ? (
                <>
                  <Button 
                    onClick={() => setSweepModalOpen(false)}
                    className="flex-1 btn-primary"
                  >
                    Done
                  </Button>
                  <Button 
                    variant="outline"
                    className="btn-secondary"
                  >
                    Undo
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline"
                  className="w-full btn-secondary"
                  onClick={() => {
                    setSweepModalOpen(false);
                    setSweepProgress(0);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}