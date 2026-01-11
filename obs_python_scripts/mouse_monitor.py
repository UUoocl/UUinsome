import obspython as obs
from pynput import mouse
import json
import threading

"""
Mouse Monitor Browser Source Script for OBS Studio
==================================================

This script monitors global mouse events (clicks, movement, and scrolling) and sends these events 
to a specified OBS Browser Source via JavaScript events. This allows for real-time visualization 
of mouse activity within an OBS scene.

Dependencies:
    - obspython (OBS Studio Python API)
    - pynput (Mouse monitoring)
"""

# Globals
script_settings = None
event_lock = threading.Lock()

# Click State
click_source_name = ""
click_monitor = None
pending_clicks = []

# Position State
position_source_name = ""
position_monitor = None
pending_move = None

# Scroll State
scroll_source_name = ""
scroll_monitor = None
# dx/dy are floats to support smooth decay
scroll_state = {"x": 0, "y": 0, "dx": 0.0, "dy": 0.0}

# Defaults
DEFAULT_SOURCE_NAME = ""


# ---------------------------------------------------------------------------
# Background Thread Callbacks (pynput)
# ---------------------------------------------------------------------------
# These run in a separate thread. MUST NOT call OBS API functions directly.
# They only update shared state protected by event_lock.

def on_click(x, y, button, pressed):
    if pressed:
        btn_code = ""
        if button == mouse.Button.left:
            btn_code = "MB1"
        elif button == mouse.Button.right:
            btn_code = "MB2"
        elif button == mouse.Button.middle:
            btn_code = "MB3"
        
        if btn_code:
            data = {
                "button": btn_code,
                "x": int(x),
                "y": int(y),
                "pressed": pressed
            }
            with event_lock:
                pending_clicks.append(data)


def on_move(x, y):
    data = {
        "x": int(x),
        "y": int(y)
    }
    with event_lock:
        global pending_move
        pending_move = data


def on_scroll(x, y, dx, dy):
    with event_lock:
        scroll_state["x"] = int(x)
        scroll_state["y"] = int(y)
        # Accumulate deltas to capture fast scrolls between ticks
        scroll_state["dx"] += dx
        scroll_state["dy"] += dy


# ---------------------------------------------------------------------------
# Main Thread Logic (OBS)
# ---------------------------------------------------------------------------

def update_browser_source(source_name, event_name, data):
    """
    Sends a custom JavaScript event to a specified OBS Browser Source.
    Must be called from the main thread.
    """
    if not source_name:
        return

    source = obs.obs_get_source_by_name(source_name)
    if source is not None:
        cd = obs.calldata_create()
        obs.calldata_set_string(cd, "eventName", event_name)
        obs.calldata_set_string(cd, "jsonString", json.dumps(data))
        obs.proc_handler_call(obs.obs_source_get_proc_handler(source), "javascript_event", cd)
        obs.calldata_destroy(cd)
        obs.obs_source_release(source)


def timer_tick():
    """
    Periodic timer callback running on the main OBS thread.
    Processes queued events and handles scroll decay.
    """
    global pending_move
    
    # 1. Process Clicks
    clicks_to_send = []
    with event_lock:
        if pending_clicks:
            clicks_to_send = pending_clicks[:]
            pending_clicks.clear()
            
    for data in clicks_to_send:
        update_browser_source(click_source_name, "MouseClick", data)

    # 2. Process Move
    move_to_send = None
    with event_lock:
        if pending_move:
            move_to_send = pending_move
            pending_move = None
            
    if move_to_send:
        update_browser_source(position_source_name, "MouseMove", move_to_send)

    # 3. Process Scroll (with decay)
    scroll_data = None
    with event_lock:
        # Check if we have significant scroll value
        if abs(scroll_state["dx"]) > 0.1 or abs(scroll_state["dy"]) > 0.1:
            # Prepare data to send
            scroll_data = {
                "x": scroll_state["x"],
                "y": scroll_state["y"],
                "dx": int(scroll_state["dx"]),
                "dy": int(scroll_state["dy"])
            }
            
            # Apply decay
            scroll_state["dx"] *= 0.8
            scroll_state["dy"] *= 0.8
            
            # Snap to zero if small
            if abs(scroll_state["dx"]) < 0.5: scroll_state["dx"] = 0.0
            if abs(scroll_state["dy"]) < 0.5: scroll_state["dy"] = 0.0
    
    if scroll_data:
        update_browser_source(scroll_source_name, "MouseScroll", scroll_data)


# ---------------------------------------------------------------------------
# Script Settings & Lifecycle
# ---------------------------------------------------------------------------

def script_description():
    return "Monitors mouse clicks, movement, and scroll. Sends events to a browser source. Safe threading implementation."


def script_defaults(settings):
    obs.obs_data_set_default_string(settings, "click_source_name", DEFAULT_SOURCE_NAME)
    

def script_properties():
    props = obs.obs_properties_create()
    
    # Click Settings
    bool_click = obs.obs_properties_add_bool(props, "click_bool", "Monitor Mouse Clicks")
    click = obs.obs_properties_add_list(
        props,
        "click_source_name",
        "Click Source",
        obs.OBS_COMBO_TYPE_LIST,
        obs.OBS_COMBO_FORMAT_STRING
    )

    # Position Settings
    bool_position = obs.obs_properties_add_bool(props, "position_bool", "Monitor Mouse Position")
    position = obs.obs_properties_add_list(
        props,
        "position_source_name",
        "Position Source",
        obs.OBS_COMBO_TYPE_LIST,
        obs.OBS_COMBO_FORMAT_STRING
    )

    # Scroll Settings
    bool_scroll = obs.obs_properties_add_bool(props, "scroll_bool", "Monitor Mouse Scroll")
    scroll = obs.obs_properties_add_list(
        props,
        "scroll_source_name",
        "Scroll Source",
        obs.OBS_COMBO_TYPE_LIST,
        obs.OBS_COMBO_FORMAT_STRING
    )

    # Populate Source Lists
    sources = obs.obs_enum_sources()
    if sources is not None:
        for source in sources:
            source_type = obs.obs_source_get_type(source)
            if source_type == obs.OBS_SOURCE_TYPE_INPUT:
                unversioned_id = obs.obs_source_get_unversioned_id(source)
                if unversioned_id == "browser_source":
                    name = obs.obs_source_get_name(source)
                    obs.obs_property_list_add_string(click, name, name)
                    obs.obs_property_list_add_string(position, name, name)
                    obs.obs_property_list_add_string(scroll, name, name)
        obs.source_list_release(sources)    

    return props


def script_load(settings):
    global click_monitor, click_source_name, position_monitor, position_source_name, scroll_monitor, scroll_source_name, script_settings
    
    print("Loading mouse monitor script...")
    script_settings = settings

    click_bool = obs.obs_data_get_bool(settings, "click_bool")
    position_bool = obs.obs_data_get_bool(settings, "position_bool")
    scroll_bool = obs.obs_data_get_bool(settings, "scroll_bool")

    # Stop existing monitors
    stop_monitors()

    # Start Monitors
    if click_bool:
        click_source_name = obs.obs_data_get_string(settings, "click_source_name")
        click_monitor = mouse.Listener(on_click=on_click)
        click_monitor.start()
        print("Click monitor started.")
    
    if position_bool:
        position_source_name = obs.obs_data_get_string(settings, "position_source_name")
        position_monitor = mouse.Listener(on_move=on_move)
        position_monitor.start()
        print("Position monitor started.")

    if scroll_bool:
        scroll_source_name = obs.obs_data_get_string(settings, "scroll_source_name")
        scroll_monitor = mouse.Listener(on_scroll=on_scroll)
        scroll_monitor.start()
        print("Scroll monitor started.")

    # Start Main Loop Timer (50ms = 20 ticks/sec)
    obs.timer_remove(timer_tick) # Ensure no duplicates
    obs.timer_add(timer_tick, 50)


def script_unload():
    stop_monitors()
    obs.timer_remove(timer_tick)
    print("Mouse monitor script unloaded.")


def stop_monitors():
    global click_monitor, position_monitor, scroll_monitor
    
    if click_monitor:
        click_monitor.stop()
        click_monitor = None

    if position_monitor:
        position_monitor.stop()
        position_monitor = None

    if scroll_monitor:
        scroll_monitor.stop()
        scroll_monitor = None


def script_update(settings):
    script_load(settings)