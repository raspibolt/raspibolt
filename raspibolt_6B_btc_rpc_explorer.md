---
layout: default
title: BTC RPC Explorer
parent: Bonus Section
nav_order: 25
has_toc: false
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD036 MD040 -->
## Bonus guide: BTC RPC Explorer

*Difficulty: medium*

### Introduction

A good way of improving your privacy and reliance in your own node, is to use it's data when you need to check some information in the blockchain like an address balance or transactions information.

[BTC RPC Explorer](https://github.com/janoside/btc-rpc-explorer) provides a lightweight and easy to use web platform to accomplish just that.
It's a database-free, self-hosted Bitcoin block explorer, via RPC.
Built with Node.js, express, bootstrap-v4.

### Preparations

#### Transaction indexing

For the BTC RPC Explorer to work, you need your full node to index all transactions.
Otherwise, the only transactions your full node will store are the ones pertaining to the node's wallets (which you probably are not going to use).
In order to do that, you need to set the `txindex` parameter in your Bitcoin Core configuration file (`bitcoin.conf`): [Bitcoin node configuration](raspibolt_30_bitcoin.md#transaction-indexing-optional).
After adding the parameter, just restart Bitcoin Core with `sudo systemctl restart bitcoind`.
As reindexing can take more than a day, you can follow the progress using `sudo tail -f /mnt/ext/bitcoin/debug.log`.

#### Install NodeJS

* Starting with user 'admin', we switch to user 'root' and add the [Node JS](https://nodejs.org) package repository.
  We'll use version 12 which is the most recent stable one. Then, exit the 'root' user session.

  ```sh
  $ sudo su
  $ curl -sL https://deb.nodesource.com/setup_12.x | bash -
  $ exit
  ```

* Install NodeJS using the apt package manager.

  ```sh
  $ sudo apt-get install nodejs
  ```

#### Firewall

* Configure firewall to allow incoming HTTP requests from your local network to the web server.

  ```sh
  $ sudo ufw allow from 192.168.0.0/16 to any port 3002 comment 'allow BTC RPC Explorer from local network'
  $ sudo ufw status
  ```

### Install BTC RPC Explorer

We are going to install the BTC RPC Explorer in the home directory since it doesn't take much space and don't use a database.
You can install it in the external drive instead, if you like.

* Open a 'bitcoin' user session and change into the home directory

  ```sh
  $ sudo su - bitcoin
  ```

* Download the source code directly from GitHub and install all dependencies using NPM.
  Since the program is written in Javascript, there is no need to compile.

  ```sh
  $ git clone --branch v1.1.9 https://github.com/janoside/btc-rpc-explorer.git
  $ cd btc-rpc-explorer
  $ npm install
  ```

### Configuration

* Copy and edit the configuration template (skip this step when updating)

  ```sh
  $ cp .env-sample .env
  $ nano .env
  ```

* Make sure you point to your Bitcoin Node by uncommenting and changing the following lines with the proper values:

  ```conf
  BTCEXP_BITCOIND_HOST=127.0.0.1
  BTCEXP_BITCOIND_PORT=8332
  BTCEXP_BITCOIND_USER=raspibolt
  BTCEXP_BITCOIND_PASS=PASSWORD_[B]
  # To compensate for the Raspberry Pi low processing capabilities, let's extend the timeout period
  BTCEXP_BITCOIND_RPC_TIMEOUT=10000
  ```

* To get address balances, either an Electrum server or an external service is necessary.
  It is important to use local RaspiBolt Electrs server, no real privacy is gained when we query external services anyway.
  The following configuration also works with Electrum Personal Server or ElectrumX.

  ```conf
  # Example using Electrs or any other local Electrum server
  BTCEXP_ADDRESS_API=electrumx
  BTCEXP_ELECTRUMX_SERVERS=tcp://127.0.0.1:50001
  ```

* You can go further improve your privacy by enabling privacy mode, but you won't get certain feature like price exchange rates.

  ```conf
  BTCEXP_PRIVACY_MODE=true
  ```

* Make sure the RPC methods are not all allowed to avoid unnecessary security leaks.
  However, if you want to use the BTC RPC Explorer to send RPC commands to your node you might want to activate this with caution.

  ```conf
  BTCEXP_RPC_ALLOWALL=false
  ```

* By default, the BTC RPC Explorer listens for local requests (localhost / 127.0.0.1).
  However, if you would like to access it from your local network or from somewhere else, make sure you configure the proper host and port by changing these parameters:

  ```conf
  # Example listening on the local network IP, with the default port
  BTCEXP_HOST=192.168.0.1
  BTCEXP_PORT=3002
  ```

* Additionally, if you want or need to see more logs related to the functioning of the explorer, you can enable them by changing this line with the proper parameter:

  ```conf
  # Here we are adding logs from the 'www' (http server) module
  DEBUG=btcexp:app,btcexp:error,www
  ```

* Save and exit

### First start

Test starting the explorer manually first to make sure it works.

* Let's do a first start to make sure it's running as expected.

  ```sh
  # Make sure we are in the BTC RPC Explorer directory
  $ cd ~/btc-rpc-explorer

  # Start the web server
  $ npm run start
  ```

* Now point your browser to `http://raspibolt.local:3002` (or whatever you chose as hostname) or the ip address (e.g. `http://192.168.0.20:3002`).
  You should see the home page of the BTC RPC Explorer.
  ![BTC RPC Explorer home screen with dark theme](images/6B_btcrpcexplorer_home.png)

* If you see a lot of errors on the RaspiBolt command line, then Bitcoin Core might still be indexing the blockchain.
  You need to wait until reindexing is done before using the BTC RPC Explorer.

* Stop the Explorer in the terminal with `Ctrl`-`C`.

### Configure systemd service

Now we'll make sure our block explorer starts as a service on the Raspberry Pi so it's always running.
In order to do that we'll use `systemd`.

* Create the service file

  ```sh
  $ sudo nano /etc/systemd/system/btcrpcexplorer.service
  ```

* Paste the following configuration. Save and exit.

  ```ini
  # RaspiBolt: systemd unit for BTC RPC Explorer
  # /etc/systemd/system/btcrpcexplorer.service

  [Unit]
  Description=BTC RPC Explorer
  After=network.target bitcoind.service

  # If you use an Electrum server, uncomment the following line and make sure to use the correct the service
  # After=electrs.service

  [Service]
  WorkingDirectory=/home/bitcoin/btc-rpc-explorer
  ExecStart=/usr/bin/npm start
  User=bitcoin

  # Restart on failure but no more than 2 time every 10 minutes (600 seconds). Otherwise stop
  Restart=on-failure
  StartLimitIntervalSec=600
  StartLimitBurst=2

  [Install]
  WantedBy=multi-user.target
  ```

* Enable the service, start it and check log logging output.

  ```sh
  $ sudo systemctl enable btcrpcexplorer.service
  $ sudo systemctl start btcrpcexplorer.service
  $ sudo journalctl -f -u btcrpcexplorer
  ```

* You can now access your own BTC RPC Explorer from within your local network by browsing to <http://raspibolt.local:3002> (or your equivalent ip address).

### Remote access over Tor (optional)

Do you want to access your personal block explorer remotely?
You can easily do so by adding a Tor hidden service on the RaspiBolt and accessing the BTC RPC Explorer with the Tor browser from any device.

* Add the following three lines in the section for "location-hidden services" in the `torrc` file.
  Save and exit.

  ```sh
  $ sudo nano /etc/tor/torrc
  ```

  ```conf
  ############### This section is just for location-hidden services ###

  HiddenServiceDir /var/lib/tor/hidden_service_btcrpcexplorer/
  HiddenServiceVersion 3
  HiddenServicePort 80 127.0.0.1:3002
  ```

* Restart Tor and get your connection address.

  ```sh
  $ sudo systemctl restart tor
  $ sudo cat /var/lib/tor/hidden_service_btcrpcexplorer/hostname
  > abcdefg..............xyz.onion
  ```

* With the [Tor browser](https://www.torproject.org), you can access this onion address from any device.
  Please be aware that this access is not password protected and should not be shared widely.

**Congratulations!**
You now have the BTC RPC Explorer running to check the Bitcoin network information directly from your node.

---

<< Back: [Bonus guides](raspibolt_60_bonus.md)
