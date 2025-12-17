'''
# An OBS Python Script to create an HTTP server (Windows Compatible)
'''

import obspython as obs
import http.server
import socketserver
import threading
import os
import urllib.parse

# --- Configuration ---
HOST_NAME = "localhost" 
PORT_NUMBER = 8080 
SCRIPT_PATH = ""

# Global variables
server_thread = None
httpd = None

# --- Custom Request Handler ---
class OBSCustomHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass # Do not log messages to console to prevent lag

    def _set_headers(self, status_code=200, content_type="text/html"):
        self.send_response(status_code)
        self.send_header("Content-type", content_type)
        self.end_headers()

    # OVERRIDE: This is the fix for Windows.
    # It tells the server to look in the SCRIPT_PATH directory, 
    # not the OBS executable directory.
    def translate_path(self, path):
        # Clean the path (remove query params like ?v=1)
        path = path.split('?')[0]
        path = path.split('#')[0]
        
        # URL decode (e.g. convert %20 to space)
        path = urllib.parse.unquote(path)
        
        # Get the folder where this script is located
        root_dir = os.path.dirname(SCRIPT_PATH)
        
        # Remove leading slash from the URL path so os.path.join works correctly
        # (e.g., "/index.html" becomes "index.html")
        relative_path = path.lstrip('/')
        
        # Join them using the OS-specific separator (Handle \ vs / automatically)
        full_path = os.path.join(root_dir, relative_path)
        
        return full_path

    def do_GET(self):
        # Handle Custom Endpoints
        if self.path == "/status":
            self._set_headers(200)
            response_html = "<html><body><h1>OBS Status...</h1></body></html>"
            self.wfile.write(bytes(response_html, "utf-8"))
            
        elif self.path == "/json-data":
            import json
            data = {"status": "online"}
            self._set_headers(200, "application/json") 
            self.wfile.write(bytes(json.dumps(data), "utf-8"))

        # Handle Local Files
        else:
            # We simply call the parent method. 
            # It will use our custom translate_path() above to find the file.
            # It also automatically handles MIME types and 404 errors if the file is missing.
            super().do_GET()

# --- Server Control Functions ---
def start_server_in_thread():
    global httpd
    # Create a new server instance
    try:
        Handler = OBSCustomHandler
        socketserver.TCPServer.allow_reuse_address = True
        httpd = socketserver.TCPServer((HOST_NAME, PORT_NUMBER), Handler)
        print(f"Starting HTTP server on http://{HOST_NAME}:{PORT_NUMBER}")
        httpd.serve_forever()
    except OSError as e:
        print(f"Port {PORT_NUMBER} in use or error: {e}")
    except Exception as e:
        print(f"Error starting server: {e}")

# --- OBS Script Functions ---

def script_load(settings):
    global SCRIPT_PATH, server_thread
   
    SCRIPT_PATH = script_path()

    # Only start thread if not already running
    if server_thread is None or not server_thread.is_alive():
        server_thread = threading.Thread(target=start_server_in_thread)
        server_thread.daemon = True 
        server_thread.start()

def script_unload():
    global httpd, server_thread
    
    # Shutdown HTTP Server
    if httpd:
        print("Stopping HTTP Server...")
        httpd.shutdown()
        httpd.server_close()
        httpd = None

def script_description():
    return f"HTTP Server at http://{HOST_NAME}:{PORT_NUMBER}"