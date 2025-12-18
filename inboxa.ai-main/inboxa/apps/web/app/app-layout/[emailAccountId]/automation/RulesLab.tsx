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

export function RulesLab() {
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const ACTIVE_RULES: any[] = [];
  const RULE_TEMPLATES: any[] = [];
  const TEST_SCENARIOS: any[] = [];

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
              {ACTIVE_RULES.length === 0 ? (
                <Card className="p-8 text-center">
                  <Flask size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <div className="font-medium mb-2">No automation rules yet</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Create your first rule to automate email management
                  </div>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus size={16} className="mr-2" />
                    Create Your First Rule
                  </Button>
                </Card>
              ) : (
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
              )}
            </div>

            {/* Rule Templates */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Rule Templates</h2>
              {RULE_TEMPLATES.length === 0 ? (
                <Card className="p-6 text-center text-muted-foreground">
                  <div className="text-sm">No templates available</div>
                </Card>
              ) : (
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
              )}
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
                {TEST_SCENARIOS.length === 0 ? (
                  <Card className="p-4 text-center text-sm text-muted-foreground">
                    No test results yet
                  </Card>
                ) : (
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
                )}
              </div>
            </div>

            {/* Rule Performance */}
            <Card className="p-4">
              <h3 className="font-medium mb-3">Performance</h3>
              <div className="space-y-3 text-sm text-muted-foreground text-center py-4">
                No performance data available yet
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