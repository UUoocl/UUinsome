# UUinsome 
This repo contains scripts to connect Open Broadcast Studio (OBS) and PowerPoint on Windows and Mac.

Features:

  - Change OBS Scenes with PowerPoint slide tags.
  - Scrolling slide notes  
  
# Table of Content
- [Prerequisite](#prerequisite)
- [Getting Started on Windows](#getting-started-on-windows)
  - [Overview](#overview)
  - [Setup PowerPoint](#setup-powerpoint)
  - [Setup OBS](#setup-obs)
  - [Using UUinsome](#using-uuinsome)
- [Getting Started on MacOS](#getting-started-on-macos)
  - [Overview](#overview-1)

## Prerequisite
- [Open Broadcast Studio (obs)](https://obsproject.com/)
- Windows
  - PowerPoint
- MacOS
  - Safari
  - Shortcuts
  - Keynote 

## Getting Started on Windows
### Overview


```mermaid
sequenceDiagram
Participant OBS
Participant PP as PowerPoint +<br/> Script Lab
    OBS->>OBS: Start WebSocket server 
    PP ->>+OBS: Connect to OBS 
    OBS->>-PP: Scene and Camera <br/>tag options
    PP->>PP: Add tags
    PP->>PP: Navigate Presentation<br/>Next / Previous
    PP ->>+OBS: Tags and Slide Notes
    OBS->>OBS: Change Scene /<BR/> Display Notes

```

### Setup PowerPoint
#### Install the PowerPoint add-in Script Lab
Script Lab is a free PowerPoint add-in by Microsoft. 

In PowerPoint click "Add-Ins" and ssearch for Script Lab. 

![{E6C4FC54-03ED-44E4-8DD0-6271F9537012}](https://github.com/user-attachments/assets/6d8b2dd3-18cd-41f8-ba8f-acbef5342282)

#### Import UUinsome Script Lab script
Copy the UUinsome script from this repo [UUinsome Script Lab](https://github.com/UUoocl/UUinsome/blob/main/ScriptLab/UUinsome.txt)

In PowerPoint use the "Script Lab" tab to open the code editor. 
CLick Import and paste the UUinsome script into the text editor. 

![{70384F63-91D7-4FD2-8B6C-EB88058E412F}](https://github.com/user-attachments/assets/5dd86b41-9c44-4d32-a9a9-d7cfaaff8af4)

Click the Run button to start the UUinsome script

### Setup OBS
 - Import the [UUinsome Windows Collection](https://github.com/UUoocl/UUinsome/blob/main/UUinsome_OBS_Collections/UUinsome_Windows_Collection.json)

#### Start the OBS Web Socket Server. 
In the OBS Tools menu, click "WebSocket Server Settings"
 - Check "Enable WebSocket server"
 - Click "Show Connect Info", and copy the password.

#### Connect PowerPoint to OBS

In PowerPoint enter the OBS WenSocklet Server password into the UUinsome window.  

### Using UUinsome

## Getting Started on MacOS

### Overview

> [!NOTE]
> In MacOS Script Lab doesn't support WebSockets. The Safari Browser and Shortcuts app is used instead of Script Lab. 
> 

```mermaid
sequenceDiagram
Participant OBS
Participant S as Safari
Participant SC as Shortcuts for <br/>Mac
Participant PP as PowerPoint / <br/> Keynote
  OBS->>OBS: Start WebSocket server 
  S ->>+OBS: Connect to OBS 
  OBS->>-S: Scene and Camera <br/>tag options
  S->>SC: Add tags
  SC->>PP: Add tags
  S->>+SC: Navigate Presentation<br/>Next / Previous
  SC->>+PP: Navigate Presentation<br/>Next / Previous
  PP->>-SC: Tags and Slide Notes
  SC->>-S: Tags and Slide Notes
  S ->>OBS: Tags and Slide Notes
  OBS->>OBS:  Change Scene /<BR/> Display Notes

```
