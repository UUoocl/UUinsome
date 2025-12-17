/*
 * Gamepad API Test
 * Written in 2013 by Ted Mielczarek <ted@mielczarek.org>
 *
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 *
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */
let haveEvents = "GamepadEvent" in window;
let controllers = {};
let rAF = window.requestAnimationFrame;
let previous = [];
function connecthandler(e) {
    addgamepad(e.gamepad);
}

function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
  let d = document.createElement("div");
  d.setAttribute("id", "controller" + gamepad.index);
  let t = document.createElement("h4");
  t.appendChild(document.createTextNode(`gamepad-${gamepad.index}:  `+ gamepad.id));
  d.appendChild(t);
  let b = document.createElement("div");
  b.className = "buttons";
  let arrayIndex = -1;
  for (let i = 0; i < gamepad.buttons.length; i++) {
    let e = document.createElement("span");
    e.className = "button";
    //e.id = "b" + i;
    arrayIndex = arrayIndex + 1;
    e.innerHTML = i;
    b.appendChild(e);
  }
  d.appendChild(b);
  let a = document.createElement("div");
  a.className = "buttons";
  for (i = 0; i < gamepad.axes.length; i++) {
    arrayIndex = arrayIndex + 1;
    e = document.createElement("div");
    e.className = "axis";
    //e.id = "a" + i;
    e.setAttribute("min", "-1");
    e.setAttribute("max", "1");
    e.setAttribute("value", "0");
    e.innerHTML = arrayIndex;
    e.setAttribute("arrayIndex", arrayIndex)
    a.appendChild(e);

  }
  d.appendChild(a);
  document.getElementById("startGP").style.display = "none";
  document.getElementById("gpData").appendChild(d);
  rAF(updateStatus);
}

function disconnecthandler(e) {
  removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
  let d = document.getElementById("controller" + gamepad.index);
  document.body.removeChild(d);
  delete controllers[gamepad.index];
}

function updateStatus() {
  scangamepads();
  for (j in controllers) {
    let controller = controllers[j];
    let d = document.getElementById("controller" + j);
    let buttons = d.getElementsByClassName("button");
    let sum = 0;
    let current = ``;
    for (let i = 0; i < controller.buttons.length; i++) {
      let b = buttons[i];
      let val = controller.buttons[i];
      let pressed = val == 1.0;
      let touched = false;
      if (typeof val == "object") {
        pressed = val.pressed;
        if ("touched" in val) {
          touched = val.touched;
        }

        //sum += val.value;
        val = val.value;
      }
      current += `${val}, `
      let pct = Math.round(val * 100) + "%";
      b.style.backgroundSize = pct + " " + pct;
      b.className = "button";
      if (pressed) {
        b.className += " pressed";
      }
      if (touched) {
        b.className += " touched";
      }
    }
    
    let axes = d.getElementsByClassName("axis");
    for (let i = 0; i < controller.axes.length; i++) {
      let a = axes[i];
      //a.getAttribute('arrayIndex')
      a.innerHTML = i + ": " + controller.axes[i].toFixed(4);
      a.setAttribute("value", controller.axes[i]);
      //sum += Math.abs(controller.axes[i]);
      //ignore control drift. 
      if(Math.abs(controller.axes[i]) > 0.5){
      current += `${controller.axes[i]}, `
      }else{current += '0, '
      }
    }
    //if sum is > 0 a button is pressed or stick moved
    //if the a button is pressed
    if (previous[j] !== current) {
      //console.log(controller.id, current)
      //console.log(sum)
      previous[j]
       = current;
       controller.message = "adv scene switcher route"
       messageData = JSON.stringify(controller)l
       console.log({"id": controller.id, "index": controller.index, "data":current, "timestamp":controller.timestamp})
      //  console.log(controller)
      //https://github.com/svidgen/www.thepointless.com/blob/main/src/routes/experimental/raw-gamepad-api/index.js
      //stringify the gamepad event 
    //   const gamepadEvent = JSON.stringify(
    //     navigator.getGamepads()
    //     .filter(p => p)
    //     .filter(p => p.index == j)
    //     .map(pad => ({
    //         index: pad.index,
    //         id: pad.id,
    //         mapping: pad.mapping,
    //         axes: pad.axes,
    //         buttons: [...pad.buttons].map(b => ({
    //             pressed: b.pressed,
    //             touched: b.touched,
    //             value: b.value
    //         })),
    //         vibrationActuator: pad.vibrationActuator
    //     }))[0],
    //     null,
    //     2
    // )

    //send results to OBS Browser Source
    //console.log(sum, gamepadEvent)
      obsWss.call("CallVendorRequest", {
        vendorName: "obs-browser",
        requestType: "emit_event",
        requestData: {
          event_name: `gamepad-message`,
          event_data: { messageData },
        },
      });
      
      // send results to Advanced Scene Switcher
      obsWss.call("CallVendorRequest", {
        vendorName: "AdvancedSceneSwitcher",
        requestType: "AdvancedSceneSwitcherMessage",
        requestData: {
          message: messageData,
        },
      });
    }
  }
  rAF(updateStatus);
}

function scangamepads() {
  let gamepads = navigator.getGamepads();
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i] && gamepads[i].index in controllers) {
      controllers[gamepads[i].index] = gamepads[i];
    }
  }
}

if (haveEvents) {
  window.addEventListener("gamepadconnected", connecthandler);
  window.addEventListener("gamepaddisconnected", disconnecthandler);
} else {
  setInterval(scangamepads, 500);
}