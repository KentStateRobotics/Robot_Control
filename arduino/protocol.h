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
  /*
    class field { //Defines what the value is, matches the enums below
        action = '0', //Single action
        motor = '1', //List of motors and their values
        power = '2', //List of current sensors and their values
    };
    class action { //What to do
        requestAll = '0', //Send all sensor data
        command = '1', //Set values ex: send sensor or move motors
        stop = '2', //Stop all
        error = '3', //error
        autoRun = '4', //currently unused
    };*/
    class motor { //Object of motors and their settings
      public:
        const static String driveR;
        const static String driveL;
        const static String actWrist;
        const static String actElbow;
    };
};

const String protocol::motor::driveR = "0";
const String protocol::motor::driveL = "1";
const String protocol::motor::actWrist = "2";
const String protocol::motor::actElbow = "3";

#endif
