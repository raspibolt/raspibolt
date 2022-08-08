---
layout: default
title: Fulcrum server
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

## Bonus guide: Fulcrum server

{: .no_toc }

---

[Fulcrum](https://github.com/cculianu/Fulcrum){:target="_blank"} Fulcrum is a fast & nimble SPV server for Bitcoin Cash & Bitcoin BTC created by Calin Culianu. It can be used as an alternative to Electrs because of its performance, as we can see in Craig Raw's [comparison](https://www.sparrowwallet.com/docs/server-performance.html) of servers

Difficulty: Medium
{: .label .label-yellow }

Status: Tested v3
{: .label .label-green }

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Requirements

* Bitcoin Core
* Little over 100GB of free storage for database (external backup recommended)

---

Fulcrum is a replacement for an Electrs, these two services cannot be run at the same time (due to the same standard ports used)

## Preparations

Make sure that you have [reduced the database cache of Bitcoin Core](bitcoin-client.md#reduce-dbcache-after-full-sync)

### Install dependencies

* With user "admin", make sure that all necessary software packages are installed

```sh
$ sudo apt install libssl-dev
```

### Install zram-swap

zram-swap is necessary for the proper functioning of Fulcrum during sync process using compressed swap in memory (increase performance when memory usage is high)

* Access to admin home folder, clone the repository of Github and install zram-swap

```sh
$ cd /home/admin/
$ git clone https://github.com/foundObjects/zram-swap.git 
$ cd zram-swap && sudo ./install.sh
```

* Set following size value in zram configuration file. Save a exit
  
```sh
$ sudo nano /etc/default/zram-swap
```

```sh
#_zram_fraction="1/2" #Comment this line 
_zram_fixedsize="10G" #Uncomment and edit
```

* Add kernel parameters to make better use of zram

```sh
$ sudo nano /etc/sysctl.conf
```

* Here are the lines you’ll want to add at the end of your /etc/sysctl.conf file to make better use of zram. Save a exit

```sh
vm.vfs_cache_pressure=500
vm.swappiness=100
vm.dirty_background_ratio=1
vm.dirty_ratio=50
```

* Then apply the changes with

```sh
$ sudo sysctl --system
```

* Make sure zram was correctly installed, zram prioritized, and autoboot enabled

```sh
$ sudo cat /proc/swaps
```

Expected output:

```sh
Filename                                Type                Size           Used    Priority
/var/swap                              file                 102396         0       -2
/dev/zram0                             partition            102396         0        5
```

```sh
$ sudo systemctl status zram-swap
```

Expected output, find *enabled* label:

```sh
zram-swap.service - zram swap service
Loaded: loaded (/etc/systemd/system/zram-swap.service; enabled; vendor preset: enabled)
Active: active (exited) since Mon 2022-08-08 00:51:51 CEST; 10s ago
Process: 287452 ExecStart=/usr/local/sbin/zram-swap.sh start (code=exited, status=0/SUCCESS)
Main PID: 287452 (code=exited, status=0/SUCCESS)
CPU: 191ms

Aug 08 00:51:51 node systemd[1]: Starting zram swap service...
Aug 08 00:51:51 node zram-swap.sh[287471]: Setting up swapspace version 1, size = 4.6 GiB (4972199936 bytes)
...
```

### Configure Firewall

* Configure the firewall to allow incoming requests:

```sh
$ sudo ufw allow 50002 comment 'allow Fulcrum SSL'
```

### Configure Bitcoin Core

We need to set up settings in Bitcoin Core configuration file - add new lines if they are not present

* In `bitcoin.conf`, add the following line under `whitelist=download@127.0.0.1          # for Electrs`. Save and exit.

```sh
$ sudo nano /data/bitcoin/bitcoin.conf
```

```ini
zmqpubhashblock=tcp://0.0.0.0:8433
```

* Restart Bitcoin Core

```sh
$ sudo systemctl restart bitcoind
```

## Installation

### Download and set up Fulcrum

We have our bitcoin core configuration file set up and now we can move to next part - installation of Fulcrum

* Download the application, checksums and signature

```sh
$ cd /tmp
$ wget https://github.com/cculianu/Fulcrum/releases/download/v1.7.0/Fulcrum-1.7.0-arm64-linux.tar.gz
$ wget https://github.com/cculianu/Fulcrum/releases/download/v1.7.0/Fulcrum-1.7.0-arm64-linux.tar.gz.asc
$ wget https://github.com/cculianu/Fulcrum/releases/download/v1.7.0/Fulcrum-1.7.0-arm64-linux.tar.gz.sha256sum
```

* Get the public key from the Fulcrum developer

```sh
$ curl https://raw.githubusercontent.com/Electron-Cash/keys-n-hashes/master/pubkeys/calinkey.txt | gpg --import
```

* Verify the signature of the text file containing the checksums for the application

```sh
$ gpg --verify Fulcrum-1.7.0-arm64-linux.tar.gz.asc
> gpg: Good signature from "Calin Culianu (NilacTheGrim) <calin.culianu@gmail.com>" [unknown]
> gpg: WARNING: This key is not certified with a trusted signature!
> gpg: There is no indication that the signature belongs to the owner.
> Primary key fingerprint: D465 135F 97D0 047E 18E9  9DC3 2181 0A54 2031 C02C
```

* Verify the signed checksum against the actual checksum of your download:

```sh
$ sha256sum --check Fulcrum-1.7.0-arm64-linux.tar.gz.sha256sum
> Fulcrum-1.7.0-arm64-linux.tar.gz: OK
```

* Install Fulcrum and check the correct installation requesting the version

```sh
$ tar -xvf Fulcrum-1.7.0-arm64-linux.tar.gz
$ sudo install -m 0755 -o root -g root -t /usr/local/bin Fulcrum-1.7.0-arm64-linux/Fulcrum Fulcrum-1.7.0-arm64-linux/FulcrumAdmin 
$ ./Fulcrum --version
> Fulcrum 1.7.0 (Release 4ee413a)
compiled: gcc 7.5.0
...
```

### Data directory

Now that Fulcrum is installed, we need to configure it to run automatically on startup.

* Create the "fulcrum" service user, and add it to "bitcoin" group

```sh
$ sudo adduser --disabled-password --gecos "" fulcrum
$ sudo adduser fulcrum bitcoin
```

* Create the fulcrum data directory

```sh
$ sudo mkdir -p /data/fulcrum/fulcrum_db
$ sudo chown -R fulcrum:fulcrum /data/fulcrum/
```

* Open a "fulcrum" user session

```sh
$ sudo su - fulcrum
```

* Change to fulcrum data folder and generate cert and key files for SSL

```sh
$ cd /data/fulcrum
$ openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```

### Configuration

* Next, we have to set up our fulcrum configurations. Troubles could be found without optimizations for Raspberry Pi. Choose either one for Raspberry 4GB or 8GB depending on your hardware. Create the config file with the following content. Save a exit

```sh
$ nano /data/fulcrum/fulcrum.conf
```

```sh
# RaspiBolt: fulcrum configuration 
# /data/fulcrum/fulcrum.conf

# Bitcoin Core settings
bitcoind = 127.0.0.1:8332
rpccookie= /home/bitcoin/.bitcoin/.cookie

# Fulcrum settings
datadir = /data/fulcrum/fulcrum_db
cert = /data/fulcrum/cert.pem
key = /data/fulcrum/key.pem
ssl = 0.0.0.0:50002
peering = false
announce = false

# Optimizations for Raspberry Pi
bitcoind_timeout = 600
bitcoind_clients = 1
worker_threads = 1
deb_mem= 1024.0
db_use_fsync = true

# Use for 4GB RAM
db_max_open_files= 60
fast-sync = 1024

# Use for 8GB RAM (Comment 4GB RAM section and uncomment these lines)
#db_max_open_files= 100
#fast-sync = 2048
```

* Exit "fulcrum" user session to return to "admin" user session

```sh
$ exit
```

### Autostart on boot

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

### Run Fulcrum

```sh
$ sudo systemctl enable fulcrum.service
$ sudo systemctl start fulcrum.service
```

* We can check if everything goes right using these commands

```sh
$ sudo systemctl status fulcrum.service
$ sudo journalctl -fu fulcrum.service
```

Expected output:

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
...
```

Fulcrum will now index the whole Bitcoin blockchain so that it can provide all necessary information to wallets. With this, the wallets you use no longer need to connect to any third-party server to communicate with the Bitcoin peer-to-peer network.

DO NOT REBOOT OR STOP THE SERVICE DURING DB CREATION PROCESS. YOU MAY CORRUPT THE FILES - in case of that happening, start sync from scratch by deleting and recreating `fulcrum_db` folder.

💡 Fulcrum must first fully index the blockchain and compact its database before you can connect to it with your wallets. This can take a few hours. Only proceed with the [Desktop Wallet Section](desktop-wallet.md) once Fulcrum is ready.

💡 After the initial sync of fulcrum, if you want to still use zram, you can return to the default zram config.

* As user "admin", access to zram config again and return to default config. Save a exit
  
```sh
$ sudo nano /etc/default/zram-swap
```

```sh
_zram_fraction="1/2"   #Uncomment this line 
#_zram_fixedsize="10G" #Comment this line
```

* Then apply the changes with

```sh
$ sudo sysctl --system
```

* Make sure the change was correctly done

```sh
$ sudo cat /proc/swaps
```

Expected output:

```sh
Filename                                Type                Size           Used    Priority
/var/swap                              file                 102396         0       -2
/dev/zram0                             partition            20479          0        5
```

## Extras

### Remote access over Tor (optional)

To use your Fulcrum server when you're on the go, you can easily create a Tor hidden service.
This way, you can connect the BitBoxApp or Electrum wallet also remotely, or even share the connection details with friends and family. Note that the remote device needs to have Tor installed as well.

* Ensure that you are logged with user "admin" and add the following three lines in the section for "location-hidden services" in the torrc file. Save a exit

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

* You should now be able to connect to your Fulcrum server remotely via Tor using your hostname and port 50002

### Enable Fulcrum API connection to BTC RPC Explorer

To get address balances, either an Electrum server or an external service is necessary. Your local Fulcrum server can provide address transaction lists, balances, and more.

* Change to `btcrpcexplorer` user, enter to `btc-rpc-explorer` folder and open `.env` file

```sh
$ sudo su - btcrpcexplorer
$ cd btc-rpc-explorer
$ nano .env
```

* Add or modify the following line. Save and exit.

```sh
BTCEXP_ELECTRUM_SERVERS=tls://127.0.0.1:50002
```

* Restart BTC RPC Explorer service to apply the changes

```sh
$ sudo systemctl restart btcrpcexplorer
```

### Backup the database

Because the sync can take up to 4 days and more, it is recommended to have at least any backup of the database. It doesn't need to be the latest one and you can backup only once, it is still better to sync for a few hours instead of week (from scratch). Should be done on external drive.

## For the future: Fulcrum upgrade

* As “admin” user, stop the Fulcrum service

```sh
$ sudo systemctl stop fulcrum
```

* Download, verify and install the latest Fulcrum binaries as described in the [Fulcrum section](fulcrum.md#download-and-set-up-fulcrum) of this guide.

## After installation

### Uninstall Fulcrum

Ensure you are logged with user "admin"

* Disable fulcrum and delete "fulcrum" user

```sh
$ sudo systemctl stop fulcrum
$ sudo systemctl disable fulcrum
$ sudo userdel -rf fulcrum
```

* Delete fulcrum directory

```sh
$ sudo rm -rf /data/fulcrum/
```

### Uninstall Tor hidden service

* Comment or remove fulcrum hidden service in torrc. Save a exit

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

* Reload torrc config

```sh
$ sudo systemctl reload tor
```

### Uninstall FW configuration

* Delete firewall rule with the comment 'allow Fulcrum SSL' identifying the number of the rule

```sh
$ sudo ufw status numbered
```

```sh
Status: active

     To                         Action      From
     --                         ------      ----
[X] 50002                       ALLOW IN    Anywhere             # allow Fulcrum SSL
```

* Delete the rule with the correct number and confir with "yes"

```sh
$ sudo ufw delete X
```

### Uninstall the Zram (optional)

```sh
$ cd /home/admin/zram-swap
$ sudo ./install.sh --uninstall 
$ sudo rm /etc/default/zram-swap
$ sudo rm -rf /home/admin/zram-swap
```

* Make sure that the change was done

```sh
$ sudo cat /proc/swaps
```

Expected output:

```sh
Filename                                Type                Size           Used    Priority
/var/swap                              file                 102396         0       -2
```
