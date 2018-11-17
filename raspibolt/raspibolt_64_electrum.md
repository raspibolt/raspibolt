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

* Download, verify and extract the latest release (check the [Releases page](https://github.com/chris-belcher/electrum-personal-server/releases) on Github for the correct links)  

  ```
  # create new directory
  $ mkdir electrum-personal-server
  $ cd electrum-personal-server
  
  # download release
  $ wget https://github.com/chris-belcher/electrum-personal-server/archive/eps-v0.1.3.tar.gz
  $ wget https://github.com/chris-belcher/electrum-personal-server/releases/download/eps-v0.1.3/eps-v0.1.3.tar.gz.asc
  $ wget https://raw.githubusercontent.com/chris-belcher/electrum-personal-server/master/pgp/pubkeys/belcher.asc
  
  # verify the signature of Chris Belcher and the release: check the reference values!
  $ gpg belcher.asc
  > 0A8B038F5E10CC2789BFCFFFEF734EA677F31129
  
  $ gpg --import belcher.asc
  $ gpg --verify eps-v0.1.3.tar.gz.asc
  > gpg: Good signature from "Chris Belcher <false@email.com>" [unknown]
  > Primary key fingerprint: 0A8B 038F 5E10 CC27 89BF  CFFF EF73 4EA6 77F3 1129
  
  $ tar -xvf eps-v0.1.3.tar.gz  
  ```

* Rename the folder to not show the release   
  `$ mv electrum-personal-server-eps-v0.1.3/ eps`

* Copy and edit configuration template  
  `$ cd eps`  
  `$ cp config.cfg_sample config.cfg`  
  `$ nano config.cfg` 

  * Add your wallet master public keys or watch-only addresses to the `[master-public-keys]` and `[watch-only-addresses]` sections. Master public keys for an Electrum wallet can be found in the Electrum client menu `Wallet` -> `Information`.

  * Uncomment and complete the lines  
    `rpc_user = raspibolt`  
    `rpc_password = [PASSWORD_B]`

  * Change the listening `host` to `0.0.0.0`, so that you can reach it from a remote computer. The firewall only accepts connections from within the home network, not from the internet.  
    `host = 0.0.0.0`

* Save and exit

* Configure firewall to allow incoming requests (please check if you need to adjust the subnet mask as [described in original setup](https://github.com/Stadicus/guides/blob/master/raspibolt/raspibolt_20_pi.md#enabling-the-uncomplicated-firewall))
  ```
  $ sudo ufw allow from 192.168.0.0/24 to any port 50002 comment 'allow EPS from local network'
  $ sudo ufw enable
  $ sudo ufw status
  ```

### Enable Bitcoin Core wallet 
Electrum Personal Server uses the Bitcoin Core wallet with "watch-only" addresses to monitor the blockchain for you.

* Edit "bitcoin.conf" file by altering `disablewallet` to value `0`. Save and exit.  
  `$ sudo nano /home/bitcoin/.bitcoin/bitcoin.conf`
```
# Bitcoind options
disablewallet=0
```

* Copy updated "bitcoin.conf" to user "admin" for credentials  
  `$ sudo cp /home/bitcoin/.bitcoin/bitcoin.conf /home/admin/.bitcoin/`
  
* Restart bitcoind
  `$ sudo systemctl restart bitcoind`

### Initial blockchain scan

Before starting the server for real, the bitcoin addresses need to be generated and looked up on the blockchain.

* switch to the eps directory  
  `$ cd eps`

* Start the server to generate addresses from your master public keys  
  `$ ./server.py`
  
* Scan the blockchain (this can take several hours, depending on the start date you choose)  
  `$ ./rescan-script.py`

[![initialize server and scan blockchain](https://github.com/Stadicus/guides/raw/master/raspibolt/images/60_eps_rescan.png)](https://github.com/Stadicus/guides/blob/master/raspibolt/images/60_eps_rescan.png)

* Exit the "bitcoin" user session  
  `$ exit`

### Automate startup

* As "admin", set up the systemd unit for automatic start on boot, save and exit  
  `$ sudo nano /etc/systemd/system/eps.service`

```
[Unit]
Description=Electrum Personal Server
After=bitcoind.service

[Service]
ExecStart=/usr/bin/python3 /home/bitcoin/electrum-personal-server/eps/server.py  /home/bitcoin/electrum-personal-server/eps
User=bitcoin
Group=bitcoin
Type=simple
KillMode=process
TimeoutSec=60
Restart=always
RestartSec=60

[Install]
WantedBy=multi-user.target
```

* Enable and start the eps.service unit  
  `$ sudo systemctl enable eps.service`  
  `$ sudo systemctl start eps.service`
  
* Check the startup process for Electrum Personal Server  
  `$ tail -f /home/bitcoin/electrum-personal-server/eps/debug.log`

### Connect Electrum

On your regular computer, configure Electrum to use your RaspiBolt:

* In menu: `Tools > Network > Server`

* Uncheck "Select server automatically"

* Enter the IP of your RaspiBolt (eg. 192.168.0.20) in the address field

  [![Connect Electrum to RaspiBolt](https://github.com/Stadicus/guides/raw/master/raspibolt/images/60_eps_electrum-connect.png)](https://github.com/Stadicus/guides/blob/master/raspibolt/images/60_eps_electrum-connect.png)

* `Close` and check connection in tab "Console"

  [![Check Electrum console](https://github.com/Stadicus/guides/raw/master/raspibolt/images/60_eps_electrumwallet.png)](https://github.com/Stadicus/guides/blob/master/raspibolt/images/60_eps_electrumwallet.png)
  
* This can also be achived by starting the Electrum wallet with the following command line arguments:  
  `--oneserver --server 192.168.0.20:50002:s`

### Update

If at a later stage you want to update your Electrum Personal server, do as follows:

* As "admin" stop the EPS systemd unit  
  `$ sudo systemctl stop eps`
* Start a new bitcoin user session  
  `$ sudo su bitcoin`  
  `$ cd ~/electrum-personal-server`  
* Download, verify and extract the new release as explained in the box above
* Copy the new release over the existing one (adjust directory name)  
  `$ cp -R electrum-personal-server-eps-v0.1.9/* eps` 
* Exit "bitcoin" user session and start EPS systemd unit  
  `$ exit`  
  `$ sudo systemctl start eps`

---

### Don't trust, verify.

Congratulations, you have now one of the best Bitcoin desktop wallet, capable of securing your bitcoin with support of a hardware wallet, running with your own trustless Bitcoin full node! 

---

<< Back: [Bonus guides](raspibolt_60_bonus.md) 
