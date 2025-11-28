'''
# An OBS Python Script to create an HTTP server
'''

import obspython as obs
import http.server
import socketserver
import threading
import os

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

    def do_GET(self):
        path = self.path.split('?')[0] 
        
        if path == "/status":
            self._set_headers(200)
            response_html = "<html><body><h1>OBS Status...</h1></body></html>"
            self.wfile.write(bytes(response_html, "utf-8"))
            
        elif path == "/json-data":
            import json
            data = {"status": "online"}
            self._set_headers(200, "application/json") 
            self.wfile.write(bytes(json.dumps(data), "utf-8"))

        else:
            script_dir = os.path.dirname(SCRIPT_PATH)
            file_path = f"{script_dir}{self.path}"
       
            if os.path.exists(f"{script_dir}{path}"):
                original_path = self.path
                self.path = file_path
                try:
                    super().do_GET()
                finally:
                    self.path = original_path 
            else:
                self._set_headers(404) 
                response_html = f"<html><body><h1>Error</h1><p>File not found.</p></body></html>"
                self.wfile.write(bytes(response_html, "utf-8"))

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
    
    # 2. Shutdown HTTP Server
    if httpd:
        print("Stopping HTTP Server...")
        httpd.shutdown()
        httpd.server_close()
        httpd = None

def script_description():
    return f"HTTP Server at http://{HOST_NAME}:{PORT_NUMBER}"