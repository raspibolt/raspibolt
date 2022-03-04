---
layout: default
title: Bitcoin Minds
parent: + Resources
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---

## Bonus guide: Bitcoin Minds
{: .no_toc }

---

[Bitcoin Minds](https://github.com/raulcano/bitcoinmindst){:target="_blank"} is a comprehensive and regularly updatd list of online Bitcoin and Lightning resources. The website can be self-hosted on our node.

Difficulty: Simple
{: .label .label-green }

Status: Tested v3
{: .label .label-green }

![Bitcoin Minds](../../../images/bitcoinminds.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Introduction

Bitcoin Minds is a simple [Bootstrap Vue](https://bootstrap-vue.org/){:target="_blank"} web interface built from a single CSV file that contain the metadata about the external Bitcoin resources (e.g., articles, books, podcasts, etc.).

---

## Requirements

* Node.js
* nginx

---

## Preparations

### Node.js

To build Bitcoin Minds, we need Node.js.

* With user "admin", let's check our version of Node.js running on the node

  ```sh
  $ node -v
  > v16.14.0
  ```

* If Node.js is not installed, follow [this guide](../../bitcoin/blockchain-explorer.md#install-nodejs) to install it.

### Firewall & reverse proxy

In the [Security section](../../raspberry-pi/security.md#prepare-nginx-reverse-proxy), we set up NGINX as a reverse proxy.
Now we can add the Bitcoin Minds configuration.

* Enable NGINX reverse proxy to route external encrypted HTTPS traffic internally to the Bitcoin Minds server.

  ```sh
  $ sudo nano /etc/nginx/streams-enabled/bitcoinminds-reverse-proxy.conf
  ```

  ```nginx
  upstream bitcoinminds {
    server 127.0.0.1:8082;
  }
  server {
    listen 8083 ssl;
    proxy_pass bitcoinminds;
  }
  ```

* Test and reload NGINX configuration

  ```sh
  $ sudo nginx -t
  $ sudo systemctl reload nginx
  ```

* Configure the firewall to allow incoming HTTPS requests

  ```sh
  $ sudo ufw allow 8083/tcp comment 'allow Bitcoin Minds SSL'
  $ sudo ufw status
  ```

---

## Bitcoin Minds

### Installation

For improved security, we create the new user "bitcoinminds". 
Using a dedicated user limits potential damage in case there's a security vulnerability in the code.
An attacker would not be able to do much within this user's permission settings.

* Create a new user and open a new session

  ```sh
  $ sudo adduser --disabled-password --gecos "" bitcoinminds
  $ sudo su - bitcoinminds
  ```

* Download the source code directly from GitHub and install all the packages using the Node Package Manager (NPM).

  ```sh
  $ git clone https://github.com/raulcano/bitcoinminds.git
  $ cd bitcoinminds/bitcoinminds-ui
  $ npm install
  ```

### First start

Test starting the explorer manually first to make sure it works.

* Still with user "bitcoinminds", start the server

  ```sh
  $ cd ~/bitcoinminds/bitcoinminds-ui
  $ npm run serve
  ```

Now point your browser to the secure access point provided by the NGINX web proxy, for example <https://raspibolt.local:8083> (or your nodes IP address like <https://192.168.0.20:8083>).

Your browser will display a warning because we use a self-signed SSL certificate.
We can do nothing about that because we would need a proper domain name (e.g., https://yournode.com) to get an official certificate that browsers recognize.
Click on "Advanced" and proceed to the Block Explorer web interface.

* Stop Bitcoin Minds in the terminal with `Ctrl`-`C` and exit the "bitcoinminds" user session.

  ```sh
  $ exit
  ```

### Autostart on boot

Now we'll make sure our Bitcoin Minds server starts as a service on the Raspberry Pi so that it's always running.
In order to do that, we create a systemd unit that starts the service on boot.

* As user "admin", create the service file

  ```sh
  $ sudo nano /etc/systemd/system/bitcoinminds.service
  ```

* Paste the following configuration. Save and exit

  ```sh
  # RaspiBolt: systemd unit for Bitcoin Minds
  # /etc/systemd/system/bitcoinminds.service

  [Unit]
  Description=Bitcoin Minds
  After=network.target

  [Service]
  WorkingDirectory=/home/bitcoinminds/bitcoinminds/bitcoinminds-ui
  ExecStart=/usr/bin/npm run serve
  User=bitcoinminds

  Restart=always
  RestartSec=30

  [Install]
  WantedBy=multi-user.target
  ```

* Enable the service, start it and check the log output

  ```sh
  $ sudo systemctl enable bitcoinminds.service
  $ sudo systemctl start bitcoinminds.service
  $ sudo journalctl -f -u bitcoinminds
  ```

* You can now access your own Bitcoin Minds website from within your local network by browsing to <https://raspibolt.local:8083>{:target="_blank"} (or your equivalent IP address).

---

## For the future: Bitcoin Minds update

Once in a while, update the program to include all the resources added to the project since you installed it or last updated it.

* From user "admin", stop the service and open a "bitcoinminds" user session.

  ```sh
  $ sudo systemctl stop bitcoinminds
  $ sudo su - bitcoinminds
  ```

* Fetch the latest GitHub repository information and update:

  ```sh
  $ cd ~/bitcoinminds
  $ git pull
  $ cd bitcoinminds-ui
  $ npm install
  $ exit
  ```

* Start the service again.

  ```sh
  $ sudo systemctl start bitcoinminds
  ```

---

## Uninstall

If you want to uninstall Bitcoin Minds

* Stop the systemd service and remove it

  ```sh
  $ sudo systemctl stop bitcoinminds
  $ sudo systemctl disable bitcoinminds
  $ sudo rm /etc/systemd/system/bitcoinminds.service
  ```

* Log in with the “admin” user and delete the "bitcoinminds" user. This also removes all files of that user.
  ```sh
  $ sudo userdel -r bitcoinminds
  ```

* Delete the Bitcoin Minds nginx reverse proxy configuration file. Test and reload nginx. 

  ```sh
  $ sudo rm /etc/nginx/streams-enabled/bitcoinminds-reverse-proxy.conf
  $ sudo nginx -t
  $ sudo systemctl reload nginx
  ```

* Display the UFW firewall rules with numbers and identofy the two rules allowing port 8083 for Bitcoin Minds (e.g. below, X and Y)

  ```sh
  $ sudo status numbered
  > [...]
  > [X] 8083/tcp                   ALLOW IN    Anywhere                   # allow Bitcoin Minds SSL
  > [...]
  > [Y] 8083/tcp (v6)              ALLOW IN    Anywhere (v6)              # allow Bitcoin Minds SSL
  ```

* Delete the two rules using their numbers, starting with the highest number first. When prompted, check that the rule to be deleted is the required one and press "y" and "Enter".

  ```sh
  $ sudo ufw delete Y
  $ sudo ufw delete X
  $ sudo ufw status
  ```

<br /><br />

---

<< Back: [+ Resources](index.md)