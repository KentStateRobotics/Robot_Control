//#region GLOBAL VARS AND CONSTS---------------------------------------------------------------
var ip = document.getElementById("ipBox").value;
var conn = new WebSocket("ws://" + ip);
var currentScene = "connect";
var keys = [];
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
//#endregion
//#region CLASSES -------------------------------------------------------------------
class inputKey{
    constructor(name, key){
        this.name = name;
        this.key = key;
        this.down = false;
    }
}
//#endregion
//#region CONN FUNCTIONS ------------------------------------------------------------
conn.onmessage = function (message){
    data = JSON.parse(message);
    data.forEach(function(element) {
        console.log(element);
    });
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
//#endregion
//#region FUNCTIONS -----------------------------------------------------------------
function changeScene(scene){
    currentScene = scene;
    document.getElementById("connect").hidden = !(scene == "connect");
    document.getElementById("control").hidden = !(scene == "control");
}
function start(){
    document.addEventListener('keydown', (event) => {
        const keyPressed = keys.filter((k) => k.key == event.key);
        if(keyPressed != null && currentScene == "control"){
            console.log(keyPressed);
            keyPressed.down = true;
        }
    });
    document.addEventListener('keyup', (event) => {
        const keyReleased = keys.filter((k) => k.key == event.key);
        console.log(keyReleased);
        if(keyReleased != null){
            keyPressed.down = false;
        }
    });
    window.setInterval(loop, 1000/60);
    key = [
        new inputKey('rForward', 'up arrow'),
        new inputKey('rReverse', 'down arrow'),
        new inputKey('rRight', 'right arrow'),
        new inputKey('rLeft', 'left arrow'),
        new inputKey('aUp', 'spacebar'),
        new inputKey('aDown', 'shift'),
        new inputKey('aRight', 'd'),
        new inputKey('aLeft', 'a'),
        new inputKey('aOpen', 'r'),
        new inputKey('aClose', 'f'),
        new inputKey('aExtend', 'w'),
        new inputKey('aRetract', 's')
    ];
    for(var key in net.powerStatus){
        powerStatus[net.powerStatus[key]] = 0;
    }
    powerStatus[net.powerStatus.motor] = {}
    for(var key in net.motor){
        powerStatus[net.powerStatus.motor][net.motor[key]] = 0;
        motorStatus[net.motor[key]] = 0;
    }
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
            gauge.set(14);
        } else if(key == "main"){
            gauge.maxValue = 10;
            gauge.set(9);
        } else {
            gauge.maxValue = 5;
            gauge.set(1);
        }
        console.log(key);
        gauges[key] = gauge;
        document.getElementById('text' + key).innerText = "Level is " + powerStatus.key + " volts";
    }
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
    for(var gauge in gauges){
        gauges[gauge].set()
    }
}
function loop(){

}
//#endregion

start();