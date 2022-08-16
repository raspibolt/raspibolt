---
layout: default
title: I2P - The Invisible Internet Protocol
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---

## Bonus guide: I2P - The Invisible Internet Protocol

{: .no_toc }

---

## I2P

[I2P](https://geti2p.net/en/){:target="_blank"} is a universal anonymous network layer. All communications over I2P are anonymous and end-to-end encrypted, participants don't reveal their real IP addresses. I2P allows people from all around the world to communicate and share information without restrictions.

I2P client is a software used for building and using anonymous I2P networks. Such networks are commonly used for anonymous peer-to-peer applications (filesharing, cryptocurrencies) and anonymous client-server applications (websites, instant messengers, chat-servers).

We are to use [i2pd](https://i2pd.readthedocs.io/en/latest/) (I2P Daemon), a full-featured C++ implementation of the I2P client as a Tor network complement.

---

Difficulty: Easy
{: .label .label-green }

Status: Tested v3
{: .label .label-green }

![I2P](../../../images/i2pd.png)

## Preparations

### Installation

* Ensure that you are logged with user "admin" and install apt-transport-https package

```sh
$ sudo apt install apt-transport-https
```

* Automatically add repository

```sh
$ wget -q -O - https://repo.i2pd.xyz/.help/add_repo | sudo bash -s -
```

* Install i2pd as any other software package

```sh
$ sudo apt update
$ sudo apt install i2pd
```

* Enable and start the service

```sh
$ sudo systemctl enable i2pd
$ sudo systemctl start i2pd
```

* See “i2p” in action by monitoring its log file. Exit with Ctrl-C

```sh
$ sudo tail -f /var/log/i2pd/i2pd.log
```

* Check service status and the correct autoboot enabled

```sh
$ sudo systemctl status i2pd
```

* Expected output, find *enabled* label:

```sh
* i2pd.service - I2P Router written in C++
     Loaded: loaded (/lib/systemd/system/i2pd.service; enabled; vendor preset: enabled)
     Active: active (running) since Thu 2022-08-11 15:35:54 UTC; 3 days ago
       Docs: man:i2pd(1)
             https://i2pd.readthedocs.io/en/latest/
   Main PID: 828 (i2pd)
      Tasks: 14 (limit: 9274)
     Memory: 56.1M
        CPU: 33min 28.265s
...
```

* Ensure that i2pd service is working and listening at the default ports

```sh
$ sudo lsof -i -P -n | grep i2pd | grep LISTEN
```

💡 If the prompt show you "sudo: lsof: command not found", it means that you don't have "lsof" installed yet, install it with next command and try again

```sh
$ sudo apt install lsof
```

### Configure Bitcoin Core

We need to set up settings in Bitcoin Core configuration file to enable I2P connections - add new lines if they are not present.

* With user "admin" in `bitcoin.conf`, add the following lines (additional i2p logs are optional). Save and exit.

```sh
$ sudo nano /data/bitcoin/bitcoin.conf
```

```sh
# Additional logs (optional)
debug=i2p

# Network
# Enable I2P
i2pacceptincoming=1
i2psam=127.0.0.1:7656
```

* Restart Bitcoin Core

```sh
$ sudo systemctl restart bitcoind
```

* Wait a few minutes until Bitcoin Core started again, and enter the next command to obtain your I2P address. There is usually some additional delay with the I2P local address appearing after Bitcoin Core already has connected to onion peers.

```sh
$ bitcoin-cli getnetworkinfo | grep address.*i2p
```

* Check the correct enablement of the I2P network, maybe you don't have I2P peer connections yet, don't worry, the inclusion of the I2P network in Bitcoin Core is recent and it might take a while to find peers available, be patient

```sh
$ bitcoin-cli -netinfo
```

* Example output expected

```sh
Bitcoin Core client v23.0.0 - server 70016/Satoshi:23.0.0/

          ipv4    ipv6   onion   i2p   total   block
in          0       0      25     2      27
out         7       0       2     1      10       2
total       7       0      27     3      37
```

## Uninstall

Ensure you are logged with user "admin"

* Stop, disable and delete i2pd service

```sh
$ sudo systemctl stop i2pd
$ sudo systemctl disable i2pd
$ sudo rm /etc/systemd/system/i2pd.service
```

* Uninstall all packages and dependencies related with i2pd

```sh
$ sudo apt --purge autoremove i2pd
```

* Delete or comment the next lines in `bitcoin.conf` file. Save and exit

```sh
$ sudo nano /data/bitcoin/bitcoin.conf
```

```sh
$ sudo nano /data/bitcoin/bitcoin.conf
```

```sh
# Network
# Enable I2P
#i2pacceptincoming=1
#i2psam=127.0.0.1:7656
```

* Restart Bitcoin Core

```sh
$ sudo systemctl restart bitcoind
```

<br /><br />

---

<< Back: [+ Bitcoin](index.md)
