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

![Mempool](../../images/mempool.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Requirements

* Bitcoin
* Electrs
* NodeJS v16+
* MariaDB
* NGINX

---

## Preparations

### NodeJS v16+

* Let's check our version of NodeJS running on the node

  ```sh
  $ node -v
  > v16.13.1
  ```
* If the version is v14 or older, update it following this tutorial: TBD

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
  > Cloning into 'mempool'...
  > [...]
  $ exit
  ```

### MariaDB

[MariaDB](https://mariadb.org/){:target="_blank"} is an open source relational database.

* With user "admin", we update the `apt` packages index, install MariaDB on the node and check that it runs properly

  ```sh
  $ sudo apt update
  $ sudo apt install mariadb-server mariadb-client
  $ sudo systemctl status mariadb
  > * mariadb.service - MariaDB 10.5.12 database server
  >  Loaded: loaded (/lib/systemd/system/mariadb.service; enabled; vendor preset: enabled)
  >  Active: active (running) since Mon 2021-12-13 11:29:11 GMT; 23h ago
  >  [...]
  ```
  
* Now, open the MariaDB shell. The instructions to enter in the MariaDB shell with start with $2

  ```sh
  $ sudo mysql
  > Welcome to the MariaDB monitor.  Commands end with ; or \g.
  > [...]
  > MariaDB [(none)]>
  ```

* Enter the following commands in the shell and exit

  ```sh
  $$ drop database mempool;
  > ERROR 1008 (HY000): Can't drop database 'mempool'; database doesn't exist
  $$ create database mempool;
  > Query OK, 1 row affected (0.001 sec)
  $$ grant all privileges on mempool.* to 'mempool'@'%' identified by 'mempool';
  > Query OK, 0 rows affected (0.012 sec)
  $$ exit
  ```
  
* Still with user "admin", from the mempool repo's top-level folder, import the database structure:

  ```sh
  $ cd /home/mempool/mempool
  $ mariadb -umempool -pmempool mempool < mariadb-structure.sql
  $ cd ~/
  ```

### Installation of Mempool's backend

* With user "mempool", install the backend  
  
  ```sh
  $ sudo su - mempool
  $ cd mempool/backend
  $ npm install
  $ npm run build
  ```
  
* Copy and rename the sample configuration file
  
  ```sh
  $ cp mempool-config.sample.json mempool-config.json
  $ nano mempool-config.json
  ```
  
* Open the config file and paste the following text. In the CORE_RPC section, replace USERNAME by 'raspibolt' and PASSWORD by your password [B]
  
  ```sh
  {
    "MEMPOOL": {
      "NETWORK": "mainnet",
      "BACKEND": "electrum",
      "HTTP_PORT": 8999
    },
    "CORE_RPC": {
      "HOST": "127.0.0.1",
      "PORT": 8332,
      "USERNAME": "mempool",
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
      "PASSWORD": "mempool",
      "DATABASE": "mempool"
    }
  }
  ```

* Start the backend to check it is working properly

  ```sh
  npm run start
  ```
  
* After a few minutes, we should see outputs like this. 

  ```sh
  > Mempool updated in 0.189 seconds
  > Updating mempool
  > Mempool updated in 0.096 seconds
  > Updating mempool
  > Mempool updated in 0.099 seconds
  > Updating mempool
  > Calculated fee for transaction 1 / 10
  > Calculated fee for transaction 2 / 10
  > Calculated fee for transaction 3 / 10
  > Calculated fee for transaction 4 / 10
  > Calculated fee for transaction 5 / 10
  > Calculated fee for transaction 6 / 10
  > Calculated fee for transaction 7 / 10
  > Calculated fee for transaction 8 / 10
  > Calculated fee for transaction 9 / 10
  > Calculated fee for transaction 10 / 10
  > Mempool updated in 0.243 seconds
  > Updating mempool
  ```

* Press Ctrl+C to exit and come back to the repository root directory

  ```sh
  $ cd ~/mempool
  ```

### Installation of Mempool's frontend

* Still with user "mempool", install the frontend and exit back to the "admin" user

  ```sh
  $ cd frontend
  $ npm install
  $ npm run
  $ exit
  ```

* Install the output into nginx webroot folder

  ```sh
  $ sudo rsync -av --delete /home/mempool/frontend/dist/mempool/ /var/www/
  ```
  
### NGINX + certbot

* NGINX is already installed on the node but we need to install `certbox`
  
  ```sh
  $ sudo apt-get install python3-certbot-nginx
  ```

* Install the mempool configuration for nginx

[TBD](https://github.com/mempool/mempool#manual-installation){:target="_blank"}

---

## Mempool in action

TBD

---

## Upgrade

TBD

---

## Uninstall

TBD

<br /><br />

---

<< Back: [+ Bitcoin](index.md)
