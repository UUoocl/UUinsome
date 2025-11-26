import obspython as obs
from pynput import mouse

script_settings = None  # OBS settings

click_source_name = ""
click_monitor = None

position_source_name = ""
position_monitor = None

scroll_source_name = ""
scroll_monitor = None

# Defaults
DEFAULT_SOURCE_NAME = ""


def on_click(x, y, button, pressed):
    if pressed:
        if button == mouse.Button.left:
            # asyncio.run(update_text_source(click_source_name, "MB1"))
            update_text_source(click_source_name, "MB1")
        elif button == mouse.Button.right:
            update_text_source(click_source_name, "MB2")
        elif button == mouse.Button.middle:
            update_text_source(click_source_name, "MB3")


def on_move(x, y):
    values = f"{int(x)}, {int(y)}"
    update_text_source(position_source_name, values)


def on_scroll(x, y, dx, dy):
    values = f"{int(x)}, {int(y)},{int(dx)}, {int(dy)}"
    update_text_source(scroll_source_name, values)


def update_text_source(source_name, text):
    source = obs.obs_get_source_by_name(source_name)
    if source is not None:
        settings = obs.obs_data_create()
        obs.obs_data_set_string(settings, "text", text)
        obs.obs_source_update(source, settings)
        obs.obs_data_release(settings)
        obs.obs_source_release(source)


def script_description():
    return "Monitors mouse clicks and sends events to a text source."


def script_defaults(settings):
    obs.obs_data_set_default_string(settings, "click_source_name", DEFAULT_SOURCE_NAME)
    

def script_properties():
    props = obs.obs_properties_create()
    # Populate the dropdown with available text sources
    
    bool_click = obs.obs_properties_add_bool(props, "click_bool", "monitor mouse clicks")

    obs.obs_property_set_long_description(bool_click, "Check to monitor mouse clicks,else uncheck")
    click = obs.obs_properties_add_list(
        props,
        "click_source_name",
        "Click Source",
        obs.OBS_COMBO_TYPE_LIST,
        obs.OBS_COMBO_FORMAT_STRING
    )

    bool_position = obs.obs_properties_add_bool(props, "position_bool", "monitor mouse position")
    obs.obs_property_set_long_description(bool_position, "Check to monitor mouse clicks,else uncheck")
    position = obs.obs_properties_add_list(
        props,
        "position_source_name",
        "Position Source",
        obs.OBS_COMBO_TYPE_LIST,
        obs.OBS_COMBO_FORMAT_STRING
    )

    bool_scroll = obs.obs_properties_add_bool(props, "scroll_bool", "monitor mouse scroll")
    obs.obs_property_set_long_description(bool_scroll, "Check to monitor mouse clicks,else uncheck")
    scroll = obs.obs_properties_add_list(
        props,
        "scroll_source_name",
        "Scroll Source",
        obs.OBS_COMBO_TYPE_LIST,
        obs.OBS_COMBO_FORMAT_STRING
    )

    # populate drop down lists of text sources
    sources = obs.obs_enum_sources()
    if sources is not None:
        for source in sources:
            source_type = obs.obs_source_get_type(source)
            if source_type == obs.OBS_SOURCE_TYPE_INPUT:
                unversioned_id = obs.obs_source_get_unversioned_id(source)
                if unversioned_id == "text_gdiplus" or unversioned_id == "text_ft2_source":
                    name = obs.obs_source_get_name(source)
                    obs.obs_property_list_add_string(click, name, name)
                    obs.obs_property_list_add_string(position, name, name)
                    obs.obs_property_list_add_string(scroll, name, name)
        obs.source_list_release(sources)    

    return props


def script_load(settings):
    global click_monitor, click_source_name, position_source_name, scroll_source_name, script_settings
    print("loading mouse script")
    script_settings = settings  # Store OBS settings

    
    click_bool = obs.obs_data_get_bool(settings, "click_bool")
    position_bool = obs.obs_data_get_bool(settings, "position_bool")
    scroll_bool = obs.obs_data_get_bool(settings, "scroll_bool")
    print(f"click boolean {click_bool}")
    print(f"pos boolean {position_bool}")
    print(f"scroll boolean {scroll_bool}")

    if click_bool:
        click_source_name = obs.obs_data_get_string(settings, "click_source_name")
        click_monitor = mouse.Listener(
            on_click=on_click)
        click_monitor.stop
        click_monitor.start()
    
    if position_bool:
        position_source_name = obs.obs_data_get_string(settings, "position_source_name")
        position_monitor = mouse.Listener(
            on_move=on_move)
        position_monitor.stop
        position_monitor.start()

    if scroll_bool:
        scroll_source_name = obs.obs_data_get_string(settings, "scroll_source_name")
        scroll_monitor = mouse.Listener(
            on_scroll=on_scroll)
        scroll_monitor.stop
        scroll_monitor.start()
    

def script_unload():
    global click_monitor, position_monitor, scroll_monitor
        
    if click_monitor:
        click_monitor.stop
    click_monitor = None

    if position_monitor:
        position_monitor.stop
    position_monitor = None

    if scroll_monitor:
        scroll_monitor.stop
    scroll_monitor = None
    

def script_update(settings):
    global click_monitor, click_source_name
    

    # if click_monitor:
    #     click_monitor.stop # Stop the old listener

    # click_source_name = obs.obs_data_get_string(settings, "click_source_name")
    # click_monitor = mouse.Listener(on_click=on_click)
    # click_monitor.start()