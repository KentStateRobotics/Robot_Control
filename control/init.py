#Kent State Univeristy - RMC team
#Jared Butcher 2018
#
#Starts program

import control

SOCK_PORT = 4242
HTTP_PORT = 80

robotContoler = control.control(HTTP_PORT, SOCK_PORT)

