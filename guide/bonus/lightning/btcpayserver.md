---
layout: default
title: BTCPay Server
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

# Bonus guide: BTCPay Server
{: .no_toc }

[BTCPay Server](https://btcpayserver.org/){:target="_blank"} is a self-hosted, open-source cryptocurrency payment processor.

Difficulty: Intermediate
{: .label .label-yellow }

Status: Tested v3
{: .label .label-green }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Preparations

### Install PostgreSQL

PostgreSQL is used as data storage. You can install it with:

* Install PostgreSQL

  ```sh
  $ sudo apt -y install postgresql postgresql-contrib
  ```

### Create a new user

We do not want to run BTCPay Server alongside bitcoind and lnd because of security reasons. For that we will create a separate user and we will be running the code as the new user.

* Create a new user , add it to bitcoin gruop and open a new session

  ```sh
  $ sudo adduser --disabled-password --gecos "" btcpay
  $ sudo adduser btcpay bitcoin
  $ sudo su - btcpay
  ```

### Install .NET 6.0 SDK

With user "btcpay", we install .NET 6.0 SDK. This software is used to build and execute BTCPay Server.

* Install .NET SDK 6.0

  ```sh
  $ curl https://dot.net/v1/dotnet-install.sh
  $ chmod +x ./dotnet-install.sh
  $ ./dotnet-install.sh --channel 6.0
  ```

The executable file is installed in `/home/btcpay/.dotnet/dotnet`.

* Add path to dotnet executable

  ```sh
  $ echo 'export DOTNET_ROOT=$HOME/.dotnet' >>~/.bashrc
  $ echo 'export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools' >>~/.bashrc
  $ source ~/.bashrc
  ```

* Check .NET SDK 6.0 is correctly installed

  ```sh
  $ dotnet --version
  > 6.0.403
  ```

## Install NBXplorer

[NBXplorer](https://github.com/dgarage/NBXplorer) is a minimalist UTXO tracker for HD Wallets, exploited by BTCPay Server.

Still with user "btcpay", we execute the following commands:

* Build NBXplorer

  ```sh
  $ cd
  $ git clone https://github.com/dgarage/NBXplorer
  $ cd NBXplorer
  $ ./build.sh
  ```

* Modify NBXplorer run script

  ```sh
  $ nano /home/btcpay/NBxplorer/run.sh
  ```

  Change `dotnet` to `/home/btcpay/.dotnet/dotnet`, save and exit.


* Create PostgreSQL database for NBXplorer

  ```sh
  $ sudo -u postgres psql
  CREATE DATABASE nbxplorer TEMPLATE 'template0' LC_CTYPE 'C' LC_COLLATE 'C' ENCODING 'UTF8';
  CREATE USER nbxplorer WITH ENCRYPTED PASSWORD 'urpassword';
  GRANT ALL PRIVILEGES ON DATABASE nbxplorer TO nbxplorer;
  ```

* Exit PostgreSQL

  ```sh
  postgres=# \q
  ```

### NBXplorer configuration

  ```sh
  $ nano /home/btcpay/.nbxplorer/Main/settings.config
  ```

  Insert the following lines in the beginning of the configuration file:

  ```sh
  btc.rpc.cookiefile=/home/bitcoin/.bitcoin/.cookie

  ### Database ###
  postgres=User ID=nbxplorer;Password=urpassword;Application Name=nbxplorer;MaxPoolSize=20;Host=localhost;Port=5432;Database=nbxplorer;
  ```

### Autostart NBXplorer on boot

First, we go back to user "admin":

  ```sh
  $ exit
  ```

Then, we use systemd to execute NBXplorer on boot:

* Create the configuration file in the Nano text editor and copy the following paragraph.
  Save and exit.

  ```sh
  $ sudo nano /etc/systemd/system/nbxplorer.service
  ```

  ```sh
  [Unit]
  Description=NBXplorer daemon
  Requires=bitcoind.service
  After=bitcoind.service

  [Service]
  WorkingDirectory=/home/btcpay/NBXplorer
  ExecStart=/home/btcpay/NBXplorer/run.sh

  User=btcpay

  Type=simple
  Restart=always
  TimeoutSec=120
  RestartSec=30
  KillMode=process

  [Install]
  WantedBy=multi-user.target
  ```

* Enable the service, start it and check log logging output.

  ```sh
  $ sudo systemctl enable nbxplorer
  $ sudo systemctl start nbxplorer
  $ sudo journalctl -f -u nbxplorer
  ```

## Install BTCPay Server

With user "btcpay", we execute the following commands:

* Build BTCPay

  ```sh
  $ cd
  $ git clone https://github.com/btcpayserver/btcpayserver
  $ cd btcpayserver
  $ ./build.sh
  ```

* Modify BTCPay run script

  ```sh
  $ nano /home/btcpay/btcpayserver/run.sh
  ```

  Change `dotnet` to `/home/btcpay/.dotnet/dotnet`, save and exit.


* Create PostgreSQL database for NBXplorer

  ```sh
  $ sudo -u postgres psql
  CREATE DATABASE btcpay TEMPLATE 'template0' LC_CTYPE 'C' LC_COLLATE 'C' ENCODING 'UTF8';
  CREATE USER btcpay WITH ENCRYPTED PASSWORD 'urpassword';
  GRANT ALL PRIVILEGES ON DATABASE btcpay TO btcpay;
  ```

* Exit PostgreSQL

  ```sh
  postgres=# \q
  ```

### BTCPay Server configuration

  ```sh
  $ nano /home/btcpay/.btcpayserver/Main/settings.config
  ```

  Insert the following lines in the beginning of the configuration file:

  ```sh
  ### Database ###
  postgres=User ID=btcpay;Password=urpassword;Application Name=btcpayserver;Host=localhost;Port=5432;Database=btcpay;
  explorer.postgres=User ID=nbxplorer;Password=urpassword;Application Name=nbxplorer;MaxPoolSize=20;Host=localhost;Port=5432;Database=nbxplorer;
  ```

### Autostart BTCPay Server on boot

First, we go back to user "admin":

  ```sh
  $ exit
  ```

Then, we use systemd to execute NBXplorer on boot:

* Create the configuration file in the Nano text editor and copy the following paragraph.
  Save and exit.

  ```sh
  $ sudo nano /etc/systemd/system/btcpay.service
  ```

  ```sh
  [Unit]
  Description=BTCPay Server
  Requires=nbxplorer.service
  After=nbxplorer.service

  [Service]
  WorkingDirectory=/home/btcpay/btcpayserver
  ExecStart=/home/btcpay/btcpayserver/run.sh
  User=btcpay

  Type=simple
  Restart=always
  TimeoutSec=120
  RestartSec=30
  KillMode=process

  [Install]
  WantedBy=multi-user.target
  ```

* Enable the service, start it and check log logging output.

  ```sh
  $ sudo systemctl enable btcpay
  $ sudo systemctl start btcpay
  $ sudo journalctl -f -u btcpay
  ```


## Remote access over Tor

You can easily add a Tor hidden service on the RaspiBolt and access the BTCPay Server interface with the Tor browser from any device.

* Add the following three lines in the section for "location-hidden services" in the `torrc` file. Save and exit

  ```sh
  $ sudo nano /etc/tor/torrc
  ```

  ```ini
  ############### This section is just for location-hidden services ###
  # Hidden Service BTCPay
  HiddenServiceDir /var/lib/tor/hidden_service_btcpay/
  HiddenServiceVersion 3
  HiddenServicePort 80 127.0.0.1:23000
  ```

  Update Tor configuration changes and get your connection address.

  ```sh
  $ sudo systemctl reload tor
  $ sudo cat /var/lib/tor/hidden_service_rtl/hostname
  > abcefg...................zyz.onion
  ```

With the Tor browser (link this), you can access this onion address from any device.

**Congratulations!**
You now have BTCPay Server running to manage Bitcoin and Lightning payments on your own node.