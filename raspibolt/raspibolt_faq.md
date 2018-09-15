[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [Bonus](raspibolt_60_bonus.md) ] -- [ **FAQ** ] -- [ [Updates](raspibolt_updates.md) ]

-------
### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi
--------

# FAQ

### Can I get rich by routing Lightning payments?
Nobody knows. Probably not. You will get minimal fees. I don't care. Enjoy the ride! 

### Can I attach the Ext4 formatted hard disk to my Windows computer?
The Ext4 file system is not compatible with standard Windows, but with additional software like  [Linux File Systems](https://www.paragon-software.com/home/linuxfs-windows/#faq) by Paragon Software (they offer a 10 days free trial) it is possible. 

### What do all the Linux commands do?
This is a (very) short list of common Linux commands for your reference. For a specific command, you can enter `man [command]` to display the manual page (type `q` to exit).

| command | description | example |
| -- | -- | -- |
| `cd` | change to directory | `cd /home/bitcoin` |
| `ls` | list directory content | `ls -la /mnt/hdd` |
| `cp` | copy | `cp file.txt newfile.txt` |
| `mv` | move | `mv file.txt moved_file.txt`
| `rm` | remove | `mv temporaryfile.txt`
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


### Where can I get more information? 
If you want to learn more about Bitcoin and are curious about the inner workings of the Lightning Network, the following articles in Bitcoin Magazine offer a very good introduction:

* [What is Bitcoin?](https://bitcoinmagazine.com/guides/what-bitcoin)
* [Understanding the Lightning Network](https://bitcoinmagazine.com/articles/understanding-the-lightning-network-part-building-a-bidirectional-payment-channel-1464710791/)
* Bitcoin resources: http://lopp.net/bitcoin.html
* Lightning Network resources: [lnroute.com](http://lnroute.com)


### How to upgrade Bitcoin Core? 
The latest release can be found on the Github page of the Bitcoin Core project. Make sure to read the Release Notes, as these can include importantupgrade information.  
https://github.com/bitcoin/bitcoin/releases

* As "admin" user, stop the lnd and bitcoind system units  
  `$ sudo systemctl stop lnd`  
  `$ sudo systemctl stop bitcoind`  

* Download, verify, extract and install the Bitcoin Core binaries as described in the [Bitcoin section](https://github.com/Stadicus/guides/blob/master/raspibolt/raspibolt_30_bitcoin.md) of this guide.

* Start the bitcoind and lnd system units  
  `$ sudo systemctl start bitcoind`  
  `$ sudo systemctl start lnd`

### How to upgrade LND? 

* As "admin" user, stop lnd system unit  
  `$ sudo systemctl stop lnd`

* Only if upgrading from version v0.4.0-beta or lower, delete the macaroon files. LND will create new and additional ones (otherwise you might expect [this issue](https://github.com/lightningnetwork/lnd/issues/921)) and can no longer create invoices).  
  `$ sudo rm /home/bitcoin/.lnd/*.macaroon`

* Verify and install the LND last binaries
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

The following information is directly taken from the [lnd v0.5-beta release notes](https://github.com/lightningnetwork/lnd/releases/tag/v0.5-beta): 

---

The 0.5-beta release doesn't include any strictly breaking changes. So a result, users should find the upgrade process to be smooth. If one is upgrading from 0.4.2, the initial starting logs should look something like:

```
2018-09-14 11:16:36.876 [INF] LTND: Version 0.5.0-beta commit=3b2c807288b1b7f40d609533c1e96a510ac5fa6d
2018-09-14 11:16:36.876 [INF] LTND: Active chain: Bitcoin (network=simnet)
2018-09-14 11:16:36.876 [INF] CHDB: Checking for schema update: latest_version=6, db_version=0
2018-09-14 11:16:36.876 [INF] CHDB: Performing database schema migration
2018-09-14 11:16:36.876 [INF] CHDB: Applying migration #1
2018-09-14 11:16:36.876 [INF] CHDB: Populating new node update index bucket
2018-09-14 11:16:36.876 [TRC] CHDB: Adding 02765c691ce59134606665199882ceb4b689e8da3d9f5db8712dd2e1fe0960c418 to node update index
2018-09-14 11:16:36.876 [INF] CHDB: Populating new edge update index bucket
2018-09-14 11:16:36.876 [INF] CHDB: Migration to node and edge update indexes complete!
2018-09-14 11:16:36.876 [INF] CHDB: Applying migration #2
2018-09-14 11:16:36.876 [INF] CHDB: Migrating invoice database to new time series format
2018-09-14 11:16:36.876 [INF] CHDB: Migration to invoice time series index complete!
2018-09-14 11:16:36.876 [INF] CHDB: Applying migration #3
2018-09-14 11:16:36.876 [INF] CHDB: Applying migration #4
2018-09-14 11:16:36.876 [INF] CHDB: Migration of edge policies complete!
2018-09-14 11:16:36.876 [INF] CHDB: Applying migration #5
2018-09-14 11:16:36.876 [INF] CHDB: Migrating database to support payment statuses
2018-09-14 11:16:36.876 [INF] CHDB: Marking all known circuits with status InFlight
2018-09-14 11:16:36.876 [INF] CHDB: Marking all existing payments with status Completed
2018-09-14 11:16:36.876 [INF] CHDB: Applying migration #6
2018-09-14 11:16:36.876 [INF] CHDB: Migrating database to properly prune edge update index
2018-09-14 11:16:36.876 [INF] CHDB: Migration to properly prune edge update index complete!
```

One lncli related change that users running on simnet or testnet will notice is that the default location for macaroons has now changed. As a result, lnd will generate a new set of macaroons after it has initially been upgraded. Further details will be found below, but lnd will now generate a distinct set of macaroons for simnet, testnet, and mainnet. As a result, you may need to supply additional arguments for lncli to have it work as normal on testnet like so:

lncli --network=testnet getinfo
or

lncli --chain=litecoin --network=testnet getinfo
In order to cut down on the typing one needs to go through, we recommend creating an alias like so:

alias tlncli=lncli --network=testnet
NOTE: In this release, the --noencryptwallet command line and config argument to lnd has been phased out. It has instead been replaced with an argument identical in functionality, but distinct in naming: --noseedbackup. The rationale for this change is to remove the foot gun that was the prior config value, as many users would unknowingly create mainnet nodes using the argument. This is dangerous, as if done, the user wouldn't receive a recovery mnemonic to recover their on-chain funds in the case of disaster. We've changed the name of the argument to better reflect the underlying semantics.

---


* Restart service  
  `$ sudo systemctl start lnd`

* Copy permission files and TLS cert to user "admin" to use `lncli`   
  `$ sudo cp /home/bitcoin/.lnd/tls.cert /home/admin/.lnd`  
  `$ sudo cp /home/bitcoin/.lnd/admin.macaroon /home/admin/.lnd`  
  `$ sudo chown -R admin:admin /home/admin/.lnd/ `   

* Don't forget to unlock your wallet & check logs  
  `$ lncli unlock`  
  `$ sudo journalctl -u lnd -f`  

### Why do I need the 32 bit version of Bitcoin when I have a Raspberry Pi 3 with a 64 bit processor?
At the time of this writing (July 2018) there is no 64 bit operating system for the Raspberry Pi developed yet. The 64 bit processors of the Raspberry 3 versions are running in 32 bit compatibility mode with a 32 bit operating system.
