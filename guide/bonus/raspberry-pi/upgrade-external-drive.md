---
layout: default
title: Upgrade External Drive
parent: + Raspberry Pi
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

## Bonus Guide: Upgrade External Drive
{: .no_toc }

Difficulty: Intermediate
{: .label .label-yellow }

Status: Not tested v3
{: .label .label-yellow }

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

This is a guide for upgrading the external drive. Periodically, as the size of the blockchain grows, you will need to upgrade to a larger drive.

---

### Backup Important Files

You should make a backup of any important files before proceeding with this operation.

At a minimum, it's recommended to make a backup of the LND static channel backups.
Please check the [Channel Backup](../../lightning/channel-backup.md) section for more details.

---

### Stop existing services

To reduce the potential for data corruption, we don't want any of the services running while working through this upgrade.

Stop and disable each service

  ```sh
  $ sudo systemctl stop btcrpcexplorer
  $ sudo systemctl stop electrs
  $ sudo systemctl stop lnd
  $ sudo systemctl stop bitcoind
  $ sudo systemctl disable btcrpcexplorer.service
  $ sudo systemctl disable electrs.service
  $ sudo systemctl disable lnd.service
  $ sudo systemctl disable bitcoind.service
  ```

### Software update

It is important to keep the system up-to-date with security patches and application updates.
The “Advanced Packaging Tool” (apt) makes this easy.

💡 Do this regularly every few months to get security related updates.

```sh
$ sudo apt update
$ sudo apt full-upgrade
```

Make sure that all necessary software packages are installed:

```sh
$ sudo apt install htop git curl bash-completion jq qrencode dphys-swapfile hdparm --install-recommends
```

<script id="asciicast-hg9s5u5vzv04OpUPwTFfqqrLy" src="https://asciinema.org/a/hg9s5u5vzv04OpUPwTFfqqrLy.js" async></script>

### Attach a second external drive

To store the blockchain, we need a lot of space.
As a server installation, the Linux native file system Ext4 is the best choice for the external hard disk, so we will format the hard disk, erasing all previous data.
The external hard disk is then attached to the file system and can be accessed as a regular folder (this is called “mounting”).

🚨 **Existing data on this drive will be deleted!**

#### Log in as "admin"

* Do not yet connect the external drive to your Pi, we need to check some things first.
* Start your Raspberry Pi by unplugging it and connecting the power cable again.
* Log in using SSH, but now with the user `admin`, your `password [A]` and the new hostname (e.g. `raspibolt.local`) or the IP address.

  ```sh
  $ ssh admin@raspibolt.local
  ```

* To change system configuration and files that don't belong to the "admin", you have to prefix commands with `sudo`.
  You will be prompted to enter your admin password from time to time for increased security.

#### Make sure USB3 is performant

The Raspberry Pi 4 supports USB3 drives, but is very picky.
A lot of USB3 adapters for external drives are not compatible and need a manual workaround to be usable.
We will now check if your drive works well as-is, or if additional configuration is needed.

🔍 *more: [Raspberry Pi forum: bad performance with USB3 SSDs](../../raspberry-pi/system-configuration.md#check-usb3-drive-performance){:target="_blank"}*

* First, lets get some information about your drive from the kernel messages.
  Clear the kernel buffer, and follow the new messages (let the last command run):

  ```sh
  $ sudo dmesg -C
  $ sudo dmesg -w
  ```

* Connect your external drive to the blue USB3 ports of the running Raspberry Pi, preferably with a good cable that came with the drive.

  Once the system recognizes it, details are automatically displayed by the `dmesg` command.

  ```
  [816984.221283] usb 2-2: new SuperSpeed Gen 1 USB device number 3 using xhci_hcd
  [816984.252697] usb 2-2: New USB device found, idVendor=152d, idProduct=1561, bcdDevice= 2.04
  [816984.252713] usb 2-2: New USB device strings: Mfr=1, Product=2, SerialNumber=3
  [816984.252726] usb 2-2: Product: SABRENT
  [816984.252738] usb 2-2: Manufacturer: SABRENT
  [816984.252750] usb 2-2: SerialNumber: DB9876543214E
  [816984.288041] scsi host1: uas
  [816984.289535] scsi 1:0:0:0: Direct-Access     SABRENT                   0204 PQ: 0 ANSI: 6
  [816984.291894] sd 1:0:0:0: Attached scsi generic sg1 type 0
  [816984.982236] sd 1:0:0:0: [sdb] 2000409264 512-byte logical blocks: (1.02 TB/954 GiB)
  [816984.982253] sd 1:0:0:0: [sdb] 4096-byte physical blocks
  [816984.982504] sd 1:0:0:0: [sdb] Write Protect is off
  [816984.982520] sd 1:0:0:0: [sdb] Mode Sense: 53 00 00 08
  [816984.982917] sd 1:0:0:0: [sdb] Write cache: enabled, read cache: enabled, doesn't support DPO or FUA
  [816984.983652] sd 1:0:0:0: [sdb] Optimal transfer size 33553920 bytes not a multiple of physical block size (4096 bytes)
  [816984.988800] sd 1:0:0:0: [sdb] Attached SCSI disk
  ```

* Make a note of the values shown for `idVendor` and `idProduct` (in this case "152d" and "1561").
  Then, exit `dmesg` with `Ctrl`-`C`.

* List all block devices with additional information.
  The list shows the devices (e.g. `sdb`) and if they exist, the partitions they contain (e.g. `sdb1`).

  Make a note of the partition name you want to use (in this case "sdb1").

  ```sh
  $ lsblk -o NAME,MOUNTPOINT,UUID,FSTYPE,SIZE,LABEL,MODEL
  > NAME        MOUNTPOINT UUID                                 FSTYPE   SIZE LABEL  MODEL
  > sda                                                                931.5G        BUP_Slim_RD
  > └─sda1      /mnt/ext   3aab0952-3ed4-4652-b203-d994c4fdff20 ext4   931.5G
  > sdb                                                                953.9G        SABRENT
  > mmcblk0                                                               58G
  > ├─mmcblk0p1 /boot      4BBD-D3E7                            vfat     256M boot
  > └─mmcblk0p2 /          45e99191-771b-4e12-a526-0779148892cb ext4    57.8G rootfs
  ```

* In the above, the original external drive is `sda` and has partition `sda1`.
  The newly attached external drive is `sdb` and has no partition yet.
  It's very important to keep track of which block device and partition applies to the original vs new drive

* If your external drive (e.g. `sdb`) does not contain any partitions (e.g. no `sdb1`), create a partition first using as described here:
  [https://superuser.com/questions/643765/creating-ext4-partition-from-console](https://superuser.com/questions/643765/creating-ext4-partition-from-console){:target="_blank"}

* Now, let's test the read performance of your drive.
  Make sure to use the right partition name (used with the `/dev/` prefix).

  ```sh
  $ sudo hdparm -t --direct /dev/sdb1

  /dev/sdb1:
  Timing O_DIRECT disk reads:   2 MB in 31.15 seconds =  65.75 kB/sec
  ```

* In this case, the performance is really bad: 65 kB/sec is so 1990's.
  If the measured speed is more than 50 MB/s, you can skip the rest of this section and go directly to formatting the external drive.

  Otherwise we need to configure the USB driver to ignore the UAS interface of your drive.
  This configuration must be passed to the Linux kernel on boot:

  * Open the `cmdline.txt` file of the bootloader.

    ```sh
    $ sudo nano /boot/cmdline.txt
    ```

  * At the start of the line of parameters, add the text `usb-storage.quirks=aaaa:bbbb:u` where `aaaa` is the "idVendor" and `bbbb` is the "idProduct" value.
    Make sure that there is a single space character (` `) between our addition and the next parameter.
    Save and exit.

    ```
    usb-storage.quirks=152d:1561:u ..............
    ```

  * Reboot the Raspberry Pi with the external drive still attached.

    ```sh
    $ sudo reboot
    ```

  * After you logged in as "admin" again, let's test the read performance once more.

    ```sh
    $ sudo hdparm -t --direct /dev/sdb1

    /dev/sdb1:
    Timing O_DIRECT disk reads: 574 MB in  3.00 seconds = 191.07 MB/sec
    ```

  * You should see a significant increase in performance.
  If the test still shows a very slow read speed, your drive or USB adapter might not be compatible with the Raspberry Pi.
  In that case I recommend visiting the Raspberry Pi [Troubleshooting forum](https://www.raspberrypi.org/forums/viewforum.php?f=28){:target="_blank"} or simply try out hardware alternatives.

<script id="asciicast-NiOhoAsu2g9kltfHXzfU6GLnq" src="https://asciinema.org/a/NiOhoAsu2g9kltfHXzfU6GLnq.js" async></script>

#### Format external drive and mount

* Format the partition on the external drive with Ext4 (use `[NAME]` from above, e.g `sdb1`)

  ```sh
  $ sudo mkfs.ext4 /dev/[NAME]
  ```

* List the devices once more and copy the `UUID` of the new partition into a text editor on your main machine.

  ```sh
  $ lsblk -o NAME,MOUNTPOINT,UUID,FSTYPE,SIZE,LABEL,MODEL
  > NAME        MOUNTPOINT UUID                                 FSTYPE   SIZE LABEL  MODEL
  > sda                                                                931.5G        BUP_Slim_RD
  > └─sda1      /mnt/ext   3aab0952-3ed4-4652-b203-d994c4fdff20 ext4   931.5G
  > sdb                                                                953.9G        SABRENT
  > └─sdb1                 1d9e9dee-87c3-4296-94e2-e833b948a19d ext4   953.9G
  > mmcblk0                                                               58G
  > ├─mmcblk0p1 /boot      4BBD-D3E7                            vfat     256M boot
  > └─mmcblk0p2 /          45e99191-771b-4e12-a526-0779148892cb ext4    57.8G rootfs
  ```

* Edit the `fstab` file and add the following as a new line at the end, replacing `123456` with your own `UUID`.

  ```sh
  $ sudo nano /etc/fstab
  ```

  ```
  UUID=123456 /mnt/extnew ext4 rw,nosuid,dev,noexec,noatime,nodiratime,auto,nouser,async,nofail 0 2
  ```

  Here is an example of the new mount point for the new drive along side the original drive

  ```
  proc            /proc           proc    defaults          0       0
  PARTUUID=738a4d67-01  /boot           vfat    defaults          0       2
  PARTUUID=738a4d67-02  /               ext4    defaults,noatime  0       1
  UUID=3aab0952-3ed4-4652-b203-d994c4fdff20 /mnt/ext ext4 rw,nosuid,dev,noexec,noatime,nodiratime,auto,nouser,async,nofail 0 2
  UUID=1d9e9dee-87c3-4296-94e2-e833b948a19d /mnt/extnew ext4 rw,nosuid,dev,noexec,noatime,nodiratime,auto,nouser,async,nofail 0 2
  # a swapfile is not a swap partition, no line here
  #   use  dphys-swapfile swap[on|off]  for that
  ```

  🔍 *more: [How fstab works – introduction to the /etc/fstab file on Linux](https://linuxconfig.org/how-fstab-works-introduction-to-the-etc-fstab-file-on-linux){:target="_blank"}*

* Create the directory to add the hard disk and set the correct owner

  ```sh
  $ sudo mkdir -p /mnt/extnew
  ```

* Mount all drives and check the file system. Is “/mnt/extnew” listed?

  ```sh
  $ sudo mount -a
  $ df -h /mnt/extnew
  > Filesystem      Size  Used Avail Use% Mounted on
  > /dev/sdb1       938G   77M  891G   1% /mnt/extnew
  ```

---

### Move swap file to New Drive

Presumably, the new external drive is more performant then the original.  We will temporarily move the swap file to the new mounted location.

* Edit the configuration file and replace existing entries with the ones below. Save and exit.

  ```sh
  $ sudo nano /etc/dphys-swapfile
  ```

   ```ini
   CONF_SWAPFILE=/mnt/extnew/swapfile

   # comment or delete the CONF_SWAPSIZE line. It will then be created dynamically
   #CONF_SWAPSIZE=
   ```

* Recreate new swapfile on ssd (will be active after reboot)

  ```sh
  $ sudo dphys-swapfile install
  ```

<script id="asciicast-p7I8GeTfxOk15dFWHu8FVV83q" src="https://asciinema.org/a/p7I8GeTfxOk15dFWHu8FVV83q.js" async></script>

---

### Copy Files to New Drive

We'll use rsync to copy the files, preserving permissions and extended attributes

  ```sh
  $ cd /
  $ sudo rsync -avxHAX --exclude=swapfile --numeric-ids --info=progress2 mnt/ext/ mnt/extnew/
  ```

  The output will show file progression
  ```
  > sending incremental file list
  > ./
  > bitcoin/
  > bitcoin/.lock
  >   2,147,483,648   0%   81.22MB/s    0:00:25 (xfr#2, ir-chk=4327/4334)
  > bitcoin/.walletlock
  >   2,147,483,648   0%   81.22MB/s    0:00:25 (xfr#3, ir-chk=4326/4334)
  > bitcoin/banlist.dat
  >   2,147,483,685   0%   80.19MB/s    0:00:25 (xfr#4, ir-chk=4325/4334)
  > bitcoin/bitcoin.conf
  >   2,147,484,131   0%   80.16MB/s    0:00:25 (xfr#5, ir-chk=4324/4334)
  > bitcoin/db.log
  >   2,147,484,131   0%   80.16MB/s    1:04:17
  > ...
  ```

  While reading from one disk and writing to another can be fairly performant, don't be surprised if this takes a few hours.
  If you are unfamiliar with rsync, here is how to interpret the above output by column

  1. filename and relative path
  2. overall percentage complete
  3. transfer speed
  4. time remaining (e.g. 1:04:17) and then changed to time taken (0:00:25)
  5. xfr is the file number transferred
  6. ir-chk=4324/4334 is the incremental recursion check.  files remaining / files total

  Over the course of the synchronization, the incremental recursion check can increase until it transitions
  to show `to-chk` in place of `ir-chk` as depicted below.  Once this happens, it has discovered all files to copy.

  ```
  > bitcoin/indexes/txindex/206971.ldb
  > 360,288,743,724  84%   59.23MB/s    1:36:41 (xfr#19033, to-chk=1695/20739)
  > bitcoin/indexes/txindex/206972.ldb
  > 360,290,914,611  84%   59.23MB/s    1:36:41 (xfr#19034, to-chk=1694/20739)
  > bitcoin/indexes/txindex/206973.ldb
  > 360,293,085,490  84%   59.23MB/s    1:36:41 (xfr#19035, to-chk=1693/20739)
  > bitcoin/indexes/txindex/206974.ldb
  > 360,295,256,251  84%   59.23MB/s    1:36:41 (xfr#19036, to-chk=1692/20739)
  > bitcoin/indexes/txindex/206975.ldb
  > 360,297,427,362  84%   59.22MB/s    1:36:41 (xfr#19037, to-chk=1691/20739)
  > bitcoin/indexes/txindex/206978.ldb
  > 360,299,598,549  84%   59.22MB/s    1:36:41 (xfr#19038, to-chk=1690/20739)
  > bitcoin/indexes/txindex/206979.ldb
  > 360,301,769,513  84%   59.22MB/s    1:36:42 (xfr#19039, to-chk=1689/20739)
  > bitcoin/indexes/txindex/206980.ldb
  ```

  And when it finishes it should look something like this
  ```sh
  > lost+found/
  > 426,795,633,281 100%   54.07MB/s    2:05:28 (xfr#20717, to-chk=0/20739)
  >
  > sent 426,901,227,575 bytes  received 393,910 bytes  56,674,626.15 bytes/sec
  > total size is 426,795,633,281  speedup is 1.00
  ```

  You can do a cursory check to verify the used space is equal between original and new drive
  ```sh
  $ df -h
  > Filesystem      Size  Used Avail Use% Mounted on
  > /dev/root        57G  5.4G   50G  10% /
  > devtmpfs        1.8G     0  1.8G   0% /dev
  > tmpfs           2.0G     0  2.0G   0% /dev/shm
  > tmpfs           2.0G  8.8M  1.9G   1% /run
  > tmpfs           5.0M  4.0K  5.0M   1% /run/lock
  > tmpfs           2.0G     0  2.0G   0% /sys/fs/cgroup
  > /dev/mmcblk0p1  253M   53M  200M  21% /boot
  > /dev/sda1       916G  398G  472G  46% /mnt/ext
  > tmpfs           391M     0  391M   0% /run/user/1001
  > /dev/sdb1       938G  398G  493G  45% /mnt/extnew
  ```



---

### Swap drive mounts

#### Set swap back to original location


* Turn off the current swapfile

  ```sh
  $ sudo dphys-swapfile swapoff
  ```

* Edit the configuration file and replace existing entries with the ones below. Save and exit.

  ```sh
  $ sudo nano /etc/dphys-swapfile
  ```

   ```ini
   CONF_SWAPFILE=/mnt/ext/swapfile

   # comment or delete the CONF_SWAPSIZE line. It will then be created dynamically on restart
   #CONF_SWAPSIZE=
   ```

* Remove existing swapfile (the one on /mnt/extnew)

  ```sh
  $ sudo dphys-swapfile uninstall
  ```

* Verify it is gone

  ```sh
  $ ls -la /mnt/extnew/swapfile
  > ls: cannot access '/mnt/extnew/swapfile': No such file or directory
  ```

#### Switch to the new drive

Now that the new drive contains all the old files, we will remount it in place of the original.

* Unmount both drives

  ```sh
  $ unmount /dev/sda1
  $ unmount /dev/sdb1
  ```

* Edit the `fstab` file.  Comment or delete the existing /mnt/ext, and rename /mnt/extnew of the new drive to /mnt/ext.

  ```sh
  $ sudo nano /etc/fstab
  ```

  Here is an example of the change. Note that both refer to the same mount point and we commented out the line for the original drive.

  ```ini
  proc            /proc           proc    defaults          0       0
  PARTUUID=738a4d67-01  /boot           vfat    defaults          0       2
  PARTUUID=738a4d67-02  /               ext4    defaults,noatime  0       1
  # This is the original drive
  #UUID=3aab0952-3ed4-4652-b203-d994c4fdff20 /mnt/ext ext4 rw,nosuid,dev,noexec,noatime,nodiratime,auto,nouser,async,nofail 0 2
  # This is the new drive
  UUID=1d9e9dee-87c3-4296-94e2-e833b948a19d /mnt/ext ext4 rw,nosuid,dev,noexec,noatime,nodiratime,auto,nouser,async,nofail 0 2
  # a swapfile is not a swap partition, no line here
  #   use  dphys-swapfile swap[on|off]  for that
  ```

  Save and exit

* Remount the drives

  ```sh
  $ mount -av
  > /proc                    : already mounted
  > /boot                    : already mounted
  > /                        : ignored
  > /mnt/ext                 : successfully mounted
  ```

* Check the free space

  ```sh
  $ df -h
  > Filesystem      Size  Used Avail Use% Mounted on
  > /dev/root        57G  5.4G   50G  10% /
  > devtmpfs        1.8G     0  1.8G   0% /dev
  > tmpfs           2.0G     0  2.0G   0% /dev/shm
  > tmpfs           2.0G   19M  1.9G   1% /run
  > tmpfs           5.0M  4.0K  5.0M   1% /run/lock
  > tmpfs           2.0G     0  2.0G   0% /sys/fs/cgroup
  > /dev/mmcblk0p1  253M   53M  200M  21% /boot
  > tmpfs           391M     0  391M   0% /run/user/1001
  > /dev/sdb1       938G  398G  493G  45% /mnt/ext
  ```

* Power down the Raspberry Pi

  ```sh
  $ sudo shutdown --poweroff now
  ```

  You'll be logged out of the SSH session.

  You can power off the Raspberry Pi

* Unplug the original drive

  Remove the original drive from the Raspbery Pi.

  The only external drive connected now is the new drive.

* Power on the Raspberry Pi

  Turn on the power switch, and wait for the system to boot up

  From your local system, log back in with admin

* Verify the drive mounted

  Note that it changed the device handle from /dev/sdb1 to /dev/sda1

  ```sh
  $ df -h
  > Filesystem      Size  Used Avail Use% Mounted on
  > /dev/root        57G  7.4G   48G  14% /
  > devtmpfs        1.8G     0  1.8G   0% /dev
  > tmpfs           2.0G     0  2.0G   0% /dev/shm
  > tmpfs           2.0G  8.5M  1.9G   1% /run
  > tmpfs           5.0M  4.0K  5.0M   1% /run/lock
  > tmpfs           2.0G     0  2.0G   0% /sys/fs/cgroup
  > /dev/mmcblk0p1  253M   53M  200M  21% /boot
  > /dev/sda1       938G  398G  493G  45% /mnt/ext
  > tmpfs           391M     0  391M   0% /run/user/1001
  ```

---

### Start services

* Enable and start the services

  ```sh
  $ sudo systemctl enable bitcoind.service
  $ sudo systemctl enable lnd.service
  $ sudo systemctl enable electrs.service
  $ sudo systemctl enable btcrpcexplorer.service
  $ sudo systemctl start bitcoind
  $ sudo systemctl start lnd
  $ sudo systemctl start electrs
  $ sudo systemctl start btcrpcexplorer
  ```

* Unlock the LND wallet

  Unless you have auto-unlocking enabled, you'll need to unlock the wallet for LND

  ```sh
  $ lncli unlock
  > Input wallet password:
  >
  > lnd successfully unlocked!
  ```

---

### Complete

**Congratulations**, you have now completed the upgrade of your external drive!
As the blockchain continues to grow you'll be able to repeat these steps in the future.

------

<< Back: [+ Raspberry Pi](index.md)
