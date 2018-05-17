//#region GLOBAL VARS AND CONSTS---------------------------------------------------------------
var ip = document.location.hostname || 'localhost';
const SOCKET_PORT = 4242;
document.getElementById("ipBox").value = ip;
var currentScene = "connect";
var invert = false;
var keys = [
    inputKey('forward', 'w', (req = {}) => {
        move = 'forward';
        if(turn == 'right'){
            req[net.field.motor] = makeMotorRequest(speed - 64, speed);
        }else if(turn == 'left'){
            req[net.field.motor] = makeMotorRequest(speed, speed - 64);
        }else{
            req[net.field.motor] = makeMotorRequest(speed);
        }
        document.getElementById('butReverse').style.backgroundColor = '';
        document.getElementById('butForward').style.backgroundColor = 'gray';
        return req;
    }),
    inputKey('reverse', 's', (req = {}) => {
        move = 'reverse';
        if(turn == 'right'){
            req[net.field.motor] = makeMotorRequest( -1 * (speed - 64), -1 * speed);
        }else if(turn == 'left'){
            req[net.field.motor] = makeMotorRequest(-1 * speed, -1 * (speed - 64));
        }else{
            req[net.field.motor] = makeMotorRequest(-1 * speed);
        }
        document.getElementById('butForward').style.backgroundColor = '';
        document.getElementById('butReverse').style.backgroundColor = 'gray';
        return req;
    }),
    inputKey('right', 'd', (req = {}) => {
        turn = 'right';
        if(move == '' || speed <= 16){
            req[net.field.motor] = makeMotorRequest(-100, 100);
        }else if(move == 'forward'){
            req[net.field.motor] = makeMotorRequest(speed - 64, speed);
        }else{
            req[net.field.motor] = makeMotorRequest(-1 * (speed - 64),-1 * speed);
        }
        document.getElementById('butLeft').style.backgroundColor = '';
        document.getElementById('butRight').style.backgroundColor = 'gray';
        return req;
    }),
    inputKey('left', 'a', (req = {}) => {
        turn = 'left';
        if(move == '' || speed <= 16){
            req[net.field.motor] = makeMotorRequest(100, -100);
        }else if(move == 'forward'){
            req[net.field.motor] = makeMotorRequest(speed, speed - 64);
        }else{
            req[net.field.motor] = makeMotorRequest(-1 * speed, -1 * (speed - 64));
        }
        document.getElementById('butRight').style.backgroundColor = '';
        document.getElementById('butLeft').style.backgroundColor = 'gray';
        return req;
    }),
    inputKey('speedUp', 'Shift', (req = {}) => {
        speed = Math.min(speed + 64, 255);
        return setSpeed(speed, req)
    }),
    inputKey('speedDown', 'Control', (req = {}) => {
        speed = Math.max(speed - 64, 0);
        return setSpeed(speed, req)
    }),
    inputKey('stop', ' ', (req = {}) => {
        move = '';
        turn = '';
        req[net.field.motor] = makeMotorRequest(0);
        req[net.field.motor][net.motor.actElbow] = 0;
        req[net.field.motor][net.motor.actWrist] = 0;
        buttonClick();
        return req;
    }),
    inputKey('wristUp', 'q', (req = {}) => {
        document.getElementById('butWDown').style.backgroundColor = '';
        document.getElementById('butWUp').style.backgroundColor = 'gray';
        req[net.field.motor] = {}
        req[net.field.motor][net.motor.actWrist] = 127;
        return req;
    }),
    inputKey('wristDown', 'e', (req = {}) => {
        document.getElementById('butWDown').style.backgroundColor = 'gray';
        document.getElementById('butWUp').style.backgroundColor = '';
        req[net.field.motor] = {}
        req[net.field.motor][net.motor.actWrist] = -127;
        return req;
    }),
    inputKey('elbowUp', 'r', (req = {}) => {
        document.getElementById('butEDown').style.backgroundColor = '';
        document.getElementById('butEUp').style.backgroundColor = 'gray';
        req[net.field.motor] = {}
        req[net.field.motor][net.motor.actElbow] = 127;
        return req;
    }),
    inputKey('elbowDown', 'f', (req = {}) => {
        document.getElementById('butEDown').style.backgroundColor = 'gray';
        document.getElementById('butEUp').style.backgroundColor = '';
        req[net.field.motor] = {}
        req[net.field.motor][net.motor.actElbow] = -127;
        return req;
    }),
    inputKey('lockDrive', '2', (req = {}) => {
        lockDrive = true;
        return req;
    }),
    inputKey('lockArm', '1', (req = {}) => {
        lockArm = true;
        return req;
    }),
    inputKey('invert', '0', (req = {}) => {
        invert = true;
        return req;
    }),
];
const net = { //Protocall used to send / receive info
    field: {
        action: "0",
        motor: "1",
        power: "2"
    },
    action: {
        requestAll: "0",
        command: "1",
        stop: "2",
        error: "3",
        auto: "4"
    },
    motor: {
        driveR: "0",
        driveL: "1",
        actWrist: "2",
        actElbow: "3",
    },
    power: {
        battery: "0",
        main: "1",
        motor: "2"
    }
}
const THRESHOLD_MOUSE3D = .2
var power = {};
var motorStatus = {};
var gauges = {};
var buttons = [];
var speed = 0;
var gamepadLoopRunning = false;
//Remember what command the robot is being given
var move = '';
var turn = '';
var lockArm = false;
var lockDrive = false;
var gamepadInUse = null;
var timer = 0;
var state3dMouse = {
	buttons: {
		0: false,
		1: false,
	},
	axes: {
		0:0,
		1:0,
		2:0,
		3:0,
		4:0,
		5:0,
	}
}
buttonMap3dMouse = {
	axes: {
		right: 0,
		backward: 1,
		down: 2,
		pitch: 3, //up(pull) +, down(push) -
		roll: 4, //clockwise +, counter -
		yaw: 5, //clockwise +, counter -
	},
	buttons: {
		left: 0,
		right: 1,
	}
}
//#endregion
//#region EVENT FUNCTIONS ------------------------------------------------------------

document.addEventListener('keydown', (event) => {
    var keyPressed = keys.filter((k) => k.key == event.key)[0];
    if(keyPressed != null && currentScene == "control" && keyPressed.down == false){
        event.preventDefault();
        keyPressed.down = true;
        console.log(keyPressed['name']);
        req = keyPressed.event(req);
        if(req[net.field.motor] != null) {
            req[net.field.action] = net.action.command;
            send(req);
        }
    }
});
document.addEventListener('keyup', (event) => {
    const keyReleased = keys.filter((k) => k.key == event.key)[0];
    if(keyReleased != null && keyReleased.down == true){
        event.preventDefault();
        keyReleased.down = false;
        req = {};
        req[net.field.action] = net.action.command;
        if(keyReleased.name == 'right' || keyReleased.name == 'left'){
            turn = '';
            if(move != ''){
                req = keys.filter(x => x.name == move)[0].event(req);
            } else {
                req[net.field.motor] = makeMotorRequest(0);
            }
        }else if(keyReleased.name == 'forward' || keyReleased.name == 'reverse'){
            move = '';
            if(turn != ''){
                req = keys.filter(x => x.name == turn)[0].event(req);
            } else {
                req[net.field.motor] = makeMotorRequest(0);
            }
        }else if(keyReleased.name == 'lockArm'){
            lockArm = false;
        }else if(keyReleased.name == 'lockDrive'){
            lockDrive = false;
        }else if(keyReleased.name == 'wristUp' || keyReleased.name == 'wristDown'){
            req[net.field.motor][net.motor.actWrist] = 0;
            if(keyReleased.name == 'wristDown'){
                document.getElementById('butWDown').style.backgroundColor = '';
            }else{
                document.getElementById('butWUp').style.backgroundColor = '';
            }
        }else if(keyReleased.name == 'elbowUp' || keyReleased.name == 'elbowDown'){
            req[net.field.motor][net.motor.actElbow] = 0;
            if(keyReleased.name == 'elbowDown'){
                document.getElementById('butEDown').style.backgroundColor = '';
            }else{
                document.getElementById('butEUp').style.backgroundColor = '';
            }
        }else if(keyReleased.name == 'invert'){
            invert = false;
        }else{
            return;
        }
        send(req);
    }
});
window.addEventListener("gamepadconnected", function(e) {
    console.log("Gamepad connected");
    startGamepadLoop();
});
//#endregion
//#region FUNCTIONS -----------------------------------------------------------------
function changeScene(scene){
    currentScene = scene;
    document.getElementById("connect").hidden = !(scene == "connect");
    document.getElementById("control").hidden = !(scene == "control");
}
function start(){
    connect();
    for(var key in Object.values(net.power)){
        if(key == net.power.motor) {
            power[key] = {};
        }else{
            power[key] = 0;
        }
    }
    buttons = [
        {
            button: document.getElementById('butStop'),
            evt: (req = {}) => {
                req[net.field.motor] = makeMotorRequest(0);
                document.getElementById('butStop').style.backgroundColor = '';
                return req;
            }
        },
        {
            button: document.getElementById('butForward'),
            evt: (req = {}) => {
                req[net.field.motor] = makeMotorRequest(document.getElementById('comSpeed').value);
                return req;
            }
        },
        {
            button: document.getElementById('butReverse'),
            evt: (req = {}) => {
                req[net.field.motor] = makeMotorRequest(document.getElementById('comSpeed').value * -1);
                return req;
            }
        },
        {
            button: document.getElementById('butRight'),
            evt: (req = {}) => {
                req[net.field.motor] = makeMotorRequest(-127,127);
                return req;
            }
        },
        {
            button: document.getElementById('butLeft'),
            evt: (req = {}) => {
                req[net.field.motor] = makeMotorRequest(127,-127);
                return req;
            }
        },
        {
            button: document.getElementById('butEUp'),
            evt: (req = {}) => {
                req[net.field.motor] = {};
                req[net.field.motor][net.motor.actElbow] = 127;
                return req;
            }
        },
        {
            button: document.getElementById('butEDown'),
            evt: (req = {}) => {
                req[net.field.motor] = {};
                req[net.field.motor][net.motor.actElbow] = -127;
                return req;
            }
        },
        {
            button: document.getElementById('butWUp'),
            evt: (req = {}) => {
                req[net.field.motor] = {};
                req[net.field.motor][net.motor.actWrist] = 127;
                return req;
            }
        },
        {
            button: document.getElementById('butWDown'),
            evt: (req = {}) => {
                req[net.field.motor] = {};
                req[net.field.motor][net.motor.actWrist] = -127;
                return req;
            }
        },
    ];
    for(var key in Object.values(net.motor)){
        motorStatus[key] = 0;
        power[net.power.motor][key] = 0;
    }
    //Base Gauge options
    var opts = {
        angle: 0.0, // The span of the gauge arc
        lineWidth: 0.3, // The line thickness
        radiusScale: 1, // Relative radius
        pointer: {
          length: 0.6, // // Relative to gauge radius
          strokeWidth: 0.050, // The thickness
          color: '#000000' // Fill color
        },
        limitMax: false,     // If false, max value increases automatically if value > maxValue
        limitMin: true,     // If true, the min value of the gauge will be fixed
        percentColors: [[0.0, "#FF0000" ], [1.0, "#00FF00"]],
        strokeColor: '#E0E0E0',  // to see which ones work best for you
        generateGradient: true,
        highDpiSupport: true,     // High resolution support
    };
    //Create motor amp gauges in html
    /*for(var key in net.motor){
        document.getElementById("gauges").innerHTML += '<div><canvas id="'+key+'Gauge"></canvas><p id="'+key+'Text">Motor</p></div>'
    }
    temp = {};
    //Config motor gaguges and put them in gauges object
    for(var key in net.power){
        if(key == 'motor') continue;
        var target = document.getElementById(key + 'Gauge');
        if(key == "battery"){
            opts.percentColors = [[0.0, "#FF0000" ], [1.0, "#00FF00"]];
        }else{
            opts.percentColors = [[0.0, "#00FF00" ], [1.0, "#FF0000"]];
        }
        var gauge = new Gauge(target).setOptions(opts);
        gauge.animationSpeed = 16;
        if(key == "battery"){
            gauge.maxValue = 16;
        } else if(key == "main"){
            gauge.maxValue = 10;
        }
        gauges[key] = gauge;
    }
    for(var key in net.motor){
        var target = document.getElementById(key + 'Gauge');
        opts.percentColors = [[0.0, "#00FF00" ], [1.0, "#FF0000"]];
        var gauge = new Gauge(target).setOptions(opts);
        gauge.maxValue = 5;
        gauges[key] = gauge;
    }
    updateGauges();
    */
    if(!conn){
        changeScene('connect');
    }
}
function send(data){
    message = JSON.stringify(data)
    console.log("Sending: " + message);
    try{
        conn.send(message);
    }catch(e){
        console.log(e);
    }
}
function connect(){
    ip = document.getElementById("ipBox").value;
    console.log(ip);
    conn = new WebSocket("ws://" + ip + ':' + SOCKET_PORT);
    conn.onmessage = function (message){
        console.log("REC: " + message.data);
        data = JSON.parse(message.data);
        if(data){
            switch(data[net.field.action]){ 
                case net.action.command:
                    if(data[net.field.power]){
                        for(var key in data[net.field.power]){
                            power[key] = data[net.field.power][key];
                        }
                        if(data[net.field.power][net.power.motor]){
                            for(var key in data[net.field.power][net.power.motor]){
                                power[net.field.power][net.power.motor][key] = data[net.field.power][net.power.motor][key];
                            }
                        }
                        updateGauges();
                    }
                    if(data[net.field.motor]){
                        for(var key in data[net.field.motor]){
                            motorStatus[key] = data[net.field.motor][key];
                        }
                    }
                break;
            }
        }
    }
    conn.onopen = function (){
        changeScene("control");
        req = {}
        req[net.field.action] = net.action.requestAll;
        send(req);
    }
    conn.onclose = function (){
        changeScene("connect")
    }
}
function updateGauges(){
    /*for(var key in net.power){
        if(key == 'motor') continue;
        gauges[key].set(power[net.power[key]]);
        document.getElementById(key + 'Text').innerText = key + ": " + power[net.power[key]] + " amps";
        if(key == 'battery'){
            document.getElementById(key + 'Text').innerText = key + ": " + power[net.power[key]] + " volts";
        }
    }*/
    /*
    for(var key in net.motor){
        gauges[key].set(power[net.power.motor][net.motor[key]]);
        document.getElementById(key + 'Text').innerText = key + ": " + power[net.power.motor][net.motor[key]] + " amps";
    }*/
}
function inputKey(name, key, event){
    return {'name': name, 'key': key, 'down': false, 'event': event};
}
function setSpeed(value, req={}){
    speed = value;
    document.getElementById('comSpeed').value = value;
    if(turn != ''){
        return keys.filter(x => x.name == turn)[0].event(req);
    }else if(move != ''){
        return keys.filter(x => x.name == move)[0].event(req);
    }
    return req;
}
function makeMotorRequest(right, left = null, reqObj = {}){
    if(left == null){
        left = right
    }
    reqObj[net.motor.driveR] = Math.min(127, Math.max(-127, right));
    reqObj[net.motor.driveL] = Math.min(127, Math.max(-127, left));
    return reqObj;
}
function startGamepadLoop(){
    if(!gamepadLoopRunning){
        gamepadLoopRunning = true;
        gamepadLoop();
    } 
}
function gamepadLoop(){
    let gamepads = navigator.getGamepads(); //navigator.getGamepads ? : navigator.webkitGetGamepads;
    if(gamepadInUse == null){
        for(let g = 0; g < gamepads.length; ++g){
            if(gamepads[g] != null){
                for(let i = 0; i < gamepads[g].axes.length; ++i){
                    if(gamepads[g].axes[i] != 0){
                        gamepadInUse = g;
                        break;
                    }
                }
            }
        }
        if(gamepadLoopRunning) requestAnimationFrame(gamepadLoop);
        return;
    }
    let date = new Date();
    if(date.getTime() - timer < 250){
        if(gamepadLoopRunning) requestAnimationFrame(gamepadLoop);
        return;
    }
    timer = date.getTime();
    if(gamepads[gamepadInUse] != null && gamepads[gamepadInUse].id.indexOf("SpaceNavigator") != -1){
        let command = {};
        for(let i = 0; i < 8; ++i){
            if(state3dMouse.axes[i] > gamepads[gamepadInUse].axes[i] + THRESHOLD_MOUSE3D || state3dMouse.axes[i] < gamepads[gamepadInUse].axes[i] - THRESHOLD_MOUSE3D){
                console.log(i + ' : ' + state3dMouse.axes[i] + " : " + gamepads[gamepadInUse].axes[i]);
                state3dMouse.axes[i] = gamepads[gamepadInUse].axes[i];
                if(state3dMouse.axes[i] <= THRESHOLD_MOUSE3D && state3dMouse.axes[i] >= -1 * THRESHOLD_MOUSE3D){
                    state3dMouse.axes[i] = 0;
                } else if(state3dMouse.axes[i] >= 1 - THRESHOLD_MOUSE3D || state3dMouse.axes[i] <= -1 + THRESHOLD_MOUSE3D){
                    state3dMouse.axes[i] = state3dMouse.axes[i] / Math.abs(state3dMouse.axes[i]);
                }
                switch(i){
                    case buttonMap3dMouse.axes.backward: //TODO incase of turn
                        if(!lockDrive){
                            if(state3dMouse.axes[buttonMap3dMouse.axes.yaw] != 0 && state3dMouse.axes[buttonMap3dMouse.axes.yaw] != undefined){
                                command[net.motor.driveR] = Math.min(Math.max(state3dMouse.axes[buttonMap3dMouse.axes.backward] * (invert ? -1 : 1) * -127 - state3dMouse.axes[i] * 127, -127), 127) ;
                                command[net.motor.driveL] = Math.min(Math.max(state3dMouse.axes[buttonMap3dMouse.axes.backward] * (invert ? -1 : 1) * -127 + state3dMouse.axes[i] * 127, -127), 127);
                            }else{
                                command[net.motor.driveR] = state3dMouse.axes[i] * -127 * (invert ? -1 : 1);
                                command[net.motor.driveL] = state3dMouse.axes[i] * -127 * (invert ? -1 : 1);
                            }
                            document.getElementById('comSpeed').value = Math.abs(state3dMouse.axes[i] * 127);
                            document.getElementById('butForward').style.backgroundColor = '';
                            document.getElementById('butReverse').style.backgroundColor = '';
                            if(state3dMouse.axes[i] < 0){
                                document.getElementById('butForward').style.backgroundColor = 'gray';
                            } else if(state3dMouse.axes[i] > 0){
                                document.getElementById('butReverse').style.backgroundColor = 'gray';
                            }
                        }
                    break;
                    case buttonMap3dMouse.axes.right:
                        continue;
                    break;
                    case buttonMap3dMouse.axes.down:
                        if(!lockArm){
                            command[net.motor.actElbow] = state3dMouse.axes[i] * -127;
                            document.getElementById('butEUp').style.backgroundColor = '';
                            document.getElementById('butEDown').style.backgroundColor = '';
                            if(state3dMouse.axes[i] < 0){
                                document.getElementById('butEUp').style.backgroundColor = 'gray';
                            }else if(state3dMouse.axes[i] > 0){
                                document.getElementById('butEDown').style.backgroundColor = 'gray';
                            }
                        }
                    break;
                    case buttonMap3dMouse.axes.pitch:
                        if(!lockArm){
                            command[net.motor.actWrist] = state3dMouse.axes[i] * 127;
                            document.getElementById('butWUp').style.backgroundColor = '';
                            document.getElementById('butWDown').style.backgroundColor = '';
                            if(state3dMouse.axes[i] > 0){
                                document.getElementById('butWUp').style.backgroundColor = 'gray';
                            }else if(state3dMouse.axes[i] < 0){
                                document.getElementById('butWDown').style.backgroundColor = 'gray';
                            }
                        }
                    break;
                    case buttonMap3dMouse.axes.roll:
                        continue;
                    break;
                    case buttonMap3dMouse.axes.yaw:
                        if(!lockDrive){
                            if(state3dMouse.axes[buttonMap3dMouse.axes.backward] != 0){
                                command[net.motor.driveR] = Math.min(Math.max(state3dMouse.axes[buttonMap3dMouse.axes.backward] * -127 * (invert ? -1 : 1) - state3dMouse.axes[i] * 127, -127), 127);
                                command[net.motor.driveL] = Math.min(Math.max(state3dMouse.axes[buttonMap3dMouse.axes.backward] * -127 * (invert ? -1 : 1) + state3dMouse.axes[i] * 127, -127), 127);
                            }else{
                                command[net.motor.driveR] = state3dMouse.axes[i] * -127
                                command[net.motor.driveL] = state3dMouse.axes[i] * 127
                            }
                            document.getElementById('butRight').style.backgroundColor = '';
                            document.getElementById('butLeft').style.backgroundColor = '';
                            if(state3dMouse.axes[i] < 0){
                                document.getElementById('butLeft').style.backgroundColor = 'gray';
                            } else if(state3dMouse.axes[i] > 0){
                                document.getElementById('butRight').style.backgroundColor = 'gray';
                            }
                        }
                    break;
                }
                if(Object.keys(command).length > 0){
                    let req = {};
                    req[net.field.action] = net.action.command;
                    req[net.field.motor] = command;
                    send(req);
                }
            }
        }
        for(let i = 0; i < 2; ++i){
            if(state3dMouse.buttons[i] != gamepads[gamepadInUse].buttons[i].pressed){
                state3dMouse.buttons[i] = gamepads[gamepadInUse].buttons[i].pressed;
                console.log(Object.keys(buttonMap3dMouse.buttons)[i] + ": " + state3dMouse.buttons[i]);
            }
        }
    }
    if(gamepadLoopRunning) requestAnimationFrame(gamepadLoop);
    return;
}
function buttonClick(button){
    for(let i = 0; i < buttons.length; ++i){
        buttons[i].button.style.backgroundColor = '';
        if(buttons[i].button == button){
            req = {}
            req[net.field.action] = net.action.command;
            buttons[i].button.style.backgroundColor = 'gray';
            send(buttons[i].evt(req));
        }
    }
}
//#endregion
start();