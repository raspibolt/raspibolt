[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [Bonus](raspibolt_60_bonus.md) ] -- [ [FAQ](raspibolt_faq.md) ] -- [ **Updates** ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

# Updates

I try to keep track of my changes to the guide here, so you can see what parts I updated later on.

### 2018-04-04

* **Raspberry Pi**: added section for usage of existing MacOS HFS+ hard disk. Thanks, **masonicboom**!
* **Lightning**: Update `lnd` installation to version 0.4.1-beta (solving the "huge log file" issue)
* **Bonus**: extended "System overview" script with lnd public ip and included `jq` installation.   
  Thanks, **robclark56** and **zavan**!

### 2018-03-30: Electrum Personal Server

* **Raspberry Pi**: added UFW rule for Electrum Personal Server (EPS) and configure `sudo` to work without password entry
* **Bitcoin**: enabled wallet for EPS
* **Bonus**: add section how to set up EPS

### 2018-03-28

* **Raspberry Pi**: increase system file descriptors limit 
* **Lightning**: add `LimitNOFILE=128000` to increase number of file descriptors
* **Mainnet**: new section "Known Issues" with first entry "Big log files"
* **Bonus**: added to site navigation, fixed minor issue in raspibolt-welcome script

### 2018-03-25

* **Raspberry Pi**: additionally set `Wait for network at boot` in `raspi-config`
* **Lightning**: changed `getpublicip.service` to further improve the port binding issue.

### 2018-03-23

* **Raspberry Pi**: Instead of disabling swap file, move it to the external hdd. If already removed, re-install swap utility with `sudo apt-get install dphys-swapfile` first.
* **Bitcoin** and **Lightning**: adjusted systemd unit files `bitcoind.service` , `getpublicip.service` and `lnd.service` to account for a problem with binding of bitcoind to port 18333 (see [discussion](https://bitcointalk.org/index.php?topic=3179045.msg32917243#msg32917243) on bitcointalk.org). Thanks, **@whywefightnet**! 
* **Bitcoin**: added PDF version of "Mastering Bitcoin" and "Learning Bitcoin from the Command Line"
* **Lightning**: in "lnd.conf" set "debuglevel" to `info` to avoid huge log files
* **Bonus**: added new [bonus section](raspibolt_60_bonus.md) (not yet in site navigation)

### 2018-03-22

* **Mainnet**: more stable switch to mainnet, more conservative wallet creation
* **Mainnet**: useful examples for `lncli`. Thanks **@raindogdance**!
* **Mainnet**: copy updated `bitcoin.conf` to user "admin" for credentials

### 2018-03-20

* **Lighting**: Add reference to LND issue 890 when macaroons are not created. 
* **Bitcoin** and **Lightning**: Copy credentials for `bitcoind` and `lnd` to user "admin" home directory. As this is a superuser anyway there's no sense in always switching to the user "bitcoin" session.
