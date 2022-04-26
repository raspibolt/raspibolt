---
layout: default
title: CLN (core-lightning)
nav_order: 20
parent: Lightning
---

# CLN - Core Lightning
{: .no_toc }

---

[CLN - Core Lightning](https://github.com/ElementsProject/lightning/blob/master/README.md){:target="_blank"} 
is a lightweight, highly customizable and standard compliant implementation of the Lightning Network protocol. 
It can be used for the RaspiBolt as a replacement for LND or it can be run alongside it to create a second lightning nodes running on the same machine.

Difficulty: Medium
{: .label .label-yellow }

Status: Draft v3 (x64)
{: .label .label-red }

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

## User creation

We will download, verify, install and setup CLN. 

* As user "admin", create a new user "cln" and add it to groups "bitcoin" and "debian-tor"

```sh
sudo adduser --disabled-password --gecos "" cln
sudo usermod -a -G bitcoin,debian-tor cln
sudo adduser admin cln
```

## Data directories

* Create data directories for CLN and future plugins. Adjust permissions.

```sh
sudo mkdir /data/cln
sudo mkdir /data/cl-plugins-available
sudo chown -R cln:cln /data/cln
sudo chown -R cln:cln /data/cl-plugins-available
```

## Installation

* Install needed dependencies to compile CLN's source code.

```sh
sudo apt-get install -y \
   autoconf automake build-essential git libtool libgmp-dev \
   libsqlite3-dev python3 python3-mako net-tools zlib1g-dev libsodium-dev \
   gettext
sudo apt-get install -y postgresql libpq-dev
sudo pip3 install mrkd==0.2.0
sudo pip3 install mistune==0.8.4
```

* Open a "cln" user session and create symbolic links to bitcoin and cln data directories.

```sh
sudo su - cln

ln -s /data/cln /home/cln/.lightning
ln -s /data/bitcoin /home/cln/.bitcoin
```

* Display the links and check that they're not shown in red (indicating errors)

```sh
ls -la
```

* As user "cln" download the git repository 

```sh
#TODO: update to v0.11 if available
git clone https://github.com/ElementsProject/lightning.git
cd lightning
git reset --hard v0.11.0
``` 

* Don't trust, verify! Check who released the current version and get their signing keys and verify checksums.

```sh
wget -O "pgp_keys.asc" https://raw.githubusercontent.com/ElementsProject/lightning/master/contrib/keys/cdecker.txt
gpg --import ./pgp_keys.asc
wget https://github.com/ElementsProject/lightning/releases/download/v0.11.0/SHA256SUMS
wget https://github.com/ElementsProject/lightning/releases/download/v0.11.0/SHA256SUMS.asc
gpg --verify SHA256SUMS.asc
```

* Download user specific python packages

```sh
pip3 install --upgrade pip
pip3 install --user markupsafe==2.0.1 # fix needed for successful compilation on Ubuntu
pip3 install --user -r requirements.txt
```

* Configure and build CLN

```sh
./configure --enable-experimental-features
make
```

## Configuration

* Create and setup the configuration file for CLN

```sh
cd /home/cln/.lightning
nano config
```

* Insert the following content, adjust parameters in brackets to your likings

```ini
alias=<your fancy alias>
rgb=<your hex color>
network=bitcoin
log-file=/data/cln/cln.log
log-level=info
# for admin to interact with lightning-cli
rpc-file-mode=0660

# default fees and channel min size
fee-base=1000
fee-per-satoshi=1
min-capacity-sat=<your minchansize>

## optional
# wumbo channels
large-channels
# channel confirmations needed
funding-confirms=2
# autoclean (86400=daily)
autocleaninvoice-cycle=86400
autocleaninvoice-expired-by=86400

# wallet settings (replication recommended)
wallet=sqlite3://data/cln/bitcoin/lightningd.sqlite3:/home/cln/lightningd.sqlite3)

# no replication:
#wallet=sqlite3:///data/cln/bitcoin/lightning.sqlite3 

# network
proxy=127.0.0.1:9050
bind-addr=0.0.0.0:9736
addr=statictor:127.0.0.1:9736
always-use-proxy=true
```

* Create shortcuts and aliases for easier command handling

```sh
nano .bashrc
```

* Append the following at the end of the file

```sh
alias lightning-cli="./lightning/cli/lightning-cli"
alias lightningd="./lightning/lightningd/lightningd"
```

## Wallet password

* Create a password file for encrypted_hsm (equivalent to LND's wallet password)

```sh
nano ~/.clnpw
# insert your password
# take note of your password
```

* Switch back to user "admin"

```sh
exit
```

* For security, adjust the permissions of the password file

```sh
sudo chmod 0600 /home/cln/.clnpw
```

## Allow user "admin" to work with CLN

* Allow "admin" to access `lightning-cli` command. Create a sym link, adjust permissions and create an alias.

```sh
ln -s /data/cln /home/admin/.lightning

sudo chmod -R g+x /data/cln/bitcoin/

nano .bashrc
alias lightning-cli="/home/cln/lightning/cli/lightning-cli"
```

## Autostart on boot

* As "admin", create a systemd service that is automatically run on system startup

```sh
sudo nano /etc/systemd/system/cln.service
```

* Insert the following content

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
ExecStart=/bin/sh -c ' (cat /home/cln/.clnpw;echo;cat /home/cln/.clnpw) | \
                       /home/cln/lightning/lightningd/lightningd \
                       --conf=/data/cln/config \
                       --daemon \
                       --encrypted-hsm \
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

* Enable, start and unlock CLN

```sh
sudo systemctl daemon-reload
sudo systemctl enable cln.service
sudo systemctl start cln.service
```

* Daemon information is now written into system journal. Check the journal for CLN messages with the following command

```sh
sudo journalctl -f -u cln
```

## CLN in action

* If `cln.service` started without errors, we can check out and try CLN commands 

```sh
sudo su - cln 
lightning-cli --version
lightning-cli getinfo
```

## Upgrade CLN

* Upgrade CLN with care and follow the instructions on CLN repository completely to understand the changes. 
* Redo the steps "Download, verify and installation" as described above in this guide.
* Verify with `lightning-cli --version` that the update applied.
* Restart the systemd service for the update to take effect and reload configuration.

```sh
sudo systemctl restart cln.service
```

<br /><br />
---

Next: [Web app >>](web-app.md)
