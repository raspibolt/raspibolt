# Use lncli on a Different Computer
It is possible to run lnd on the RaspiBolt, and run lncli on a different computer. The instructions below explain how to install and run lncli on a Windows PC and communicate with the RaspiBolt. Instructions for running on a different computer (MAC, Linux, ...) will be basically identical.

In these instructions, it is assumed the lncli computer is on the local LAN, but it is possible to also have the lncli computer outside the local LAN.

## RaspiBolt

- Allow port 10009 in firewall
Login as admin

`admin ~  ฿  sudo su`

```
ufw allow from 192.168.0.0/24 to any port  10009 comment 'allow lnd rpc from Local LAN'
ufw status
```
  
