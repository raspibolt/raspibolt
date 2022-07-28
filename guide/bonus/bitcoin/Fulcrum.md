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
* Little over 100GB of free storage for database (external backup recommended)

---

## Installation

### Download and set up fulcrum

We have our bitcoin core configuration file set up and now we can move to next part - installation of Fulcrum

* We will create fulcrum user and add him to bitcoin group with user "admin"

  ```sh
  $ sudo adduser --disabled-password --gecos "" fulcrum
  $ sudo adduser fulcrum bitcoin
  ```

* Create a following folders

  ```sh
  $ sudo mkdir /data/fulcrum
  $ sudo mkdir /data/fulcrum/fulcrum_db
   ```
  
* Download fulcrum for raspberry pi, open and unpackage it, move all files to our fulcrum directory
 
  ```sh
  $ cd /tmp
  $ wget https://github.com/cculianu/Fulcrum/releases/download/v1.7.0/Fulcrum-1.7.0-arm64-linux.tar.gz
  $ tar xvf Fulcrum-1.7.0-arm64-linux.tar.gz
  $ sudo mv Fulcrum-1.7.0-arm64-linux/* /data/fulcrum
  $ sudo chown -R fulcrum:fulcrum /data/fulcrum/
  ```

  ```sh
  $ cd /data/fulcrum
  $ sudo mv fulcrum-example-config.conf fulcrum.conf
  $ ls
  ```
  
* Switch to the “fulcrum” user, change to fulcrum data folder and generate cert and key files for SSL

  ```sh
  $ sudo su - fulcrum
  $ cd /data/fulcrum
  $ openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
  ```

* Next, we have to set up our fulcrum configurations. Troubles could be found without optimizations for raspberry pi. Choose either one for raspberry 4GB or 8GB depending on your hardware. Create the config file with the following content:

  ```sh
  $ sudo nano /data/fulcrum/fulcrum.conf
  ```
  
  ```sh
  # RaspiBolt: fulcrum configuration 
  # /data/fulcrum/fulcrum.conf
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
  deb_mem=1024.0
  db_max_open_files=60
  fast-sync = 1024
  
  # for 8GB RAM
  #db_max_open_files=100
  #fast-sync = 2048
  ```
  
  ```sh
  $ exit
  ```
  
* As user "admin", configure the firewall to allow incoming requests:

  ```sh
  $ sudo ufw allow 50002/tcp comment 'allow Fulcrum SSL'
  ```
  
## Autostart on boot
Electrs needs to start automatically on system boot.
* As user "admin", create the Fulcrum systemd unit and copy/paste the following configuration. Save and exit.

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
  
### Install zram-swap
zram-swap is neccesary for proper functioning of fulcrum during sync process
  
  * Clone and install zram-swap
  
  ```sh
  $ git clone https://github.com/foundObjects/zram-swap.git 
  $ cd zram-swap && sudo ./install.sh
  ```
  
  * Set following values in zram configuration file
  
  ```sh
  $ sudo nano /etc/default/zram-swap
  ```
  
  ```sh
  # override fractional calculations and specify a fixed swap size 
  _zram_fixedsize="6G"
 
  # compression algorithm to employ (lzo, lz4, zstd, lzo-rle) 
  _zram_algorithm="lz4"
  ```
  
  ```sh
  $ systemctl restart zram-swap.service
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
  
  ```sh
  -- Journal begins at Mon 2022-04-04 16:41:41 CEST. --
  Jul 28 12:20:13 rasp Fulcrum[181811]: [2022-07-28 12:20:13.063] simdjson: version 0.6.0
  Jul 28 12:20:13 rasp Fulcrum[181811]: [2022-07-28 12:20:13.063] ssl: OpenSSL 1.1.1n  15 Mar 2022
  Jul 28 12:20:13 rasp Fulcrum[181811]: [2022-07-28 12:20:13.063] zmq: libzmq version: 4.3.3, cppzmq version: 4.7.1
  Jul 28 12:20:13 rasp Fulcrum[181811]: [2022-07-28 12:20:13.064] Fulcrum 1.7.0 (Release 4ee413a) - Thu Jul 28, 2022 12:20:13.064 CEST - starting up ...
  Jul 28 12:20:13 rasp Fulcrum[181811]: [2022-07-28 12:20:13.064] Max open files: 524288 (increased from default: 1024)
  Jul 28 12:20:13 rasp Fulcrum[181811]: [2022-07-28 12:20:13.065] Loading database ...
  Jul 28 12:20:14 rasp Fulcrum[181811]: [2022-07-28 12:20:14.489] DB memory: 512.00 MiB
  Jul 28 12:20:14 rasp Fulcrum[181811]: [2022-07-28 12:20:14.491] Coin: BTC
  Jul 28 12:20:14 rasp Fulcrum[181811]: [2022-07-28 12:20:14.492] Chain: main
  Jul 28 12:20:14 rasp Fulcrum[181811]: [2022-07-28 12:20:14.494] Verifying headers ...
  Jul 28 12:20:19 rasp Fulcrum[181811]: [2022-07-28 12:20:19.780] Initializing header merkle cache ...
  Jul 28 12:20:21 rasp Fulcrum[181811]: [2022-07-28 12:20:21.643] Checking tx counts ...
  ```
  
  DO NOT REBOOT OR STOP THE SERVICE DURING DB CREATION PROCESS. YOU MAY CORRUPT THE FILES -
  in case of that happening, start sync from scratch by deleting and recreating fulcrum_db file.
  
## After Installation

Continue after fulcrum db sync is finished 

### Set swapfile to defaults
 
* Set swapfile to defaults after finishing db sync - it will then be created dynamically, comment following lines

  ```sh
  $ sudo nano /etc/dphys-swapfile
  ```
  
  ```sh
  #CONF_SWAPSIZE=10000
  #CONF_MAXSWAP=10000
  ```
  
  ```sh
  $ sudo dphys-swapfile install
  $ sudo systemctl restart dphys-swapfile.service
  ```

### Remote access over Tor (optional)
To use your Fulcrum server when you're on the go, you can easily create a Tor hidden service.
This way, you can connect the BitBoxApp or Electrum wallet also remotely, or even share the connection details with 
friends and family.
Note that the remote device needs to have Tor installed as well.

* Add the following three lines in the section for "location-hidden services" in the `torrc` file.

 ```sh
  $ sudo nano /etc/tor/torrc
 ```
 
* Edit torrc

 ```sh
 ############### This section is just for location-hidden services ###
 # Hidden Service Fulcrum SSL
 HiddenServiceDir /var/lib/tor/hidden_service_fulcrum/
 HiddenServiceVersion 3
 HiddenServicePort 50002 127.0.0.1:50002
 ```
 
* Reload Tor configuration and get your connection address.

 ```sh
 $ sudo systemctl reload tor
 $ sudo cat /var/lib/tor/hidden_service_fulcrum/hostname
 > abcdefg..............xyz.onion
 ```
 
 * You should now be able to connect to your fulcrum server remotely via Tor using your hostname and port 50002

### Backup the database

Because the sync can take up to 5 days and more, it is recommended to have at least any backup of the database. It doesn't need to be the latest one and you can backup only once, it is still better to sync for a few hours instead of week (from scratch). Should be done on external drive.

## Uninstall Fulcrum

* Disable fulcrum and delete "fulcrum" user

 ```sh
 $ sudo systemctl stop fulcrum
 $ sudo systemctl disable fulcrum
 $ sudo userdel -rf fulcrum
 ```

* Comment or remove fulcrum settings in torrc 

 ```sh
 $ sudo nano /etc/tor/torrc
 ```

 ```sh
 ############### This section is just for location-hidden services ###
  # Hidden Service Fulcrum SSL
 #HiddenServiceDir /var/lib/tor/hidden_service_fulcrum/
 #HiddenServiceVersion 3
 #HiddenServicePort 50002 127.0.0.1:50002
 ```
 
 * Close SSL port on firewall
 
 ```sh
 $ sudo ufw deny 50002
 ```
 
 * Delete fulcrum directory
 
 ```sh
 $ sudo rm -rf /data/fulcrum/
 ```
