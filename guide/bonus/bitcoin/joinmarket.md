---
layout: default
title: JoinMarket clientserver
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->
# Bonus guide: JoinMarket clientserver
{: .no_toc }

Difficulty: Intermediate
{: .label .label-yellow }

Status: Tested v3
{: .label .label-green }

We set up [Joinmarket clientserver](https://github.com/JoinMarket-Org/joinmarket-clientserver){:target="blank"}, a decentralized marketplace for executing and providing liquidity to CoinJoin transactions. Run it to help improve the confidentiality and privacy of bitcoin transactions (and probably make a few sats while you're at it).

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

### Introduction

[JoinMarket](https://github.com/JoinMarket-Org/joinmarket-clientserver) is a CoinJoin software, which allows you to increase privacy and fungibility of on-chain Bitcoin transactions. It includes its own Bitcoin wallet, backed by `bitcoind`, and uses a market maker / market taker model, which means that either you pay a small fee for having CoinJoin privacy fast (taker) or just keep the software running and get paid for providing liquidity for CoinJoins, in addition gaining privacy over a longer period of time (maker). Even if you aren't interested in the privacy of your coins, you can use JoinMarket for a little passive income from your bitcoin, without giving up your private keys.

---

## Preparations

### Install dependencies

* With user "admin", install necessary dependencies

  ```sh
  $ sudo apt install python-virtualenv curl python3-dev python3-pip build-essential automake pkg-config libtool libgmp-dev libltdl-dev libssl-dev libatlas3-base libopenjp2-7
  ```

If you get `E: Package 'python-virtualenv' has no installation candidate` error when running command above, replace `python-virtualenv` with `python3-virtualenv`.

### Create a JoinMarket-dedicated bitcoin wallet with bitcoin-cli

* This wallet will be used by JoinMarket to store addresses as watch-only. It will use this wallet when it communicates with bitcoin core via rpc calls.

  ```sh
  $ bitcoin-cli -named createwallet wallet_name=jm_wallet descriptors=false
  ```

### Create dedicated user and data directory

* Create the “joinmarket” user, and make it a member of the “bitcoin” and "debian-tor" groups

  ```sh
  $ sudo adduser --disabled-password --gecos "" joinmarket
  $ sudo usermod -a -G bitcoin,debian-tor joinmarket
  ```

* Create a JoinMarket data directory

  ```sh
  $ sudo mkdir /data/joinmarket
  $ sudo chown -R joinmarket:joinmarket /data/joinmarket
  ```

* Open a "joinmarket" user session

  ```sh
  $ sudo su - joinmarket
  ```

* Create a symbolic link pointing to the joinmarket data directory

  ```sh
  $ ln -s /data/joinmarket /home/joinmarket/.joinmarket
  ```
  
* Create a symbolic link pointing to the Bitcoin data directory for the OTS client to verify the timestamp

  ```sh
  $ ln -s /data/bitcoin /home/joinmarket/.bitcoin
  ```

---

## Installation

* As user "joinmarket", download the latest release, signature and timestamp. First check for the latest release on the [Releases page](https://github.com/JoinMarket-Org/joinmarket-clientserver/releases) and update version numbers as you go if needed.

  ```sh
  $ VERSION="0.9.11"
  $ cd /tmp
  $ wget -O joinmarket-clientserver-$VERSION.tar.gz https://github.com/JoinMarket-Org/joinmarket-clientserver/archive/v$VERSION.tar.gz
  $ wget https://github.com/JoinMarket-Org/joinmarket-clientserver/releases/download/v$VERSION/joinmarket-clientserver-$VERSION.tar.gz.asc
  $ wget https://github.com/JoinMarket-Org/joinmarket-clientserver/releases/download/v$VERSION/joinmarket-clientserver-$VERSION.tar.gz.asc.ots
  ```

* Get the PGP keys of JoinMarket developers that sign releases.

  ```sh
  $ curl https://raw.githubusercontent.com/JoinMarket-Org/joinmarket-clientserver/master/pubkeys/AdamGibson.asc | gpg --import 
  ```
  ```
  > ...
  > gpg: key 141001A1AF77F20B: public key "Adam Gibson (CODE SIGNING KEY) <ekaggata@gmail.com>" imported
  > ...
  ```
  ```sh
  $ curl https://raw.githubusercontent.com/JoinMarket-Org/joinmarket-clientserver/master/pubkeys/KristapsKaupe.asc | gpg --import
  ```
  ```
  > ...
  > gpg: key 33E472FE870C7E5D: public key "Kristaps Kaupe <kristaps@blogiem.lv>" imported
  > ...
  ```

* Verify that the application is signed by JoinMarket developer(s).

  ```
  $ gpg --verify joinmarket-clientserver-$VERSION.tar.gz.asc
  > gpg: assuming signed data in 'joinmarket-clientserver-0.9.11.tar.gz'
  > gpg: Signature made Thu Feb 22 11:22:40 2024 EET
  > gpg:                using RSA key 70A1D47DD44F59DF8B22244333E472FE870C7E5D
  > gpg: Good signature from "Kristaps Kaupe <kristaps@blogiem.lv>" [unknown]
  > gpg: WARNING: This key is not certified with a trusted signature!
  > gpg:          There is no indication that the signature belongs to the owner.
  > Primary key fingerprint: 70A1 D47D D44F 59DF 8B22  2443 33E4 72FE 870C 7E5D
  ```

* Check the timestamp of the signature

  ```sh
  $ ots verify joinmarket-clientserver-$VERSION.tar.gz.asc.ots -f joinmarket-clientserver-$VERSION.tar.gz.asc
  > [...]
  > Success! Bitcoin block 831526 attests existence as of 2024-02-22 EET
  ```

* If the signature and timestamp check out, unpack and install JoinMarket. The install script may take 5 to 20 minutes to run, depending on hardware.

  ```sh
  $ tar -xvzf joinmarket-clientserver-$VERSION.tar.gz -C /home/joinmarket/
  $ cd 
  $ ln -s joinmarket-clientserver-$VERSION joinmarket
  $ cd joinmarket
  $ ./install.sh --without-qt --disable-secp-check --disable-os-deps-check
  ```

---

## Configuration

* Create jmvenv activation script.

  ```sh
  $ cd
  $ nano activate.sh
  ```
  
  ```sh
  #!/usr/bin/env bash
  cd /home/joinmarket/joinmarket && \
  source jmvenv/bin/activate && \
  cd scripts
  ```

* Save the file and exit nano, then make the file executable.

  ```sh
  $ chmod +x activate.sh
  ```

* Activate jmvenv and run wallet-tool.py to create the configuration file.

  ```sh
  $ . activate.sh
  (jvmenv) $ ./wallet-tool.py 
  ```
  ```
  > User data location: /home/joinmarket/.joinmarket/
  > Created a new `joinmarket.cfg`. Please review and adopt the settings and restart joinmarket.
  ```

* Open the new configuration file.

  ```sh
  $ nano /data/joinmarket/joinmarket.cfg
  ```

* Instruct Joinmarket to verify with Bitcoin Core via cookie rather than login/pass.

  ```ini
  # rpc_user = bitcoin
  # rpc_password = password
  rpc_cookie_file = /data/bitcoin/.cookie
  ```
* Set the bitcoin core watch-only wallet to the one created earlier.
  
  ```ini
  rpc_wallet_file = jm_wallet
  ```
* Change the onion_serving_port to avoid conflict with LND.
  
  ```ini
  onion_serving_port = 8090
  ```
  
* Save and exit.

---

## Using JoinMarket

### Generate JoinMarket wallet 

JoinMarket uses its own wallet. You can create one with or without a "two-factor mnemonic recovery phrase", which refers to a BIP39 passphrase. This is not required and adds complexity, though it may be desired for various security or backup reasons. A good article on the BIP39 passphrase can be found [here](https://www.blockplate.com/blogs/blockplate/what-is-a-bip39-passphrase).

* Generate a new JoinMarket wallet:
 
  ```sh
  (jvmenv) $ ./wallet-tool.py generate
  ```
  ```
  > User data location: /home/joinmarket/.joinmarket/
  > Would you like to use a two-factor mnemonic recovery phrase? write 'n' if you don't know what this is (y/n): n
  > Not using mnemonic extension
  ```

* Specify a secure passphrase. Wallet file name can be left blank.

  ```
  > Enter new passphrase to encrypt wallet: 
  > Reenter new passphrase to encrypt wallet: 
  > Input wallet file name (default: wallet.jmdat): 
  ```

* Specify `y` to suport fidelity bonds if you plan to provide JoinMarket liquidity and want higher yields given for time-locked funds. More explanation available [here](https://github.com/JoinMarket-Org/joinmarket-clientserver/blob/master/docs/fidelity-bonds.md) and [here](https://github.com/JoinMarket-Org/joinmarket-clientserver/blob/master/docs/fidelity-bonds.md) but 'y' is a good default.

  ```
  > Would you like this wallet to support fidelity bonds? write 'n' if you don't know what this is (y/n): y
  > Write down this wallet recovery mnemonic

  >       < 12 word recovery mnemonic >
  ```

Write down the words and save them; they will allow wallet recovery on a different machine in case of hardware failure or other problem. As with any other mnemonic recovery phrase, keep it secure and secret.

### View the JoinMarket wallet

JoinMarket wallet contains five separate sub-wallets (accounts) or pockets called "mixdepths". The idea is that coins between different mixdepths are never mixed together. When you do a CoinJoin transaction, change output goes back to the same mixdepth, but one of the equal amount outputs goes either to an address of a different wallet (if you are taker) or to a different mixdepth in the same JoinMarket wallet (if you are a maker).

* Run `wallet-tool.py` specifying mixdepth 0 and enter your wallet password [F] to initialize the wallet. 

  ```sh
  (jvmenv) $ ./wallet-tool.py -m 0 wallet.jmdat
  ```
  ```
  > User data location: /home/joinmarket/.joinmarket/
  > Enter wallet decryption passphrase: 
  > 2020-11-30 23:18:30,322 [INFO]  Detected new wallet, performing initial import
  > Use `bitcoin-cli rescanblockchain` if you're recovering an existing wallet from backup seed
  > Otherwise just restart this joinmarket application.
  ```

* As instructed by joinmarket, unless recovering an existing wallet from backup seed, just run the previous command again.

  ```sh
  (jvmenv) $ ./wallet-tool.py -m 0 wallet.jmdat
  ```
  ```
  > User data location: /home/joinmarket/.joinmarket/
  > Enter wallet decryption passphrase: 
  > 2020-11-30 23:19:05,030 [INFO]  Detected new wallet, performing initial import
  > JM wallet
  > mixdepth        0       xpub6CDKnjyTPcNJHuEFWRWtPHa7dHrj63BkEHtK7P12LxwMN4v5V4LN36MpVqPRc5W72Xfwh9rUnmuZVW1QQbnLuAoNA3rkSDULJLL4fdiZkDN
  > external addresses      m/84'/0'/0'/0   xpub6FCe4n1EyN3S7CgyLxz2hegoPnythF7XDiZMEZ1FcqQpoVhyvxhLMT2BVJ7kB5AZAgmBhmauqruguGr6ffoMAzGG2TNh1gas6CWzxpDBHz9
  > m/84'/0'/0'/0/0         bc1q8s5jp8jawmdcj2l3dfl58lpspzphzpxdljj9f5      0.00000000      new
  > m/84'/0'/0'/0/1         bc1qevtwlh9xw8u87qlxfwu9dzw728jatena6rf7za      0.00000000      new
  > m/84'/0'/0'/0/2         bc1q0400y8k5453pfmezuc3gv34dhkslk3qkkyjdhl      0.00000000      new
  > m/84'/0'/0'/0/3         bc1qdfy2gszf2uztm4x5s5ysatd34tvkfe5rn53c5g      0.00000000      new
  > m/84'/0'/0'/0/4         bc1q4wmdjd8g76qr49lc9l9v4scnjtmxhpek9l076p      0.00000000      new
  > m/84'/0'/0'/0/5         bc1qv7ju4jfydnxnz36gecfy675600leyz8klwp2jt      0.00000000      new
  > Balance:        0.00000000
  > internal addresses      m/84'/0'/0'/1
  > Balance:        0.00000000
  > Balance for mixdepth 0: 0.00000000
  > Total balance:  0.00000000
  ```

### Fund your JoinMarket wallet

If you plan to run JoinMarket as a Taker (paying fees to the network to mix coins with `tumbler` or `sendpayment`), read [this](https://github.com/JoinMarket-Org/joinmarket-clientserver/blob/master/docs/SOURCING-COMMITMENTS.md) about how to fund your wallet.

If you plan to run JoinMarket as a Maker, read on about the yield generator.

### Run the yield generator bot

Yield generator is a maker bot that provides liquidity to the JoinMarket, so that others (takers) can make CoinJoin with your funds, potentially paying you a small fee for the service. It is recommended to fund your JoinMarket wallet with at least 0.1 BTC to run the yield generator. The more funds you deposit in the wallet, the better the chance of participating in passive CoinJoin transactions. But don't be reckless! Remember this is a hot wallet, so security is not the same as with a hardware wallet or other cold storage.

For the purposes of running the yield generator, you can simply fund the primary mixdepth 0 external address.

* Read the basics: https://github.com/JoinMarket-Org/joinmarket-clientserver/blob/master/docs/YIELDGENERATOR.md

* Look at the settings at the bottom of (`nano /data/joinmarket/joinmarket.cfg`) and change them if you want to. Defaults should be ok, but you could, for example, lower the CoinJoin maker fee (`cjfee_r`) from 0.002% to 0.001% to capture more taker requests (as some takers opt to lower their fee cap). Or you might even want to reduce your fees to 0 by specifying `ordertype = absoffer` and `cjfee_a = 0`. Note that your fee specs are approximations, as yg-privacyenhanced will randomize them a little bit, for privacy reasons (unless you set fees to 0), in which case it will still randomize your offer size by `size_factor`.

* Run the yield generator

  ```sh
  (jmvenv) $ ./yg-privacyenhanced.py wallet.jmdat
  ```

Since version 0.9.0 JoinMarket has added support for fidelity bonds, which are bitcoins locked into certain address(es) for some time. This is protection against [sybil attacks](https://en.wikipedia.org/wiki/Sybil_attack). Fidelity bonds are not currently required for the makers, but they will increase probability of your yield generator bot to participate in coinjoins. See [JoinMarket fidelity bond documentation](https://github.com/JoinMarket-Org/joinmarket-clientserver/blob/master/docs/fidelity-bonds.md) for more information. Before you fund a fidelity bond, however, you want to be sure you are doing so with anonymous coins and a sweep transaction due to the public nature of the fidelity bond announcement. Perhaps mix with JoinMarket first. :)

### Run yield generator in background (even after ssh to RaspiBolt is closed)

* Exit yield generator and install tmux from the "admin" user. (screen would be another viable option)

  ```
  Ctrl+C
  ```
  ```sh
  $ exit
  $ sudo apt install tmux
  ```

* Start tmux from the "joinmarket" user

  ```sh
  $ sudo su - joinmarket
  $ tmux
  ```

* Start yield generator inside tmux session

  ```sh
  $ . activate.sh
  (jvmenv) $ ./yg-privacyenhanced.py wallet.jmdat
  ```

* Press Ctrl+B and then D to detach from tmux session (it will keep running in a background)

* Later you can attach to that session from "joinmarket" user

  ```sh
  $ tmux a
  ```

* Read more details about using tmux in this guide: https://www.ocf.berkeley.edu/~ckuehl/tmux/

### Sending payments

Note that you cannot use JoinMarket as a taker while yield generator is running with the same wallet. Before sending payments, you should stop yield generator, pressing Ctrl+C in a screen where it is running. You can then make your payment as a taker, and then start yield generator again. If you will try to send a payment while yield generator is running on the same wallet, you will get error that wallet is locked by another process.

Mixing maker and taker roles in a single wallet is actually good for your privacy too.

* See https://github.com/JoinMarket-Org/joinmarket-clientserver/blob/master/docs/USAGE.md#try-out-a-coinjoin-using-sendpaymentpy

### Checking wallet balance and history

* Summary of wallet balances: 
  
  ```sh
  (jvmenv) $ ./wallet-tool.py wallet.jmdat summary
  ```

* Wallet transaction history:

  ```sh
  (jvmenv) $ ./wallet-tool.py wallet.jmdat history -v 4
  ```

### Running the tumbler

Tumbler is a program that does series of CoinJoins with various amounts and timing between them, to completely break the link between different addresses. You can run yield generator to mix your coins slowly +/- fees or you can run tumbler to mix your coins faster while paying fees to the market makers (and miners). See https://github.com/JoinMarket-Org/joinmarket-clientserver/blob/master/docs/tumblerguide.md

### Other notes

Every time you disconnect from the RaspiBolt and connect again, if you are in a fresh session, before running any JoinMarket commands, you need to switch to the joinmarket user and run the activate.sh script created above:

  ```sh
  $ sudo su - joinmarket
  $ . activate.sh
  ```

### Useful links

* [JoinMarket docs](https://github.com/JoinMarket-Org/joinmarket-clientserver/tree/master/docs)
* [JoinMarket guide for RaspiBlitz](https://github.com/openoms/bitcoin-tutorials/blob/master/joinmarket/README.md)
* [Bitcoin privacy wiki](https://en.bitcoin.it/Privacy)

---

## For the future: upgrade JoinMarket

The latest release can be found on the Github page of the JoinMarket project. Make sure to read the Release Notes, as these can include important upgrade information. https://github.com/JoinMarket-Org/joinmarket-clientserver/releases

If upgrading from pre-0.8.0 to a newer versions, note that default wallet type is changed from p2sh-p2wpkh nested segwit (Bitcoin addresses start with 3) to bech32 p2wpkh native segwit (Bitcoin addresses start with bc1). See [native segwit upgrade guide](https://github.com/JoinMarket-Org/joinmarket-clientserver/blob/master/docs/NATIVE-SEGWIT-UPGRADE.md) for details.

If upgrading from pre-0.8.1 to a newer versions, note that yield generator configuration has been moved from the yield generator script (e.g. `yg-privacyenhanced.py`) to a `joinmarket.cfg`, see [0.8.1 release notes](https://github.com/JoinMarket-Org/joinmarket-clientserver/blob/master/docs/release-notes/release-notes-0.8.1.md). Backing up and then recreating a default `joinmarket.cfg` file is always a good idea for a new release; make sure to do it for this release, so that all default values and comments are populated. A couple of new config settings now exist, which you should take note of.

* All this must be done from "joinmarket" user.

  ```sh
  $ sudo su - joinmarket
  ```

* Stop yield generator bot if it is running.

* Remove existing JoinMarket symlink.

  ```sh
  $ cd
  $ unlink joinmarket
  ```

* Download, verify, extract and install the JoinMarket as described in the [Installation](joinmarket.md#installation) section of this guide.

* Rename the existing configuration file, activate jmvenv and run wallet-tool.py to generate a new configuration file.  

  ```sh
  $ mv /data/joinmarket/joinmarket.cfg /data/joinmarket/joinmarket.cfg.old
  $ . activate.sh
  (jvmenv) $ ./wallet-tool.py
  ```
  
* Then customize joinmarket.cfg per the [Configuration](joinmarket.md#configuration) section of this guide.

* Optionally delete old JoinMarket version directory to free up about 200 megabytes.
  
  ```sh
  $ cd
  $ rm -rf joinmarket-clientserver-0.9.11
  ```
