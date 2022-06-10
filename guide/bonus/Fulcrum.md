---
layout: default
title: Fulcrum server
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---

## Bonus guide: Fulcrum server
{: .no_toc }

---

[Fulcrum](https://github.com/cculianu/Fulcrum){:target="_blank"} Fulcrum is a fast & nimble SPV server for Bitcoin Cash & Bitcoin BTC. Created by Calin Culianu (calin.culianu@gmail.com). It can be used as an alternative to an electrum server because of its performance, as we can see in Craig Raw's comparison of servers:
https://www.sparrowwallet.com/docs/server-performance.html

Difficulty: Medium
{: .label .label-yellow }

Status: Tested v3
{: .label .label-red }

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---


## Requirements
* Bitcoin
* nginx
* Little over 100GB of free storage for fulcrum database

---

## Preparations

### Bitcoin Core

I suggest that Bitcoin Core is already synced and "txindex=1" has been set in bitcoin.conf. If not, please add that configuration into the bitcoin.conf file and wait ~ 7 hours for it to sync, as it is a neccesary requirement for Fulcrum to work, along with pruning not being active.

* First we need to set up settings in Bitcoin Core configuration file

  ```sh
  $ sudo nano /home/bitcoin/.bitcoin/bitcoin.conf
  ```
  
* Make sure you have following configuration in your config file

  ```sh
  ### BTC DAEMON
  txindex=1
  server=1
  daemon=1 
  
  ### RPC
  rpcuser=bitcoin
  rpcpassword=Password_B
  rpcport=8332
  rpcbind=127.0.0.1
  rpcallowip=127.0.0.1
  rpcallowip=0.0.0.0/0
  
  ### REST
  whitelist=download@127.0.0.1
  zmqpubhashblock=tcp://0.0.0.0:28334
  ```
  
  ```sh
  $ sudo ufw allow 8332
  ```
  
  ```sh
  $ sudo systemctl restart bitcoind
  ```
  
## Installation

### Download and set up fulcrum

We have our bitcoin core configuration file set up and now we can move to next part - installation of Fulcrum

* Create a following folders

  ```sh
  $ sudo mkdir /data/fulcrum
  $ sudo mkdir /data/fulcrum/fulcrum_db
  $ sudo chown bitcoin:bitcoin /data/fulcrum/*
   ```
  
* Download fulcrum for raspberry pi, open and unpackage it, move all files to our fulcrum directory
 
  ```sh
  $ cd /tmp
  $ wget https://github.com/cculianu/Fulcrum/releases/download/v1.6.0/Fulcrum-1.6.0-arm64-linux.tar.gz
  $ tar xvf Fulcrum-1.6.0-arm64-linux.tar.gz
  $ sudo mv Fulcrum-1.6.0-arm64-linux/* /data/fulcrum
  ```

* We can see that several files have been created, we will focus on "fulcrum-example-config.conf"

  ```sh
  $ cd /data/fulcrum
  $ ls
  ```
  
* First, we rename the example conf file to "fulcrum.conf"
  ```sh
  $ cd /data/fulcrum
  $ sudo mv fulcrum-example-config.conf fulcrum.conf
  $ ls
  ```

* Next, we have to set up our fulcrum configurations. Delete all white lines you can find and copy these, we will put them all together as its easier to work with. I have found troubles without optimizations for raspberry pi. Choose either one for raspberry 4GB or 8GB depending on your hardware.

  ```sh
  $ sudo nano /data/fulcrum/fulcrum.conf
  ```
  
  ```sh
  # FULCRUM SET UP
  datadir = /data/fulcrum/fulcrum_db
  bitcoind = 127.0.0.1:8332
  rpcuser = bitcoin
  rpcpassword = Password_B
  tcp = 0.0.0.0:50001
  peering = false
  announce = false

  # Optimization for raspberry pi 4B
  bitcoind_timeout = 600
  bitcoind_clients = 1
  worker_threads = 1
  db_mem=1024
  db_max_open_files=200
  fast-sync = 1024
  
  # for 8GB RAM
  #db_max_open_files=500
  #fast-sync = 2048
  ```
  
* Now we have configured our conf file for fulcrum, however we need to set up fulcrum to start automatically by creating fulcrum service and set up configuration file

  ```sh
  $ sudo nano /etc/systemd/system/fulcrum.service
  ```
  
  ```sh
  [Unit]
  Description=Fulcrum
  Wants=bitcoind.service
  After=bitcoind.service
  StartLimitBurst=2
  StartLimitIntervalSec=20

  [Service]
  ExecStart=/data/fulcrum/Fulcrum /data/fulcrum/fulcrum.conf
  KillSignal=SIGINT
  User=bitcoin
  Type=exec
  TimeoutStopSec=300
  RestartSec=5
  Restart=on-failure

  [Install]
  WantedBy=multi-user.target
  ```
  
* If you are booting from SD card, you wont be able to execute from SSD as it is not permitted. You will achieve that deleting "noexec" line in fstab file, add permissions to the folders if you will encouner errors later during start of fulcrum
  
  ```sh
  $ sudo nano /etc/fstab
  ```
  
### Increase swapfile
  
* Increase size of a swapfile to at least 10GB space - fulcrum crashes without it being in place. Uncomment and edit following lines
  
  ```sh
  $ sudo nano /etc/dphys-swapfile
  ```
  
  ```sh
  CONF_SWAPSIZE=10000
  CONF_MAXSWAP=10000
  ```
  
  ```sh
  $ sudo dphys-swapfile install
  $ sudo systemctl restart dphys-swapfile.service
  ```
  
### Start fulcrum

  ```sh
  $ sudo systemctl enable fulcrum.service
  $ sudo systemctl start fulcrum.service
  ```

* We can check if everything goes right using these commands

  ```sh
  $ sudo systemctl status fulcrum.service
  $ sudo journalctl -fu fulcrum.service
  ```
  
* Other lines worth mentioning, they explain themselves - use in need of restart or stopping the service

  ```sh
  $ sudo systemctl restart fulcrum.service
  $ sudo systemctl stop fulcrum.service
  ```
  
  DO NOT REBOOT OR STOP THE SERVICE DURING DB CREATION PROCESS. YOU MAY CORRUPT THE FILES.
  in case of that happening, start sync from scratch:
  
  ```sh
  $ sudo systemctl stop fulcrum.service
  $ sudo rm -r /data/fulcrum/fulcrum_db; sudo mkdir /data/fulcrum/fulcrum_db
  $ sudo systemctl restart fulcrum.service
  ```
  
* Allow ports TCP:

  ```sh
  $ sudo ufw allow 50001
  ```
 
* Set swapfile to defaults after finishing db sync - it will then be created dynamically

  ```sh
  $ sudo nano /etc/dphys-swapfile
  ```
  
  ```sh
  #CONF_SWAPSIZE=10000
  CONF_MAXSWAP=2000
  ```
  
  ```sh
  $ sudo dphys-swapfile install
  $ sudo systemctl restart dphys-swapfile.service
  ```

### Create tor hidden service

 ```sh
  $ sudo nano /etc/tor/torrc
 ```
 
 * Edit torrc

 ```sh
 ### Fulcrum ###
HiddenServiceDir /var/lib/tor/hidden_service_fulcrum/
HiddenServiceVersion 3
HiddenServicePort 50001 127.0.0.1:50001
 ```
 ```sh
 $ sudo systemctl reload tor
 ```
 
 * Print your hostname and save it
 
 ```sh
 $ sudo cat /var/lib/tor/hidden_service_fulcrum/hostname
 xyz... .onion
 ```
 
 * Go to fulcrum.conf
 
 ```sh
  $ sudo nano /data/fulcrum/fulcrum.conf
 ```
 
 * Add following lines
 
 ```sh
 ### TOR
 tor_hostname=xyz... .onion
 tor_tcp_port=50001
 ```
 ```sh
 $ sudo systemctl restart fulcrum.service
 ```
 * You should now be able to connect to your fulcrum server remotely via Tor using your hostname and port 50001
