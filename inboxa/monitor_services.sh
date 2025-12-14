#!/bin/bash

# Server monitoring script for inboxa.ai
echo "🔄 Starting Server Health Monitoring for inboxa.ai"
echo "=================================================="

while true; do
    clear
    echo "📊 SERVER STATUS DASHBOARD - $(date)"
    echo "=================================================="
    
    # Check Web Application (port 3001)
    echo "🌐 Web Application (localhost:3001)"
    WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/ 2>/dev/null)
    if [ "$WEB_STATUS" = "200" ]; then
        echo "   ✅ Status: HEALTHY (HTTP $WEB_STATUS)"
    else
        echo "   ❌ Status: UNHEALTHY (HTTP $WEB_STATUS)"
    fi
    
    # Check if web process is running
    WEB_PID=$(lsof -ti :3001 2>/dev/null)
    if [ -n "$WEB_PID" ]; then
        WEB_MEMORY=$(ps -o pid,rss,command -p $WEB_PID 2>/dev/null | tail -1)
        echo "   🔧 Process: $WEB_MEMORY"
    else
        echo "   ⚠️  No process found on port 3001"
    fi
    
    echo ""
    
    # Check Unsubscriber Service (port 5001)
    echo "📧 Unsubscriber Service (localhost:5001)"
    UNSUB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/ 2>/dev/null)
    if [ "$UNSUB_STATUS" = "200" ]; then
        echo "   ✅ Status: HEALTHY (HTTP $UNSUB_STATUS)"
    else
        echo "   ❌ Status: UNHEALTHY (HTTP $UNSUB_STATUS)"
    fi
    
    # Check if unsubscriber process is running  
    UNSUB_PID=$(lsof -ti :5001 2>/dev/null)
    if [ -n "$UNSUB_PID" ]; then
        UNSUB_MEMORY=$(ps -o pid,rss,command -p $UNSUB_PID 2>/dev/null | tail -1)
        echo "   🔧 Process: $UNSUB_MEMORY"
    else
        echo "   ⚠️  No process found on port 5001"
    fi
    
    echo ""
    
    # Check MCP Server (stdio-based, no HTTP port)
    echo "🤖 MCP Server (stdio-based)"
    MCP_RUNNING=$(ps aux | grep -v grep | grep "inboxa-ai" | grep "build/index.js")
    if [ -n "$MCP_RUNNING" ]; then
        echo "   ✅ Status: RUNNING"
        echo "   🔧 Process: $MCP_RUNNING"
    else
        echo "   ❌ Status: NOT RUNNING"
    fi
    
    echo ""
    echo "=================================================="
    echo "🔄 Next update in 10 seconds... (Ctrl+C to stop)"
    
    sleep 10
done
