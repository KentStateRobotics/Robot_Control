var conn = new WebSocket("ws://{ip}");
function changeScene(scene){
    document.getElementById("connect").hidden = !scene == "connect";
    document.getElementById("control").hidden = !scene == "control";
}
conn.onmessage = function (message){

}
conn.onopen = function (){
    changeScene("control");
}
conn.onclose = function (){
    changeScene("connect")
}
function send(message){
    conn.send(JSON.stringify(message));
}

dataId = {
    FRMotor: 0,
    RLMotor: 1,
    BRMotor: 2,
    BLMotor: 3,
    ClawServo: 4,
    YawAct: 5,
    PitchAct: 6,
    ExtentionAct: 7,
    Error: 8
}