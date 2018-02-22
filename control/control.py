from protocol import motor, power

commandStatus = {}
commands = {
    motor.FRDrive.value: None,
    motor.FLDrive.value: None,
    motor.BRDrive.value: None,
    motor.BLDrive.value: None,
    motor.armAct.value: None,
    motor.armBelt.value: None,
    motor.armPiv.value: None}
powerStatus = {}
motorStatus = {}

def start():
    for key in power:
        powerStatus[key] = 0
    powerStatus[power.motor.value] = {}
    for key in motor:
        commandStatus[key] = 0
        motorStatus[key] = 0
        powerStatus[power.motor.value][key] = 0
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
    data[field.action.value] = action.update.value
    data[field.motor.value] = motorStatus
    dta[field.power.value] = powerStatus
    return data

start()