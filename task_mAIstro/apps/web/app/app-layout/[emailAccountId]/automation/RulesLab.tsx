"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Input components temporarily removed to fix compilation
import { 
  Flask,
  Play,
  Pause,
  Plus,
  TestTube,
  Bug,
  CheckCircle,
  XCircle,
  Lightning,
  Archive,
  Tag,
  ChatCircle
} from "@phosphor-icons/react";

// Mock data
const ACTIVE_RULES = [
  {
    id: 1,
    name: "Auto-archive newsletters", 
    description: "Archive emails from marketing senders with low engagement",
    trigger: "sender_category = 'marketing' AND engagement < 5%",
    action: "archive",
    status: "active",
    executions: 1247,
    lastRun: "2h ago",
    successRate: 98
  },
  {
    id: 2,
    name: "Priority client alerts",
    description: "Flag emails from VIP clients for immediate attention", 
    trigger: "sender_domain IN ['stripe.com', 'bigclient.com'] OR subject CONTAINS 'urgent'",
    action: "priority_flag",
    status: "active", 
    executions: 89,
    lastRun: "15m ago",
    successRate: 100
  },
  {
    id: 3,
    name: "Receipt organization",
    description: "Auto-label and categorize purchase receipts",
    trigger: "subject CONTAINS ['receipt', 'invoice', 'payment'] AND sender_trusted = true",
    action: "label:receipts",
    status: "paused",
    executions: 456,
    lastRun: "1d ago", 
    successRate: 94
  }
];

const RULE_TEMPLATES = [
  {
    name: "Newsletter Digest",
    description: "Bundle low-priority newsletters into daily digest",
    category: "productivity"
  },
  {
    name: "Meeting Prep", 
    description: "Extract calendar events and related emails",
    category: "calendar"
  },
  {
    name: "Support Ticket Routing",
    description: "Automatically categorize and assign support emails",
    category: "support"
  },
  {
    name: "Invoice Processing",
    description: "Extract and forward financial documents", 
    category: "finance"
  }
];

const TEST_SCENARIOS = [
  {
    id: 1,
    name: "High-volume marketing sender",
    description: "Testing newsletter archiving rule",
    status: "passed",
    emails: 23
  },
  {
    id: 2, 
    name: "Client urgent request",
    description: "Priority flagging for VIP senders",
    status: "passed",
    emails: 1
  },
  {
    id: 3,
    name: "Receipt from unknown sender", 
    description: "Testing receipt categorization edge case",
    status: "failed", 
    emails: 1
  }
];

export function RulesLab() {
  const [selectedRule, setSelectedRule] = useState<typeof ACTIVE_RULES[0] | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Flask size={32} className="text-primary" />
              Rules Lab
            </h1>
            <p className="text-muted-foreground">
              Experiment with email automation rules and test them safely
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus size={16} className="mr-2" />
            Create Rule
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Rules Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Rules */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Rules</h2>
              <div className="space-y-3">
                {ACTIVE_RULES.map((rule) => (
                  <Card 
                    key={rule.id} 
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedRule(rule)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium">{rule.name}</div>
                          <Badge variant={rule.status === "active" ? "default" : "outline"}>
                            {rule.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{rule.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          <TestTube size={16} />
                        </Button>
                        <Button size="sm" variant="ghost">
                          {rule.status === "active" ? <Pause size={16} /> : <Play size={16} />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">{rule.executions}</div>
                        <div className="text-muted-foreground">Executions</div>
                      </div>
                      <div>
                        <div className="font-medium">{rule.successRate}%</div>
                        <div className="text-muted-foreground">Success rate</div>
                      </div>
                      <div>
                        <div className="font-medium">{rule.lastRun}</div>
                        <div className="text-muted-foreground">Last run</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Rule Templates */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Rule Templates</h2>
              <div className="grid grid-cols-2 gap-3">
                {RULE_TEMPLATES.map((template) => (
                  <Card key={template.name} className="p-3 cursor-pointer hover:bg-muted/50">
                    <div className="font-medium mb-1">{template.name}</div>
                    <div className="text-sm text-muted-foreground mb-2">{template.description}</div>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Test Bench */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TestTube size={20} />
                Test Bench
              </h2>
              
              {/* Quick Test */}
              <Card className="p-4 mb-4">
                <h3 className="font-medium mb-3">Quick Test</h3>
                <div className="space-y-3">
                  <input 
                    className="w-full px-3 py-2 border rounded-md" 
                    placeholder="Enter email subject..." 
                  />
                  <input 
                    className="w-full px-3 py-2 border rounded-md" 
                    placeholder="Enter sender email..." 
                  />
                  <Button className="w-full" size="sm">
                    <Lightning size={16} className="mr-2" />
                    Test Rules
                  </Button>
                </div>
              </Card>

              {/* Recent Tests */}
              <div>
                <h3 className="font-medium mb-3">Recent Tests</h3>
                <div className="space-y-2">
                  {TEST_SCENARIOS.map((test) => (
                    <Card key={test.id} className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-sm">{test.name}</div>
                        {test.status === "passed" ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <XCircle size={16} className="text-red-600" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {test.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {test.emails} emails tested
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Rule Performance */}
            <Card className="p-4">
              <h3 className="font-medium mb-3">Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total executions</span>
                  <span className="font-medium">1,792</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Success rate</span>
                  <span className="font-medium text-green-600">97.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Emails processed</span>
                  <span className="font-medium">23,456</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Time saved</span>
                  <span className="font-medium">~8.4 hrs</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Rule Editor Modal */}
        {(isCreating || selectedRule) && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 bg-background border rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {isCreating ? "Create New Rule" : `Edit ${selectedRule?.name}`}
                </h3>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => { setIsCreating(false); setSelectedRule(null); }}
                >
                  ×
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-6 h-full">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Rule Name</label>
                    <input 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      defaultValue={selectedRule?.name} 
                      placeholder="Enter rule name..." 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <input 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      defaultValue={selectedRule?.description} 
                      placeholder="Describe what this rule does..." 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Trigger Conditions</label>
                    <textarea 
                      className="w-full px-3 py-2 border rounded-md mt-1 h-32"
                      defaultValue={selectedRule?.trigger} 
                      placeholder="sender_domain = 'example.com' AND subject CONTAINS 'newsletter'"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Actions</label>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm">
                        <Archive size={16} className="mr-1" /> Archive
                      </Button>
                      <Button variant="outline" size="sm">
                        <Tag size={16} className="mr-1" /> Label
                      </Button>
                      <Button variant="outline" size="sm">
                        <ChatCircle size={16} className="mr-1" /> Auto-reply
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Rule Preview</h4>
                  <Card className="p-4 bg-muted/50 h-64">
                    <div className="text-sm text-muted-foreground">
                      Rule logic will be validated and previewed here...
                    </div>
                  </Card>
                  
                  <div className="flex gap-2 mt-4">
                    <Button className="flex-1">
                      <TestTube size={16} className="mr-2" />
                      Test Rule
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Save Draft
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