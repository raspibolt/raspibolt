---
layout: default
title: The Mempool Open Source Project
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---

## Bonus guide: The Mempool Open Source Project
{: .no_toc }

---

[Mempool](https://github.com/mempool/mempool){:target="_blank"} is a self-hosted Bitcoin blockchain and mempool visualizer/explorer. Look up your onchain transactions and estimate transaction fees without any privacy leaks.

Difficulty: Medium
{: .label .label-yellow }

Status: Tested v3
{: .label .label-green }

![Mempool](../../../images/mempool.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Requirements

* Minimum RAM: 4 GB
* Bitcoin Core
* Electrs
* Node.js v16+

---

## Preparations

### Node.js

To run Mempool, we need to run Node.js v16 or above.

* With user "admin", let's check our version of Node.js running on the node

  ```sh
  $ node -v
  > v16.13.1
  ```

* If Node.js is not installed, follow [this guide](../../bitcoin/blockchain-explorer.md#install-nodejs) to install it. If the version is v14 or older, update it following [this tutorial](https://phoenixnap.com/kb/update-node-js-version){:target="_blank"}.

### Firewall

* Configure the UFW firewall to allow incoming HTTPS requests

  ```sh
  $ sudo ufw allow 4200/tcp comment 'allow Mempool'
  $ sudo ufw status
  ```

---

## Installation

### Clone the repository

For improved security, we create the new user "mempool" that will run the Mempool explorer. Using a dedicated user limits potential damage in case there's a security vulnerability in the code. An attacker would not be able to do much within this user's permission settings.

* Create a new user, assign it to the "bitcoin" group, and open a new session

  ```sh
  $ sudo adduser --disabled-password --gecos "" mempool
  $ sudo adduser mempool bitcoin
  $ sudo su - mempool
  ```

* Download the source code directly from GitHub

  ```sh
  $ git clone https://github.com/mempool/mempool
  $ cd mempool
  $ git checkout v2.3.1
  $ exit
  ```

### MariaDB

[MariaDB](https://mariadb.org/){:target="_blank"} is an open source relational database.

* With user "admin", we update the `apt` packages index, install MariaDB on the node and check that it runs properly

  ```sh
  $ sudo apt update
  $ sudo apt install mariadb-server mariadb-client
  ```

* Generate random password for "mempool" MariaDB user. This password will be needed for one command and then in config file below. Let's call it "Password[M]".

  ```sh
  $ gpg --gen-random --armor 1 16
  > G53Lp+V7JYmo9JpVa72bGw==
  ```

* Now, open the MariaDB shell. 

  ```sh
  $ sudo mysql
  > Welcome to the MariaDB monitor.  Commands end with ; or \g.
  > [...]
  > MariaDB [(none)]>
  ```

* Enter the following commands in the shell and exit. The instructions to enter in the MariaDB shell with start with "MDB$". Change "Password[M]" to the random password generated above.

  ```sql
  MDB$ create database mempool;
  > Query OK, 1 row affected (0.001 sec)
  MDB$ grant all privileges on mempool.* to 'mempool'@'localhost' identified by 'Password[M]';
  > Query OK, 0 rows affected (0.012 sec)
  MDB$ exit
  ```

### Backend

* With user "mempool", install the backend  
  
  ```sh
  $ sudo su - mempool
  $ cd mempool/backend
  $ npm install --prod
  $ npm run build
  ```
  
* Create a sample configuration file
  
  ```sh
  $ nano mempool-config.json
  ```

* Paste the following lines. In the CORE_RPC section, replace the username and password with your username (e.g., "raspibolt") and password [B]. Change "Password[M]" to the random password generated above.


  ```sh
  {
    "MEMPOOL": {
      "NETWORK": "mainnet",
      "BACKEND": "electrum",
      "HTTP_PORT": 8999,
      "SPAWN_CLUSTER_PROCS": 0,
      "API_URL_PREFIX": "/api/v1/",
      "POLL_RATE_MS": 2000,
      "CACHE_DIR": "./cache",
      "CLEAR_PROTECTION_MINUTES": 20,
      "RECOMMENDED_FEE_PERCENTILE": 50,
      "BLOCK_WEIGHT_UNITS": 4000000,
      "INITIAL_BLOCKS_AMOUNT": 8,
      "MEMPOOL_BLOCKS_AMOUNT": 8,
      "PRICE_FEED_UPDATE_INTERVAL": 3600,
      "USE_SECOND_NODE_FOR_MINFEE": false,
      "EXTERNAL_ASSETS": [],
      "EXTERNAL_MAX_RETRY": 1,
      "EXTERNAL_RETRY_INTERVAL": 0,
      "USER_AGENT": "mempool",
      "STDOUT_LOG_MIN_PRIORITY": "debug",
      "AUTOMATIC_BLOCK_REINDEXING": false
    },
    "CORE_RPC": {
      "HOST": "127.0.0.1",
      "PORT": 8332,
      "USERNAME": "raspibolt",
      "PASSWORD": "Password[B]"
    },
    "ELECTRUM": {
      "HOST": "127.0.0.1",
      "PORT": 50002,
      "TLS_ENABLED": true
    },
    "DATABASE": {
      "ENABLED": true,
      "HOST": "127.0.0.1",
      "PORT": 3306,
      "USERNAME": "mempool",
      "PASSWORD": "Password[M]",
      "DATABASE": "mempool"
    },
    "SOCKS5PROXY": {
      "ENABLED": true,
      "HOST": "127.0.0.1",
      "PORT": 9050
    },
    "PRICE_DATA_SERVER": {
      "TOR_URL": "http://wizpriceje6q5tdrxkyiazsgu7irquiqjy2dptezqhrtu7l2qelqktid.onion/getAllMarketPrices"
    }
  }
  ```

* Start the backend to check it is working properly

  ```sh
  npm run start
  ```
  
* After a few minutes, we should see outputs like this. 

  ```sh
  > Updating mempool
  > [...]
  > Mempool updated in 0.096 seconds
  ```

* Press Ctrl+C to exit and come back to the repository root directory

  ```sh
  $ cd ~/mempool
  ```

### Frontend

* Still with user "mempool", install the frontend (it will take several minutes) and exit back to the "admin" user
  
  ```sh
  $ cd frontend
  $ npm install
  $ npm audit fix
  $ exit
  ```

* Start the frontend to check it is working properly

  ```sh
  $ npm run serve:local-prod
  ```

* After a few minutes, you should then be able to see to the site by browsing [http://raspibolt.local:4200](http://raspibolt.local:4200){:target="_blank"}

* Press Ctrl+C to exit and come back to the repository root directory

  ```sh
  $ cd ~/mempool
  ```
  
### Restrict access to configuration file

The Mempool configuration file contains the Bitcoin Core RPC username and password which are sensitive information. We'll restrict reading access to this file by user "mempool" only.

* Still with user "admin", change the ownership of the configuration file
 
  ```sh
  $ sudo chmod 600 /home/mempool/mempool/backend/mempool-config.json
  ```

### Autostart backend on boot

Now we’ll make sure Mempool's backend starts as a service on the Raspberry Pi so it’s always running. In order to do that, we create a systemd unit that starts the service on boot directly after Bitcoin Core.

* As user “admin”, create the service file

  ```sh
  $ sudo nano /etc/systemd/system/mempool-backend.service
  ```
  
* Paste the following configuration. Save and exit.  
  
  ```ini 
  # RaspiBolt: systemd unit for Mempool           
  # /etc/systemd/system/mempool-backend.service

  [Unit]
  Description=mempool
  After=bitcoind.service

  [Service]
  WorkingDirectory=/home/mempool/mempool/backend
  ExecStart=/usr/bin/node --max-old-space-size=2048 dist/index.js
  User=mempool

  # Restart on failure but no more than default times (DefaultStartLimitBurst=5) every 10 minutes (600 seconds). Otherwise stop
  Restart=on-failure
  RestartSec=600

  # Hardening measures
  PrivateTmp=true
  ProtectSystem=full
  NoNewPrivileges=true
  PrivateDevices=true

  [Install]
  WantedBy=multi-user.target
  ```

* Enable the service, start it and check log logging output.

  ```sh  
  $ sudo systemctl enable mempool-backend
  $ sudo systemctl start mempool-backend
  $ sudo journalctl -f -u mempool-backend
  ```

### Autostart frontend on boot

Now we’ll make sure Mempool's frontend starts as a service on the Raspberry Pi so it’s always running. In order to do that, we create a systemd unit that starts the service on boot directly after the Mempool backend.

* As user “admin”, create the service file

  ```sh
  $ sudo nano /etc/systemd/system/mempool-frontend.service
  ```
  
* Paste the following configuration. Save and exit.  
  
  ```ini 
  # RaspiBolt: systemd unit for Mempool           
  # /etc/systemd/system/mempool-frontend.service

  [Unit]
  Description=mempool
  After=mempool-backend.service

  [Service]
  WorkingDirectory=/home/mempool/mempool/frontend
  ExecStart=/usr/bin/npm run serve:local-prod
  User=mempool

  # Restart on failure but no more than default times (DefaultStartLimitBurst=5) every 10 minutes (600 seconds). Otherwise stop
  Restart=on-failure
  RestartSec=600

  # Hardening measures
  PrivateTmp=true
  ProtectSystem=full
  NoNewPrivileges=true
  PrivateDevices=true

  [Install]
  WantedBy=multi-user.target
  ```

* Enable the service, start it and check log logging output.

  ```sh  
  $ sudo systemctl enable mempool-frontend
  $ sudo systemctl start mempool-frontend
  $ sudo journalctl -f -u mempool-frontend
  ```

---

## Mempool in action

Point your browser to the secure access point provided by the frontend, for example [http://raspibolt.local:4200](http://raspibolt.local:4200){:target="_blank"} (or your nodes IP address, e.g. https://192.168.0.20:4200).

---

## Remote access over Tor (optional)

To expose Mempool app via a Tor hidden service (if only Tor address is used, no ports need to be opened by the firewall): 

* Edit `torrc` file 

  ```sh
  $ sudo nano /etc/tor/torrc
  ```

* and add the following entry under section `hidden services`:

  ```ini
  # Mempool Hidden Service
  HiddenServiceDir /var/lib/tor/hidden_service_mempool
  HiddenServiceVersion 3
  HiddenServicePort 443 127.0.0.1:4200
  ``` 

* Reload Tor config (sometimes a restart is needed)

  ```sh
  $ sudo systemctl reload tor
  ```

* Get onion address

  ```sh 
  $ sudo cat /var/lib/tor/hidden_service_mempool/hostname
  > afjubiu3brwo3tb34otb3......onion
  ``` 

* Open Tor browser and insert the address:

  ```http
  https://afjubiu3brwo3tb34otb3......onion
  ```

---

## Upgrade

Updating to a new release is straight-forward. Make sure to read the release notes first.

* From user “admin”, stop the service and open a “mempool” user session.

  ```sh
  $ sudo systemctl stop mempool-frontend
  $ sudo systemctl stop mempool-backend
  $ sudo su - mempool
  ```

* Fetch the latest GitHub repository information and update:

  ```sh 
  $ cd mempool
  $ git fetch
  $ latestrelease=$(curl -s https://api.github.com/repos/mempool/mempool/releases/latest|grep tag_name|head -1|cut -d '"' -f4)
  $ git checkout $latestrelease
  ```
  
* Then follow the installation process described in the [Backend section](#backend) and [Frontend section](#frontend) sections.

* Start the service again
 
  ```sh 
  $ sudo systemctl start mempool-backend
  $ sudo systemctl start mempool-frontend
  ```

* Both services can be monitored by typing either of these commands

  ```sh
  $ sudo journalctl -f -u mempool-backend
  $ sudo journalctl -f -u mempool-frontend
  ```


* Point your browser to [https://raspibolt:4200/about](https://raspibolt:4200/about){:target="_blank"} and check that the displayed version is the newest version that you just installed.

---

## Uninstall

* Stop, disable and delete the Mempool systemd service
 
  ```sh 
  $ sudo systemctl stop mempool-frontend
  $ sudo systemctl stop mempool-backend
  $ sudo systemctl disable mempool-frontend
  $ sudo systemctl disable mempool-backend
  $ sudo rm /etc/systemd/system/mempool-frontend.service
  $ sudo rm /etc/systemd/system/mempool-backend.service
  ```

* Display the UFW firewall rules and notes the numbers of the rules for Mempool (e.g., X and Y below)

  ```sh
  $ sudo ufw status numbered
  > [...]
  > [X] 4200/tcp                   ALLOW IN    Anywhere                   # allow Mempool
  > [...]
  > [Y] 4200/tcp (v6)              ALLOW IN    Anywhere (v6)              # allow Mempool
  ```

* Delete the two Mempool rules (check that the rule to be deleted is the correct one and type "y" and "Enter" when prompted)

  ```sh
  $ sudo ufw delete Y
  $ sudo ufw delete X  
  ```
  
* Remove MariaDB. When prompted, check the packages that will be removed and type "Y" and "Enter". A blue window will pop up asking if we want to remove all MariaDB databases, select `<Yes>`.

  ```sh
  $ sudo service mysql stop
  $ sudo apt-get --purge remove "mysql*"
  ```

* Delete the "mempool" user. It might take a long time as the Mempool user directory is big. Do not worry about the `userdel: mempool mail spool (/var/mail/mempool) not found`.

  ```sh
  $ sudo su -
  $ userdel -r mempool
  > userdel: mempool mail spool (/var/mail/mempool) not found
  ```

<br /><br />

---

<< Back: [+ Bitcoin](index.md)
