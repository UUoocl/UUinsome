"""
Docstring for 04_get_keyboard_key
This Source Code Form is subject to the terms of the
Mozilla Public License, v. 2.0. If a copy of the MPL
was not distributed with this file, You can obtain one
at https://mozilla.org/MPL/2.0/.

Converted from modified showhtk.lua by poypoyan. https://github.com/poypoyan/showhtk

OBS hotkey values are sent to text sources
"""

import obspython as obs
import platform

# --- Constants & Global Data Structures ---

os_name = platform.system()
if os_name == "Windows":
    SUPER_KEY = "Win"
    RETURN_KEY = "Enter"
elif os_name == "Darwin": # macOS
    SUPER_KEY = "Cmd"
    RETURN_KEY = "Return"
else: # Linux/Other
    SUPER_KEY = "Super"
    RETURN_KEY = "Return"

# Global variables for the script
g_source_name = ""
JSON_DATA = "{"
HOTKEY_CALLBACKS = {} # Dictionary to hold the dynamically created hotkey functions

# NOTE: Python uses lists of dictionaries for the Lua tables
KEYBOARD_LAYOUT = [ # ind = true means that the key can be a standalone hotkey
    {"id": "ESC", "jsn": "OBS_KEY_ESCAPE", "txt": "Esc", "ind": True, "type": False},
    {"id": "F1", "jsn": "OBS_KEY_F1", "txt": "F1", "ind": True, "type": False},
    {"id": "F2", "jsn": "OBS_KEY_F2", "txt": "F2", "ind": True, "type": False},
    {"id": "F3", "jsn": "OBS_KEY_F3", "txt": "F3", "ind": True, "type": False},
    {"id": "F4", "jsn": "OBS_KEY_F4", "txt": "F4", "ind": True, "type": False},
    {"id": "F5", "jsn": "OBS_KEY_F5", "txt": "F5", "ind": True, "type": False},
    {"id": "F6", "jsn": "OBS_KEY_F6", "txt": "F6", "ind": True, "type": False},
    {"id": "F7", "jsn": "OBS_KEY_F7", "txt": "F7", "ind": True, "type": False},
    {"id": "F8", "jsn": "OBS_KEY_F8", "txt": "F8", "ind": True, "type": False},
    {"id": "F9", "jsn": "OBS_KEY_F9", "txt": "F9", "ind": True, "type": False},
    {"id": "F10", "jsn": "OBS_KEY_F10", "txt": "F10", "ind": True, "type": False},
    {"id": "F11", "jsn": "OBS_KEY_F11", "txt": "F11", "ind": True, "type": False},
    {"id": "F12", "jsn": "OBS_KEY_F12", "txt": "F12", "ind": True, "type": False},
    {"id": "F13", "jsn": "OBS_KEY_F13", "txt": "F13", "ind": True, "type": False},
    {"id": "F14", "jsn": "OBS_KEY_F14", "txt": "F14", "ind": True, "type": False},
    {"id": "F15", "jsn": "OBS_KEY_F15", "txt": "F15", "ind": True, "type": False},
    {"id": "F16", "jsn": "OBS_KEY_F16", "txt": "F16", "ind": True, "type": False},
    {"id": "F17", "jsn": "OBS_KEY_F17", "txt": "F17", "ind": True, "type": False},
    {"id": "F18", "jsn": "OBS_KEY_F18", "txt": "F18", "ind": True, "type": False},
    {"id": "F19", "jsn": "OBS_KEY_F19", "txt": "F19", "ind": True, "type": False},
    {"id": "F20", "jsn": "OBS_KEY_F20", "txt": "F20", "ind": True, "type": False},
    {"id": "F21", "jsn": "OBS_KEY_F21", "txt": "F21", "ind": True, "type": False},
    {"id": "F22", "jsn": "OBS_KEY_F22", "txt": "F22", "ind": True, "type": False},
    {"id": "F23", "jsn": "OBS_KEY_F23", "txt": "F23", "ind": True, "type": False},
    {"id": "F24", "jsn": "OBS_KEY_F24", "txt": "F24", "ind": True, "type": False},
    {"id": "DELETE", "jsn": "OBS_KEY_DELETE", "txt": "Del", "ind": True, "type": False},
    {"id": "RETURN", "jsn": "OBS_KEY_RETURN", "txt": RETURN_KEY, "ind": True, "type": False},
    {"id": "TILDE", "jsn": "OBS_KEY_ASCIITILDE", "txt": "`", "shiftTxt": "~", "ind": True, "type": True},
    {"id": "TILDE~", "jsn": "OBS_KEY_DEAD_GRAVE", "txt": "`", "shiftTxt": "~", "ind": True, "type": True},
    {"id": "MINUS", "jsn": "OBS_KEY_MINUS", "txt": "-", "shiftTxt": "_", "ind": True, "type": True},
    {"id": "PLUS", "jsn": "OBS_KEY_PLUS", "txt": "=", "shiftTxt": "+", "ind": True, "type": True},
    {"id": "QOUTE", "jsn": "OBS_KEY_QUOTE", "txt": "'", "shiftTxt": "\"", "ind": True, "type": True},
    {"id": "EQUAL", "jsn": "OBS_KEY_EQUAL", "txt": "=", "shiftTxt": "+", "ind": True, "type": True},
    {"id": "BSPACE", "jsn": "OBS_KEY_BACKSPACE", "txt": "BS", "ind": True, "type": False},
    {"id": "TAB", "jsn": "OBS_KEY_TAB", "txt": "Tab", "ind": True, "type": False},
    {"id": "CAPSLOCK", "jsn": "OBS_KEY_CAPSLOCK", "txt": "CAPS", "ind": True, "type": False},
    {"id": "BLEFT", "jsn": "OBS_KEY_BRACKETLEFT", "txt": "[", "shiftTxt": "{", "ind": True, "type": True},
    {"id": "BRIGHT", "jsn": "OBS_KEY_BRACKETRIGHT", "txt": "]", "shiftTxt": "}", "ind": True, "type": True},
    {"id": "BSLASH", "jsn": "OBS_KEY_BACKSLASH", "txt": "\\", "shiftTxt": "|", "ind": True, "type": True},
    {"id": "SCOLON", "jsn": "OBS_KEY_SEMICOLON", "txt": ";", "shiftTxt": ":", "ind": True, "type": True},
    {"id": "APOS", "jsn": "OBS_KEY_APOSTROPHE", "txt": "'", "shiftTxt": "\"", "ind": True, "type": True},
    {"id": "COMMA", "jsn": "OBS_KEY_COMMA", "txt": ",", "shiftTxt": "<", "ind": True, "type": True},
    {"id": "PERIOD", "jsn": "OBS_KEY_PERIOD", "txt": ".", "shiftTxt": ">", "ind": True, "type": True},
    {"id": "SLASH", "jsn": "OBS_KEY_SLASH", "txt": "/", "shiftTxt": "?", "ind": True, "type": True},
    {"id": "SPACE", "jsn": "OBS_KEY_SPACE", "txt": "Space", "shiftTxt": "Space", "ind": True, "type": True},
    {"id": "LEFTARROW", "jsn": "OBS_KEY_LEFT", "txt": "LeftArrow", "shiftTxt": "LeftArrow", "ind": True, "type": True},
    {"id": "RIGHTARROW", "jsn": "OBS_KEY_RIGHT", "txt": "RightArrow", "shiftTxt": "RightArrow", "ind": True, "type": True},
    {"id": "UPARROW", "jsn": "OBS_KEY_UP", "txt": "UpArrow", "shiftTxt": "UpArrow", "ind": True, "type": True},
    {"id": "DOWNARROW", "jsn": "OBS_KEY_DOWN", "txt": "DownArrow", "shiftTxt": "DownArrow", "ind": True, "type": True},
    {"id": "0", "jsn": "OBS_KEY_0", "txt": "0", "shiftTxt": ")", "ind": True, "type": False},
    {"id": "1", "jsn": "OBS_KEY_1", "txt": "1", "shiftTxt": "!", "ind": True, "type": True},
    {"id": "2", "jsn": "OBS_KEY_2", "txt": "2", "shiftTxt": "@", "ind": True, "type": True},
    {"id": "3", "jsn": "OBS_KEY_3", "txt": "3", "shiftTxt": "#", "ind": True, "type": True},
    {"id": "4", "jsn": "OBS_KEY_4", "txt": "4", "shiftTxt": "$", "ind": True, "type": True},
    {"id": "5", "jsn": "OBS_KEY_5", "txt": "5", "shiftTxt": "%", "ind": True, "type": True},
    {"id": "6", "jsn": "OBS_KEY_6", "txt": "6", "shiftTxt": "^", "ind": True, "type": True},
    {"id": "7", "jsn": "OBS_KEY_7", "txt": "7", "shiftTxt": "&", "ind": True, "type": True},
    {"id": "8", "jsn": "OBS_KEY_8", "txt": "8", "shiftTxt": "*", "ind": True, "type": True},
    {"id": "9", "jsn": "OBS_KEY_9", "txt": "9", "shiftTxt": "(", "ind": True, "type": True},
    {"id": "A", "jsn": "OBS_KEY_A", "txt": "a", "shiftTxt": "A", "ind": True, "type": True},
    {"id": "B", "jsn": "OBS_KEY_B", "txt": "b", "shiftTxt": "B", "ind": True, "type": True},
    {"id": "C", "jsn": "OBS_KEY_C", "txt": "c", "shiftTxt": "C", "ind": True, "type": True},
    {"id": "D", "jsn": "OBS_KEY_D", "txt": "d", "shiftTxt": "D", "ind": True, "type": True},
    {"id": "E", "jsn": "OBS_KEY_E", "txt": "e", "shiftTxt": "E", "ind": True, "type": True},
    {"id": "F", "jsn": "OBS_KEY_F", "txt": "f", "shiftTxt": "F", "ind": True, "type": True},
    {"id": "G", "jsn": "OBS_KEY_G", "txt": "g", "shiftTxt": "G", "ind": True, "type": True},
    {"id": "H", "jsn": "OBS_KEY_H", "txt": "h", "shiftTxt": "H", "ind": True, "type": True},
    {"id": "I", "jsn": "OBS_KEY_I", "txt": "i", "shiftTxt": "I", "ind": True, "type": True},
    {"id": "J", "jsn": "OBS_KEY_J", "txt": "j", "shiftTxt": "J", "ind": True, "type": True},
    {"id": "K", "jsn": "OBS_KEY_K", "txt": "k", "shiftTxt": "K", "ind": True, "type": True},
    {"id": "L", "jsn": "OBS_KEY_L", "txt": "l", "shiftTxt": "L", "ind": True, "type": True},
    {"id": "M", "jsn": "OBS_KEY_M", "txt": "m", "shiftTxt": "M", "ind": True, "type": True},
    {"id": "N", "jsn": "OBS_KEY_N", "txt": "n", "shiftTxt": "N", "ind": True, "type": True},
    {"id": "O", "jsn": "OBS_KEY_O", "txt": "o", "shiftTxt": "O", "ind": True, "type": True},
    {"id": "P", "jsn": "OBS_KEY_P", "txt": "p", "shiftTxt": "P", "ind": True, "type": True},
    {"id": "Q", "jsn": "OBS_KEY_Q", "txt": "q", "shiftTxt": "Q", "ind": True, "type": True},
    {"id": "R", "jsn": "OBS_KEY_R", "txt": "r", "shiftTxt": "R", "ind": True, "type": True},
    {"id": "S", "jsn": "OBS_KEY_S", "txt": "s", "shiftTxt": "S", "ind": True, "type": True},
    {"id": "T", "jsn": "OBS_KEY_T", "txt": "t", "shiftTxt": "T", "ind": True, "type": True},
    {"id": "U", "jsn": "OBS_KEY_U", "txt": "u", "shiftTxt": "U", "ind": True, "type": True},
    {"id": "V", "jsn": "OBS_KEY_V", "txt": "v", "shiftTxt": "V", "ind": True, "type": True},
    {"id": "W", "jsn": "OBS_KEY_W", "txt": "w", "shiftTxt": "W", "ind": True, "type": True},
    {"id": "X", "jsn": "OBS_KEY_X", "txt": "x", "shiftTxt": "X", "ind": True, "type": True},
    {"id": "Y", "jsn": "OBS_KEY_Y", "txt": "y", "shiftTxt": "Y", "ind": True, "type": True},
    {"id": "Z", "jsn": "OBS_KEY_Z", "txt": "z", "shiftTxt": "Z", "ind": True, "type": True},
    {"id": "Num0", "jsn": "OBS_KEY_NUM0", "txt": "n0", "shiftTxt": "Ins", "ind": True, "type": True},
    {"id": "Num1", "jsn": "OBS_KEY_NUM1", "txt": "n1", "shiftTxt": "End", "ind": True, "type": True},
    {"id": "Num2", "jsn": "OBS_KEY_NUM2", "txt": "n2", "shiftTxt": "ArrowDown", "ind": True, "type": True},
    {"id": "Num3", "jsn": "OBS_KEY_NUM3", "txt": "n3", "shiftTxt": "PgDn", "ind": True, "type": True},
    {"id": "Num4", "jsn": "OBS_KEY_NUM4", "txt": "n4", "shiftTxt": "ArrowLeft", "ind": True, "type": True},
    {"id": "Num5", "jsn": "OBS_KEY_NUM5", "txt": "n5", "shiftTxt": "5", "ind": True, "type": False},
    {"id": "Num6", "jsn": "OBS_KEY_NUM6", "txt": "n6", "shiftTxt": "ArrowRight", "ind": True, "type": True},
    {"id": "Num7", "jsn": "OBS_KEY_NUM7", "txt": "n7", "shiftTxt": "Home", "ind": True, "type": True},
    {"id": "Num8", "jsn": "OBS_KEY_NUM8", "txt": "n8", "shiftTxt": "ArrowUp", "ind": True, "type": True},
    {"id": "Num9", "jsn": "OBS_KEY_NUM9", "txt": "n9", "shiftTxt": "PgUp", "ind": True, "type": True},
    {"id": "NumAsterisk", "jsn": "OBS_KEY_NUMASTERISK", "txt": "n*", "ind": True, "type": True},
    {"id": "NumMinus", "jsn": "OBS_KEY_NUMMINUS", "txt": "n-", "ind": True, "type": True},
    {"id": "NumPlus", "jsn": "OBS_KEY_NUMPLUS", "txt": "n+", "ind": True, "type": True},
    {"id": "NumPeriod", "jsn": "OBS_KEY_NUMPERIOD", "txt": "n.", "ind": True, "type": True},
    {"id": "NumLock", "jsn": "OBS_KEY_CLEAR", "txt": "NumLock", "ind": True, "type": True},
    {"id": "NumSlash", "jsn": "OBS_KEY_NUMSLASH", "txt": "n/", "ind": True, "type": True},
    {"id": "NumEnter", "jsn": "OBS_KEY_ENTER", "txt": "Enter", "ind": True, "type": True},
]

SHORTCUT_COMBO = [
    {"id": "_", "jsn": "", "txt": ""}, # for ind = true keys in KEYBOARD_LAYOUT
    {"id": "_SHIFT_", "jsn": ", \"shift\": true", "txt": "Shift"}, # for ind = true keys in KEYBOARD_LAYOUT
    {"id": "_CTRL_", "jsn": ", \"control\": true", "txt": "Ctrl"},
    {"id": "_CTRL_SHIFT_", "jsn": ", \"control\": true, \"shift\": true", "txt": "Ctrl+Shift"},
    {"id": "_CTRL_ALT_", "jsn": ", \"control\": true, \"alt\": true", "txt": "Ctrl+Alt"},
    {"id": "_CTRL_ALT_SHIFT_", "jsn": ", \"control\": true, \"alt\": true, \"shift\": true", "txt": "Ctrl+Alt+Shift"},
    {"id": "_ALT_", "jsn": ", \"alt\": true", "txt": "Alt"},
    {"id": "_ALT_SHIFT_", "jsn": ", \"alt\": true, \"shift\": true", "txt": "Alt+Shift"},
    {"id": "_CMD_", "jsn": ", \"command\": true", "txt": SUPER_KEY},
    {"id": "_CMD_SHIFT_", "jsn": ", \"command\": true, \"shift\": true", "txt": SUPER_KEY + "+Shift"},
    {"id": "_CMD_CTRL_", "jsn": ", \"command\": true, \"control\": true", "txt": SUPER_KEY + "+Ctrl"},
    {"id": "_CMD_ALT_", "jsn": ", \"command\": true, \"alt\": true", "txt": SUPER_KEY + "+Alt"},
    {"id": "_CMD_CTRL_ALT_", "jsn": ", \"command\": true, \"alt\": true, \"control\": true", "txt": SUPER_KEY + "+Ctrl+Alt"},
    {"id": "_CMD_SHIFT_ALT_", "jsn": ", \"command\": true, \"alt\": true, \"shift\": true", "txt": SUPER_KEY + "+Shift+Alt"},
    {"id": "_CMD_CTRL_SHIFT_ALT_", "jsn": ", \"command\": true, \"control\": true, \"alt\": true, \"shift\": true", "txt": SUPER_KEY + "+Ctrl+Shift+Alt"},
]

# --- Hotkey Generation Logic ---

# Function to create a closure for each unique hotkey
def create_hotkey_callback(text):
    def callback_func(pressed):
        if pressed:
            update_text(text)
    return callback_func

# Loop through all combinations to build JSON and hotkey callbacks
all_combinations = []
for v1 in SHORTCUT_COMBO:
    for v2 in KEYBOARD_LAYOUT:
        
        htk_text = ""
        # If no modifier Key pressed
        if v1['id'] == "_":
            if not v2['ind']:
                continue
            htk_text = v2['txt']
        elif v1['id'] == "_SHIFT_":
            if not v2['ind']:
                continue
            if v2['type'] and 'shiftTxt' in v2: 
                htk_text = v2['shiftTxt'] 
            else:
                htk_text = v1['txt'] + "+" + v2['txt']
        else:
            htk_text = v1['txt'] + "+" + v2['txt']

        name_htk = "SHOWHTK" + v1['id'] + v2['id']
        
        # Store the hotkey data (name, key, modifiers)
        all_combinations.append({
            'name': name_htk,
            'jsn_key': v2['jsn'],
            'jsn_mod': v1['jsn'],
            'htk_text': htk_text,
            'ind': v2['ind'],
            'combo_id': v1['id']
        })
        
        # Store the callback function
        HOTKEY_CALLBACKS[name_htk] = create_hotkey_callback(htk_text)

KEY_FORM = '"{}": [{{"key": "{}"{}}}]' # JSON format string

# Finalize JSON data string
for i, combo in enumerate(all_combinations):
    # JSON_DATA += KEY_FORM.format( combo['name'], combo['jsn_key'], combo['jsn_mod'])
    JSON_DATA += f"\"{combo['name']}\":[{{\"key\": \"{combo['jsn_key']}\" {combo['jsn_mod']}}}]"
    if i < len(all_combinations) - 1:
        JSON_DATA += ","
JSON_DATA += "}"


# --- Script Functions ---

def update_text(text):
    """Updates the text source with the current hotkey text."""
    source = obs.obs_get_source_by_name(g_source_name)
    if source is not None:
        settings = obs.obs_data_create()
        obs.obs_data_set_string(settings, "text", text)
        obs.obs_source_update(source, settings)
        obs.obs_data_release(settings)
        obs.obs_source_release(source)

def reg_hotkey(jsn, name_htk, callback_func):
    """Auxiliary function to register hotkey."""
    arr = obs.obs_data_get_array(jsn, name_htk)
    # In Python scripts, obs.obs_module_file() is used instead of script_path()
    # to generate a unique ID based on the script's path.
    htk = obs.obs_hotkey_register_frontend(
        name_htk,
        name_htk,
        callback_func
    )
    obs.obs_hotkey_load(htk, arr)
    obs.obs_data_array_release(arr)
    # The hotkey object 'htk' usually needs to be stored or released if not needed later. 
    # For frontend hotkeys, they are managed by OBS until script unload.

# --- OBS Script Callbacks ---

def script_load(settings):
    """Called on startup to register hotkeys."""
    # print(f"{json.dumps(all_combinations, indent=1)}")
    # print(f"json {json.dumps(JSON_DATA, indent=1)}")
    jsn = obs.obs_data_create_from_json(JSON_DATA)

    # Register the generated hotkeys
    for combo in all_combinations:
        name_htk = combo['name']
        callback = HOTKEY_CALLBACKS.get(name_htk)
        if callback:
            reg_hotkey(jsn, name_htk, callback)

    obs.obs_data_release(jsn)

def script_description():
    """Returns the script description."""
    return "Show pressed key \nSelect a Text Source to store the key."

def script_properties():
    """Defines the properties the user can change."""
    props = obs.obs_properties_create()

    # Add list of available text sources
    p = obs.obs_properties_add_list(props, "source", "Text Source", obs.OBS_COMBO_TYPE_EDITABLE, obs.OBS_COMBO_FORMAT_STRING)
    sources = obs.obs_enum_sources()
    
    if sources is not None:
        for source in sources:
            source_id = obs.obs_source_get_unversioned_id(source)
            # Filter for Text GDI+ and Text Freetype (the OBS Python binding often uses a different ID for Freetype)
            if source_id == "text_gdiplus" or source_id == "text_ft2_source": 
                name = obs.obs_source_get_name(source)
                obs.obs_property_list_add_string(p, name, name)
            obs.obs_source_release(source) # Important to release the source reference
            
    # obs_enum_sources returns a list of source references, which need to be released via obs_source_release
    # The obs-python binding *should* handle the release of the list itself upon garbage collection, 
    # but the individual sources must be manually released if iterated.

    return props

def script_update(settings):
    """Called when settings are changed."""
    global g_source_name
    g_source_name = obs.obs_data_get_string(settings, "source")

def script_defaults(settings):
    """Called to set the default settings."""
    # No defaults were set in the Lua script, so leaving this empty.
    pass

def script_unload():
    """Called when the script is unloaded. Clears the text."""
    update_text("")
    # Hotkeys are automatically unregistered by OBS when a script is unloaded.
    pass