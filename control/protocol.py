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
    FRDrive = "0"
    FLDrive = "1"
    BRDrive = "2"
    BLDrive = "3"
    armPiv = "4"
    armAct = "5"
    armBelt = "6"
@unique
class power(IntEnum):
    battery = "0"
    main = "1"
    motor = "2" #object of motors