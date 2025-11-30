import obspython as obs
import os

# Configuration
SOURCE_NAME = "wssDetails"
OUTPUT_FILENAME = "obs_webSocket_details/websocketDetails.js"

# ------------------------------------------------------------
# Helper Functions
# ------------------------------------------------------------

def get_output_file_path():
    """
    Returns the full path for the output file.
    Uses the global script_path() function injected by OBS.
    """
    # CORRECTED: calling the global function directly
    current_script_path = script_path() 
    script_directory = os.path.dirname(current_script_path)
    return os.path.join(script_directory, OUTPUT_FILENAME)

def write_text_to_file(text):
    """Writes the provided text to the output file."""
    file_path = get_output_file_path()
    if(len(text)>0):
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(f"let websocketDetails = {text}")
                print(f"[{SOURCE_NAME}] Updated file: {text}")
        except Exception as e:
            print(f"[{SOURCE_NAME}] Error writing to file: {e}")

# ------------------------------------------------------------
# Signal Callback
# ------------------------------------------------------------

def on_source_update(calldata):
    """Callback triggered when source settings (text) change."""
    source = obs.obs_get_source_by_name(SOURCE_NAME)
    if source:
        settings = obs.obs_source_get_settings(source)
        text_content = obs.obs_data_get_string(settings, "text")
        write_text_to_file(text_content)
        
        obs.obs_data_set_string(settings, "text", "")
        
        obs.obs_data_release(settings)
        obs.obs_source_release(source)

# ------------------------------------------------------------
# Connection Logic
# ------------------------------------------------------------

def setup_signal_handler():
    """
    Attempts to find the source and attach the signal handler.
    Returns True if successful, False if source not found.
    """
    source = obs.obs_get_source_by_name(SOURCE_NAME)
    
    if source:
        print(f"[{SOURCE_NAME}] Source found. Attaching signal handler...")
        handler = obs.obs_source_get_signal_handler(source)
        
        # Connect the update signal
        obs.signal_handler_connect(handler, "update", on_source_update)
        
        # Trigger an initial write immediately so file is current
        on_source_update(None)
        
        obs.obs_source_release(source)
        return True
    else:
        return False

def on_frontend_event(event):
    """Event listener to handle OBS loading state."""
    if event == obs.OBS_FRONTEND_EVENT_FINISHED_LOADING:
        print(f"[{SOURCE_NAME}] OBS Finished Loading. Connecting...")
        
        if setup_signal_handler():
            print(f"[{SOURCE_NAME}] Connected successfully.")
        else:
            print(f"[{SOURCE_NAME}] Warning: Source '{SOURCE_NAME}' not found.")
            
        # Remove the listener so it doesn't fire again
        obs.obs_frontend_remove_event_callback(on_frontend_event)

# ------------------------------------------------------------
# OBS SCRIPT FUNCTIONS
# ------------------------------------------------------------

def script_description():
    return "Watches 'wssDetails' text source and writes content to a file."

def script_load(settings):
    print(f"[{SOURCE_NAME}] Script loaded.")
    
    # Try to connect immediately (in case script is loaded manually after OBS is open)
    success = setup_signal_handler()
    
    # If source isn't found, it's likely OBS is still starting up.
    if not success:
        print(f"[{SOURCE_NAME}] Source not ready. Waiting for OBS load event...")
        obs.obs_frontend_add_event_callback(on_frontend_event)

def script_unload():
    # Ensure event callback is removed if script is unloaded manually
    obs.obs_frontend_remove_event_callback(on_frontend_event)