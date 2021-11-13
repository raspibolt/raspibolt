---
layout: default
title: Block Explorer
nav_order: 55
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD036 MD040 -->

# Block Explorer
{: .no_toc }

Run your own block explorer without depending on external services.

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Run your own block explorer

After the RaspiBolt runs your own fully validated node, and maybe even acts as a backend for your hardware wallet with Electrs, the last important puzzle piece to improve privacy and financial sovereignty is your own Block Explorer.
This lets you query transactions, addresses and blocks of your choice.
You no longer need to leak information by querying a third-party block explorer that can be used to get your location and cluster addresses.

[BTC RPC Explorer](https://github.com/janoside/btc-rpc-explorer){:target="_blank"} provides a lightweight and easy to use web interface to accomplish just that.
It's a database-free, self-hosted Bitcoin block explorer, querying Bitcoin Core and Electrs via RPC.

## Preparations

### Transaction indexing

For the BTC RPC Explorer to work, you need your full node to index all transactions.

* If you followed this guide, the transaction index parameter is already enabled (`txindex=1`), and you can skip to the next section.

* If the tranthis is not the case, you need to set the `txindex=1` parameter in your Bitcoin Core configuration file (`bitcoin.conf`): [Bitcoin node configuration](raspibolt_30_bitcoin.md#configuration).

* After adding the parameter, just restart Bitcoin Core, which will now index the whole blockchain

  ```sh
  $ sudo systemctl restart bitcoind
  ```

Please note that reindexing can take more than a day.
You can follow the progress using `sudo tail -f /mnt/ext/bitcoin/debug.log`.

### Install NodeJS

* Add the [Node JS](https://nodejs.org){:target="_blank"} package repository from user "admin".
  We'll use version 14, which is well tested with this application.

  ```sh
  $ curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
  ```

* Install NodeJS using the apt package manager.

  ```sh
  $ sudo apt install nodejs
  ```

### Firewall

* Configure firewall to allow incoming HTTP requests from your local network to the web server.

  ```sh
  $ sudo ufw allow from 192.168.0.0/16 to any port 3002 comment 'allow BTC RPC Explorer from local network'
  $ sudo ufw status
  ```

## BTC RPC Explorer

### Installation

We do not want to run the explorer code alongside `bitcoind` and `lnd` because of security reasons.
For that we will create a separate user and we will be running the code as the new user.
We are going to install the BTC RPC Explorer in the home directory since it doesn't take much space and doesn't use a database.

* Create a new user with  your `password [A]` and open a new session

  ```sh
  $ sudo adduser btcrpcexplorer
  $ sudo su - btcrpcexplorer
  ```

* Download the source code directly from GitHub and install all dependencies using NPM.

  ```sh
  $ git clone --branch v3.2.0 https://github.com/janoside/btc-rpc-explorer.git
  $ cd btc-rpc-explorer
  $ npm install
  ```

### Configuration

* Copy and edit the configuration template (skip this step when updating).
  Activate any setting by removing the `#` at the beginning of the line.

  ```sh
  $ cp .env-sample .env
  $ nano .env
  ```

* By default, the BTC RPC Explorer listens for local requests (localhost / 127.0.0.1).
  If you would like to access it from your local network or from somewhere else, change the following parameters.

  ```conf
  BTCEXP_HOST=0.0.0.0
  BTCEXP_PORT=3002
  ```

* Instruct BTC RPC Explorer to connect to local Bitcoin Core

  ```conf
  BTCEXP_BITCOIND_HOST=127.0.0.1
  BTCEXP_BITCOIND_PORT=8332
  BTCEXP_BITCOIND_USER=raspibolt
  BTCEXP_BITCOIND_PASS=PASSWORD_[B]
  ```

* Extend the timeout period due to the limited resources of the Raspberry Pi

  ```conf
  BTCEXP_BITCOIND_RPC_TIMEOUT=10000
  ```

* To get address balances, either an Electrum server or an external service is necessary.
  Your local Electrs server can provide address transaction lists, balances, and more.

  ```conf
  BTCEXP_ADDRESS_API=electrum
  BTCEXP_ELECTRUM_SERVERS=tcp://127.0.0.1:50001
  BTCEXP_ELECTRUM_TXINDEX=true
  ```

* You can decide whether you want to optimize for more information or for more privacy.

  * More information mode, including Bitcoin exchange rates:

    ```conf
    BTCEXP_PRIVACY_MODE=false
    BTCEXP_NO_RATES=true
    ```

  * More privacy mode, no external queries:

    ```conf
    BTCEXP_PRIVACY_MODE=true
    BTCEXP_NO_RATES=false
    ```

* Make sure the RPC methods are not all allowed to avoid unnecessary security leaks.
  However, if you want to use the BTC RPC Explorer to send RPC commands to your node you might want to activate this with caution.

  ```conf
  BTCEXP_RPC_ALLOWALL=false
  ```

* Optionally, you can add password protection to the web interface.
  Simply add a password for the following option, for which the browser will then prompt you.
  You can enter any user name, only the password is checked.
  It's best to use a separate password not used anywhere else because it will be transmitted in plain text.

  ```conf
  BTCEXP_BASIC_AUTH_PASSWORD=AnyPassword
  ```

* Decide whether you prefer a `light` or `dark` theme

  ```conf
  BTCEXP_UI_THEME=dark
  ```

* Save and exit

### First start

Test starting the explorer manually first to make sure it works.

* Let's do a first start to make sure it's running as expected.
  Make sure we are in the BTC RPC Explorer directory and start the web server.

  ```sh
  $ cd ~/btc-rpc-explorer
  $ npm run start
  ```

* Now point your browser to [http://raspibolt.local:3002](http://raspibolt.local:3002){:target="_blank"} (or whatever you chose as hostname) or the ip address (e.g. `http://192.168.0.20:3002`).
  You should see the home page of the BTC RPC Explorer.

  ![BTC RPC Explorer home screen with dark theme](images/6B_btcrpcexplorer_home.png)

* If you see a lot of errors on the RaspiBolt command line, then Bitcoin Core might still be indexing the blockchain.
  You need to wait until reindexing is done before using the BTC RPC Explorer.

* Stop the Explorer in the terminal with `Ctrl`-`C` and exit the "btcrpcexplorer" user session.

  ```sh
  $ exit
  ```

### Autostart on boot

Now we'll make sure our block explorer starts as a service on the Raspberry Pi so it's always running.
In order to do that we create a systemd unit that starts the service on boot directly after Bitcoin Core.

* As user "admin", create the service file.

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

  # If you use Electrs server, uncomment the following line
  # After=electrs.service

  [Service]
  WorkingDirectory=/home/btcrpcexplorer/btc-rpc-explorer
  ExecStart=/usr/bin/npm start
  User=btcrpcexplorer

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

* With the [Tor browser](https://www.torproject.org){:target="_blank"}, you can access this onion address from any device.
  Please be aware that this access is not password protected and should not be shared widely.

**Congratulations!**
You now have the BTC RPC Explorer running to check the Bitcoin network information directly from your node.

---

## Upgrade

Updating to a [new release](https://github.com/janoside/btc-rpc-explorer/releases){:target="_blank"} is straight-forward, but make sure to check out the [change log](https://github.com/janoside/btc-rpc-explorer/blob/master/CHANGELOG.md){:target="_blank"} first.

* From user "admin", stop the service and open a "btcrpcexplorer" user session.

  ```sh
  $ sudo systemctl stop btcrpcexplorer
  $ sudo su - btcrpcexplorer
  ```

* Fetch the latest GitHub repository information, display the latest release tag (`v3.2.0` in this example), and update:

  ```sh
  $ cd ~/btc-rpc-explorer
  $ git fetch
  $ git describe --tags
  $ git checkout v3.2.0
  $ npm install
  $ exit
  ```

* Start the service again.

  ```sh
  $ sudo systemctl start btcrpcexplorer
  ```

---

Next: [Bonus guides >>](raspibolt_60_bonus.md)
