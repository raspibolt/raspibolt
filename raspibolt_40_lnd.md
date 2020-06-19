---
layout: default
title: Lightning
nav_order: 40
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->
# Lightning: LND
{: .no_toc }

We set up LND, the Lightning Network Daemon by [Lightning Labs](https://lightning.engineering/){:target="_blank"}.

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Installation

The installation of LND is straight-forward, but the application is quite powerful and capable of things not explained here. Check out their [Github repository](https://github.com/lightningnetwork/lnd/blob/master/README.md){:target="_blank"} for a wealth of information about their open-source project and Lightning in general.

### Download

Download and install LND

```sh
$ cd /tmp
$ wget https://github.com/lightningnetwork/lnd/releases/download/v0.10.1-beta/lnd-linux-armv7-v0.10.1-beta.tar.gz
$ wget https://github.com/lightningnetwork/lnd/releases/download/v0.10.1-beta/manifest-v0.10.1-beta.txt
$ wget https://github.com/lightningnetwork/lnd/releases/download/v0.10.1-beta/manifest-v0.10.1-beta.txt.sig
$ wget https://keybase.io/roasbeef/pgp_keys.asc

$ sha256sum --check manifest-v0.10.1-beta.txt --ignore-missing
> lnd-linux-armv7-v0.10.1-beta.tar.gz: OK

$ gpg ./pgp_keys.asc
> 9769140D255C759B1EB77B46A96387A57CAAE94D

$ gpg --import ./pgp_keys.asc
$ gpg --verify manifest-v0.10.1-beta.txt.sig
> gpg: Good signature from "Olaoluwa Osuntokun <laolu32@gmail.com>" [unknown]
> Primary key fingerprint: 9769 140D 255C 759B 1EB7  7B46 A963 87A5 7CAA E94D
>      Subkey fingerprint: 4AB7 F8DA 6FAE BB3B 70B1  F903 BC13 F65E 2DC8 4465

$ tar -xzf lnd-linux-armv7-v0.10.1-beta.tar.gz
$ sudo install -m 0755 -o root -g root -t /usr/local/bin lnd-linux-armv7-v0.10.1-beta/*
$ lnd --version
> lnd version 0.10.1-beta commit=v0.10.1-beta
```

<script id="asciicast-DvuCHl1ibT4eursipO0Z53xf5" src="https://asciinema.org/a/DvuCHl1ibT4eursipO0Z53xf5.js" async></script>

### Configuration

Now that LND is installed, we need to configure it to work with Bitcoin Core and run automatically on startup.

* Open a "bitcoin" user session

  ```sh
  $ sudo su - bitcoin
  ```

* Create the LND working directory and the corresponding symbolic link

  ```sh
  $ mkdir /mnt/ext/lnd
  $ ln -s /mnt/ext/lnd /home/bitcoin/.lnd
  $ ls -la
  ```

* Create the LND configuration file and paste the following content (adjust to your alias). Save and exit.

  ```sh
  $ nano /mnt/ext/lnd/lnd.conf
  ```

  ```ini
  # RaspiBolt: lnd configuration
  # /mnt/ext/lnd/lnd.conf

  [Application Options]
  alias=YOUR_FANCY_ALIAS
  debuglevel=info
  maxpendingchannels=5
  listen=localhost

  [Bitcoin]
  bitcoin.active=1
  bitcoin.mainnet=1
  bitcoin.node=bitcoind

  [tor]
  tor.active=true
  tor.v3=true
  tor.streamisolation=true
  ```

🔍 *more: [sample-lnd.conf](https://github.com/lightningnetwork/lnd/blob/master/sample-lnd.conf){:target="_blank"} with all possible options in the LND project repository*

<script id="asciicast-BIhZQuGGoUKtKDsawTpysYa3o" src="https://asciinema.org/a/BIhZQuGGoUKtKDsawTpysYa3o.js" async></script>

---

## Run LND

Again, we switch to the user "bitcoin" and first start LND manually to check if everything works fine.

```sh
$ sudo su - bitcoin
$ lnd
```

The daemon prints the status information directly to the command line.
This means that we cannot use that session without stopping the server. We need to open a second SSH session.

### Wallet setup

Start your SSH program (eg. PuTTY) a second time, connect to the Pi and log in as "admin".
Commands for the **second session** start with the prompt `$2` (which must not be entered).

Once LND is started, the process waits for us to create the integrated Bitcoin wallet (it does not use the "bitcoind" wallet).

* Start a "bitcoin" user session

  ```sh
  $2 sudo su - bitcoin
  ```

* Create the LND wallet

  ```sh
  $2 lncli create
  ```

* If you want to create a new wallet, enter your `password [C]` as wallet password, select `n` regarding an existing seed and enter the optional `password [D]` as seed passphrase. A new cipher seed consisting of 24 words is created.

These 24 words, combined with your passphrase (optional `password [D]`)  is all that you need to restore your Bitcoin wallet and all Lighting channels. The current state of your channels, however, cannot be recreated from this seed, this requires a continuous backup and is still under development for LND.

🚨 This information must be kept secret at all times. **Write these 24 words down manually on a piece of paper and store it in a safe place.** This piece of paper is all an attacker needs to completely empty your wallet! Do not store it on a computer. Do not take a picture with your mobile phone. **This information should never be stored anywhere in digital form.**

* exit "bitcoin" user session

  ```sh
  $2 exit
  ```

<script id="asciicast-xv9Gq3G5Pu5A1Jtxu2bACRvjQ" src="https://asciinema.org/a/xv9Gq3G5Pu5A1Jtxu2bACRvjQ.js" async></script>

💡 _In this screencast I use the awesome [`tmux`](https://www.ocf.berkeley.edu/~ckuehl/tmux/){:target="_blank"} to run multiple Terminal sessions in parallel.
But you can just connect to your RaspiBolt with two separate SSH sessions._

### Authorization for "admin"

Let's authorize the "admin" user to work with LND using the command line interface `lncli`. For that to work, we need to copy the Transport Layer Security (TLS) certificate and the permission files (macaroons) to the admin home folder.

* Check if the TLS certificates and `admin.macaroon` have been created.

  ```sh
  $2 sudo ls -la /mnt/ext/lnd/
  ```

* Check if the permission files `admin.macaroon` has been created.

  ```sh
  $2 sudo ls -la /home/bitcoin/.lnd/data/chain/bitcoin/mainnet/
  ```

* Link the LND data directory in the user "admin" home.
  As a member or the group "bitcoin", admin has read-only access to certain files.
  We also need to make all directories browsable for the group (with `g+X`) and allow it to read the `admin.macaroon`.

  ```sh
  $2 ln -s /mnt/ext/lnd /home/admin/.lnd
  $2 sudo chmod -R g+X /home/admin/.lnd/data/
  $2 sudo chmod g+r /home/admin/.lnd/data/chain/bitcoin/mainnet/admin.macaroon
  ```

* Make sure that `lncli` works by unlocking your wallet (enter `password [C]` ) and getting some node infos.

  ```sh
  $2 lncli unlock
  ```

* Check the current state of LND

  ```sh
  $2 lncli getinfo
  ```

You can also see the progress of the initial sync of LND with Bitcoin in the first SSH session.

Let's stop the server for the moment and focus on our primary SSH session again.

```sh
$2 lncli stop
$2 exit
```

This should terminate LND "gracefully" in SSH session 1 that can now be used interactively again.

<script id="asciicast-o7YMV8E3KAWyVXq3VdzATImYX" src="https://asciinema.org/a/o7YMV8E3KAWyVXq3VdzATImYX.js" async></script>

### Autostart on boot

Now, let's set up LND to start automatically on system startup.

* Exit the "bitcoin" user session back to "admin"

  ```sh
  $ exit
  ```

* Create LND systemd unit with the following content. Save and exit.

  ```sh
  $ sudo nano /etc/systemd/system/lnd.service
  ```

  ```ini
  # RaspiBolt: systemd unit for lnd
  # /etc/systemd/system/lnd.service

  [Unit]
  Description=LND Lightning Network Daemon
  Wants=bitcoind.service
  After=bitcoind.service

  [Service]

  # Service execution
  ###################

  ExecStart=/usr/local/bin/lnd


  # Process management
  ####################

  Type=simple
  Restart=always
  RestartSec=30
  TimeoutSec=240
  LimitNOFILE=128000


  # Directory creation and permissions
  ####################################

  # Run as bitcoin:bitcoin
  User=bitcoin
  Group=bitcoin

  # /run/lightningd
  RuntimeDirectory=lightningd
  RuntimeDirectoryMode=0710


  # Hardening measures
  ####################

  # Provide a private /tmp and /var/tmp.
  PrivateTmp=true

  # Mount /usr, /boot/ and /etc read-only for the process.
  ProtectSystem=full

  # Disallow the process and all of its children to gain
  # new privileges through execve().
  NoNewPrivileges=true

  # Use a new /dev namespace only populated with API pseudo devices
  # such as /dev/null, /dev/zero and /dev/random.
  PrivateDevices=true

  # Deny the creation of writable and executable memory mappings.
  MemoryDenyWriteExecute=true


  [Install]
  WantedBy=multi-user.target
  ```

* Enable, start and unlock LND

  ```sh
  $ sudo systemctl enable lnd
  $ sudo systemctl start lnd
  $ systemctl status lnd
  $ lncli unlock
  ```

* Now, the daemon information is no longer displayed on the command line but written into the system journal. You can monitor the LND startup progress until it caught up with the testnet blockchain (about 1.3m blocks at the moment). This can take up to 2 hours, after that you see a lot of very fast chatter (exit with `Ctrl-C`).

  ```sh
  $ sudo journalctl -f -u lnd
  ```

<script id="asciicast-7Kx4HpX5EfwzYmDXBeqVCszk6" src="https://asciinema.org/a/7Kx4HpX5EfwzYmDXBeqVCszk6.js" async></script>

---

## LND in action

Now your Lightning node is ready.
This is also the point of no return.
Up until now, you can just start over.
Once you send real bitcoin to your RaspiBolt, you have "skin in the game".

* Make sure your RaspiBolt is working as expected.
* Get a little practice with `bitcoin-cli` and its options (see [Bitcoin Core RPC documentation](https://bitcoin-rpc.github.io/){:target="_blank"})
* Try a few restarts (`sudo reboot`), is everything starting fine?

### Funding your Lightning node

* Generate a new Bitcoin address to receive funds on-chain and send a small amount of Bitcoin to it from any wallet of your choice.
  [🕮 `newaddress`](https://api.lightning.community/#newaddress){:target="_blank"}

  ```sh
  $ lncli newaddress np2wkh
  > "address": "3JqmUWMD9mqmdPhMr4sQ9XV7p4o9Cn62CG"
  ```

* Check your LND wallet balance
  [🕮 `walletbalance`](https://api.lightning.community/#walletbalance){:target="_blank"}

  ```sh
  $ lncli walletbalance
  {
      "total_balance": "712345",
      "confirmed_balance": "0",
      "unconfirmed_balance": "712345"
  }
  ```

As soon as your funding transaction is mined, LND will show its amount as "confirmed_balance".

💡 If you want to open a few channels, you might want to send a few transactions.
If you have only one [UTXO](https://bitcoin.org/en/glossary/unspent-transaction-output), you need to wait for the change to return to your wallet after every new channel opening.

<script id="asciicast-8tL55NcHD5zdaHlBJkFbFXaxV" src="https://asciinema.org/a/8tL55NcHD5zdaHlBJkFbFXaxV.js" async></script>

### Opening channels

Although LND features an "autopilot", we manually open some channels.
I recommend to go on [1ML.com](https://1ml.com){:target="_blank"} and look for a mix of big and small nodes with decent Node Ranks.

To connect to a remote node, you need its URI that looks like `<pubkey>@host`:

* the `<pubkey>` is just a long hexadecimal number, like `03abc8abc44453abc7b5b64b4f7b1abcdefb18e102db0abcde4b9cfe93763abcde`
* the `host` can be a domain name, an ip address or a Tor onion address, followed by the port number (usually `:9735`)

Just grab the whole URI above the big QR code and use it as follows:

* **Connect** to the remote node, with the full URI.
  [🕮 `connect`](https://api.lightning.community/#connectpeer){:target="_blank"}

  ```sh
  $ lncli connect 03abc8abc44453abc7b5b64b4f7b1abcdefb18e102db0abcde4b9cfe93763abcde@112.33.44.123:9735
  ```

* **Open a channel** using the `<pubkey>` and the channel capacity in satoshis.
  [🕮 `openchannel`](https://api.lightning.community/#openchannel){:target="_blank"}

  One Bitcoin equals 100 million satoshis, so at $10'000/BTC, $10 amount to 0.001 BTC or 100'000 satoshis.
  To avoid mistakes, you can just use an [online converter](https://www.buybitcoinworldwide.com/satoshi/btc-to-satoshi).

  ```sh
  $ lncli openchannel 03abc8abc44453abc7b5b64b4f7b1abcdefb18e102db0abcde4b9cfe93763abcde 100000 0
  ```

* **Check your funds**, both in the on-chain wallet and the channel balances.
  [🕮 `walletbalance`](https://api.lightning.community/#walletbalance){:target="_blank"}
  [🕮 `channelbalance`](https://api.lightning.community/#channelbalance){:target="_blank"}

  ```sh
  $ lncli walletbalance
  $ lncli channelbalance
  ```

* **List active channels**. Once the channel funding transaction has been mined and gained enough confirmations, your channel is fully operational.
  That can take an hour or more.
  [🕮 `listchannels`](https://api.lightning.community/#listchannels){:target="_blank"}

  ```sh
  $ lncli listchannels
  ```

* **Make a Lightning payment**. These work with invoices, so everytime you buy something or want to send money, you need to get an invoice first.
  To try, why not send me a single satoshi to view my Twitter profile?

  * Click on this paywall link: <https://paywall.link/to/468ad>
  * Click on "Manual Payment Information" and copy the Invoice.
  * Pay me 1 satoshi (~ $0.0001) 🤑

    ```sh
    * lncli payinvoice lnbc10n1pw......................gsj59
    ```

<script id="asciicast-ATudEzl9xUe7wlodVQuVuuUL6" src="https://asciinema.org/a/ATudEzl9xUe7wlodVQuVuuUL6.js" async></script>

### More commands

A quick reference with common commands to play around with:

* list all arguments for the CLI (command line interface)

  ```sh
  $ lncli
  ```

* get help for a specific command

  ```sh
  $ lncli help [COMMAND]
  ```

* Find out some general stats about your node:
  [🕮 `getinfo`](https://api.lightning.community/#getinfo){:target="_blank"}

  ```sh
  $ lncli getinfo
  ```

* Check the peers you are currently connected to:
  [🕮 `listpeers`](https://api.lightning.community/#listpeers){:target="_blank"}

  ```sh
  $ lncli listpeers
  ```

* Check the status of your pending channels:
  [🕮 `pendingchannels`](https://api.lightning.community/#pendingchannels){:target="_blank"}

  ```sh
  $ lncli pendingchannels
  ```

* Check the status of your active channels:
  [🕮 `listchannels`](https://api.lightning.community/#listchannels){:target="_blank"}

  ```sh
  $ lncli listchannels
  ```

* Before paying an invoice, you should decode it to check if the amount and other infos are correct:
  [🕮 `decodepayreq`](https://api.lightning.community/#decodepayreq){:target="_blank"}

  ```sh
  $ lncli decodepayreq [INVOICE]
  ```

* Pay an invoice:

  ```sh
  $ lncli payinvoice [INVOICE]
  ```

* Check the payments that you sent:
  [🕮 `listpayments`](https://api.lightning.community/#listpayments){:target="_blank"}

  ```sh
  $ lncli listpayments
  ```

* Create an invoice:
  [🕮 `addinvoice`](https://api.lightning.community/#addinvoice){:target="_blank"}

  ```sh
  $ lncli addinvoice [AMOUNT_IN_SATOSHIS]
  ```

* List all invoices:
  [🕮 `listinvoices`](https://api.lightning.community/#listinvoices){:target="_blank"}

  ```sh
  $ lncli listinvoices
  ```

* to close a channel, you need the following two arguments that can be determined with `listchannels` and are listed as "channelpoint": `FUNDING_TXID`:`OUTPUT_INDEX`
  [🕮 `closechannel`](https://api.lightning.community/#closechannel){:target="_blank"}

  ```sh
  $ lncli listchannels
  $ lncli closechannel [FUNDING_TXID] [OUTPUT_INDEX]
  ```

* to force close a channel (if your peer is offline or not cooperative), use `--force`

  ```sh
  $ lncli closechannel --force [FUNDING_TXID] [OUTPUT_INDEX]
  ```

🔍 _more: full [LND API reference](https://api.lightning.community/)_

---

## LND upgrade

If you want to upgrade to a new release of LND in the future, check out the FAQ section:
[How to upgrade LND](raspibolt_faq.md#how-to-upgrade-lnd)

---

Next: [Electrum >>](raspibolt_50_electrs.md)
