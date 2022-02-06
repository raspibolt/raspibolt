---
layout: default
title: Static Channel Backup
nav_order: 15
parent: Lightning
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->
# Lightning: Static Channel Backup
{: .no_toc }

We set up an automatic Static Channel Backup on a local storage device and/or a remote GitHub repository to recover lightning funds in case of SSD drive failure.

![GitHub remote backup](images/remote-scb-backup.png)

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Why are channel backups important?

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

The guide will show how to set up an automatic Static Channel Backup:

1. Locally, to a USB thumbdrive or microSD plugged into the Pi: in case of SSD drive failure only
1. Remotely, to a GitHub repository: in case of widespread node damage (e.g. flood, fire, etc)

We recommend to use both methods, but you can choose either one of them, depending on your own requirements and preferences.

---

## Local backup preparations

Follow this section if you plan to backup your SCB locally. Otherwise, if you plan to have a remote backup only, move to the [next section](https://github.com/VajraOfIndra/RaspiBolt/edit/thumbrdive-scb-backup/static-channel-backup.md#remote-backup-preparations).

### Storage device size

The `channel.backup` file is very small in size (<<1 MB) so even the smallest USB thumbdrive or microSD card will do the job.

### Formatting

* To ensure that the storage device does not contain malicious code, we will format it on our local computer (select a name easy to recognize, *e.g.*, "SCB backup"). The following guides can be applied to both the thumbdrive and the microSD card.

  * On Linux, follow [this tutorial](https://phoenixnap.com/kb/linux-format-usb){:target="_blank"}
  
  * On Windows, follow [this tutorial](https://www.techsolutions.support.com/how-to/how-to-format-a-usb-drive-in-windows-12893){:target="_blank"}
  
  * On Mac, follow [this tutorial](https://www.techsolutions.support.com/how-to/how-to-format-a-usb-drive-on-a-mac-12899){:target="_blank"}

* Once formatted, plug the storage device into your Pi (if using a thumbdrive, use one of the USB 2.0 (black) port). 

###  Set up a mounting point for the storage device

* Create the mounting directory and make it immutable

  ```sh
  $ sudo mkdir /mnt/static-channel-backup-external
  $ sudo chattr +i /mnt/static-channel-backup-external
  ```

* List the devices and copy the `UUID` of the storage device into a text editor on your local computer (e.g. here `123456`).
  
  ```sh
  $ lsblk -o NAME,MOUNTPOINT,UUID,FSTYPE,SIZE,LABEL,MODEL
  > NAME   MOUNTPOINT UUID                                 FSTYPE   SIZE LABEL      MODEL
  > sda                                                           931.5G            SSD_PLUS_1000GB
  > |-sda1 /boot      DBF3-0E3A                            vfat     256M boot       
  > `-sda2 /          b73b1dc9-6e12-4e68-9d06-1a1892663226 ext4   931.3G rootfs     
  > sdb               123456                               vfat     1.9G SCB backup UDisk
  ```

* Now, get the "lnd" user identifier (UID) and the "lnd" group identifier (GID) from the `/etc/passwd` database of all user accounts. 
and copy them into a text editor on your local computer (e.g. here GID is `XXXX` and UID is `YYYY`)
  
  ```sh
  $ awk -F ':' '$1=="lnd" {print "GID: "$3" / UID: "$4}'  /etc/passwd
  > GID: XXXX / UID: YYYY
  ```

* Edit the `fstab` file and add the following as a new line at the end, replacing `123456`, `XXXX` and `YYYY` with your own `UUID`, `GID` and `UID`

  ```sh
  $ sudo nano /etc/fstab
  ```
  
  ```ini
  UUID=123456 /mnt/static-channel-backup-external vfat auto,noexec,nouser,rw,sync,nosuid,nodev,noatime,nodiratime,nofail,umask=022,gid=XXXX,uid=YYYY 0 0
  ```
  
  🔍 *more: [fstab guide](https://www.howtogeek.com/howto/38125/htg-explains-what-is-the-linux-fstab-and-how-does-it-work/){:target="_blank"}*

* Mount the drive and check the file system. Is “/mnt/static-channel-backup-external” listed?

  ```sh
  $ sudo mount -a
  $ df -h /mnt/storage-device-scb
  > Filesystem      Size  Used Avail Use% Mounted on
  > /dev/sdb        1.9G  4.0K  1.9G   1% /mnt/static-channel-backup-external
  ```

---

## Remote backup preparations

Follow this section if you plan to backup your SCB remotely. Otherwise, if you plan to have a local backup only, move to the [next section](https://github.com/VajraOfIndra/RaspiBolt/edit/thumbrdive-scb-backup/static-channel-backup.md#automatic-backup).

### Create a GitHub repository

* Go to [GitHub](https://github.com/){:target="_blank"} and sign up for a new user account (or use an existing one)

* Create a new repository: [https://github.com/new](https://github.com/new){:target="_blank"}
  * Type the following repository name: `remote-lnd-backup`
  * Select "Private" (rather than the default "Public")
  * Click on "Create repository"

### Clone the repository to the node

* Using the "lnd" user, create a pair of SSH keys. When prompted, just press "Enter" to confirm the default SSH directory and to not set up a password.

  ```sh
  $ sudo su - lnd
  $ ssh-keygen -t rsa -b 4096
  > Generating public/private rsa key pair.
  > [...]
  ```

* Display the public key

  ```sh
  $ cat /home/lnd/.ssh/id_rsa.pub
  > ssh-rsa 1234abcd... lnd@raspibolt
  ```

* Go back to the GitHub repository webpage
  * Click on "Settings", then "Deploy keys", then "Add deploy keys"
  * Type a title (e.g., "SCB")
  * In the "Key" box, copy/paste the string generated above starting (e.g. `ssh-rsa 5678efgh... lnd@raspibolt`)
  * Tick the box "Allow write access" (it is needed to pushes changes to the GitHub repo)
  * Click "Add key"

* Set up global Git configuration values (the name and email are required but can be dummy values). Then, clone your newly created empty repository. Replace `YourUserName` with your own GitHub username. When prompted "Are you sure you want to continue connecting", type `yes` and press "Enter".

  ```sh
  $ git config --global user.name "RaspiBolt"
  $ git config --global user.email "raspibolt@dummyemail.com"
  $ git clone git@github.com:YourUserName/remote-lnd-backup.git
  > Cloning into 'lnd-backup'...
  > [...]
  ```
  
### Test

* Still with user "lnd", enter the Git repository, create a dummy file and push it to your remote GitHub repository 

  ```sh
  $ cd /data/remote-lnd-backup
  $ touch test
  $ git add .
  $ git commit -m "testing"
  $ git push --set-upstream origin master
  $ rm test
  ```

* Check that a copy of the test file is now in your remote GitHub repository (in the "<> code" tab).

* Go back to the SSH session, delete the test file, and exit the "lnd" user

  ```sh
  $ rm test
  $ exit
  ```

---

## Automatic backup

We will now create a bash script that automatically backup the LND SCB file on change to the local and/or remote backup locations.

### Install inotify-tools

`inotify-tools` allows to use `inotify` (a tool that monitors files and directories) within shell scripts.  

We will use it to monitor changes in the `channel.backup` file updated by LND each time a channel is opened or closed.

* Install `inotify-tools`

  ```sh
  $ sudo apt update
  $ sudo apt install inotify-tools
  ```

### Create script

We create a shell script that uses `inotify` to monitor changes in `channel.backup` and make a copy of it on change.

* Create a new shell script file

  ```sh
  $ sudo nano /usr/local/bin/scb-backup.sh
  ```

* Check the following lines of code and paste them in nano. By default, both local and remote backup methods are enabled in the script. If you do not plan to use one of the method, change the corresponding variable (`LOCAL_BACKUP_ENABLED` or `REMOTE_BACKUP_ENABLED`) to "false". Save and exit.

  ```sh
  #!/bin/bash

  # Safety bash script options
  # -e causes a bash script to exit immediately when a command fails
  # -u causes the bash shell to treat unset variables as an error and exit immediately.
  set -eu

  # The script waits for a change in ~/.lnd/data/chain/bitcoin/mainnet/channel.backup.
  # When a change happens, it creates a backup of the file locally 
  #   on a storage device and/or remotely in a GitHub repo

  # By default, both methods are used. If you do NOT want to use one of the 
  #   method, replace "true" by "false" in the two variables below:
  LOCAL_BACKUP_ENABLED=true
  REMOTE_BACKUP_ENABLED=true

  # Locations of source SCB file, formatted backup files and Git repo
  SOURCEFILE="/home/lnd/.lnd/data/chain/bitcoin/mainnet/channel.backup"
  LOCAL_BACKUP_FILE="/mnt/static-channel-backup-external/channel-$(date +"%Y%m%d-%H%M%S").backup"
  GITREPO="/data/lnd/remote-lnd-backup"
  REMOTE_BACKUP_FILE="/data/lnd/remote-lnd-backup/channel-$(date +"%Y%m%d-%H%M%S").backup"


  # Local backup function
  run_local_backup_on_change () {
    echo "Copying backup file to local storage device..."
    cp "$SOURCEFILE" "$LOCAL_BACKUP_FILE"
    echo "Success! The file is now locally backed up!"
  }

  # Remote backup function
  run_remote_backup_on_change () {
    echo "Entering Git repository..."
    cd $GITREPO || exit
    echo "Making a timestamped copy of channel.backup..."
    cp "$SOURCEFILE" "$REMOTE_BACKUP_FILE"
    echo "Committing changes and adding a message"
    git add .
    git commit -m "Static Channel Backup $(date +"%Y%m%d-%H%M%S")"
    echo "Pushing changes to remote repository..."
    git push --set-upstream origin master
    echo "Success! The file is now remotely backed up!"
  }


  # Monitoring function
  run () {
    while true; do

        inotifywait $SOURCEFILE
        echo "channel.backup has been changed!"

        if [ "$LOCAL_BACKUP_ENABLED" == true ]; then
          echo "Local backup is enabled"
          run_local_backup_on_change
        fi

        if [ "$REMOTE_BACKUP_ENABLED" == true ]; then
          echo "Remote backup is enabled"
          run_remote_backup_on_change
        fi

    done
  }

  run
  ```
 
* Make the script executable and move it to the standard bin(ary) directory

  ```sh
  $ sudo chmod +x /usr/local/bin/scb-backup.sh
  ```

### Run backup script in background

We'll setup the backup script as a systemd service to run in the background and start automatically on system startup.

* Create a new service file
  
  ```sh
  sudo nano /etc/systemd/system/scb-backup.service
  ```

* Paste the following lines. Save and exit.
  
  ```ini
  # RaspiBolt: systemd unit for automatic SCB backup
  # /etc/systemd/system/scb-backup.service

  [Unit]
  Description=SCB Backup daemon
  After=lnd.service

  [Service]
  ExecStart=/usr/local/bin/scb-backup.sh
  Restart=always
  RestartSec=1
  User=lnd

  [Install]
  WantedBy=multi-user.target
  ```
  
* Enable and start the service, check its status (it should be 'active')
  
  ```sh
  $ sudo systemctl enable scb-backup.service
  $ sudo systemctl start scb-backup.service
  $ sudo systemctl status scb-backup.service
  ```

### Test

We now cause the default `channel.backup` file to change and see if a copy gets uploaded to the desired backup locations.

* Open the live logging output of the SCB backup systemd service
  
  ```sh
  $ sudo journalctl -f -u scb-backup.service
  > [...]
  > Feb 05 10:55:09 raspibolt scb-backup.sh[25782]: Watches established.
  ```

* Start your SSH program (eg. PuTTY) a second time and log in as “admin”. Commands for the second session start with the prompt $2.
* Simulate a `channel.backup` file change with the `touch` command (don't worry! it simply updates the timestamp of the file but not its content) and then exit the session.
  
  ```sh
  $2 sudo touch ~/.lnd/data/chain/bitcoin/mainnet/channel.backup
  $2 exit
  ```
  
* Go back to the first SSH session, in the logs, you should see new entries similar to these:
  
  ```sh
  > [...]
  > Feb 05 11:05:11 raspibolt scb-backup.sh[25885]: Local backup is enabled
  > Feb 05 11:05:11 raspibolt scb-backup.sh[25885]: Copying backup file to local storage device...
  > Feb 05 11:05:11 raspibolt scb-backup.sh[25885]: Success! The file is now locally backed up!
  > [...]
  > Feb 05 11:05:13 raspibolt scb-backup.sh[25885]: Success! The file is now remotely backed up!
  > Feb 05 11:05:13 raspibolt scb-backup.sh[25885]: Waiting for an update of the SCB file...
  > [...]
  ```

* Check the content of your local storage device. It should now contain a backup file with the date/time corresponding to the test made just above
  
  ```sh
  $ ls -la /mnt/storage-device-scb
  > -rwxr-xr-x 1 lnd  lnd  14011 Feb  5 10:59 channel-20220205-105949.backup
  ```

* Check your GitHub repository (in the "<> code" tab). It should now contain the latest timestamped backup file

You're set! Each time you'll open a new channel or close a channel, a timestamped copy of the backup file will automatically be saved to your desired backup location(s).

<br /><br />

---

Next: [Ride The Lightning >>](rtl.md)

