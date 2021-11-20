---
layout: default
title: rebalance-lnd
parent: Bonus Section
nav_order: 100
has_toc: false
---
# Bonus guide: rebalance-lnd

*Difficulty: simple*

[rebalance-lnd](https://github.com/C-Otto/rebalance-lnd) (created by C-Otto) is a tool to manage your channel liquidity by doing circular rebalancing; i.e. sending sats out of a channel with too much outbound/local liquidity back to one of your channel with too much inbound/remote liquidity. 
You just pay the routing fees and can set up some maximum fees that you're ok to pay.

*Requirements:*

* LND (or LND as part of Lightning Terminal/litd)

## Install charge-lnd

* We create a "rebalance-lnd" user and we make it part of the "bitcoin" group (to be able to interact with LND)  

  ```sh
  $ sudo adduser --gecos "" rebalance-lnd
  $ sudo /usr/sbin/usermod --append --groups bitcoin rebalance-lnd
  ```
  
* With the "charge-lnd" user, clone the charge-lnd repository, enter the directory and install the program and required packages using `pip3` (do _not_ forget the dot at the end of the pip command!)

  ```sh
  $ sudo su - rebalance-lnd
  $ git clone https://github.com/C-Otto/rebalance-lnd.git
  $ cd rebalance-lnd/
  $ pip3 install -r requirements.txt
  ```

* Test if the installation was successful by running the program
 
  ```sh
  $ python rebalance.py
  > usage: rebalance.py [-h] [--lnddir LNDDIR] [--network NETWORK] [--grpc GRPC]
  > [...]
  ```
  
* We are going to create a simlink to the LND directory. We'll place the link in the home directory of the "charge-lnd" user to match the default LND directory used by rebalance-lnd (~/.lnd) 

  ```sh
  $ ln -s /mnt/ext/lnd/ /home/rebalance-lnd/.lnd
  ```
  
## Commands



 ```sh
  $ python rebalance.py --amount <amount_in_sats> --from <node_A_channel_ID> --to <node_B_channel_ID>
  >

## Upgrade

TBD

## Uninstall

If you want to uninstall rebalance-lnd:

* Log in with the "root" user and delete the "rebalance-lnd" user

  ```sh
  $ sudo su -
  $ userdel -r rebalance-lnd
  $ exit
  ```
