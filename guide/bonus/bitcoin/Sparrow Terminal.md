---
layout: default
title: Sparrow Terminal
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---

## Bonus guide: Sparrow Terminal
{: .no_toc }

---

Sparrow server is a stripped down version of Sparrow that can be run on systems without displays. It's primarily intended as a configuration utility for running Sparrow as a server daemon

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

* 

---

# Sparrow terminal
Sparrow server is a stripped down version of Sparrow that can be run on systems without displays. It's primarily intended as a configuration utility for running Sparrow as a server daemon

![Sparrow_Terminal-logo](../../../images/sparrow-terminal-logo.jpg)

## Installation

### Download Sparrow Server

* Download Sparrow Server and signatures into "/tmp" directory, which is cleared on the reboot.

  ```
  $ cd /tmp
  $ wget https://github.com/sparrowwallet/sparrow/releases/download/1.7.0/sparrow-server-1.7.0-aarch64.tar.gz
  $ wget https://github.com/sparrowwallet/sparrow/releases/download/1.7.0/sparrow-1.7.0-manifest.txt.asc
  $ wget https://github.com/sparrowwallet/sparrow/releases/download/1.7.0/sparrow-1.7.0-manifest.txt
  ```
  
* Import keys that signed the release 

  ```
  $ curl https://keybase.io/craigraw/pgp_keys.asc | gpg --import
  ```
  
* Verify the release
  
  ```
  $ gpg --verify sparrow-1.7.0-manifest.txt.asc
  > gpg: assuming signed data in 'sparrow-1.7.0-manifest.txt'
    gpg: Signature made Thu Oct 27 12:32:37 2022 CEST
    gpg:                using RSA key D4D0D3202FC06849A257B38DE94618334C674B40
    gpg: Good signature from "Craig Raw <craigraw@gmail.com>" [unknown]
    gpg: WARNING: This key is not certified with a trusted signature!
    gpg:          There is no indication that the signature belongs to the owner.
    Primary key fingerprint: D4D0 D320 2FC0 6849 A257  B38D E946 1833 4C67 4B40
  ```
  
  ```
  $ sha256sum --check sparrow-1.7.0-manifest.txt --ignore-missing
  > sparrow-server-1.7.0-aarch64.tar.gz: OK
  ```

* If everything is correct, unpack Sparrow 

  ```
  $ tar -xvf sparrow-server-1.7.0-aarch64.tar.gz
  ```

### Configuration 

* Create a new directory for Sparrow and move data files there

  ```
  $ sudo mkdir -p /usr/local/bin/sparrow
  $ sudo mv /tmp/Sparrow/* /usr/local/bin/sparrow
  ```
 
* Create a symlink in the home directory for a shortcut to open wallet
 
  ``` 
  $ sudo ln -s /usr/local/bin/Sparrow/bin/Sparrow /home/admin/Sparrow
  ```
 
## Run Sparrow 

* You can run Sparrow from your home directory

  ```
  $ cd ~
  $ ./Sparrow
  ```
  
![Sparrow_Terminal](../../../images/sparrow-terminal.png)
  
* In "wallet" tab you can create or restore your wallet

### (optional) Connect Sparrow to your backend

* While in a home directory, open Sparrow Wallet

  ```
  $ ./Sparrow
  ```

* Go to "preferences > server > private electrum > continue"
* Set values according to your electrum server implementation and test connection

  ```
  # Use for Fulcrum
  URL: 127.0.0.1
  Port: 50002
  Use SSL? Yes
  
  # Use for Electrs
  URL: 127.0.0.1
  Port: 50001
  Use SSL? No
  ```
  
![Sparrow_Test](../../../images/sparrow-test.png)
 
---
