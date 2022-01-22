---
layout: default
title: Static Channel Backup
nav_order: 15
parent: Lightning
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->
# Lightning: Static Channel Backup
{: .no_toc }

We set up an automatic Static Channel Backup on an USB thumbdrive (and optionally to a remote GitHub repository) to recover lightning funds in case of SSD drive failure.

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

1. Locally, to a USB thumbdrive plugged into the Pi: in case of SSD drive failure only
1. Remotely, to a GitHub repository: in case of widespread node damage (e.g. flood, fire, etc)

## Local backup: USB thumbdrive

We will create a bash script that automatically backup the LND SCB file on change to a small thumbdrive permanently plugged in the RaspBerry Pi.

### Thumbdrive size

The `channel.backup` file is very small in size (<<1 MB) so even the smallest thumbdrive will do the job.

### Formatting

* To ensure that the thumbdrive does not contain malicious code, we will format it on our local computer (select a name easy to recognize, *e.g.*, "SCB backup").

  * On Linux, follow [this tutorial](https://phoenixnap.com/kb/linux-format-usb){:target="_blank"}
  
  * On Windows, follow [this tutorial](https://www.techsolutions.support.com/how-to/how-to-format-a-usb-drive-in-windows-12893){:target="_blank"}
  
  * On Mac, follow [this tutorial](https://www.techsolutions.support.com/how-to/how-to-format-a-usb-drive-on-a-mac-12899){:target="_blank"}

* Once formatted, plug it into one of the USB 2.0 (black) port. 

###  Set up a mounting point for the USB thumbdrive

* Create the mounting directory and make it immutable

  ```sh
  $ sudo mkdir /mnt/thumbdrive-scb
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
and copy them into a text editor on your local computer (e.g. here `XXXX` and `XXXX`)
  
  ```sh
  $ awk -F ':' '$1=="lnd" {print "GID: "$3" / UID: "$4}'  /etc/passwd
  > GID: XXXX / UID: XXXX
  ```

* Edit the `fstab` file and add the following as a new line at the end, replacing `123456` with your own `UUID`, and `XXXX` with your own `GID` and `UID`.

  ```sh
  $ sudo nano /etc/fstab
  ```
  
  ```ini
  UUID=123456 /mnt/thumbdrive-scb vfat auto,noexec,nouser,rw,sync,nosuid,nodev,noatime,nodiratime,nofail,umask=022,gid=XXXX,uid=XXXX 0 0
  ```
  
  🔍 *more: [fstab guide](https://www.howtogeek.com/howto/38125/htg-explains-what-is-the-linux-fstab-and-how-does-it-work/){:target="_blank"}*

* Mount the drive and check the file system. Is “/mnt/thumdrive” listed?

  ```sh
  $ sudo mount -a
  $ df -h thumbdrive-scb
  > Filesystem      Size  Used Avail Use% Mounted on
  > /dev/sdb        1.9G  4.0K  1.9G   1% /mnt/thumbdrive-scb
  ```

### Install inotify-tools

`inotify-tools` allows to use `inotify` (a tool that monitors files and directories) within shell scripts. We'll use it to monitor changes in our node's `channel.backup` (i.e. new updates by LND when a channel is opened or closed).

* Install `inotify-tools`

  ```sh
  $ sudo apt update
  $ sudo apt install inotify-tools
  ```

### Create script

We create a shell script that uses `inotify` to monitor changes in `channel.backup` and make a copy of it on change.

* Create a new shell script file

  ```sh
  $ sudo nano /usr/local/bin/thumbdrive-scb-backup.sh
  ```

* Check the following line code and paste them in nano. Save and exit.

  ```sh
  #!/bin/bash
  
  # The script waits for a change in channel.backup. 
  # When a change happens (channel opening or closing), a copy of the file is sent to the thumdrive
  
  # Location of the channel.backup file used by LND
  SOURCEFILE=/data/lnd-backup/channel.backup
  
  # Location of the backup file in the mounted thumbdrive
  BACKUPFILE="/mnt/thumbdrive-scb/channel-$(date +"%Y%m%d-%H%M%S").backup"
  
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
  
### Run backup script in background

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
  
### Test

We now cause the `channel.backup` to change and see if a copy gets uploaded to the thumbdrive.

* Open the live logging output of the service
  
  ```sh
  $ sudo journalctl -f -u thumbdrive-scb-backup.service
  ```

* Start your SSH program (eg. PuTTY) a second time and log in as “admin”. Commands for the second session start with the prompt $2.
* Simulate a `channel.backup` file change and then exit the session.
  
  ```sh
  $2 sudo touch /data/lnd-backup/channel.backup
  $2 exit
  ```
  
* Go back to the first SSH session, in the logs, you should see the following new entries
  
  ```sh
  > [...]
  > Dec 27 17:39:52 raspibolt thumbdrive-scb-backup.sh[127014]: /data/lnd-backup/channel.backup OPEN
  > Dec 27 17:39:52 raspibolt thumbdrive-scb-backup.sh[127012]: Copying backup file...
  > Dec 27 17:39:52 raspibolt thumbdrive-scb-backup.sh[127320]: Setting up watches.
  > Dec 27 17:39:52 raspibolt thumbdrive-scb-backup.sh[127320]: Watches established.
  > [...]
  ```

* Check the content of your USB thumbdrive. It should now contain a backup file with the date/time corresponding to the test made just above
  
  ```sh
  $ ls -la /mnt/thumbdrive-scb
  > -rwxr-xr-x 1 lnd  lnd     45 Dec 27 17:39 channel-20211227-173403.backup
  ```
  
You're set! Each time you'll open a new channel or close a channel, the backup file in the thumbdrive will be updated.

---

## (Optional) Remote backup: GitHub

The thumbdrive-based setup protects the backup from a SSD drive failure. However, it does not protect against a situation where both the SSD drive and USB thumbdrive are destroyed at the same time (*e.g.* fire, food, etc.).  

To protect against this situation, it is necessary to send the backup to a remote location. We will 

### Create a GitHub repository

* Go to [GitHub](https://github.com/){:target="_blank"} and sign up for a new user account (or use an existing one)

* Create a new repository: [https://github.com/new](https://github.com/new){:target="_blank"}
  * Type the following repository name: `lnd-backup`
  * Select "Private" (rather than the default "Public")
  * Click on "Create repository"

### Clone the repository to the node

* With the "admin" user, backup  the existing `lnd-backup` folder

  ```sh
  $ sudo mv /data/lnd-backup /data/lnd-backup.bak
  ```

* Using the "bitcoin" user, create a pair of SSH keys. When prompt, just press "Enter" to confirm the default SSH directory and to not setting up a password.

  ```sh
  $ sudo su - bitcoin
  $ ssh-keygen -t rsa -b 4096
  > Generating public/private rsa key pair.
  > Enter file in which to save the key (/home/bitcoin/.ssh/id_rsa): 
  > Created directory '/home/bitcoin/.ssh'.
  > Enter passphrase (empty for no passphrase): 
  > Enter same passphrase again: 
  > Your identification has been saved in /home/bitcoin/.ssh/id_rsa
  > Your public key has been saved in /home/bitcoin/.ssh/id_rsa.pub
  > [...]
  ```

* Display the public key

  ```sh
  $ cat /home/bitcoin/.ssh/id_rsa.pub
  > ssh-rsa 1234abcd... bitcoin@raspibolt

* Go back to the GitHub repository webpage
  * Click on "Settings", then "Deploy keys", then "Add deploy keys"
  * Type a title (e.g., SCB bitcoin user)
  * In the "Key" box, copy/paste the string generated above starting (e.g. `ssh-rsa 5678efgh... bitcoin@raspibolt`)
  * Click "Add key"

* Still with user "bitcoin", set up global Git configuration values. The name and email are required but can be dummy values.

  ```sh
  $ cd /data
  $ git config --global user.name "RaspiBolt"
  $ git config --global user.email "raspibolt@dummyemail.com"
  ```

* Clone your newly created empty repository (whem prompted "Are you sure you want to continue connecting", type `yes`)

  ```sh
  $ git clone git@github.com:VajraOfIndra/lnd-backup.git
  > Cloning into 'lnd-backup'...
  > The authenticity of host 'github.com (140.82.121.3)' can't be established.
  > ECDSA key fingerprint is SHA256:p2QAMXNIC1TJYWeIOttrVc98/R1BUFWu3/LiyKgUfQM.
  > Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
  > Warning: Permanently added 'github.com,140.82.121.3' (ECDSA) to the list of known hosts.
  > warning: You appear to have cloned an empty repository.
  $ cd lnd-backup
  $ ls -la
  > drwxr-xr-x  3 bitcoin bitcoin 4096 Dec 27 18:55 .
  > drwxr-xr-x 12 bitcoin bitcoin 4096 Dec 27 18:55 ..
  > drwxr-xr-x  7 bitcoin bitcoin 4096 Dec 27 18:56 .git
  ```

* For the backup file to be updated by LND, the folder has to belong to the "lnd" user. With user "admin", change the owner to "lnd"

  ```sh
  $ exit
  $ sudo chown -R lnd:lnd /data/lnd-backup
  ```

### Manual backup to remote GitHub directory

#### Move backup file

* Move your latest `channel.backup` file to the newly created folder

  ```sh
  $ sudo mv /data/lnd-backup.bak/channel.backup /data/lnd-backup
  $ sudo ls -la /data/lnd-backup
  > drwxr-xr-x  3 bitcoin bitcoin  4096 Dec 27 19:18 .
  > drwxr-xr-x 12 bitcoin bitcoin  4096 Dec 27 19:07 ..
  > drwxr-xr-x  8 bitcoin bitcoin  4096 Dec 27 19:25 .git
  > -rw-r--r--  1 bitcoin bitcoin 11957 Dec 27 19:18 channel.backup
  ```

#### Allow user "lnd" to access the remote GitHub repo

* Using the "lnd" user, create a pair of SSH keys and display the public key string

  ```sh
  $ sudo su - lnd
  $ ssh-keygen -t rsa -b 4096
  $ cat /home/bitcoin/.ssh/id_rsa.pub
  > ssh-rsa 5678efgh... lnd@raspibolt
  ```

* Delete the "SCB bitcoin user" key, we don't need it anymore
  * Go back to the GitHub repository webpage
  * Click on "Settings", then "Deploy keys"
  * Click on "Delete" within the "SCB bitcoin user" box

* Add the new key fro user "lnd"
  * Click on "Add deploy keys"
  * Type a title (e.g., SCB lnd user)
  * In the "Key" box, copy/paste the string generated above starting (e.g. `ssh-rsa 5678efgh... lnd@raspibolt`)
  * Tick the box "Allow write access" (it is needed to pushes changes to the GitHub repo)
  * Click "Add key"

#### Push changes to remote repo

* Go back to your SSH session. Still with user "lnd", enter the Git repository, commit the content of the folder and push it to your remote GitHub repository 

  ```sh
  $ cd /data/lnd-backup
  $ git add .
  $ git commit -m "SCB"
  $ git push --set-upstream origin master
  ```

* Check that the backup file is now in your remote GitHub repository (in the "<> code" tab)

* Exit the "lnd" user

  ```sh
  $ exit
  ```

### Automatic backup to remote GitHub directory

#### Create script

* With user admin, create a new shell script file

  ```sh
  $ sudo nano /usr/local/bin/github-scb-backup.sh
  ```

* Check the following lines of code and paste them in `nano`. Save and exit.

  ```sh
  #!/bin/bash
  
  # The script waits for a change in /data/lnd-backup/channel.backup. 
  # When a change happens, it pushes the content of the backup folder to the remote GitHub repo

  # Location of Git repo, source file and formatted backup file to send to remote repo
  GITREPO="/data/lnd-backup"
  SOURCEFILE="/data/lnd-backup/channel.backup"
  BACKUPFILE="/data/lnd-backup/channel-$(date +"%Y%m%d-%H%M%S").backup"

  # Backup function
  run_backup_on_change () {
    echo "Entering Git repository..."
    cd $GITREPO
    echo "Making a timestamped copy of channel.backup..."
    cp $SOURCEFILE $BACKUPFILE
    echo "Committing changes and adding a timestamped commit message"
    git add .
    git commit -m "SCB"
    echo "Pushing changes to remote repository..."
    git push --set-upstream origin master
    echo "Success! The file is now remotely backed up!"
  }

  # Monitoring function
  run () {
    while true; do
        inotifywait $SOURCEFILE
        echo "channel.backup has been changed!"
        run_backup_on_change
    done
  }
  
  run
  ```

* Make the script executable and move it to the standard bin(ary) directory

  ```sh
  $ sudo chmod +x /usr/local/bin/github-scb-backup.sh
  ```
  
#### Run backup script in background

We'll setup the backup script as a systemd service to run in the background and start automatically on system startup.

* Create a new service file
  
  ```sh
  sudo nano /etc/systemd/system/github-scb-backup.service
  ```

* Paste the following lines. Save and exit.
  
  ```ini
  # RaspiBolt: systemd unit for automatic SCB copy to GitHub
  # /etc/systemd/system/github-scb-backup.service

  [Unit]
  Description=Github SCB Backup daemon
  After=lnd.service

  [Service]
  ExecStart=/usr/local/bin/github-scb-backup.sh
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
  $ sudo systemctl enable github-scb-backup.service
  $ sudo systemctl start github-scb-backup.service
  $ sudo systemctl status github-scb-backup.service
  ```

* To monitor the logs

  ```sh
  $ sudo journalctl -f -u github-scb-backup.service
  > Dec 28 14:05:09 raspibolt github-scb-backup.sh[139204]: Setting up watches.
  > Dec 28 14:05:09 raspibolt github-scb-backup.sh[139204]: Watches established.
  ```

### Test

We now cause the `channel.backup` to change and see if a copy gets uploaded to the thumbdrive.

* Still with user "admin", simulate a `channel.backup` file change
  
  ```sh
  $ sudo touch /data/lnd-backup/channel.backup
  ```

* Check your GitHub repository (in the "<> code" tab). It should now contain the latest timestamped backup file

You're set! Each time you'll open a new channel or close a channel, the new `channel.backup` file will be pushed to your remote GitHub repository.

<br /><br />

---

Next: [Ride The Lightning >>](rtl.md)

