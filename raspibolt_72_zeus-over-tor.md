---
layout: default
title: Zeus app Via Tor v3
parent: Bonus Section
nav_order: 30
has_toc: false
---
## Bonus guide: Connect Zeus app over Tor v3
*Difficulty: medium*


### Create the Hidden Service:

In your Raspibolt, edit `torrc` with `$ sudo nano /etc/tor/torrc` and add the following lines at the end:
```

HiddenServiceDir /var/lib/tor/lnd_REST/
HiddenServiceVersion 3
HiddenServicePort 8080 127.0.0.1:8080
```
Save (Ctrl+O, ENTER) and exit (Ctrl+X)

Restart Tor:
```
$ sudo systemctl restart tor
```

Generate Tor v3 address

```
$ sudo cat /var/lib/tor/lnd_REST/hostname

Copy the HIDDEN_SERVICE_ADDRESS.onion
```


### Install lndconnect:

On your Raspibolt, make sure Go is installed (should be v1.11 or higher):  
```
$ go version 
```
If need to install Go, run these:

```
$ wget https://storage.googleapis.com/golang/go1.13.linux-armv6l.tar.gz
$ sudo tar -C /usr/local -xzf go1.13.linux-armv6l.tar.gz
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
$ wget https://github.com/LN-Zap/lndconnect/releases/download/v0.2.0/lndconnect-linux-armv7-v0.2.0.tar.gz
$ sudo tar -xvf lndconnect-linux-armv7-v0.2.0.tar.gz --strip=1 -C /usr/local/bin
```


### Generate the lndconnect QR code:

Switch to user `bitcoin` and generate the QR code.

Paste the `HIDDEN_SERVICE_ADDRESS.onion` previously coppied.

```
$ sudo su bitcoin
$ lndconnect --host=HIDDEN_SERVICE_ADDRESS.onion --port=8080
```
It will be a big QR code so maximize your terminal window and use CTRL - to shrink the code further to fit the screen.

If using Putty, you can select a smaller font size: Category -> Window -> Apearance -> Font settings -> Change -> Size.


### Install Zeus app on Android device:

Download the [Zeus](https://zeusln.app/) app, available on:

* [GitHub](https://github.com/ZeusLN/zeus/releases), 
* [F-Droid](https://f-droid.org/en/packages/com.zeusln.zeus/) 
* [Google Play](https://play.google.com/store/apps/details?id=com.zeusln.zeus)


### Set up Orbot in the Android device:

Download Orbot for Android. https://guardianproject.info/apps/orbot/

On Orbot's main screen select the gear icon under `tor enabled apps`.

Add `Zeus`, then press back.

Click `stop` on the big onion logo.

Exit Orbot and reopen it. Turn on `VPN Mode`.

Start your connection to the Tor network by clicking on the big onion (if it has not automatically connected already).

If Orbot is misbehaving try stopping other VPN services on the phone and/or restart.


### Connect Zeus app to you LN node over Tor v3:

To open Zeus click on it's icon at the Tor_Enabled-Apps in Orbot.

In Zeus app, select the gear icon and press ´Add a new node´.

Scan the ´lndconnect QR code´ and you are done.
