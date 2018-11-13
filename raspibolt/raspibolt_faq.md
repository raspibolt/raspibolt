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
Upgrading can lead to a number of issues. Please **always** read the [LND release notes](https://github.com/lightningnetwork/lnd/releases/tag/v0.5-beta) completely to understand the changes. They also cover a lot of additional topics and many new features not mentioned here. 

* As "admin" user, stop lnd system unit  
  `$ sudo systemctl stop lnd`

* If upgrading from a version lower than v0.5 delete the macaroon files.  
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

* Starting with this release, LND expects two different ZMQ sockets for blocks and transactions. Edit `bitcoin.conf`, save and exit.  
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

* Copy the new set of macaroons to your admin user, otherwise this user cannot use `lncli`. The new macaroon location also affects the [auto-unlock script](https://github.com/Stadicus/guides/blob/master/raspibolt/raspibolt_6A_auto-unlock.md) you might be running.  
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

### Why do I need the 32 bit version of Bitcoin when I have a Raspberry Pi 3 with a 64 bit processor?
At the time of this writing (July 2018) there is no 64 bit operating system for the Raspberry Pi developed yet. The 64 bit processors of the Raspberry 3 versions are running in 32 bit compatibility mode with a 32 bit operating system.
