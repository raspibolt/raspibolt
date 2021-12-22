---
layout: default
title: Static Channel Backup
nav_order: 15
parent: Lightning
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->
# Lightning: Static Channel Backup
{: .no_toc }

We set up an automatic Static Channel Backup on an USB thumbdrive to recover lightning funds in case of SSD drive failure.

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Introduction: why are channel backups important?

Static Channels Backup is a feature of LND that allows for the onchain recovery of lightning channel balances in the case of a bricked node. Despite its name, it does not allow the recovery of your LN channels but simply increases the chance that you'll recover all (or most) of your offchain (local) balances.  

The SCB contains all the necessary channel information used for the recovery process which is called the Data Loss Protection (DLP). It is a foolproof safe backup mechanism (*i.e.*, there is no risk of penalty transactions being triggered which would result in the entire local). During recovery, the SCB is used by LND to know who were you peers with whom you had channels. LND send all your online peers a request to force close the channel on their end. Without this method, you would need to either contact the peer yourself to ask them to force close the channel or else wait for them to force close on their own, resulting in probably several channels being kept opened for possible weeks or months. If one of these peers themselves have a technical issue and brick their node, then the channel becomes a zombie channel with possibly no chance of ever recovering the funds in it.  

This SCB-based recovery method has several consequences worth bearing in mind:

* It relies on the good will of the peer, *i.e.*, a malicious peer could refuse to force close the channel and the funds would remain in limbo until they do

* If a peer is offline, the request to force close cannot be sent, and therefore the funds in that channel will remain in limbo until this peer comes back online and initiate a force closure (with the additional danger of the peer *never* coming back online and the funds remaining locked in the 2-of-2 multisig forever)

* Since LND uses the SCB to know which peers to send the force closure request, the SCB file has to be updated each time you open a new channel, otherwise you encur the risk of having funds in channels

This is why it is recommended to set up an automatic SCB update mechanism that:

1. Create a new (or update an existing) SCB file each time you open a channel (and close, although this is less important)
1. Save the SCB file in another location than the SSD drive (to ensure that the SCB survive in case of drive failure)

You can read more about SCBs in [this section of 'Mastering the Lighning Network'](https://github.com/lnbook/lnbook/blob/ec806916edd6f4d1b2f9da2fef08684f80acb671/05_node_operations.asciidoc#node-and-channel-backups){:target="_blank"}.

## TL;DR

The guide will show how to set up an automatic Static Channel Backup:

1. Locally, on a USB thumbdrive plugged into the Pi: in case of SSD drive failure only
1. Remotely, in Dropbox: in case of widespread node damage, including the thumdrive (e.g. flood, fire, etc)

## Automatic SCB on thumbdrive

We will create a bash script that automatically backup the LND SCB file on change to a small thumbdrive permanently plugged in the RaspBerry Pi.

### Thumbdrive size

The `channel.backup` file is very small in size (<<1MB) so even the smallest thumbdrive will do the job.

### Formatting

* To ensure that the thumbdrive does not contain malicious code, we will format it on our local computer (select a name easy to recognize, *e.g.*, "SCB backup").

  * On Linux, follow [this tutorial](https://phoenixnap.com/kb/linux-format-usb){:target="_blank"}
  
  * On Windows, follow [this tutorial](https://www.techsolutions.support.com/how-to/how-to-format-a-usb-drive-in-windows-12893){:target="_blank"}
  
  * On Mac, follow [this tutorial](https://www.techsolutions.support.com/how-to/how-to-format-a-usb-drive-on-a-mac-12899){:target="_blank"}

* Once formatted, plug it into one of the USB 2.0 (black) port. 

###  Set up a mounting point for the USB thumbdrive

* Create the mounting directory

  ```sh
  $ sudo chattr +i /mnt/thumbdrive-scb
  ```

* List the devices and copy the `UUID` of the thumdrive into a text editor on your local computer (e.g. here `123456`).
  
  ```sh
  $ lsblk -o NAME,MOUNTPOINT,UUID,FSTYPE,SIZE,LABEL,MODEL
  > NAME   MOUNTPOINT UUID                                 FSTYPE   SIZE LABEL      MODEL
  > sda                                                           931.5G            SSD_PLUS_1000GB
  > |-sda1 /boot      DBF3-0E3A                            vfat     256M boot       
  > `-sda2 /          b73b1dc9-6e12-4e68-9d06-1a1892663226 ext4   931.3G rootfs     
  > sdb               123456                               vfat     1.9G SCB backup UDisk
  ```

* Now, get the "lnd" user identifier (UID) and the "lnd" group identifier (GUI) from the `/etc/passwd` database of all user accounts. 
and copy them into a text editor on your local computer (e.g. here `1005` and `1005`)
  
  ```sh
  $ awk -F ':' '$1=="lnd" {print "GID: "$3" / UID: "$4}'  /etc/passwd
  > GID: 1005 / UID: 1005
  ```

* Edit the `fstab` file and add the following as a new line at the end, replacing `123456` with your own `UUID`, and `1005` with your own `GID` and `UID`.

  ```sh
  $ sudo nano /etc/fstab
  ```
  
  ```ini
  UUID=123456 /mnt/thumbdrive vfat auto,noexec,nouser,rw,sync,nosuid,nodev,noatime,nodiratime,nofail,umask=022,gid=1005,uid=1005 0 0
  ```
  
  🔍 *more: [fstab guide](https://www.howtogeek.com/howto/38125/htg-explains-what-is-the-linux-fstab-and-how-does-it-work/){:target="_blank"}*

* Mount the drive and check the file system. Is “/mnt/thumdrive” listed?

  ```sh
  $ sudo mount -a
  $ df -h thumbdrive-scb
  > Filesystem      Size  Used Avail Use% Mounted on
  > /dev/sdb        1.9G  4.0K  1.9G   1% /mnt/thumbdrive-scb
  ```

#### Create a backup SCB file

* Create an empty SCB file in the thumdrive

  ```sh
  $ sudo touch /mnt/thumbdrive-scb/channel.backup
  ```

#### Install inotify-tools

`inotify-tools` allows to use `inotify` (a tool that monitors files and directories) within shell scripts. We'll use it to monitor changes in our node's `channel.backup` (i.e. new updates by LND when a channel is opened or closed).

* Install `inotify-tools`

  ```sh
  $ sudo apt update
  $ sudo apt install inotify-tools
  ```

#### Create script

We create a shell script that uses `inotify` to monitor changes in `channel.backup` and make a copy of it on change.

* Create a new shell script file

  ```sh
  $ nano /usr/local/bin/thumbdrive-scb-backup.sh
  ```

* Check the following line code and paste them in nano. Save and exit.

  ```sh
  #!/bin/bash
  
  # The script waits for a change in channel.backup. When a change happens (channel opening or closing), a copy of the file is sent to the thumdrive
  
  # Location of the channel.backup file used by LND
  SOURCEFILE=/data/lnd-backup/channel.backup
  
  # Location of the backup file in the mounted thumbdrive
  BACKUPFILE=/mnt/thumbdrive-scb/channel.backup
  
  # Backup function
  run_backup_on_change () {
    echo "Copying backup file..."
    cp $SOURCEFILE $BACKUPFILE
  }

  # Monitoring function
  run () {
    while true; do
        inotifywait $SOURCEFILE
        run_backup_on_change
    done
  }

  run
  ```

* Make the script executable and move it to the standard bin(ary) directory

  ```sh
  $ sudo chmod +x /usr/local/bin/thumbdrive-scb-backup.sh
  ```
  
#### Run backup script in background

We'll setup the backup script as a systemd service to run in the background and start automatically on system startup.

* Create a new service file
  
  ```sh
  sudo nano /etc/systemd/system/thumbdrive-scb-backup.service
  ```

* Paste the following lines. Save and exit.
  
  ```ini
  # RaspiBolt: systemd unit for automatic SCB copy to thumbdrive
  # /etc/systemd/system/thumbdrive-scb-backup.service

  [Unit]
  Description=Thumbdrive SCB Backup daemon
  After=lnd.service

  [Service]
  ExecStart=/usr/local/bin/thumbdrive-scb-backup.sh
  Restart=always
  RestartSec=1
  StandardOutput=syslog
  StandardError=syslog
  User=lnd

  [Install]
  WantedBy=multi-user.target
  ```
  
* Enable and start the service, check its status (it should be 'active')
  
  ```sh
  $ sudo systemctl enable thumbdrive-scb-backup.service
  $ sudo systemctl start thumbdrive-scb-backup.service
  $ sudo systemctl status thumbdrive-scb-backup.service
  ```
  
#### Test

We now cause the `channel.backup` to change and see if a copy gets uploaded to the thumbdrive.

* Open the live logging output of the service
  
  ```sh
  $ sudo journalctl -f -u thumbdrive-scb-backup.service
  ```

* Open a second SSH session (we'll usse $2 to indicate inputs in this second session). Exit the session.
  
  ```sh
  $2 sudo touch /data/lnd-backup/channel.backup
  $2 exit
  ```
  
* Go back to the first SSH session, in the logs, you should see the following new entries
  ```
  > [...]
  > Dec 15 11:28:55 raspibolt backup-channels[158516]: Copying backup file...
  > Dec 15 11:28:55 raspibolt sudo[158557]:     root : PWD=/ ; USER=root ; COMMAND=/usr/bin/cp /home/admin/.lnd/data/chain/bitcoin/mainnet/channel.backup /mnt/thumbdrive/channel.backup
  > [...]
  ```

* Check the last time the backup file was updated (it should be the same time you did the `touch` command above)
  
  ```sh
  $ cd /mnt/thumbdrive-scb
  $ ls -la
  > -rwxr-xr-x 1 root root 16445 Dec 15 11:28 channel.backup
  ```
  
You're set! Each time you'll open a new channel or close a channel, the backup file in the thumbdrive will be updated.

### (Optional) Automatic SCB to remote location

The thumbdrive-based setup protects the backup from a SSD drive failure. However, it does not protect against a situation where both the SSD drive and USB thumbdrive are destroyed at the same time (*e.g.* fire, food, etc.).  

To protect against this situation, it is necessary to send the backup to a remote location. For example, [this bonus guide](https://raspibolt.org/bonus/lightning/static-backup-dropbox.html) explains how to automatically send the backup to your Dropbox.

---
