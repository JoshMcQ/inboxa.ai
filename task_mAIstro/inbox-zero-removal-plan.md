# Plan to Remove All "Inbox Zero" References

## Overview
This document outlines the plan to replace all instances of "Inbox Zero" with "InboxaAI" throughout the application, and to replace "Reply Zero" with "Reply Manager".

## Identified Changes

### 1. Login Page
- **File**: `apps/web/app/(landing)/login/LoginForm.tsx`
- **Line**: 46
- **Change**: Replace "Inbox Zero's" with "InboxaAI's"

### 2. Email Templates
- **File**: `packages/resend/emails/summary.tsx`
  - Line 67: alt="Inbox Zero" → alt="InboxaAI"
  - Line 74: "Inbox Zero" → "InboxaAI"
  - Line 348: "Inbox Zero stats" → "InboxaAI stats"

- **File**: `packages/resend/emails/digest.tsx`
  - Line 485: alt="Inbox Zero" → alt="InboxaAI"
  - Line 492: "Inbox Zero" → "InboxaAI"
  - Line 771: "Inbox Zero settings" → "InboxaAI settings"

### 3. UI Components
- **File**: `apps/web/components/ReferralDialog.tsx`
  - Line 75: "Join Inbox Zero" → "Join InboxaAI"
  - Line 107: "Share Inbox Zero" → "Share InboxaAI"

- **File**: `apps/web/components/email-list/EmailList.tsx`
  - Line 152: "You made it to Inbox Zero!" → "You've cleared your inbox with InboxaAI!"

- **File**: `apps/web/components/Celebration.tsx`
  - Line 37: "I made it to Inbox Zero thanks to @inboxzero_ai!" → "I cleared my inbox thanks to @inboxaAI!"

### 4. Reply Zero → Reply Manager
- **File**: `apps/web/components/TopNav.tsx`
  - Line 60: "Reply Zero" → "Reply Manager"
  - Line 61: href path "/reply-zero" → "/reply-manager"

- **File**: `apps/web/app/app-layout/[emailAccountId]/setup/page.tsx`
  - Line 113: "Reply Zero" → "Reply Manager"

- **File**: `apps/web/app/app-layout/[emailAccountId]/r-zero/EnableReplyTracker.tsx`
  - Line 31: "Reply Zero" → "Reply Manager"
  - Line 36: "Reply Zero only shows" → "Reply Manager only shows"
  - Line 60: "Enable Reply Zero" → "Enable Reply Manager"
  - Line 73: "Error enabling Reply Zero" → "Error enabling Reply Manager"
  - Line 78: "Reply Zero enabled" → "Reply Manager enabled"
  - Line 79: "We've enabled Reply Zero" → "We've enabled Reply Manager"

- **File**: `apps/web/app/app-layout/redirects/r-zero/page.tsx`
  - Line 3: function name "ReplyZeroPage" → "ReplyManagerPage"
  - Line 4: path "/reply-zero" → "/reply-manager"

### 5. Analytics and Stats
- **File**: `apps/web/app/app-layout/[emailAccountId]/stats/EmailActionsAnalytics.tsx`
  - Line 27: "archived and deleted with Inbox Zero" → "archived and deleted with InboxaAI"

- **File**: `apps/web/app/app-layout/[emailAccountId]/stats/Stats.tsx`
  - Line 107: "handled with Inbox Zero bulk unsubscribe" → "handled with InboxaAI bulk unsubscribe"

### 6. Page Metadata
- **File**: `apps/web/app/(landing)/terms/page.tsx`
  - Lines 5-6: "Terms of Service - Inbox Zero" → "Terms of Service - InboxaAI"

- **File**: `apps/web/app/(landing)/privacy/page.tsx`
  - Lines 5-6: "Privacy Policy - Inbox Zero" → "Privacy Policy - InboxaAI"

- **File**: `apps/web/app/(landing)/oss-friends/page.tsx`
  - Line 13: "Open Source Friends | Inbox Zero" → "Open Source Friends | InboxaAI"

### 7. Welcome and Onboarding
- **File**: `apps/web/app/(landing)/welcome-upgrade/page.tsx`
  - Line 20: "Join {userCount} users that use Inbox Zero" → "Join {userCount} users that use InboxaAI"

### 8. Settings and Permissions
- **File**: `apps/web/app/app-layout/[emailAccountId]/settings/ApiKeysSection.tsx`
  - Line 27: "access the Inbox Zero API" → "access the InboxaAI API"

- **File**: `apps/web/app/app-layout/[emailAccountId]/permissions/error/page.tsx`
  - Line 16: "for Inbox Zero to work" → "for InboxaAI to work"

- **File**: `apps/web/app/app-layout/[emailAccountId]/permissions/consent/page.tsx`
  - Line 16: "for Inbox Zero to work" → "for InboxaAI to work"

### 9. Function and Variable Names
- **File**: `apps/web/app/app-layout/[emailAccountId]/assess.tsx`
  - Line 5: import "whitelistInboxZeroAction" → "whitelistInboxaAIAction"
  - Line 17: "executeWhitelistInboxZero" → "executeWhitelistInboxaAI"
  - Line 18: "whitelistInboxZeroAction" → "whitelistInboxaAIAction"
  - Line 32: "executeWhitelistInboxZero" → "executeWhitelistInboxaAI"

- **File**: `apps/web/app/app-layout/[emailAccountId]/assistant/Rules.tsx`
  - Line 53: import "inboxZeroLabels" → "inboxaAILabels"
  - Line 124: "inboxZeroLabels" → "inboxaAILabels"

### 10. Other References
- **File**: `apps/web/app/(landing)/home/HeroAB.tsx`
  - Line 20: "reach inbox zero in record time" → "clear your inbox in record time"

- **File**: `apps/web/app/app-layout/early-access/page.tsx`
  - Line 38: "Use the Inbox Zero email client" → "Use the InboxaAI email client"
  - Line 49: "Inbox Zero Daily Challenge" → "InboxaAI Daily Challenge"

- **File**: `apps/web/app/app-layout/accounts/page.tsx`
  - Line 83: "This will delete all data for it on Inbox Zero" → "This will delete all data for it on InboxaAI"

- **File**: `apps/web/app/app-layout/accounts/AddAccount.tsx`
  - Line 80: "already have an Inbox Zero account?" → "already have an InboxaAI account?"

## Route Changes Required
1. `/reply-zero` → `/reply-manager`
2. `/r-zero` → `/r-manager` (redirect path)
3. Update all internal links and navigation references

## Additional Considerations
1. Check for any API endpoints that might reference "inbox-zero" or "reply-zero"
2. Update any environment variables or configuration files
3. Search for any CSS classes or IDs that might contain "inbox-zero"
4. Update any documentation or README files
5. Check for any external integrations or webhooks that might need updating

## Testing Plan
1. Test all changed pages to ensure they load correctly
2. Verify all navigation links work with new routes
3. Test email templates render correctly with new branding
4. Ensure all functionality related to Reply Manager works
5. Check that all metadata and SEO tags are updated
6. Verify social sharing functionality with new text