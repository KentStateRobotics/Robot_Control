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
    update = "2"
    stop = "3"
    error = "4"
    auto = "5"
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