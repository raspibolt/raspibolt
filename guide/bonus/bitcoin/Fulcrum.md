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
* Little over 100GB of free storage for database and the same amount for backup (same or different disk)

---

## Preparations

### Bitcoin Core

* First we need to set up settings in Bitcoin Core configuration file. 
* We will be using rpccookie for authentication, therefore it is neccesary to remove or comment #rpcauth and #rpcpassword!! If you are using other services using bitcoin core, you must authenticate using rpcauth!

  ```sh
  $ sudo nano /home/bitcoin/.bitcoin/bitcoin.conf
  ```
  
* Make sure you have following lines in your config file

  ```sh
  ### RPC
  #rpcuser must be commented!
  #rpcpassword must be commented!
  rpcport=8332
  
  ### For Fulcrum/Electrs
  whitelist=download@127.0.0.1
  ```
  
  ```sh
  $ sudo systemctl restart bitcoind
  ```
  
## Installation

### Download and set up fulcrum

We have our bitcoin core configuration file set up and now we can move to next part - installation of Fulcrum

* We will create fulcrum user and add him to bitcoin group
  ```sh
  $ sudo adduser --disabled-password --gecos "" fulcrum
  $ sudo adduser fulcrum bitcoin
  ```

* Create a following folders

  ```sh
  $ sudo mkdir /data/fulcrum
  $ sudo mkdir /data/fulcrum/fulcrum_db
  $ sudo mkdir /data/fulcrum/fulcrum_db_backup/
  $ sudo chown -R fulcrum:fulcrum /data/fulcrum/
   ```
  
* Download fulcrum for raspberry pi, open and unpackage it, move all files to our fulcrum directory
 
  ```sh
  $ cd /tmp
  $ wget https://github.com/cculianu/Fulcrum/releases/download/v1.7.0/Fulcrum-1.7.0-arm64-linux.tar.gz
  $ tar xvf Fulcrum-1.7.0-arm64-linux.tar.gz
  $ sudo mv Fulcrum-1.7.0-arm64-linux/* /data/fulcrum
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
  
* Generate cert and key files for SSL
  ```sh
  $ cd /data/fulcrum
  $ openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
  ```

* Next, we have to set up our fulcrum configurations. Delete all white lines you can find and copy these, we will put them all together as it is easier to work with. I have found troubles without optimizations for raspberry pi. Choose either one for raspberry 4GB or 8GB depending on your hardware.

  ```sh
  $ sudo nano /data/fulcrum/fulcrum.conf
  ```
  
  ```sh
  # FULCRUM SET UP
  datadir = /data/fulcrum/fulcrum_db
  bitcoind = 127.0.0.1:8332
  rpccookie=/home/bitcoin/.bitcoin/.cookie
  cert = /data/fulcrum/cert.pem
  key = /data/fulcrum/key.pem
  ssl = 0.0.0.0:50002
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
  
* Allow port SSL:

  ```sh
  $ sudo ufw allow 50002
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
  User=fulcrum
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
  
  DO NOT REBOOT OR STOP THE SERVICE DURING DB CREATION PROCESS. YOU MAY CORRUPT THE FILES -
  in case of that happening, start sync from scratch using troubleshooting guide below.
  
## After Installation

Continue after fulcrum db sync is finished 

### Set swapfile to defaults
 
* Set swapfile to defaults after finishing db sync - it will then be created dynamically

  ```sh
  $ sudo nano /etc/dphys-swapfile
  ```
  
  ```sh
  #CONF_SWAPSIZE=10000
  CONF_MAXSWAP=2000 #Desired maximal size of swapfile - depends on your system (recommended: 2GB - 2x RAM, 4GB - 1x RAM, 8GB - 0.5x RAM)
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
 HiddenServicePort 50002 127.0.0.1:50002
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
 tor_ssl_port=50002
 ```
 
 ```sh
 $ sudo systemctl restart fulcrum.service
 ```
 
 * You should now be able to connect to your fulcrum server remotely via Tor using your hostname and port 50002

### Backup the database

Because the sync can take up to 5 days and more, it is important to have at least any backup of the database. It doesnt need to be the latest one and you can backup only once, it is still better to sync for a few hours instead of week (from scratch)

 ```sh
 $ sudo systemctl stop fulcrum.service
 $ sudo cp /data/fulcrum/fulcrum_db/* /data/fulcrum/fulcrum_db_backup/
 ```
 
 * Process can take up to an hour, do not interrupt until it is done. Restart fulcrum when it is done.

 ```sh
 $ sudo systemctl restart fulcrum.service
 ```
 
---

## Troubleshooting

---

### Corrupting a database during initial sync

* If you corrupted the fulcrum database during initial sync (power outage, hard kill) you need to start from the scratch

  ```sh
  $ sudo systemctl stop fulcrum.service
  $ sudo rm -r /data/fulcrum/fulcrum_db; sudo mkdir /data/fulcrum/fulcrum_db
  $ sudo chown -R fulcrum:fulcrum /data/fulcrum/*
  $ sudo systemctl restart fulcrum.service
  ```
  
### Corrupting a database after the finishning initial sync 

* If you corrupted the fulcrum database after initial sync, copy your fulcrum database backup into db file 

  ```sh
  $ sudo systemctl stop fulcrum.service
  $ sudo rm -r /data/fulcrum/fulcrum_db/*
  $ sudo cp /data/fulcrum/fulcrum_db_backup/* /data/fulcrum/fulcrum_db/
  $ sudo systemctl restart fulcrum.service
  ```
