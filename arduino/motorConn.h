#ifndef ARDUINO_MOTORCONN_H_
#define ARDUINO_MOTORCONN_H_

#include "Arduino.h"

namespace protocol{
    enum class field: char {
        action = '0',
        motor = '1',
        power = '2',
    };
    enum class action: char{
        requestAll = '0',
        command = '1',
        update = '2',
        stop = '3',
        error = '4',
        autoRun = '5',
    };
    enum class motor: char {
        driveR = '0',
        driveL = '1',
        actPitch = '2',
        actLower = '3',
        belt = '4',
    };
    enum class power: char {
        battery = '0',
        main = '1',
        motor = '2',
    };
};
#endif
