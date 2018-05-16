#Kent State Univeristy - RMC team
#Jared Butcher 2018
#
#Processes commands and sensor data, relay between socket and serial

from protocol import motor, power, field, action
from serialConnNew import serialConn
import json
import sockServer
import httpServer

class control:
    def __init__(self, httpPort, sockPort):
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
                if field.motor.value in message and len(message[field.motor.value]) > 0:
                    self.motorCommand(message[field.motor.value])
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
            message[key] = int(value)
        self.arduinoConn.write(json.dumps(message))

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
        self.arduinoConn.write(json.dumps(message))
        self.websockServ.send(message)
        for key in motor:
            self.commandStatus[key.value] = 0

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