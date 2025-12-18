# Newsletter Stats API - Notes

## Rate Limiting Issue (2025-01-XX)

The `/api/user/stats/newsletters` endpoint currently experiences Gmail API rate limiting (429 errors) when fetching large numbers of messages.

### Current Behavior
- The endpoint queries Gmail directly for message data
- When fetching 100+ messages, Gmail returns 429 "Too many concurrent requests for user" errors
- The endpoint still returns 200 with partial data, but some messages may be missing
- Response time is ~8-10 seconds for large queries

### Impact
- Some newsletter statistics may be incomplete
- Missing messages are logged but not retried
- The frontend still displays data, but percentages may be slightly inaccurate

### Potential Solutions
1. **Add exponential backoff retry logic** - Retry failed requests with increasing delays
2. **Reduce batch size** - Fetch fewer messages per request (currently 100)
3. **Add delays between batches** - Add small delays between `getMessagesBatch` calls
4. **Use database cache** - Store email metadata in database and sync periodically (requires schema changes)
5. **Implement request queuing** - Queue Gmail API requests to avoid concurrent limit

### Current Implementation
- Uses `getMessagesBatch` with 100-message chunks
- Processes messages sequentially but doesn't handle rate limits
- Missing messages are logged but not retried

### Related Files
- `apps/web/app/api/user/stats/newsletters/route.ts` - Main endpoint implementation
- `apps/web/utils/gmail/message.ts` - Gmail message fetching utilities



