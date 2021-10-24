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

The node runs headless, that means without keyboard or display, so the operating system Raspberry Pi OS Lite is used.

1. Download and install the [Raspberry Pi Imager](https://www.raspberrypi.org/software/){:target="_blank"}
2. Choose "Raspberry Pi OS (other)" and then "Raspberry Pi OS Lite (32-bit)", choose your SD-card and write the image.

### Enable Secure Shell

Without keyboard or screen, no direct interaction with the Pi is possible during the initial setup.
After writing the image to the microSD card, create an empty file called “ssh” (without extension) in the main directory of the card.
This causes the Secure Shell (ssh) to be enabled from the start and we will be able to login remotely.

* Create a file `ssh` in the boot partition of the microSD card

### Prepare Wifi

You can run your RaspiBolt over Wifi.
To avoid using a network cable for the initial setup, you can pre-configure the wireless settings:

* Create a file `wpa_supplicant.conf` in the boot partition of the microSD card with the following content.
  Note that the network name (ssid) and password need to be in double-quotes (like `psk="password"`)

  ```conf
  ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
  update_config=1
  country=[COUNTRY_CODE]
  network={
    ssid="[WIFI_SSID]"
    psk="[WIFI_PASSWORD]"
  }
  ```

* Replace `[COUNTRY_CODE]` with the [ISO2 code](https://www.iso.org/obp/ui/#search){:target="_blank"} of your country (eg. `US`)
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
  Here are a few links with additional details for [Windows](https://www.computerhope.com/issues/chusedos.htm){:target="_blank"}, [MacOS](https://macpaw.com/how-to/use-terminal-on-mac){:target="_blank"} and [Linux](https://www.howtogeek.com/140679/beginner-geek-how-to-start-using-the-linux-terminal/){:target="_blank"}.

* Try to ping the Raspberry Pi local hostname (press `Ctrl`-`C` to interrupt)

  ```sh
  $ ping raspberrypi.local
  > PING raspberrypi.local (192.168.1.192) 56(84) bytes of data.
  > 64 bytes from 192.168.1.192 (192.168.1.192): icmp_seq=1 ttl=64 time=88.1 ms
  > 64 bytes from 192.168.1.192 (192.168.1.192): icmp_seq=2 ttl=64 time=61.5 ms
  ```

* If you get a response like above, mDNS works within your local network.
  Proceed directly to the next section.

* If the `ping` command fails or does not return anything, you need to manually look for your Pi.
  As this is a common challenge, just follow the official Raspberry Pi guideance on how to find your [IP Address](https://www.raspberrypi.org/documentation/remote-access/ip-address.md){:target="_blank"}.

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

* Windows: PuTTY ([Website](https://www.putty.org){:target="_blank"})
* MacOS and Linux: from the Terminal, use the native command:
  * `ssh pi@raspberrypi.local` or
  * `ssh pi@192.168.0.20`

<script id="asciicast-UxufwsDLfdhIfitCfBbHXx4mA" src="https://asciinema.org/a/UxufwsDLfdhIfitCfBbHXx4mA.js" async></script>

🔍 *more: [using SSH with Raspberry Pi](https://www.raspberrypi.org/documentation/remote-access/ssh/README.md){:target="_blank"}*

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

* First, choose `1 System options` (press enter) and navigate to `S3 Password` (down arrow, and press enter) and change your password to your `password [A]`.
* Next, choose `8 Update` to get the latest configuration tool
* Next, choose `1 System options` and then `S4 Hostname`. You can give your node a cute hostname like “raspibolt”
* Next, choose `1 System options` and then `S5 Boot/Auto Login` and then `B1 Console`
* Next, choose `1 System options` and then `S1 Wireless LAN` and configure your Wifi connection
* Next, choose `1 System options` and then `S6 Network at boot` and select `<Yes>`
* Next, choose `6 Advanced options` and then `A1 Expand Filesystem`
* Exit by selecting `<Finish>` (right arrow twice), and `<No>` as no reboot is necessary

_(Warning: the video below is outdated and does not correspond exactly to the commands above)_
<script id="asciicast-1oSmvJaZLCuN3hUIn33OZCtJy" src="https://asciinema.org/a/1oSmvJaZLCuN3hUIn33OZCtJy.js" async></script>

**Important**: if you connected using the hostname `raspberrypi.local`, you now need to use the new hostname (e.g. `raspibolt.local`)

The following two potential error messages are expected:

* After changing the hostname, e.g. to `raspibolt`, a reboot is required to get rid of this error message.
  It can be safely ignored for now.

  ```
  sudo: unable to resolve host raspberrypi: Name or service not known
  ```

* The `raspi-config` automatically sets your location, but does not generate the corresponding `locale` files:

  ```sh
  perl: warning: Setting locale failed.
  perl: warning: Please check that your locale settings:
  ...
  LC_NUMERIC = "de_CH.UTF-8",
  ...
  are supported and installed on your system.
  ```

  This error is safe to ignore.
  If you want to get rid of it, note the setting for `LC_NUMERIC` (e.g. `de_CH.UTF-8`), select this locale in the following configuration screen and configure it as default.

  ```sh
  $ sudo dpkg-reconfigure locales
  ```
  If the above fix does not remove the locale error, it is probably your host machine that you use to SSH from pushing its locale onto the Pi. What you need to do is very simple: make Pi stop accepting locale over SSH regardless of origin. You do that by editing sshd_config file in nano editor:

```sh
  $ sudo nano /etc/ssh/sshd_config
  ```
All you need to do now is find the AcceptEnv LANG LC_* and make sure to comment it out so it looks like this:
```sh
  #AcceptEnv LANG LC_*
  ```
Now CTRL+X (save) and exit, and the error will be gone.

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

### Python 3 as default
Python will not be used to install Bitcoin, LND, Elctrs or BTC-RPC-Explorer but is used by some of the bonus guides.
The Raspberry Pi OS comes with Python 2 and 3 installed but with Python 2 used as the default one.
Python 2 is no longer supported and will become a [security risk](https://www.darkreading.com/vulnerabilities-threats/continued-use-of-python-2-will-heighten-security-risks) as time passes. 
Hence, it is preferable to only use Python 3 when using Python for our node.

* Log in with the root user and check what is the default Python version

  ```sh
  $ sudo su -
  $ python --version
  > Python 2.7.16
  $ python3 --version
  > Python 3.7.3
  ```
  
* To change the Python version system-wide, we can use update-alternatives command

  ```sh
  $ update-alternatives --list python
  > update-alternatives: error: no alternatives for python
  ```
* The error message tells us that no alternatives have been defined so far.
Update the alternative table using the followong command. The argument at the end indicates the priority (highest priority here is 2, i.e. version 3.7)
  
  ```sh
  $ update-alternatives --install /usr/bin/python python /usr/bin/python2.7 1
  > update-alternatives: using /usr/bin/python2.7 to provide /usr/bin/python (python) in auto mode
  $ update-alternatives --install /usr/bin/python python /usr/bin/python3.7 2
  > update-alternatives: using /usr/bin/python3.4 to provide /usr/bin/python (python) in auto mode
  ```
* Check that the default version of Python is now v3.7
  ```sh
  $ python --version
  > Python 3.7.3
  ```

### Add users

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

The bitcoin and lightning processes will run in the background (as a "daemon") and use the separate user “bitcoin” for security reasons.
This user does not have admin rights and cannot change the system configuration.

* Enter the following command, set your `password [A]` and confirm all questions with the enter/return key.

  ```sh
  $ sudo adduser bitcoin
  ```

* For convenience, the user "admin" is also a member of the group "bitcoin", giving it read-only privileges to configuration files.

  ```sh
  $ sudo adduser admin bitcoin
  ```

* Restart your RaspiBolt.

  ```sh
  $ sudo reboot
  ```

<script id="asciicast-8uhMDvDcDNf3cUT6A3FcqN4lo" src="https://asciinema.org/a/8uhMDvDcDNf3cUT6A3FcqN4lo.js" async></script>


---

## Attach external drive

To store the blockchain, we need a lot of space.
As a server installation, the Linux native file system Ext4 is the best choice for the external hard disk, so we will format the hard disk, erasing all previous data.
The external hard disk is then attached to the file system and can be accessed as a regular folder (this is called “mounting”).

🚨 **Existing data on this drive will be deleted!**

### Log in as "admin"

* Do not yet connect the external drive to your Pi, we need to check some things first.
* Start your Raspberry Pi by unplugging it and connecting the power cable again.
* Log in using SSH, but now with the user `admin`, your `password [A]` and the new hostname (e.g. `raspibolt.local`) or the IP address.

  ```sh
  $ ssh admin@raspibolt.local
  ```

* To change system configuration and files that don't belong to the "admin", you have to prefix commands with `sudo`.
  You will be prompted to enter your admin password from time to time for increased security.

### Make sure USB3 is performant

The Raspberry Pi 4 supports USB3 drives, but is very picky.
A lot of USB3 adapters for external drives are not compatible and need a manual workaround to be usable.
We will now check if your drive works well as-is, or if additional configuration is needed.

🔍 *more: [Raspberry Pi forum: bad performance with USB3 SSDs](https://www.raspberrypi.org/forums/viewtopic.php?f=28&t=245931){:target="_blank"}*

* First, lets get some information about your drive from the kernel messages.
  Clear the kernel buffer, and follow the new messages (let the last command run):

  ```sh
  $ sudo dmesg -C
  $ sudo dmesg -w
  ```

* Connect your external drive to the blue USB3 ports of the running Raspberry Pi, preferably with a good cable that came with the drive.

  Once the system recognizes it, details are automatically displayed by the `dmesg` command.

  ```
  [  726.547907] usb 2-1: new SuperSpeed Gen 1 USB device number 3 using xhci_hcd
  [  726.579304] usb 2-1: New USB device found, idVendor=152d, idProduct=0578, bcdDevice= 3.01
  [  726.579321] usb 2-1: New USB device strings: Mfr=1, Product=2, SerialNumber=3
  [  726.579333] usb 2-1: Product: USB 3.0 Device
  [  726.579346] usb 2-1: Manufacturer: USB 3.0 Device
  [  726.579357] usb 2-1: SerialNumber: 000000005B3E
  [  726.582254] usb 2-1: UAS is blacklisted for this device, using usb-storage instead
  [  726.582350] usb 2-1: UAS is blacklisted for this device, using usb-storage instead
  [  726.582364] usb-storage 2-1:1.0: USB Mass Storage device detected
  [  726.582674] usb-storage 2-1:1.0: Quirks match for vid 152d pid 0578: 1800000
  [  726.582783] scsi host0: usb-storage 2-1:1.0
  [  727.598422] scsi 0:0:0:0: Direct-Access     INTENSO  SATA III SSD     0301 PQ: 0 ANSI: 6
  [  727.599182] sd 0:0:0:0: Attached scsi generic sg0 type 0
  [  727.605796] sd 0:0:0:0: [sda] 937703088 512-byte logical blocks: (480 GB/447 GiB)
  [  727.606519] sd 0:0:0:0: [sda] Write Protect is off
  [  727.606536] sd 0:0:0:0: [sda] Mode Sense: 47 00 00 08
  [  727.607982] sd 0:0:0:0: [sda] Disabling FUA
  [  727.607998] sd 0:0:0:0: [sda] Write cache: enabled, read cache: enabled, doesn't support DPO or FUA
  [  727.611337]  sda: sda1
  [  727.614890] sd 0:0:0:0: [sda] Attached SCSI disk
  ```

* Make a note of the values shown for `idVendor` and `idProduct` (in this case "152d" and "0578").
  Then, exit `dmesg` with `Ctrl`-`C`.

* List all block devices with additional information.
  The list shows the devices (e.g. `sda`) and the partitions they contain (e.g. `sda1`).

  Make a note of the partition name you want to use (in this case "sda1").

  ```sh
  $ lsblk -o NAME,MOUNTPOINT,UUID,FSTYPE,SIZE,LABEL,MODEL
  > NAME        MOUNTPOINT UUID                                 FSTYPE   SIZE LABEL  MODEL
  > sda                                                                447.1G        SATA_III_SSD
  > └─sda1                 9ec0b784-d448-4757-a3b2-8abd57c544f3 ext4   447.1G
  > mmcblk0                                                             14.9G
  > ├─mmcblk0p1 /boot      5203-DB74                            vfat     256M boot
  > └─mmcblk0p2 /          2ab3f8e1-7dc6-43f5-b0db-dd5759d51d4e ext4    14.6G rootfs
  ```

* If your external drive (e.g. `sda`) does not contain any partitions (e.g. no `sda1`), create a partition first using as described here:
  <https://superuser.com/questions/643765/creating-ext4-partition-from-console>

* Now, let's test the read performance of your drive.
  Make sure to use the right partition name (used with the `/dev/` prefix).

  ```sh
  $ sudo hdparm -t --direct /dev/sda1

  /dev/sda1:
  Timing O_DIRECT disk reads:   2 MB in 31.18 seconds =  65.69 kB/sec
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
    usb-storage.quirks=152d:0578:u ..............
    ```

  * Reboot the Raspberry Pi with the external drive still attached.

    ```sh
    $ sudo reboot
    ```

  * After you logged in as "admin" again, let's test the read performance once more.

    ```sh
    $ sudo hdparm -t --direct /dev/sda1

    /dev/sda1:
    Timing O_DIRECT disk reads: 510 MB in  3.01 seconds = 169.59 MB/sec
    ```

  * You should see a significant increase in performance.
  If the test still shows a very slow read speed, your drive or USB adapter might not be compatible with the Raspberry Pi.
  In that case I recommend visiting the Raspberry Pi [Troubleshooting forum](https://www.raspberrypi.org/forums/viewforum.php?f=28){:target="_blank"} or simply try out hardware alternatives.

<script id="asciicast-NiOhoAsu2g9kltfHXzfU6GLnq" src="https://asciinema.org/a/NiOhoAsu2g9kltfHXzfU6GLnq.js" async></script>

### Format external drive and mount

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

  🔍 *more: [complete fstab guide](http://www.linuxstall.com/fstab){:target="_blank"}*

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

🔍 *more: [external storage configuration](https://www.raspberrypi.org/documentation/configuration/external-storage.md){:target="_blank"}*

---

## Move swap file

The usage of a swap file can degrade your SD card very quickly.
Therefore, we will move it to the external drive.

* Edit the configuration file and replace existing entries with the ones below. Save and exit.

  ```sh
  $ sudo nano /etc/dphys-swapfile
  ```

   ```ini
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
