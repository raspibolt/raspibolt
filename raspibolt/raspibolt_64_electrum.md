[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [**Bonus**](raspibolt_60_bonus.md) ] -- [ [FAQ](raspibolt_faq.md) ] -- [ [Updates](raspibolt_updates.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

## Bonus guide: Electrum Personal Server

*Difficulty: intermediate*

### Introduction

The best way to safekeep your bitcoin (meaning the best combination of security and usability) is to use a hardware wallet (like [Ledger](https://www.ledgerwallet.com/) or [Trezor](https://trezor.io/)) in combination with your own Bitcoin node. This gives you security, privacy and eliminates the need to trust a third party to verify transactions.

With the RaspiBolt setup, the Bitcoin Core wallet on the node can only be used from the command line as no graphical user interface is installed. As Bitcoin Core does not offer support for hardware wallets, only a "hot wallet" (exposed to the internet) can be realized. 

One possibility to use Bitcoin Core with more functionality is to set up an additional [ElectrumX](https://github.com/kyuupichan/electrumx) server and then use the great [Electrum wallet](https://electrum.org/) (on your regular computer) that integrates with hardware wallets. But this setup is not easy, and the overhead is more than a Raspberry Pi can handle.

The new [Electrum Personal Server](https://github.com/chris-belcher/electrum-personal-server) makes it possible to connect Electrum (using your hardware wallet) directly to your RaspiBolt. In contrast to ElectrumX, this is not a full server that serves multiple users, but your own dedicated backend. 

Before using this setup, please familiarize yourself with all components by setting up your own Electrum wallet, visiting the linked project websites and reading [The Electrum Personal Server Will Give Users the Full Node Security They Need](https://bitcoinmagazine.com/articles/electrum-personal-server-will-give-users-full-node-security-they-need/) in Bitcoin Magazine.

### Install Electrum Personal Server

* Open a "bitcoin" user session and change into the home directory  
  `$ sudo su bitcoin`  
  `$ cd`
* Clone the EPS GitHub repository  
  `$ git clone https://github.com/chris-belcher/electrum-personal-server`
* Copy and edit configuration template  
  `$ cd electrum-personal-server`  
  `$ cp config.cfg_sample config.cfg`  
  `$ nano config.cfg` 
  * Add your wallet master public keys or watch-only addresses to the `[master-public-keys]` and `[watch-only-addresses]` sections. Master public keys for an Electrum wallet can be found in the Electrum client menu `Wallet` -> `Information`.
  * Uncomment and complete the lines  
    `rpc_user = raspibolt`  
    `rpc_password = [PASSWORD_B]`
  * Change the listening `host` to `0.0.0.0`, so that you can reach it from a remote computer. The firewall only accepts connections from within the home network, not from the internet.  
    `host = 0.0.0.0`
* Save & exit

### Initial blockchain scan

Before starting the server for real, the bitcoin addresses need to be generated and looked up on the blockchain.

* Start the server to generate addresses from your master public keys  
  `$ ./server.py`
* Scan the blockchain (this can take several hours, depending on the start date you choose)  
  `$ ./rescan-script.py`

[![initialize server and scan blockchain](https://github.com/Stadicus/guides/raw/master/raspibolt/images/60_eps_rescan.png)](https://github.com/Stadicus/guides/blob/master/raspibolt/images/60_eps_rescan.png)

* The automatic startup (below) does not work yet. So wtart manually in the background  
  `$ nohup ./server.py > /dev/null 2>&1 &`
* Exit the "bitcoin" user session  
  `$ exit`

### Automate startup

###### **The automatic startup does not work yet, skip this part**

* As "admin", set up the systemd unit for automatic start on boot  
  `$ sudo nano /etc/systemd/system/eps.service`

```
# THIS DOES NOT WORK YET...

[Unit]
Description=Electrum Personal Server
After=bitcoind.service

[Service]
Type=simple
ExecStart=/usr/bin/python3 /home/bitcoin/electrum-personal-server/server.py

[Install]
WantedBy=multi-user.target
```

### Connect Electrum

On your regular computer, configure Electrum to use your RaspiBolt:

* In menu: `Tools > Network > Server`

* Uncheck "Select server automatically"

* Enter the IP of your RaspiBolt (eg. 192.168.0.20) in the address field

  [![Connect Electrum to RaspiBolt](https://github.com/Stadicus/guides/raw/master/raspibolt/images/60_eps_electrum-connect.png)](https://github.com/Stadicus/guides/blob/master/raspibolt/images/60_eps_electrum-connect.png)

* `Close` and check connection in tab "Console"

  [![Check Electrum console](https://github.com/Stadicus/guides/raw/master/raspibolt/images/60_eps_electrumwallet.png)](https://github.com/Stadicus/guides/blob/master/raspibolt/images/60_eps_electrumwallet.png)



### Don't trust, verify.

Congratulations, you have now one of the best Bitcoin desktop wallet, capable of securing your bitcoin with support of a hardware wallet, running with your own trustless Bitcoin full node! 



---

<< Back: [Bonus guides](raspibolt_60_bonus.md) 