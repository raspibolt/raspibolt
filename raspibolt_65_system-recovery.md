---
layout: default
title: System recovery
parent: Bonus Section
nav_order: 110
has_toc: false
---
## Bonus guide: System recovery

*Difficulty: easy*

In case your microSD card gets corrupted or you brick your node, it's handy to have a quick recovery image at hand so you can quickly flash the microSD card to a previous state. It's not a full backup solution, but allows a system recovery.

### Backup essential files on external hard disk

In case everything goes south the recovery should also include essential configuration files from the external hard disk. The blockchain cannot be backed up this way and needs to be copied using SCP again as  described in the [main guide](raspibolt_50_mainnet.md).

🚨 Please note that LND cannot be backuped yet: even slightly outdated channels lead to a force closure by your peer and you losing all funds of that channels. Therefore, a manual wallet recovery is needed.

```bash
$ sudo su - bitcoin
$ mkdir backup_ext
# if you have created bitcoin wallets, you could add their paths to the following command
$ tar cvf backup_ext/bitcoin.tar .bitcoin/bitcoin.conf .bitcoin/wallet.dat .bitcoin/peers.dat .bitcoin/banlist.dat
$ tar cvf backup_ext/lnd.tar .lnd/lnd.conf
$ tar cvf backup_ext/electrs.tar .electrs/electrs.conf
# if you have installed Lightning Terminal
$ tar cvf backup_ext/lit.tar .lit/lit.conf
$ exit
```

### Create microSD card image

* Shut down your RaspiBolt
  `$ sudo shutdown now`
* Remove the microSD card and connect it to your regular computer
* Follow this guide to create a disk image:
  https://lifehacker.com/how-to-clone-your-raspberry-pi-sd-card-for-super-easy-r-1261113524

### System recovery

If you have a spare microSD card, you should test the system recovery by writing the disk image to the backup microSD card and booting your RaspiBolt with it.

If just the microSD card was defective, there's no need to restore the files on your external hard disk. In fact it would cause more harm than good. :heavy_check_mark:

---

Only if your external hard disk failed as well, or if you want to quickly set up the system from scratch with a new hard disk, you can recover the essential files on your external hard as follows:

* Login with ssh and user "admin"
* If you connect a different hard disk, retrace the connection steps in the [main guide](raspibolt_20_pi.md) and create the necessary directories.
* Stop running services, open a "bitcoin" user session and restore the backed up files

```bash
$ sudo systemctl stop lnd.service
$ sudo systemctl stop bitcoind.service

$ sudo su - bitcoin
$ cd /home/bitcoin/backup_ext/
$ tar xvf bitcoin.tar -C /home/bitcoin
$ tar xvf lnd.tar -C /home/bitcoin
$ tar xvf electrs.tar -C /home/bitcoin
# next command is only if you have installed Lightning Terminal (integrated or remote)
$ tar xvf lit.tar -C /home/bitcoin
# then exit
$ exit
```

* Before starting the services, make sure that you have an up-to-date copy of the Bitcoin blockchain ready on your external hard disk. Even catching up a few weeks can take days on the Raspberry Pi. Please refer to the [main guide](raspibolt_50_mainnet.md) on how to download and copy the data via SCP.


* Once you're all set, restart the services
  `$ sudo systemctl start bitcoind.service `
  `$ sudo systemctl start lnd.service `

Your node should now be catching up and soon be operational again.

------

<< Back: [Bonus guides](raspibolt_60_bonus.md)
