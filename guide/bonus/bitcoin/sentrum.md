---
layout: default
title: sentrum
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---

## Bonus guide: sentrum

{: .no_toc }

---

[sentrum](https://github.com/sommerfelddev/sentrum){:target="_blank"} is a
program that runs in the background and monitors watch-only wallets (using their
xpubs) for new transactions. For each new transaction, it performs a
configurable set of actions, such as sending notifications to your phone.

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

## Requirements

* Electrum server (e.g. electrs, EPS or fulcrum)

---

## Installation

### Download sentrum

* Download sentrum and signatures into `/tmp` directory, which is cleared on the reboot. If you want to update or install the latest version, look up the [latest sentrum release version](https://github.com/sommerfelddev/releases), and change the `VERSION=x.x.x` value line, to that number to download the latest sentrum binary.

  ```sh
  $ VERSION="0.1.9"
  $ cd /tmp
  $ wget https://github.com/sommerfelddev/sentrum/releases/download/v$VERSION/sentrum-v$VERSION-linux-aarch64.tar.gz
  $ wget https://github.com/sommerfelddev/sentrum/releases/download/v$VERSION/sentrum-v$VERSION-manifest.txt
  $ wget https://github.com/sommerfelddev/sentrum/releases/download/v$VERSION/sentrum-v$VERSION-manifest.txt.asc
  ```

* Import the developer's gpg public key

  ```sh
  $ gpg --locate-keys sommerfeld@sommerfeld.dev
  ```

* Verify the release
  
  ```sh
  $ gpg --verify sentrum-v$VERSION-manifest.txt.asc
  ```
  ```
  > gpg: assuming signed data in 'sentrum-v0.1.9-manifest.txt'
  > gpg: Signature made Wed 01 May 2024 12:06:43 AM WEST
  > gpg:                using EDDSA key B79DF5F37D7F9B0F390238D53298945F717C85F8
  > gpg: Good signature from "sommerfeld <sommerfeld@sommerfeld.dev>" [unknown]
  > gpg: WARNING: This key is not certified with a trusted signature!
  > gpg:          There is no indication that the signature belongs to the owner.
  > Primary key fingerprint: B79D F5F3 7D7F 9B0F 3902  38D5 3298 945F 717C 85F8
  ```
  
  ```sh
  $ sha256sum --check sentrum-v$VERSION-manifest.txt --ignore-missing
  > sentrum-v0.1.9-linux-aarch64.tar.gz: OK
  ```

* If everything is correct, unpack sentrum

  ```sh
  $ tar -xvf sentrum-v$VERSION-linux-aarch64.tar.gz
  ```

* Install the binary

  ```sh
  $ cd sentrum-v$VERSION-linux-aarch64
  $ sudo install -m 0755 -o root -g root -t /usr/local/bin sentrum
  ```

### Configuration

* Create the "sentrum" service user

  ```sh
  $ sudo adduser --disabled-password --gecos "" sentrum
  ```

* Create the sentrum coniguration directory

  ```sh
  $ sudo mkdir /etc/sentrum
  $ sudo chown -R sentrum:sentrum /etc/sentrum
  ```

* Switch to the "sentrum" user and create the config file


  ```sh
  $ sudo su - sentrum
  $ nano /etc/sentrum/sentrum.toml
  ```

  ```toml
  # RaspiBolt: sentrum.toml configuration
  # /etc/sentrum/sentrum.toml

  [[wallets]]
  # Identifier for naming purposes (required)
  name = "alice"
  # Wallet xpub (required)
  xpub = "<INSERT WALLET XPUB HERE>"
  # Script kind ("legacy","nested_segwit","segwit","taproot") (optional, defaults to segwit)
  #kind = "segwit"

  # Another wallet you want to track and be notified
  #[[wallets]]
  #name = "bob"
  #xpub = "xpubblablabla"


  # Check how to configure actions at: https://github.com/sommerfelddev/sentrum#actions
  [[actions]]
  type =  "terminal_print"

  [[actions]]
  type =  "ntfy"

  # Add more actions here (nostr, email, telegram, etc)
  #[[actions]]
  #type =  "<INSERT ACTION KIND>"
  #<.... INSERT ACTION SPECIFIC CONFIGURATION HERE...>

  [electrum]
  url = "tcp://127.0.0.1:50001"
  ```

  This will monitor the watch-only xpubs you indicate and apply the actions you
  configured on new transactions.
  In this guide, we will focus on the **ntfy** action, which is the most
  straightforward and reliable way to get notified on an android phone.

* Let's start sentrum manually first

  ```sh
  $ sentrum
  ```

  ```sh
  INFO  sentrum::config > reading configuration from '/etc/sentrum/sentrum.toml'
  INFO  sentrum::actions > [terminal_print] registered action
  INFO  sentrum::actions::ntfy > [ntfy] using topic '069Mtm5neo6GYKkP', connect to https://ntfy.sh/069Mtm5neo6GYKkP
  INFO  sentrum::actions       > [ntfy] registered action
  INFO  sentrum                > initial wallet sync
  INFO  sentrum::blockchain    > connected to 'tcp://127.0.0.1:50001'
  INFO  sentrum::blockchain    > current block height: 840000
  INFO  sentrum                > listening for new relevant events
  ```

* Stop sentrum with `Ctrl`-`C`

  You can see that a randomly generated topic `069Mtm5neo6GYKkP` was created in
  the https://ntfy.sh ntfy default server.

*  You can now install the ntfy app on your phone (if you haven't already) by
  following the installation links in https://ntfy.sh

* Open the ntfy app and give the the needed permissions

* Create a new topic with the same name as the one randomly generated by sentrum
  above.

* Reinvoke sentrum with the `--test` flag to test that you receive a
notification

  ```sh
  $ sentrum --test
  ```

* Exit the "sentrum" user session.

  ```sh
  $ exit
  ```

### Autostart on boot

Sentrum needs to start as a systemd service so that it is always running.

* As user "admin", create the sentrum systemd unit and copy/paste the following configuration. Save and exit.

  ```sh
  $ sudo nano /etc/systemd/system/sentrum.service
  ```

  ```sh
  # RaspiBolt: systemd unit for sentrum
  # /etc/systemd/system/sentrum.service

  [Unit]
  Description=sentrum daemon

  [Service]

  # Service execution
  ###################
  ExecStart=/usr/local/bin/sentrum

  # Directory creation and permissions
  ####################################
  User=sentrum

  # Hardening measures
  ####################
  # Provide a private /tmp and /var/tmp.
  PrivateTmp=true

  # Use a new /dev namespace only populated with API pseudo devices
  # such as /dev/null, /dev/zero and /dev/random.
  PrivateDevices=true

  # Deny the creation of writable and executable memory mappings.
  MemoryDenyWriteExecute=true

  [Install]
  WantedBy=multi-user.target
  ```

* Enable and start sentrum.

  ```sh
  $ sudo systemctl enable sentrum
  $ sudo systemctl start sentrum
  ```

* Check the systemd journal to see sentrum's log output.

  ```sh
  $ sudo journalctl -f -u sentrum
  ```

* Exit the log output with `Ctrl`-`C`

---

## For the future: sentrum upgrade

Just repeat the [installation procedure](#installation) to replace the installed
binary with the newer one.

---

## Uninstall 

Ensure you are logged with user "admin"

* Stop, disable and delete the sevice

  ```sh
  $ sudo systemctl stop sentrum
  $ sudo systemctl disable sentrum
  $ sudo rm /etc/systemd/system/sentrum.service
  ```

* Delete "sentrum" user

  ```sh
  $ sudo userdel -r sentrum
  ```

* Delete sentrum binary

  ```sh
  $ sudo rm /usr/local/bin/sentrum
  ```
  
<br /><br />

---

<< Back: [+ Bitcoin](index.md)
