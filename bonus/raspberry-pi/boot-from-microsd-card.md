---
layout: default
title: Boot from microSD card
parent: + Raspberry Pi
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

## Bonus Guide: Boot from microSD instead of external drive
{: .no_toc }

---

If the Raspberry Pi is not able to boot from your external drive, you can boot from a microSD card and use the external drive to store all the application data.

Difficulty: Easy
{: .label .label-green }

Status: Tested v3
{: .label .label-green }

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

### Steps required

To boot from a microSD card and store the data on an external drive, there are a few additional steps compared to the default RaspiBolt guide.
Below is a summary of the main differences, with detailed guidance in the following sections.

1. [Operating system](../../operating-system.md):
  * write the operating system to the microSD card instead of the external drive
1. [System configuration](../../system-configuration.md):
  * attach the external drive
  * test the USB3 performance
  * format the drive
  * mount the drive to `/data`

---

### Operating system

When writing RasPiOS to the boot medium, use a high-quality microSD card of 8+ GB instead of the external drive.

---

### System configuration

Connect your external drive to the Raspberry Pi using one of the blue USB3 ports.

Follow the [System configuration](../../system-configuration.md) section until you reach [Data directory](../../system-configuration.md#data-directory), continuing with the instructions below.

In case your external drive shows poor performance, follow the [Fix bad USB3 performance](../../troubleshooting.md#fix-bad-usb3-performance) instructions, as mentioned in the guide.


#### Format external drive

We will now format the external drive.
As a server installation, the Linux native file system Ext4 is the best choice for the external hard disk.

* List all block devices with additional information.
  The list shows the devices (e.g. `sda`) and the partitions they contain (e.g. `sda1`).

  ```sh
  $ lsblk -o NAME,MOUNTPOINT,UUID,FSTYPE,SIZE,LABEL,MODEL
  > NAME        MOUNTPOINT UUID                                 FSTYPE   SIZE LABEL  MODEL
  > sda                                                                931.5G        Ext_SSD
  > `-sda1                 2219-782E                            vfat   931.5G
  > mmcblk0                                                             14.8G
  > |-mmcblk0p1 /boot      DBF3-0E3A                            vfat     256M boot
  > `-mmcblk0p2 /          b73b1dc9-6e12-4e68-9d06-1a1892663226 ext4    14.6G rootfs
  ```

* If your drive does not contain any partitions, follow this [How to Create a Disk Partitions in Linux](https://www.tecmint.com/create-disk-partitions-in-linux/){:target="_blank"} guide first.

* Make a note of the partition name of your external drive (in this case "sda1").

* Format the partition on the external drive with Ext4 (use `[NAME]` from above, e.g. `sda1`)

  🚨 **This will delete all existing data on the external drive!**

  ```sh
  $ sudo mkfs.ext4 /dev/[NAME]
  ```

#### Mount external drive

The external drive is then attached to the file system and becomes available as a regular folder (this is called “mounting”).

* List the block devices once more and copy the new partition's `UUID` into a text editor on your main machine.

  ```sh
  $ lsblk -o NAME,MOUNTPOINT,UUID,FSTYPE,SIZE,LABEL,MODEL
  > NAME        MOUNTPOINT UUID                                 FSTYPE   SIZE LABEL  MODEL
  > sda                                                                931.5G        Ext_SSD
  > └─sda1                 3aab0952-3ed4-4652-b203-d994c4fdff20 ext4   931.5G
  > mmcblk0                                                             14.8G
  > |-mmcblk0p1 /boot      DBF3-0E3A                            vfat     256M boot
  > `-mmcblk0p2 /          b73b1dc9-6e12-4e68-9d06-1a1892663226 ext4    14.6G rootfs
  ```

* Edit the `fstab` file and add the following as a new line at the end, replacing `123456` with your own `UUID`.

  ```sh
  $ sudo nano /etc/fstab
  ```

  ```
  UUID=123456 /data ext4 rw,nosuid,dev,noexec,noatime,nodiratime,auto,nouser,async,nofail 0 2
  ```

  🔍 *more: [complete fstab guide](https://linuxconfig.org/how-fstab-works-introduction-to-the-etc-fstab-file-on-linux){:target="_blank"}*

* Create the data directory as a mount point.
  We also make the directory immutable to prevent data from being written on the microSD card if the external drive is not mounted.

  ```sh
  $ sudo mkdir /data
  $ sudo chattr +i /data
  ```

* Mount all drives and check the file system.
  Is “/data” listed?

  ```sh
  $ sudo mount -a
  $ df -h /data
  > Filesystem      Size  Used Avail Use% Mounted on
  > /dev/sda1       938G   77M  891G   1% /data
  ```

#### Move swap file to New Drive

The swap file acts as slower memory and is essential for system stability.
MicroSD cards are not very performant and degrade over time under constant read/write activity.
Therefore, we move the swap file to the external drive and increase its size as well.

* Edit the configuration file, add the `CONF_SWAPFILE` line, and comment the entry `CONF_SWAPSIZE` out by placing a `#` in front of it.
  Save and exit.

  ```sh
  $ sudo nano /etc/dphys-swapfile
  ```
  ```
  CONF_SWAPFILE=/data/swapfile

  # comment or delete the CONF_SWAPSIZE line. It will then be created dynamically
  #CONF_SWAPSIZE=100
  ```

* Recreate and activate new swapfile

  ```sh
  $ sudo dphys-swapfile install
  $ sudo systemctl restart dphys-swapfile.service
  ```

---

### Continue with the guide

That's it: your Raspberry Pi now boots from the microSD card while the data directory `/data/` is located on the external drive.

You can now continue with the RaspiBolt guide.

------

<< Back: [+ Raspberry Pi](index.md)
