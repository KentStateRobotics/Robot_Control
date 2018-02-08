var ip = document.getElementById("ipBox").value;
var conn = new WebSocket("ws://" + ip);
var currentScene = "connect";
window.setInterval(loop, 1000/60);
class inputKey{
    constructor(name, key){
        this.name = name;
        this.key = key;
        this.down = false;
    }
}
function changeScene(scene){
    currentScene = scene;
    document.getElementById("connect").hidden = !(scene == "connect");
    document.getElementById("control").hidden = !(scene == "control");
}
conn.onmessage = function (message){
    data = JSON.parse(message);
    data.forEach(function(element) {
        console.log(element);
    });
}
conn.onopen = function (){
    changeScene("control");
    req = {}
    req[dataId.Reqest] = 1
    send(req);
}
conn.onclose = function (){
    changeScene("connect")
}
document.addEventListener('keydown', (event) => {
    const keyPressed = keys.filter((k) => k.key == event.key);
    console.log(keyPressed);
    if(keyPressed != null && currentScene == "control"){
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
function send(message){
    conn.send(JSON.stringify(message));
}
function connect(){
    ip = document.getElementById("ipBox").value;
    console.log(ip);
    conn = new WebSocket("ws://" + ip);
}
function loop(){

}
const dataId = {
    FRMotor: 0,
    RLMotor: 1,
    BRMotor: 2,
    BLMotor: 3,
    ClawServo: 4,
    YawAct: 5,
    PitchAct: 6,
    ExtentionAct: 7,
    Error: 8,
    Reqest: 9
}
var keys = [
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
]
var status = {
	0: 0,
	1: 0,
	2: 0,
	3: 0,
	4: 0,
	5: 0,
	6: 0,
	7: 0,
    8: 0,
    9: 0
}
