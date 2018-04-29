#Kent State Univeristy - RMC team
#Jared Butcher 2018
#
#Processes commands and sensor data, relay between socket and serial

from protocol import motor, power
from serialConn import serialConn

commandStatus = {}
commands = {
    motor.driveR.value: None,
    motor.driveL.value: None,
    motor.actPitch.value: None,
    motor.actLower.value: None,
    motor.belt.value: None,}
powerStatus = {}
motorStatus = {}
arduino = None

def start():
    for key in power:
        powerStatus[key] = 0
    powerStatus[power.motor.value] = {}
    for key in motor:
        commandStatus[key] = 0
        motorStatus[key] = 0
        powerStatus[power.motor.value][key] = 0
    try:
        arduino = serialConn(arduinoRec)
    except Exception as e:
        print(e)

def arduinoRec(message):
    pass

def command(motors):
    for key, value in motors.items():
        commandStatus[key] = value
        commands[key](value)
        print(value);
        
def stop():
    for key in motor:
        commandStatus[key] = 0
        commands[key] = 0

def getAll():
    data = {}
    data[field.action.value] = action.command.value
    data[field.motor.value] = motorStatus
    dta[field.power.value] = powerStatus
    return data