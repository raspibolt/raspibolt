[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ **Lightning** ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [Bonus](raspibolt_60_bonus.md) ] -- [ [FAQ](raspibolt_faq.md) ] -- [ [Updates](raspibolt_updates.md) ]

-------
### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi
--------

# Lightning: LND

We will download and install the LND (Lightning Network Daemon) by [Lightning Labs](http://lightning.engineering/). Check out their [Github repository](https://github.com/lightningnetwork/lnd/blob/master/README.md) for a wealth of information about their open-source project and Lightning in general.

### Public IP script

> *Note: this is a temporary solution, as LND is currently working on adding this functionality*  
> *https://github.com/lightningnetwork/lnd/pull/1109*

To announce our public IP address to the Lightning network, we first need to get our address from a source outside our network. As user “admin”, create the following script that checks the IP every 10 minutes and stores it locally.

* As user "admin", create the following script, save and exit  
  `$ sudo nano /usr/local/bin/getpublicip.sh`
```bash
#!/bin/bash
# RaspiBolt LND Mainnet: script to get public ip address
# /usr/local/bin/getpublicip.sh

echo 'getpublicip.sh started, writing public IP address every 10 minutes into /run/publicip'
while [ 0 ];
    do
    printf "PUBLICIP=$(curl -vv ipinfo.io/ip 2> /run/publicip.log)\n" > /run/publicip;
    sleep 600
done;
```
* make it executable  
  `$ sudo chmod +x /usr/local/bin/getpublicip.sh`

* create corresponding systemd unit, save and exit  
  `$ sudo nano /etc/systemd/system/getpublicip.service`

```bash
# RaspiBolt LND Mainnet: systemd unit for getpublicip.sh script
# /etc/systemd/system/getpublicip.service

[Unit]
Description=getpublicip.sh: get public ip address from ipinfo.io
After=network.target

[Service]
User=root
Group=root
Type=simple
ExecStart=/usr/local/bin/getpublicip.sh
ExecStartPost=/bin/sleep 5
Restart=always

RestartSec=600
TimeoutSec=10

[Install]
WantedBy=multi-user.target
```
* enable systemd startup  
  `$ sudo systemctl enable getpublicip`  
  `$ sudo systemctl start getpublicip`  
  `$ sudo systemctl status getpublicip`  

* check if data file has been created  
  `$ cat /run/publicip`  
  `PUBLICIP=91.190.22.151`

### Install LND
Now to the good stuff: download, verify and install the LND binaries.
```
$ cd /home/admin/download
$ wget https://github.com/lightningnetwork/lnd/releases/download/v0.5-beta/lnd-linux-armv7-v0.5-beta.tar.gz
$ wget https://github.com/lightningnetwork/lnd/releases/download/v0.5-beta/manifest-v0.5-beta.txt
$ wget https://github.com/lightningnetwork/lnd/releases/download/v0.5-beta/manifest-v0.5-beta.txt.sig
$ wget https://keybase.io/roasbeef/pgp_keys.asc

$ sha256sum --check manifest-v0.5-beta.txt --ignore-missing
> lnd-linux-armv7-v0.5-beta.tar.gz: OK

$ gpg ./pgp_keys.asc
> BD599672C804AF2770869A048B80CD2BB8BD8132

$ gpg --import ./pgp_keys.asc
$ gpg --verify manifest-v0.5-beta.txt.sig
> gpg: Good signature from "Olaoluwa Osuntokun <laolu32@gmail.com>" [unknown]
> Primary key fingerprint: BD59 9672 C804 AF27 7086  9A04 8B80 CD2B B8BD 8132
>      Subkey fingerprint: F803 7E70 C12C 7A26 3C03  2508 CE58 F7F8 E20F D9A2

$ tar -xzf lnd-linux-armv7-v0.5-beta.tar.gz
$ ls -la
$ sudo install -m 0755 -o root -g root -t /usr/local/bin lnd-linux-armv7-v0.5-beta/*
$ lnd --version
> lnd version 0.5.0-beta commit=3b2c807288b1b7f40d609533c1e96a510ac5fa6d
```
![Checksum LND](images/40_checksum_lnd.png)

### LND configuration
Now that LND is installed, we need to configure it to work with Bitcoin Core and run automatically on startup.

* Open a "bitcoin" user session  
  `$ sudo su bitcoin` 

* Create the LND working directory and the corresponding symbolic link  
  `$ mkdir /mnt/hdd/lnd`  
  `$ ln -s /mnt/hdd/lnd /home/bitcoin/.lnd`  
  `$ cd`  
  `$ ls -la`

![Check symlink LND](images/40_symlink_lnd.png)

* Create the LND configuration file and paste the following content (adjust to your alias). Save and exit.  
  `$ nano /home/bitcoin/.lnd/lnd.conf`

```bash
# RaspiBolt LND Mainnet: lnd configuration
# /home/bitcoin/.lnd/lnd.conf

[Application Options]
debuglevel=info
maxpendingchannels=5
alias=YOUR_NAME [LND]
color=#68F442

[Bitcoin]
bitcoin.active=1

# enable either testnet or mainnet
bitcoin.testnet=1
#bitcoin.mainnet=1

bitcoin.node=bitcoind

[autopilot]
autopilot.active=1
autopilot.maxchannels=5
autopilot.allocation=0.6
```
:point_right: Additional information: [sample-lnd.conf](https://github.com/lightningnetwork/lnd/blob/master/sample-lnd.conf) in the LND project repository

* exit the "bitcoin" user session back to "admin"  
  `$ exit`

* create LND systemd unit and with the following content. Save and exit.  
  `$ sudo nano /etc/systemd/system/lnd.service` 

```bash
# RaspiBolt LND Mainnet: systemd unit for lnd
# /etc/systemd/system/lnd.service

[Unit]
Description=LND Lightning Daemon
Wants=bitcoind.service
After=bitcoind.service

# for use with sendmail alert
#OnFailure=systemd-sendmail@%n

[Service]
# get var PUBIP from file
EnvironmentFile=/run/publicip

ExecStart=/usr/local/bin/lnd --externalip=${PUBLICIP}
PIDFile=/home/bitcoin/.lnd/lnd.pid
User=bitcoin
Group=bitcoin
LimitNOFILE=128000
Type=simple
KillMode=process
TimeoutSec=180
Restart=always
RestartSec=60

[Install]
WantedBy=multi-user.target
```
* enable and start LND  
  `$ sudo systemctl enable lnd.service`  
  `$ sudo systemctl start lnd`  
  `$ systemctl status lnd`  

* monitor the LND logfile in realtime (exit with `Ctrl-C`)  
  `$ sudo journalctl -f -u lnd`

![LND startup log](images/40_start_lnd.png)

### LND wallet setup

Once LND is started, the process waits for us to create the integrated Bitcoin wallet (it does not use the bitcoind wallet). 
* Start a "bitcoin" user session   
  `$ sudo su bitcoin`

* Create the LND wallet  

  `$ lncli --network=testnet create` 

* If you want to create a new wallet, enter your `password [C]` as wallet password, select `n` regarding an existing seed and enter the optional `password [D]` as seed passphrase. A new cipher seed consisting of 24 words is created.

![LND new cipher seed](images/40_cipher_seed.png)

These 24 words, combined with your passphrase (optional `password [D]`)  is all that you need to restore your Bitcoin wallet and all Lighting channels. The current state of your channels, however, cannot be recreated from this seed, this requires a continuous backup and is still under development for LND.

:warning: This information must be kept secret at all times. **Write these 24 words down manually on a piece of paper and store it in a safe place.** This piece of paper is all an attacker needs to completely empty your wallet! Do not store it on a computer. Do not take a picture with your mobile phone. **This information should never be stored anywhere in digital form.**

* exit "bitcoin" user session  
  `$ exit`

### Assign LND permissions to "admin"

* Check if permission files `admin.macaroon` and `readonly.macaroon` have been created.  
  `$ ls -la /home/bitcoin/.lnd/`

![Check macaroon](images/40_ls_macaroon.png)

* Copy permission files and TLS cert to user "admin" to use `lncli`  
  `$ cd /home/bitcoin/`  
  `$ sudo cp --parents .lnd/data/chain/bitcoin/mainnet/admin.macaroon /home/admin/`  
  `$ sudo cp /home/bitcoin/.lnd/tls.cert /home/admin/.lnd`  
  `$ sudo chown -R admin:admin /home/admin/.lnd/`  
* Make sure that `lncli` works by unlocking your wallet (enter `password [C]` ) and getting some node infos.   
  `$ lncli --network=testnet unlock`
* Monitor the LND startup progress until it caught up with the testnet blockchain (about 1.3m blocks at the moment). This can take up to 2 hours, after that you see a lot of very fast chatter (exit with `Ctrl-C`).
  `$ sudo journalctl -f -u lnd`

### Get some testnet Bitcoin

Now your Lightning node is ready. To use it in testnet, you can get some free testnet bitcoin from a faucet.
* Generate a new Bitcoin address to receive funds on-chain  
  `$ lncli --network=testnet newaddress np2wkh`  
  `> "address": "2NCoq9q7............dkuca5LzPXnJ9NQ"` 

* Get testnet bitcoin:  
  https://testnet.manu.backend.hamburg/faucet

* Check your LND wallet balance  
  `$ lncli --network=testnet walletbalance`  

* Monitor your transaction (the faucet shows the TX ID) on a Blockchain explorer:  
  https://testnet.smartbit.com.au

### LND in action
As soon as your funding transaction is mined and confirmed, LND will start to open and maintain channels. This feature is called "Autopilot" and is configured in the "lnd.conf" file. If you would like to maintain your channels manually, you can disable the autopilot.

Get yourself a payment request on [StarBlocks](https://starblocks.acinq.co/#/) or [Y’alls](https://yalls.org/) and move some coins!

* `$ lncli --network=testnet listpeers`  
* `$ lncli --network=testnet listchannels`  
* `$ lncli --network=testnet sendpayment --pay_req=lntb32u1pdg7p...y0gtw6qtq0gcpk50kww`  
* `$ lncli --network=testnet listpayments`  

:point_right: see [Lightning API reference](http://api.lightning.community/) for additional information

-----

### LND upgrade
If you want to upgrade to a new release of LND in the future, check out the FAQ section:  
[How to upgrade LND](https://github.com/Stadicus/guides/blob/master/raspibolt/raspibolt_faq.md#how-to-upgrade-lnd-bin-)

-----

### Before proceeding to mainnet 
This is the point of no return. Up until now, you can just start over. Experiment with testnet bitcoin. Open and close channels on the testnet. 

Once you switch to mainnet and send real bitcoin to your RaspiBolt, you have "skin in the game". 

* Make sure your RaspiBolt is working as expected.
* Get a little practice with `bitcoin-cli` and its options (see [Bitcoin Core RPC documentation](https://bitcoin-rpc.github.io/))
* Do a dry run with `lncli` and its many options (see [Lightning API reference](http://api.lightning.community/))
* Try a few restarts (`sudo shutdown -r now`), is everything starting fine?

---
Next: [Mainnet >>](raspibolt_50_mainnet.md)
