[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ **FAQ** ]

-------
### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi
--------

# FAQ

### Can I get rich by routing Lightning payments?
Nobody knows. Probably not. I don't care. Enjoy the ride! 

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

