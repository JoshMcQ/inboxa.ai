// Stub implementations for missing external packages

// @inboxzero/loops stubs
export const loops = {
  deleteContact: async (email: string) => {
    console.warn('@inboxzero/loops not configured - deleteContact stub');
    return Promise.resolve();
  },
  switchedPremiumPlan: async (data: any) => {
    console.warn('@inboxzero/loops not configured - switchedPremiumPlan stub');
    return Promise.resolve();
  },
  startedTrial: async (data: any) => {
    console.warn('@inboxzero/loops not configured - startedTrial stub');
    return Promise.resolve();
  },
  createContact: async (email: string, name?: string) => {
    console.warn('@inboxzero/loops not configured - createContact stub');
    return Promise.resolve();
  },
  completedTrial: async (email: string, tier?: any) => {
    console.warn('@inboxzero/loops not configured - completedTrial stub');
    return Promise.resolve();
  },
  cancelledPremium: async (email: string) => {
    console.warn('@inboxzero/loops not configured - cancelledPremium stub');
    return Promise.resolve();
  }
};

// @inboxzero/resend stubs
export const resend = {
  deleteContact: async (email: string) => {
    console.warn('@inboxzero/resend not configured - deleteContact stub');
    return Promise.resolve();
  },
  createContact: async (data: any) => {
    console.warn('@inboxzero/resend not configured - createContact stub');
    return Promise.resolve();
  },
  sendDigestEmail: async (data: any) => {
    console.warn('@inboxzero/resend not configured - sendDigestEmail stub');
    return Promise.resolve();
  },
  sendSummaryEmail: async (data: any) => {
    console.warn('@inboxzero/resend not configured - sendSummaryEmail stub');
    return Promise.resolve();
  }
};

// @inboxzero/tinybird stubs
export const tinybird = {
  zodPeriod: {
    parse: (data: any) => data
  },
  getEmailActionsByDay: async (data: any) => {
    console.warn('@inboxzero/tinybird not configured - getEmailActionsByDay stub');
    return Promise.resolve({ data: [] });
  }
};

// @inboxzero/tinybird-ai-analytics stubs
export const tinybirdAiAnalytics = {
  publishAiCall: async (data: any) => {
    console.warn('@inboxzero/tinybird-ai-analytics not configured - publishAiCall stub');
    return Promise.resolve();
  },
  deleteTinybirdAiCalls: async (data: any) => {
    console.warn('@inboxzero/tinybird-ai-analytics not configured - deleteTinybirdAiCalls stub');
    return Promise.resolve();
  }
};

// Type exports
export type ZodPeriod = any;