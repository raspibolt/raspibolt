[ [Intro](README.md) ] -- [ **Preparations** ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [Bonus](raspibolt_60_bonus.md) ] -- [ [FAQ](raspibolt_faq.md) ] -- [ [Updates](raspibolt_updates.md) ]

-------
### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi
--------

# Preparations

## Hardware requirements
This guide builds on the easily available and very flexible Raspberry Pi. This amazing piece of hardware is a tiny computer-on-a-chip, costs about $35 and consumes very little energy.

![Raspberry Pi](images/10_raspberrypi_hardware.png)  
*Raspberry Pi 3: a tiny computer for less than $40*

It is advisable to get the latest Raspberry Pi for good performance:
* Raspberry Pi 3 Model B or better
* Micro SD card: 8 GB or more, incl. adapter to your regular computer
* USB power adapter: 5V/1.2A (more ampere is fine) + Micro USB cable
* External hard disk: 500 GB or more with dedicated power supply
* Optional: Raspberry Pi case

I used a Raspberry Pi 3 Model B and set it up with a 8 GB SD card. To run a Lightning node, the full Bitcoin blockchain must be stored locally, which is ~200 GB and growing. I bought a cheap hard disk enclosure and reused an old 500 GB hard disk that was lying around. 

To power my RaspiBolt, I use two power adapters, as the power-output of the Pi's USB ports is very limited: an old 5V USB mobile phone charger with 1.2A and the separate power supply of the hard disk enclosure. You might be able to power the Pi including a new 2.5" drive (connected to the Pi) with one decent USB power supply (2.5A+), but no guarantees.

## Download the Bitcoin blockchain
The Bitcoin blockchain records all transactions and basically defines who owns how many bitcoin. This is the most crucial of all information and we should not rely on someone else to provide this data. To set up our Bitcoin Full Node on mainnet, we need to

* download the whole blockchain (~ 200 GB),
* verify every Bitcoin transaction that ever occurred and every block ever mined,
* create an index database for all transactions, so that we can query it later on,
* calculate all bitcoin address balances (called the UTXO set).

:point_right: See [Running a Full Node](https://bitcoin.org/en/full-node) for additional information.

Although we will set up the RaspiBolt for the Bitcoin testnet first, the validation of the Bitcoin mainnet blockchain can take several days. This is the reason why we already start this task now.

### Using a regular computer
You can imagine that the Raspberry Pi is not quite up to this huge task. The download is not the problem, but to initially process the whole blockchain would take weeks or months due to its low computing power and lack of memory. We need to download and verify the blockchain with Bitcoin Core on a regular computer, and then transfer the data to the Pi. This needs to be done only once. After that the Pi can easily keep up with new blocks.

This guide assumes that you will use a  Windows machine for this task, but it works with most operating systems. You need to have about 250 GB free disk space available, internally or on an external hard disk (but not the one reserved for the Pi). As indexing creates heavy read/write traffic, the faster your hard disk the better. An internal drive or an external USB3 hard disk will be significantly faster than one with a USB2 connection.

To copy the blockchain to the Pi later, there are several options:

* **Recommended**: The best configuration is to format the external hard disk of the Pi with the Ext4 file system, which is better suited for our use case. Using SPC, we then copy the blockchain from the Windows computer over the local network.

* **Or**, if you want to use an external hard disk for your Pi that already contains data, eg. because you already downloaded the blockchain, this works as well. You can use the disk as is, but need to skip the formatting part later in this guide.

### Download and verify Bitcoin Core
Download the Bitcoin Core installer from [bitcoincore.org/en/download](https://bitcoincore.org/en/download) and store it in the directory you want to use to download the blockchain. To check the authenticity of the program, we calculate its checksum and compare it with the checksums provided. 

In Windows, I’ll preface all commands you need to enter with `>` , so with the command `> cd bitcoin` , just enter `cd bitcoin` and hit enter.

Open the Windows command prompt (`Win+R`, enter `cmd`, hit `Enter`), navigate to the bitcoin directory (for me, it's on drive `D:`, check in Windows Explorer) and create the new directory `bitcoin_mainnet`. Then calculate the checksum of the already downloaded program.
```
> G:
> cd \bitcoin
> mkdir bitcoin_mainnet
> dir
> certutil -hashfile bitcoin-0.16.3-win64-setup.exe sha256
bd48ec4b7e701b19f993098db70d69f2bdc03473d403db2438aca5e67a86e446
```
![Windows Command Prompt: verify checksum](images/10_blockchain_wincheck.png)

Compare this value with the [release signatures](https://bitcoin.org/bin/bitcoin-core-0.16.0/SHA256SUMS.asc). For the Windows v0.16.0 binaries, its
```
32 bit:  1fe280a78b8796ca02824c6e49d7873ec71886722021871bdd489cbddc37b1f3
64 bit:  bd48ec4b7e701b19f993098db70d69f2bdc03473d403db2438aca5e67a86e446
```
Usually, you would also need to check the signature of this file, but it's a pain on Windows, so we will do it on the Pi later on.

### Installing Bitcoin Core
Execute the Bitcoin Core installation file (you might need to right-click and choose "Run as administrator") and install it using the default settings. Start the program `bitcoin-qt.exe` in the directory "C:\Program Files\Bitcoin". Choose your new “bitcoin_mainnet” folder as the custom data directory.

![Bitcoin Core directory selection](images/10_bitcoinqt_directory.png)

:warning: **IMPORTANT: The next step is crucial. Without `txindex=1` your whole Bitcoin blockchain will be useless** :warning:  
Bitcoin Core opens and starts immediately syncing the blockchain, but we need to set one additional setting in the “bitcoin.conf” file. Using the menu, open `Settings` / `Options` and click the button `Open Configuration File`. Enter the following line:
```
txindex=1
```
If your computer has a lot of memory, you can increase the database in-memory cache by adding the following line (with megabytes of memory to use, adjusted to your computer) as well:
```
dbcache=6000
```
Save and close the text file, quit Bitcoin Core using `File` / `Exit` and restart the program. The program will start syncing again. 

Let the blockchain sync for now, we can already start working on the Pi.

---
Next: [Raspberry Pi >>](raspibolt_20_pi.md)
