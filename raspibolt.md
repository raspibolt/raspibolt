# Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

I like to tinker and build stuff myself. Recently I built my own Bitcoin / Lightning Node with a simple Raspberry Pi for less than US$100. That's right: take free open-source software and some cheap hardware, and basically become your own bank. It took me several iterations to get it right, and this project taught me a lot. This is my attempt to share my learnings and encourage you to run a node yourself.

## Why am I excited about Bitcoin and Lightning?

**Bitcoin** as a new *technology* is an incredibly interesting endeavor, especially because of its interdisciplinary nature. Bitcoin as *sound money* is going to have a major impact on economic principles and thus society as a whole. In my opinion, a solid, anti-fragile base layer for this future monetary network will be more important than the most novel feature of competing projects. Due to network effects, I can only see one major monetary blockchain - Bitcoin - evolving over time.

At the moment, Bitcoin is more of a store of value and not really suited for small everyday transactions. Due to limitations of the blockchain and the incredible growth of its usage, fees have risen and business models relying on cheap transactions are being priced out. This is fine. *Truly decentralized blockchains are a scarce resource* and cannot scale to accommodate all global transactions. The current scaling pains are a great motivator to build better technology to scale exponentially, as opposed to just making everything bigger for linear scaling.

This is where the **Lightning Network** comes in. As one of several new blockchain “extensions”, its promise is to accommodate nearly unlimited transactions, with instant confirmation, minimal fees and increased privacy. It sounds almost too good to be true, but in contrast to ubiquitous ICO with their own token, this technology is well researched, committed to the cypherpunk open-source ethos and leverages the solid underpinnings of Bitcoin.

To preserve the decentralized nature of this monetary system, I think *it is important that everybody can run their own trustless Bitcoin node*, preferably on cheap hardware like a Raspberry Pi.

![RaspiBolt Logo](https://github.com/Stadicus/guides/raw/raspibolt_initial/raspibolt/images/raspibolt_logo.png)

This is why I set out to run my **RaspiBolt** and think that I have now - through numerous iterations - quite a good configuration, that I would like to share as my modest contribution to the community. I am not a systems specialist, so please feel free to point out improvements.

## About this guide
### Purpose

My aim is to set up a trustless Bitcoin Core and Lightning node that 
* is available 24/7, 
* is part of and supports the decentralization of the Lightning network by routing payments and 
* can be used to send and receive personal payments using the command line interface.

This server is set up without graphical user interface and is used remotely using the Secure Shell (SSH) command line. In the future, this server should function as my personal backend for desktop and mobile wallets, but I haven’t found a good solution to this yet. So, command line it is for the moment.

Spoiler alert: this is the goal of this guide, simply buying a Blockaccino. 
[![
](https://raw.githubusercontent.com/Stadicus/guides/raspibolt_initial/raspibolt/images/blockaccino_goal.png)
](https://vimeo.com/252693058)
  
### Target audience
This guide strives to give simple and foolproof instructions. But the goal is also to do everything ourselves, no shortcuts that involve trust in a 3rd party allowed. This makes this guide quite technical and lengthy, but I try to make it as straightforward as possible and explain everything for you to gain a basic understanding of the how and why.

If you like to learn about Linux, Bitcoin and Lightning, this guide is for you.


### A word of caution
All components of the Lightning network are still under development and we are dealing with real money here. So this guide follows a conservative approach: first setup and test everything on Bitcoin testnet, then - once you are comfortable to put real money on the line - switch to Bitcoin mainnet with a few simple changes.


## Requirements
This guide utilizes free open-source software in combination with cheap hardware. The following components are necessary:
* Raspberry Pi 3 Model B or better
* Micro SD card: 8 GB or more, incl. adapter to your regular computer
* USB power adapter: 5V/1.2A (more ampere is fine) + Micro USB cable
* External hard disk: 500 GB or more with dedicated power supply
* Optional: Raspberry Pi case

![Raspberry Pi](https://github.com/Stadicus/guides/raw/raspibolt_initial/raspibolt/images/raspberrypi_hardware.png)

*Raspberry Pi 3: a tiny computer for less than $40*

I used a Raspberry Pi 3 Model B and set it up with a 8 GB SD card. To run a Lightning node, the full Bitcoin blockchain must be stored locally, which is ~200 GB and growing. I bought a cheap hard disk enclosure and reused an old 500 GB hard disk that was lying around. 

To power my RaspiBolt, I use two power adapters: an old 5v USB mobile phone charger with 1.2A, and the separate power supply of the hard disk enclosure, as the USB ports of the Raspberry Pi cannot provide enough power to run an old external hard disk directly. You might be able to power a new 2.5" drive with one decent USB power supply for the Pi (2.5A+), but no guarantees.

## Download the Bitcoin blockchain
The Bitcoin blockchain contains every transaction since the Genesis block created by Satoshi Nakamoto in 2009. It is constantly growing and currently about 200 Gigabyte in size. We need to verify every block, calculate the balance on every bitcoin address ever used and create a transaction index to be able to run a fully trustless Bitcoin node for Lightning.

:point_right: See [Running a Full Node](https://bitcoin.org/en/full-node) for additional information.

The download is not a problem, but initially processing the whole blockchain would take weeks or months on the Pi due to its low computing power. We need to download and verify the blockchain with Bitcoin Core on a regular computer, and then transfer the data to the Pi. This needs to be done only once, after that the Pi can keep up with new blocks.

This guide assumes you will initially download the blockchain on a Windows machine, but it works with most operating systems. You need to have about 250 GB free disk space available, internally or on an external hard disk (but not the one for the Pi). To copy the blockchain to the Pi, there are several options:

* **Recommended**: The best configurations is formatting the external hard disk of the Pi with the Ext4 file system and then copy the blockchain from your Windows computer via the local network with SCP.

* You want to use an external hard disk with data for your Pi, eg. because you already downloaded the blockchain? You can use the disk as is, but need to skip the formatting part later in this guide.


### Download and verify Bitcoin Core
Download the Bitcoin Core installer from bitcoin.org/download and store it in the directory you want to use to download the blockchain. To check the authenticity of the program, we calculate its checksum and compare it with the checksums provided. 

In Windows, I’ll preface all commands you need to enter with `>` , so with the command `> cd bitcoin` , just enter `cd bitcoin` and hit enter.

Open the Windows command prompt (Win+R, enter “cmd”, hit enter), navigate to the bitcoin directory (for me, it's on drive `D:`, look up your drive letter in Windows Explorer) and create the new directory `bitcoin_mainnet`. Then calculate the checksum.
```
> G:
> cd \bitcoin
> mkdir bitcoin_mainnet
> dir
> certutil -hashfile bitcoin-0.16.0-win64-setup.exe sha256
6d93ba3b9c3e34f74ccfaeacc79f968755ba0da1e2d75ce654cf276feb2aa16d
```
![Windows Command Prompt: verify checksum](https://raw.githubusercontent.com/Stadicus/guides/raspibolt_initial/raspibolt/images/0_blockchain_wincheck.png)

Compare this value with the [release signatures](https://bitcoin.org/bin/bitcoin-core-0.16.0/SHA256SUMS.asc). For the Windows 0.16.0 binaries, its
```
32 bit:  7558249b04527d7d0bf2663f9cfe76d6c5f83ae90e513241f94fda6151396a29
64 bit:  6d93ba3b9c3e34f74ccfaeacc79f968755ba0da1e2d75ce654cf276feb2aa16d
```
Usually, you would also need to check the signature of this file, but it's a pain on Windows, so we will do it on the Pi later on.

### Installing Bitcoin Core
Execute the Bitcoin Core installation file (you might need to right-click and choose "Run as administrator") and install it using the default settings. Start the program `bitcoin-qt.exe` in the directory "C:\Program Files\Bitcoin". Choose a custom data directory and set it to the new “bitcoin_mainnet” folder.

![Bitcoin Core directory selection](https://github.com/Stadicus/guides/raw/raspibolt_initial/raspibolt/images/0_bitcoinqt_directory.png)

Bitcoin Core opens and starts immediately syncing the blockchain. Unfortunately, we need to set one additional setting in the “bitcoin.conf” file, otherwise the whole blockchain will be useless. Using the menu, open “Settings” / “Options” and click the button “Open Configuration File”. Enter the following line:
```
txindex=1
```
Save and close the text file, quit Bitcoin Core using “File” / “Exit” and restart the program. The program will start syncing again.

### Performance considerations

The sync will take a quite time, possibly several days, depending on your hard disk. There are two main resources that can speed things up:

#### Memory for indexing
If your computer has a lot of memory, you can increase the database in-memory cache by adding the following line (with megabytes of memory to use, adjusted to your computer) into the “bitcoin.conf” file
```
dbcache=6000
```
#### Speed of your hard disk
Indexing creates heavy read/write traffic to your hard disk. If you have enough space on your internal hard disk, it might be quicker to use than an external hard disk. An external USB3 hard disk will be significantly faster than one with a USB2 connection.

Let the blockchain sync for now, we can already start working on the Pi.


## Setting up the Raspberry Pi
### Write down your passwords
You will need several passwords and I find it easiest to write them all down in the beginning, instead of bumping into them throughout the guide. They should be unique and very secure, at least 12 characters in length. Do not use uncommon special characters, blanks or quotes (‘ or “).
```
[ A ] Master user password
[ B ] Bitcoin RPC password
[ C ] LND wallet password
[ D ] LND seed password (optional)
```
![xkcd: Password Strength](https://github.com/Stadicus/guides/raw/raspibolt_initial/raspibolt/images/xkcd_password_strength.png)

If you need inspiration for creating your passwords: the [xkcd: Password Strength](https://xkcd.com/936/) comic is funny and contains a lot of truth. Store a copy of your passwords somewhere safe (preferably in a password manager like KeePass) and keep your original notes out of sight once your system is up and running.

### Installing the operating system
The node runs headless, that means without keyboard or display, so the operating system Raspbian Stretch Lite is used. 

1. Download the [Raspbian Stretch Lite](https://www.raspberrypi.org/downloads/raspbian/) disk image
2. Write the disk image to your SD card with [this guide](https://www.raspberrypi.org/documentation/installation/installing-images/README.md)

### Enable Secure Shell
Without keyboard or screen, no direct interaction with the Pi is possible during the initial setup. After writing the image to the Micro SD card, create an empty file called “ssh” (without extension) on the main directory of the card. This causes the Secure Shell (ssh) to be enabled from the start and we will be able to login remotely. 

### Prepare Wifi 
I would not recommend it, but you can run your RaspiBolt with a wireless network connection. To avoid using a network cable for the initial setup, you can pre-configure the wireless settings:

* Create a file `wpa_supplicant.conf` on the MicroSD card with the following content:
```
country=[COUNTRY_CODE]
ctrl_interface=/var/run/wpa_supplicant GROUP=netdev
update_config=1
network={
    ssid=[WIFI_SSID]
    psk=[WIFI_PASSWORD]
}
```
* Replace `[COUNTRY_CODE]` with the [ISO2 code](https://www.iso.org/obp/ui/#search) of your country (eg. `US`)
* Replace `[WIFI_SSID]` and `[WIFI_PASSWORD]` with the credentials for your own WiFi.


### Start your Pi
* Insert the MicroSD card into the Pi
* If you did not already setup Wifi: connect the Pi to your network with an ethernet cable
* Start the Pi by connecting it to the mobile phone charger using the Micro USB cable

## Connecting to the network
The node is starting and getting a new address from your home network. This address can change over time. To make the Pi reachable from the internet, we assign it a fixed address.

### Accessing your router
The fixed address is configured in your network router: this can be the cable modem or the Wifi access point. So we first need to access the router. To find out its address, 

* start the Command Prompt on a computer that is connected to your home network (in Windows, click on the Start Menu and type cmd directly or in the search box, and hit Enter)
* enter the command `ipconfig` (or `ifconfig` on Mac / Linux)
* look for “Default Gateway” and note the address (eg. “192.168.0.1")

:point_right: additional information: [accessing your router](http://www.noip.com/support/knowledgebase/finding-your-default-gateway/).

Now open your web browser and access your router by entering the address, like a regular web address. You need so sign in, and now you can look up all network clients in your home network. One of these should be listed as “raspberrypi”, together with its address (eg. “192.168.0.240”).

![Router client list](https://github.com/Stadicus/guides/raw/raspibolt_initial/raspibolt/images/net1_clientlist.png)

:point_right: don’t know your router password? Try [routerpasswords.com](http://www.routerpasswords.com/). 
:warning: If your router still uses the initial password: change it!

### Setting a fixed address

We now need to set the fixed (static) IP address for the Pi. Normally, you can find this setting under “DHCP server”. The manual address should be the same as the current address, just change the last part to a lower number (e.g. 192.168.0.240 → 192.168.0.20).

:point_right: need additional information? Google “[your router brand] configure static dhcp ip address”

### Port Forwarding
Next, “Port Forwarding” needs to be configured. Different applications use different network ports, and the router needs to know to which internal network device the traffic of a specific port has to be directed. The port forwarding needs to be set up as follows:

| Application name  | External port | Internal port | Internal IP address | Protocol (TCP or UDP) |
| ----------------- | ------------- | ------------- | ------------------- | --------------------- |
| bitcoin           |          8333 |          8333 |        192.168.0.20 | BOTH                  |
| bitcoin test      |         18333 |         18333 |        192.168.0.20 | BOTH                  |
| lightning         |          9735 |          9735 |        192.168.0.20 | BOTH                  |

:point_right: additional information: [setting up port forwarding](https://www.noip.com/support/knowledgebase/general-port-forwarding-guide/).

Save and apply these router settings, we will check them later. Disconnect the Pi from the power supply, wait a few seconds, and plug it in again. The node should now get the new fixed IP address.

![Fixed network address](https://github.com/Stadicus/guides/raw/raspibolt_initial/raspibolt/images/net2_fixedip.png)

## Working on the Raspberry Pi
### Introduction to the command line
We are going to work on the command line of the Pi, which may be new to you. Find some basic information below, it will help you navigate and interact with your Pi.

#### Entering commands
You enter commands and the Pi answers by printing the results below your command. To make it clear where a command begins, every command in this guide starts with the `$` sign. The system response is marked with the `>` character.

In the following example, just enter `ls -la` and press the enter/return key:
```
$ ls -la
> example system response
```
![command ls -la](https://github.com/Stadicus/guides/raw/raspibolt_initial/raspibolt/images/5_command_ls-la.png)

#### Auto-complete commands
When you enter commands, you can use the `Tab` key for auto-completion, eg. for commands, directories or filenames.

#### Use admin privileges
Our regular user has no admin privileges. If a command needs to edit the system configuration, we need to use the `sudo` ("superuser do") command as prefix. Instead of editing a system file with `nano /etc/fstab`, we use `sudo nano /etc/fstab`. 

For security reasons, the user "bitcoin" cannot use the `sudo` command.

#### Using the Nano text editor
We use the Nano editor to create new text files or edit existing ones. It's not complicated, but to save and exit is not intuitive. 
* Save: hit `Ctrl-O` (for Output), confirm the filename, and hit the `Enter` key
* Exit: hit `Ctrl-X`

#### Copy / Paste
If you are using Windows and the PuTTY SSH client, you can copy text from the shell by selecting it with your mouse (no need to click anything), and paste stuff at the cursor position with a right-click anywhere in the ssh window.

#### A (very) short list of common Linux commands

| command | description | example |
| -- | -- | -- |
| `cd` | change to directory | `cd /home/bitcoin` |
| `ls` | list directory content | `ls -la /mnt/hdd` |
| `cp` | copy | `cp file.txt newfile.txt` |
| `mv` | move | `mv file.txt moved_file.txt`
| `rm` | remove | `mv temporaryfile.txt`
| `mkdir` | make directory | `mkdir /home/bitcoin/newdirectory`
| [`ln`](http://man7.org/linux/man-pages/man1/ln.1.html) | make link | `ln -s /target_directory /link`
| `sudo` | run command as superuser | `sudo nano textfile.txt`
| `su` | switch to different user account | `sudo su bitcoin`
| `chown` | change file owner  | `chown bitcoin:bitcoin myfile.txt`
| `chmod` | change file permissions | `chmod +x executable.script`
| `nano` | text file editor | `nano textfile.txt`
| `tar` | archive tool | `tar -cvf archive.tar file1.txt file2.txt`
| `exit` | exit current user session | `exit`
| [`systemctl`](http://manpages.ubuntu.com/manpages/xenial/man1/systemctl.1.html) | control systemd service | `sudo systemctl start bitcoind`
| [`journalctl`](http://www.ict.griffith.edu.au/teaching/3420ICT/cgi-bin/man.cgi?journalctl) | query systemd journal | `sudo journalctl -u bitcoind`
| [`shutdown`](http://www.manpages.info/linux/shutdown.8.html) | shutdown or restart Pi | `sudo shutdown -r now`

### Connecting to the Pi
Now it’s time to connect to the Pi via SSH and get to work. For that, a Secure Shell (SSH) client is needed. Install, start and connect:

- Windows: PuTTY ([Website](https://www.putty.org))
- Mac OS: built-in SSH client (see [this article](http://osxdaily.com/2017/04/28/howto-ssh-client-mac/))
- Linux: just use the native command, eg. `ssh pi@192.168.0.20`

- Use the following SSH connection settings: 
  - host name: the static address you set in the router, eg. `192.168.0.20`
  - port: `22`
  - username: `pi` 
  - password:  `raspberry`.

![login](https://github.com/Stadicus/guides/raw/raspibolt_initial/raspibolt/images/5_login.png)

:point_right: additional information: [using SSH with Raspberry Pi](https://www.raspberrypi.org/documentation/remote-access/ssh/README.md)

### Raspi-Config
You are now on the command line of your own Bitcoin node. First we finish the Pi configuration. Enter the following command:
`$ sudo raspi-config`

![raspi-config](https://github.com/Stadicus/guides/raw/raspibolt_initial/raspibolt/images/5_raspi-config.png)

* First, on `1` change your password to your `password [A]`.
* Next, choose Update `8` to get the latest configuration tool
* Network Options `2`: you can give your node a cute name (like “RaspiBolt”) and configure your Wifi connection (Pi 3 only)
* Boot Options `3`: choose “Desktop / CLI” → “Console”
* Localisation `4`: set your timezone
* Advanced `7`: run “Expand Filesystem” and set “Memory Split” to 16
* Exit by selecting `<Finish>`, and `<No>` as no reboot is necessary

### Software update
It is important to keep the system up-to-date with security patches and application updates. The “Advanced Packaging Tool” (apt) makes this easy:  
`$ sudo apt-get update`  
`$ sudo apt-get upgrade`

:point_right: Do this regularly every few months to get security related updates.

### Disabling Swap File
The usage of a swap file can degrade your SD card very quickly. Therefore, we will disable it completely.  
`$ sudo swapoff --all`  
`$ sudo apt-get remove dphys-swapfile`

### Adding main user "admin"
This guide uses the main user "admin" instead of "pi" to make it more reusable with other platforms. 

* Create the new user and add it to the group "sudo"  
`$ sudo useradd -m admin`  
`$ sudo adduser admin sudo` 

* Set the password to your password [A] and set the standard shell (command line interface) to "bash"
`$ sudo passwd admin`
`$ sudo chsh admin -s /bin/bash`

* And while you’re at it, change the password of the “root” admin user to your password [A]. 
`$ sudo passwd root`

* Log out and log in with the new user "admin"
`$ exit`

### Adding the service user “bitcoin”
The bitcoin and lightning processes will run in the background (as daemon) and use the separate user “bitcoin” for security reasons. This user does not have admin rights and cannot change the system configuration.

* Enter the following command, set your `password [A]` and confirm all questions with the enter/return key. 
`$ sudo adduser bitcoin`

### Mounting external hard disk
The external hard disk is attached to the file system and can be accessed as a regular folder (this is called “mounting”). Plug your hard disk into the running Pi and power the drive up. You can either work proceed with a newly formatted hard disk (recommended) or an existing one that already contains data.

**Option 1 (recommended): Format hard disk with Ext4**
As a server installation, the Linux native file system Ext4 is the best choice for the external hard disk. 
:warning: All data on this hard disk will be erased with the following steps! 

* Get the NAME for main partition on the external hard disk
`$ lsblk -o UUID,NAME,FSTYPE,SIZE,LABEL,MODEL` 

* Format the external hard disk with Ext4 (use [NAME] from above, e.g `/dev/sda1`) and copy the UUID that is provided as a result of this process
`$ sudo mkfs.ext4 /dev/[NAME]`

* Edit the fstab file and the following as a new line (replace `UUID=123456`) at the end
`$ sudo nano /etc/fstab`
`UUID=123456 /mnt/hdd ext4 noexec,defaults 0 0` 

**Option 2: Use existing hard disk with NTFS**
If you want to use your existing hard disk that already contains the bitcoin mainnet blockchain, you can simply mount it as is:

* Identify the partition and note the UUID at the left (eg. “12345678”) and verify the FSTYPE (should be “ntfs”)
`$ sudo lsblk -o UUID,NAME,FSTYPE,SIZE,LABEL,MODEL `
`$ sudo apt-get install ntfs-3g`

* Open the file “/etc/fstab” in the Nano text editor and add the following line, but use the “UUID” noted above, save and exit
`$ sudo nano /etc/fstab`
```
UUID=12345678 /mnt/hdd ntfs defaults,auto,umask=002,gid=bitcoin,users,rw 0 0
``` 
Please note that we mounted using `umask=002,gid=bitcoin`, which gives only the user “bitcoin” write access. User “admin” can only read and must use `sudo` when writing to the disk.

**Continue for all options**
The following steps are valid regardless of the chosen option above.

* Create the directory to add the hard disk and set the correct owner 
`$ sudo mkdir /mnt/hdd`

* Mount all drives and check the file system. Is “/mnt/hdd” listed?
`$ sudo mount -a`
`$ df /mnt/hdd`
```
Filesystem     1K-blocks  Used Available Use% Mounted on
/dev/sda1      479667880 73756 455158568   1% /mnt/hdd
```
*  Set the owner 
`$ sudo chown bitcoin:bitcoin /mnt/hdd/`

* Switch to user "bitcoin", navigate to the hard disk and create the bitcoin directory. 
`$ sudo su bitcoin`
`$ cd /mnt/hdd`
`$ mkdir bitcoin`
`$ ls -lat`

* Create a testfile in the new directory and delete it.
`$ touch bitcoin/test.file`
`$ rm bitcoin/test.file`

If this command gives you an error, chances are that your external hard disk is mounted as “read only”. This must be fixed before proceeding.

👉 additional information: [external storage configuration](https://www.raspberrypi.org/documentation/configuration/external-storage.md)

## Hardening your Pi
The following steps need admin privileges and must be executed with the user "admin".

### Enabling the Uncomplicated Firewall
The Pi will be visible from the internet and therefore needs to be secured against attacks. A firewall controls what traffic is permitted and closes possible security holes.

The line `ufw allow from 192.168.0.0/24…` below assumes that the IP address of your Pi is something like `192.168.0.???`, the ??? being any number from 0 to 255. If your IP address is `12.34.56.78`, you must adapt this line to `ufw allow from 12.34.56.0/24…`.
```
$ sudo apt-get install ufw
$ sudo su
$ ufw default deny incoming
$ ufw default allow outgoing
$ ufw allow from 192.168.0.0/24 to any port 22 comment 'allow SSH from local LAN'
$ ufw allow 9735  comment 'allow Lightning'
$ ufw allow 8333  comment 'allow Bitcoin mainnet'
$ ufw allow 18333 comment 'allow Bitcoin testnet'
$ ufw enable
$ systemctl enable ufw
$ ufw status
$ exit
```
:point_right: additional information: [UFW Essentials](https://www.digitalocean.com/community/tutorials/ufw-essentials-common-firewall-rules-and-commands)

### fail2ban
The SSH login to the Pi must be especially protected. The firewall blocks all login attempts from outside your network, but additional steps should be taken to prevent an attacker - maybe from inside your network - to just try out all possible passwords.

The first measure is to install “fail2ban”, a service that cuts off any system with five failed login attempts for ten minutes. This makes a brute-force attack unfeasible, as it would simply take too long.

![fail2ban](https://github.com/Stadicus/guides/raw/raspibolt_initial/raspibolt/images/6_fail2ban.png)
*Me locking myself out by entering wrong passwords* :wink:

```
$ sudo apt-get install fail2ban
```
The initial configuration should be fine as it is enabled for SSH by default. If you want to dive deeper, you can 👉 [customize the configuration](https://linode.com/docs/security/using-fail2ban-for-security/).

### Login with SSH keys
One of the best options to secure the SSH login is to completely disable the password login and require a SSH key certificate. Only someone with physical possession of the private key can login. To create it for your “admin” user, please follow this great guide: 
[Configure “No Password SSH Keys Authentication” with PuTTY on Linux Servers](https://www.tecmint.com/ssh-passwordless-login-with-putty)

We will now disable the password login.

* Logout (`exit`) and make sure that you can log in as "admin" with your SSH key

* Edit ssh config file 
`$ sudo nano /etc/ssh/sshd_config`

* change settings "ChallengeResponseAuthentication" and "PasswordAuthentication" to "no" (uncomment the line by removing # if necessary)

* save config file and exit 

* copy the SSH public key for user "root", just in case
`$ sudo mkdir /root/.ssh`
`$ sudo cp /home/admin/.ssh/authorized_keys /root/.ssh/`
`$ sudo chown -R root:root /root/.ssh/`
`$ sudo chmod -R 700 /root/.ssh/`
`$ sudo systemctl restart sshd.service`

You can now only login with “admin” or “root” and your SSH key. 

:warning: **Backup your SSH key!** You will need to attach a screen and keyboard to your Pi if you lose it.

## Bitcoin Core
The base of the Lightning node is a fully trustless [Bitcoin Core](https://bitcoin.org/en/bitcoin-core/) node. It downloads all blocks since the Bitcoin Genesis block to rebuild the complete blockchain, validates all blocks and creates an index with all transactions that ever happened. By doing all this work ourselves, nobody else needs to be trusted.

### Installation
We will download the software manually from bitcoin.org and verify its signature to make sure that we use an official release.

* Create a download folder
`$ mkdir /home/admin/download`
`$ cd /home/admin/download`

We download the latest Bitcoin Core binaries (the application) and compare the file with the signed checksum. This is a precaution to make sure that this is an official release and not a malicious version trying to steal our money.

* Get the latest download links at bitcoin.org/en/download, they change with each update. Then run the following  commands (with adjusted filenames) and check the output where indicated:
`$ wget https://bitcoin.org/bin/bitcoin-core-0.16.0/bitcoin-0.16.0-arm-linux-gnueabihf.tar.gz`
`$ wget https://bitcoin.org/bin/bitcoin-core-0.16.0/SHA256SUMS.asc`
`$ wget https://bitcoin.org/laanwj-releases.asc`

* Check that the reference checksum matches the real checksum
`$ sha256sum --check SHA256SUMS.asc --ignore-missing`
`> bitcoin-0.16.0-arm-linux-gnueabihf.tar.gz: OK`

* Manually check the fingerprint of the public key:
`$ gpg ./laanwj-releases.asc`
`> 01EA5486DE18A882D4C2684590C8019E36C2E964`

* Import the public key of Wladimir van der Laan, verify the signed checksum file and check the fingerprint again in case of malicious keys
`$ gpg --import ./laanwj-releases.asc`
`$ gpg --verify SHA256SUMS.asc`
`> gpg: Good signature from Wladimir ...`
`> Primary key fingerprint: 01EA 5486 DE18 A882 D4C2  6845 90C8 019E 36C2 E964`

![commands to check bitcoind signature](https://github.com/Stadicus/guides/raw/raspibolt_initial/raspibolt/images/7_checksum.png)

* Now we know that the keys from bitcoin.org are valid, so we can also verify the Windows binary checksums. Compare the following output with the checksum of your Windows Bitcoin Core download.
`$ cat manifest-v0.4-beta.txt | grep windows` 
```
d039c371d01bf788d26cb2876ceafcb21f40f705c98bb0b0b9cf6558cac4ca23  lnd-windows-386-v0.4-beta.zip
1245abe9adeb2fab74fe57d62b6d8c09d30b9ada002cd95868a33406e5a14796  lnd-windows-amd64-v0.4-beta.zip
```
* Extract the Bitcoin Core binaries, install them and check the version.
`$ tar -xvf bitcoin-0.16.0-arm-linux-gnueabihf.tar.gz`
`$ sudo install -m 0755 -o root -g root -t /usr/local/bin bitcoin-0.16.0/bin/*`
`$ bitcoind --version`
`> Bitcoin Core Daemon version v0.16.0`

### Prepare Bitcoin Core directory
We use the Bitcoin daemon, called “bitcoind”, that runs in the background without user interface and stores all data in a hidden subdirectory of the user’s home directory: `/home/bitcoin/.bitcoin`

* Change to user “bitcoin” and enter the password.
`$ sudo su bitcoin`

* We add a symbolic link that points to the external hard disk. 
`$ ln -s /mnt/hdd/bitcoin /home/bitcoin/.bitcoin`

* Navigate to the home directory an d check the symbolic link (the target must not be red). The content of this directory will actually be on the external hard disk.
`$ cd `
`$ ls -la`

![verify .bitcoin symlink](https://github.com/Stadicus/guides/raw/raspibolt_initial/raspibolt/images/7_show_symlink.png)

### Copy the mainnet blockchain
The initial setup configures RaspiBolt for the Bitcoin testnet. As the data transfer of the whole Bitcoin blockchain takes about 6 hours, you can start it as soon as the verification on your Windows computer is finished. Check the verification progress directly in Bitcoin Core. You shouldn't be more than a few days behind (see status bar). 

* If ready, shut down Bitcoin Core on Windows and proceed with the data transfer.
* If not yet ready, you can proceed with the bitcoind **Configuration** below and come back to this section later (but before the switch to mainnet) to start the data transfer.

We are going to copy the whole bitcoin data directory using "Secure Copy" (SCP) from Windows over the network to the Pi. For this, please [download and install WinSCP](https://winscp.net), a free open-source program. 

* With WinSCP, you can now connect to your Pi with the user "bitcoin".
![WinSCP connection settings](https://github.com/Stadicus/guides/raw/raspibolt_initial/raspibolt/images/7_WinSCP_connection.png)

* Accept the server certificate and navigate to the local and remote bitcoin directories:
  * Local: `d:\bitcoin\bitcoin_mainnet\`
  * Remote: `\mnt\hdd\bitcoin\`   

* You can now copy the two subdirectories `blocks` and `chainstate` from Local to Remote. This will take a few hours. 

![WinSCP copy](https://github.com/Stadicus/guides/raw/raspibolt_initial/raspibolt/images/7_WinSCP_copy.png)

:warning: The transfer must not be interupted. Make sure your computer does not go to sleep. 

### Configuration
Now, the configuration file for bitcoind needs to be created. Open it with Nano and paste the configuration below. Save and exit. 
`$ nano /home/bitcoin/.bitcoin/bitcoin.conf`

```bash
# RaspiBolt LND Mainnet: bitcoind configuration
# /home/bitcoin/.bitcoin/bitcoin.conf

# remove the following line to enable Bitcoin mainnet
testnet=1

# Bitcoind options
server=1
daemon=1
txindex=1
disablewallet=1

# Connection settings
rpcuser=raspibolt
rpcpassword=PASSWORD_[B]
zmqpubrawblock=tcp://127.0.0.1:29000
zmqpubrawtx=tcp://127.0.0.1:29000

# Raspberry Pi optimizations
dbcache=100
maxorphantx=10
maxmempool=50
maxconnections=40
maxuploadtarget=5000
```
Link: [bitcoin.conf]

:warning: Change rpcpassword to your secure `password [B]`, otherwise your funds might get stolen.
:point_right: additional information: all arguments in Bitcoin Wiki

### Autostart bitcoind
The system needs to run the bitcoin daemon automatically in the background, even when nobody is logged in. We use “systemd“, a daemon that controls the startup process using configuration files.

* Exit the “bitcoin” user session back to user “admin” 
  `$ exit`

* Create the configuration file in the Nano text editor and copy the following paragraph. 
  `$ sudo nano /etc/systemd/system/bitcoind.service`

```bash
# RaspiBolt LND Mainnet: systemd unit for bitcoind
# /etc/systemd/system/bitcoind.service

[Unit]
Description=Bitcoin daemon
After=network.target

# for use with sendmail alert
#OnFailure=systemd-sendmail@%n

[Service]
User=bitcoin
Group=bitcoin
Type=forking
PIDFile=/home/bitcoin/.bitcoin/bitcoind.pid
ExecStart=/usr/local/bin/bitcoind -pid=/home/bitcoin/.bitcoin/bitcoind.pid
KillMode=process
Restart=always
TimeoutSec=120
RestartSec=30

[Install]
WantedBy=multi-user.target
```
* Save and exit

* Enable the configuration file 
`$ sudo systemctl enable bitcoind.service`

* Restart the Raspberry Pi 
`$ sudo shutdown -r now`

### Verification of bitcoind operations
After rebooting, the bitcoind should start and begin to sync and validate the Bitcoin blockchain.

* Wait a bit, reconnect via SSH and login with the user “admin”.

* Switch to the user "bitcoin"
`sudo su bitcoin`

* Check the status of the bitcoin daemon that was started by systemd (exit with Ctrl+C)
`$ systemctl status bitcoind.service`

![check status bitcoind]()

* See bitcoind in action by monitoring its log file (exit with `Ctrl-C`)
  * on testnet: `$ tail -f /home/bitcoin/.bitcoin/testnet3/debug.log`
  * on mainnet: `$ tail -f /home/bitcoin/.bitcoin/debug.log`

* Use the Bitcoin Core client “bitcoin-cli” to get information about the current blockchain. 
`$ bitcoin-cli getblockchaininfo`

* Only the user "bitcoin" can use "bitcoin-cli".
* When “bitcoind” is still starting, you may get an error message like “verifying blocks”. That’s normal, just give it a few minutes.
* Among other infos, the “verificationprogress” is shown. Once this value reaches almost 1 (0.999…), the blockchain is up-to-date and fully validated.

### Explore bitcoin-cli
If everything seems to run smoothly, and now you have some bitcoin to use, this is the perfect time to familiarize yourself with Bitcoin Core and play around with bitcoin-cli until the blockchain is up-to-date.

A great point to start is the book “Mastering Bitcoin” by Andreas Antonopoulos — which is open source — and in this regard especially chapter 3 (ignore the first part how to compile from source code).

[Mastering Bitcoin: Programming the Open Blockchain
by Andreas Antonopoulos](https://github.com/bitcoinbook/bitcoinbook/blob/second_edition_print2/ch03.asciidoc)

👉 additional information: [bitcoin-cli reference](https://en.bitcoin.it/wiki/Original_Bitcoin_client/API_calls_list)

Once the blockchain is synced on testnet, the Lightning node can be set up.

## Lightning Network
We will download and install the LND (Lightning Network Daemon) by [Lightning Labs](http://lightning.engineering/). Check out their [Github repository](https://github.com/lightningnetwork/lnd/blob/master/README.md) for a wealth of information about their open-source project and Lightning in general.

### Public IP script
To announce our public IP address to the Lightning network, we first need to get our address from a source outside our network. As user “admin”, create the following script that checks the IP every 10 minutes and stores it locally.

* Create the following script:
`$ sudo nano /usr/local/bin/getpublicip.sh`
```bash
#!/bin/bash
# RaspiBolt LND Mainnet: script to get public ip address
# /usr/local/bin/getpublicip.sh

echo 'getpublicip.sh started, writing public IP address every 10 minutes into /run/publicip'
while [ 0 ]; 
    do 
    printf "PUBLICIP=$(curl -vv ipinfo.io/ip 2> /run/publicip.log)\n" > /run/publicip;
    sleep 600
done;
```
* make it executable
`$ sudo chmod +x /usr/local/bin/getpublicip.sh`

* create corresponding systemd unit, save and exit
`$ sudo nano /etc/systemd/system/getpublicip.service`

```bash
# RaspiBolt LND Mainnet: systemd unit for getpublicip.sh script
# /etc/systemd/system/getpublicip.service

[Unit]
Description=getpublicip.sh: get public ip address from ipinfo.io
After=network.target

[Service]
User=root
Group=root
Type=simple
ExecStart=/usr/local/bin/getpublicip.sh
Restart=always

RestartSec=600
TimeoutSec=10

[Install]
WantedBy=multi-user.target
```
* enable systemd startup
`$ sudo systemctl enable getpublicip`
`$ sudo systemctl start getpublicip`
`$ sudo systemctl status getpublicip`

* check if data file has been created
`$ cat /run/publicip`
`PUBLICIP=91.190.22.151`

### Install LND

```
$ wget https://github.com/lightningnetwork/lnd/releases/download/v0.4-beta/lnd-linux-arm-v0.4-beta.tar.gz
$ wget https://github.com/lightningnetwork/lnd/releases/download/v0.4-beta/manifest-v0.4-beta.txt
$ wget https://github.com/lightningnetwork/lnd/releases/download/v0.4-beta/manifest-v0.4-beta.txt.sig
$ wget https://keybase.io/roasbeef/pgp_keys.asc

$ sha256sum --check manifest-v0.4-beta.txt --ignore-missing
> lnd-linux-arm-v0.4-beta.tar.gz: OK

$ gpg ./pgp_keys.asc
> 65317176B6857F98834EDBE8964EA263DD637C21

$ gpg --import ./pgp_keys.asc
$ gpg --verify manifest-v0.4-beta.txt.sig
> gpg: Good signature from "Olaoluwa Osuntokun <laolu32@gmail.com>" [unknown]
> Primary key fingerprint: 6531 7176 B685 7F98 834E  DBE8 964E A263 DD63 7C21

$ tar -xzf lnd-linux-arm-v0.4-beta.tar.gz
$ ls -la
$ sudo install -m 0755 -o root -g root -t /usr/local/bin lnd-linux-arm-v0.4-beta/*
cd$ lnd --version
> lnd version 0.4.0-alpha

```
### LND configuration
Now that lnd is installed, we need to configure to work together with Bitcoin Core and run automatically on startup.

* Open a "bitcoin" user session 
`$ sudo su bitcoin` 

* Create the LND working directory and the corresponding symbolic link
`$ mkdir /mnt/hdd/lnd`
`$ ln -s /mnt/hdd/lnd /home/bitcoin/.lnd`

* Create LND configuration file and paste the following content (change the alias to your node alias)
`$ nano /home/bitcoin/.lnd/lnd.conf`

```bash
# RaspiBolt LND Mainnet: lnd configuration
# /home/bitcoin/.lnd/lnd.conf

[Application Options]
debuglevel=debug
debughtlc=true
maxpendingchannels=5
alias=YOUR_NAME [LND]
color=#68F442

[Bitcoin]
bitcoin.active=1

# enable either testnet or mainnet
bitcoin.testnet=1
#bitcoin.mainnet=1

bitcoin.node=bitcoind

[autopilot]
autopilot.active=1
autopilot.maxchannels=5
autopilot.allocation=0.6
```

* exit the "bitcoin" user session back to "admin"
`$ exit`

* create LND systemd unit and with the following content
`$ sudo nano /etc/systemd/system/lnd.service` 

```bash
# RaspiBolt LND Mainnet: systemd unit for lnd
# /etc/systemd/system/lnd.service

[Unit]
Description=LND Lightning Daemon
Requires=bitcoind.service
After=getpublicip.service
After=bitcoind.service

# for use with sendmail alert
#OnFailure=systemd-sendmail@%n

[Service]
# get var PUBIP from file
EnvironmentFile=/run/publicip

ExecStart=/usr/local/bin/lnd --externalip=${PUBLICIP}
PIDFile=/home/bitcoin/.lnd/lnd.pid
User=bitcoin
Group=bitcoin
Type=simple
KillMode=process
TimeoutSec=180
Restart=always
RestartSec=60

[Install]
WantedBy=multi-user.target
```
* enable and start LND
`$ sudo systemctl daemon-reload`
`$ sudo systemctl enable lnd`
`$ sudo systemctl start lnd`
`$ systemctl status lnd`

![Output systemctl status lnd]()ln

* monitor the LND logfile in realtime (exit with `Ctrl-C`)
`$ sudo journalctl -f -u lnd`

### LND wallet setup
Once LND is started, the process waits for us to create the integrated Bitcoin wallet (it does not use the bitcoind wallet). 
* start a "bitcoin" user session
`$ sudo su bitcoin` 

* Create the LND wallet. 
`$ lncli create` 

* If you want to create a new wallet, enter your `password [C]` as wallet password, select `n` regarding an existing seed and enter the optional `password [D]` as seed passphrase. A new cipher seed consisting of 24 words is created.

![LND new cipher seed]()

These 24 words, combined with your passphrase (optional `password [D]`)  is all that you need to restore your Bitcoin wallet and all Lighting channels. The current state of your channels, however, cannot be recreated from this seed, this requires a continuous backup and is still under development for LND.

:warning: This information must be kept secret at all cost. **Write these 24 words down manually on a piece of paper and store it in a safe place.** This piece of paper is all an attacker needs to completely empty your wallet! Do not store it on a computer. Do not take a picture with your mobile phone. **This information should never be stored anywhere in digital form.**


-----

### Fund LND with real bitcoin
This is the point of no return. Up until now, you can just start over. Once you send real bitcoin to your RaspiBolt, you have "skin in the game". Is your Pi working as expected? 

* Get a little practice with `bitcoin-cli` and its options (see [Bitcoin Core RPC documentation](https://bitcoin-rpc.github.io/))
* Do a dry run with `lncli` and its many options (see [Lightning API reference](http://api.lightning.community/))
* Try a few restarts (`sudo shutdown -r now`), is everything starting fine?


## Prettify your RaspiBolt
The following is not exactly necessary, but I think still worth the effort. 🖖

### Bash completion
As user "admin”, install bash completion scripts for Bitcoin Core and LND. You then can complete commands by pressing the `[Tab]` key:

`bitcoin-cli getblockch` `[Tab]` → `bitcoin-cli getblockchaininfo`

```
$ cd /home/admin/download
$ wget https://raw.githubusercontent.com/bitcoin/bitcoin/master/contrib/bitcoin-cli.bash-completion 
$ wget https://raw.githubusercontent.com/lightningnetwork/lnd/master/contrib/lncli.bash-completion
$ sudo cp *.bash-completion /etc/bash_completion.d/
```
### Pimp the command line prompt
coming soon...

### System status on login
coming soon...


## Further reading
If you want to learn more about Bitcoin and are curious about the inner workings of the Lightning Network, the following articles in Bitcoin Magazine offer a very good introduction:

* [What is Bitcoin?](https://bitcoinmagazine.com/guides/what-bitcoin)
* [Understanding the Lightning Network](https://bitcoinmagazine.com/articles/understanding-the-lightning-network-part-building-a-bidirectional-payment-channel-1464710791/)


<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE5NzkxOTU0MTBdfQ==
-->