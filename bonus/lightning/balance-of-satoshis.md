---
layout: default
title: Balance of Satoshis
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---
# Bonus guide: Balance of Satoshis
{: .no_toc }

Difficulty: Easy
{: .label .label-green }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

[Balance of Satoshis](https://github.com/alexbosworth/balanceofsatoshis){:target="_blank"} (BoS), created and maintained by LND developper Alex Bosworth, is a tool to work with LND. The most used feature of BoS is the rebalancing command that allows to manage your channels liquidity (which is the main focus of this guide), but BoS contains now many other lightning tools outside liquidity management (such as the creation of a node monitoring Telegram bot which is explained below).

*Requirements:*

* LND (or LND as part of Lightning Terminal/litd)
* Requires an installation of Node v12.0+

## Check NodeJS

* NojeJS v1.0 or above should have been installed for the BTC RPC Explorer. We can check our version of NodeJS with user "admin": 

  ```sh
  $ node-v
  > v14.18.2
  ```

* If the version is v12.0 or above, you can move to the next section. If NodeJS is not installed, follow [this guide](https://raspibolt.org/btcrpcexplorer.html#install-nodejs) to install it.

* If NodeJS version is older than v12.0, you can upgrade it:
  * Clean the npm cache, install n (Node's version manager) and install the latest stable version.
  
  ```sh
  $ sudo su
  $ npm cache clean -f
  $ npm install -g n
  $ sudo n stable
  $ exit
  $ node -v
  ```

## Create the "bos" user and set up npm-global

* Create a new user "bos" and make it a member of the "lnd" group

  ```sh
  $ sudo adduser --disabled-password --gecos "" bos
  $ sudo /usr/sbin/usermod --append --groups lnd bos
  $ sudo su - bos
  ```

* Create symlink to lnd directory

  ```sh
  $ ln -s /data/lnd /home/bos/.lnd
  ```
  
* Display the link and check that it's not shown in red (this would indicate an error)

  ```sh
  $ ls -la
  ```

* Set up nmp-global
 
  ```sh
  $ mkdir /home/bos/.npm-global
  $ npm config set prefix '/home/bos/.npm-global'
  $ exit
  $ sudo bash -c "echo 'PATH=$PATH:/home/bos/.npm-global/bin' >> /home/bos/.bashrc"
  ```

## Install

* Download the source code and install it
  
  ```sh
  $ sudo su - bos
  $ git clone https://github.com/alexbosworth/balanceofsatoshis.git /home/bos/balanceofsatoshis
  $ cd balanceofsatoshis
  $ npm install -g balanceofsatoshis
  $ cd ~/
  ```  

* Check the version with the --version (or -V) option

  ```sh
  $ bos -V
  > v11.13.0
  ```
  
## Balance of Satoshis in action

To use Balance of Satoshis, we will use the "bos" user.

### Introduction

* To see a list of all available commands run the following command
  
  ```sh
  $ bos help
  > bos 11.13.0 
  > 
  > USAGE
  > 
  >   bos <command> [options]
  >   
  > COMMANDS
  > 
  >   accounting <category>               Get an accounting rundown
  >   [...]
  ```
  
* To see detailed information about an individual command, add the name of the command, e.g. with the command `rebalance`
  
  ```sh
  $ bos help rebalance
  > bos 11.13.0 
  > 
  > USAGE
  > 
  >   bos rebalance 
  >   Change the liquidity profile of two peers
  > [...]
  ```
  
* Get a short report of your LN node with pubkey, alias, local capacity, mempool information and recent routing activity

  ```sh
  $ bos report
  ```

* Get a list of your channels with peer alias, local and remote balances and your peers fee rates towards your node (the local and remote balances are colour-coded with balances <1M sats in white, >1M sats in green and 4M sats in bolded green, to help identify channels that might require rebalancing)

  ```sh
  $ bos peers
  > │ Alias                      │ Inbound    │ In Fee       │ Outbound   │
  > ├────────────────────────────┼────────────┼──────────────┼────────────┤
  > │ euclid                     │ 0.00489595 │ 0.00% (7)    │ 0.00508736 ┤
  > [...]
  ```

  
### Circular rebalancing  

Circular rebalancing allows to send satoshis out through one channel (which has too little inbound liquidity) and back through another channel (which has too little outbound liquidity). 

A good illustration is provided in Chapter 5 of 'Mastering the Lighnting Network' by Antonopoulos *et al.* ([source](https://github.com/lnbook/lnbook/blob/ec806916edd6f4d1b2f9da2fef08684f80acb671/05_node_operations.asciidoc#rebalancing-channels){:target="_blank"}) (Alice (A), is your node, Bob (B) and and Chan (C) are two peers with whom you have an opened channel with):

![circular-rebalancing](https://github.com/lnbook/lnbook/raw/ec806916edd6f4d1b2f9da2fef08684f80acb671/images/mtln_0504.png)

* To rebalance a channel (to node B) with high outbound and a channel with high inbound (to node C), use the `rebalance` command.

  ```sh
  $ bos rebalance --amount [AMOUNT_IN_SATS] --max-fee-rate [TOTAL_MAX_FEE_RATE_OF_REBALANCING] --in [NODE_C_PUBKEY] --out [NODE_A_PUBKEY]
  ```
  
* E.g. using the example above:
  *  with node B being the [Bitrefill node](https://amboss.space/node/03d607f3e69fd032524a867b288216bfab263b6eaee4e07783799a6fe69bb84fac){:target="_blank"}, 
  *  node C being the [CoinOS node](https://amboss.space/node/02868e12f320073cad0c2959c42559fbcfd1aa326fcb943492ed7f02c9820aa399){:target="_blank"} 
  *  rebalancing 50,000 sats 
  *  with a maximum fee rate that you are ready to pay of 100 ppm max
  
  ```sh
  $ bos rebalance --amount 50000 --max-fee-rate 100 --in 02868e12f320073cad0c2959c42559fbcfd1aa326fcb943492ed7f02c9820aa399 --out 03d607f3e69fd032524a867b288216bfab263b6eaee4e07783799a6fe69bb84fac
  ```

* Some rebalancing can take a very long time. A timeout can be specified for the command to terminate gracefully by adding the `--minutes` option.

  ```sh
  $ bos rebalance --minutes [NUMBER_OF_MINUTES] --amount [AMOUNT_IN_SATS] --max-fee-rate [TOTAL_MAX_FEE_RATE_OF_REBALANCING] --in [NODE_C_PUBKEY] --out [NODE_A_PUBKEY]
  ```
  
* If you notice that a node in the tried paths is repeatedly the cause of failures, you can ask BoS to ignore this node during path finding by adding the `--avoid` option
  
  ```sh
  $ bos rebalance --minutes [number_of_minutes] --amount [AMOUNT_IN_SATS] --max-fee-rate [TOTAL_MAX_FEE_RATE_OF_REBALANCING] --avoid [NODE_PUBKEY] --in [NODE_C_PUBKEY] --out [NODE_A_PUBKEY]
  ```

### Tags

BoS allows to create user-defined tags to classify nodes and then be used in the commands.

* For example, you might want to have a tag for nodes that have to be avoided in path finding

* Create the 'avoid-nodes' tag and tag nodes Y and Z

  ```sh
  $ bos tags avoid-nodestes --add [NODE_Y_PUBKEY] --add [NODE_Z_PUBKEY]
  > tag: 
  >   alias: avoid-nodes
  >   id:    abc123...
  >   nodes: 
  >     - [NODE_Y_PUBKEY]
  >     - [NODE_Z_PUBKEY]
  ```
  
* Check the content of an existing tag

  ```sh
  $ bos tags
  > tags: 
  >   alias: avoid-nodes
  >   id:    abc123...
  >   nodes: 
  >     - [NODE_Y_PUBKEY]
  >     - [NODE_Z_PUBKEY]
  ```
  
* Use the tag in commands, e.g. with `bos rebalance`

  ```sh
  $ bos rebalance --minutes [number_of_minutes] --amount [AMOUNT_IN_SATS] --max-fee-rate [TOTAL_MAX_FEE_RATE_OF_REBALANCING] --avoid avoid-nodes --in [NODE_C_PUBKEY] --out [NODE_A_PUBKEY]
  ```

### Other commands

There are many additional options that can be used to improve the likelihood of a successful circular rebalancing. There are also many addditonal commands in addition to the rebalancing command. More information on all bos commands can be found in:

  *  [The BoS Github repository](https://github.com/alexbosworth/balanceofsatoshis){:target="_blank"}

  *  [This unofficial documentation repo](https://github.com/niteshbalusu11/BOS-Commands-Document){:target="_blank"} *(note that this page might not be kept up-to-date)*


## Upgrade

* Log in with the "bos" user and upgrade Balance of Satoshis with `npm`

  ```sh
  $ sudo su - bos
  $ npm i -g balanceofsatoshis
  ```
  
## Uninstall

If you want to uninstall Balance of Satoshis:

* Log in with the "root" user and delete the "bos" user

  ```sh
  $ sudo su -
  $ userdel -r bos
  ``` 
  
## Optional: connect your node to a Telegram bot

Balance of Satoshis allows connecting a node to a Telegram bot to receive updates about routing forwards, channel opening and closing events, successful rebalancing payments, payments received, keysend messages etc. It also saves a copy of `channel.backup` (SCB) each time there is a channel being opened or closed.

*Requirements:* a Telegram account

### Create a new TG bot with the BotFather

* Open Telegram, in the general search box look for the [@BotFather](https://t.me/BotFather){:target="_blank"} bot and start a conversation with the bot.
* Type `/start`
* Type `/newbot` and follow the instructions (choose a bot name, username)
* Once the bot is created, the BotFather will give you a HTTP API token, copy it and keep it somewhere safe (like in a password manager). Note that if you lose this token, you could always get it agin by typing `/myBot` in the BotFather feed.
* You also get a link to your bot (in the form: t.me/[your_bot_username]) click on it and it will redirect you to your new bot feed. Keep Telegram opened.

### Torify

To avoid leaking our node IP address to Telegram, we can force bos to use Tor using the [`torify`](https://gitlab.torproject.org/legacy/trac/-/wikis/doc/TorifyHOWTO) utility. To do this, we first need to edit the `torsocks.conf` file.

* Using the "admin" user, edit the `torsocks.conf` file by uncommenting the `AllowOutboundLocalhost` and setting the value to 1. Save (Ctrl+O) and exit (Ctrl+X)
  
  ```sh
  $ sudo nano /etc/tor/torsocks.conf
  ```
  ```ini
  AllowOutboundLocalhost 1
  ```
* Restart Tor
  
  ```sh
  $ sudo systemctl reload tor
  ```

### Use bos to connect your node to the bot

* Change to the "bos" user
  
  ```sh
  $ sudo su - bos
  ```

* Now, we are going to request bos to connect our node to the TG bot
  
  ```sh
  $ /usr/bin/torify bos telegram
  ```
  
* When prompted, enter the HTTP API token that the @BotFather gave you earlier
* Go to your new TG bot feed and type `/connect`. Your bot will give you a connection code
* Copy the connection code and paste it in your SSH session in the second prompt that bos created. You should get a connection message on both your SSH session and your TG bot feed.
* Your TG bot will now receive notifications from your nodes for various events as described in the introduction.
* Leave the temporary session by pressing Ctrl+C

### Permannent connection and autostart on boot 

Now we’ll make sure our Telegram Bot command starts as a service on the Raspberry Pi so it’s always running.

* As user “admin”, create the service file.

  ```sh
  $ sudo nano /etc/systemd/system/bos-telegram.service
  ```
  
* Paste the following configuration. Replace <CONNECTION_CODE> with your own connection code. Save and exit.
  
  ```ini
  # /etc/systemd/system/bos-telegram.service

  [Unit]
  Description=bos-telegram
  Wants=lnd.service
  After=lnd.service

  [Service] 
  ExecStart=/usr/bin/torify /home/bos/.npm-global/bin/bos telegram --connect <CONNECTION_CODE>
  User=bos
  Restart=always
  TimeoutSec=120
  RestartSec=30
  StandardOutput=null
  StandardError=journal

  [Install]
  WantedBy=multi-user.target 
  ```
  
* Enable the service, start it and check the status of the service. You should also receive a connection message from your TG bot ('Connect to ...').
  
  ```sh
  $ sudo systemctl enable bos-telegram.service
  $ sudo systemctl start bos-telegram.service
  $ sudo systemctl status bos-telegram.service
  ``` 
