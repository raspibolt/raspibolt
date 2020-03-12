---
layout: default
title: FAQ
nav_order: 90
---
# Frequently Asked Questions
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Can I get rich by routing Lightning payments?
Nobody knows. Probably not. You will get minimal fees. I don't care. Enjoy the ride!

## Can I attach the Ext4 formatted hard disk to my Windows computer?
The Ext4 file system is not compatible with standard Windows, but with additional software like  [Linux File Systems](https://www.paragon-software.com/home/linuxfs-windows/#faq) by Paragon Software (they offer a 10 days free trial) it is possible.

## What do all the Linux commands do?
This is a (very) short list of common Linux commands for your reference. For a specific command, you can enter `man [command]` to display the manual page (type `q` to exit).

| command | description | example |
| -- | -- | -- |
| `cd` | change to directory | `cd /home/bitcoin` |
| `ls` | list directory content | `ls -la /mnt/ext` |
| `cp` | copy | `cp file.txt newfile.txt` |
| `mv` | move | `mv file.txt moved_file.txt`
| `rm` | remove | `rm temporaryfile.txt`
| `mkdir` | make directory | `mkdir /home/bitcoin/newdirectory`
| `ln` | make link | `ln -s /target_directory /link`
| `sudo` | run command as superuser | `sudo nano textfile.txt`
| `su` | switch to different user account | `sudo su bitcoin`
| `chown` | change file owner  | `chown bitcoin:bitcoin myfile.txt`
| `chmod` | change file permissions | `chmod +x executable.script`
| `nano` | text file editor | `nano textfile.txt`
| `tar` | archive tool | `tar -cvf archive.tar file1.txt file2.txt`
| `exit` | exit current user session | `exit`
| `systemctl` | control systemd service | `sudo systemctl start bitcoind`
| `journalctl` | query systemd journal | `sudo journalctl -u bitcoind`
| `htop` | monitor processes & resource usage | `htop`
| `shutdown` | shutdown or restart Pi | `sudo shutdown -r now`


## Where can I get more information?
If you want to learn more about Bitcoin and are curious about the inner workings of the Lightning Network, the following articles in Bitcoin Magazine offer a very good introduction:

* [What is Bitcoin?](https://bitcoinmagazine.com/guides/what-bitcoin)
* [Understanding the Lightning Network](https://bitcoinmagazine.com/articles/understanding-the-lightning-network-part-building-a-bidirectional-payment-channel-1464710791/)
* [Bitcoin resources](https://www.lopp.net/bitcoin-information.html) and [Lightning Network resources](https://www.lopp.net/lightning-information.html) by Jameson Lopp
* Lightning Network resources: [lnroute.com](http://lnroute.com)


## How to upgrade Bitcoin Core?
The latest release can be found on the Github page of the Bitcoin Core project. Make sure to read the Release Notes, as these can include important upgrade information.
https://github.com/bitcoin/bitcoin/releases

* You might want to create a [backup of your system](raspibolt_65_system-recovery.md) first.

* As "admin" user, stop the lnd and bitcoind system units
  `$ sudo systemctl stop lnd`
  `$ sudo systemctl stop bitcoind`

* Download, verify, extract and install the Bitcoin Core binaries as described in the [Bitcoin section](raspibolt_30_bitcoin.md) of this guide.

* Start the bitcoind and lnd system units
  `$ sudo systemctl start bitcoind`
  `$ sudo systemctl start lnd`

:information_source: Please be aware that the internal data structure of Bitcoin Core changed from 0.16 to 0.17. If you download the blockchain using a different computer, make sure to use the same version. If you upgrade to 0.17, the data structure is converted automatically (can take a few hours) and it's not possible to use that data with older versions anymore.

## How to upgrade LND?
Upgrading LND can lead to a number of issues. Please **always** read the [LND release notes](https://github.com/lightningnetwork/lnd/releases) completely to understand the changes. These also cover a lot of additional topics and many new features not mentioned here.

* You might want to create a [backup of your system](raspibolt_65_system-recovery.md) first

* Check your lnd version
  `$ lnd --version`

Starting with version 0.5, upgrading LND got more reliable. When upgrading from an earlier version (< v0.5), please follow the detailed procedure in the next section, otherwise you can do a standard update described here.

* As "admin" user, stop lnd system unit
  `$ sudo systemctl stop lnd`

* Remove old stuff, then download, verify and install the latest LND binaries as described in the [Lightning section](raspibolt_40_lnd.md) of this guide.

* Restart the services with the new configuration and unlock the wallet with the "bitcoin" user.
  ```
  $ sudo systemctl restart bitcoind
  $ sudo systemctl restart lnd
  $ sudo su - bitcoin
  $ lncli unlock
  $ exit
  ```

### Upgrading LND Version < 0.5

* I would recommend to close your channels first, as there have been a number of issues with stuck funds that require very technical work to resolve them.

* As "admin" user, stop lnd system unit.
  `$ sudo systemctl stop lnd`

* delete the macaroon files.
  `$ sudo rm /home/bitcoin/.lnd/*.macaroon`

* Remove old stuff, then download, verify and install the latest LND binaries
  ```
  $ cd /home/admin/download
  $  rm -f lnd-linux* manifest* pgp_keys.asc
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
  $ sudo install -m 0755 -o root -g root -t /usr/local/bin lnd-linux-armv7-v0.5-beta/*
  $ lnd --version
  > lnd version 0.5.0-beta commit=3b2c807288b1b7f40d609533c1e96a510ac5fa6d
  ```

* Starting with 0.5 release, LND expects two different ZMQ sockets for blocks and transactions. Edit `bitcoin.conf`, save and exit.
  ```
  $ sudo nano /home/bitcoin/.bitcoin/bitcoin.conf
  zmqpubrawblock=tcp://127.0.0.1:28332
  zmqpubrawtx=tcp://127.0.0.1:28333
  ```
* The option `debughtlc` is no longer allowed and needs to be deleted. Edit `lnd.conf`, save and exit.
  ```
  $ sudo nano /home/bitcoin/.lnd/lnd.conf
  #debughtlc=true
  ```
* Restart the services with the new configuration and unlock the wallet with the "bitcoin" user. This creates a new set of macaroons (explained below).
  ```
  $ sudo systemctl restart bitcoind
  $ sudo systemctl restart lnd
  $ sudo su - bitcoin
  $ lncli unlock
  $ exit
  ```

The macaroons are now located under the chain data directory for each supported network. For example, the mainnet admin macaroon for Bitcoin is now located here:
  `/home/bitcoin/.lnd/data/chain/bitcoin/mainnet/admin.macaroon`

* Copy the new set of macaroons to your admin user, otherwise this user cannot use `lncli`. The new macaroon location also affects the [auto-unlock script](raspibolt_6A_auto-unlock.md) you might be running.
  * For **mainnet** use these commands:
    ```
    $ rm /home/admin/.lnd/admin.macaroon
    $ mkdir -p /home/admin/.lnd/data/chain/bitcoin/mainnet/
    $ sudo cp /home/bitcoin/.lnd/data/chain/bitcoin/mainnet/admin.macaroon /home/admin/.lnd/data/chain/bitcoin/mainnet/
    $ sudo cp /home/bitcoin/.lnd/tls.cert /home/admin/.lnd
    $ sudo chown -R admin:admin /home/admin/.lnd
    $ lncli getinfo
    ```

  * If you're on **testnet**, use the commands for mainnet above, but replace the directory "mainnet" with "testnet". You will also need to always use `lncli --network=testnet `, so for example `lncli --network=testnet getinfo`. See the [release notes](https://github.com/lightningnetwork/lnd/releases) on how to create an alias to avoid typing this every time.

* Don't forget to unlock your wallet & check logs
  `$ lncli unlock`
  `$ sudo journalctl -u lnd -f`

## Why do I need the 32 bit version of Bitcoin when I have a Raspberry Pi 4 with a 64 bit processor?
At the time of this writing (March 2020) there is no 64 bit operating system for the Raspberry Pi developed yet. The 64 bit processors of the Raspberry Pi 4 versions are running in 32 bit compatibility mode with a 32 bit operating system.

## Setting a fixed address on the Raspberry Pi
If your router does not support setting a static ip address for a single device, you can also do this directly on the Raspberry Pi.

This can be done by configuring the DHCP-Client (on the Pi) to advertise a static IP address to the DHCP-Server (often the router) before it automatically assigns a different one to the Raspberry Pi.

1. Get ip address of default gateway (router).
   Run `netstat -r -n` and choose the IP address from the gateway column which is not `0.0.0.0`. In my occasion it's `192.168.178.1`.

2. Configure the static IP address for the Pi, the gateway path and a DNS server.
   The configuration for the DHCP client (Pi) is located in the `/etc/dhcpcd.conf` file:
   ```
   sudo nano /etc/dhcpcd.conf
   ```
   The following snippet is an example of a sample configuration. Change the value of `static routers` and `static domain_name_servers` to the IP of your router (default gateway) from step 1. Be aware of giving the Raspberry Pi an address which is **OUTSIDE** the range of addresses which are assigned by the DHCP server. You can get this range by looking under the router configurations page and checking for the range of the DHCP addresses. This means, that if the DHCP range goes from `192.168.178.1` to `192.168.2.99` you're good to go with the IP `192.168.178.100` for your Raspberry Pi.

   Add the following to the `/etc/dhcpcd.conf` file:
   ```
   # Configuration static IP address (CHANGE THE VALUES TO FIT FOR YOUR NETWORK)
   interface eth0
   static ip_address=192.168.178.100/24
   static routers=192.168.178.1
   static domain_name_servers=192.168.178.1
   ```

3. Restart networking system
  `sudo /etc/init.d/networking restart`

------

<< Back: [Troubleshooting](raspibolt_70_troubleshooting.md)
