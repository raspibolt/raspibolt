---
layout: default
title: Electrum server
nav_order: 20
parent: Bitcoin
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->

# Electrum server
{: .no_toc }

We set up [Electrs](https://github.com/romanz/electrs/){:target="_blank"} to serve as a full Electrum server for use with your Bitcoin software or hardware wallets.

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Bitcoin with hardware wallets

The best way to safekeep your bitcoin (meaning the best combination of security and usability) is to use a hardware wallet (like [BitBox](https://shiftcrypto.ch/bitbox02){:target="_blank"}, [Coldcard](https://coldcard.com/){:target="_blank"} , [Ledger](https://www.ledger.com){:target="_blank"} or [Trezor](https://trezor.io){:target="_blank"}) in combination with your own Bitcoin node.
This gives you security, privacy and eliminates the need to trust a third party to verify transactions.

Bitcoin Core on the RaspiBolt itself is not meant to hold funds.

One possibility to use Bitcoin Core with your Bitcoin wallets is to use an Electrum server as middleware.
It imports data from Bitcoin Core and provides it to software wallets supporting the Electrum protocol.
Desktop wallets like [Sparrow](https://sparrowwallet.com/){:target="_blank"}, the [BitBoxApp](https://shiftcrypto.ch/app/){:target="_blank"}, [Electrum](https://electrum.org/){:target="_blank"} or [Specter Desktop](https://specter.solutions/desktop/){:target="_blank"} that support hardware wallets can then be used with your own sovereign Bitcoin node.

---

## Preparations

Make sure that you have [reduced the database cache of Bitcoin Core](bitcoin-client.md#reduce-dbcache-after-full-sync) after full sync.

### Install dependencies

* Install build tools needed to compile Electrs from the source code

  ```sh
  $ sudo apt install cargo clang cmake
  ```

### Firewall & reverse proxy

In the [Security section](../raspberry-pi/security.md), we already set up NGINX as a reverse proxy.
Now we can add the Electrs configuration.

* Enable NGINX reverse proxy to add SSL/TLS encryption to the Electrs communication.
  Create the configuration file and paste the following content

  ```sh
  $ sudo nano /etc/nginx/streams-enabled/electrs-reverse-proxy.conf
  ```

  ```nginx
  upstream electrs {
    server 127.0.0.1:50001;
  }

  server {
    listen 50002 ssl;
    proxy_pass electrs;
  }
  ```

* Test and reload NGINX configuration

  ```sh
  $ sudo nginx -t
  $ sudo systemctl reload nginx
  ```

* Configure the firewall to allow incoming requests

  ```sh
  $ sudo ufw allow 50002/tcp comment 'allow Electrum SSL'
  ```

---

## Electrs

An easy and performant way to run an Electrum server is to use [Electrs](https://github.com/romanz/electrs){:target="_blank"}, the Electrum Server in Rust.
There are no binaries available, so we will compile the application ourselves.

### Build from source code

We get the latest release of the Electrs source code, verify it, compile it to an executable binary and install it.

* Download the source code for the latest Electrs release.
  You can check the [release page](https://github.com/romanz/electrs/releases){:target="_blank"} to see if a newer release is available.
  Other releases might not have been properly tested with the rest of the RaspiBolt configuration, though.

  ```sh
  $ VERSION="0.10.0"
  $ mkdir /home/admin/rust
  $ cd /home/admin/rust
  $ git clone --branch v$VERSION https://github.com/romanz/electrs.git
  $ cd electrs
  ```

* To avoid using bad source code, verify that the release has been properly signed by the main developer [Roman Zeyde](https://github.com/romanz){:target="_blank"}.

  ```sh
  $ curl https://romanzey.de/pgp.txt | gpg --import
  $ git verify-tag v$VERSION
  > gpg: Good signature from "Roman Zeyde <me@romanzey.de>" [unknown]
  > gpg: WARNING: This key is not certified with a trusted signature!
  > gpg:          There is no indication that the signature belongs to the owner.
  > Primary key fingerprint: 15C8 C357 4AE4 F1E2 5F3F  35C5 87CA E5FA 4691 7CBB
  ```

* Now compile the source code into an executable binary and install it.
  The compilation process can take up to one hour.

  ```sh
  $ cargo build --locked --release
  $ sudo install -m 0755 -o root -g root -t /usr/local/bin ./target/release/electrs
  ```

### Configuration

* Create the "electrs" service user, and make it a member of the "bitcoin" group

  ```sh
  $ sudo adduser --disabled-password --gecos "" electrs
  $ sudo adduser electrs bitcoin
  ```

* Create the Electrs data directory

  ```sh
  $ sudo mkdir /data/electrs
  $ sudo chown -R electrs:electrs /data/electrs
  ```

* Switch to the "electrs" user and create the config file with the following content

  ```sh
  $ sudo su - electrs
  $ nano /data/electrs/electrs.conf
  ```

  ```sh
  # RaspiBolt: electrs configuration
  # /data/electrs/electrs.conf

  # Bitcoin Core settings
  network = "bitcoin"
  daemon_dir= "/home/bitcoin/.bitcoin"
  daemon_rpc_addr = "127.0.0.1:8332"
  daemon_p2p_addr = "127.0.0.1:8333"

  # Electrs settings
  electrum_rpc_addr = "127.0.0.1:50001"
  db_dir = "/data/electrs/db"

  # Logging
  log_filters = "INFO"
  timestamp = true
  ```

* Let's start Electrs manually first to check if everything runs as expected.
  It will immediately start with the initial indexing of the Bitcoin blocks.

  ```sh
  $ electrs --conf /data/electrs/electrs.conf
  ```

  ```sh
  Starting electrs 0.10.0 on aarch64 linux with Config { network: Bitcoin, db_path: "/data/electrs/db/bitcoin", daemon_dir: "/home/bitcoin/.bitcoin", daemon_auth: CookieFile("/home/bitcoin/.bitcoin/.cookie"), daemon_rpc_addr: 127.0.0.1:8332, daemon_p2p_addr: 127.0.0.1:8333, electrum_rpc_addr: 127.0.0.1:50001, monitoring_addr: 127.0.0.1:4224, wait_duration: 10s, jsonrpc_timeout: 15s, index_batch_size: 10, index_lookup_limit: Some(1000), reindex_last_blocks: 0, auto_reindex: true, ignore_mempool: false, sync_once: false, disable_electrum_rpc: false, server_banner: "Welcome to electrs 0.10.0 (Electrum Rust Server)!", args: [] }
  [2021-11-09T07:09:42.744Z INFO  electrs::metrics::metrics_impl] serving Prometheus metrics on 127.0.0.1:4224
  [2021-11-09T07:09:42.744Z INFO  electrs::server] serving Electrum RPC on 127.0.0.1:50001
  [2021-11-09T07:09:42.812Z INFO  electrs::db] "/data/electrs/db/bitcoin": 0 SST files, 0 GB, 0 Grows
  [2021-11-09T07:09:43.174Z INFO  electrs::index] indexing 2000 blocks: [1..2000]
  [2021-11-09T07:09:44.665Z INFO  electrs::chain] chain updated: tip=00000000dfd5d65c9d8561b4b8f60a63018fe3933ecb131fb37f905f87da951a, height=2000
  [2021-11-09T07:09:44.986Z INFO  electrs::index] indexing 2000 blocks: [2001..4000]
  [2021-11-09T07:09:46.191Z INFO  electrs::chain] chain updated: tip=00000000922e2aa9e84a474350a3555f49f06061fd49df50a9352f156692a842, height=4000
  [2021-11-09T07:09:46.481Z INFO  electrs::index] indexing 2000 blocks: [4001..6000]
  [2021-11-09T07:09:47.581Z INFO  electrs::chain] chain updated: tip=00000000dbbb79792303bdd1c6c4d7ab9c21bba0667213c2eca955e11230c5a5, height=6000
  ...
  ```

* Stop Electrs with `Ctrl`-`C` and exit the "electrs" user session.

  ```sh
  $ exit
  ```

### Autostart on boot

Electrs needs to start automatically on system boot.

* As user "admin", create the Electrs systemd unit and copy/paste the following configuration. Save and exit.

  ```sh
  $ sudo nano /etc/systemd/system/electrs.service
  ```

  ```sh
  # RaspiBolt: systemd unit for electrs
  # /etc/systemd/system/electrs.service

  [Unit]
  Description=Electrs daemon
  Wants=bitcoind.service
  After=bitcoind.service

  [Service]

  # Service execution
  ###################
  ExecStart=/usr/local/bin/electrs --conf /data/electrs/electrs.conf

  # Process management
  ####################
  Type=simple
  Restart=always
  TimeoutSec=120
  RestartSec=30
  KillMode=process

  # Directory creation and permissions
  ####################################
  User=electrs

  # /run/electrs
  RuntimeDirectory=electrs
  RuntimeDirectoryMode=0710

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

* Enable and start Electrs.

  ```sh
  $ sudo systemctl enable electrs
  $ sudo systemctl start electrs
  ```

* Check the systemd journal to see Electrs' log output.

  ```sh
  $ sudo journalctl -f -u electrs
  ```

  Electrs will now index the whole Bitcoin blockchain so that it can provide all necessary information to wallets.
  With this, the wallets you use no longer need to connect to any third-party server to communicate with the Bitcoin peer-to-peer network.

* Exit the log output with `Ctrl`-`C`

### Remote access over Tor (optional)

To use your Electrum server when you're on the go, you can easily create a Tor hidden service.
This way, you can connect the BitBoxApp or Electrum wallet also remotely, or even share the connection details with friends and family.
Note that the remote device needs to have Tor installed as well.

* Add the following three lines in the section for "location-hidden services" in the `torrc` file.

  ```sh
  $ sudo nano /etc/tor/torrc
  ```

  ```sh
  ############### This section is just for location-hidden services ###
  HiddenServiceDir /var/lib/tor/hidden_service_electrs/
  HiddenServiceVersion 3
  HiddenServicePort 50002 127.0.0.1:50002
  ```

* Reload Tor configuration and get your connection address.

  ```sh
  $ sudo systemctl reload tor
  $ sudo cat /var/lib/tor/hidden_service_electrs/hostname
  > abcdefg..............xyz.onion
  ```

---

💡 Electrs must first fully index the blockchain and compact its database before you can connect to it with your wallets.
This can take a few hours.
Only proceed with the [next section](desktop-wallet.md) once Electrs is ready.

* To check if Electrs is still indexing, you can follow the log output

  ```sh
  $ sudo journalctl -f -u electrs
  ```

---

## For the future: Electrs upgrade

Updating Electrs is straight-forward.
You can display the current version with the command below and check the Electrs [release page](https://github.com/romanz/electrs/releases){:target="_blank"} to see if a newer version is available.

🚨 **Check the release notes!**
Make sure to check the [release notes](https://github.com/romanz/electrs/blob/master/RELEASE-NOTES.md){:target="_blank"} first to understand if there have been any breaking changes or special upgrade procedures.

* Check current Electrs version

  ```sh
  $ electrs --version
  ```

* If a newer release is available, you can upgrade by executing the following commands with user "admin"
* Navigate to the electrs directory

  ```sh
  $ cd /home/admin/rust/electrs
  ```
  
* Clean and update the local source code and show the latest release tag (example: v0.10.0).
  ```sh
  $ git clean -xfd
  $ git fetch
  $ git tag | sort --version-sort | tail -n 1
  > v0.10.0
  ```
  
**Note** that a version appended with '-rc' (for example: v0.10.0-rc.1) refers to a Release Candidate, which is effectively a pre-release of a given version. Where possible it is recommend to choose the formal release. To see more than one recent release modify the git tag command -n argument above and replace 1 with another positive integer (example: git tag | sort --version-sort | tail -n 3). 

* Set the VERSION variable as number from latest release tag and verify developer signature
  ```sh
  $ VERSION="0.10.0"
  $ git verify-tag v$VERSION
  > gpg: Good signature from "Roman Zeyde <me@romanzey.de>" [unknown]
  > [...]
  ```
  
* Check out the release. If you encounter an error about files that would be overwritten use the -f argument to force the checkout
  ```sh
  $ git checkout v$VERSION
  ```
  
* Compile the source code
  ```sh
  $ cargo clean
  $ cargo build --locked --release
  ```
  
* 🚨 When executing the cargo clean command you may receive the following message. If you do, please check the [Update cargo source section](electrum-server.md#Update-cargo-source-(v0.10.0-rc.1-onwards)) of this guide before continuing.
  ```sh
  > error: failed to parse manifest at `/home/admin/rust/electrs/Cargo.toml`
  > Caused by:
      failed to parse the `edition` key
  > Caused by:
      this version of Cargo is older than the `2021` edition, and only  supports `2015` and `2018` editions.
  ```
  
* Back up the old version and update
  ```sh
  $ sudo cp /usr/local/bin/electrs /usr/local/bin/electrs-old
  $ sudo install -m 0755 -o root -g root -t /usr/local/bin ./target/release/electrs
  ```

* Update the Electrs configuration if necessary (see release notes)
  ```sh
  $ nano /data/electrs/electrs.conf
  ```
  
* Restart Electrs
  ```sh
  $ sudo systemctl restart electrs
  ```

---

## Update cargo source (v0.10.0-rc.1 onwards)

Although updating Electrs is normally straight-forward, if you encorntered an error during the upgrade from v0.9.14 to v0.10.0 then it means you will need to upgrade the version of debian from 11 (bullseye) to 12 (bookworm) as the previous version has outdated sources for cargo. If you do not wish to do this then you can always continue to run an older version of electrs.

⚠️ During this process you will be prompted multiple times as the system upgrades the installed packages to either restart services or replace config files. In all instances you should choose "No" as this can adversely effect your ability to remotely connect (SSH) to your node. Or, it may mean that have have to recreate config files in order to have services return to normal functionality. Read the upgrade messages carefully at each stage before continuing.

If you wish to continue, execute the following commands with user "admin".
  
  * Return to the home directory and create a back up folder
  ```sh
  $ cd
  $ mkdir backup
  ```

  * Back up the source.list and any manually added source lists.
  ```sh
  $ sudo cp /etc/apt/sources.list -t ~/backup
  $ sudo cp /etc/apt/sources.list.d/* -t ~/backup
  ```

  * Open up the source.list and replace each instance of 'bullseye' with 'bookworm' also add "non-free-firmware" to the end of each line. Save (`Ctrl`-`o` enter) and exit (`Ctrl`-`x`).
  ```sh
  $ sudo nano /etc/apt/sources.list
  ```
  
  ```
  deb http://deb.debian.org/debian bookworm main contrib non-free non-free-firmware
  deb http://security.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware
  deb http://deb.debian.org/debian bookworm-updates main contrib non-free non-free-firmware
  ```

  * Open up your manually added source lists and replace each instance of 'bullseye' with 'bookworm' throughout. Save (`Ctrl`-`o`, enter) and exit (`Ctrl`-`x`). You may need to save/exit multiple pages.

  ```sh
  $ sudo nano /etc/apt/sources.list.d/*
  ```
  
  * Update, upgrade and then do a dist-upgrade to debian 12 (bookworm)
  ```sh
  $ sudo apt update 
  $ sudo apt upgrade
  $ sudo apt dist-upgrade
  ```

  * Install RocksDB per the [v0.10.0-rc.1 release notes](https://github.com/romanz/electrs/blob/master/RELEASE-NOTES.md#0100-rc1-jun-21-2023).
  ```sh
  $ sudo apt install librocksdb-dev=7.8.3-2
  ```

  * Install the stream module for nginx. This will resolve any issues with restarting the nginx service after the upgrade. When prompted, select "N" to keep the current-installed version of the config files. Then restart the nginx service.
  ```sh
  $ sudo apt update
  $ sudo apt install libnginx-mod-stream
  $ sudo systemctl restart nginx
  ```

   * Update and upgrade to the latest pacakage versions. Again, if prompted to replace any config files select "N" to keep the current versions throughout.
  ```sh
  $ sudo apt update 
  $ sudo apt upgrade
  ```

  * Check your `rustc` and `cargo` versions, they should be >=1.63.0 and >=1.65.0, respectively.
  ```sh
  $ rustc --version
  > rustc 1.63.0
  
  $ cargo --version 
  > cargo 1.65.0
  ```

  * Go back up to the [upgrade section](electrum-server.md#For-the-future--Electrs-upgrade) of this guide (making sure to return to the correct directory) and continue from the `cargo clean` step.


  

<br /><br />

---

Next: [Desktop wallet >>](desktop-wallet.md)
