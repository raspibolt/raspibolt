---
layout: default
title: Troubleshooting
nav_order: 210
---
# Troubleshooting
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

The aim of this additional troubleshooting guide is to help you debug your system, verify all important configurations and find the frikkin' little problem that keeps you from running the perfect Lightning node.

Where possible, I'll link to the relevant part of the guide. If you see any discrepancies from the expected output, double check how you set up your node in that specific area.

---

## [General FAQ](raspibolt_faq.md)

I collected frequent questions not directly related with issues in a separate [General FAQ](raspibolt_faq.md) section:

* Can I get rich by routing Lightning payments?
* Can I attach the Ext4 formatted hard disk to my Windows computer?
* What do all the Linux commands do?
* Where can I get more information?
* How to upgrade Bitcoin Core or LND?
* Why do I need the 32 bit version of Bitcoin when I have a Raspberry Pi 4 with a 64 bit processor?

---

## Issues / Knowledge Base on Github

When running into problems, you (and many before you) can open an issue on GitHub.
https://github.com/raspibolt/raspibolt/issues

1. Please check this Troubleshooting Guide first.
2. Check the GitHub Issues if it is a known problem. Maybe somebody already solved it?
3. Open a new Issue and provide as much information to reproduce the problem as possible.

---

## Hardware & operating system

### Can you login without using SSH?

If you somehow locked yourself out of your Pi, you can connect it to a display and keyboard to log in directly without any certificate.

---

### Fix bad USB3 performance

If the speed of your USB3 drive tested with `hdparm` in the [System configuration](system-configuration.md) section is not acceptable, we need to configure the USB driver to ignore the UAS interface.

* Get the Vendor and Product ID for your USB3 drive.
  Run the following command and look for the name of your drive or adapter.
  The relevant data is printed as `idVendor:idProduct` (`0bda:9210` in this example).
  Make a note of these values.

  ```sh
  $ lsusb
  > Bus 002 Device 002: ID 0bda:9210 Realtek Semiconductor Corp. RTL9210 M.2 NVME Adapter
  > ...
  ```

The additional configuration parameters (called "quirks") for the USB driver must be passed to the Linux kernel during the boot process.

* Open the bootloader configuration file

  ```sh
  $ sudo nano /boot/cmdline.txt
  ```

* At the start of the line of parameters, add the text `usb-storage.quirks=aaaa:bbbb:u` where `aaaa:bbbb` are the values you noted down from the `lsusb` command above.
  Make sure that there is a single space character (` `) between our addition and the next parameter.
  Save and exit.

  ```sh
  usb-storage.quirks=0bda:9210:u ..............
  ```

  ℹ️ *Note:* if you have multiple drives that need these "quirks", add them all to the single directive, separated by commas

  ```sh
  usb-storage.quirks=0bda:9210:u,152d:0578:u ..............
  ```

* Reboot your node

  ```sh
  $ sudo reboot
  ```

* Log in again as "admin" and test the USB3 drive performance again

  ```sh
  $ sudo hdparm -t --direct /dev/sda2
  ```

You should see a significant increase in performance.
If the test still shows a very slow read speed, your drive or USB3 adapter might not be compatible with the Raspberry Pi.
In that case we recommend visiting the [Raspberry Pi Troubleshooting forum](https://forums.raspberrypi.com/viewforum.php?f=28) or simply trying out hardware alternatives.

🔍 *more: [Raspberry Pi forum: bad performance with USB3 SSDs](https://forums.raspberrypi.com/viewtopic.php?f=28&t=245931)*

---

### Are ip ports accessible through the firewall?

The most important ports are 22, 8333, 9735 and 1900/udp. Others can be necessary for bonus guides, and there may be additional ports open on your Pi (eg. the `(v6)` variants).

It is essential to have the right subnet mask, like `192.168.0.0/24`  (see [guide](raspibolt_20_pi.md#enabling-the-uncomplicated-firewall)).

```
$ sudo ufw status
Status: active

To                         Action      From
--                         ------      ----
22                         ALLOW       192.168.0.0/24             # allow SSH from local LAN
50002                      ALLOW       192.168.0.0/24             # allow Electrum from local LAN
9735                       ALLOW       Anywhere                   # allow Lightning
8333                       ALLOW       Anywhere                   # allow Bitcoin mainnet
18333                      ALLOW       Anywhere                   # allow Bitcoin testnet
Anywhere                   ALLOW       192.168.0.0/24 1900/udp    # allow local LAN SSDP for UPnP discovery
10009                      ALLOW       192.168.0.0/24             # allow LND grpc from local LAN
```

---

## Users & directories

### Have all users and home directories been created?

```
$ cat /etc/passwd
.
.
admin:x:1001:1001:,,,:/home/admin:/bin/bash
bitcoin:x:1002:1002:,,,:/home/bitcoin:/bin/bash
```

---

### Are the application directories created and linked correctly?

It's important that the following symbolic links are in the "bitcoin" users' home directory. The should be shown light & dark blue, and must not be red (symbolizing a broken link).

User "bitcoin" must have write access (depicted in the 3rd character "w" in "lr**w**xrwxrwx" below). Check with `touch`.

```
$ sudo su - bitcoin
$ touch /home/bitcoin/test
$ ls -la /home/bitcoin/
.
lrwxrwxrwx 1 bitcoin bitcoin   16 Nov 13 21:47 .bitcoin -> /data/bitcoin
lrwxrwxrwx 1 bitcoin bitcoin   12 Nov 13 22:28 .lnd -> /data/lnd
-rw-r--r-- 1 bitcoin bitcoin    0 Nov 27 18:36 test
.
```

Not all bitcoin files must be present, but bitcoin must have write access of the current directory (check with `touch`).

```
$ touch /home/bitcoin/.bitcoin/test
$ ls -la /home/bitcoin/.bitcoin/
total 7232
drwxr-xr-x 6 bitcoin bitcoin    4096 Nov 27 16:11 .
drwxr-xr-x 5 bitcoin bitcoin    4096 Nov 13 22:28 ..
-rw------- 1 bitcoin bitcoin     145 Nov 27 15:56 banlist.dat
-rw-r--r-- 1 bitcoin bitcoin     467 Nov 25 09:07 bitcoin.conf
-rw------- 1 bitcoin bitcoin       5 Nov 25 09:18 bitcoind.pid
drwxr-xr-x 3 bitcoin bitcoin   73728 Nov 27 10:58 blocks
drwxr-xr-x 2 bitcoin bitcoin   69632 Nov 27 16:12 chainstate
drwx------ 2 bitcoin bitcoin    4096 Nov 25 09:22 database
-rw------- 1 bitcoin bitcoin       0 Nov 14 18:50 db.log
-rw------- 1 bitcoin bitcoin 1038648 Nov 27 16:16 debug.log
-rw------- 1 bitcoin bitcoin  247985 Nov 25 09:18 fee_estimates.dat
-rw------- 1 bitcoin bitcoin       0 Nov 14 18:50 .lock
-rw------- 1 bitcoin bitcoin  353600 Nov 25 09:18 mempool.dat
-rw------- 1 bitcoin bitcoin 4170378 Nov 27 16:11 peers.dat
-rw-r--r-- 1 bitcoin bitcoin       0 Nov 27 18:24 test
drwxr-xr-x 5 bitcoin bitcoin    4096 Nov 25 05:31 testnet3
-rw------- 1 bitcoin bitcoin 1409024 Nov 27 09:19 wallet.dat
-rw------- 1 bitcoin bitcoin       0 Nov 14 18:50 .walletlock
```

If LND has been started at least once, the following files and directories should be present.

```
$ touch /home/bitcoin/.lnd/test
$ ls -la /home/bitcoin/.lnd/
total 28
drwxr-xr-x 4 bitcoin bitcoin 4096 Nov 16 16:28 .
drwxr-xr-x 5 bitcoin bitcoin 4096 Nov 13 22:28 ..
drwx------ 4 bitcoin bitcoin 4096 Nov 13 22:37 data
-rw-r--r-- 1 bitcoin bitcoin  425 Nov 16 16:28 lnd.conf
drwx------ 3 bitcoin bitcoin 4096 Nov 13 22:30 logs
-rw-r--r-- 1 bitcoin bitcoin    0 Nov 27 18:37 test
-rw-r--r-- 1 bitcoin bitcoin  733 Nov 13 22:30 tls.cert
-rw------- 1 bitcoin bitcoin  227 Nov 13 22:30 tls.key
```

Don't forget to exit the "bitcoin" user session:

```
$ exit
```

---

## Bitcoin Core

First, let's disable the systemd autostart and reboot the Pi to run everything manually.

```
$ sudo systemctl disable bitcoind
$ sudo systemctl disable lnd
$ sudo shutdown -r now
```

If the base setup seems fine, lets open a "bitcoin" user session, check the Bitcoin Core configuration, start the program and check the output.

```
$ sudo su - bitcoin

$ cat /home/bitcoin/.bitcoin/bitcoin.conf
# RaspiBolt LND Mainnet: bitcoind configuration
# /home/bitcoin/.bitcoin/bitcoin.conf

# remove the following line to enable Bitcoin mainnet
testnet=1

# Bitcoind options
server=1
daemon=1

# Connection settings
rpcuser=raspibolt
rpcpassword=PASSWORD_B

onlynet=ipv4
zmqpubrawblock=tcp://127.0.0.1:28332
zmqpubrawtx=tcp://127.0.0.1:28333

# Raspberry Pi optimizations
dbcache=100
maxorphantx=10
maxmempool=50
maxconnections=40
maxuploadtarget=5000

$  bitcoind --version
Bitcoin Core Daemon version v0.17.0.1

$ bitcoind
Bitcoin server starting

$ tail -f /home/bitcoin/.bitcoin/debug.log
2018-11-25T19:31:57Z Bitcoin Core version v0.18.0.1 (release build)
2018-11-25T19:31:57Z InitParameterInteraction: parameter interaction: -whitelistforcerelay=1 -> setting -whitelistrelay=1
2018-11-25T19:31:57Z Assuming ancestors of block 0000000000000000002e63058c023a9a1de233554f28c7b21380b6c9003f36a8 have valid signatures.
2018-11-25T19:31:57Z Setting nMinimumChainWork=0000000000000000000000000000000000000000028822fef1c230963535a90d
2018-11-25T19:31:57Z Using the 'standard' SHA256 implementation
2018-11-25T19:31:57Z Default data directory /home/bitcoin/.bitcoin
2018-11-25T19:31:57Z Using data directory /home/bitcoin/.bitcoin
2018-11-25T19:31:57Z Using config file /home/bitcoin/.bitcoin/bitcoin.conf
2018-11-25T19:31:57Z Using at most 40 automatic connections (128000 file descriptors available)
2018-11-25T19:31:57Z Using 16 MiB out of 32/2 requested for signature cache, able to store 524288 elements
2018-11-25T19:31:57Z Using 16 MiB out of 32/2 requested for script execution cache, able to store 524288 elements
2018-11-25T19:31:57Z Using 4 threads for script verification
2018-11-25T19:31:57Z scheduler thread start
2018-11-25T19:31:57Z HTTP: creating work queue of depth 16
2018-11-25T19:31:57Z Config options rpcuser and rpcpassword will soon be deprecated. Locally-run instances may remove rpcuser to use cookie-based auth, or may be replaced with rpcauth. Please see share/rpcauth for rpcauth auth generation.
2018-11-25T19:31:57Z HTTP: starting 4 worker threads
2018-11-25T19:31:57Z Using wallet directory /home/bitcoin/.bitcoin
2018-11-25T19:31:57Z init message: Verifying wallet(s)...
2018-11-25T19:31:57Z Using BerkeleyDB version Berkeley DB 4.8.30: (April  9, 2010)
2018-11-25T19:31:57Z Using wallet wallet.dat
2018-11-25T19:31:57Z BerkeleyEnvironment::Open: LogDir=/home/bitcoin/.bitcoin/database ErrorFile=/home/bitcoin/.bitcoin/db.log
2018-11-25T19:31:57Z Cache configuration:
2018-11-25T19:31:57Z * Using 2.0MiB for block index database
2018-11-25T19:31:57Z * Using 8.0MiB for chain state database
2018-11-25T19:31:57Z * Using 90.0MiB for in-memory UTXO set (plus up to 47.7MiB of unused mempool space)
2018-11-25T19:31:57Z init message: Loading block index...
2018-11-25T19:31:57Z Opening LevelDB in /home/bitcoin/.bitcoin/blocks/index
2018-11-25T19:31:58Z Opened LevelDB successfully
2018-11-25T19:31:58Z Using obfuscation key for /home/bitcoin/.bitcoin/blocks/index: 0000000000000000
2018-11-25T19:32:21Z LoadBlockIndexDB: last block file = 1445
2018-11-25T19:32:21Z LoadBlockIndexDB: last block file info: CBlockFileInfo(blocks=34, size=38568339, heights=551687...551720, time=2018-11-25...2018-11-25)
2018-11-25T19:32:21Z Checking all blk files are present...
2018-11-25T19:32:22Z Opening LevelDB in /home/bitcoin/.bitcoin/chainstate
2018-11-25T19:32:26Z Opened LevelDB successfully
2018-11-25T19:32:26Z Using obfuscation key for /home/bitcoin/.bitcoin/chainstate: 379f438868caeb46
2018-11-25T19:32:27Z Loaded best chain: hashBestChain=00000000000000000019f4d6b0a3ac29f65789035e88ca279d2820a33405e056 height=551720 date=2018-11-25T19:22:18Z progress=0.999996
2018-11-25T19:32:27Z init message: Rewinding blocks...
2018-11-25T19:32:34Z init message: Verifying blocks...
2018-11-25T19:32:34Z Verifying last 6 blocks at level 3
2018-11-25T19:32:34Z [0%]...[16%]...[33%]...[50%]...[66%]...[83%]...[99%]...[DONE].
2018-11-25T19:32:57Z No coin database inconsistencies in last 6 blocks (10080 transactions)
2018-11-25T19:32:57Z  block index           60089ms
2018-11-25T19:32:57Z init message: Loading wallet...
2018-11-25T19:32:58Z [default wallet] nFileVersion = 170001
2018-11-25T19:32:58Z [default wallet] Keys: 2001 plaintext, 0 encrypted, 2001 w/ metadata, 2001 total. Unknown wallet records: 1
2018-11-25T19:32:58Z [default wallet] Wallet completed loading in             432ms
2018-11-25T19:32:58Z [default wallet] setKeyPool.size() = 2000
2018-11-25T19:32:58Z [default wallet] mapWallet.size() = 0
2018-11-25T19:32:58Z [default wallet] mapAddressBook.size() = 0
2018-11-25T19:32:58Z mapBlockIndex.size() = 551721
2018-11-25T19:32:58Z nBestHeight = 551720
2018-11-25T19:32:58Z Bound to [::]:8333
2018-11-25T19:32:58Z Bound to 0.0.0.0:8333
2018-11-25T19:32:58Z init message: Loading P2P addresses...
2018-11-25T19:32:58Z torcontrol thread start
2018-11-25T19:32:58Z Leaving InitialBlockDownload (latching to false)
2018-11-25T19:33:00Z Loaded 63097 addresses from peers.dat  1856ms
2018-11-25T19:33:00Z init message: Loading banlist...
2018-11-25T19:33:00Z init message: Starting network threads...
2018-11-25T19:33:00Z net thread start
2018-11-25T19:33:00Z addcon thread start
2018-11-25T19:33:00Z init message: Done loading
2018-11-25T19:33:00Z msghand thread start
2018-11-25T19:33:00Z dnsseed thread start
2018-11-25T19:33:00Z opencon thread start
2018-11-25T19:33:02Z New outbound peer connected: version: 70015, blocks=551720, peer=1
2018-11-25T19:33:04Z socket recv error Connection reset by peer (104)
2018-11-25T19:33:11Z Loading addresses from DNS seeds (could take a while)
2018-11-25T19:33:14Z New outbound peer connected: version: 70015, blocks=551720, peer=7
2018-11-25T19:33:14Z New outbound peer connected: version: 70015, blocks=551720, peer=9
2018-11-25T19:33:15Z New outbound peer connected: version: 70015, blocks=551720, peer=10
2018-11-25T19:33:26Z 255 addresses found from DNS seeds
2018-11-25T19:33:26Z dnsseed thread exit
2018-11-25T19:33:28Z New outbound peer connected: version: 70015, blocks=551720, peer=14
2018-11-25T19:33:29Z New outbound peer connected: version: 70015, blocks=551720, peer=15
...
...

$ bitcoin-cli getblockchaininfo
$ bitcoin-cli stop
$ exit
```

Back to normal operations: enable & start the services again.

```
$ sudo systemctl enable bitcoind
$ sudo systemctl start bitcoind
$ sudo systemctl enable lnd
$ sudo systemctl start lnd
```

---

## LND

Let's check the configuration and operations of LND.

```
$ sudo systemctl stop lnd
$ sudo su - bitcoin

$ cat /home/bitcoin/.lnd/lnd.conf
# RaspiBolt: lnd configuration
# /home/bitcoin/.lnd/lnd.conf

[Application Options]
debuglevel=info
maxpendingchannels=5
alias=YOUR_NAME [LND]
color=#68F442
nat=true

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

$ lnd
Attempting automatic RPC configuration to bitcoind
Automatically obtained bitcoind's RPC credentials
2018-11-25 19:40:03.072 [INF] LTND: Version 0.5.0-beta commit=3b2c807288b1b7f40d609533c1e96a510ac5fa6d
2018-11-25 19:40:03.072 [INF] LTND: Active chain: Bitcoin (network=mainnet)
2018-11-25 19:40:03.073 [INF] CHDB: Checking for schema update: latest_version=6, db_version=6
2018-11-25 19:40:03.107 [INF] RPCS: password RPC server listening on 127.0.0.1:10009
2018-11-25 19:40:03.107 [INF] RPCS: password gRPC proxy started at 127.0.0.1:8080
2018-11-25 19:40:03.107 [INF] LTND: Waiting for wallet encryption password. Use `lncli create` to create a wallet, `lncli unlock` to unlock an existing wallet, or `lncli changepassword` to change the password of an existing wallet and unlock it.
```

As this "bitcoin" user session is now occupied by LND, open a second SSH session (shown here with prefix `$2`) with your node and unlock your wallet.

```
$2 sudo su - bitcoin
$2 lncli unlock
```

Back in your first SSH session, the wallet is shown as unlocked and LND starts connecting to the network (see example output below). Any potential errors will be shown here.

```sh
2018-11-25 19:42:57.143 [INF] LNWL: Opened wallet
2018-11-25 19:42:57.689 [INF] LTND: Primary chain is set to: bitcoin
2018-11-25 19:42:57.785 [INF] LNWL: Started listening for bitcoind block notifications via ZMQ on tcp://127.0.0.1:28332
2018-11-25 19:42:57.785 [INF] LTND: Initializing bitcoind backed fee estimator
2018-11-25 19:42:57.785 [INF] LNWL: Started listening for bitcoind transaction notifications via ZMQ on tcp://127.0.0.1:28333
2018-11-25 19:43:04.128 [INF] LNWL: The wallet has been unlocked without a time limit
2018-11-25 19:43:04.129 [INF] LTND: LightningWallet opened
2018-11-25 19:43:04.178 [INF] LNWL: Started rescan from block 0000000000000000001166353e32a530830aba5ab1bb1201330ad61d6019be93 (height 551831) for 0 addresses
2018-11-25 19:43:04.178 [INF] LNWL: Starting rescan from block 0000000000000000001166353e32a530830aba5ab1bb1201330ad61d6019be93
2018-11-25 19:43:04.646 [INF] HSWC: Restoring in-memory circuit state from disk
2018-11-25 19:43:04.701 [INF] HSWC: Payment circuits loaded: num_pending=0, num_open=0
2018-11-25 19:43:04.746 [INF] SRVR: Scanning local network for a UPnP enabled device
2018-11-25 19:43:05.775 [INF] LNWL: Rescan finished at 551831 (0000000000000000001166353e32a530830aba5ab1bb1201330ad61d6019be93)
2018-11-25 19:43:05.864 [INF] LNWL: Catching up block hashes to height 551831, this might take a while
2018-11-25 19:43:05.898 [INF] LNWL: Done catching up block hashes
2018-11-25 19:43:05.898 [INF] LNWL: Finished rescan for 0 addresses (synced to block 0000000000000000001166353e32a530830aba5ab1bb1201330ad61d6019be93, height 551831)
2018-11-25 19:43:09.030 [INF] SRVR: Automatically set up port forwarding using UPnP to advertise external IP
2018-11-25 19:43:09.456 [INF] RPCS: RPC server listening on 127.0.0.1:10009
2018-11-25 19:43:09.456 [INF] RPCS: gRPC proxy started at 127.0.0.1:8080
2018-11-25 19:43:09.463 [INF] LTND: Waiting for chain backend to finish sync, start_height=551832
2018-11-25 19:43:09.481 [INF] LTND: Chain backend is fully synced (end_height=551832)!
2018-11-25 19:43:09.528 [INF] NTFN: New block epoch subscription
2018-11-25 19:43:09.528 [INF] HSWC: Starting HTLC Switch
2018-11-25 19:43:09.528 [INF] NTFN: New block epoch subscription
2018-11-25 19:43:09.529 [INF] NTFN: New block epoch subscription
2018-11-25 19:43:09.542 [INF] UTXN: Processing outputs from missed blocks. Starting with blockHeight=551831, to current blockHeight=551832
2018-11-25 19:43:09.542 [INF] UTXN: Attempting to graduate height=551832: num_kids=0, num_babies=0
2018-11-25 19:43:09.650 [INF] UTXN: UTXO Nursery is now fully synced
2018-11-25 19:43:09.650 [INF] DISC: Authenticated Gossiper is starting
2018-11-25 19:43:09.651 [INF] BRAR: Starting contract observer, watching for breaches.
2018-11-25 19:43:09.651 [INF] NTFN: New block epoch subscription
2018-11-25 19:43:09.655 [INF] CRTR: FilteredChainView starting
2018-11-25 19:43:15.542 [INF] CRTR: Filtering chain using 12730 channels active
2018-11-25 19:43:15.554 [INF] CRTR: Prune tip for Channel Graph: height=551831, hash=0000000000000000001166353e32a530830aba5ab1bb1201330ad61d6019be93
2018-11-25 19:43:15.559 [INF] CRTR: Syncing channel graph from height=551831 (hash=0000000000000000001166353e32a530830aba5ab1bb1201330ad61d6019be93) to height=551832 (hash=0000000000000000001ab31e179a5e77b16ee0ddb1c8b07ae2b2dc11d06d68fa)
2018-11-25 19:43:16.452 [INF] CRTR: Block 0000000000000000001ab31e179a5e77b16ee0ddb1c8b07ae2b2dc11d06d68fa (height=551832) closed 0 channels
2018-11-25 19:43:16.452 [INF] CRTR: Graph pruning complete: 0 channels were closed since height 551831
2018-11-25 19:43:16.563 [INF] CMGR: Server listening on [::]:9735
2018-11-25 19:43:16.607 [INF] SRVR: Initializing peer network bootstrappers!
2018-11-25 19:43:16.607 [INF] SRVR: Creating DNS peer bootstrapper with seeds: [[nodes.lightning.directory soa.nodes.lightning.directory]]
2018-11-25 19:43:16.608 [INF] DISC: Attempting to bootstrap with: Authenticated Channel Graph
2018-11-25 19:43:16.630 [INF] DISC: Obtained 3 addrs to bootstrap network with
2018-11-25 19:43:16.806 [INF] SRVR: Established connection to: 86.70.56.25:9735
...
```

To get back to normal operations, shut down LND with `Ctrl-C`, then

```
...
2018-11-25 19:43:27.382 [INF] PEER: Disconnecting 104.196.6.10:9735, reason: server: disconnecting peer 104.196.6.10:9735
2018-11-25 19:43:27.494 [INF] LTND: Shutdown complete

$ exit
$ sudo systemctl start lnd
```

Log files are located in the directory `/home/bitcoin/.lnd/logs/bitcoin/mainnet` (or `testnet`), you can check them as follows:

```
$ tail -f /home/bitcoin/.lnd/logs/bitcoin/mainnet/lnd.log
```

---

We will extend this troubleshooting guide constantly with findings that have been or will be reported in the issues section.

<br /><br />
