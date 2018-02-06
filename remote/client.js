var ip = document.getElementById("ipBox").value;
var conn = new WebSocket("ws://" + ip);
function changeScene(scene){
    document.getElementById("connect").hidden = !scene == "connect";
    document.getElementById("control").hidden = !scene == "control";
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
    const keyName = event.key;
});
document.addEventListener('keyup', (event) => {
    const keyName = event.key;
});
function send(message){
    conn.send(JSON.stringify(message));
}
function connect(){
    ip = document.getElementById("ipbox").innerText;
    conn = new WebSocket("ws://" + ip);
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
var status = {
	'0': 0,
	'1': 0,
	'2': 0,
	'3': 0,
	'4': 0,
	'5': 0,
	'6': 0,
	'7': 0,
    '8': 0,
    '9': 0
}