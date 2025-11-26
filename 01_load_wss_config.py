"""
created with Google AI studio
"""
import obspython as obs
import os
import json

# -------------------------------------------------------------------
# CORE LOGIC
# -------------------------------------------------------------------

def generate_wss_details(source_path):
    """
    Validates the source file and generates websocketDetails.js.
    Returns: (Success_Boolean, Status_Message)
    """
    if not source_path:
        return False, "Please select a file."

    if not os.path.exists(source_path):
        return False, "Error: Source file not found."

    try:
        # 1. Parse JSON
        with open(source_path, "r", encoding="utf-8") as infile:
            source_data = json.load(infile)

        # 2. Check Required Keys
        required_keys = ["server_password", "server_port"]
        missing = [k for k in required_keys if k not in source_data]

        if missing:
            return False, f"Error: Missing keys {missing}"

        # 3. Generate Output
        target_dir = script_path()
        destination = os.path.join(target_dir,"obs_webSocket_details/", "websocketDetails.js")
        new_data = {
            "IP": "localhost",
            "PW": source_data["server_password"],
            "PORT": source_data["server_port"]
        }

        json_string = json.dumps(new_data, ensure_ascii=False)

        with open(destination, "w", encoding="utf-8") as outfile:
            outfile.write(f"let websocketDetails = {json_string}")

        return True, "Success! websocketDetails.js created."

    except json.JSONDecodeError:
        return False, "Error: Selected file is not valid JSON."
    except Exception as e:
        return False, f"Error: {str(e)}"

# -------------------------------------------------------------------
# CALLBACKS
# -------------------------------------------------------------------

def on_file_changed(props, prop, settings):
    """
    Triggered when the user changes the file path in the UI.
    """
    # 1. Get the new file path
    path = obs.obs_data_get_string(settings, "source_file_path")
    
    # 2. Run the logic
    success, message = generate_wss_details(path)
    
    # 3. Update the 'status_text' setting so the UI displays the result
    obs.obs_data_set_string(settings, "status_text", message)
    
    # 4. Return True to force the properties window to refresh/redraw
    return True

# -------------------------------------------------------------------
# OBS SCRIPT FUNCTIONS
# -------------------------------------------------------------------

def script_description():
    return """<b>WebSocket Server Configuration Loader</b><hr>Load the WebSocket Server configuration file.
    <p> Default file path</p>
    <p>macOS: /Users/<i>userName</i>/Library/Application Support/obs-studio/plugin_config/obs-websocket/config.json</p>
    <p>windows: ...</p>
    <p>linuxs: ...</p>
    """

def script_load(settings):
    """
    Called on script load. We run the logic once to ensure consistency,
    but we don't force a UI refresh here (it happens automatically on load).
    """
    path = obs.obs_data_get_string(settings, "source_file_path")
    success, message = generate_wss_details(path)
    obs.obs_data_set_string(settings, "status_text", message)

def script_update(settings):
    """
    Called on script update. We run the logic once to ensure consistency,
    but we don't force a UI refresh here (it happens automatically on load).
    """
    path = obs.obs_data_get_string(settings, "source_file_path")
    success, message = generate_wss_details(path)
    obs.obs_data_set_string(settings, "status_text", message)

def script_properties():
    props = obs.obs_properties_create()
    
    # 1. File Picker Property
    p_file = obs.obs_properties_add_path(
        props, 
        "source_file_path", 
        "Select JSON Config", 
        obs.OBS_PATH_FILE, 
        "JSON Files (*.json);;All Files (*.*)", 
        None
    )
    
    # Attach the callback so the UI updates immediately when a file is picked
    obs.obs_property_set_modified_callback(p_file, on_file_changed)

    # 2. Status Text Property (Read-Only)
    # We use OBS_TEXT_MULTILINE so long error messages wrap nicely
    obs.obs_properties_add_text(
        props, 
        "status_text", 
        "Status", 
        obs.OBS_TEXT_MULTILINE
    )
    
    return props