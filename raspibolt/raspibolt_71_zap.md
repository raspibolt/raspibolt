[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [**Bonus**](raspibolt_60_bonus.md) ] -- [ [Troubleshooting](raspibolt_70_troubleshooting.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

## Bonus guide: Zap Desktop Lightning Wallet
*Difficulty: medium*


The desktop app Zap (https://github.com/LN-Zap/zap-desktop) is a cross platform Lightning Network wallet focused on user experience and ease of use.

Download Zap for your operating sytem:
https://github.com/LN-Zap/zap-desktop/releases  
Install instructions: https://github.com/LN-Zap/zap-desktop#install


### Preparation on the Pi

* Allow connections to the RaspiBolt from your LAN. Check what your LAN IP address is starting with eg. 192.168.0 or 192.168.1 and use the address accordingly. Ending with .0/24 will allow all IP addresses from that network.  
    `$ sudo nano /home/bitcoin/.lnd/lnd.conf`  

    Add the following line to the section `[Application Options]`:  
  ```tlsextraip=192.168.0.0/24```
  
* Delete tls.cert (restarting LND will recreate it):  
    `$ sudo rm /home/bitcoin/.lnd/tls.*`

* Restart LND :  
  `$ sudo systemctl restart lnd`  
  
* Copy the new tls.cert to user "admin", as it is needed for lncli:  
    `$ sudo cp /home/bitcoin/.lnd/tls.cert /home/admin/.lnd`

* Unlock wallet  
  `$ lncli unlock` 

* Allow the ufw firewall to listen on 10009 from the LAN:  
  `$ sudo ufw allow from 192.168.0.0/24 to any port 10009 comment 'allow LND grpc from local LAN'`

 * restart and check the firewall:  
  `$ sudo ufw enable`  
  `$ sudo ufw status`


### On your Linux desktop terminal:  

* Copy the tls.cert to your home directory:  
  `$ scp admin@your.RaspiBolt.LAN.IP:/home/admin/.lnd/tls.cert ~/`

* Copy the admin.macaroon to your home directory:  
`$ scp admin@your.RaspiBolt.LAN.IP:/home/bitcoin/.lnd/admin.macaroon ~/`

### Configure Zap

* Start the app and select:  
```Connect your own node```

![](images/71_zap1.png)


* Fill in the next screen:  
`your.RaspiBolt.LAN.IP:10009`  
`~/tls.cert`  
`~/admin.macaroon`  

![](images/71_zap2.png)

* Confirm the settings on the following screen and you are done!

------

<< Back: [Bonus guides](raspibolt_60_bonus.md) 
