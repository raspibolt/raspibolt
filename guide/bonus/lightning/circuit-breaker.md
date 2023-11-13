---
layout: default
title: Circuit Breaker
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

# Bonus guide: Circuit Breaker, a lightning 'firewall'
{: .no_toc }

---

[Circuit Breaker](https://github.com/lightningequipment/circuitbreaker){:target="_blank"} protects your node from being flooded with HTLCs in what is known as a [griefing attack](https://bitcoinmagazine.com/technical/good-griefing-a-lingering-vulnerability-on-lightning-network-that-still-needs-fixing){:target="_blank"}.

Difficulty: Easy
{: .label .label-green }

Status: Tested v3
{: .label .label-green }

![circuit-breaker-tweet](../../../images/circuit-breaker-tweet.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Requirements

* LND v0.15.4+
* Go v1.19+

---

## Firewall & Reverse Proxy

* Configure firewall to allow incoming HTTP requests from your local network to the web server.

  ```sh
  $ sudo ufw allow 4005 comment 'allow CircuitBreaker SSL'
  ```

* Enable NGINX reverse proxy to route external encrypted HTTPS traffic internally to Thunderhub

  ```sh
  $ sudo nano /etc/nginx/streams-enabled/circuitbreaker-reverse-proxy.conf
  ```

  ```nginx
  upstream circuitbreaker {
    server 127.0.0.1:9235;
  }
  server {
    listen 4005 ssl;
    proxy_pass circuitbreaker;
  }
  ```

* Test and reload NGINX configuration
  
  ```sh
  $ sudo nginx -t
  $ sudo systemctl reload nginx
  ```
  
---

## Install Go

* To [install Go](../raspberry-pi/go.md#install-go) follow the instructions provided in the bonus guide.

---
  
## Install Circuit Breaker

* Create a new user "circuitbreaker" and make it part of the "lnd" group

  ```sh
  $ sudo adduser --disabled-password --gecos "" circuitbreaker
  $ sudo adduser circuitbreaker lnd
  ```
 
* With user "circuitbreaker", create a symbolic link to the `lnd` directory, in order for `circuitbreaker` to be allowed to interact with `lnd`

  ```sh
  $ sudo su - circuitbreaker
  $ ln -s /data/lnd /home/circuitbreaker/.lnd
  ```

* Clone the project and install it 
 
  ```sh
  $ git clone https://github.com/lightningequipment/circuitbreaker.git
  $ cd circuitbreaker
  $ go install
  $ go build
  ``` 
 
* Make Circuit Breaker executable without having to provide the full path to the Go binary directory

  ```sh 
  $ echo 'export PATH=$PATH:/home/circuitbreaker/go/bin' >> /home/circuitbreaker/.bashrc
  $ source /home/circuitbreaker/.bashrc
  ```

---

## Configuration

To access CircuitBreaker's configuration, go to its webinterface at https://raspibolt.local:4005. Before that, please read some basics about the operating modes Circuitbreaker provides: [https://github.com/lightningequipment/circuitbreaker#operating-modes](https://github.com/lightningequipment/circuitbreaker#operating-modes)

---

## First run

* Still with user "circuitbreaker", test if the program works by displaying the help

  ```sh
  $ cd ~/
  $ circuitbreaker --help
  > NAME:
  > circuitbreakerd - A new cli application
  > [...]
  ```

* Finally, launch `circuitbreaker`
  
  ```sh 
  $ circuitbreaker --httplisten=0.0.0.0:9235
  > INFO	Circuit Breaker starting	{"version": "development"}
  > INFO	Opening database	{"path": "/home/circuitbreaker/.circuitbreaker/circuitbreaker.db"}
  > INFO	Applied migrations	{"count": 1}
  > INFO	Press ctrl-c to exit
  > INFO	HTTP server starting	{"listenAddress": "0.0.0.0:9235"}
  > INFO	Grpc server starting	{"listenAddress": "127.0.0.1:9234"}
  > INFO	CircuitBreaker started
  > INFO	Connected to lnd node ...
  > INFO	Interceptor/notification handlers registered
  ```
 
 *  Stop `circuitbreaker` with Ctrl+C

---
 
## Autostart on boot

* Exit the "circuitbreaker" user session back to "admin"

  ```sh
  $ exit
  ```

* Create a circuitbreaker systemd service unit with the following content, save and exit 
 
  ```sh
  $ sudo nano /etc/systemd/system/circuitbreaker.service
  ```
  
  ```ini
  # RaspiBolt: systemd unit for circuitbreaker
  # /etc/systemd/system/circuitbreaker.service

  [Unit]
  Description=Circuit Breaker
  After=lnd.service

  [Service]
  
  # Service execution
  ###################

  WorkingDirectory=/home/circuitbreaker/circuitbreaker
  ExecStart=/home/circuitbreaker/go/bin/circuitbreaker --httplisten=0.0.0.0:9235
  User=circuitbreaker
  Group=circuitbreaker
  
  # Process management
  ####################
  
  Type=simple
  KillMode=process
  TimeoutSec=60
  Restart=always
  RestartSec=60
  
  [Install]
  WantedBy=multi-user.target
  ```
  
* Enable and start the service and check that the status is `active`

  ```sh
  $ sudo systemctl enable circuitbreaker
  $ sudo systemctl start circuitbreaker
  $ systemctl status circuitbreaker
  > circuitbreaker.service - Circuit Breaker, a lightning firewall
  > Loaded: loaded (/etc/systemd/system/circuitbreaker.service; enabled; vendor preset: enabled)
  > Active: active (running) since Sat 2021-10-30 16:53:04 BST; 6s ago
  > [...]
  ```

* Circuit Breaker is now running in the background. To check the live logging output, use the following command

  ```sh
  $ sudo journalctl -f -u circuitbreaker
  ```

---

## Upgrade

Updating to a new release should be straight-forward, but make sure to check out the [release notes](https://github.com/lightningequipment/circuitbreaker/tags){:target="_blank"} first.

* From user "admin", stop the service and open a "circuitbreaker" user session

  ```sh
  $ sudo systemctl stop circuitbreaker
  $ sudo su - circuitbreaker
  ```
  
* Fetch the latest GitHub repository information and check out the new release
 
  ```sh
  $ cd ~/circuitbreaker
  $ git fetch
  $ git checkout master
  $ go install
  $ go build
  $ exit
  ```
  
* Start the service again

  ```sh
  $ sudo systemctl start circuitbreaker
  ```

---

## Uninstall

If you want to uninstall circuitbreaker

* With the "root" user, delete the "circuitbreaker" user

  ```sh
  $ userdel -r circuitbreaker
  ```

<br /><br />

---

<< Back: [+ Lightning](index.md)
