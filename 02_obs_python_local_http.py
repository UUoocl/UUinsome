'''
# An OBS Python Script to create an HTTP server
Copy websocket server details from the Text Source "wssDetails" to a js file
in the script directory. 
# Add pages to the script folder to run local apps
'''

import obspython as obs
import http.server
import socketserver
import threading
import os

'''
HTTP Server functions
'''
# --- Configuration ---
HOST_NAME = "localhost" # 127.0.0.1
PORT_NUMBER = 8080 # Changed to a common HTTP port
SCRIPT_PATH = ""
# ---------------------

# Global variables to hold the server thread and the server object
server_thread = None
httpd = None

# Global variables for the script
SOURCE_NAME = "wssDetails"

# --- Custom Request Handler with Routing and File Serving ---
class OBSCustomHandler(http.server.SimpleHTTPRequestHandler):

    # Helper function to send the standard headers
    def _set_headers(self, status_code=200, content_type="text/html"):
        self.send_response(status_code)
        self.send_header("Content-type", content_type)
        self.end_headers()

    def do_GET(self):
        # 1. Check the requested path
        path = self.path.split('?')[0] 
       
        obs.script_log(obs.LOG_INFO, f"HTTP Server GET request for path: {path}")

        # 2. Handle specific OBS-related routes example
        if path == "/status":
            # --- Status Page ('/status') - Special OBS Route ---
            self._set_headers(200)
            # ... (response content remains the same as previous answer)
            response_html = "<html><body><h1>OBS Status...</h1></body></html>"
            self.wfile.write(bytes(response_html, "utf-8"))
            
        elif path == "/json-data":
            # --- API Endpoint ('/json-data') - Special OBS Route ---
            # ... (response content remains the same as previous answer)
            import json
            data = {"status": "online"}
            self._set_headers(200, "application/json") 
            self.wfile.write(bytes(json.dumps(data), "utf-8"))

        else:
            # --- Root Path ('/') - Try to load the specified external file ---
            
            # Get the directory of the current script
            #script_path = script_path()
            script_dir = os.path.dirname(SCRIPT_PATH)
            file_path = f"{script_dir}{self.path}"
       
            if os.path.exists(f"{script_dir}{path}"):
                # We found the file! We'll use the parent class's logic to serve it.
                # Temporarily change the requested path to the file name so the
                # SimpleHTTPRequestHandler can find and open it correctly.
                original_path = self.path
                self.path = file_path
                # Call the do_GET method of the parent class (SimpleHTTPRequestHandler)
                # This handles opening, reading, setting correct headers, and serving the file.
                try:
                    super().do_GET()
                finally:
                    # Restore the original path afterwards (good practice)
                    self.path = original_path 
            else:
                # File not found
                self._set_headers(404) 
                response_html = f"<html><body><h1>Error</h1><p>The file <b>{self.path}</b> was not found in the script directory.</p></body></html>"
                self.wfile.write(bytes(response_html, "utf-8"))

# --- Server Control Functions ---
def start_server_in_thread():
    """Starts the HTTP server in a new, non-blocking thread."""
    global httpd
    
    try:
        Handler = OBSCustomHandler
        socketserver.TCPServer.allow_reuse_address = True
        
        # Simple HTTP server creation
        httpd = socketserver.TCPServer((HOST_NAME, PORT_NUMBER), Handler)
        
        obs.script_log(obs.LOG_INFO, f"Starting HTTP server on http://{HOST_NAME}:{PORT_NUMBER}")
        
        httpd.serve_forever()
        
    except Exception as e:
        obs.script_log(obs.LOG_ERROR, f"Error starting server: {e}")
        if httpd:
            httpd.server_close()
        
'''
# OBS script functions
'''

def script_load(settings):
    global SCRIPT_PATH, server_thread, SOURCE_NAME
   
    SCRIPT_PATH = script_path()

    print(f"script load {obs.obs_data_get_json(settings)}")

    if server_thread is None:
        server_thread = threading.Thread(target=start_server_in_thread)
        server_thread.daemon = True 
        server_thread.start()
        obs.script_log(obs.LOG_INFO, "HTTP Server Thread Initialized.")

    """Registers the event handler on script load."""
    obs.obs_frontend_add_event_callback(on_event)

def script_unload():
    global httpd, server_thread, SOURCE_NAME
    print(f"http unload {httpd}")
    print(f"server_thread.is_alive() {server_thread}")
    if httpd:
        obs.script_log(obs.LOG_INFO, "Stopping HTTP Server...")
        httpd.shutdown()
        httpd.server_close()
        obs.script_log(obs.LOG_INFO, "HTTP Server closed")
        
    # if server_thread and server_thread.is_alive():
    #     server_thread.join(timeout=1.0)
    #     obs.script_log(obs.LOG_INFO, "HTTP Server Thread Cleanly Shut Down.")

    # remove signal handlers to keyHotkey text source
    print(f"source name {SOURCE_NAME}")
    source = obs.obs_get_source_by_name(SOURCE_NAME)
    print(f"source object {source}")
    try:
        if source:
            handler = obs.obs_source_get_signal_handler(source)
            obs.signal_handler_disconnect(handler,"update", source_signal_callback)
            obs.obs_source_release(source)
    except Exception as e:
        print("no source signal to remove")

def script_description():
    return (
        "<h2>OBS HTTP Localhost Server</h2>"
        "Runs a simple HTTP server in a background thread.<br>"
        f"Access at: <b>http://{HOST_NAME}:{PORT_NUMBER}</b>"
    )

def script_update(settings):
    pass

'''
Source Signal functions
'''
# -- Create or update a file with the wssDetials text source content

def source_signal_callback(calldata):
    global SCRIPT_PATH

# update the websocketDetails.js file
    try:
        # 1. The name of the file to update/create
        file_name = "websocketDetails.js"

        # 2. The variable holding the content you want to write to the file
        source = obs.calldata_source(calldata,"source")
        # find client that matches updated text source
        source_settings = obs.obs_source_get_settings(source)
        text = obs.obs_data_get_string(source_settings, "text").replace(" ","")
        print(f"source text {type(text)} {text}")

        # --- File Operation ---
        script_dir = os.path.dirname(SCRIPT_PATH)
        requested_file = file_name
        file_path = os.path.join(script_dir, requested_file)

        # Check if the file already exists (for logging/printing a message)
        file_existed = os.path.exists(file_path)

        # Use the 'with' statement for safe file handling (ensures the file is closed)
        # The 'w' mode:
        # 1. Creates the file if it doesn't exist.
        # 2. Overwrites the file if it does exist.
        with open(file_path, 'w') as file:
            file.write(f"let wssDetails = {text}")
        
        # --- Output/Confirmation ---
        if file_existed:
            print(f"Successfully **updated** the existing file: '{file_name}'")
        else:
            print(f"File did not exist. Successfully **created** the new file: '{file_name}'")
            
        obs.obs_data_release(source_settings)
      
    except Exception as e:
        print(f"An error occurred during file operation: {e}")


# -------------------------------------------------------------------
# Event Handler
# -------------------------------------------------------------------

def on_event(event):
    """OBS Frontend Event Handler. Prints every event ID and triggers source enumeration on load."""
    global scene_collection_processed

    # 1. Print every event ID received (this is the integer value)
    obs.script_log(obs.LOG_INFO, f"[EVENT ID] Received: {event}")

    # 2. Execute core logic only on the Scene Collection Loaded event
    if event == obs.OBS_FRONTEND_EVENT_FINISHED_LOADING:
        obs.script_log(obs.LOG_INFO, f"** Matched target event ID: {event} OBS_FRONTEND_EVENT_FINISHED_LOADING (Scene Collection Loaded) **")
        attach_signal()
        
'''
# Attach signal handlers to wssDetails text source
'''
def attach_signal():
    global SCRIPT_PATH, SOURCE_NAME
   
    SCRIPT_PATH = script_path()
    
    print(f"source name {SOURCE_NAME}")
    source = obs.obs_get_source_by_name(SOURCE_NAME)
    print(f"source object {source}")
    if source:
        signal_handler = obs.obs_source_get_signal_handler(source)
        obs.signal_handler_connect(signal_handler,"update", source_signal_callback)
        obs.obs_source_release(source)
    else:
        print(f"Source {SOURCE_NAME} not found for signal handler.")