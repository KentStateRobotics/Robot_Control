#Kent State Univeristy - RMC team
#Jared Butcher 2018
#
#Enums to be used for communication

from enum import IntEnum, unique

@unique
class field(IntEnum):
    action = "0"
    motor = "1"
    power = "2"
@unique
class action(IntEnum):
    requestAll = "0"
    command = "1"
    stop = "2"
    error = "3"
    auto = "4"
@unique
class motor(IntEnum):
    driveR = "0"
    driveL = "1"
    actPitch = "2"
    actLower = "3"
    belt = "4"
@unique
class power(IntEnum):
    battery = "0"
    main = "1"
    motor = "2"