"""
OAuth Authentication Handler for Gmail Integration

This script handles the OAuth flow for Gmail authentication using Google's
official auth libraries with an installed app flow.
"""

import os
import json
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Constants
GMAIL_SERVICE_URL = os.getenv("GMAIL_SERVICE_URL", "http://localhost:3001")
SCOPES = ['https://www.googleapis.com/auth/gmail.modify']

# Config file location
CONFIG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config")
if not os.path.exists(CONFIG_DIR):
    os.makedirs(CONFIG_DIR)
CREDENTIALS_FILE = os.path.join(CONFIG_DIR, "credentials.json")
TOKEN_FILE = os.path.join(CONFIG_DIR, "token.pickle")
CONFIG_FILE = os.path.join(CONFIG_DIR, "gmail_config.json")

def create_credentials_file():
    """Create credentials.json file from environment variables"""
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        print("Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in environment variables")
        print("Please create a .env file with these values or set them in your environment")
        return False
    
    # Create OAuth client configuration in the format expected by Google's libraries
    credentials_data = {
        "installed": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "redirect_uris": [
                "http://localhost:8080/",
                "http://localhost:8080", 
                "http://localhost:3001/auth/callback",
                "urn:ietf:wg:oauth:2.0:oob", 
                "http://localhost"
            ]
        }
    }
    
    with open(CREDENTIALS_FILE, "w") as f:
        json.dump(credentials_data, f)
    
    return True

def get_credentials():
    """Get and refresh OAuth credentials"""
    creds = None
    
    # Load credentials from token.pickle file if it exists
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "rb") as token:
            creds = pickle.load(token)
    
    # If credentials exist but are expired, refresh them
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    
    # If no valid credentials available, run the OAuth flow
    if not creds or not creds.valid:
        if not os.path.exists(CREDENTIALS_FILE):
            if not create_credentials_file():
                return None
        
        flow = InstalledAppFlow.from_client_secrets_file(
            CREDENTIALS_FILE, SCOPES)
        
        print("Starting OAuth flow...")
        print("This will open your browser for authentication.")
        print("Please follow the instructions in the browser.")
        print(f"Using redirect URIs: {flow.redirect_uri if hasattr(flow, 'redirect_uri') else 'http://localhost:8080/'}")
        print("If you see a redirect_uri_mismatch error, make sure this URL is registered in Google Cloud Console")
        print("Go to Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client IDs > Your Client")
        print("Add the exact URL above to 'Authorized redirect URIs'")
        
        # You can override the redirect URI to match exactly what's in Google Cloud Console
        # Try with our new approach first, using the Google library's local server
        try:
            print("Attempting OAuth flow with automatic redirect handling...")
            creds = flow.run_local_server(port=8080, redirect_uri_trailing_slash=True)
            print("Authentication successful! Token received and saved.")
        except Exception as e:
            print(f"Error during OAuth flow: {e}")
            print("\nYou may need to update the authorized redirect URIs in Google Cloud Console.")
            print("Here are common redirect URIs to add:")
            print("- http://localhost:8080/")
            print("- http://localhost:8080")
            print("- http://localhost:3001/auth/callback")
            print("\nTrying alternative method with specific redirect URI...")
            
            # Alternative approach using the previously authorized URI
            flow.redirect_uri = "http://localhost:3001/auth/callback"
            print(f"Using redirect URI: {flow.redirect_uri}")
            auth_url, _ = flow.authorization_url(prompt='consent')
            print(f"\nPlease go to this URL manually:\n{auth_url}")
            print("\nAfter authorization, you'll be redirected to the callback URL.")
            print("Copy the 'code' parameter from the URL (after ?code=) and paste it here:")
            code = input("Code: ").strip()
            
            try:
                creds = flow.fetch_token(code=code)
                print("Authentication successful! Token received and saved.")
            except Exception as auth_error:
                print(f"Error exchanging code for token: {auth_error}")
                print("\nPlease ensure you've copied the entire code correctly.")
                return None
        
        # Save the credentials for future use
        with open(TOKEN_FILE, "wb") as token:
            pickle.dump(creds, token)
    
    return creds

def store_in_config(creds):
    """Store credentials in config file format for compatibility"""
    if not creds:
        return False
    
    user_id = "task_maistro_user"  # In production, you'd use a real user ID
    
    # Store in the format expected by the rest of the application
    config = {
        "base_url": GMAIL_SERVICE_URL,
        "user_id": user_id,
        "tokens": {
            "access_token": creds.token,
            "refresh_token": creds.refresh_token,
            "expires_at": creds.expiry.timestamp() if creds.expiry else 0
        }
    }
    
    # Ensure config directory exists
    if not os.path.exists(CONFIG_DIR):
        os.makedirs(CONFIG_DIR)
    
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f)
    
    # Also create a text file for direct token reading by the microservice
    token_text_file = os.path.join(CONFIG_DIR, "direct_token.txt")
    with open(token_text_file, "w") as f:
        f.write(f"access_token={creds.token}\n")
        f.write(f"refresh_token={creds.refresh_token}\n")
        f.write(f"expires_at={creds.expiry.timestamp() if creds.expiry else 0}\n")
        f.write(f"user_id={user_id}\n")
    
    print(f"Tokens saved to {CONFIG_FILE} and {token_text_file}")
    
    # Also send tokens to microservice via API
    try:
        import requests
        microservice_data = {
            "userId": user_id,
            "tokens": config["tokens"]
        }
        try:
            response = requests.post(f"{GMAIL_SERVICE_URL}/api/auth/store-tokens", json=microservice_data)
            if response.status_code == 200:
                print("Tokens stored in microservice")
            else:
                print(f"Warning: Error storing tokens in microservice: {response.status_code} {response.text}")
                print("This is not critical - tokens are saved locally, but you may need to manually store them in the microservice.")
        except Exception as e:
            print(f"Warning: Error communicating with microservice: {e}")
            print("This is not critical - tokens are saved locally in the config file.")
    except ImportError:
        print("Warning: 'requests' module not found. Tokens not stored in microservice.")
        print("This is not critical - tokens are saved locally in the config file.")
    
    return True

def start_auth_flow():
    """Main function to start the OAuth flow"""
    # Get credentials
    creds = get_credentials()
    
    if creds:
        # Store credentials in config
        if store_in_config(creds):
            print(f"Authentication complete. Configuration saved to {CONFIG_FILE}")
            return True
    
    print("Authentication failed.")
    return False

if __name__ == "__main__":
    start_auth_flow()
