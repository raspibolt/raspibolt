---
layout: default
title: CLBoss
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

# Bonus guide: CLBoss
{: .no_toc }

---

[CLBoss](https://github.com/ZmnSCPxj/clboss){:target="_blank"} 
is an automated manager for CLN nodes. It's capable of automatically opening channels to useful nodes, acquiring inbound capacity through boltz swaps, rebalancing existing channels and setting competitive forwarding fees.
Read more about it [here](https://zmnscpxj.github.io/clboss/index.html){:target="_blank"}.

Difficulty: Easy
{: .label .label-green }

Status: Draft v3
{: .label .label-red }

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Introduction

CLBoss - an automated CLN node management tool. This guide shows how to install and setup an existing CLN node with CLBoss plugin.

---

## Requirements

* CLN

---

## Installation

We will download, install and setup CLBoss on your RaspiBolt CLN node. CLBoss is a plugin that we will place into `/data/cl-plugins-available/` and load via CLN's configuration file.

## Dependencies

* As "admin", install required dependencies to compile CLBoss's source code.

```sh
sudo apt install -y build-essential pkg-config libev-dev \
     libcurl4-gnutls-dev libsqlite3-dev dnsutils
```

* Switch back to user "cln".

```sh
sudo su - cln
```

* Download latest version and untar it to CLN's plugin folder `/data/cl-plugins-available`.

```sh
cd /data/cl-plugins-available
wget https://github.com/ZmnSCPxj/clboss/releases/download/v0.12/clboss-0.12.tar.gz
tar xfv clboss-0.12.tar.gz
cd clboss-0.12
```

## Compilation

* Compile it.
```sh
./configure
make
```

## Configuration

* Add the plugin to CLN config.

```sh
nano /data/cln/config
```

* Append this line to end of file:

```sh
plugin=/data/cl-plugins-available/clboss-0.12/clboss
```

## Restart Service

* Reload systemd configuration and restart it:

```sh
sudo systemctl restart cln.service
```

* Check if it's running.

```sh
tail -f /data/cln/cl.log
```

* It should output log entries infos like so:

```log
INFO    plugin-clboss: clboss 0.12
INFO    plugin-clboss: ChannelFeeManager: zerobasefee: allow
INFO    plugin-clboss: New block at xxxxxx
INFO    plugin-clboss: Started.
```

<br /><br />

---

<< Back: [+ Lightning](index.md)
