[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [**Bonus**](raspibolt_60_bonus.md) ] -- [ [FAQ](raspibolt_faq.md) ] -- [ [Updates](raspibolt_updates.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

## Bonus guide: Shango Mobile Lightning Wallet
*Difficulty: medium*

The mobile app Shango (http://shangoapp.com) allows the managment of the Lightning daemon on your RaspiBolt. It provides 
an status overview, lists peers, allows to open & close channels, make payments and create invoices.

As this app controls has full control over you RaspiBolt, there is trust involved. Is is unclear, if this will be an 
open-source application and whether it's trustworthy. **Use it at your own risk.**

Even if the app is trustworthy, your RaspiBolt needs to be externally controlled using the gRPC interface. This adds an 
additional attack vector and this is why we configure the firewall to only allow connections from within your local 
network. It's trivial to open it to the internet, but again, do this **at your own risk**.

![Shango app overview](images/60_shango.png)

### Preparation on the Pi

* Add the following line to your lnd configuration file in the section `[Application Options]`  
  `$ sudo nano /home/bitcoin/.lnd/lnd.conf`
  
```
rpclisten=0.0.0.0:10009
``` 

* Open port 10009 for connections from within the local network (you might need to adjust the ip mask, see [more details](https://github.com/Stadicus/guides/blob/shango/raspibolt/raspibolt_20_pi.md#hardening-your-pi))  
  `$ sudo ufw allow from 192.168.0.0/24 to any port 10009 comment 'allow LND grpc from local LAN'`  
  `$ sudo ufw enable`  
  `$ sudo ufw status`

* Restart LND and unlock wallet  
  `$ sudo systemctl status lnd`  
  `$ lncli unlock` 

* Install QR encoder to pass our super-secret admin information to the app  
  `$ sudo apt-get install qrencode`  
  `$ cd /home/admin/.lnd`  

### Configure Shango app
  
* Start app & go to "Settings" / "Switch LND Server"  
* Enter your IP address with the port 10009, eg. `192.168.0.20:10009`
* On your RaspiBolt, enter the following command and scan the resulting QR code for "Server Macaroon" in the app  
  `$ qrencode $(xxd -p -c3000 admin.macaroon) -t ANSIUTF8`  
* On your RaspiBolt, enter the following command and scan the resulting QR code for "Server TLS Cert" in the app  
  `$ qrencode $(xxd -p -c3000 tls.cert) -t ANSIUTF8`
* Click on "Connect" and the app should sync with your RaspiBolt.
  
### Disclaimer
* This app is still in beta testing and has access to all of your funds. Use at your own risk.
* If you find bugs, please report them here: https://github.com/neogeno/shango-lightning-wallet/issues
  
------

<< Back: [Bonus guides](raspibolt_60_bonus.md) 
