"""
created with Google AI studio
"""

import obspython as obs
import os

# Global variable to hold the hotkey ID
hotkey_id = obs.OBS_INVALID_HOTKEY_ID
DATA_FILENAME = "obs_webSocket_details/websocketDetails.js"

# -------------------------------------------------------------------
# Helper: Get File Content
# -------------------------------------------------------------------
def get_file_content():
    """Reads content from the data file in the script's directory."""
    target_dir = script_path()
    if not target_dir:
        obs.script_log(obs.LOG_WARNING, "Script path not found. Save script first.")
        return None

    script_dir = os.path.dirname(target_dir)
    file_path = os.path.join(script_dir, DATA_FILENAME)

    if not os.path.exists(file_path):
        obs.script_log(obs.LOG_WARNING, f"File not found: {file_path}")
        return None

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            raw_content = f.read()
            
            # --- SPECIFIC REQUEST: REPLACE CONTENT STRING ---
            cleaned_content = raw_content.replace("let websocketDetails = ", '{"wssDetails":')
            cleaned_content = f"{cleaned_content} }}"
            # Optional: Strip whitespace/newlines from ends if desired
            return cleaned_content.strip()
            
    except Exception as e:
        obs.script_log(obs.LOG_WARNING, f"Error reading file: {e}")
        return None

# -------------------------------------------------------------------
# Core Logic: Send Event
# -------------------------------------------------------------------
def send_event_to_browsers():
    """
    Reads the file and sends a 'ws-details' event to ALL browser sources.
    """
    json_payload = get_file_content()
    if not json_payload:
        return

    print(f"Sending event 'ws-details'...{json_payload}")

    # 1. Get all sources
    sources = obs.obs_enum_sources()
    
    if sources is not None:
        for source in sources:
            # 2. Check if source is a Browser Source
            # 'browser_source' is the ID for standard OBS browser sources
            source_id = obs.obs_source_get_unversioned_id(source)
            
            if source_id == "browser_source":
                name = obs.obs_source_get_name(source)
                
                # 3. Prepare the Process Handler
                ph = obs.obs_source_get_proc_handler(source)
                
                # 4. Prepare the Data Wrapper
                cd = obs.calldata_create()
                
                # 'eventName' is what you listen for in JS: window.addEventListener('ws-details', ...)
                obs.calldata_set_string(cd, "eventName", "ws-details")
                
                # 'jsonString' is the actual data payload
                obs.calldata_set_string(cd, "jsonString", json_payload)
                
                # 5. Call the internal OBS Browser function 'javascript_event'
                obs.proc_handler_call(ph, "javascript_event", cd)
                
                # 6. Cleanup data wrapper
                obs.calldata_destroy(cd)
                
                obs.script_log(obs.LOG_INFO, f"Event sent to: {name}")

        # 7. Release the source list memory
        obs.source_list_release(sources)

# -------------------------------------------------------------------
# Callbacks (UI & Hotkeys)
# -------------------------------------------------------------------
def on_button_click(props, prop):
    send_event_to_browsers()

def on_hotkey_pressed(pressed):
    if pressed:
        send_event_to_browsers()

# -------------------------------------------------------------------
# Standard Script Definitions
# -------------------------------------------------------------------
def script_description():
    return (f"Reads '{DATA_FILENAME}' and sends it as a 'ws-details' event "
            "to all Browser Sources.\n\n"
            "Usage:\n"
            "1. Create event_data.json in the script folder.\n"
            "2. Bind the hotkey or use the button below.")

def script_properties():
    props = obs.obs_properties_create()
    obs.obs_properties_add_button(props, "btn_trigger", "Send Event Now", on_button_click)
    return props

def script_load(settings):
    global hotkey_id
    hotkey_id = obs.obs_hotkey_register_frontend(
        "trigger_browser_event", 
        "Trigger Browser 'ws-details' Event", 
        on_hotkey_pressed
    )
    
    hotkey_save_array = obs.obs_data_get_array(settings, "browser_event_hotkey")
    obs.obs_hotkey_load(hotkey_id, hotkey_save_array)
    obs.obs_data_array_release(hotkey_save_array)

def script_save(settings):
    hotkey_save_array = obs.obs_hotkey_save(hotkey_id)
    obs.obs_data_set_array(settings, "browser_event_hotkey", hotkey_save_array)
    obs.obs_data_array_release(hotkey_save_array)