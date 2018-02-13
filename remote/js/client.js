//#region GLOBAL VARS AND CONSTS---------------------------------------------------------------
var ip = document.getElementById("ipBox").value;
var conn = new WebSocket("ws://" + ip);
var currentScene = "connect";
var keys = [
    inputKey('rForward', 'w', (req) => {
        req[net.field.motor] = {};
        req[net.field.motor][net.motor.FRDrive] = speed;
        req[net.field.motor][net.motor.FLDrive] = speed;
        req[net.field.motor][net.motor.BRDrive] = speed;
        req[net.field.motor][net.motor.BLDrive] = speed;
        return req;
    }),
    inputKey('rReverse', 's', (req) => {
        req[net.field.motor] = {};
        req[net.field.motor][net.motor.FRDrive] = -1 * speed;
        req[net.field.motor][net.motor.FLDrive] = -1 * speed;
        req[net.field.motor][net.motor.BRDrive] = -1 * speed;
        req[net.field.motor][net.motor.BLDrive] = -1 * speed;
        return req;
    }),
    inputKey('rRight', 'd', (req) => {
        req[net.field.motor] = {};
        req[net.field.motor][net.motor.FRDrive] = speed / -2;
        req[net.field.motor][net.motor.FLDrive] = speed / 2;
        req[net.field.motor][net.motor.BRDrive] = speed / -2;
        req[net.field.motor][net.motor.BLDrive] = speed / 2;
        return req;
    }),
    inputKey('rLeft', 'a', (req) => {
        req[net.field.motor] = {};
        req[net.field.motor][net.motor.FRDrive] = speed / 2;
        req[net.field.motor][net.motor.FLDrive] = speed / -2;
        req[net.field.motor][net.motor.BRDrive] = speed / 2;
        req[net.field.motor][net.motor.BLDrive] = speed / -2;
        return req;
    }),
    inputKey('speedUp', 'Shift'),
    inputKey('speedDown', 'Control'),
    inputKey('stop', ' '),
    inputKey('aUp', 'q'),
    inputKey('aDown', 'e'),
    inputKey('aForward', 'r'),
    inputKey('aReverse', 'f')
];
const net = { //Protocall used to send / receive info
    field: {
        action: 0,
        motor: 1,
        power: 2
    },
    action: {
        requestAll: 0,
        command: 1,
        update: 2,
        stop: 3,
        error: 4,
        auto: 5
    },
    motor: {
        FRDrive: 0,
        FLDrive: 1,
        BRDrive: 2,
        BLDrive: 3,
        armPiv: 4,
        armAct: 5,
        armBelt: 6
    },
    powerStatus: {
        battery: 0,
        main: 1,
        motor: 2 //object of motors
    }
}
var powerStatus = {};
var motorStatus = {};
var gauges = {};
var speed = 0;
//#endregion
//#region EVENT FUNCTIONS ------------------------------------------------------------
conn.onmessage = function (message){
    data = JSON.parse(message);
    console.log(data);
    switch(data[net.field.action]){
        case net.action.command:
        case net.action.update:
            for(var key in Object.assign(data[net.field.power], data[net.field.power][net.powerStatus.motor])){
                powerStatus[key] = data[net.field.power][key];
            }
            for(var key in data[net.field.motor]){
                motorStatus[key] = data[net.field.motor][key];
            }
            updateGauges();
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
    if(keyPressed != null && currentScene == "control"){
        event.preventDefault();
        keyPressed.down = true;
        console.log(keyPressed['name']);
        req = {};
        req[net.field.action] = net.action.command;
        req = keyPressed.event(req);

    }
});
document.addEventListener('keyup', (event) => {
    const keyReleased = keys.filter((k) => k.key == event.key)[0];
    if(keyReleased != null){
        event.preventDefault();
        keyReleased.down = false;
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
    window.setInterval(loop, 1000/60);
    for(var key in net.powerStatus){
        if(key == 'motor') continue;
        powerStatus[key] = 0;
    }
    for(var key in net.motor){
        motorStatus[key] = 0;
    }
    Object.assign(powerStatus, motorStatus);
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
    for(var key in net.motor){
        document.getElementById("gauges").innerHTML += '<div><canvas id="'+key+'Gauge"></canvas><p id="'+key+'Text">Motor</p></div>'
    }
    temp = {};
    for(var key in powerStatus){
        console.log(key)
        var target = document.getElementById(key + 'Gauge');
        if(key == "battery"){
            opts.percentColors = [[0.0, "#FF0000" ], [1.0, "#00FF00"]];
        } else {
            opts.percentColors = [[0.0, "#00FF00" ], [1.0, "#FF0000"]];
        }
        var gauge = new Gauge(target).setOptions(opts);
        gauge.animationSpeed = 16;
        if(key == "battery"){
            gauge.maxValue = 16;
        } else if(key == "main"){
            gauge.maxValue = 10;
        } else {
            gauge.maxValue = 5;
        }
        gauges[key] = gauge;
    }
    updateGauges();
}
function send(message){
    conn.send(JSON.stringify(message));
}
function connect(){
    ip = document.getElementById("ipBox").value;
    console.log(ip);
    conn = new WebSocket("ws://" + ip);
}
function updateGauges(){
    for(var key in gauges){
        gauges[key].set(powerStatus[key]);
        document.getElementById(key + 'Text').innerText = key + ": " + powerStatus[key] + " amps";
        if(key == 'battery'){
            document.getElementById(key + 'Text').innerText = key + ": " + powerStatus[key] + " volts";
        }
    }
}
function inputKey(name, key, event){
    return {'name': name, 'key': key, 'down': false, 'event': event};
}
function loop(){

}
function setSpeed(value){
    speed = value;
}
//#endregion

start();