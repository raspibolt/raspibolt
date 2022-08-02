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

Fulcrum is a replacement for an electrs, these two services cannot be run at the same time (due to the same standard ports used)

## Installation

### Set up bitcoin

For best results, enable zmq for the "hasblock"

* Add following line to your bitcoin configuration file

  ```sh
  $ sudo nano /home/bitcoin/.bitcoin/bitcoin.conf
  ```
  
  ```sh
  # Add at the end of bitcoin.conf
  zmqpubhashblock=tcp://0.0.0.0:8433
  ```
  
### Download and set up fulcrum

We have our bitcoin core configuration file set up and now we can move to next part - installation of Fulcrum

* We will create fulcrum user and add him to bitcoin group with user "admin"

  ```sh
  $ sudo adduser --disabled-password --gecos "" fulcrum
  $ sudo adduser fulcrum bitcoin
  ```

* Create a following folders

  ```sh
  $ sudo mkdir -p /data/fulcrum/fulcrum_db
   ```
  
* Download fulcrum for raspberry pi, open and unpackage it, move all files to our fulcrum directory
 
  ```sh
  $ cd /tmp
  $ wget https://github.com/cculianu/Fulcrum/releases/download/v1.7.0/Fulcrum-1.7.0-arm64-linux.tar.gz
  $ tar xvf Fulcrum-1.7.0-arm64-linux.tar.gz
  $ sudo mv Fulcrum-1.7.0-arm64-linux/Fulcrum Fulcrum-1.7.0-arm64-linux/FulcrumAdmin /usr/local/bin
  $ sudo chown -R fulcrum:fulcrum /data/fulcrum/
  ```
  
* Switch to the “fulcrum” user, change to fulcrum data folder and generate cert and key files for SSL

  ```sh
  $ sudo su - fulcrum
  $ cd /data/fulcrum
  $ openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
  ```

* Next, we have to set up our fulcrum configurations. Troubles could be found without optimizations for raspberry pi. Choose either one for raspberry 4GB or 8GB depending on your hardware. Create the config file with the following content:

  ```sh
  $ nano /data/fulcrum/fulcrum.conf
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
Fulcrum needs to start automatically on system boot.
* As user "admin", create the Fulcrum systemd unit and copy/paste the following configuration. Save and exit.

  ```sh
  $ sudo nano /etc/systemd/system/fulcrum.service
  ```
  
  ```sh
  # RaspiBolt: systemd unit for Fulcrum
  # /etc/systemd/system/fulcrum.service
  [Unit]
  Description=Fulcrum
  Wants=bitcoind.service
  After=bitcoind.service
  StartLimitBurst=2
  StartLimitIntervalSec=20

  [Service]
  ExecStart=/usr/local/bin/Fulcrum /data/fulcrum/fulcrum.conf
  KillSignal=SIGINT
  User=fulcrum
  Type=exec
  TimeoutStopSec=300
  RestartSec=30
  Restart=on-failure

  [Install]
  WantedBy=multi-user.target
  ```
  
### Install zram-swap
zram-swap is neccesary for proper functioning of fulcrum during sync process
  
  * Ensure that you are logged with user "admin", clone and install zram-swap
  
  ```sh
  $ cd /tmp
  $ git clone https://github.com/foundObjects/zram-swap.git 
  $ cd zram-swap && sudo ./install.sh
  ```
  
  * Add kernel parameters to make better use of ZRAM

  ```sh
  $ sudo nano /etc/sysctl.conf
  ```
  
  * Here are the lines you’ll want to add at the end of your /etc/sysctl.conf file:

  ```sh
  vm.vfs_cache_pressure=500
  vm.swappiness=100
  vm.dirty_background_ratio=1
  vm.dirty_ratio=50
  ```
  
  * Then reboot, or enable with:

  ```sh
  $ sudo sysctl --system
  ```
  
  * Make sure everything works fine
  
  ```sh
  $ sudo cat /proc/swaps
  ```
  
  ```sh
  Filename                                Type                Size           Used    Priority
  /var/swap                              file                 102396         0       -2
  /dev/zram0                             partition           4899744         0        5
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

### To remove the zram (optional)

* Exit of "fulcrum" user and ensure you are logged with user "admin":

  ```sh
  $ exit
  $ cd /tmp/zram-swap
  $ sudo ./install --uninstall 
  $ sudo rm /etc/default/zram-swap
  ```

### Remote access over Tor (optional)
To use your Fulcrum server when you're on the go, you can easily create a Tor hidden service.
This way, you can connect the BitBoxApp or Electrum wallet also remotely, or even share the connection details with 
friends and family.
Note that the remote device needs to have Tor installed as well.

* Ensure that you are logged with user "admin" and add the following three lines in the section for "location-hidden services" in the torrc file.

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
