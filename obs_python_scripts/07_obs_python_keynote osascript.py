import obspython as obs
import subprocess
import threading
import json
import time

# Defaults
DEFAULT_SCROLL_SPEED = 10
DEFAULT_FONT_SIZE = 10

#Global variables
script_settings = None
teleprompter_speed = DEFAULT_SCROLL_SPEED
teleprompter_size = DEFAULT_FONT_SIZE

#hotkeys
add_tag_hotkey_id = None
next_slide_hotkey_id = None
previous_slide_hotkey_id = None
start_slideshow_hotkey_id = None
font_decrease_hotkey_id = None
font_increase_hotkey_id = None
scroll_increase_hotkey_id = None
scroll_decrease_hotkey_id = None

#OBS Functions
def script_defaults(settings):
    obs.obs_data_set_default_int(settings, "_size", DEFAULT_FONT_SIZE)
    obs.obs_data_set_default_int(settings, "_speed", DEFAULT_SCROLL_SPEED)


def script_description():
    description ='''
    <p>Control Keynote with hotkeys.</p> <p>Go to 'OBS Settings' to set hotkeys.</p>
      <a href="https://github.com/UUoocl/Keynote_Controls">Documentation</a>
'''
    return description


def script_load(settings):
    global script_settings, add_tag_hotkey_id, next_slide_hotkey_id, previous_slide_hotkey_id,start_slideshow_hotkey_id
    global font_decrease_hotkey_id,font_increase_hotkey_id
    global scroll_increase_hotkey_id,scroll_decrease_hotkey_id
    global teleprompter_speed, teleprompter_size

    try:
        script_settings = settings

        # get saved settings 
        teleprompter_speed = obs.obs_data_get_int(settings, "_speed")
        teleprompter_size = obs.obs_data_get_int(settings, "_size")

        # hotkey variables
        add_tag_hotkey_id = None
        next_slide_hotkey_id = None
        previous_slide_hotkey_id = None
        start_slideshow_hotkey_id = None
        font_decrease_hotkey_id = None
        font_increase_hotkey_id = None
        scroll_increase_hotkey_id = None
        scroll_decrease_hotkey_id = None
        
        # Register hotkeys
        add_tag_hotkey_id = obs.obs_hotkey_register_frontend("call_add_tag", "py_kn_Add Scene tag to slide", add_tag_cb)
        next_slide_hotkey_id = obs.obs_hotkey_register_frontend("call_next_slide", "py_kn_go to next slide", on_next_slide_hk)
        previous_slide_hotkey_id = obs.obs_hotkey_register_frontend("call_previous_slide", "py_kn_go to previous slide", on_previous_slide_hk)
        start_slideshow_hotkey_id = obs.obs_hotkey_register_frontend("call_start_slideshow", "py_kn_start_slideshow", on_start_slideshow_hk)
        font_decrease_hotkey_id = obs.obs_hotkey_register_frontend("call_font_decrease", "py_kn_font_decrease", on_font_decrease_hk)
        font_increase_hotkey_id = obs.obs_hotkey_register_frontend("call_font_increase", "py_kn_font_increase", on_font_increase_hk)
        scroll_decrease_hotkey_id = obs.obs_hotkey_register_frontend("call_scroll_decrease", "py_kn_scroll_decrease", on_scroll_decrease_hk)
        scroll_increase_hotkey_id = obs.obs_hotkey_register_frontend("call_scroll_increase", "py_kn_scroll_increase", on_scroll_increase_hk)
        
        # Load hotkey bindings from saved settings
        if add_tag_hotkey_id: 
                arr = obs.obs_data_get_array(settings, "call_add_tag"); 
                obs.obs_hotkey_load(add_tag_hotkey_id, arr); 
                obs.obs_data_array_release(arr)

        if next_slide_hotkey_id: 
                arr = obs.obs_data_get_array(settings, "call_next_slide"); 
                obs.obs_hotkey_load(next_slide_hotkey_id, arr); 
                obs.obs_data_array_release(arr)

        if previous_slide_hotkey_id: 
                arr = obs.obs_data_get_array(settings, "call_previous_slide"); 
                obs.obs_hotkey_load(previous_slide_hotkey_id, arr); 
                obs.obs_data_array_release(arr)

        if start_slideshow_hotkey_id: 
            arr = obs.obs_data_get_array(settings, "call_start_slideshow"); 
            obs.obs_hotkey_load(start_slideshow_hotkey_id, arr); 
            obs.obs_data_array_release(arr)
        if font_decrease_hotkey_id: 
            arr = obs.obs_data_get_array(settings, "call_font_decrease"); 
            obs.obs_hotkey_load(font_decrease_hotkey_id, arr); 
            obs.obs_data_array_release(arr)
        if font_increase_hotkey_id: 
            arr = obs.obs_data_get_array(settings, "call_font_increase"); 
            obs.obs_hotkey_load(font_increase_hotkey_id, arr); 
            obs.obs_data_array_release(arr)
        if scroll_increase_hotkey_id: 
            arr = obs.obs_data_get_array(settings, "call_scroll_increase"); 
            obs.obs_hotkey_load(scroll_increase_hotkey_id, arr); 
            obs.obs_data_array_release(arr)
        if scroll_decrease_hotkey_id: 
            arr = obs.obs_data_get_array(settings, "call_scroll_decrease"); 
            obs.obs_hotkey_load(scroll_decrease_hotkey_id, arr); 
            obs.obs_data_array_release(arr)
                
    except Exception as e:
        print(f"CRITICAL ERROR IN SCRIPT_LOAD: {e}")
        # Ensure hotkey IDs are None if registration failed
        add_tag_hotkey_id = None
        next_slide_hotkey_id = None
        previous_slide_hotkey_id = None
        start_slideshow_hotkey_id = None
        font_decrease_hotkey_id = None
        font_increase_hotkey_id = None
        scroll_increase_hotkey_id = None
        scroll_decrease_hotkey_id = None


def script_update(settings):
    speed = obs.obs_data_get_int(settings, "_speed")
    set_source_scroll_filter("Slide Notes Text", "Scroll", speed)

    size = obs.obs_data_get_int(settings, "_size")
    set_text_source_font_size("Slide Notes Text", size)


def script_properties(): #UI
    global script_settings

    props = obs.obs_properties_create()
    obs.obs_properties_add_button(props, "add_tag_btn", "Add Tag to Slide", add_tag_cb)  

    # obs.obs_properties_add_button(props, "button1", "Refresh1:", callback)
    nav_group = obs.obs_properties_create()
    obs.obs_properties_add_group(props, "nav_group", "Slide Show Navigation", obs.OBS_GROUP_NORMAL, nav_group)
    obs.obs_properties_add_button(nav_group, "start_slide_btn", "Start Slideshow", start_slideshow_cb)  
    obs.obs_properties_add_button(nav_group, "next_slide_btn", "Next Slide", next_slide_cb)  
    obs.obs_properties_add_button(nav_group, "prev_slide_btn", "Previous Slide", previous_slide_cb)  
    
    teleprompter_group = obs.obs_properties_create()
    obs.obs_properties_add_group(props, "teleprompter_group", "Teleprompter Setting", obs.OBS_GROUP_NORMAL, teleprompter_group)
    obs.obs_properties_add_int_slider(teleprompter_group,"_speed","Scroll speed:",0,100,1)
    obs.obs_properties_add_int_slider(teleprompter_group,"_size","Font size:",10,100,1)
    return props


def script_save(settings):
    global add_tag_hotkey_id, next_slide_hotkey_id, previous_slide_hotkey_id
    global start_slideshow_hotkey_id
    global font_decrease_hotkey_id
    global font_increase_hotkey_id
    global scroll_increase_hotkey_id
    global scroll_decrease_hotkey_id

    # Save Hotkey Bindings
    try:
        if add_tag_hotkey_id is not None:
            add_tag_hotkey1_save_arr = obs.obs_hotkey_save(add_tag_hotkey_id)
            if add_tag_hotkey1_save_arr:
                obs.obs_data_set_array(settings, "call_add_tag", add_tag_hotkey1_save_arr)
                obs.obs_data_array_release(add_tag_hotkey1_save_arr)
        
        if next_slide_hotkey_id is not None:
            next_slide_hotkey_save_arr = obs.obs_hotkey_save(next_slide_hotkey_id)
            if next_slide_hotkey_save_arr:
                obs.obs_data_set_array(settings, "call_next_slide", next_slide_hotkey_save_arr)
                obs.obs_data_array_release(next_slide_hotkey_save_arr)

        if previous_slide_hotkey_id is not None:
            previous_slide_hotkey_save_arr = obs.obs_hotkey_save(previous_slide_hotkey_id)
            if previous_slide_hotkey_save_arr:
                obs.obs_data_set_array(settings, "call_previous_slide", previous_slide_hotkey_save_arr)
                obs.obs_data_array_release(previous_slide_hotkey_save_arr)
                
        if start_slideshow_hotkey_id is not None:
            save_arr = obs.obs_hotkey_save(start_slideshow_hotkey_id)
            if save_arr:
                obs.obs_data_set_array(settings, "call_start_slideshow", save_arr)
                obs.obs_data_array_release(save_arr)
        if font_decrease_hotkey_id is not None:
            save_arr = obs.obs_hotkey_save(font_decrease_hotkey_id)
            if save_arr:
                obs.obs_data_set_array(settings, "call_font_decrease", save_arr)
                obs.obs_data_array_release(save_arr)
        if font_increase_hotkey_id is not None:
            save_arr = obs.obs_hotkey_save(font_increase_hotkey_id)
            if save_arr:
                obs.obs_data_set_array(settings, "call_font_increase", save_arr)
                obs.obs_data_array_release(save_arr)
        if scroll_increase_hotkey_id is not None:
            save_arr = obs.obs_hotkey_save(scroll_increase_hotkey_id)
            if save_arr:
                obs.obs_data_set_array(settings, "call_scroll_increase", save_arr)
                obs.obs_data_array_release(save_arr)
        if scroll_decrease_hotkey_id is not None:
            save_arr = obs.obs_hotkey_save(scroll_decrease_hotkey_id)
            if save_arr:
                obs.obs_data_set_array(settings, "call_scroll_decrease", save_arr)
                obs.obs_data_array_release(save_arr)

    except Exception as e:
        print(f"Error saving hotkeys: {e}")


def script_unload():
    global script_settings, add_tag_hotkey_id, next_slide_hotkey_id, previous_slide_hotkey_id
    global start_slideshow_hotkey_id
    global font_decrease_hotkey_id
    global font_increase_hotkey_id
    global scroll_increase_hotkey_id
    global scroll_decrease_hotkey_id
    
    # Clean up hotkeys properly
    try:
        if add_tag_hotkey_id is not None:
            obs.obs_hotkey_unregister(add_tag_hotkey_id)
            add_tag_hotkey_id = None
        if next_slide_hotkey_id is not None:
            obs.obs_hotkey_unregister(next_slide_hotkey_id)
            next_slide_hotkey_id = None
        if previous_slide_hotkey_id is not None:
            obs.obs_hotkey_unregister(previous_slide_hotkey_id)
            previous_slide_hotkey_id = None
        if start_slideshow_hotkey_id is not None:
            obs.obs_hotkey_unregister(start_slideshow_hotkey_id)
            start_slideshow_hotkey_id = None
        if font_decrease_hotkey_id is not None:
            obs.obs_hotkey_unregister(font_decrease_hotkey_id)
            font_decrease_hotkey_id = None
        if font_increase_hotkey_id is not None:
            obs.obs_hotkey_unregister(font_increase_hotkey_id)
            font_increase_hotkey_id = None
        if scroll_increase_hotkey_id is not None:
            obs.obs_hotkey_unregister(scroll_increase_hotkey_id)
            scroll_increase_hotkey_id = None
        if scroll_decrease_hotkey_id is not None:
            obs.obs_hotkey_unregister(scroll_decrease_hotkey_id)
            scroll_decrease_hotkey_id = None

    except Exception as e:
        print(f"Error unregistering hotkeys: {e}")


# UI callbacks
def next_slide_cb(props,prop):
    on_next_slide_hk(True)


def previous_slide_cb(props,prop):
    on_previous_slide_hk(True)


def add_tag_cb(props,prop):
    tag_thread = threading.Thread(target=on_add_tag_hk, args=(True,)) 
    tag_thread.start()
    # tag_thread.join()
    # on_add_tag_hk(True)

def start_slideshow_cb(props,prop):
    navigate_slides("Start")


# Script Functions
def navigate_slides(direction):
    global teleprompter_speed
    
    if direction == "Next":
        script_name = osa_next
        app = "osascript"
    elif direction == "Previous":
        script_name = osa_previous
        app = "osascript"

    elif direction == "Start":
        script_name = osa_start
        app = "osascript"
    else:
        return

    command = [
        app, 
        "-l", "JavaScript", 
        "-e", script_name
        ]
    try:
        # Execute the command and capture the output
        # capture_output=True redirects stdout and stderr to pipes
        # text=True decodes the output as text (UTF-8 by default)

        result = subprocess.run(
            command,
            encoding='utf-8',
            capture_output=True, 
            text=True, 
            check=True
            )
        # Access the captured standard output
        output = json.loads(result.stdout)
        
        #if "slideStatus" in output:
            #print(f"command result, slide status: {output['slideStatus']}")

        if "scene" in output:
            set_current_scene(output['scene'])
        
        if "slideNotes" in output:
            # write the slides notes to a text source
            set_source_text("Slide Notes Text",output['slideNotes'])
            #Reset the text source to show the first line of text
            set_source_scroll_filter("Slide Notes Text", 'Scroll', 0.0)
        #pause 1 second 
            time.sleep(1)
        #start scrolling. 
            set_source_scroll_filter("Slide Notes Text", 'Scroll', teleprompter_speed)

    except subprocess.CalledProcessError as e:
        # Handle cases where the `shortcuts` command itself or the shell script inside failed
        print(f"--- Error Executing subprocess '{script_name}' ---")
        print(f"Command failed with return code {e.returncode}")
        print(f"Stdout: {e.stdout.strip()}")
        print(f"Stderr: {e.stderr.strip()}")


def get_current_scene_name():
    # 1. Get a reference to the current scene (as an obs_source_t* object)
    current_scene_source = obs.obs_frontend_get_current_scene()

    if current_scene_source is not None:
        # 2. Get the name of the source (which is the scene name)
        scene_name = obs.obs_source_get_name(current_scene_source)
        
        # 3. Release the reference to the scene source
        # This is important to prevent memory leaks and is required by the OBS API
        obs.obs_source_release(current_scene_source)
        
        return scene_name
    
    return "No Scene Active"


def set_current_scene(scene_name):
    scenes = obs.obs_frontend_get_scenes()
    for scene in scenes:
        name = obs.obs_source_get_name(scene)
        if name == scene_name:
            obs.obs_frontend_set_current_scene(scene)
    obs.source_list_release(scenes)


def set_source_text(source_name, text):
    """
    Callback function to update the text source with JSON format.
    """
    
    if source_name:
        try:
            source = obs.obs_get_source_by_name(source_name)
            if source is not None:
                settings = obs.obs_data_create()
                obs.obs_data_set_string(settings, "text", text)
                obs.obs_source_update(source, settings)
                obs.obs_data_release(settings)  # Release settings after use
                obs.obs_source_release(source)
            else:
                pass
                #print(f"Text source '{source}'  not found!")
        except Exception as e:
            print(f"Error updating text: {e}")


def set_source_scroll_filter(source_name, filter_name, value):
    global teleprompter_speed
    if source_name:
        try:
            source = obs.obs_get_source_by_name(source_name)
            if source:
                # Get filter on the source
                filter = obs.obs_source_get_filter_by_name(source, filter_name)
                if filter:
                    # Filter exists: update its settings
                    filter_settings = obs.obs_source_get_settings(filter)
                    
                    #get current scroll setting
                    teleprompter_speed = obs.obs_data_get_double(filter_settings, "speed_y")

                    # set new value
                    obs.obs_data_set_double(filter_settings, "speed_y", value)
                    
                    obs.obs_source_update(filter, filter_settings)
                    obs.obs_data_release(filter_settings)
                    obs.obs_source_release(filter)
                    obs.obs_source_release(source)
                    
        except Exception as e:
            print(f"Error removing filters: {e}")

        return
    

def set_text_source_font_size(source_name, new_font_size):
    """
    Finds the specified text source and updates its font size.
    """
    # 1. Find the source object by its name
    source = obs.obs_get_source_by_name(source_name)
    
    if source is None:
        return

    # Check if the source is actually a text source (GDI+ or Freetype)
    source_id = obs.obs_source_get_unversioned_id(source)
    if source_id not in ["text_gdiplus", "text_ft2_source"]:
        obs.obs_source_release(source)
        return

    # 2. Get the current settings of the source
    settings = obs.obs_source_get_settings(source)
    
    # 3. Get the nested 'font' settings object
    font_settings = obs.obs_data_get_obj(settings, "font")
    
    if font_settings is None:
        # Clean up references
        obs.obs_data_release(settings)
        obs.obs_source_release(source)
        return

    # 4. Set the new font size using the value from the slider
    obs.obs_data_set_int(font_settings, "size", new_font_size)
    
    # Log the change for confirmation
    current_face = obs.obs_data_get_string(font_settings, "face")

    # 5. Apply the modified settings back to the source
    obs.obs_source_update(source, settings)

    # 6. Clean up references (IMPORTANT: prevents memory leaks)
    obs.obs_data_release(font_settings) 
    obs.obs_data_release(settings)
    obs.obs_source_release(source)


# Hotkey functions
def on_add_tag_hk(pressed):
    # Immediate bail if not pressed
    if not pressed:
        return
    
    # shortcut_name = "Alert"
    shortcut_name = "OBS Python_Keynote Add Tag"
    #shortcut_name = "python dictionary input"

    # get current scene name
    current_scene_name = get_current_scene_name()

    # Define the command and its arguments as a list
    input_data = {"tagType": "scene", 
        "tagEvent": "///", 
        "tagId": current_scene_name, 
        "tagHeight":100,
        "tagWidth":600,
        "tagLeft":800,
        "tagTop":-200}
    
    try:
        json_payload = json.dumps(input_data)
    except Exception as e:
        obs.script_log(obs.LOG_ERROR, f"Failed to serialize dictionary to JSON: {e}")
        return
    
    #    "OBS Python_Keynote Add Tag",
    command = [
        "osascript", 
        "-l", "JavaScript", 
        "-e", osa_add_tag,
        json_payload
        ]
    try:
        # Execute the command and capture the output
        # capture_output=True redirects stdout and stderr to pipes
        # text=True decodes the output as text (UTF-8 by default)
        result = subprocess.run(
            command,
            # input=json_payload, 
            encoding='utf-8',
            capture_output=True, 
            text=True, 
            check=True
            )

    except subprocess.CalledProcessError as e:
        # Handle cases where the `shortcuts` command itself or the shell script inside failed
        print(f"--- Error Executing Shortcut '{shortcut_name}' ---")
        print(f"Command failed with return code {e.returncode}")
        print(f"Stdout: {e.stdout.strip()}")
        print(f"Stderr: {e.stderr.strip()}")
    except FileNotFoundError:
        # Handle case where the 'shortcuts' command is not found (shouldn't happen on modern macOS)
        print("Error: The 'shortcuts' command-line utility was not found. Are you on macOS?")

    # Access the captured standard output
    output = result.stdout


def on_next_slide_hk(pressed):
    if not pressed:
        return
    next_thread = threading.Thread(target=navigate_slides, args=("Next",)) 
    next_thread.start()
    # next_thread.join()
    # navigate_slides("Next")


def on_previous_slide_hk(pressed):
    if not pressed:
        return
    previous_thread = threading.Thread(target=navigate_slides, args=("Previous",)) 
    previous_thread.start()
    # previous_thread.join()
    # navigate_slides("Previous")


def on_start_slideshow_hk(pressed):
    # Immediate bail if not pressed
    if not pressed:
        return
    
    start_thread = threading.Thread(target=navigate_slides, args=("Start",)) 
    start_thread.start()
    # start_thread.join()
    # navigate_slides("Start")


def on_font_decrease_hk(pressed):
    global script_settings

    # Immediate bail if not pressed
    if not pressed:
        return
    
    teleprompter_size = obs.obs_data_get_int(script_settings, "_size") - 1
    obs.obs_data_set_int(script_settings, "_size", teleprompter_size)
    set_text_source_font_size("Slide Notes Text", teleprompter_size)
    

def on_font_increase_hk(pressed):
    # Immediate bail if not pressed
    if not pressed:
        return
    
    teleprompter_size = obs.obs_data_get_int(script_settings, "_size") + 1
    obs.obs_data_set_int(script_settings, "_size", teleprompter_size)
    set_text_source_font_size("Slide Notes Text", teleprompter_size)
    

def on_scroll_increase_hk(pressed):
    # Immediate bail if not pressed
    if not pressed:
        return
    
    teleprompter_speed = obs.obs_data_get_int(script_settings, "_speed") + 1
    obs.obs_data_set_int(script_settings, "_speed", teleprompter_speed)
    set_source_scroll_filter("Slide Notes Text", "Scroll", teleprompter_speed)
        

def on_scroll_decrease_hk(pressed):
    # Immediate bail if not pressed
    if not pressed:
        return
    
    teleprompter_speed = obs.obs_data_get_int(script_settings, "_speed") - 1
    obs.obs_data_set_int(script_settings, "_speed", teleprompter_speed)
    set_source_scroll_filter("Slide Notes Text", "Scroll", teleprompter_speed)


#osascript javascript 
osa_next = '''
function run() {
    //get first keynote presentation
    let keynote = Application("Keynote");
    let presentation = keynote.documents[0];
    let slides = presentation.slides;
    //variables
    let targetSlideNum, targetSlide
    let slideData = {"actionName":"Next_keynote"};
    
    //go to next slide in edit mode
    if(!keynote.playing()){
    //get current slide numnber
        targetSlideNum = presentation.currentSlide().slideNumber()
    //find the next slide's index
        targetSlide = slides.whose({ slideNumber: targetSlideNum  + 1 })
    //check if the next slide exists
        if(!targetSlide[0].exists()){
        //if  next slide doesn't exist get slide 1 index
        targetSlide = slides.whose({ slideNumber: 1 })
        }
    //get slide tags
        let slideTags = targetSlide[0].shapes.whose({objectText: {_contains:"\/\/\/" }})
        let tagsCount = slideTags.length
        for(let i = 0; i < tagsCount; i++){
            //if shape has the special string of characters
                const tag =  slideTags[i].objectText().split("\/\/\/");
                //console.log("tag",tag)
                slideData[tag[0].trim()] = tag[1].trim()
            }

    //get current slide details
        slideData["slideTitle"] = targetSlide[0].defaultTitleItem().objectText();
        slideData["slideNotes"] = targetSlide[0].presenterNotes();
        slideData["slideNum"] = targetSlide[0].slideNumber();
    //update slide position
        presentation.currentSlide = targetSlide[0];
        return JSON.stringify(slideData);
	}	
    
    //get navigation status next, build or end of show
    const status = (Application("System Events").processes["Keynote"].windows["Presenter Display"].splitterGroups[0].splitterGroups[0].uiElements[1].uiElements[0].value()).split(":")[0];
    
    if(status === "Next" || status === "End of Show"){
        if (status === "End of Show"){
            targetSlideNum = 1
        } else {
            targetSlideNum = presentation.currentSlide().slideNumber() + 1 ;
        }

        targetSlide = slides.whose({ slideNumber: targetSlideNum})
        
        //get slide tags
        let slideTags = targetSlide[0].shapes.whose({objectText: {_contains:"\/\/\/" }})
        let tagsCount = slideTags.length
        for(let i = 0; i < tagsCount; i++){
            //if shape has the special string of characters
                let tag =  slideTags[i].objectText().split("\/\/\/");
                //console.log("tag",tag)
                slideData[tag[0].trim()] = tag[1].trim()
            }
                    
        //get current slide details
        slideData["slideTitle"] = targetSlide[0].defaultTitleItem().objectText();
        slideData["slideNotes"] = targetSlide[0].presenterNotes();
        slideData["slideNum"] = targetSlide[0].slideNumber();
        
        //get next slide details
        targetSlide = slides.whose({ slideNumber: targetSlideNum  + 1 })
        //check if the next slide exists
        if(!targetSlide[0].exists()){
            //if  next slide doesn't exist get slide 1 index
            targetSlide = slides.whose({ slideNumber: 1 })
        }
        slideData["nextSlideTitle"] = targetSlide[0].defaultTitleItem().objectText()
        slideData["nextSlideNotes"] = targetSlide[0].presenterNotes();
        slideData["nextSlideNum"] = targetSlide[0].slideNumber();  
    }

    //console.log("new slide data", JSON.stringify(slideData))
    presentation.showNext()
    return JSON.stringify(slideData);
}
'''

osa_previous = '''
function run() {
    //connect to the playing keynote presentation
    let keynote = Application("Keynote");
    let presentation = keynote.documents[0];
    let slides = presentation.slides;

    //variables
    let targetSlideNum, targetSlide

    let slideData = {"actionName":"Previous_keynote"};

    //get slide shape details
    targetSlideNum = presentation.currentSlide().slideNumber();
    
    //find the previous slide's index
    targetSlide = slides.whose({ slideNumber: targetSlideNum  - 1 })
    
    //check if the previous slide exists
    if(!targetSlide[0].exists()){
    //if  previous slide doesn't exist get the last slide
        let numOfSlides = slides().filter(slide => !slide.skipped()).length;
        targetSlide = slides.whose({ slideNumber: numOfSlides })
    }
	
	if(!targetSlide[0].exists()){
		console.log("previous slide not found")
		return
	}

    //get slide tags
    let slideTags = targetSlide[0].shapes.whose({objectText: {_contains:"\/\/\/" }})
	console.log(slideTags.length)
	
    let tagsCount = slideTags.length
    for(let i = 0; i < tagsCount; i++){
        //if shape has the special string of characters
            let tag =  slideTags[i].objectText().split("\/\/\/");
            //console.log("tag",tag)
            slideData[tag[0].trim()] = tag[1].trim()
        }
                
    //get current slide details
    slideData["slideTitle"] = targetSlide[0].defaultTitleItem().objectText();
    slideData["slideNotes"] = targetSlide[0].presenterNotes();
    slideData["slideNum"] = targetSlide[0].slideNumber();

    //get next slide details
    nextSlide = slides.whose({ slideNumber: targetSlideNum })
    //check if the next slide exists
    if(!nextSlide[0].exists()){
        //if  next slide doesn't exist get slide 1 index
        nextSlide = slides.whose({ slideNumber: 1 })
    }
    slideData["nextSlideTitle"] = nextSlide[0].defaultTitleItem().objectText()
    slideData["nextSlideNotes"] = nextSlide[0].presenterNotes();
    slideData["nextSlideNum"] = nextSlide[0].slideNumber(); 
    
    presentation.currentSlide = targetSlide[0];
    return JSON.stringify(slideData);
}
'''

osa_start = '''
function run(input) {
	//connect to the playing keynote presentation
    let keynote = Application("keynote");
	let presentation = keynote.documents[0];
	let targetSlide = presentation.currentSlide();
		
	//start slides 
	if(!keynote.playing()){
		presentation.start()
	}	
	
	//wait for presenter window to open
	let presenterWindow = Application("System Events").processes["Keynote"].windows["Presenter Display"];
	
	do{
		//console.log("waiting for presenter view")
		delay(.1)
	}while(!presenterWindow.exists())
	
	//get current slide details
	const status = (presenterWindow.splitterGroups[0].splitterGroups[0].uiElements[1].uiElements[0].value()).split(":")[0];
	let slideData = {"actionName":"Start_keynote",
		"slideStatus":status}
	slideData["slideTitle"] = targetSlide.defaultTitleItem().objectText();
	slideData["slideNotes"] = targetSlide.presenterNotes();
	slideData["slideNum"] = targetSlide.slideNumber();
	
	//minimize presenter view
	presenterDisplay = keynote.windows["Presenter Display"];
	presenterDisplay.miniaturized = true; 

    delay(.5)
		
	return JSON.stringify(slideData)
}
'''

osa_add_tag = '''
function run(input) {
    // get input object from array
    input = JSON.parse(input[0])
	
	//connect to the playing keynote presentation
    const keynote = Application("keynote");
	const presentation = keynote.documents[0];
	
	//change to edit mode
	if(keynote.playing()){
		presentation.stop()
        keynote.activate()
	    delay(1)
	}	

	//get slide tags
    let slideTags = presentation.currentSlide().shapes.whose({objectText: {_beginsWith: `${input.tagType}${input.tagEvent}`}})
	let tagsCount = slideTags.length
	console.log(slideTags.length)

	//Delete duplicate/previous tag
	for(let i = 0; i < tagsCount; i++){
		slideTags[0].delete()
	}
	
	//Make new tag
	let newShape = new keynote.Shape()
		newShape.objectText = `${input.tagType}${input.tagEvent}${input.tagId}`
		newShape.position = {x:input.tagLeft,y:input.tagTop}
		newShape.width = input.tagWidth
		newShape.height = input.tagHeight		
	
	presentation.currentSlide().shapes.push(newShape)

    //delay(.5)
    
    return JSON.stringify({});	
}
'''