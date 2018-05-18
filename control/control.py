#Kent State Univeristy - RMC team
#Jared Butcher 2018
#
#Processes commands and sensor data, relay between socket and serial

from protocol import motor, power, field, action
from serialConn import serialConn
import json
import sockServer
import httpServer
import threading
import time

class control:
    def __init__(self, httpPort, sockPort):
        self._RampSlope = 60
        self._RAMP_DELAY = .25
        self._isRamping = False
        self._deadRange = 32
        self._deadRangeMult = 1
        self.commandStatus = {}
        self.powerStatus = {}
        self.motorStatus = {}
        self.arduinoConn = None
        self.websockServ = None
        self.httpServ = None
        for key in power:
            self.powerStatus[key.value] = 0
        self.powerStatus[power.motor.value] = {}
        for key in motor:
            self.commandStatus[key.value] = 0
            self.motorStatus[key.value] = 0
            self.powerStatus[power.motor.value][key.value] = 0
        try:
            self.arduinoConn = serialConn(self.recDebug)
        except Exception as e:
            print(e)
        try:
            self.websockServ = sockServer.sockServer(sockPort, self.sockRec)
            self.httpServ = httpServer.httpServer(httpPort)
        except Exception as e:
            print(e)
        self._rampThread = threading.Thread(target=self.rampLoop).start()
        '''
        while True: #For sending socket and gauge debuging
            value = float(input())
            message = {}
            message[field.action.value] = action.command.value
            message[field.power.value] = {}
            message[field.power.value][power.battery.value] = value * 6
            message[field.power.value][power.motor.value] = {}
            for key in motor:
                message[field.power.value][power.motor.value][key.value] = value;
            message[field.power.value][power.main.value] = value * 5
            self.arduinoRec(message)
        '''

    def recDebug(self, message):
        print("received: " + json.dumps(message))

    def arduinoRec(self, message):
        if field.action.value in message:
            if message[field.action.value] == action.requestAll.value:
                data = {}
                data[field.action.value] = action.command.value
                data[field.motor.value] = self.commandStatus
                self.arduinoConn.write(json.dumps(data))
            elif message[field.action.value] == action.command.value:
                if field.power.value in message and len(message[field.power.value]) > 0:
                    self.powerCommand(message[field.power.value])
                if field.motor.value in message and len(message[field.motor.value]) > 0: #For motor feedback
                    pass
            elif message[field.action.value] == action.stop.value:
                self.stop()
            elif message[field.action.value] == action.auto.value:
                self.auto()
            elif message[field.action.value] == action.error.value:
                pass

    def sockRec(self, message):
        if field.action.value in message:
            if message[field.action.value] == action.requestAll.value:
                self.websockServ.send(self.getAll())
            elif message[field.action.value] == action.command.value:
                print("Command REC")
                if field.motor.value in message and len(message[field.motor.value]) > 0:
                    self.motorCommand(message[field.motor.value])
                if field.ramp.value in message:
                    self._RampSlope = int(127 / float(message[field.ramp.value]))
                    print("RAMP: " +  str(self._RampSlope))
            elif message[field.action.value] == action.alive.value and not self._isRamping:
                self.arduinoConn.write(json.dumps(self.commandStatus))
            elif message[field.action.value] == action.stop.value:
                self.stop()
            elif message[field.action.value] == action.auto.value:
                self.auto()
            elif message[field.action.value] == action.error.value:
                pass

    def motorCommand(self, motors):
        message = {}
        for key, value in motors.items():
            self.commandStatus[key] = int(value)
            if(key != motor.driveL.value and key != motor.driveR.value):
                message[key] = int(value)
        if(len(message.items())):
            self.arduinoConn.write(json.dumps(message))

    def rampLoop(self):
        while True:
            req = {}
            for key in [motor.driveL.value, motor.driveR.value]:
                if self.commandStatus[key] != self.motorStatus[key]:
                    self._isRamping = True
                    if self.commandStatus[key] < self.motorStatus[key]:
                        self.motorStatus[key] = max(self.commandStatus[key],min(127, self.motorStatus[key] - self._RampSlope * self._RAMP_DELAY))
                        if self.motorStatus[key] > -1 * self._deadRange and self.motorStatus[key] < 0:
                            self.motorStatus[key] =  max(-1 * self._deadRange,max(self.commandStatus[key],min(127, self.motorStatus[key] - self._RampSlope * self._RAMP_DELAY * self._deadRangeMult)))
                    elif self.commandStatus[key] > self.motorStatus[key]:
                        self.motorStatus[key] = max(-127,min(self.commandStatus[key], self.motorStatus[key] + self._RampSlope * self._RAMP_DELAY))
                        if self.motorStatus[key] > 0 and self.motorStatus[key] < self._deadRange:
                            print("Deadzone up: " + str(self.motorStatus[key]))
                            self.motorStatus[key] = max(-127, min(self._deadRange, min(self.commandStatus[key], self.motorStatus[key] + self._RampSlope * self._RAMP_DELAY * self._deadRangeMult)))
                    req[key] = self.motorStatus[key]
                else:
                    self._isRamping = False
            if(len(req.items()) > 0): self.arduinoConn.write(json.dumps(req))
            time.sleep(self._RAMP_DELAY)

    def powerCommand(self, powers):
        message = {}
        message[field.action.value] = action.command.value
        message[field.power.value] = {}
        for key, value in powers.items():
            if(key == power.motor.value):
                message[field.power.value][power.motor.value] = {}
                for mKey, mValue in powers[power.motor.value].items():
                    self.powerStatus[power.motor.value][mKey] = mValue
                    message[field.power.value][power.motor.value][mKey] = mValue
            else:
                self.powerStatus[key] = value
                message[field.power.value][key] = value
        self.websockServ.send(message)

    def stop(self):
        message = {}
        for key in motor:
            message[key.value] = 0
            self.commandStatus[key.value] = 0
            self.motorStatus[key.value] = 0
        self.arduinoConn.write(json.dumps(message))

    def auto(self):
        message = {}
        message[field.action.value] = action.auto.value
        self.websockServ.send(message)
        self.arduinoConn.write(json.dumps(message))

    def getAll(self):
        data = {}
        data[field.action.value] = action.command.value
        data[field.motor.value] = self.motorStatus
        data[field.power.value] = self.powerStatus
        return data