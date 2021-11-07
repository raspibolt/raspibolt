---
layout: default
title: Bitcoin
nav_order: 30
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->
# Bitcoin
{: .no_toc }

Let's get your Bitcoin full node operational.

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Bitcoin Core

The base of a sovereign Bitcoin node is a fully validating Bitcoin client.
We are using [Bitcoin Core](https://bitcoin.org/en/bitcoin-core/){:target="_blank"}, the reference implementation, but not the only option available.
This application will download the whole blockchain from other peers and validate every single transaction that ever happened.
After validation, the client can check all future transactions whether they are valid or not.

The validated blocks are also the base layer for other applications, like Electrs (to use with hardware wallets) or LND (the Lightning Network client).

Be already warned that the downloading and validation of all transactions since 2009, more than 600'000 blocks with a size of over 400 GB, is not an easy task.
It's great that the Raspberry Pi 4 can do it, even if it takes a few days, as this was simply not possible with the Raspberry Pi 3.

---

## Installation

🚨 **Familiarize yourself with signature verification**
An important part of the trust-minimization setup is to verify signatures of software you install.
If you're interested, read through the detailed guide [How to securely install Bitcoin](https://medium.com/@lukedashjr/how-to-securely-install-bitcoin-9bfeca7d3b2a) by Luke-Jr.

We download the latest Bitcoin Core binary (the application) and compare the file with the signed checksum.
This is a precaution to make sure that this is an official release and not a malicious version trying to steal our money.

* Login as "admin" and change to a temporary directory which is cleared on reboot.

  ```sh
  $ cd /tmp
  ```

* Get the latest download links at [bitcoincore.org/en/download](https://bitcoincore.org/en/download){:target="_blank"} (ARM Linux 64 bit), they change with each update.

  ```sh
  # download Bitcoin Core binary
  $ wget https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-arm-linux-gnueabihf.tar.gz

  # download the list of cryptographic checksum
  $ wget https://bitcoincore.org/bin/bitcoin-core-22.0/SHA256SUMS

  # download the signatures attesting to validity of the checksums
  $ wget https://bitcoincore.org/bin/bitcoin-core-22.0/SHA256SUMS.asc
  ```

* Check that the reference checksum in file `SHA256SUMS` matches the checksum calculated by you (ignore the "lines are improperly formatted" warning)

  ```sh
  $ sha256sum --ignore-missing --check SHA256SUMS
  ```

* Bitcoin releases are signed by a number of individuals, each their own key.
  In order to verify the validity of these signatures, you must first import these public keys.
  You can find many developer keys listed in the builder-keys repository, which you can then load into your GPG key database.

  ```sh
  $ wget https://raw.githubusercontent.com/bitcoin/bitcoin/master/contrib/builder-keys/keys.txt
  $ while read fingerprint keyholder_name; do gpg --keyserver hkps://keyserver.ubuntu.com --recv-keys ${fingerprint}; done < ./keys.txt
  ```

* Verify that the checksums file is cryptographically signed by the release signing keys.
  The following command prints signature checks for each of the public keys that signed the checksums.
  Each signature will show the following text:

  ```sh
  $ gpg --verify SHA256SUMS.asc
  # the command above will output a series of signature checks for each of the public keys that signed the checksums
  # each signature will show the following text:
  > gpg: Good signature from ...
  > Primary key fingerprint: ...
  ```

* Extract the Bitcoin Core binaries, install them and check the version.

  ```sh
  $ tar -xvf bitcoin-22.0-arm-linux-gnueabihf.tar.gz
  $ sudo install -m 0755 -o root -g root -t /usr/local/bin bitcoin-22.0/bin/*
  $ bitcoind --version
  > Bitcoin Core version v22.0
  ```

### Prepare data directory

We use the Bitcoin daemon, called `bitcoind`, that runs in the background without user interface.
It stores all data in a the directory `/home/bitcoin/.bitcoin`.
Instead of creating a real directory, we create a link that points to a directory on the external drive.

* Change to user “bitcoin” and add a symbolic link that points to the external drive.

  ```sh
  $ sudo su - bitcoin
  $ ln -s /mnt/ext/bitcoin /home/bitcoin/.bitcoin
  ```

* Navigate to the home directory and check the symbolic link (the target must not be red).
  The content of this directory will actually be on the external drive.

  ```sh
  $ ls -la
  ```

### Generate access credentials

For other programs to query Bitcoin Core they need the proper access credentials.
To avoid storing username and password in a configuration file in plaintext, the password is hashed.
This allows Bitcoin Core to accept a password, hash it and compare it to the stored hash, while it is not possible to retrieve the original password.

Bitcoin Core provides a simple Python program to generate the configuration line for the config file.

* In the Bitcoin folder, download the RPCAuth program

  ```sh
  $ cd ~/.bitcoin
  $ wget https://raw.githubusercontent.com/bitcoin/bitcoin/master/share/rpcauth/rpcauth.py
  ```

* Run the script with the Python3 interpreter, providing username (`raspibolt`) and your `[ Password B ]` as arguments

  ```sh
  $ python3 rpcauth.py raspibolt YourPasswordB
  > String to be appended to bitcoin.conf:
  > rpcauth=raspibolt:00d8682ce66c9ef3dd9d0c0a6516b10e$c31da4929b3d0e092ba1b2755834889f888445923ac8fd69d8eb73efe0699afa
  ```

* Copy the `rpcauth` line, we'll need to paste it into the Bitcoin config file.

### Configuration

Now, the configuration file for bitcoind needs to be created.
Still as user "bitcoin", open it with Nano and paste the configuration below. Save and exit.

```sh
$ nano /mnt/ext/bitcoin/bitcoin.conf
```

```ini
# RaspiBolt: bitcoind configuration
# /mnt/ext/bitcoin/bitcoin.conf

# Bitcoin daemon
server=1
txindex=1

# Network
listen=1
listenonion=1
proxy=127.0.0.1:9050
bind=127.0.0.1

# Connections
rpcauth=<replace with your own auth line generated by rpcauth.py>
zmqpubrawblock=tcp://127.0.0.1:28332
zmqpubrawtx=tcp://127.0.0.1:28333
whitelist=download@127.0.0.1            # for Electrs

# Raspberry Pi optimizations
maxconnections=40
maxuploadtarget=5000

# Initial block download optimizations
dbcache=2000
blocksonly=1
```

🔍 *more: [configuration options](https://en.bitcoin.it/wiki/Running_Bitcoin#Command-line_arguments){:target="_blank"} in Bitcoin Wiki*

---

## Running bitcoind

Still logged in as user "bitcoin", let's start "bitcoind" manually.
Monitor the log file a few minutes to see if it works fine (it may stop at "dnsseed thread exit", that's ok).
Stop "bitcoind" with `Ctrl-C`.

```sh
$ bitcoind
```

### Autostart on boot

The system needs to run the bitcoin daemon automatically in the background, even when nobody is logged in.
We use “systemd“, a daemon that controls the startup process using configuration files.

* Exit the “bitcoin” user session back to user “admin”

  ```sh
  $ exit
  ```

* Create the configuration file in the Nano text editor and copy the following paragraph.
  Save and exit.

  ```sh
  $ sudo nano /etc/systemd/system/bitcoind.service
  ```

  ```ini
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
                                    -conf=/mnt/ext/bitcoin/bitcoin.conf \
                                    -datadir=/mnt/ext/bitcoin


  # Process management
  ####################

  Type=forking
  PIDFile=/run/bitcoind/bitcoind.pid
  Restart=on-failure
  TimeoutSec=300
  RestartSec=30


  # Directory creation and permissions
  ####################################

  # Run as bitcoin:bitcoin
  User=bitcoin
  Group=bitcoin

  # /run/bitcoind
  RuntimeDirectory=bitcoind
  RuntimeDirectoryMode=0710


  # Hardening measures
  ####################

  # Provide a private /tmp and /var/tmp.
  PrivateTmp=true

  # Mount /usr, /boot/ and /etc read-only for the process.
  ProtectSystem=full

  # Deny access to /home, /root and /run/user
  ProtectHome=true

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

* Link the Bitcoin data directory in the user "admin" home.
  As a member or the group "bitcoin", admin has read-only access to certain files.

  ```sh
  $ ln -s /mnt/ext/bitcoin/ /home/admin/.bitcoin
  ```

* Restart the Raspberry Pi

  ```sh
  $ sudo reboot
  ```

### Verification of bitcoind operations

After rebooting, the bitcoind should start and begin to sync and validate the Bitcoin blockchain.

* Wait a bit, reconnect via SSH and login with the user “admin”.

* Check the status of the bitcoin daemon that was started by systemd (exit with `Ctrl-C`)

  ```sh
  $ systemctl status bitcoind.service
  ```

* See bitcoind in action by monitoring its log file (exit with `Ctrl-C`)

  ```sh
  $ sudo tail -f /mnt/ext/bitcoin/debug.log
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

🚨 **Please let Bitcoin Core sync fully before proceeding.**

This can take between one day and a week, depending mostly on your external drive (SSD good, HDD bad; USB3 good, USB2 bad).

### Explore bitcoin-cli

If everything is running smoothly, this is the perfect time to familiarize yourself with Bitcoin, the technical aspects of Bitcoin Core and play around with `bitcoin-cli` until the blockchain is up-to-date.

* [**The Little Bitcoin Book**](https://littlebitcoinbook.com){:target="_blank"} is a fantastic introduction to Bitcoin, focusing on the "why" and less on the "how".

* [**Mastering Bitcoin**](https://bitcoinbook.info){:target="_blank"} by Andreas Antonopoulos is a great point to start, especially chapter 3 (ignore the first part how to compile from source code):
  * you definitely need to have a [real copy](https://bitcoinbook.info/){:target="_blank"} of this book!
  * read it online on [Github](https://github.com/bitcoinbook/bitcoinbook){:target="_blank"}

  ![Mastering Bitcoin](images/30_mastering_bitcoin_book.jpg){:target="_blank"}

* [**Learning Bitcoin from the Command Line**](https://github.com/ChristopherA/Learning-Bitcoin-from-the-Command-Line/blob/master/README.md){:target="_blank"} by Christopher Allen gives a thorough deep dive into understanding the technical aspects of Bitcoin.

* Also, check out the [bitcoin-cli reference](https://en.bitcoin.it/wiki/Original_Bitcoin_client/API_calls_list){:target="_blank"}

---

## Reduce 'dbcache' after full sync

Once Bitcoin Core is fully synced, we can reduce the size of the database cache.
A bigger cache speeds up the initial block download, now we want to reduce memory consumption to allow LND and Electrs to run in parallel.
We also now want to enable the node to listen to and relay transactions.

* As user "admin", comment the following lines out (add a `#` at the beginning) in the Bitcoin settings file.
  Bitcoin Core will then just use the default of 300 MB instead of 2 GB.
  Save and exit.

  ```sh
  $ sudo nano /mnt/ext/bitcoin/bitcoin.conf
  ```

  ```ini
  #dbcache=2000
  #blocksonly=1
  ```

* Restart Bitcoin Core for the settings to take effect.

  ```sh
  $ sudo systemctl restart bitcoind
  ```

---

## Bitcoin Core upgrade

If you want to upgrade to a new release of Bitcoin Core in the future, check out the FAQ section:
[How to upgrade Bitcoin Core](raspibolt_faq.md#how-to-upgrade-bitcoin-core)

---

Next: [Lightning >>](raspibolt_40_lnd.md)
