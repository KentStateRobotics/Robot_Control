#Kent State Univeristy - RMC team
#Jared Butcher 2018
#
#Processes commands and sensor data, relay between socket and serial

from protocol import motor, power, field, action
from serialConn import serialConn
import json
import sockServer
import httpServer

commandStatus = {}
powerStatus = {}
motorStatus = {}
arduinoConn = None
websockServ = None
httpServ = None

def start(httpPort, sockPort):
    for key in power:
        powerStatus[key] = 0
    powerStatus[power.motor.value] = {}
    for key in motor:
        commandStatus[key] = 0
        motorStatus[key] = 0
        powerStatus[power.motor.value][key] = 0
    try:
        arduino = serialConn(arduinoRec)
    except serialConn.error as e:
        print(e)
    try:
        websockServ = sockServer.sockServer(sockPort, sockRec)
        httpServ = httpServer.httpServer(httpPort)
    except Exception as e:
        print(e)
    

def arduinoRec(message):
    if field.action.value in message:
        if message[field.action.value] == action.requestAll.value:
            data = {}
            data[field.action.value] = action.command.value
            data[field.motor.value] = motorStatus
            arduinoConn.write(json.dumps(data))
        elif message[field.action.value] == action.command.value:
            if field.power.value in message and len(message[field.power.value]) > 0:
                powerCommand(message[field.motors.value])
        elif message[field.action.value] == action.stop.value:
            stop()
        elif message[field.action.value] == action.auto.value:
            auto()
        elif message[field.action.value] == action.error.value:
            pass

def sockRec(message):
    if field.action.value in message:
        if message[field.action.value] == action.requestAllvalue:
            websockServ.send(getAll())
        elif message[field.action.value] == action.command.value:
            if field.motors.value in message and len(message[field.motors.value]) > 0:
                motorCommand(message[field.motors.value])
        elif message[field.action.value] == action.stop.value:
            stop()
        elif message[field.action.value] == action.auto.value:
            auto()
        elif message[field.action.value] == action.error.value:
            pass

def motorCommand(motors):
    message = {}
    message[field.action.value] = field.command.value
    message[field.motor.value] = {}
    for key, value in motors.items():
        commandStatus[key] = value
        message[key] = value
    arduinoConn.write(json.dumps(message))

def powerCommand(powers):
    message = {}
    message[field.action.value] = action.command.value
    message[field.power.value] = {}
    for key, value in powers.items():
        if(key == power.motor.value):
            message[field.power.value][power.motor.value] = {}
            for mKey, mValue in powers[power.motor.value]:
                powerStatus[power.motor.value][mKey] = mValue
                message[field.power.value][power.motor.value][mKye] = mValue
        else:
            powerStatus[mKey] = mValue
            message[field.power.value][mKye] = mValue
    websockServ.send(message)
    
def stop():
    message = {}
    message[field.action.value] = action.stop.value
    arduinoConn.write(json.dumps(message))
    websockServ.send(message)
    for key in motor:
        commandStatus[key] = 0
    

def auto():
    message = {}
    message[field.action.value] = action.auto.value
    websockServ.send(message)
    arduinoConn.write(json.dumps(message))

def getAll():
    data = {}
    data[field.action.value] = action.command.value
    data[field.motor.value] = motorStatus
    data[field.power.value] = powerStatus
    return data