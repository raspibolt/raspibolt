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
** First, we need to clean the npm cache, install n (Node's version manager) and install the latest stable version.
  ```sh
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

* When using bos, it will prompt you to upgrade when a new upgrade is available. The command to be run to upgrade (with the `admin` user) is

  ```sh
  $ sudo npm i -g balanceofsatoshis
  ```
## Optional: connect your node to a Telegram bot

* Balance of Satoshis allows connecting a node to a Telegram bot to receive updates about routing forwards, channel opening and closing events, successful rebalancing payments, payments received, keysend messages etc. It also saves a copy of `channel.backup` (SCB) each time there is a channel being opened or closed.
* Requirements: a Telegram account

### Create a new TG bot with the BotFather

* Open Telegram, in the general search box look for the [@BotFather](https://t.me/BotFather) bot and start a conversation with the bot.
* Type `/start`
* Type `/newbot` and follow the instructions (choose a bot name, username)
* Once the bot is created, the BotFather will give you a HTTP API token, copy it and keep it somewhere safe (like in a password manager). Note that if you lose this token, you could always get it agin by typing `/myBot` in the BotFather feed.
* You also get a link to your bot (in the form: t.me/[your_bot_username]) click on it and it will redirect you to your new bot feed. Keep Telegram open.

### Use bos to connect your node to the bot

* Open a SSH session with the `admin` user and change to the `bos` user
  
  ```sh
  $ sudo su - bos
  ```

* Now, we are going to request bos to connect our node to the TG bot
  
  ```sh
  $ bos Telegram
  ```
  
* When prompted, enter the HTTP API token that the @BotFather gave you earlier
* Go to your new TG bot feed and type `/connect`. Your bot will give you a connection code
* Copy the connection code and paste it in your SSH session in the second prompt that bos created. You should get a connection message on both your SSH session and your TG bot feed.
* Your TG bot will now receive notifications from your nodes for various events as described in the introduction.
* Leave the temporary session by pressing Ctrl+C

### Establish a permannent connection with TMUX

* Let's install TMUX and create a new session called "bos_tg_bot" (or any name you'd prefer)
  
  ```sh
  $ sudo apt-get install tmux
  $ tmux new -s bos_tg_bot 
  ```
  
* A TMUX window will open. In this window type the following command (replace <connect_id> by the connection code provided by your TG bot
  
  ```sh
  $ bos telegram --connect <connect id>
  ```
  
* Your bot should now be connected to your node. To leave the wondow but keep the TMUX session active, press `Ctrl+b` and then type `d`. You should get a message that you are now detached from the session
* You now have a permanent connection between your node and your TG bot. 
* If you want to make some modifications to the TMUX session, you'll need to re-enter your session, to do this open a SSH session and you can first display the list of all your TMUX sessions and then attach to the one you want ("bos_tg_bot" in this case, or whatever other name you chose)
  
  ```sh
  $ tmux ls
  $ tmux attach -t bos_tg_bot
  ``` 
* To kill the TMUX session, open a SSH session and type (the -t target is the TMUX session name you chose)
  
  ```sh
  $ tmux kill-session -t bos_tg_bot
  ``` 
