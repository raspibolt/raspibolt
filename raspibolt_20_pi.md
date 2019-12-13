---
layout: default
title: Raspberry Pi
nav_order: 20
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->

# Raspberry Pi
{: .no_toc }

We configure the Raspberry Pi and install the Linux operating system.

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Preparing the operating system

The node runs headless, that means without keyboard or display, so the operating system Raspbian Buster Lite is used.

1. Download the [Raspbian Buster Lite](https://www.raspberrypi.org/downloads/raspbian/) disk image
2. Write the disk image to your SD card with [this guide](https://www.raspberrypi.org/documentation/installation/installing-images/README.md)

### Enable Secure Shell

Without keyboard or screen, no direct interaction with the Pi is possible during the initial setup.
After writing the image to the Micro SD card, create an empty file called “ssh” (without extension) in the main directory of the card.
This causes the Secure Shell (ssh) to be enabled from the start and we will be able to login remotely.

* Create a file `ssh` in the boot partition of the MicroSD card

### Prepare Wifi

You can run it with a wireless network connection.
To avoid using a network cable for the initial setup, you can pre-configure the wireless settings:

* Create a file `wpa_supplicant.conf` on the MicroSD card with the following content.
  Note that the network name (ssid) and password need to be in double-quotes (like `psk="password"`)

  ```
  country=[COUNTRY_CODE]
  ctrl_interface=/var/run/wpa_supplicant GROUP=netdev
  update_config=1
  network={
    ssid="[WIFI_SSID]"
    psk="[WIFI_PASSWORD]"
  }
  ```

* Replace `[COUNTRY_CODE]` with the [ISO2 code](https://www.iso.org/obp/ui/#search) of your country (eg. `US`)
* Replace `[WIFI_SSID]` and `[WIFI_PASSWORD]` with the credentials for your own WiFi.

### Start your Pi

* Safely eject the sd card from your computer
* Insert the sd card into the Pi
* If you did not already setup Wifi: connect the Pi to your network with an ethernet cable
* Start the Pi by connecting it to the power adapter using the USB-C cable

---

## Connecting to the Raspberry Pi

### Find it

The Pi is starting and gets a new address from your home network.
Finding it can be a bit tricky without a screen.
If you're lucky, you don't need to know this address and can just connect using mDNS.

* On your regular computer, open the Terminal (also known as "command line").
  Here are a few links with additional details for [Windows](https://www.computerhope.com/issues/chusedos.htm), [MacOS](https://macpaw.com/how-to/use-terminal-on-mac) and [Linux](https://www.howtogeek.com/140679/beginner-geek-how-to-start-using-the-linux-terminal/).

* Try to ping the Raspberry Pi local hostname (press `Ctrl`-`C` to )

  ```sh
  $ ping raspberrypi.local
  > PING raspberrypi.local (192.168.1.192) 56(84) bytes of data.
  > 64 bytes from 192.168.1.192 (192.168.1.192): icmp_seq=1 ttl=64 time=88.1 ms
  > 64 bytes from 192.168.1.192 (192.168.1.192): icmp_seq=2 ttl=64 time=61.5 ms
  ```

* If you get a response like above, mDNS works within your local network.
  Proceed directly to the next section.

* If the `ping` command fails or does not return anything, you need to manually look for your Pi.
  As this is a common challenge, just follow the official Raspberry Pi guideance on how to find your [IP Address](https://www.raspberrypi.org/documentation/remote-access/ip-address.md.)

* You should now be able to reach your Pi, either with the hostname `raspberrypi.local` or an IP address like `192.168.0.20`.

### Access with Secure Shell

Now it’s time to connect to the Pi via SSH and get to work.
For that, a Secure Shell (SSH) client is needed.

If you need to provide connection details, use the following settings:

* host name: `raspberrypi.local` or the ip address like `192.168.0.20`
* port: `22`
* username: `pi`
* password:  `raspberry`.

Install and start the SSH client for your operating system:

* Windows: PuTTY ([Website](https://www.putty.org))
* MacOS and Linux: from the Terminal, use the native command:
  * `ssh pi@raspberrypi.local` or
  * `ssh pi@192.168.0.20`

<script id="asciicast-UxufwsDLfdhIfitCfBbHXx4mA" src="https://asciinema.org/a/UxufwsDLfdhIfitCfBbHXx4mA.js" async></script>

🔍 *more: [using SSH with Raspberry Pi](https://www.raspberrypi.org/documentation/remote-access/ssh/README.md)*

---

## The command line

We are going to work on the command line of the Pi, which may be new to you.
Find some basic information below, it will help you navigate and interact with your Pi.

You enter commands and the Pi answers by printing the results below your command.
To make it clear where a command begins, every command in this guide starts with the `$` sign. The system response is marked with the `>` character.

In the following example, just enter `ls -la` and press the enter/return key:

```sh
$ ls -la
> example system response
# This is a comment, don't enter this on the command line
```

* **Auto-complete commands**:
  When you enter commands, you can use the `Tab` key for auto-completion, eg. for commands, directories or filenames.

* **Command history**:
  by pressing ⬆️ (arrow up) and ⬇️ (arrow down) on your keyboard, you can recall your previously entered commands.

* **Common Linux commands**:
  For a very selective reference list of Linux commands, please refer to the [FAQ](raspibolt_faq.md) page.

* **Use admin privileges**:
  Our regular user has no admin privileges.
  If a command needs to edit the system configuration, we need to use the `sudo` ("superuser do") command as prefix.
  Instead of editing a system file with `nano /etc/fstab`, we use `sudo nano /etc/fstab`.

  For security reasons, the user "bitcoin" cannot use the `sudo` command.

* **Using the Nano text editor**:
  We use the Nano editor to create new text files or edit existing ones.
  It's not complicated, but to save and exit is not intuitive.

  * Save: hit `Ctrl-O` (for Output), confirm the filename, and hit the `Enter` key
  * Exit: hit `Ctrl-X`

* **Copy / Paste**:
  If you are using Windows and the PuTTY SSH client, you can copy text from the shell by selecting it with your mouse (no need to click anything), and paste stuff at the cursor position with a right-click anywhere in the ssh window.

  In other Terminal programs, copy/paste usually works with `Ctrl`-`Shift`-`C` and `Ctrl`-`Shift`-`V`.

<script id="asciicast-mfa3ZyTE3K1RdbAXowaFjEJZK" src="https://asciinema.org/a/mfa3ZyTE3K1RdbAXowaFjEJZK.js" async></script>

---

## Working on the Raspberry Pi

You are now on the command line of your own Bitcoin node.
Let's start with the configuration.

### Raspi-Config

Enter the following command:

```sh
$ sudo raspi-config
```

* First, on `1` change your password to your `password [A]`.
* Next, choose Update `8` to get the latest configuration tool
* Network Options `2`:
  * you can give your node a cute hostname like “raspibolt”
  * configure your Wifi connection
* Boot Options `3`:
  * choose `Desktop / CLI` → `B1 Console` and
  * `Wait for network at boot`
* Localisation `4`: set your timezone
* Advanced `7`: run `Expand Filesystem`
* Exit by selecting `<Finish>`, and `<No>` as no reboot is necessary

<script id="asciicast-1oSmvJaZLCuN3hUIn33OZCtJy" src="https://asciinema.org/a/1oSmvJaZLCuN3hUIn33OZCtJy.js" async></script>

 **Important**: if you connected using the hostname `raspberrypi.local`, you now need to use the new hostname (e.g. `raspibolt.local`)

### Software update

It is important to keep the system up-to-date with security patches and application updates.
The “Advanced Packaging Tool” (apt) makes this easy.

💡 Do this regularly every few months to get security related updates.

```sh
$ sudo apt update
$ sudo apt upgrade
```

Make sure that all necessary software packages are installed:

```sh
$ sudo apt install htop git curl bash-completion jq qrencode dphys-swapfile hdparm --install-recommends
```

<script id="asciicast-hg9s5u5vzv04OpUPwTFfqqrLy" src="https://asciinema.org/a/hg9s5u5vzv04OpUPwTFfqqrLy.js" async></script>

### Add user "admin"

This guide uses the main user "admin" instead of "pi" to make it more reusable with other platforms.

* Create the new user "admin", set `password [A]` and add it to the group "sudo"

  ```sh
  $ sudo adduser admin
  $ sudo adduser admin sudo
  ```

* And while you’re at it, change the password of the “root” admin user to your `password [A]`.

  ```sh
  $ sudo passwd root
  ```

### Add the service user “bitcoin”

The bitcoin and lightning processes will run in the background (as a "daemon") and use the separate user “bitcoin” for security reasons.
This user does not have admin rights and cannot change the system configuration.

* Enter the following command, set your `password [A]` and confirm all questions with the enter/return key.

  ```sh
  $ adduser bitcoin
  ```

* Shut your RaspiBolt down.

  ```sh
  $ sudo shutdown now
  ```

<script id="asciicast-8uhMDvDcDNf3cUT6A3FcqN4lo" src="https://asciinema.org/a/8uhMDvDcDNf3cUT6A3FcqN4lo.js" async></script>

---

## Attach external drive

To store the blockchain, we need a lot of space.
As a server installation, the Linux native file system Ext4 is the best choice for the external hard disk, so we will format the hard disk, erasing all previous data.
The external hard disk is then attached to the file system and can be accessed as a regular folder (this is called “mounting”).

🚨 **Existing data on this drive will be deleted!**

* Connect your external drive to the blue USB3 ports of the Raspberry Pi, preferably with a good cable that came with the drive.k

### Log in as "admin"

* Start your Raspberry Pi by unplugging it and connecting the power cable again.
* Log in using SSH, but now with the user `admin`, your `password [A]` and the new hostname (e.g. `raspibolt.local`) or the IP address.

  ```sh
  $ ssh admin@raspibolt.local
  ```

* To change system configuration and files that don't belong to the "admin", you have to prefix command with `sudo`.
  You will be prompted to enter your admin password from time to time for increased security.

### Format external drive and mount

* List all block devices with additional information.
  The list shows the devices (e.g. `sda`) and the partitions they contain (e.g. `sda1`).

  ```sh
  $ lsblk -o NAME,MOUNTPOINT,UUID,FSTYPE,SIZE,LABEL,MODEL
  > NAME        MOUNTPOINT UUID                                 FSTYPE   SIZE LABEL  MODEL
  > sda                                                                447.1G        SATA_III_SSD
  > └─sda1                 9ec0b784-d448-4757-a3b2-8abd57c544f3 ext4   447.1G
  > mmcblk0                                                             14.9G
  > ├─mmcblk0p1 /boot      5203-DB74                            vfat     256M boot
  > └─mmcblk0p2 /          2ab3f8e1-7dc6-43f5-b0db-dd5759d51d4e ext4    14.6G rootfs
  ```

* Format the partition on the external drive with Ext4 (use `[NAME]` from above, e.g `sda1`)

  ```sh
  $ sudo mkfs.ext4 /dev/[NAME]
  ```

* List the devices once more and copy the `UUID` into a text editor on your local computer.

  ```sh
  $ lsblk -o NAME,MOUNTPOINT,UUID,FSTYPE,SIZE,LABEL,MODEL
  ```

* Edit the `fstab` file and add the following as a new line at the end, replacing `123456` with your own `UUID`.

  ```sh
  $ sudo nano /etc/fstab
  ```

  ```
  UUID=123456 /mnt/ext ext4 rw,nosuid,dev,noexec,noatime,nodiratime,auto,nouser,async,nofail 0 2
  ```

  🔍 *more: [complete fstab guide](http://www.linuxstall.com/fstab)*

* Create the directory to add the hard disk and set the correct owner

  ```sh
  $ sudo mkdir /mnt/ext
  ```

* Mount all drives and check the file system. Is “/mnt/ext” listed?

  ```sh
  $ sudo mount -a
  $ df -h /mnt/ext
  > Filesystem      Size  Used Avail Use% Mounted on
  > /dev/sda1       440G   73M  417G   1% /mnt/ext
  ```

### Create bitcoin directory

* Set the owner

  ```sh
  $ sudo chown -R bitcoin:bitcoin /mnt/ext/
  ```

* Switch to user "bitcoin", navigate to the external drive and create the bitcoin directory.

  ```sh
  $ sudo su - bitcoin
  $ cd /mnt/ext
  $ mkdir bitcoin
  $ ls -la
  > total 28
  > drwxr-xr-x 4 bitcoin bitcoin  4096 Dec 12 17:43 .
  > drwxr-xr-x 4 root    root     4096 Dec 12 17:38 ..
  > drwxr-xr-x 2 bitcoin bitcoin  4096 Dec 12 17:43 bitcoin
  > drwx------ 2 bitcoin bitcoin 16384 Dec 12 17:30 lost+found
  ```

* Create a testfile in the new directory and delete it.

  ```sh
  $ touch bitcoin/test.file
  $ rm bitcoin/test.file
  ```

  If this command gives you an error, chances are that your external hard disk is mounted as “read only”.
  This must be fixed before proceeding.
  If you cannot fix it, consider reformatting the external drive.

* Exit the "bitcoin" user session

  ```sh
  $ exit
  ```

<script id="asciicast-c75NG00m72iaguULOzzVc9Z3v" src="https://asciinema.org/a/c75NG00m72iaguULOzzVc9Z3v.js" async></script>

🔍 *more: [external storage configuration](https://www.raspberrypi.org/documentation/configuration/external-storage.md)*

---

## Move swap file

The usage of a swap file can degrade your SD card very quickly.
Therefore, we will move it to the external drive.

* Edit the configuration file and replace existing entries with the ones below. Save and exit.

  ```sh
  $ sudo nano /etc/dphys-swapfile
  ```

   ```
   CONF_SWAPFILE=/mnt/ext/swapfile

   # comment or delete the CONF_SWAPSIZE line. It will then be created dynamically
   #CONF_SWAPSIZE=
   ```

* Recreate new swapfile on ssd (will be active after reboot)

  ```sh
  $ sudo dphys-swapfile install
  ```

<script id="asciicast-p7I8GeTfxOk15dFWHu8FVV83q" src="https://asciinema.org/a/p7I8GeTfxOk15dFWHu8FVV83q.js" async></script>

---

Next: [Security >>](raspibolt_21_security.md)
