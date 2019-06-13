---
layout: default
title: Zeus App Via Tor
parent: Bonus Section
nav_order: 30
has_toc: false
---
## Bonus guide: Connect Zeus App Over Tor
*Difficulty: medium*

Download the Zeus app, APKs available here: https://github.com/ZeusLN/zeus/releases, 
on F-Droid and Google Play.

Log in to your RaspiBolt through ssh.

Edit `torrc` with `sudo nano /etc/tor/torrc` and add the following lines (`myandroid` can be unique):
```
HiddenServiceDir /var/lib/tor/lnd_api/
HiddenServiceVersion 2
HiddenServiceAuthorizeClient stealth myandroid
HiddenServicePort 8080 127.0.0.1:8080
HiddenServicePort 10009 127.0.0.1:10009
```
Save (Ctrl+O, ENTER) and exit (Ctrl+X)

Restart Tor:
```
$ sudo systemctl restart tor
```

View the private credentials of your new hidden service. The first part is the onion address, the second part is the secret.
```
$ sudo cat /var/lib/tor/lnd_api/hostname
z1234567890abc.onion AbyZXCfghtG+E0r84y/nR # client: myandroid
```

Download Orbot for Android. https://guardianproject.info/apps/orbot/

Open Orbot. Click the `⋮`, select `hidden services ˃`, select `Client cookies`.

Press the + button on the lower right. Type in the the onion address and secret cookie you revealed with `sudo cat /var/lib/tor/lnd_api/hostname`.  
 Must enter onion address and add .onion to end in address area.  
For the cookie you need all the information including [cookie] # client : [client]  
So for example:AbyZXCfghtG+E0r84y/nR # client: myandroid

Go back to Orbot's main screen, and select the gear icon under `tor enabled apps`.  
Add `Zeus`, then press back.  
Click `stop` on the big onion logo.  
Exit orbot and reopen it. Turn on `VPN Mode`.  
Start your connection to the Tor network by clicking on the big onion (if it has not automatically connected already)


On your Raspibolt, make sure Go is installed (should be v1.11 or higher):  
```
$ go version 
```
If need to install Go, run these:

```
$ wget https://storage.googleapis.com/golang/go1.11.linux-armv6l.tar.gz
$ sudo tar -C /usr/local -xzf go1.11.linux-armv6l.tar.gz
$ sudo rm *.gz
$ sudo mkdir /usr/local/gocode
$ sudo chmod 777 /usr/local/gocode
$ export GOROOT=/usr/local/go
$ export PATH=$PATH:$GOROOT/bin
$ export GOPATH=/usr/local/gocode
$ export PATH=$PATH:$GOPATH/bin
```

Install [lndconnect](https://github.com/LN-Zap/lndconnect):
```
$ cd ~/download
$ wget https://github.com/LN-Zap/lndconnect/releases/download/v0.1.0/lndconnect-linux-armv7-v0.1.0.tar.gz
$ sudo tar -xvf lndconnect-linux-armv7-v0.1.0.tar.gz --strip=1 -C /usr/local/bin
```
Switch to user `bitcoin` and generate the LND connect URI QR code:  
It will be a big QR code so maximize your terminal window and use CTRL - to shrink the code further to fit the screen.
Replace the `host` variable with the onion address previously generated.

```
$ sudo su bitcoin
$ lndconnect --lnddir=/home/bitcoin/.lnd --host=z1234567890abc.onion --port=8080
```
Scan it with Zeus and you are done.
