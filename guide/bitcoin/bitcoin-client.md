---
layout: default
title: Bitcoin client
nav_order: 10
parent: Bitcoin
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->
# Bitcoin client
{: .no_toc }

We install [Bitcoin Core](https://bitcoin.org/en/bitcoin-core/){:target="_blank"}, the reference client implementation of the Bitcoin network.

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## This may take some time

Bitcoin Core will download the full Bitcoin blockchain, and validate all transactions since 2009.
We're talking more than 800'000 blocks with a size of over 500 GB, so this is not an easy task.
It's great that the Raspberry Pi 4 can do it, even if it takes a few days, as this was simply not possible with earlier models.

---

## Installation

We download the latest Bitcoin Core binary (the application) and compare this file with the signed and timestamped checksum.
This is a precaution to make sure that this is an official release and not a malicious version trying to steal our money.

### Preparations

* Login as "admin" and change to a temporary directory which is cleared on reboot.

  ```sh
  $ cd /tmp
  ```

* Get the latest download links at [bitcoincore.org/en/download](https://bitcoincore.org/en/download){:target="_blank"} (ARM Linux 64 bit), they change with each update.

  ```sh
  # set up some version variables for easier maintenance later on
  $ VERSION="26.1"

  # download Bitcoin Core binary
  $ wget https://bitcoincore.org/bin/bitcoin-core-$VERSION/bitcoin-$VERSION-aarch64-linux-gnu.tar.gz

  # download the list of cryptographic checksum
  $ wget https://bitcoincore.org/bin/bitcoin-core-$VERSION/SHA256SUMS

  # download the signatures attesting to validity of the checksums
  $ wget https://bitcoincore.org/bin/bitcoin-core-$VERSION/SHA256SUMS.asc
  ```

### Checksum check

* Check that the reference checksum in file `SHA256SUMS` matches the checksum calculated by you (ignore the "lines are improperly formatted" warning)

  ```sh
  $ sha256sum --ignore-missing --check SHA256SUMS
  > bitcoin-26.1-aarch64-linux-gnu.tar.gz: OK
  ```

### Signature check

Bitcoin releases are signed by several individuals, each using their own key. To verify the validity of these signatures, you must first import the corresponding public keys into your GPG key database.

* The next command download and imports automatically all signatures from the [Bitcoin Core release attestations (Guix)](https://github.com/bitcoin-core/guix.sigs) repository

  ```sh
  $ curl -s "https://api.github.com/repositories/355107265/contents/builder-keys" | grep download_url | grep -oE "https://[a-zA-Z0-9./-]+" | while read url; do curl -s "$url" | gpg --import; done
  ```

Expected output:

  ```sh
  > gpg: key 17565732E08E5E41: 29 signatures not checked due to missing keys
  > gpg: /home/admin/.gnupg/trustdb.gpg: trustdb created
  > gpg: key 17565732E08E5E41: public key "Andrew Chow <andrew@achow101.com>" imported
  > gpg: Total number processed: 1
  > gpg:               imported: 1
  > gpg: no ultimately trusted keys found
  [...]
  ```

* Verify that the checksums file is cryptographically signed by the release signing keys.
  The following command prints signature checks for each of the public keys that signed the checksums.

  ```sh
  $ gpg --verify SHA256SUMS.asc
  ```

* Check that at least a few signatures show the following text

  ```sh
  > gpg: Good signature from ...
  > Primary key fingerprint: ...
  ```

### Timestamp check

* The binary checksum file is timestamped on the Bitcoin blockchain via the [OpenTimestamps protocol](https://opentimestamps.org/){:target="_blank"}, proving that the file existed prior to some point in time. Let's verify this timestamp. On your local computer, download the checksums file and its timestamp proof:
  *  https://bitcoincore.org/bin/bitcoin-core-26.1/SHA256SUMS.ots
  *  https://bitcoincore.org/bin/bitcoin-core-26.1/SHA256SUMS
* In your browser, open the [OpenTimestamps website](https://opentimestamps.org/){:target="_blank"}
* In the "Stamp and verify" section, drop or upload the downloaded SHA256SUMS.ots proof file in the dotted box
* In the next box, drop or upload the SHA256SUMS file
* If the timestamps is verified, you should see the following message. The timestamp proves that the checksums file existed on the [release date](https://github.com/bitcoin/bitcoin/releases/tag/v26.1){:target="_blank"} of Bitcoin Core v26.1.

![Bitcoin timestamp check](../../images/bitcoin-ots-check.PNG)

### Installation

* If you're satisfied with the checksum, signature and timestamp checks, extract the Bitcoin Core binaries, install them and check the version.

  ```sh
  $ tar -xvf bitcoin-$VERSION-aarch64-linux-gnu.tar.gz
  $ sudo install -m 0755 -o root -g root -t /usr/local/bin bitcoin-$VERSION/bin/*
  $ bitcoin-cli --version
  > Bitcoin Core RPC client version v26.1.0
  > Copyright (C) 2009-2023 The Bitcoin Core developers
  > [...]
  ```

🔍 *Verifying signed software is important, not only for Bitcoin.
You can read more on [How to securely install Bitcoin](https://medium.com/@lukedashjr/how-to-securely-install-bitcoin-9bfeca7d3b2a){:target="_blank"} by Luke-Jr.*

### Create the bitcoin user

The Bitcoin Core application will run in the background as a daemon and use the separate user “bitcoin” for security reasons.
This user does not have admin rights and cannot change the system configuration.

* Create the user bitcoin

  ```sh
  $ sudo adduser --gecos "" --disabled-password bitcoin
  ```

* Add the user "admin" to the group "bitcoin" as well

  ```sh
  $ sudo adduser admin bitcoin
  ```

* Allow the user "bitcoin" to configure Tor directly by adding it to the "debian-tor" group

  ```sh
  $ sudo adduser bitcoin debian-tor
  ```

### Create data folder

Bitcoin Core uses by default the folder `.bitcoin` in the user's home.
Instead of creating this directory, we create a data directory in the general data location `/data` and link to it.

* Create the Bitcoin data folder

  ```sh
  $ mkdir /data/bitcoin
  $ sudo chown bitcoin:bitcoin /data/bitcoin
  ```

* Switch to user "bitcoin"

  ```sh
  $ sudo su - bitcoin
  ```

* Create the symbolic link `.bitcoin` that points to that directory

  ```sh
  $ ln -s /data/bitcoin /home/bitcoin/.bitcoin
  ```

* Display the link and check that it is not shown in red (this would indicate an error)

  ```sh
  $ ls -la
  ```

### Generate access credentials

For other programs to query Bitcoin Core they need the proper access credentials.
To avoid storing username and password in a configuration file in plaintext, the password is hashed.
This allows Bitcoin Core to accept a password, hash it and compare it to the stored hash, while it is not possible to retrieve the original password.

Another option to get access credentials is through the `.cookie` file in the Bitcoin data directory.
This is created automatically and can be read by all users that are members of the "bitcoin" group.

Bitcoin Core provides a simple Python program to generate the configuration line for the config file.

* In the Bitcoin folder, download the RPCAuth program

  ```sh
  $ cd .bitcoin
  $ wget https://raw.githubusercontent.com/bitcoin/bitcoin/master/share/rpcauth/rpcauth.py
  ```

* Run the script with the Python3 interpreter, providing username (`raspibolt`) and your `password [B]` as arguments.

  🚨 All commands entered are stored in the bash history.
  But we don't want the password to be stored where anyone can find it.
  For this, put a space (` `) in front of the command shown below.

  ```sh
  $  python3 rpcauth.py raspibolt YourPasswordB
  > String to be appended to bitcoin.conf:
  > rpcauth=raspibolt:00d8682ce66c9ef3dd9d0c0a6516b10e$c31da4929b3d0e092ba1b2755834889f888445923ac8fd69d8eb73efe0699afa
  ```

* Copy the `rpcauth` line, we'll need to paste it into the Bitcoin config file.

### Configuration

Now, the configuration file for `bitcoind` needs to be created.
We'll also set the proper access permissions.

* Still as user "bitcoin", open it with Nano and paste the configuration below.
  Replace the whole line starting with "rpcauth=" with the connection string you just generated.
  Save and exit.

  ```sh
  $ nano /home/bitcoin/.bitcoin/bitcoin.conf
  ```

  ```sh
  # RaspiBolt: bitcoind configuration
  # /home/bitcoin/.bitcoin/bitcoin.conf

  # Bitcoin daemon
  server=1
  txindex=1

  # Allow creation of legacy wallets (required for JoinMarket)
  deprecatedrpc=create_bdb

  # Network
  listen=1
  listenonion=1
  proxy=127.0.0.1:9050
  bind=127.0.0.1

  # Activate v2 P2P
  v2transport=1

  # Connections
  rpcauth=<replace with your own auth line generated by rpcauth.py>
  zmqpubrawblock=tcp://127.0.0.1:28332
  zmqpubrawtx=tcp://127.0.0.1:28333
  whitelist=download@127.0.0.1          # for Electrs

  # Raspberry Pi optimizations
  maxconnections=40
  maxuploadtarget=5000

  # Initial block download optimizations
  dbcache=2000
  blocksonly=1
  ```

  🔍 *more: [configuration options](https://en.bitcoin.it/wiki/Running_Bitcoin#Command-line_arguments){:target="_blank"} in Bitcoin Wiki*

* Set permissions: only the user 'bitcoin' and members of the 'bitcoin' group can read it

  ```sh
  $ chmod 640 /home/bitcoin/.bitcoin/bitcoin.conf
  ```

  🔍 *more: [The Chmod Command and Linux File Permissions Explained](https://www.makeuseof.com/tag/chmod-command-linux-file-permissions/){:target="_blank"}

---

## Running bitcoind

Still logged in as user "bitcoin", let's start "bitcoind" manually.

* Start "bitcoind".
  Monitor the log file a few minutes to see if it works fine (it may stop at "dnsseed thread exit", that's ok).

  ```sh
  $ bitcoind
  ```

* Once everything looks ok, stop "bitcoind" with `Ctrl-C`

* Grant the "bitcoin" group read-permission for the debug log file:

  ```sh
  $ chmod g+r /data/bitcoin/debug.log
  ```

* Exit the “bitcoin” user session back to user “admin”

  ```sh
  $ exit
  ```

* Link the Bitcoin data directory from the "admin" user home directory as well.
  This allows "admin" to work with bitcoind directly, for example using the command `bitcoin-cli`

  ```sh
  $ ln -s /data/bitcoin /home/admin/.bitcoin
  ```

### Autostart on boot

The system needs to run the bitcoin daemon automatically in the background, even when nobody is logged in.
We use “systemd“, a daemon that controls the startup process using configuration files.

* Create the configuration file in the Nano text editor and copy the following paragraph.
  Save and exit.

  ```
  $ sudo nano /etc/systemd/system/bitcoind.service
  ```

  ```sh
  # RaspiBolt: systemd unit for bitcoind
  # /etc/systemd/system/bitcoind.service

  [Unit]
  Description=Bitcoin daemon
  After=network.target

  [Service]

  # Service execution
  ###################

  ExecStart=/usr/local/bin/bitcoind -daemon \
                                    -pid=/run/bitcoind/bitcoind.pid \
                                    -conf=/home/bitcoin/.bitcoin/bitcoin.conf \
                                    -datadir=/home/bitcoin/.bitcoin \
                                    -startupnotify="chmod g+r /home/bitcoin/.bitcoin/.cookie"

  # Process management
  ####################
  Type=forking
  PIDFile=/run/bitcoind/bitcoind.pid
  Restart=on-failure
  TimeoutSec=300
  RestartSec=30

  # Directory creation and permissions
  ####################################
  User=bitcoin
  UMask=0027

  # /run/bitcoind
  RuntimeDirectory=bitcoind
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

* Enable the service

  ```sh
  $ sudo systemctl enable bitcoind.service
  ```

* Restart the Raspberry Pi

  ```sh
  $ sudo reboot
  ```

### Verification of bitcoind operations

After rebooting, "bitcoind" should start and begin to sync and validate the Bitcoin blockchain.

* Wait a bit, reconnect via SSH and login with the user “admin”.

* Check the status of the bitcoin daemon that was started by "systemd".
  Exit with `Ctrl-C`

  ```sh
  $ sudo systemctl status bitcoind.service
  > * bitcoind.service - Bitcoin daemon
  >      Loaded: loaded (/etc/systemd/system/bitcoind.service; enabled; vendor preset: enabled)
  >      Active: active (running) since Thu 2021-11-25 22:50:59 GMT; 7s ago
  >     Process: 2316 ExecStart=/usr/local/bin/bitcoind -daemon -pid=/run/bitcoind/bitcoind.pid -conf=/home/bitcoin/.bitcoin/bitcoin.> conf -datadir=/home/bitcoin/.bitcoin (code=exited, status=0/SUCCESS)
  >    Main PID: 2317 (bitcoind)
  >       Tasks: 12 (limit: 4164)
  >         CPU: 7.613s
  >      CGroup: /system.slice/bitcoind.service
  >              `-2317 /usr/local/bin/bitcoind -daemon -pid=/run/bitcoind/bitcoind.pid -conf=/home/bitcoin/.bitcoin/bitcoin.conf > -datadir=/home/bitcoin/.bitcoin
  >
  ```

* Check if the permission cookie can be accessed by the group "bitcoin".
  The output must contain the `-rw-r-----` part, otherwise no application run by a different user can access Bitcoin Core.

  ```sh
  $ ls -la /home/bitcoin/.bitcoin/.cookie
  > -rw-r----- 1 bitcoin bitcoin 75 Dec 17 13:48 /home/bitcoin/.bitcoin/.cookie
  ```

* See "bitcoind" in action by monitoring its log file.
  Exit with `Ctrl-C`

  ```sh
  $ tail -f /home/bitcoin/.bitcoin/debug.log
  ```

* Use the Bitcoin Core client `bitcoin-cli` to get information about the current blockchain

  ```sh
  $ bitcoin-cli getblockchaininfo
  ```

* Please note:
  * When “bitcoind” is still starting, you may get an error message like “verifying blocks”.
    That’s normal, just give it a few minutes.
  * Among other infos, the “verificationprogress” is shown.
    Once this value reaches almost 1 (0.999…), the blockchain is up-to-date and fully validated.

---

## Bitcoin Core is syncing

This can take between one day and a week, depending mostly on your external drive (SSD good, HDD bad; USB3 good, USB2 very bad).
It's best to wait until the synchronization is complete before going ahead.

### Explore bitcoin-cli

If everything is running smoothly, this is the perfect time to familiarize yourself with Bitcoin, the technical aspects of Bitcoin Core and play around with `bitcoin-cli` until the blockchain is up-to-date.

* [**The Little Bitcoin Book**](https://littlebitcoinbook.com){:target="_blank"} is a fantastic introduction to Bitcoin, focusing on the "why" and less on the "how".

* [**Mastering Bitcoin**](https://bitcoinbook.info){:target="_blank"} by Andreas Antonopoulos is a great point to start, especially chapter 3 (ignore the first part how to compile from source code):
  * you definitely need to have a [real copy](https://bitcoinbook.info/){:target="_blank"} of this book!
  * read it online on [Github](https://github.com/bitcoinbook/bitcoinbook){:target="_blank"}

  ![Mastering Bitcoin](../../images/30_mastering_bitcoin_book.jpg){:target="_blank"}

* [**Learning Bitcoin from the Command Line**](https://github.com/ChristopherA/Learning-Bitcoin-from-the-Command-Line/blob/master/README.md){:target="_blank"} by Christopher Allen gives a thorough deep dive into understanding the technical aspects of Bitcoin.

* Also, check out the [bitcoin-cli reference](https://en.bitcoin.it/wiki/Original_Bitcoin_client/API_calls_list){:target="_blank"}

### Reduce 'dbcache' after full sync

Once Bitcoin Core is fully synced, we can reduce the size of the database cache.
A bigger cache speeds up the initial block download, now we want to reduce memory consumption to allow LND and Electrs to run in parallel.
We also now want to enable the node to listen to and relay transactions.

* As user "admin", comment the following lines out (add a `#` at the beginning) in the Bitcoin settings file.
  Bitcoin Core will then just use the default cache size of 300 MB instead of 2 GB.
  Save and exit.

  ```sh
  $ sudo nano /home/bitcoin/.bitcoin/bitcoin.conf
  ```

  ```
  #dbcache=2000
  #blocksonly=1
  ```

* Restart Bitcoin Core for the settings to take effect.

  ```sh
  $ sudo systemctl restart bitcoind
  ```

---

## OpenTimestamps client

When we installed Bitcoin Core, we verified the timestamp of the checksum file using the OpenTimestamp website.

In the future, you will likely need to verify more timestamps, when installing additional programs (_e.g._ LND) and when updating existing programs to a newer version. Rather than relying on a third-party, it would be preferable (and more fun!) to verify the timestamps using your own blockchain data.

Now that Bitcoin Core is running and synced, we can install the [OpenTimestamp client](https://github.com/opentimestamps/opentimestamps-client){:target="_blank"} to locally verify the timestamp of the checksums file.

* With user "admin", globally install the OpenTimestamp dependencies followed by the client

  ```sh
  $ sudo apt-get install python3 python3-dev python3-pip python3-setuptools python3-wheel
  $ sudo pip3 install opentimestamps-client
  ```

* Display the OpenTimestamps client version to check that it is properly installed

  ```sh
  $ ots --version
  ```

---

## For the future: upgrade Bitcoin Core

The latest release can be found on the GitHub page of the Bitcoin Core project:

<https://github.com/bitcoin/bitcoin/releases>

Always read the RELEASE NOTES first!
When upgrading, there might be breaking changes, or changes in the data structure that need special attention.

* There's no need to stop the application.
  Simply install the new version and restart the service.

* Login as "admin" and change to the temporary directory.

  ```sh
  $ cd /tmp
  ```

* Get the latest download links at [bitcoincore.org/en/download](https://bitcoincore.org/en/download){:target="_blank"} (ARM Linux 64 bit), they change with each update. This page tends to lag the Github releases page linked above.

  ```sh
  # set up some version variables for easier maintenance later on
  $ VERSION="26.1"
  # download Bitcoin Core binary, checksums, signature file, and timestamp file
  $ wget https://bitcoincore.org/bin/bitcoin-core-$VERSION/bitcoin-$VERSION-aarch64-linux-gnu.tar.gz
  $ wget https://bitcoincore.org/bin/bitcoin-core-$VERSION/SHA256SUMS
  $ wget https://bitcoincore.org/bin/bitcoin-core-$VERSION/SHA256SUMS.asc
  $ wget https://bitcoincore.org/bin/bitcoin-core-$VERSION/SHA256SUMS.ots
  ```

* Verify the new version against its checksums

  ```sh
  $ sha256sum --ignore-missing --check SHA256SUMS
  > bitcoin-26.1-aarch64-linux-gnu.tar.gz: OK
  ```

* The next command download and imports automatically all signatures from the [Bitcoin Core release attestations (Guix)](https://github.com/bitcoin-core/guix.sigs) repository

  ```sh
  $ curl -s "https://api.github.com/repositories/355107265/contents/builder-keys" | grep download_url | grep -oE "https://[a-zA-Z0-9./-]+" | while read url; do curl -s "$url" | gpg --import; done
  ```

Expected output:

  ```sh
  > gpg: key 17565732E08E5E41: 29 signatures not checked due to missing keys
  > gpg: /home/admin/.gnupg/trustdb.gpg: trustdb created
  > gpg: key 17565732E08E5E41: public key "Andrew Chow <andrew@achow101.com>" imported
  > gpg: Total number processed: 1
  > gpg:               imported: 1
  > gpg: no ultimately trusted keys found
  [...]
  ```

* Verify that the checksums file is cryptographically signed by the release signing keys.
  The following command prints signature checks for each of the public keys that signed the checksums.

  ```sh
  $ gpg --verify SHA256SUMS.asc
  ```

* Check that at least a few signatures show the following text

  ```sh
  > gpg: Good signature from ...
  > Primary key fingerprint: ...
  ```

* Verify the timestamp. If the prompt shows you `-bash: ots: command not found`, ensure that you are installing correctly OTS client in the [proper section](bitcoin-client.md#opentimestamps-client)

  ```sh
  $ ots --no-cache verify SHA256SUMS.ots -f SHA256SUMS
  ```

Expected output:

  ```sh
  > Got 1 attestation(s) from https://btc.calendar.catallaxy.com
  > Got 1 attestation(s) from https://finney.calendar.eternitywall.com
  > Got 1 attestation(s) from https://bob.btc.calendar.opentimestamps.org
  > Got 1 attestation(s) from https://alice.btc.calendar.opentimestamps.org
  > Success! Bitcoin block 836722 attests existence as of 2024-03-29 EET
  ```

Now, just check that the timestamp date is close to the [release](https://github.com/bitcoin/bitcoin/releases) date of the version you're installing.

* If you're satisfied with the checksum, signature and timestamp checks, extract the Bitcoin Core binaries, install them and check the version.

  ```sh
  $ tar -xvf bitcoin-$VERSION-aarch64-linux-gnu.tar.gz
  $ sudo install -m 0755 -o root -g root -t /usr/local/bin bitcoin-$VERSION/bin/*
  ```

* Check the new version

  ```sh
  $ bitcoin-cli --version
  > Bitcoin Core RPC client version v26.1.0
  > Copyright (C) 2009-2023 The Bitcoin Core developers
  > [...]
  ```

* Restart the Bitcoin Core to apply the version change

  ```sh
  $ sudo systemctl restart bitcoind
  ```

<br /><br />

---

Next: [Electrum server >>](electrum-server.md)
