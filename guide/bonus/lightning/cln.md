---
layout: default
title: Core Lightning
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

# Bonus guide: Core Lightning
{: .no_toc }

---

[CLN - Core Lightning](https://github.com/ElementsProject/lightning/blob/master/README.md){:target="_blank"} 
is a lightweight, highly customizable and standard compliant implementation of the Lightning Network protocol. 
It can be used for the RaspiBolt as a replacement for LND or it can be run alongside it to create a second lightning nodes running on the same machine.

Difficulty: Medium
{: .label .label-yellow }

Status: Tested v3
{: .label .label-green }

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Introduction

Core Lightning (previously c-lightning) was one of the first implementation of the Bitcoin Lightning Network.

---

## Requirements

* Bitcoin Core

---

## Installation

We will download, verify, install and configure CLN on your RaspiBolt setup. This can be done independently from an existing LND installation. In fact, you can run both at the same time if you wish to.  

### User Creation

* As "admin", create a new user named "cln" and add it to groups "bitcoin" and "debian-tor". Also add "admin" to group "cln" for later use.

```sh
sudo adduser --disabled-password --gecos "" cln
sudo usermod -a -G bitcoin,debian-tor cln
sudo adduser admin cln
```

### Data directories

* Create data directories for CLN and future plugins. Adjust permissions afterwards.

```sh
sudo mkdir /data/cln
sudo mkdir /data/cl-plugins-available
sudo chown -R cln:cln /data/cln
sudo chown -R cln:cln /data/cl-plugins-available
```

### Dependencies & Symbolic Links

* Install required dependencies to compile CLN's source code.

```sh
sudo apt-get install -y \
  autoconf automake build-essential git libtool libgmp-dev libsqlite3-dev \
  python3 python3-pip net-tools zlib1g-dev libsodium-dev gettext
pip3 install --user --upgrade pip
```

* Open a "cln" user session and create symbolic links to bitcoin and cln data directories.

```sh
sudo su - cln

ln -s /data/cln /home/cln/.lightning
ln -s /data/bitcoin /home/cln/.bitcoin
```

* Display the links and check that they're not shown in red (indicating errors).

```sh
ls -la
```

### Download

* As user "cln" download the git repository to the home folder of user "cln".

```sh
git clone https://github.com/ElementsProject/lightning.git
cd lightning
git reset --hard v0.11.0.1
``` 

* Don't trust, verify! Check who released the current version and get their signing keys and verify checksums. Verification step should output `Good Signature`.

```sh
wget -O "pgp_keys.asc" https://raw.githubusercontent.com/ElementsProject/lightning/master/contrib/keys/rustyrussell.txt
gpg --import ./pgp_keys.asc
git verify-tag v0.11.0.1
```

* Download user specific python packages and set path for `poetry`.

```sh
pip3 install --user mrkd==0.2.0
pip3 install --user mistune==0.8.4
pip3 install --user poetry
export PATH="$HOME/.local/bin:$PATH"
```

### Building CLN

* Configure and build the source code. Experimental features will be activated. Read more about them [here](https://lightning.readthedocs.io/lightningd-config.5.html#experimental-options).

```sh
poetry install
./configure --enable-experimental-features
make
```

## Configuration

### Config File

* Create and edit the configuration file for CLN.

```sh
cd /home/cln/.lightning
nano config
```

* Insert the following content, adjust parameters in brackets to your likings. At least remove the brackets else cln will not start up correctly! Choose if you want to replicate CLN's channel database file to separate storage. It's good practice to keep a synchronous state of the database somewhere else to be able to recover off-chain funds in case of emergency.

```ini
alias=<your fancy alias>
rgb=<your hex color>
network=bitcoin
log-file=/data/cln/cln.log
log-level=info
# for admin to interact with lightning-cli
rpc-file-mode=0660

# default fees and channel min size
fee-base=<1000>
fee-per-satoshi=<1>
min-capacity-sat=<your minchansize>

## optional
# wumbo channels
large-channels
# channel confirmations needed
funding-confirms=2
# autoclean (86400=daily)
autocleaninvoice-cycle=86400
autocleaninvoice-expired-by=86400

# wallet settings (replication recommended, adjust backup path)
wallet=sqlite3:///data/cln/bitcoin/lightningd.sqlite3:/home/cln/lightningd.sqlite3

# no replication:
#wallet=sqlite3:///data/cln/bitcoin/lightning.sqlite3

# network
proxy=127.0.0.1:9050
bind-addr=0.0.0.0:9736
addr=statictor:127.0.0.1:9051/torport=9736
always-use-proxy=true
```

### Shortcuts & Aliases

* Create shortcuts and aliases for easier command handling.

```sh
cd ~/
nano .bashrc
```

* Append the following at the end of the file.

```sh
alias lightning-cli="./lightning/cli/lightning-cli"
alias lightningd="./lightning/lightningd/lightningd"
alias hsmtool="./lightning/tools/hsmtool"
```


### Autostart on boot

* As "admin", create a systemd service that is automatically run on system startup.

```sh
sudo nano /etc/systemd/system/cln.service
```

* Insert the following content:

```ini
# RaspiBolt: systemd unit for cln
# /etc/systemd/system/cln.service

[Unit]
Description=CLN daemon
Requires=bitcoind.service
After=bitcoind.service
Wants=network-online.target
After=network-online.target

[Service]
ExecStart=/bin/sh -c '/home/cln/lightning/lightningd/lightningd \
                       --conf=/data/cln/config \
                       --daemon \
                       --pid-file=/run/lightningd/lightningd.pid'

ExecStop=/bin/sh -c '/home/cln/lightning/cli/lightning-cli stop'
                       
RuntimeDirectory=lightningd

User=cln

# process management
Type=simple
PIDFile=/run/lightningd/lightningd.pid
Restart=on-failure
TimeoutSec=240
RestartSec=30

# hardening measures
PrivateTmp=true
ProtectSystem=full
NoNewPrivileges=true
PrivateDevices=true

[Install]
WantedBy=multi-user.target
```

* Enable and startup CLN.

```sh
sudo systemctl daemon-reload
sudo systemctl enable cln.service
sudo systemctl start cln.service
```

* Daemon information is now written into system journal. See the journal for CLN messages with the following command.

```sh
sudo journalctl -f -u cln
```

## CLN in action

* If `cln.service` started without errors, we can check out and try CLN commands.

```sh
sudo su - cln 
lightning-cli --version
lightning-cli getinfo
lightning-cli listfunds
```

## Allow user "admin" to work with CLN

* Allow "admin" to access CLN commands. Create a symlink, adjust permissions and create aliases (switch to "admin" with `exit`).

```sh
ln -s /data/cln /home/admin/.lightning

sudo chmod -R g+x /data/cln/bitcoin/

nano .bashrc
alias lightning-cli="/home/cln/lightning/cli/lightning-cli"
alias lightningd="/home/cln/lightning/lightningd/lightningd"
alias hsmtool="/home/cln/lightning/tools/hsmtool"
```

## Backup

* It is at least recommended to backup the wallet file `hsm_secret` that you can find in CLN's data directory `home/cln/.lightning/bitcoin/`. 
* For more detailed information, please have a look at the official [docs](https://lightning.readthedocs.io/FAQ.html#how-to-backup-my-wallet) and RaspiBlitz' incredible [FAQ](https://github.com/rootzoll/raspiblitz/blob/dev/FAQ.cl.md#backups).


## Upgrade CLN

* Upgrade CLN with care and follow the instructions on CLN repository completely to understand the changes.
* Remove the git repository or `git pull` from within and redo the verification and building steps as described above.
* Verify with `lightning-cli --version` that the update applied.
* Restart the systemd service for the update to take effect and reload configuration.

```sh
sudo systemctl restart cln.service
```
<br /><br />

## Optional Steps

### Wallet Encryption

* Encrypt `hsm_secret` with a password as user "cln". Choose a password and take a note!

```sh
hsmtool encrypt .lightning/bitcoin/hsm_secret
> YourFancyPassword
```
* Adjust systemd service after encrypting. Edit `ExecStart` command and add parameter `--encrypted-hsm`, like so:

```sh
ExecStart=/bin/sh -c '/home/cln/lightning/lightningd/lightningd \
                       --conf=/data/cln/config \
                       --daemon \
                       --encrypted-hsm \
                       --pid-file=/run/lightningd/lightningd.pid'
```

* With this change CLN requires you to enter the password on every restart. To automate this follow the steps below to auto-unlock on startup.


### Auto-Unlocking on Startup

* As user "cln", create a password file to auto-unlock on startup (equivalent to LND's wallet password) and enter the choosen encryption password from the step above.

```sh
nano ~/.clnpw
> YourFancyPassword
```

* As "admin", adjust permissions of the password file (read-only for the user).

```sh
sudo chmod 0600 /home/cln/.clnpw
```

* Change systemd service accordingly. Open systemd file.

```sh
sudo nano /etc/systemd/system/cln.service
```

* Edit `ExecStart` line like this:

```ini
ExecStart=/bin/sh -c ' (cat /home/cln/.clnpw;echo;cat /home/cln/.clnpw) | \
                       /home/cln/lightning/lightningd/lightningd \
                       --conf=/data/cln/config \
                       --daemon \
                       --encrypted-hsm \
                       --pid-file=/run/lightningd/lightningd.pid'
```

* Reload systemd configuration and restart it:

```sh
sudo systemctl daemon-reload
sudo systemctl start cln.service
```

<br /><br />

---

<< Back: [+ Lightning](index.md)
