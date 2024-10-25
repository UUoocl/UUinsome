# UUinsome 
This repo contains scripts to connect Open Broadcast Studio (OBS) and PowerPoint on Windows and Mac.

Features:

  - Change OBS Scenes with PowerPoint slide tags.
  - Scrolling slide notes  

## prerequisite
- [Open Broadcast Studio (obs)](https://obsproject.com/)
- PowerPoint for Windows or MacOS
- Keynote 

## Getting Started on Windows.

### Setup PowerPoint
#### Install the PowerPoint add-in Script Lab
Script Lab is a free PowerPoint add-in by Microsoft. 
In PowerPoint click Add-In and ssearch for Script Lab. 
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
