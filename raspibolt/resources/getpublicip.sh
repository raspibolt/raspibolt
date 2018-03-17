#!/bin/bash
# RaspiBolt LND Mainnet: script to get public ip address
# /usr/local/bin/getpublicip.sh

echo 'getpublicip.sh started, writing public IP address every 10 minutes into /run/publicip'
while [ 0 ]; 
    do 
    printf "PUBLICIP=$(curl -vv ipinfo.io/ip 2> /run/publicip.log)\n" > /run/publicip;
    sleep 600
done;
