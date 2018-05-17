#Kent State Univeristy - RMC team
#Jared Butcher 2018
#
#Enums to be used for communication

from enum import Enum, unique

@unique
class field(Enum):
    action = "0"
    motor = "1"
    power = "2"
@unique
class action(Enum):
    requestAll = "0"
    command = "1"
    stop = "2"
    error = "3"
    auto = "4"
    alive = "5"
@unique
class motor(Enum):
    driveR = "0"
    driveL = "1"
    actWrist = "2"
    actElbow = "3"
@unique
class power(Enum):
    battery = "0"
    main = "1"
    motor = "2"