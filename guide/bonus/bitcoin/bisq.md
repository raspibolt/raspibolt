---
layout: default
title: Bisq
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---

# Bonus guide: Bisq

{: .no_toc }

---

[Bisq](https://bisq.network/){:target="_blank"} is a decentralized bitcoin exchange.
It is a desktop application that aims at providing a secure, private and censorship-resistant way of exchanging bitcoin for national currencies and other cryptocurrencies over the internet.

Difficulty: Easy
{: .label .label-green }

Status: Tested v3
{: .label .label-green }

![Bisq](../../../images/bisq.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Requirements

* Bitcoin Core

---

## Introduction

The guide will show you how to:

1. Configure BTC Core allowing Bisq to run its SPV wallet and whitelisting the P2P connection
1. Install Bisq on your personal computer
1. Connect Bisq to your Bitcoin Core own node in your local network or via remote Tor and depending on your OS personal computer
1. Securely set up Bisq

---

## Installation

* Download Bisq on your personal computer using the appropriate binary for your OS: [https://bisq.network/downloads/](https://bisq.network/downloads/){:target="_blank"}

* Verify the downloaded binary following [Bisq guidelines](https://bisq.wiki/Downloading_and_installing){:target="_blank"}

* Once you've verified the integrity of the downloaded Bisq binary, install it on your personal computer but do NOT launch Bisq yet!

---

### Configure Firewall

* Configure the firewall to allow incoming requests to Bitcoin Core from the local network.

  ```sh
  $ sudo ufw allow 8333/tcp comment 'allow Bitcoin Core' 
  ```

### Configure Bitcoin Core

For Bisq to connect to your Bitcoin Core node, the bloom filters have to be activated and the P2P connection has to be whitelisted.

* Open `bitcoin.conf` to add `peerbloomfilters=1` under `"# Bitcoin daemon"` to activate bloom filters

  ```sh
  $ sudo nano /data/bitcoin/bitcoin.conf
  ```

  ```sh
  # Filters
  peerbloomfilters=1   # for Bisq
  prune=0              # for Bisq (disable pruning old blocks)
  ```

* Add the following line under `"whitelist=download@127.0.0.1       # for Electrs"` line to whitelist our own P2P connection.

  ```sh
  whitelist=bloomfilter@192.168.0.0/16   # for Bisq
  ```

* By default `bind` configuration of Bitcoin Core is `0.0.0.0`. To connect Bisq from your personal computer in your local network, comment or delete `bind=127.0.0.1`. Save and exit.

  ```sh
  #bind=127.0.0.1
  ```

* Restart Bitcoin Core (if you didn't set up automatic LND wallet unlock, remember to unlock it after `bitcoind` restarted).

  ```sh
  $ sudo systemctl restart bitcoind
  ```

* Still with user admin, wait a few minutes until Bitcoin Core starts completely and run the following command and make a copy of the .onion address and port (e.g. here, `123...abc.onion:8333`).

  ```sh
  $ bitcoin-cli getnetworkinfo | grep address.*onion
  > "address": "123...abc.onion:8333"
  ```

## Connect Bisq to your own node

For Linux and MacOS, we will start Bisq the first time using the command line to force it to connect to your Bitcoin node only.

On your personal computer where you installed Bisq, depending on your OS

**For Linux:**

* Open a command line terminal, we will start Bisq with two flags that will force it to connect to our own node only. Bisq should connect to your node on startup.

From local network connection, replace `192.168.X.X:8333` with your own node IP address.
  
  ```sh
  $ /opt/bisq/bin/Bisq -btcNodes=192.168.X.X:8333 -useTorForBtc=false
  ```

From remote connection, replace `123...abc.onion:8333` with your own Bitcoin Core .onion address that you obtained above.
  
  ```sh
  $ /opt/bisq/bin/Bisq -btcNodes=123...abc.onion:8333 -useTorForBtc=true
  ```

* Wait a few minutes until Bisq is up to date with the current state of the blockchain and go back to "Settings" > "Network info" to check that only your own node local IP address or onion address is listed in the first table.

* Check that the "Bitcoin network peers" counter at the bottom right of the window is equal to 1.

**For MacOS:**

* Open a command line terminal, we will start Bisq with two flags that will force it to connect to our own node only.

* From local network connection, replace `192.168.X.X:8333` with your own node IP address.
  
  ```sh
  $ Bisq -btcNodes=192.168.X.X:8333 -useTorForBtc=false
  ```

* Use the full application path if Bisq isn't part of your system's PATH. First find where Bisq is installed (example with drag and drop install):

  ```sh
  $ ls /Applications | grep -i bisq
  ```

* Then use that path (example):

  ```sh
  $ /Applications/Bisq.app/Contents/MacOS/Bisq -btcNodes=192.168.X.X:8333 -useTorForBtc=false
  ```

* From remote connection, replace `123...abc.onion:8333` with your own Bitcoin Core .onion address that you obtained above.
  
  ```sh
  $ Bisq -btcNodes=123...abc.onion:8333 -useTorForBtc=true
  ```

* Using full application path if Bisq isn't part of your system's PATH (example from previous section on local network connection):

  ```sh
  $ /Applications/Bisq.app/Contents/MacOS/Bisq -btcNodes=123...abc.onion:8333 -useTorForBtc=true
  ```

* Wait a few minutes until Bisq is up to date with the current state of the blockchain and go back to "Settings" > "Network info" to check that only your own node local IP address or onion address is listed in the first table.

* Check that the "Bitcoin network peers" counter at the bottom right of the window is equal to 1.

**For Windows**, Bisq is automatically opened using the GUI, we can't start Bisq the first time using the command line to force it to connect to your Bitcoin node only, so it will connect to several remote Bitcoin nodes via Tor, don't worry, we are going to change fastly this configuration:

* Start Bisq using the GUI icon.

* Click on the "Settings" > "Network info" tab.

* In the "Bitcoin Network" section, click on "Use custom Bitcoin Core nodes".

* In the box just below, paste your node IP address (`192.168.X.X`) or Bitcoin Core node `.onion` address `(e.g: 123...abc.onion:8333)` that you obtained above, depending if you are connecting locally or remotely via Tor.

* Check/uncheck "Use Tor for Bitcoin network" under Settings > Network, depending if you are connecting locally or remotely via Tor.

* Click on any other tab at the top. Bisq will ask you to shutdown the program to make your change effective.

* Click "Shutdown"

* Start Bisq again using the GUI icon.

* Wait a few minutes until Bisq is up to date with the current state of the blockchain and go back to "Settings" > "Network info" to check that only your own node local IP address or onion address is listed in the first table.

* Check that the "Bitcoin network peers" counter at the bottom right of the window is equal to 1.

🥳 Congrats! Bisq is now connected to your node.

---

## Bisq configuration

This section will highlight key configuration options focusing on privacy and security only.  

For the national currency account and trading configuration options, please refer to the Bisq [website](https://bisq.network/getting-started/){:target="_blank"} and [wiki](https://bisq.wiki/Main_Page){:target="_blank"}

### Bitcoin Explorer

* Click to "Settings" > "Preferences"

* Click on the three dots of the "Bitcoin Explorer" section

* Use the following information:
  * Name: Choose a name (e.g., `RaspiBolt`)
  * Transaction URL: `https://raspibolt.local:4000/tx/` (replace raspibolt.local with your node IP address if required)
  * Address URL: `https://raspibolt.local:4000/address/` (replace raspibolt.local with your node IP address if required)

* Click "Save"

### Wallet seed

* Click on the "Account" tab

* Click on "Wallet seed"

* Read the pop-up message carefully. Once read, click on "I understand"

* Read carefully the new warning window that appears and click on "Yes and don't ask me again'

* Carefully copy the seed words and wallet date on a paper backup (NOT on any computer)

* Read the "Information" section to understand the importance of the seed words and wallet date

### Backup

* Still in the "Account" tab, now click on "Backup"

* Click on "Select backup location" and select a folder where your Bisq data will be backed-up

* Click on "Backup now (backup is not encrypted)"

### Wallet password

* Still in the "Account" tab, click on "Wallet password"

* Set a strong unique password (e.g., using your password manager) and click on "Set password"

* In the pop-up window that just appeared, read the information and then click on "Set password, I already made a backup". Once done, close the confirmation window.

Congrats! You're now ready to start buying and selling Bitcoin on Bisq in a secure and private way.

---

## Update

Bisq will let you know when a new update is available. Simply follow the instructions on their announcement to download, verify and install the update.

![Bisq update](../../../images/bisq-update.png)

---

## Uninstall

### Uninstall BTC Core configuration

If you stop using Bisq for an extended period of time, it is worth deactivating the bloom filter feature in Bitcoin Core.

* In `bitcoin.conf`, comment out the following line. Save and exit.

  ```sh
  $ sudo nano /data/bitcoin/bitcoin.conf
  ```

  ```sh
  #peerbloomfilters=1  # for Bisq
  #whitelist=bloomfilter@0.0.0.0   # for Bisq
  ```

* Restart Bitcoin Core (if you didn't set up automatic LND wallet unlock, remember to unlock it after `bitcoind` restarted)

  ```sh
  $ sudo systemctl restart bitcoind
  ```

### Uninstall FW configuration

* Delete firewall rule with the comment 'allow Bitcoin Core' identifying the number of the rule

  ```sh
  $ sudo ufw status numbered
  ```

  ```sh
  Status: active
     To                         Action      From
     --                         ------      ----
  [X] 8333                      ALLOW IN    Anywhere            # allow Bitcoin Core
  ```

* Delete the rule with the correct number and confir with "yes"

  ```sh
  $ sudo ufw delete X
  ```

<br /><br />

---

<< Back: [+ Bitcoin](index.md)
