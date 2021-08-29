---
layout: default
title: Balance of Satoshis
parent: Bonus Section
nav_order: 130
has_toc: false
---
# Bonus guide: Balance of Satoshis

*Difficulty: simple*

[Balance of Satoshis](https://github.com/alexbosworth/balanceofsatoshis) (BoS), created and maintained by LND developper Alex Bosworth, is a tool to work with LND channel balances.

*Requirements:*

* LND (or LND as part of Lightning Terminal/litd)
* Requires an installation of Node v12.0+

*Acknowledgments:*

* This guide is modified from the [manual install guide](https://gist.github.com/openoms/823f99d1ab6e1d53285e489f7ba38602) for the Raspiblitz by @openoms.

## Check NodeJS

* NojeJS v12.0 or above should have been installed for the BTC RPC Explorer. We can check our version of NodeJS with user 'admin': 

  ```sh
  $ node -v
  >v14.17.4
  ```

* If the version is v12.0 or above, you can move to section **Create bos user**.
* If NodeJS is not installed, follow [these commands](https://stadicus.github.io/RaspiBolt/raspibolt_55_explorer.html#install-nodejs) to install it.
* If NodeJS version is older than v12.0, you can attempt to upgrade it:
** First, we need to stop and disable btcrpcexplorer, and then we need to clean the npm cache, install n (Node's version manager) and install the latest stable version.
  ```sh
  $ sudo systemctl stop btcrpcexplorer
  $ sudo systemctl disable btcrpcexplorer
  $ sudo su
  $ npm cache clean -f
  $ npm install -g n
  $ sudo n stable
  $ exit
  $ node -v
  ```

## Create the bos user and set up npm-global

* Create a new user with your password [ A ]  

  ```sh
  $ sudo adduser bos
  $ sudo su - bos
  ```
  
* Set up nmp-global
 
  ```sh
  $ mkdir /home/bos/.npm-global
  $ npm config set prefix '/home/bos/.npm-global'
  $ exit
  $ sudo bash -c "echo 'PATH=$PATH:/home/bos/.npm-global/bin' >> /home/bos/.bashrc"
  ```
  
## Download source code and install bos

* Download the source code
  
  ```sh
  $ sudo su - bos
  $ git clone https://github.com/alexbosworth/balanceofsatoshis.git /home/bos/balanceofsatoshis
  $ cd balanceofsatoshis
  ```  
  
* Create symlink to lnd directory

  ```sh
  $ sudo ln -s "/mnt/ext/lnd/" "/home/bos/.lnd"
  ```

* Make bos a member of the bitcoin group
  
  ```sh
  $ sudo /usr/sbin/usermod --append --groups bitcoin bos
  ```

* Install bos

  ```sh
  $ npm install -g balanceofsatoshis
  ```
  
## Using bos (with the bos user)

* To check the version, you can use one of the following command

  ```sh
  $ bos --version
  $ bos -V
  ```
  
* To see a list of available options and flags run
  
  ```sh
  $ bos help
  ```
  
* To see details about an individual command, add the name of the command, e.g. with the command `balance`
  
  ```sh
  $ bos help balance
  ```

* To rebalance on your node [A] a channel with high outbound (to node B) and a channel with high inbound (to node C)

  ```sh
  $ bos rebalance --amount [AMOUNT_IN_SATS] --max-fee-rate [TOTAL_MAX_FEE_RATE_OF_REBALANCING] --in [NODE_C_PUBKEY] --out [NODE_A_PUBKEY]
  ```
  Start with a small max-fee-rate and increase it if necessary.
  
* More information on bos commands [Github repository](https://github.com/alexbosworth/balanceofsatoshis).


## Upgrade

* When using bos, it will prompt you to upgrade when a new upgrade is available. The command to be run to upgrade (with the bos user) is

  ```sh
  $ npm i -g balanceofsatoshis
  ```
