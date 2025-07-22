"""
Quick Gmail Service Endpoint Verification Script

This script does basic endpoint checking to verify that the Gmail service
is running with all expected endpoints.
"""

import requests
import json

def check_endpoints():
    base_url = "http://localhost:3001"
    
    # Basic endpoints that should always work
    basic_endpoints = [
        ("GET", "/", "Root health check"),
        ("GET", "/health", "Detailed health check"),
        ("POST", "/send", "Send email endpoint"),
    ]
    
    # API endpoints that should exist
    api_endpoints = [
        ("GET", "/api/messages", "List messages"),
        ("POST", "/api/messages/search", "Search messages"),
        ("GET", "/api/threads", "List threads"),
        ("POST", "/api/threads/search", "Search threads"),
        ("GET", "/api/labels", "List labels"),
        ("POST", "/api/labels", "Create label"),
        ("GET", "/api/labels/find", "Find label by name"),
        ("POST", "/api/labels/get-or-create", "Get or create label"),
    ]
    
    print("🔍 GMAIL SERVICE ENDPOINT VERIFICATION")
    print("=" * 50)
    
    # Check basic endpoints
    print("\n📋 BASIC ENDPOINTS:")
    for method, endpoint, description in basic_endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{base_url}{endpoint}", timeout=5)
            elif method == "POST":
                # For send endpoint, we expect 400 due to missing body
                response = requests.post(f"{base_url}{endpoint}", json={}, timeout=5)
            
            status = "✅" if response.status_code in [200, 400] else "❌"
            print(f"{status} {description}: {response.status_code}")
            
        except Exception as e:
            print(f"❌ {description}: ERROR - {str(e)}")
    
    # Check API endpoints
    print("\n📡 API ENDPOINTS:")
    for method, endpoint, description in api_endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{base_url}{endpoint}", timeout=5)
            elif method == "POST":
                response = requests.post(f"{base_url}{endpoint}", json={}, timeout=5)
            
            # 401 (unauthorized) is expected since we're not authenticated
            # 400 (bad request) might occur for missing required fields
            # 404 means the endpoint doesn't exist - that's the problem
            status = "✅" if response.status_code in [200, 400, 401] else "❌"
            expected = "Expected: 200/400/401" if response.status_code != 404 else "NOT FOUND!"
            print(f"{status} {description}: {response.status_code} ({expected})")
            
        except Exception as e:
            print(f"❌ {description}: ERROR - {str(e)}")
    
    print("\n" + "=" * 50)
    print("If you see 404 errors for API endpoints, the server needs to be restarted")
    print("with the latest code. Run: cd gmail-service && npm start")

if __name__ == "__main__":
    check_endpoints()
