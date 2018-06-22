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


### How to upgrade LND bin ? 

* As ADMIN user, stop lnd service  
  `$ sudo systemctl stop lnd`

* Only if upgrading from version v0.4.0-beta or lower, delete the macaroon files. LND will create new and additional ones (otherwise you might expect [this issue](https://github.com/lightningnetwork/lnd/issues/921)) and can no longer create invoices).  
  `$ sudo rm /home/bitcoin/.lnd/*.macaroon`

* Verify and install the LND last binaries
```
$ cd /home/admin/download
$ wget https://github.com/lightningnetwork/lnd/releases/download/v0.4.2-beta/lnd-linux-arm-v0.4.2-beta.tar.gz
$ wget https://github.com/lightningnetwork/lnd/releases/download/v0.4.2-beta/manifest-v0.4.2-beta.txt
$ wget https://github.com/lightningnetwork/lnd/releases/download/v0.4.2-beta/manifest-v0.4.2-beta.txt.sig

$ sha256sum --check manifest-v0.4.2-beta.txt --ignore-missing
> lnd-linux-arm-v0.4.2-beta.tar.gz: OK

$ gpg --verify manifest-v0.4.2-beta.txt.sig
> gpg: Good signature from "Olaoluwa Osuntokun <laolu32@gmail.com>" [unknown]
> Primary key fingerprint: 6531 7176 B685 7F98 834E  DBE8 964E A263 DD63 7C21

$ tar -xzf lnd-linux-arm-v0.4.2-beta.tar.gz
$ sudo install -m 0755 -o root -g root -t /usr/local/bin lnd-linux-arm-v0.4.2-beta/*
$ lnd --version
> lnd version 0.4.2-beta commit=7cf5ebe2650b6798182e10be198c7ffc1f1d6e19
```
* Restart service  
  `$ sudo systemctl start lnd`

* Copy permission files and TLS cert to user "admin" to use `lncli`   
  `$ sudo cp /home/bitcoin/.lnd/tls.cert /home/admin/.lnd`  
  `$ sudo cp /home/bitcoin/.lnd/admin.macaroon /home/admin/.lnd`  
  `$ sudo chown -R admin:admin /home/admin/.lnd/ `   

* Don't forget to unlock your wallet & check logs  
  `$ lncli unlock`  
  `$ sudo journalctl -u lnd -f`  

