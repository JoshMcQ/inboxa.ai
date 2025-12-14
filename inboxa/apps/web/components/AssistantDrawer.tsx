"use client";

import React, { useState } from "react";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import {
  XIcon,
  MessageSquareIcon,
  SparklesIcon,
  ChevronRightIcon
} from "lucide-react";

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface RecentChat {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
}

interface ContextItem {
  type: "urgent" | "awaiting" | "newsletter";
  count: number;
  label: string;
  action?: () => void;
}

const mockRecentChats: RecentChat[] = [
  {
    id: "1",
    title: "Email triage session",
    timestamp: "2 hours ago",
    preview: "Processed 12 emails, drafted 3 replies..."
  },
  {
    id: "2", 
    title: "Weekly cleanup",
    timestamp: "Yesterday",
    preview: "Unsubscribed from 8 newsletters..."
  }
];

const mockContext: ContextItem[] = [
  { type: "urgent", count: 4, label: "Urgent emails" },
  { type: "awaiting", count: 6, label: "Awaiting reply" },
  { type: "newsletter", count: 18, label: "Top newsletters" }
];

const suggestedPrompts = [
  "Summarize today's inbox",
  "Draft replies to urgent emails", 
  "Review top newsletters",
  "Schedule focus time"
];

export function AssistantDrawer({ isOpen, onClose, className }: AssistantDrawerProps) {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full bg-white shadow-2xl z-50 transition-transform duration-300 ease-out",
          "lg:w-96 lg:border-l lg:border-gray-200 lg:shadow-none",
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Assistant</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <XIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Context bar with suggestions */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="text-sm text-gray-600 mb-2">Quick actions:</div>
          <div className="flex flex-wrap gap-1">
            {suggestedPrompts.slice(0, 2).map((prompt, index) => (
              <button
                key={index}
                className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => setInputValue(prompt)}
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Context Items */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Context</h3>
          <div className="space-y-2">
            {mockContext.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center justify-between p-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                onClick={item.action}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    item.type === "urgent" && "bg-red-500",
                    item.type === "awaiting" && "bg-yellow-500", 
                    item.type === "newsletter" && "bg-blue-500"
                  )} />
                  <span className="text-gray-700">{item.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-gray-900">{item.count}</span>
                  <ChevronRightIcon className="w-3 h-3 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Chats */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Recent</h3>
          <div className="space-y-2">
            {mockRecentChats.map((chat) => (
              <button
                key={chat.id}
                className={cn(
                  "w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors",
                  activeChat === chat.id && "bg-blue-50 border border-blue-200"
                )}
                onClick={() => setActiveChat(chat.id)}
              >
                <div className="flex items-start gap-2">
                  <MessageSquareIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {chat.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {chat.timestamp}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 truncate">
                      {chat.preview}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full px-3 py-2 border border-gray-300 rounded-control text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // Handle send
                    console.log('Send:', inputValue);
                    setInputValue('');
                  }
                }}
              />
            </div>
          </div>
          
          {/* Hints */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            Enter to send - ⌘+Enter new line
          </div>
        </div>
      </div>
    </>
  );
}
