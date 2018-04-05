# Use lncli on a Different Computer
It is possible to run lnd on the RaspiBolt, and run lncli on a different computer. The instructions below explain how to install and run lncli on a Windows PC and communicate with the RaspiBolt. Instructions for running on a different computer (MAC, Linux, ...) will be basically identical.

In these instructions, it is assumed the lncli computer is on the local LAN, but it is possible to also have the lncli computer outside the local LAN.

## RaspiBolt

- Login as admin

- Allow port 10009 in firewall

```
admin ~  ฿  sudo su
admin ~  ฿  ufw allow from 192.168.0.0/24 to any port  10009 comment 'allow lnd rpc from Local LAN'
admin ~  ฿  ufw status
admin ~  ฿  exit
```
- Add one new line in the [Application Options] section of lnd.conf to allow rpc from more than just the default localhost

`admin ~  ฿  sudo nano /home/bitcoin/.lnd/lnd.conf`
  
```
[Application Options]
rpclisten=0.0.0.0:10009

```

- Temporarily allow admin.macaroon to be copied

`sudo chmod 777 /home/bitcoin/.lnd/admin.macaroon`


## Windows PC

Download and install lncli

- Use your browser to visit https://github.com/lightningnetwork/lnd/releases

- Download the file for your OS. For Windows10 it will genereally be lnd-windows-amd64-vx.x.x-beta.zip
  
- Open the compressed file and extract the lncli application (e.g. lncli.exe) to a known location (e.g. Your desktop)

- Open 
![Zip File](images/60_remote_zip.png) 

Follow the instructions in [Mainnet] to use WinSCP to xxx
