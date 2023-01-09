---
layout: default
title: I2P - The Invisible Internet Protocol
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->

## Bonus guide: I2P - The Invisible Internet Protocol

{: .no_toc }

---

## I2P

[I2P](https://geti2p.net/en/){:target="_blank"} is a universal anonymous network layer. All communications over I2P are anonymous and end-to-end encrypted, participants don't reveal their real IP addresses. I2P allows people from all around the world to communicate and share information without restrictions.

I2P client is software used for building and running anonymous I2P networks. Such networks are commonly used for anonymous peer-to-peer applications (filesharing, cryptocurrencies) and anonymous client-server applications (websites, instant messengers, chat servers).

We are to use [i2pd](https://i2pd.readthedocs.io/en/latest/) (I2P Daemon), a full-featured C++ implementation of the I2P client as a Tor network complement.

Difficulty: Easy
{: .label .label-green }

Status: Tested v3
{: .label .label-green }

![I2P](../../../images/i2pd.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Preparations

### Installation

* Ensure that you are logged with user "admin" and install "apt-transport-https" package

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

* Enable autoboot on startup

  ```sh
  $ sudo systemctl enable i2pd
  ```

* Check the service is started and the correct autoboot enabled

  ```sh
  $ sudo systemctl status i2pd
  ```

Expected output, find *"enabled"* and *"Started"* labels:

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
      CGroup: /system.slice/i2pd.service
              -175224 /usr/sbin/i2pd --conf=/etc/i2pd/i2pd.conf --tunconf=/etc/i2pd/tunnels.conf --tunnel...

  Sep 27 18:54:57 minibolt systemd[1]: Starting I2P Router written in C++...
  Sep 27 18:54:57 minibolt systemd[1]: Started I2P Router written in C++.
  [...]
  ```

* Ensure that i2pd service is working and listening at the default ports

  ```sh
  $ sudo ss -tulpn | grep i2pd | grep LISTEN
  ```

Output expected:

  ```sh
  tcp   LISTEN 0      4096            0.0.0.0:23570       0.0.0.0:*    users:(("i2pd",pid=827,fd=17))
  tcp   LISTEN 0      4096           127.0.0.1:4444       0.0.0.0:*    users:(("i2pd",pid=827,fd=29))
  tcp   LISTEN 0      4096           127.0.0.1:7070       0.0.0.0:*    users:(("i2pd",pid=827,fd=22))
  tcp   LISTEN 0      4096           127.0.0.1:4447       0.0.0.0:*    users:(("i2pd",pid=827,fd=30))
  tcp   LISTEN 0      4096           127.0.0.1:7656       0.0.0.0:*    users:(("i2pd",pid=827,fd=38))
  tcp   LISTEN 0      4096           127.0.0.1:6668       0.0.0.0:*    users:(("i2pd",pid=827,fd=34))
  ```

* See “i2p” in action by monitoring its log file. Exit with Ctrl-C

  ```sh
  $ sudo tail -f /var/log/i2pd/i2pd.log
  ```

### Configure Bitcoin Core

We need to set up settings in Bitcoin Core configuration file to enable I2P connections - add new lines if they are not present

* With user "admin" in `bitcoin.conf`, add the following lines (additional i2p logs are optional). Save and exit

  ```sh
  $ sudo nano /data/bitcoin/bitcoin.conf
  ```

  ```sh
  # Additional logs (optional)
  debug=i2p

  # Network
  # I2P SAM proxy to reach I2P peers and accept I2P connections
  i2psam=127.0.0.1:7656
  ```

* Restart Bitcoin Core

  ```sh
  $ sudo systemctl restart bitcoind
  ```

* Run the next command to obtain your I2P local address. There is usually some additional delay after the onion local address appears before the I2P local address appears.

  ```sh
  $ bitcoin-cli -rpcwait getnetworkinfo | grep "address.*i2p"
  ```

* Check the correct enablement of the I2P network

  ```sh
  $ bitcoin-cli -rpcwait -netinfo
  ```

Example output expected, ensure of the presence of "i2p" network:

  ```sh
  Bitcoin Core client v24.0.1 - server 70016/Satoshi:24.0.1/

            ipv4    ipv6   onion   i2p   total   block
  in          0       0      25     2      27
  out         7       0       2     1      10       2
  total       7       0      27     3      37
  ```

💡 If you do not obtain I2P connections in a lot of time, you can add some peers manually by adding these lines at the end of the `bitcoin.conf` file:

* With user "admin", edit `bitcoin.conf` file

  ```sh
  $ sudo nano /data/bitcoin/bitcoin.conf
  ```

* Add the following lines. Save and exit

  ```sh
  addnode=255fhcp6ajvftnyo7bwz3an3t4a4brhopm3bamyh2iu5r3gnr2rq.b32.i2p:0
  addnode=27yrtht5b5bzom2w5ajb27najuqvuydtzb7bavlak25wkufec5mq.b32.i2p:0
  addnode=2el6enckmfyiwbfcwsygkwksovtynzsigmyv3bzyk7j7qqahooua.b32.i2p:0
  addnode=3gocb7wc4zvbmmebktet7gujccuux4ifk3kqilnxnj5wpdpqx2hq.b32.i2p:0
  addnode=3tns2oov4tnllntotazy6umzkq4fhkco3iu5rnkxtu3pbfzxda7q.b32.i2p:0
  addnode=4fcc23wt3hyjk3csfzcdyjz5pcwg5dzhdqgma6bch2qyiakcbboa.b32.i2p:0
  addnode=4osyqeknhx5qf3a73jeimexwclmt42cju6xdp7icja4ixxguu2hq.b32.i2p:0
  addnode=4umsi4nlmgyp4rckosg4vegd2ysljvid47zu7pqsollkaszcbpqq.b32.i2p:0
  addnode=52v6uo6crlrlhzphslyiqblirux6olgsaa45ixih7sq5np4jujaa.b32.i2p:0
  addnode=6j2ezegd3e2e2x3o3pox335f5vxfthrrigkdrbgfbdjchm5h4awa.b32.i2p:0
  addnode=6n36ljyr55szci5ygidmxqer64qr24f4qmnymnbvgehz7qinxnla.b32.i2p:0
  ```

* Restart Bitcoin Core

  ```sh
  $ sudo systemctl restart bitcoind
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

* Delete or comment out the following lines in `bitcoin.conf` file. Save and exit.

  ```sh
  $ sudo nano /data/bitcoin/bitcoin.conf
  ```

  ```sh
  # Network
  # I2P SAM proxy to reach I2P peers and accept I2P connections
  #i2psam=127.0.0.1:7656
  ```

* Restart Bitcoin Core

  ```sh
  $ sudo systemctl restart bitcoind
  ```

<br /><br />

---

<< Back: [+ Bitcoin](index.md)
