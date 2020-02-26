---
layout: default
title: BTC RPC Explorer
parent: Bonus Section
nav_order: 100
has_toc: false
---
## Bonus guide: BTC RPC Explorer

*Difficulty: easy*

### Introduction

A good way of improving your privacy and reliance in your own node, is to use it's data when you need to check some information in the blockchain like an address balance or transactions information.

[BTC RPC Explorer](https://github.com/janoside/btc-rpc-explorer) provides a lightweight and easy to use web platform to accomplish just that. It's a database-free, self-hosted Bitcoin explorer, via RPC. Built with Node.js, express, bootstrap-v4.


### Preparations

 * For a better functioning of the explorer, you will want your full node to index all transactions. Otherwise, the only transactions your full node will store are the ones pertaining to the node's wallets (which you probably are not going to use). In order to do that, you need to set the `txindex` parameter in your Bitcoin Core configuration file (`bitcoin.conf`):
 [Bitcoin node configuration](raspibolt_30_bitcoin.md#transaction-indexing-optional)

* With user 'admin', make sure [Node JS](https://nodejs.org) is installed. We'll use version 12 which is the most recent stable one.
  ```
  # switch to su to make sure the command to add the source works
  $ sudo su
  $ curl -sL https://deb.nodesource.com/setup_12.x | bash -

  # we can go back to normal now
  $ exit
  $ sudo apt-get install -y nodejs
  ```

* Configure firewall to allow incoming HTTP requests for the new web server (please check if you need to adjust the subnet mask as [described in original setup](raspibolt_21_security.md#enabling-the-uncomplicated-firewall))
  ```
  $ sudo ufw allow from 192.168.0.0/24 to any port 3002 comment 'allow BTC RPC Explorer from local network'
  $ sudo ufw enable
  $ sudo ufw status
  ```

### Install BTC RPC Explorer

We are going to install the BTC RPC Explorer in the home directory since it doesn't take much space and don't use a database. You can install it in the HD instead if you like.

* Open a "bitcoin" user session and change into the home directory
  `$ sudo su - bitcoin`

* Download the source code directly from GitHub (since it's Javascript, there is no need to compile)
  ```
  # Create a new directory
  $ mkdir btc-rpc-explorer
  $ cd btc-rpc-explorer
  $ git clone https://github.com/janoside/btc-rpc-explorer.git .

  # Install all project dependencies to make it work
  $ npm install
  ```

* Copy and edit configuration template (skip this step when updating)
  ```
  $ cp .env-sample .env
  $ nano .env
  ```
  
  * Make sure you point to your Bitcoin Node by uncommenting and changing the following lines with the proper values
    ```
    BTCEXP_BITCOIND_HOST=127.0.0.1
    BTCEXP_BITCOIND_PORT=8832
    BTCEXP_BITCOIND_USER=raspibolt
    BTCEXP_BITCOIND_PASS=PASSWORD_[B]
    # To compensate for the Raspberry Pi low processing capabilities, let's extend the timeout period
    BTCEXP_BITCOIND_RPC_TIMEOUT=10000
    ```
  * Change the data source for checking the address balances. The available information will depend on what are you using, for example Electrum Personal Server or Electrum X. You can also avoid using third party services to reach full privacy in this regard. Check your configuration for proper values.
    ```
    # Example using Electrum Personal Server
    BTCEXP_ADDRESS_API=electrumx
    BTCEXP_ELECTRUMX_SERVERS=tls://127.0.0.1:50002,tcp://127.0.0.1:50002
    ```
  * You can improve your privacy by making sure the privacy mode is enabled, but you won't get certain feature like price exchange rates
    ```
    BTCEXP_PRIVACY_MODE=true
    ```
  * Make sure the RPC methods are not all allowed, to avoid unnecessary security leaks. (However, if you want to use the BTC RPC Explorer to send RPC commands to your node you might want to activate this with caution)
    ```
    BTCEXP_RPC_ALLOWALL=false
    ```
  * By default, the BTC RPC Explorer listens for local requests (localhost / 127.0.0.1). However, if you would like to access it from your local network or from somewhere else, make sure you configure the proper host and port by changing these parameters:
    ```
    # Example listening on the local network IP, with the default port
    BTCEXP_HOST=192.168.0.1
    BTCEXP_PORT=3002
    ```
  * Additionally, if you want or need to see more logs related to the functioning of the explorer, you can enable them by changing this line with the proper parameter:
    ```
    # Here we are adding logs from the 'www' (http server) module
    DEBUG=btcexp:app,btcexp:error,www
    ```
* Save and exit

### First start

Test the explorer to make sure it works

* Let's do a first start to make sure it's running as expected.
  ```
  # Make sure we are in the BTC RPC Explorer directory
  $ cd ~/btc-rpc-explorer
  
  # Start the web server
  $ npm run start
  ```
* Now point your browser to the URL `http://192.168.0.1:3002` (being 192.168.0.1 the URL of your Raspberry Pi in your network). You should see the home page of the BTC RPC Explorer.
  ![BTC RPC Explorer home screen with dark theme](images/6B_btcrpcexplorer_home.png)
* Stop the explorer in the terminal with `Ctrl + C` (kill the process)

### Configure systemd service

Now we we'll make sure our block explorer starts as a service on the Raspberry Pi so it's always running. In order to do that we'll use `systemd`.

* Create the service file
  ```
  # Create and edit the service file
  $ sudo nano /etc/systemd/system/btcrpcexplorer.service
  ```
* Paste the following configuration
  ```
  [Unit]
  Description=BTC RPC Explorer
  # We will set it up so it runs after the network and Bitcoin Node has started
  After=network.target bitcoind.service
  # I you have an Electrum server running, you should add it here too. Here is an example for Electrum Personal Server:
  # After=network.target bitcoind.service eps.service
  
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
* Save the file and exit
* Enable the service
  ```
  $ sudo systemctl enable btcrpcexplorer.service
  ```
* Start the service
  ```
  $ sudo systemctl start btcrpcexplorer.service
  ```

You can control the service as you do with all the others.

Contratulations! You now have the BTC RPC Explorer running to check the Bitcoin network information directly from your node.

---

<< Back: [Bonus guides](raspibolt_60_bonus.md)