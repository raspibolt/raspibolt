[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [**Bonus**](raspibolt_60_bonus.md) ] -- [ [FAQ](raspibolt_faq.md) ] -- [ [Updates](raspibolt_updates.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

## Bonus guide: Shango Mobile Lightning Wallet
*Difficulty: medium*

> Please note: this guide has not been updated to LND 0.5 yet and might not work as intended.

The mobile app Shango (http://shangoapp.com) allows the managment of the Lightning daemon on your RaspiBolt. It provides 
an status overview, lists peers, allows to open & close channels, make payments and create invoices.

At the moment this app is in closed beta testing (you can sign up) and the source code has not been published yet, so **use it with caution**. The intention is to provide this app as a free open-source application once it is ready for a public beta release. If you find bugs, you can contribute to this project by reporting them here: https://github.com/neogeno/shango-lightning-wallet/issues.

![Shango app overview](images/60_shango.png)

### Preparation on the Pi

* Add the following line to your lnd configuration file in the section `[Application Options]`  
  `$ sudo nano /home/bitcoin/.lnd/lnd.conf`
  
```
rpclisten=0.0.0.0:10009

### Uncomment and ajust these lines for access from public internet
#tlsextraip=111.222.333.444               # fixed ip is needed
#tlsextradomain=lightning.yourhost.com    # domain name, works with FreeDNS (https://freedns.afraid.org)
```

Open port 10009 so that Shango wallet can talk to your Lightning node. To be **safe**, open it only from within your own network. If you feel **reckless**, you can open it for access from everywhere to use Shango on the go. I think the connection itself is safe, but this exposes your node to DDoS and other attacks. So make sure you know what you do!  

* **Safe option**: for connections from within the local network (you might need to adjust the ip mask, see [more details](https://github.com/Stadicus/guides/blob/master/raspibolt/raspibolt_20_pi.md#hardening-your-pi))  
  `$ sudo ufw allow from 192.168.0.0/24 to any port 10009 comment 'allow LND grpc from local LAN'`  

* **Reckless option**: for connections from everywhere. 
  * Add a new router port forwarding for port 10009 (see [this section](https://github.com/Stadicus/guides/blob/master/raspibolt/raspibolt_20_pi.md#port-forwarding) in the base guide)   
  * `$ sudo ufw allow 10009 comment 'allow LND grpc from public internet'`  
  * Make sure the `tlsextraip` and/or `tlsextradomain` is configure in the LND configuartion (see above)  
  * Delete the TLS certificates (they do not yet contain the external ip address)  
    `$ sudo rm /home/bitcoin/.lnd/tls.*`
  * Restart LND, so that new TLS certificates are generated  
    `$ sudo systemctl restart lnd`  
  * Copy the new certificates to user "admin", as they are needed to use `lncli`  
    `$ sudo cp /home/bitcoin/.lnd/tls.cert /home/admin/.lnd`  
  * Test if `lncli` can use the new certificates  
    `$ lncli getinfo`

* Update and check your Uncomplicated Firewall  
  `$ sudo ufw enable`  
  `$ sudo ufw status`

* Restart LND and unlock wallet  
  `$ sudo systemctl restart lnd`  
  `$ lncli unlock` 

* Install QR encoder to pass our super-secret admin information to the app  
  `$ sudo apt-get install qrencode`  
  `$ cd /home/admin/.lnd`  

### Configure Shango app

* Start app & go to "Settings" / "Connect to other LND Servers"  
* On your RaspiBolt, enter the following command and "Scan QR" with the app
```
echo -e "$(curl -s ipinfo.io/ip),\n$(xxd -p -c2000 admin.macaroon)," > qr.txt && cat tls.cert >>qr.txt && qrencode -t ANSIUTF8 < qr.txt
```
For LND 0.5 use the command below:
```
echo -e "$(curl -s ipinfo.io/ip),\n$(xxd -p -c2000 ~/.lnd/data/chain/bitcoin/mainnet/admin.macaroon)," > qr.txt && cat ~/.lnd/tls.cert >>qr.txt && qrencode -t ANSIUTF8 < qr.txt
```
* The input field "IP:Port" is filled with your external ip address. If you want to run Shango in **safe mode** (internal network only), make sure to replace it with your internal ip address (eg. 192.168.0.20).  
* Click on "Connect" and the app should sync with your RaspiBolt.

------

<< Back: [Bonus guides](raspibolt_60_bonus.md) 
