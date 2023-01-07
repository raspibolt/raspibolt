---
layout: default
title: JoinMarket webui (Jam)
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->
# Bonus guide: JoinMarket webui (Jam)
{: .no_toc }

Difficulty: Intermediate
{: .label .label-yellow }

Status: Tested v3
{: .label .label-green }

We set up [Joinmarket-webui](https://github.com/joinmarket-webui/jam){:target="blank"}, a graphical user interface for JoinMarket.

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

### Introduction
[Jam](https://github.com/joinmarket-webui/jam) a web interface for JoinMarket focusing on user-friendliness and ease-of-use. It aims to provide sensible defaults and be easy to use for beginners while still having the features advanced users expect.

---

## Prerequisites
- [Nginx reverse proxy](https://raspibolt.org/guide/raspberry-pi/security.html#prepare-nginx-reverse-proxy) section
- [JoinMarket](https://raspibolt.org/guide/bonus/bitcoin/joinmarket.html) Guide

## Dependencies

### Node.js

To run Jam, we need to install Node.js

* With user "admin", let's check our version of Node.js running on the node. If the version is v14 or older, update it following [this tutorial](https://phoenixnap.com/kb/update-node-js-version){:target="_blank"}.

```sh
  $ node -v
  > v16.13.1
  ```

* If Node.js is not installed, add the Node.js package repository from user “admin” and install Node.js using the apt package manager

```sh
  $ curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
  $ sudo apt install nodejs -y
```

### Node Package Manager

Node Package Manager (npm) is the default package manager for the JavaScript runtime environment

* With user "admin", let's check our version of npm running on the node
 
```sh
  $ npm -v
> 8.19.2
```

* If not already installed, install npm package manager

```sh
$ sudo apt update
$ sudo apt install npm -y
```

* Update npm to the latest version

```sh
$ sudo npm install latest-version
```

### JoinMarket preparations
* Provide values for config variables `max_cj_fee_abs` and `max_cj_fee_rel` in `joinmarket.cfg`. Set them to values you feel comfortable with.

```sh
$ sudo su - joinmarket
$ cd .joinmarket
$ nano joinmarket.cfg
```

* Uncomment these two separate lines, set desired values, then save

```
max_cj_fee_rel = 0.00003

max_cj_fee_abs = 600
```

* Generate self-signed certificate in JoinMarket's working directory

```sh
$ mkdir ssl/ && cd "$_"

$ openssl req -newkey rsa:4096 -x509 -sha256 -days 3650 -nodes \
  -out cert.pem -keyout key.pem \
  -subj "/C=US/ST=Utah/L=Lehi/O=Your Company, Inc./OU=IT/CN=example.com"

$ exit
```

### Nginx preparations

* Create Nginx reverse proxy for Jam

```sh
$ sudo nano /etc/nginx/streams-enabled/jam-reverse-proxy.conf
```

* Add configuration below to file and save

```sh
upstream jam {
  server 127.0.0.1:3020;
}
server {
  listen 4020 ssl;
  proxy_pass jam;
}
```

* Verify nginx config and look for ok/successful
```sh
$ sudo nginx -t
> Ok
```

* Reload `nginx`
```sh
$ sudo systemctl reload nginx
```

### Ufw preparations

* Allow incoming https requests for Jam

```sh
$ sudo ufw allow 4020/tcp comment 'allow JAM SSL'
```

* Verify ufw entry

```sh
$ sudo ufw status
> ...
```

## Install Jam
* Create a dedicated user for Jam and switch to user

```sh
$ sudo adduser --disabled-password --gecos "" jam

$ sudo su - jam
```

* Obtain developer pgp signature for verification

```sh
$ curl https://dergigi.com/PGP.txt | gpg --import
```

* Retrieve source code

```sh
$ git clone https://github.com/joinmarket-webui/jam.git --branch v0.1.4 --depth=1
```

* Verify release by looking for `Good signature` response

```sh
$ cd jam

$ git verify-tag v0.1.4
...
> gpg: Good signature from "Gigi <dergigi@pm.me>" [unknown]
> gpg: WARNING: This key is not certified with a trusted signature!
> gpg:          There is no indication that the signature belongs to the owner.
> Primary key fingerprint: 8198 A185 30A5 22A0 9561  2439 89C4 A25E 69A5 DE7F
```

* Install Jam using `npm`

```sh
$ npm install
```

* Update Jam's default port to prevent overlap with any existing services

```sh
$ nano .env
```

* Add the following to file and save

```sh
PORT=3020
```

* Logout of Jam user

```sh
$ exit
```

## Establish systemd services for JoinMarket and Jam

* Using `admin` user create the following systemd services

### Create a JMwalletd service

```sh
$ sudo nano /etc/systemd/system/jmwalletd.service
```

* Add the following text to file and save

```sh
# RaspiBolt: systemd unit for JoinMarket API
# /etc/systemd/system/jmwalletd.service

[Unit]
Description=JoinMarket API daemon
After=bitcoind.service

[Service]
WorkingDirectory=/home/joinmarket/joinmarket/scripts/
ExecStart=/bin/sh -c '. /home/joinmarket/joinmarket/jmvenv/bin/activate && python3 jmwalletd.py'
User=joinmarket

Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target

```
 
* Enable and start service

```sh
$ sudo systemctl enable jmwalletd

$ sudo systemctl start jmwalletd
```

### Create OBwatcher service

```sh
$ sudo nano /etc/systemd/system/obwatcher.service
```
* Add the following text to file and save

```sh
# RaspiBolt: systemd unit for JoinMarket Orderbook Watcher
# /etc/systemd/system/obwatcher.service

[Unit]
Description=JoinMarket Orderbook Watcher daemon
After=bitcoind.service

[Service]
WorkingDirectory=/home/joinmarket/joinmarket/scripts/
ExecStart=/bin/sh -c '. /home/joinmarket/joinmarket/jmvenv/bin/activate && python3 obwatch/ob-watcher.py --host=127.0.0.1'
User=joinmarket

Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target

```

* Enable and start service

```sh
$ sudo systemctl enable obwatcher

$ sudo systemctl start obwatcher
```

### Create Jam systemd service

```sh
$ sudo nano /etc/systemd/system/jam.service
```

* Add the following text to file then save and exit

```sh
# RaspiBolt: systemd unit for JoinMarket WebUI (Jam)
# /etc/systemd/system/jam.service

[Unit]
Description=JoinMarket WebUI (Jam) daemon
After=jmwalletd.service obwatcher.service

[Service]
WorkingDirectory=/home/jam/jam/
ExecStart=/usr/bin/npm start
User=jam

Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target

```

* Enable and start service

```sh
$ sudo systemctl enable jam

$ sudo systemctl start jam
```

## Visit your Jam web server

* Congratulations! You now have the Jam web interface integrated with your JoinMarket back-end on your node. Using your web browser, visit the Jam web located at `https://raspibolt.local:4020` and unlock wallet using your JoinMarket wallet password.

* Take a moment to review the [Jam cheatsheet](https://jamdocs.org/interface/00-cheatsheet/) and [FAQ](https://jamdocs.org/FAQ/) before diving in.

## Remote access via Tor Hidden Service

* Add the following three lines in the “location-hidden services” section in the `torrc` file then save and exit.

```sh
$ sudo nano /etc/tor/torrc
```

```sh
# Hidden Service Jam
HiddenServiceDir /var/lib/tor/hidden_service_jam/
HiddenServiceVersion 3
HiddenServicePort 80 127.0.0.1:4020
```

* Reload Tor configuration and get your connection address.

```sh
$ sudo systemctl reload tor
$ sudo cat /var/lib/tor/hidden_service_jam/hostname
> abcdefg..............xyz.onion
```

* With the [Tor browser](https://www.torproject.org/), you can access this onion address from any device.

## For the future: Jam update

Updating to a [new release](https://github.com/joinmarket-webui/jam/releases) is straight-forward. Make sure to read the release notes first.

* From user 'admin', stop the Jam service then switch to 'jam' user

```sh
$ sudo systemctl stop jam

$ sudo su - jam
```

* Remove the Jam directory

```sh
$ rm -rf jam
```

* Repeat installation steps in the 'Install Jam' section. Don't forget to verify the release and configure the port! 

* Finally, start the Jam service again.

```sh
$ sudo systemctl start jam
```

### Not impressed? Uninstall Jam

* Add 'admin' user, stop and remove JoinMarket/Jam services

```sh
 $ sudo systemctl stop jam.service 
 $ sudo systemctl disable jam.service 
 $ sudo rm /etc/systemd/system/jam.service

 $ sudo systemctl stop obwatcher.service 
 $ sudo systemctl disable obwatcher.service 
 $ sudo rm /etc/systemd/system/obwatcher.service

 $ sudo systemctl stop jmwalletd.service 
 $ sudo systemctl disable jmwalletd.service 
 $ sudo rm /etc/systemd/system/jmwalletd.service
 ```

* Remove Jam user

```sh
$ sudo userdel -r jam
```

* Remove Tor configuration. Comment or remove the following lines the restart Tor service.

```sh
$ sudo nano /etc/tor/torrc
```

```sh
# Hidden Service Jam
#HiddenServiceDir /var/lib/tor/hsv3/
#HiddenServiceVersion 3
#HiddenServicePort 80 127.0.0.1:4020
```

```sh
$ sudo systemctl restart tor
```

### Remove Nginx configuration

* Remove Nginx configuration for Jam

```sh
$ sudo rm /etc/nginx/streams-enabled/jam-reverse-proxy.conf
$ sudo systemctl reload nginx
```
