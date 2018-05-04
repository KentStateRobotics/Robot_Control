//#region GLOBAL VARS AND CONSTS---------------------------------------------------------------
var ip = document.location.hostname;
const SOCKET_PORT = 4242;
var conn = new WebSocket("ws://" + document.location.hostname + ':' + SOCKET_PORT);
document.getElementById("ipBox").value = ip;
var currentScene = "connect";
var keys = [
    inputKey('forward', 'w', (req = {}) => {
        move = 'forward';
        turn = ''
        req[net.field.motor] = makeMotorRequest(speed);
        return req;
    }),
    inputKey('reverse', 's', (req = {}) => {
        move = 'reverse';
        turn = ''
        req[net.field.motor] = makeMotorRequest(-1 * speed);
        return req;
    }),
    inputKey('right', 'd', (req = {}) => {
        turn = 'right';
        if(move == '' || speed <= 16){
            req[net.field.motor] = makeMotorRequest(-16, 16);
        }else if(move == 'forward'){
            req[net.field.motor] = makeMotorRequest(speed - 32, speed);
        }else{
            req[net.field.motor] = makeMotorRequest(speed + 32, speed);
        }
        return req;
    }),
    inputKey('left', 'a', (req = {}) => {
        turn = 'left';
        if(move == '' || speed <= 16){
            req[net.field.motor] = makeMotorRequest(16, -16);
        }else if(move == 'forward'){
            req[net.field.motor] = makeMotorRequest(speed, speed - 32);
        }else{
            req[net.field.motor] = makeMotorRequest(speed, speed + 32);
        }
        return req;
    }),
    inputKey('speedUp', 'Shift', (req = {}) => {
        speed = Math.min(speed + 16, 255);
        return setSpeed(speed, req)
    }),
    inputKey('speedDown', 'Control', (req = {}) => {
        speed = Math.max(speed - 16, 0);
        return setSpeed(speed, req)
    }),
    inputKey('stop', ' ', (req = {}) => {
        move = '';
        turn = '';
        req[net.field.motor] = makeMotorRequest(0);
        return req;
    }),
    inputKey('aUp', 'q', (req = {}) => {}),
    inputKey('aDown', 'e', (req = {}) => {}),
    inputKey('aForward', 'r', (req = {}) => {}),
    inputKey('aReverse', 'f', (req = {}) => {})
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
        actPitch: "2",
        actLower: "3",
        belt: "4"
    },
    power: {
        battery: "0",
        main: "1",
        motor: "2"
    }
}
var power = {};
var motorStatus = {};
var gauges = {};
var speed = 0;
//Remember what command the robot is being given
var move = '';
var turn = '';
//#endregion
//#region EVENT FUNCTIONS ------------------------------------------------------------
conn.onmessage = function (message){
    console.log("REC: " + message.data);
    data = JSON.parse(message.data);
    switch(data[net.field.action]){
        case net.action.command:
            if(data[net.field.power]){
                for(var key in data[net.field.power]){
                    power[key] = data[net.field.power][key];
                    console.log(power);
                }
                if(data[net.field.power][net.power.motor]){
                    for(var key in data[net.field.power][net.power.motor]){
                        power[net.field.power][net.power.motor][key] = data[net.field.power][net.power.motor][key];
                        console.log(power);
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
conn.onopen = function (){
    changeScene("control");
    req = {}
    req[net.field.action] = net.action.requestAll;
    send(req);
}
conn.onclose = function (){
    changeScene("connect")
}
document.addEventListener('keydown', (event) => {
    var keyPressed = keys.filter((k) => k.key == event.key)[0];
    if(keyPressed != null && currentScene == "control" && keyPressed.down == false){
        event.preventDefault();
        keyPressed.down = true;
        console.log(keyPressed['name']);
        req = {};
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
        }
        if(keyReleased.name == 'forward' || keyReleased.name == 'reverse'){
            move = '';
            if(turn != ''){
                req = keys.filter(x => x.name == turn)[0].event(req);
            } else {
                req[net.field.motor] = makeMotorRequest(0);
            }
        }
        if(req[net.field.motor] != null) send(req);
    }
});
//#endregion
//#region FUNCTIONS -----------------------------------------------------------------
function changeScene(scene){
    currentScene = scene;
    document.getElementById("connect").hidden = !(scene == "connect");
    document.getElementById("control").hidden = !(scene == "control");
}
function start(){
    for(var key in Object.values(net.power)){
        console.log(key);
        if(key == net.power.motor) {
            power[key] = {};
        }else{
            power[key] = 0;
        }
    }
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
    for(var key in net.motor){
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
}
function send(data){
    message = JSON.stringify(data)
    console.log("Sending: " + message);
    conn.send(message);
}
function connect(){
    ip = document.getElementById("ipBox").value;
    console.log(ip);
    conn = new WebSocket("ws://" + ip + ':' + SOCKET_PORT);
}
function updateGauges(){
    for(var key in net.power){
        if(key == 'motor') continue;
        gauges[key].set(power[net.power[key]]);
        document.getElementById(key + 'Text').innerText = key + ": " + power[net.power[key]] + " amps";
        if(key == 'battery'){
            document.getElementById(key + 'Text').innerText = key + ": " + power[net.power[key]] + " volts";
        }
    }
    for(var key in net.motor){
        gauges[key].set(power[net.power.motor][net.motor[key]]);
        document.getElementById(key + 'Text').innerText = key + ": " + power[net.power.motor][net.motor[key]] + " amps";
    }
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
    reqObj[net.motor.driveR] = right;
    reqObj[net.motor.driveL] = left;
    return reqObj;
}
//#endregion
start();