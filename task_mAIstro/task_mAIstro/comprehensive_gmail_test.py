"""
Comprehensive Gmail Integration Test Suite

This script tests ALL 42 Gmail endpoints and agent tools in the Task mAIstro system.
It provides a complete validation of the Gmail microservice and Python tools integration.

🚀 ENDPOINTS TESTED: 42 total
📧 Message Operations: 15 endpoints
🧵 Thread Operations: 15 endpoints  
🏷️ Label Operations: 9 endpoints
🔧 System Operations: 3 endpoints

Run this after:
1. Starting the Gmail microservice (npm start in gmail-service/)
2. Authenticating with Gmail (visit http://localhost:3001/auth)
"""

import requests
import json
import sys
import os
import time
from typing import Dict, Any, Optional, List
from datetime import datetime

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Test configuration
GMAIL_SERVICE_URL = "http://localhost:3001"
TEST_SUBJECT = f"Test Email - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
TEST_BODY = "<h1>This is a test email from Task mAIstro</h1><p>If you receive this, the integration is working!</p>"

def get_test_email():
    """Prompt user for recipient email address"""
    print("📧 EMAIL SENDING TEST SETUP")
    print("=" * 50)
    print("To test the email sending functionality, please enter a recipient email address.")
    print("This should be an email address you have access to for verification.")
    print("")
    
    while True:
        email = input("Enter recipient email address: ").strip()
        if not email:
            print("❌ Email address cannot be empty. Please try again.")
            continue
        
        # Basic email validation
        if "@" not in email or "." not in email.split("@")[1]:
            print("❌ Invalid email format. Please enter a valid email address.")
            continue
        
        # Confirm with user
        print(f"\n📧 You entered: {email}")
        confirm = input("Is this correct? (y/n): ").strip().lower()
        
        if confirm in ['y', 'yes']:
            return email
        elif confirm in ['n', 'no']:
            print("Let's try again...\n")
            continue
        else:
            print("Please enter 'y' or 'n'")
            continue

class GmailTestSuite:
    def __init__(self):
        self.base_url = GMAIL_SERVICE_URL
        self.passed_tests = 0
        self.failed_tests = 0
        self.test_results = []
        self.test_message_id = None
        self.test_thread_id = None
        self.test_label_id = None
        
    def log_test(self, test_name: str, success: bool, message: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        if success:
            self.passed_tests += 1
        else:
            self.failed_tests += 1
            
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        })
        
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> Dict[str, Any]:
        """Make HTTP request to Gmail service"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, params=params, timeout=10)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, timeout=10)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, timeout=10)
            elif method.upper() == "DELETE":
                response = requests.delete(url, json=data, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return {
                "status_code": response.status_code,
                "data": response.json() if response.content else {},
                "success": response.status_code == 200
            }
        except Exception as e:
            return {
                "status_code": 0,
                "data": {"error": str(e)},
                "success": False
            }
    
    def test_system_endpoints(self):
        """Test system and authentication endpoints"""
        print("\n🔧 TESTING SYSTEM ENDPOINTS")
        print("=" * 50)
        
        # Test 1: Root health check
        result = self.make_request("GET", "/")
        self.log_test("Root Health Check", result["success"], 
                     f"Status: {result['status_code']}")
        
        # Test 2: Detailed health check
        result = self.make_request("GET", "/health")
        self.log_test("Detailed Health Check", result["success"],
                     f"Status: {result['status_code']}, Auth: {result['data'].get('authenticated', False)}")
        
        # Test 3: Auth endpoint (should redirect)
        try:
            # Auth endpoint should redirect, so we need to handle redirects differently
            response = requests.get(f"{self.base_url}/auth", allow_redirects=False, timeout=10)
            success = response.status_code in [200, 302]
            self.log_test("Auth Endpoint", success,
                         f"Status: {response.status_code} (redirect expected)")
        except Exception as e:
            self.log_test("Auth Endpoint", False, f"Error: {str(e)}")
    
    def test_message_endpoints(self):
        """Test all message-related endpoints"""
        print("\n📧 TESTING MESSAGE ENDPOINTS")
        print("=" * 50)
        
        # Test 1: List messages
        result = self.make_request("GET", "/api/messages", params={"maxResults": 5})
        self.log_test("List Messages", result["success"],
                     f"Status: {result['status_code']}")
        
        # Store first message ID for later tests
        if result["success"] and result["data"].get("messages"):
            messages = result["data"]["messages"]
            if messages:
                self.test_message_id = messages[0].get("id")
        
        # Test 2: Search messages
        result = self.make_request("POST", "/api/messages/search", 
                                 data={"query": "test", "maxResults": 10})
        self.log_test("Search Messages", result["success"],
                     f"Status: {result['status_code']}")
        
        # Test 3: Get specific message (if we have an ID)
        if self.test_message_id:
            result = self.make_request("GET", f"/api/messages/{self.test_message_id}")
            self.log_test("Get Message Details", result["success"],
                         f"Status: {result['status_code']}")
        else:
            self.log_test("Get Message Details", False, "No message ID available")
        
        # Test 4-11: Message operations (if we have an ID)
        if self.test_message_id:
            operations = [
                ("PUT", "/read", "Mark Read"),
                ("PUT", "/unread", "Mark Unread"),
                ("POST", "/archive", "Archive"),
                ("POST", "/unarchive", "Unarchive"),
                ("POST", "/important", "Mark Important"),
                ("DELETE", "/important", "Mark Not Important"),
                ("POST", "/spam", "Mark Spam"),
                ("DELETE", "/spam", "Mark Not Spam")
            ]
            
            for method, endpoint, name in operations:
                result = self.make_request(method, f"/api/messages/{self.test_message_id}{endpoint}")
                self.log_test(f"Message {name}", result["success"],
                             f"Status: {result['status_code']}")
                time.sleep(0.5)  # Rate limiting
        
        # Test 12: Apply labels to message
        if self.test_message_id:
            result = self.make_request("PUT", f"/api/messages/{self.test_message_id}/labels",
                                     data={"labelIds": ["INBOX"]})
            self.log_test("Apply Labels to Message", result["success"],
                         f"Status: {result['status_code']}")
        
        # Test 13: Remove labels from message
        if self.test_message_id:
            result = self.make_request("DELETE", f"/api/messages/{self.test_message_id}/labels",
                                     data={"labelIds": ["INBOX"]})
            self.log_test("Remove Labels from Message", result["success"],
                         f"Status: {result['status_code']}")
        
        # Test 14: Trash message
        if self.test_message_id:
            result = self.make_request("POST", f"/api/messages/{self.test_message_id}/trash")
            self.log_test("Trash Message", result["success"],
                         f"Status: {result['status_code']}")
        
        # Test 15: Untrash message
        if self.test_message_id:
            result = self.make_request("POST", f"/api/messages/{self.test_message_id}/untrash")
            self.log_test("Untrash Message", result["success"],
                         f"Status: {result['status_code']}")
        
        # NOTE: We don't test permanent delete to avoid losing data
        
    def test_thread_endpoints(self):
        """Test all thread-related endpoints"""
        print("\n🧵 TESTING THREAD ENDPOINTS")
        print("=" * 50)
        
        # Test 1: List threads
        result = self.make_request("GET", "/api/threads", params={"maxResults": 5})
        self.log_test("List Threads", result["success"],
                     f"Status: {result['status_code']}")
        
        # Store first thread ID for later tests
        if result["success"] and result["data"].get("threads"):
            threads = result["data"]["threads"]
            if threads:
                self.test_thread_id = threads[0].get("id")
        
        # Test 2: Search threads
        result = self.make_request("POST", "/api/threads/search",
                                 data={"query": "test", "maxResults": 10})
        self.log_test("Search Threads", result["success"],
                     f"Status: {result['status_code']}")
        
        # Test 3: Get specific thread (if we have an ID)
        if self.test_thread_id:
            result = self.make_request("GET", f"/api/threads/{self.test_thread_id}")
            self.log_test("Get Thread Details", result["success"],
                         f"Status: {result['status_code']}")
        else:
            self.log_test("Get Thread Details", False, "No thread ID available")
        
        # Test 4-11: Thread operations (if we have an ID)
        if self.test_thread_id:
            operations = [
                ("PUT", "/read", "Mark Read"),
                ("PUT", "/unread", "Mark Unread"), 
                ("POST", "/archive", "Archive"),
                ("POST", "/unarchive", "Unarchive"),
                ("POST", "/important", "Mark Important"),
                ("DELETE", "/important", "Mark Not Important"),
                ("POST", "/spam", "Mark Spam"),
                ("DELETE", "/spam", "Mark Not Spam")
            ]
            
            for method, endpoint, name in operations:
                result = self.make_request(method, f"/api/threads/{self.test_thread_id}{endpoint}")
                self.log_test(f"Thread {name}", result["success"],
                             f"Status: {result['status_code']}")
                time.sleep(0.5)  # Rate limiting
        
        # Test 12: Apply labels to thread
        if self.test_thread_id:
            result = self.make_request("PUT", f"/api/threads/{self.test_thread_id}/labels",
                                     data={"labelIds": ["INBOX"]})
            self.log_test("Apply Labels to Thread", result["success"],
                         f"Status: {result['status_code']}")
        
        # Test 13: Remove labels from thread
        if self.test_thread_id:
            result = self.make_request("DELETE", f"/api/threads/{self.test_thread_id}/labels",
                                     data={"labelIds": ["INBOX"]})
            self.log_test("Remove Labels from Thread", result["success"],
                         f"Status: {result['status_code']}")
        
        # Test 14: Trash thread
        if self.test_thread_id:
            result = self.make_request("POST", f"/api/threads/{self.test_thread_id}/trash")
            self.log_test("Trash Thread", result["success"],
                         f"Status: {result['status_code']}")
        
        # Test 15: Untrash thread
        if self.test_thread_id:
            result = self.make_request("POST", f"/api/threads/{self.test_thread_id}/untrash")
            self.log_test("Untrash Thread", result["success"],
                         f"Status: {result['status_code']}")
        
        # NOTE: We don't test permanent delete to avoid losing data
        
    def test_label_endpoints(self):
        """Test all label-related endpoints"""
        print("\n🏷️ TESTING LABEL ENDPOINTS")
        print("=" * 50)
        
        # Test 1: List labels
        result = self.make_request("GET", "/api/labels")
        self.log_test("List Labels", result["success"],
                     f"Status: {result['status_code']}")
        
        # Test 2: Create new label
        test_label_name = f"TestLabel_{int(time.time())}"
        result = self.make_request("POST", "/api/labels",
                                 data={"name": test_label_name})
        self.log_test("Create Label", result["success"],
                     f"Status: {result['status_code']}")
        
        if result["success"] and result["data"].get("label"):
            self.test_label_id = result["data"]["label"].get("id")
        
        # Test 3: Get specific label (if we have an ID)
        if self.test_label_id:
            result = self.make_request("GET", f"/api/labels/{self.test_label_id}")
            self.log_test("Get Label Details", result["success"],
                         f"Status: {result['status_code']}")
        else:
            self.log_test("Get Label Details", False, "No label ID available")
        
        # Test 4: Find label by name
        result = self.make_request("GET", "/api/labels/find",
                                 params={"name": test_label_name})
        self.log_test("Find Label by Name", result["success"],
                     f"Status: {result['status_code']}")
        
        # Test 5: Get or create label
        result = self.make_request("POST", "/api/labels/get-or-create",
                                 data={"name": test_label_name})
        self.log_test("Get or Create Label", result["success"],
                     f"Status: {result['status_code']}")
        
        # Additional tests covered in message/thread sections:
        # - Apply labels to message
        # - Remove labels from message  
        # - Apply labels to thread
        # - Remove labels from thread
        
    def test_email_sending(self):
        """Test email sending endpoint"""
        print("\n📤 TESTING EMAIL SENDING")
        print("=" * 50)
        
        # Get recipient email from user
        test_email = get_test_email()
        
        # Test: Send email
        result = self.make_request("POST", "/send", data={
            "to": test_email,
            "subject": TEST_SUBJECT,
            "body": TEST_BODY
        })
        self.log_test("Send Email", result["success"],
                     f"Status: {result['status_code']}")
        
    def test_agent_tools(self):
        """Test Python agent tools"""
        print("\n🐍 TESTING PYTHON AGENT TOOLS")
        print("=" * 50)
        
        try:
            from gmail_tools import (
                check_gmail_service_status,
                list_gmail_messages,
                search_gmail,
                list_labels,
                GMAIL_TOOLS,
                GMAIL_TOOL_DESCRIPTIONS
            )
            
            # Test 1: Service status check
            result = check_gmail_service_status.invoke({"input": ""})
            self.log_test("Agent - Service Status", "✅" in result,
                         f"Response: {result[:100]}...")
            
            # Test 2: List messages
            result = list_gmail_messages.invoke({"max_results": 5})
            self.log_test("Agent - List Messages", "✅" in result or "📭" in result,
                         f"Response: {result[:100]}...")
            
            # Test 3: Search messages
            result = search_gmail.invoke({"query": "test", "max_results": 5})
            self.log_test("Agent - Search Messages", "🔍" in result,
                         f"Response: {result[:100]}...")
            
            # Test 4: List labels
            result = list_labels.invoke({"input": ""})
            self.log_test("Agent - List Labels", "📝" in result,
                         f"Response: {result[:100]}...")
            
            # Test 5: Tool count validation
            tool_count = len(GMAIL_TOOLS)
            description_count = len(GMAIL_TOOL_DESCRIPTIONS)
            self.log_test("Agent - Tool Count", tool_count == 42,
                         f"Expected 42 tools, found {tool_count}")
            self.log_test("Agent - Description Count", description_count == 42,
                         f"Expected 42 descriptions, found {description_count}")
            
        except ImportError as e:
            self.log_test("Agent - Import Error", False, f"Cannot import gmail_tools: {e}")
        except Exception as e:
            self.log_test("Agent - General Error", False, f"Error testing agent tools: {e}")
    
    def run_all_tests(self):
        """Run the complete test suite"""
        print("🚀 GMAIL INTEGRATION COMPREHENSIVE TEST SUITE")
        print("=" * 60)
        print(f"Starting tests at {datetime.now()}")
        print(f"Target URL: {self.base_url}")
        print()
        
        # Run all test categories
        self.test_system_endpoints()
        self.test_message_endpoints()
        self.test_thread_endpoints()
        self.test_label_endpoints()
        self.test_email_sending()
        self.test_agent_tools()
        
        # Print summary
        print("\n📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.failed_tests}")
        print(f"📈 Success Rate: {(self.passed_tests / (self.passed_tests + self.failed_tests)) * 100:.1f}%")
        
        if self.failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   - {result['test']}: {result['message']}")
        
        print(f"\nTest completed at {datetime.now()}")
        
        # Return success status
        return self.failed_tests == 0

def main():
    """Main test runner"""
    print("⚡ Gmail Integration Test Suite")
    print("Please ensure:")
    print("1. Gmail microservice is running (npm start in gmail-service/)")
    print("2. You have authenticated with Gmail (visit http://localhost:3001/auth)")
    print("3. You'll be prompted to enter the recipient email address for testing")
    print()
    
    # Wait for user confirmation
    input("Press Enter when ready to start testing...")
    
    # Run tests
    test_suite = GmailTestSuite()
    success = test_suite.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
