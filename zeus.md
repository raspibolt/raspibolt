---
layout: default
title: Zeus
nav_order: 60
parent: Lightning
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->
# Zeus
{: .no_toc }

We install [Zeus](https://zeusln.app/){:target="_blank"}, a cross-platforms mobile app that connect to your LN node over Tor.  Make payments with lightning or on-chain and manage your channels whle you're on the go.

![Zeus](images/zeus.png)

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Preparations

### Access over Tor

Zeus will access the node via Tor.

* Add the following three lines in the section for “location-hidden services” in the `torrc` file.

  ```sh
  $ sudo nano /etc/tor/torrc

  ############### This section is just for location-hidden services ###
  HiddenServiceDir /var/lib/tor/hidden_service_lnd_rest/
  HiddenServiceVersion 3
  HiddenServicePort 8080 127.0.0.1:8080

* Reload Tor configuration and get your connection address.

   ```sh
   $ sudo systemctl reload tor
   $ sudo cat /var/lib/tor/hidden_service_electrs/hostname
   > abcdefg..............xyz.onion
   ```


## Install Zeus on the phone

### On Android

#### Download the APK file

* On your phone, go to the Zeus [release page](https://github.com/ZeusLN/zeus/releases){:target="_blank"} and download the latest Android APK file in the 'Assets' section (e.g., `zeus-v0.6.0-alpha4.apk`).

#### Verify the checksum of the file

* On your phone, install [Hash Droid](https://f-droid.org/en/packages/com.hobbyone.HashDroid/){:target="_blank"} from F-Droid or Google Play.

* Open Hash Droid, select 'Hash a file', select the 'SHA-256' hash function and select the downloaded APK file and click 'Calculate' (e.g., `41006ef7019f471529d35ab5c846986919c4b6f8cdf07d01c5851ff08b41ce02`)

* On your computer, open the '...signature.txt' file located in the 'Assets' section (e.g., `zeus-v0.6.0-alpha4-signature.txt`), it contains a line with the hash sum of the APK file (e.g., `SHA256(zeus-v0.6.0-alpha4.apk)= 41006ef7019f471529d35ab5c846986919c4b6f8cdf07d01c5851ff08b41ce02`)

* Compare the calculated hash value (Hash Droid) with the expected hash value from the text file, they should be the same.

#### Verify the signature of the file

* On your computer, open a terminal and download the public key used to sign the releases

  ```sh
  $ wget https://zeusln.app/PGP.txt
  ```
  
* Check the public key’s fingerprint

  ```sh
  $ gpg --show-keys PGP.txt
  > pub   rsa4096 2021-10-20 [SC] [expires: 2023-10-20]
  >    96C225207F2137E278C31CF7AAC48DE8AB8DEE84
  > uid                      Zeus LN <zeusln@tutanota.com>
  > sub   rsa4096 2021-10-20 [E] [expires: 2023-10-20]
  ```

* Import the PGP key

  ```sh
  $ gpg --import PGP.txt
  > gpg: key AAC48DE8AB8DEE84: public key "Zeus LN <zeusln@tutanota.com>" imported
  > gpg: Total number processed: 1
  > gpg:               imported: 1
  ```

* Download the APK file and its associated signature file

  ```sh
  $ wget https://github.com/ZeusLN/zeus/releases/download/v0.6.0-alpha4/zeus-v0.6.0-alpha4.apk
  $ wget https://github.com/ZeusLN/zeus/releases/download/v0.6.0-alpha4/zeus-v0.6.0-alpha4.apk.asc
  ```
  
* Verify that the APK file has been properly signed

   ```sh
   $ gpg --verify zeus-v0.6.0-alpha4.apk.asc zeus-v0.6.0-alpha4.apk
   > gpg: Signature made Wed 01 Dec 2021 00:07:34 -01
   > gpg:                using RSA key 96C225207F2137E278C31CF7AAC48DE8AB8DEE84
   > gpg:                issuer "zeusln@tutanota.com"
   > gpg: Good signature from "Zeus LN <zeusln@tutanota.com>" [unknown]
   > [...]
   ```
   
#### Install Zeus

* Now that we've proven the integrity of the downloaded APK, install Zeus by double-clicking on the APK file.

* Once the installation is finished, select 'Open'



Download the Zeus app, APKs available here: https://github.com/ZeusLN/zeus/releases, 
on F-Droid and Google Play.

Log in to your RaspiBolt through ssh.

Edit `torrc` with `sudo nano /etc/tor/torrc` and add the following lines:
```
HiddenServiceDir /var/lib/tor/lnd_api/
HiddenServiceVersion 3
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
z1234567890abc.onion
```

Make sure Go is installed (should be v1.11 or higher):  
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
Switch to user `bitcoin` and generate the LND connect URI QR code (or String):  
It will be a big QR code so maximize your terminal window and use CTRL - to shrink the code further to fit the screen.
Replace the `host` variable with the onion address previously generated.
To generate QR Code:
```
$ sudo su bitcoin
$ lndconnect --lnddir=/home/bitcoin/.lnd --host=z1234567890abc.onion --port=8080
```
To generate a String:
```
$ sudo su bitcoin
$ lndconnect --lnddir=/home/bitcoin/.lnd --host=z1234567890abc.onion --port=8080 -j
```
Scan or copy paste it with Zeus and you are done.

------

<< Back: [+ Lightning](index.md)
