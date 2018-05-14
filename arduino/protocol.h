//protocol
//Kent State Univeristy - RMC team
//Jared Butcher 2018
//
//enums used to communicate over serial connection with control computer
//How to use:
//use ArduinoJson library https://github.com/bblanchon/ArduinoJson/blob/master/src/ArduinoJson/JsonArrayImpl.hpp
//generate a JsonObject or make one out of received chars

#ifndef RMC_ARDUINO_PROTOCOL_H_
#define RMC_ARDUINO_PROTOCOL_H_

namespace protocol{
    enum class field: char { //Defines what the value is, matches the enums below
        action = '0', //Single action
        motor = '1', //List of motors and their values
        power = '2', //List of current sensors and their values
    };
    enum class action: char{ //What to do
        requestAll = '0', //Send all sensor data
        command = '1', //Set values ex: send sensor or move motors
        stop = '2', //Stop all
        error = '3', //error
        autoRun = '4', //currently unused
    };
    enum class motor: char { //Object of motors and their settings
        driveR = '0',
        driveL = '1',
        actWrist = '2',
        actElbow = '3',
        belt = '4',
    };
    enum class power: char { //Object of current/voltage sensors and their readings
        battery = '0', //voltage
        main = '1',
        motor = '2', //Object of motors for each currnet motor's current sensor
    };
};

#endif
