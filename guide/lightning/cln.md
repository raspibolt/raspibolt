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

## Guide (x64!)


```sh
## CLN Installation

# create new CLN user as user "admin"
sudo adduser --disabled-password --gecos "" cln
sudo usermod -a -G bitcoin,debian-tor cln
sudo adduser admin cln

# create datadirs for cln and plugins
sudo mkdir /data/cln
sudo mkdir /data/cl-plugins-available
sudo chown -R cln:cln /data/cln
sudo chown -R cln:cln /data/cl-plugins-available


# install dependencies
sudo apt-get install -y \
   autoconf automake build-essential git libtool libgmp-dev \
   libsqlite3-dev python3 python3-mako net-tools zlib1g-dev libsodium-dev \
   gettext
sudo apt-get install -y postgresql libpq-dev
sudo pip3 install mrkd==0.2.0
sudo pip3 install mistune==0.8.4


# setup user
sudo su - cln
# create symlinks
ln -s /data/cln /home/cln/.lightning
ln -s /data/bitcoin /home/cln/.bitcoin
# check
ls -la


# get CLN repo
git clone https://github.com/ElementsProject/lightning.git
cd lightning
# choose v0.10.2 or head
git reset --hard v0.10.2 
#git reset --hard HEAD

# verify - check who released current version
wget -O "pgp_keys.asc" https://raw.githubusercontent.com/ElementsProject/lightning/master/contrib/keys/cdecker.txt
gpg --import ./pgp_keys.asc
wget https://github.com/ElementsProject/lightning/releases/download/v0.10.2/SHA256SUMS
wget https://github.com/ElementsProject/lightning/releases/download/v0.10.2/SHA256SUMS.asc
gpg --verify SHA256SUMS.asc


# install python requirements
pip3 install --upgrade pip
pip3 install --user markupsafe==2.0.1 # fix needed for successful compilation on Ubuntu
pip3 install --user -r requirements.txt


# build and install libs
./configure --enable-experimental-features
make




# configuration
cd /home/cln/.lightning
nano config

## config file
##############################################
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

# wallet settings (optional replication)
wallet=sqlite3:///data/cln/bitcoin/lightning.sqlite3 
# replication (requires latest head v0.11+) e.g.: wallet=sqlite3://data/cln/bitcoin/lightningd.sqlite3:/home/cln/lightningd.sqlite3)

# network
proxy=127.0.0.1:9050
bind-addr=0.0.0.0:9736
addr=statictor:127.0.0.1:9736
always-use-proxy=true
##############################################




# create shortcuts/aliases
nano .bashrc

# add at end of file
alias lightning-cli="./lightning/cli/lightning-cli"
alias lightningd="./lightning/lightningd/lightningd"



# create password file for encrypted hsm
nano ~/.clnpw
# insert your password

# switch to admin
exit

# adjust permission of password file
sudo chmod 0600 /home/cln/.clnpw

# create symlink
ln -s /data/cln /home/admin/.lightning

# allow admin to use lightning-cli command
sudo chmod -R g+x /data/cln/bitcoin/

nano .bashrc
alias lightning-cli="/home/cln/lightning/cli/lightning-cli"



## set up systemd.service (as admin)
sudo nano /etc/systemd/system/cln.service

# add cln.service:
##############################################
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
##############################################

# check CLN startup in a separate terminal
sudo journalctl -f -u cln

# refresh systemd services
sudo systemctl daemon-reload
sudo systemctl enable cln.service
sudo systemctl start cln.service


# final test after cln.service started ok
sudo su - cln 
lightning-cli --version
```
