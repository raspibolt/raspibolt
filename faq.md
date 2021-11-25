---
layout: default
title: FAQ
nav_order: 220
---
# Frequently Asked Questions
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Can I get rich by routing Lightning payments?

Nobody knows.
Probably not.
You will get minimal fees.
I don't care.
Enjoy the ride!

---

## Can I attach the Ext4 formatted hard disk to my Windows computer?

The Ext4 file system is not compatible with standard Windows, but with additional software like  [Linux File Systems](https://www.paragon-software.com/home/linuxfs-windows/#faq) by Paragon Software (they offer a 10 days free trial) it is possible.

---

## Can I update my RaspiBolt 2 to the new version?

Unfortunately, a seamless update is not possible because RaspiBolt 3 uses an entirely different 64-bit operating system.
The general structure of the setup stays the same, however.
We recommend setting up the RaspiBolt from scratch, but you can then copy over essential data.

Your LND node data is the most important.
Copy it to a USB thumbdrive, so that you can restore it later.

* Find the thumbdrive (check for the correct size and that its TYPE is listed as "part") and mount it

   ```sh
   $ sudo mkdir /mnt/thumbdrive
   $ lsblk -pli
   $ sudo mount /dev/sdb1 /mnt/thumbdrive/
   ```

* Check that it's mounted correctly

   ```sh
   $ df -h
   > Filesystem      Size  Used Avail Use% Mounted on
   > ...
   > /dev/sdb1        15G   24K   15G   1% /mnt/thumbdrive
   ```

### Backup & Restore LND data

* Copy the whole LND data directory to the thumbdrive

  ```sh
  $ sudo rsync -rhvP --append-verify /mnt/ext/lnd /mnt/thumbdrive/
  ```

* Also make sure to create a Static Channel Backup file and copy it to the thumbdrive

🚨 **WARNING**: Your old LND node must not ever start again.
That could result in you losing all your funds.

* Move your LND directory to prevent the node starting again by accident.

  ```sh
  $ sudo mv /mnt/ext/lnd /mnt/ext/lnd-do-never-start-again
  ```

Once you set up your new RaspiBolt 3, restore your old LND node setup.

* Quickly start the new LND instance without creating a wallet.
  Stop LND again.

* Mount the thumbdrive and restore your backup

  ```sh
  $ sudo mkdir /mnt/thumbdrive
  $ lsblk -pli
  $ sudo mount /dev/sdb1 /mnt/thumbdrive/
  $ sudo rsync -rhvP --append-verify /mnt/thumbdrive/lnd /data
  ```

### Backup & Restore Bitcoin data

Bitcoin Core is easy to set up again, no backup is needed.
If you're ok with downloading the blockchain again, which may take a few days, there's nothing you need to do.

Otherwise, you can of course copy the whole bitcoin data directory directly to your new node.

When **Reusing the old drive** for your new node, you must first copy the data to a different drive or computer, either by connecting the drive, or over the network. When you **use a new drive**, you can set the RaspiBolt up first and then copy the data directly from drive to drive.

* Example for network copy

    ```sh
    $ rsync -rhvP --append-verify admin@raspibolt.local:/mnt/ext/bitcoin /your-local-directory
    ```

* Example for local drive-to-drive copy with both drives mounted

    ```sh
    $ rsync -rhvP --append-verify /mnt/old-raspibolt-drive/bitcoin /mnt/raspibolt-v3-drive/data
    ```

---

## What do all the Linux commands do?

This is a (very) short list of common Linux commands for your reference.
For a specific command, you can enter `man [command]` to display the manual page (type `q` to exit).

| command | description | example |
| -- | -- | -- |
| `cd` | change to directory | `cd /home/bitcoin` |
| `ls` | list directory content | `ls -la /data` |
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

---

## Where can I get more information?
If you want to learn more about Bitcoin and are curious about the inner workings of the Lightning Network, the following articles in Bitcoin Magazine offer a very good introduction:

* [What is Bitcoin?](https://bitcoinmagazine.com/guides/what-bitcoin)
* [Understanding the Lightning Network](https://bitcoinmagazine.com/articles/understanding-the-lightning-network-part-building-a-bidirectional-payment-channel-1464710791/)
* [Bitcoin resources](https://www.lopp.net/bitcoin-information.html) and [Lightning Network resources](https://www.lopp.net/lightning-information.html) by Jameson Lopp


---

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

<< Back: [Troubleshooting](troubleshooting.md)
