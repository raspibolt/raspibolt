---
layout: default
title: Samourai Dojo/Whirlpool
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

## Bonus guide: Samourai Dojo/Whirlpool

{: .no_toc }

---

Samourai Dojo is the backing server for Samourai Wallet. Provides HD account & loose addresses (BIP47) balances & transactions lists. 
Provides unspent output lists to the wallet. PushTX endpoint broadcasts transactions through the backing bitcoind node.

Samourai Whirlpool is a free and open source (FOSS), non custodial, chaumian CoinJoin platform. Its goal is to mathematically disassociate the ownership of inputs to outputs in a given bitcoin transaction.

Difficulty: Medium
{: .label .label-yellow }

![dojo_profile](/images/dojo_profile.png)
---

## Requirements

* Bitcoin Core
* Fulcrum

---

## Preparations

### (optional) Print private IP address

Private IP address of your device will be necessary in the configuration section.

* With user "admin", run following command.

```sh
$ hostname -I | awk '{print $1}'
> x.x.x.x
```

### Write down your passwords 

You will need several new passwords, and it’s easiest to write them all down in the beginning, instead of bumping into them throughout the guide. They should be unique and very secure, at least 12 characters in length. Do not use uncommon special characters, spaces, or quotes (‘ or “).

```sh
[ F ] MYSQL_ROOT_PASSWORD
[ G ] MYSQL_PASSWORD
[ H ] NODE_API_KEY
[ I ] NODE_ADMIN_KEY
[ J ] NODE_JWT_SECRET
```

Store a copy of your passwords somewhere safe (preferably in an open-source password manager like [KeePassXC](https://keepassxc.org/){:target="_blank"}), or whaterver password manager you're already using, and keep your original notes out of sight once installation is complete.

### Install dependencies

* With user “admin”, make sure that all necessary software packages are installed

```sh
$ sudo apt update && sudo apt full-upgrade
$ sudo apt-get install apt-transport-https ca-certificates gnupg-agent software-properties-common
```

### Install Docker and Docker-compose

Dojo is offered as a set of pre configured Docker containers that can run on a x86-64 Linux environment and semi-automates the end-to-end process of installation and configuration. Docker is neccessary to install.

* Install Docker dependencies

```sh
$ sudo apt-get install libffi-dev libssl-dev python3-dev python3 python3-pip
```

* Install Docker and Docker-compose

```sh
$ sudo apt install docker && sudo pip3 install docker-compose
```

* Make sure installation worked

```sh
$ sudo docker --version
$ sudo docker-compose --version
```

### Configure Firewall

* Configure the firewall to allow incoming requests:

```sh
$ sudo ufw allow 8332 comment 'Allow Dojo Connection'
$ sudo ufw allow 8433 comment 'Allow block streaming'
```

### Configure Bitcoin Core

We need to set up settings in Bitcoin Core configuration file - add new lines if they are not present.

* In `bitcoin.conf`, add the following lines at the end of the file. Save and exit.

```sh
$ sudo nano /data/bitcoin/bitcoin.conf
```
```sh
# Dojo settings
rpcbind=private_ip       #DOJO_API setting
rpcbind=127.0.0.1       #Avoid problems with services using 127.0.0.1
rpcallowip=0.0.0.0/0    #Allow docker connections
```

* Restart Bitcoin Core

```sh
$ sudo systemctl restart bitcoind
```

## Installation

### Download Samourai Dojo

* Login as “admin” and change to a temporary directory which is cleared on reboot.

```sh
$ cd /tmp/
```

* Get the latest download links at [code.samourai.io/dojo](https://code.samourai.io/dojo/samourai-dojo/-/releases){:target="_blank"}. They change with each update.

```sh
$ sudo wget https://code.samourai.io/dojo/samourai-dojo/-/archive/v1.17.0/samourai-dojo-v1.17.0.tar.gz
$ sudo tar -xvf samourai-dojo-v1.17.0.tar.gz
```

### Create the dojo user

* Create the user "dojo" and add him to the group “bitcoin” as well.

```sh
$ sudo adduser --disabled-password --gecos "" dojo
$ sudo adduser dojo bitcoin
```

* Add user "dojo" to the docker group to execute docker commands.

```sh
$ sudo usermod -aG docker dojo
```

### Data directory

* Create the Dojo data folder.

```sh
$ sudo mv /tmp/samourai-dojo-v1.17.0 /data/dojo/
$ sudo chown -R dojo:dojo /data/dojo/
```

* Create a symlink to /home/dojo/.dojo

```sh
$ sudo ln -s /data/dojo /home/dojo/.dojo
$ sudo chown -R dojo:dojo /home/dojo/.dojo
```

* Switch to user "dojo"

```sh
$ sudo su - dojo
```

* Display the link and check that it is not shown in red (this would indicate an error)

```sh
$ ls -la
```

## Configuration

* With user "dojo" move to configuration directory and list files that will be edited.

```sh
$ cd /data/dojo/docker/my-dojo/conf
$ ls
```

* As user "dojo" edit configuration files.

💡 For first time install `.tpl` files are edited. However after first installation is done, if changes are neccessary, it is important to edit newly    generated files without the `.tpl` extension.

### Bitcoin configuration

```sh
$ nano docker-bitcoind.conf.tpl
```

```sh
# Find and edit following lines
BITCOIND_RPC_USER=raspibolt
BITCOIND_RPC_PASSWORD=YourPasswordB
BITCOIND_INSTALL=off
BITCOIND_IP=private_ip (ex. 10.x.x.x or 192.x.x.x)
BITCOIND_RPC_PORT=8332
BITCOIND_ZMQ_RAWTXS=28333
BITCOIND_ZMQ_BLK_HASH=8433
```

### Explorer configuration

* [BTC Explorer](https://raspibolt.org/guide/bitcoin/blockchain-explorer.html) is already a part of raspibolts guide. However it can be installed automatically as a part of a Dojo. By default is "on".

```sh
$ nano docker-explorer.conf.tpl
```

```sh
# Find and edit following lines
EXPLORER_INSTALL=off
```

### Indexer configuration

```sh
$ nano docker-indexer.conf.tpl
```

```sh
# Find and edit following lines
INDEXER_INSTALL=off
INDEXER_IP=private_ip (ex. 10.x.x.x or 192.x.x.x)
INDEXER_RPC_PORT=50002
INDEXER_BATCH_SUPPORT=active
INDEXER_PROTOCOL=tls
```

### Database configuration 

```sh
$ nano docker-mysql.conf.tpl
```

```sh
# Find and edit following lines
MYSQL_ROOT_PASSWORD= [F] MYSQL_ROOT_PASSWORD
MYSQL_USER=raspibolt
MYSQL_PASSWORD= [G] MYSQL_PASSWORD
```

### NodeJS configuration

```sh
$ nano docker-node.conf.tpl
```

```sh
# Find and edit following lines
NODE_API_KEY= [H] NODE_API_KEY
NODE_ADMIN_KEY= [I] NODE_ADMIN_KEY
NODE_JWT_SECRET= [J] NODE_JWT_SECRET
NODE_ACTIVE_INDEXER=local_indexer
```

### Whirlpool configuration

```sh
$ nano docker-whirlpool.conf.tpl
```

```sh
# Find and edit following lines
WHIRLPOOL_INSTALL=on
WHIRLPOOL_RESYNC=on
```

## Run Dojo

* With user "dojo" run installation. It can take up to 15 minutes.

💡 To avoid errors, always execute "install" and "upgrade" commands without sudo prefix - therefore as a "dojo" user.

```sh
$ cd /data/dojo/docker/my-dojo
$ ./dojo.sh install

Building tor       ... 
Building db        ... 
Building node      ... 
Building whirlpool ... 
Building nginx     ... 
[+] Building 0.1s (0/1)                                                                                                
 => [internal] load build definition from Dockerfile                                                              0.1s
 => => transferring dockerfile:                                                                                   0.0s
[+] Building 0.3s (0/1)                                                                                                
 => [internal] load build definition from Dockerfile                                                              0.3s 
 => => transferring dockerfile: 1.55kB  
```

* Once installed, you should expect following output (it will take a while for blocks to synchronise):

```sh
nodejs       | 2022-08-18T00:14:04Z  INFO  Tracker : Tracker Startup (IBD mode)
nodejs       | 2022-08-18T00:14:05Z  INFO  Tracker : Sync 749889 blocks
nodejs       | 2022-08-18T00:14:05Z  INFO  Tracker : Beginning to process new block header.
nodejs       | 2022-08-18T00:14:05Z  INFO  Tracker :  Added block header 1 (id=1)
```

* Following outputs are expected once finished. If you closed the monitoring process, you can view them with the commands below, while still in the `my-dojo` directory.

```sh
$ ./dojo.sh logs node
nodejs       | 2022-08-18T10:40:28Z  INFO  Importer : Electrum attempting reconnect...
nodejs       | 2022-08-18T10:40:28Z  INFO  Importer : Successfully connected to indexer
nodejs       | 2022-08-18T10:40:35Z  INFO  Tracker : Processing active Mempool (0 transactions)
```

```sh
$ ./dojo.sh logs whirlpool
whirlpool    | 2022-08-18 00:13:56.216  WARN 1 --- [           main] c.s.whirlpool.cli.services.CliService    : ?????????????????????????
whirlpool    | 2022-08-18 00:13:56.220  WARN 1 --- [           main] c.s.whirlpool.cli.services.CliService    : ? INITIALIZATION REQUIRED
whirlpool    | 2022-08-18 00:13:56.226  WARN 1 --- [           main] c.s.whirlpool.cli.services.CliService    : ? Please start GUI to initialize
```

## Connect to Dojo

### Print onion addresses

* Still logged with user "dojo" and in `my-dojo` directory, print onion addresses and write them down to a safe place (password manager etc.).

```sh
$ ./dojo.sh onion
WARNING: Do not share these onion addresses with anyone!
        To allow another person to use this Dojo with their Samourai Wallet,
         you should share the QRCodes provided by the Maintenance Tool.
 
Dojo API and Maintenance Tool = xyz.onion         # Use with Onion Browser
 
Your private Whirlpool client (do not share) = xyz.onion   # Use with whirlpool GUI
```

* Exit "dojo" user sesstion

```sh
$ exit
```

### Connect samourai wallet

Connect samourai wallet to your own backend

* Paste `Dojo API and Maintenance Tool` address into Tor browser and authenticate with `[I] NODE_ADMIN_KEY`.

![maintancetool_auth.png](/images/maintancetool_auth.png)

* You will find your QR code for samourai wallet under the "pairing section".

![dojo_pairing.png](/images/dojo_pairing.png)

💡 To connect, you need to delete and restore already existing samourai wallet. Backend configuration can only be modified at the start of wallet creation/restore process. Double check your seedphrase and passphrase before you do that!

### (optional) Rescan public keys using Dojo Maintenance Tool
If no balance is shown in your samourai wallet, it is neccessary to rescan public keys as they are not tracked by Dojo yet.

* Log into `Dojo API and Maintenance Tool` using Tor browser
* Move to `xpubs tool`, under `Tools` section
* In samourai wallet go to `Settings > Wallet`, here you can find your public keys
* Copy and paste all "zpubs" into `xpub tool` and rescan each public key separately

You can also use following chart to determine which type of public key you use:

```sh
Pre-mix and post-mix ZPUBS = accounts for funds yet to be mixed and after mixing
ZPUB = deposit account for addresses starting with "bc" (default)
XPUB= deposit addresses start with a "1"
YPUB = deposit addresses start with a "3"
```

### Connect the GUI to remote client

Join mixing rounds 24/7 using raspibolt node.

* Install latest [whirlpool GUI](https://samouraiwallet.com/download) version.
* Open GUI with Tor browser running in the background.

* Paste `private Whirlpool client` address in the correct format
* Set Tor proxy port for `9150` and click connect.

![GUI](/images/whirlpool_setup.png)

* Within your Samourai Wallet go to `Settings > Transactions > Pair to Whirlpool GUI`
* Scan or copy the pairing payload from your phone, pass this to your computer and paste into the payload box in Whirlpool.

![whirlpool_payload.png](/images/whirlpool_payload.png)

* Turn on backend and authenticate using samourai wallet passphrase

![whirlpool_passphrase_auth.png](/images/whirlpool_passphrase_auth.png)

* Setup complete and ready to start a mix! Now you run mixing client on your raspbibolt node!

![whirlpool_startmix.png](/images/whirlpool_startmix.png)

💡 Make sure Tor Browser is running on the background when you want to connect to your client. Whirlpool GUI can be safely closed as mixing client is now running remotely on your node.

After you initialized your client for the first time, dojo will generate unique `APIkey`. You will be asked for it in case of resetting the configuration.

* Switch do `dojo` user and move to `my-dojo` folder.

```sh
$ sudo su - dojo
$ cd /data/dojo/docker/my-dojo
```

* Run following command. Write it down to a safe place

```sh
$ ./dojo.sh whirlpool apikey
> apikey
```

* Exit dojo user

```sh
$ exit
```

## For the future: Dojo upgrade 

* Move to `my-dojo` folder and stop dojo.

```sh
$ cd /data/dojo/docker/my-dojo
$ sudo ./dojo.sh stop
```

* Follow installation section with user "admin" - download latest version and move it to already existing dojo folder. You will overwrite several files.

* Once done, log as user "dojo" and upgrade dojo.

```sh
$ sudo su - dojo
$ cd /data/dojo/docker/my-dojo
$ ./dojo.sh upgrade
```

* Exit dojo user session 

```sh
$ exit
```

You have now successfully upgraded dojo on the latest version.

## Uninstall

### Remove bitcoin.conf settings

* Move to Bitcoin configuration file

```sh
$ sudo nano /data/bitcoin/bitcoin.conf
```

* Remove or comment following lines

```sh
# Dojo settings. Add at the end of your conf file
#rpcbind=machine_local_ip       #DOJO_API setting
#rpcbind=127.0.0.1       #Avoid problems with services using 127.0.0.1
#rpcallowip=0.0.0.0/0    #Allow docker connections
```

* Save and exit.

### Uninstall Dojo

* Switch to user "dojo"

```sh
$ sudo su - dojo
```

* Uninstall Dojo

```sh
$ cd /data/dojo/docker/my-dojo
$ ./dojo.sh uninstall
```

* Exit dojo user session

```sh
$ exit
```

### Remove dojo directory

```sh
$ sudo rm -r /data/dojo
```

### Remove dojo user

```sh
$ sudo userdel -r dojo
```

### Uninstall FW configuration

* Display the UFW firewall rules and notes the numbers of the rules for Dojo (e.g., X and Y below)

```sh
$ sudo ufw status numbered
> [...]
> [X] 8433                    ALLOW IN    Anywhere    'Allow block streaming'           
> [...]
> [Y] 8433 (v6)               ALLOW IN    Anywhere (v6)    'Allow block streaming'           
```

* Delete the rule with the correct number and confirm with "yes"

```sh
$ sudo ufw delete X
```

### Uninstall Docker (Optional)

```sh
$ sudo apt remove docker && sudo apt remove docker-compose
```

### Uninstall dependencies (Optional)

* Uninstall Dojo dependencies

```sh
$ sudo apt remove apt-transport-https ca-certificates gnupg-agent software-properties-common
```

* Uninstall Docker dependencies

```sh
$ sudo apt remove libffi-dev libssl-dev python3-dev python3 python3-pip
```
