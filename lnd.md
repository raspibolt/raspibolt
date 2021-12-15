---
layout: default
title: LND
nav_order: 10
parent: Lightning
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->
# Lightning: LND
{: .no_toc }

We set up [LND](https://github.com/lightningnetwork/lnd/blob/master/README.md){:target="_blank"}, the Lightning Network Daemon by [Lightning Labs](https://lightning.engineering/){:target="_blank"}.

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Installation

The installation of LND is straight-forward, but the application is quite powerful and capable of things not explained here. Check out their [GitHub repository](https://github.com/lightningnetwork/lnd/){:target="_blank"} for a wealth of information about their open-source project and Lightning in general.

### Download

We'll download, verify and install LND.

* As user "admin", download the application, checksums and signature

  ```sh
  $ cd /tmp
  $ wget https://github.com/lightningnetwork/lnd/releases/download/v0.14.1-beta/lnd-linux-arm64-v0.14.1-beta.tar.gz
  $ wget https://github.com/lightningnetwork/lnd/releases/download/v0.14.1-beta/manifest-v0.14.1-beta.txt
  $ wget https://github.com/lightningnetwork/lnd/releases/download/v0.14.1-beta/manifest-guggero-v0.14.1-beta.sig
  ```

* You should already have the public key from LND's developer [Oliver Gugger](https://github.com/guggero){:target="_blank"} from the Bitcoin Core installation.
  If not, you can get it now and add it to our GPG keyring

  ```sh
  $ curl https://keybase.io/guggero/pgp_keys.asc | gpg --import
  > ...
  > gpg: key 0x8E4256593F177720: public key "Oliver Gugger <gugger@gmail.com>" imported
  > ...
  ```

* Verify the signature of the text file containing the checksums for the application

  ```sh
  $ gpg --verify manifest-guggero-v0.14.1-beta.sig manifest-v0.14.1-beta.txt
  > gpg: Signature made Wed Nov 24 22:15:46 2021 GMT
  > gpg:                using RSA key F4FC70F07310028424EFC20A8E4256593F177720
  > gpg: Good signature from "Oliver Gugger <gugger@gmail.com>" [unknown]
  > gpg: WARNING: This key is not certified with a trusted signature!
  > gpg:          There is no indication that the signature belongs to the owner.
  > Primary key fingerprint: F4FC 70F0 7310 0284 24EF  C20A 8E42 5659 3F17 7720  ```
  ```

* Verify the signed checksum against the actual checksum of your download

  ```sh
  $ sha256sum --check manifest-v0.14.1-beta.txt --ignore-missing
  > lnd-linux-arm64-v0.14.1-beta.tar.gz: OK
  ```

* Install LND

  ```sh
  $ tar -xzf lnd-linux-arm64-v0.14.1-beta.tar.gz
  $ sudo install -m 0755 -o root -g root -t /usr/local/bin lnd-linux-arm64-v0.14.1-beta/*
  $ lnd --version
  > lnd version 0.14.1-beta commit=v0.14.1-beta
  ```

### Data directory

Now that LND is installed, we need to configure it to work with Bitcoin Core and run automatically on startup.

* Create the "lnd" service user, and add it to the groups "bitcoin" and "debian-tor"

  ```sh
  $ sudo adduser --disabled-password --gecos "" lnd
  $ sudo usermod -a -G bitcoin,debian-tor lnd
  ```

* Add the user "admin" to the group "lnd"

  ```sh
  $ sudo adduser admin lnd
  ```

* Create the LND data directory

  ```sh
  $ sudo mkdir /data/lnd
  $ sudo chown -R lnd:lnd /data/lnd
  ```

* Also create a separate directory for the channel backup.
  Alternatively, you can [mount a USB thumbdrive to this location](https://linuxconfig.org/howto-mount-usb-drive-in-linux){:target="_blank"} for added redundancy.

  ```sh
  $ sudo mkdir /data/lnd-backup
  $ sudo chown -R lnd:lnd /data/lnd-backup
  ```

* Open a "lnd" user session

  ```sh
  $ sudo su - lnd
  ```

* Create symbolic links pointing to the LND and bitcoin data directories

  ```sh
  $ ln -s /data/lnd /home/lnd/.lnd
  $ ln -s /data/bitcoin /home/lnd/.bitcoin
  ```

* Display the links and check that they're not shown in red (this would indicate an error)

  ```sh
  $ ls -la
  ```

### Wallet password

LND includes a Bitcoin wallet that manages your on-chain and Lightning coins.
It is password protected and must be unlocked when LND starts.
This creates the dilemma that you either manually unlock LND after each restart of your Raspberry Pi, or you store the password somewhere on the node.

For this initial setup, we choose the easy route: we store the password in a file that allows LND to unlock the wallet automatically.
This is not the most secure setup, but you can improve it later if you want, with the bonus guides linked below.
To give some perspective: other Lightning implementations like c-lightning or Eclair don't even have a password.

* As user "lnd", create a text file and enter your LND wallet `password [C]`. Save and exit.

  ```sh
  $ nano /data/lnd/password.txt
  ```

* Tighten access privileges and make the file readable only for user "lnd":

  ```sh
  $ chmod 600 /data/lnd/password.txt
  ```

To improve the security of your wallet, check out these more advanced methods:

* Example by LND: [using a password manager with named pipe](https://github.com/lightningnetwork/lnd/blob/master/docs/wallet.md#more-secure-example-with-password-manager-and-using-a-named-pipe){:target="_blank"}
* More to come...

### Configuration

* Create the LND configuration file and paste the following content (adjust to your alias).
  Save and exit.

  ```sh
  $ nano /data/lnd/lnd.conf
  ```

  ```sh
  # RaspiBolt: lnd configuration
  # /data/lnd/lnd.conf

  [Application Options]
  alias=YOUR_FANCY_ALIAS
  debuglevel=info
  maxpendingchannels=5
  listen=localhost
  backupfilepath=/data/lnd-backup/channel.backup

  # Password: automatically unlock wallet with the password in this file
  # -- comment out to manually unlock wallet, and see RaspiBolt guide for more secure options
  wallet-unlock-password-file=/data/lnd/password.txt
  wallet-unlock-allow-create=true

  # Channel settings
  bitcoin.basefee=1000
  bitcoin.feerate=1
  minchansize=100000
  accept-amp=true
  protocol.wumbo-channels=true
  protocol.no-anchors=false
  coop-close-target-confs=24

  # Watchtower
  wtclient.active=true

  # Performance
  gc-canceled-invoices-on-startup=true
  gc-canceled-invoices-on-the-fly=true
  ignore-historical-gossip-filters=1
  sync-freelist=true
  stagger-initial-reconnect=true
  routing.strictgraphpruning=true

  # Database
  [bolt]
  db.bolt.auto-compact=true
  db.bolt.auto-compact-min-age=168h

  [Bitcoin]
  bitcoin.active=1
  bitcoin.mainnet=1
  bitcoin.node=bitcoind

  [tor]
  tor.active=true
  tor.v3=true
  tor.streamisolation=true
  ```

🔍 *This is a standard configuration. Check the official LND [sample-lnd.conf](https://github.com/lightningnetwork/lnd/blob/master/sample-lnd.conf){:target="_blank"} with all possible options, and visit the [Lightning Node Management](https://www.lightningnode.info/){:target="_blank"} site by Openoms to learn more.*

---

## Run LND

Still with user "lnd", we first start LND manually to check if everything works fine.

```sh
$ lnd
```

```
Attempting automatic RPC configuration to bitcoind
Automatically obtained bitcoind's RPC credentials
2021-11-13 08:16:34.985 [INF] LTND: Version: 0.14.1-beta commit=v0.14.1-beta, build=production, logging=default, debuglevel=info
2021-11-13 08:16:34.985 [INF] LTND: Active chain: Bitcoin (network=mainnet)
...
2021-11-13 08:16:35.028 [INF] LTND: Waiting for wallet encryption password. Use `lncli create` to create a wallet, `lncli unlock` to unlock an existing wallet, or `lncli changepassword` to change the password of an existing wallet and unlock it.
```

The daemon prints the status information directly to the command line.
This means that we cannot use that session without stopping the server.
We need to open a second SSH session.

### Wallet setup

Start your SSH program (eg. PuTTY) a second time, connect to the Pi and log in as "admin".
Commands for the **second session** start with the prompt `$2` (which must not be entered).

Once LND is started, the process waits for us to create the integrated Bitcoin wallet.

* Start a "lnd" user session

  ```sh
  $2 sudo su - lnd
  ```

* Create the LND wallet

  ```sh
  $2 lncli create
  ```

* Enter your `password [C]` as wallet password (it must be exactly the same you stored in `password.txt`).
  To create a a new wallet, select `n` when asked if you have an existing cipher seed.
  Just press enter if asked about an additional seed passphrase, unless you know what you're doing.
  A new cipher seed consisting of 24 words is created.

  ```
  Do you have an existing cipher seed mnemonic or extended master root key you want to use?
  Enter 'y' to use an existing cipher seed mnemonic, 'x' to use an extended master root key
  or 'n' to create a new seed (Enter y/x/n): n

  Your cipher seed can optionally be encrypted.
  Input your passphrase if you wish to encrypt it (or press enter to proceed without a cipher seed passphrase):

  Generating fresh cipher seed...

  !!!YOU MUST WRITE DOWN THIS SEED TO BE ABLE TO RESTORE THE WALLET!!!

  ---------------BEGIN LND CIPHER SEED---------------
  1. secret     2. secret    3. secret     4. secret
  ...
  ```

These 24 words (combined with your optional passphrase `password [D]`)  is all that you need to restore the Bitcoin on-chain wallet.
The current state of your channels, however, cannot be recreated from this seed.
For this, the Static Channel Backup stored at `/data/lnd-backup/channel.backup` is updated continuously.

🚨 This information must be kept secret at all times.
* **Write these 24 words down manually on a piece of paper and store it in a safe place.** 
You can use a simple piece of paper, write them on a proper [backup card](https://shiftcrypto.ch/backupcard/backupcard_print.pdf){:target="_blank"}), or even stamp the seed words into metal (see this [DIY guide](https://www.econoalchemist.com/post/backup){:target="_blank"}).
This piece of paper is all an attacker needs to completely empty your on-chain wallet!
Do not store it on a computer.
Do not take a picture with your mobile phone.
**This information should never be stored anywhere in digital form.**

* Exit the user "lnd" user session, and then exit the second SSH session altogether

  ```sh
  $2 exit
  $2 exit
  ```

* Back in your first SSH session with user "lnd", LND is still running.
  Stop LND with `Ctrl-C`.

* Start LND agin and check if the wallet is unlocked automatically.
  On success, stop LND again.

  ```sh
  $ lnd
  >...
  > Started LND Lightning Network Daemon.
  > Attempting automatic RPC configuration to bitcoind
  > Automatically obtained bitcoinds RPC credentials
  > ...
  > LTND: Attempting automatic wallet unlock with password
  > LNWL: Opened wallet
  > ...

  # stop LND with `Ctrl-C`
  ```

### Autostart on boot

Now, let's set up LND to start automatically on system startup.

* Exit the second "lnd" user session back to "admin"

  ```sh
  $ exit
  ```

* Create LND systemd unit with the following content. Save and exit.

  ```sh
  $ sudo nano /etc/systemd/system/lnd.service
  ```

  ```sh
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
  User=lnd

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
  ```

* Now, the daemon information is no longer displayed on the command line but written into the system journal.
  You can check on it using the following command (and exit with `Ctrl-C`).

  ```sh
  $ sudo journalctl -f -u lnd
  ```

### Allow user "admin" to work with LND

We interact with LND using the application `lncli`.
At the moment, only the user "lnd" has the necessary access privileges.
To make the user "admin" the main administrative user, we make sure it can interact with LND as well.

* Newly added groups become active only in a new user session.
  Log out from SSH.

  ```sh
  $ exit
  ```

* Log in as user "admin" again.

* Link the LND data directory in the user "admin" home.
  As a member or the group "lnd", admin has read-only access to certain files.
  We also need to make all directories browsable for the group (with `g+X`) and allow it to read the file `admin.macaroon`

  ```sh
  $ ln -s /data/lnd /home/admin/.lnd
  $ sudo chmod -R g+X /data/lnd/data/
  $ sudo chmod g+r /data/lnd/data/chain/bitcoin/mainnet/admin.macaroon
  ```

* Check if you can use `lncli` by querying LND for information

  ```sh
  $ lncli getinfo
  ```

## LND in action

Now your Lightning node is ready.
This is also the point of no return.
Up until now, you can just start over.
Once you send real bitcoin to your RaspiBolt, you have "skin in the game".

### Funding your Lightning node

* Generate a new Bitcoin address (p2wkh = native SegWit/Bech32) to receive funds on-chain and send a small amount of Bitcoin to it from any wallet of your choice.

  [`newaddress`](https://api.lightning.community/#newaddress){:target="_blank"}

  ```sh
  $ lncli newaddress p2wkh
  > "address": "bc1..."
  ```

* Check your LND wallet balance

  [`walletbalance`](https://api.lightning.community/#walletbalance){:target="_blank"}

  ```sh
  $ lncli walletbalance
  {
      "total_balance": "712345",
      "confirmed_balance": "0",
      "unconfirmed_balance": "712345"
  }
  ```

As soon as your funding transaction is mined (1 confirmation), LND will show its amount as "confirmed_balance".

💡 If you want to open a few channels, you might want to send a few transactions.
If you have only one UTXO, you need to wait for the change to return to your wallet after every new channel opening.


### Opening channels

Although LND features an optional "autopilot", we manually open some channels.

We recommend to go on [Amboss.Space](https://www.amboss.space/){:target="_blank"} or [1ML.com](https://1ml.com){:target="_blank"} and look for a mix of big and small nodes with decent Node Ranks.
Another great way to find peers to collaboratively set up channels is [LightningNetwork+](https://lightningnetwork.plus/){:target="_blank"}.

To connect to a remote node, you need its URI that looks like `<pubkey>@host`:

* the `<pubkey>` is just a long hexadecimal number, like `03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f`
* the `host` can be a domain name, an ip address or a Tor onion address, followed by the port number (usually `:9735`)

Just grab the whole URI above the big QR code and use it as follows (we will use the ACINQ node as an example):

* **Connect** to the remote node, with the full URI.

  [`connect`](https://api.lightning.community/#connectpeer){:target="_blank"}

  ```sh
  $ lncli connect 03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f@34.239.230.56:9735
  ```

* **Open a channel** using the `<pubkey>` and the channel capacity in satoshis.

  [`openchannel`](https://api.lightning.community/#openchannel){:target="_blank"}

  One Bitcoin equals 100 million satoshis, so at $10'000/BTC, $10 amount to 0.001 BTC or 100'000 satoshis.
  To avoid mistakes, you can just use an [online converter](https://www.buybitcoinworldwide.com/satoshi/to-usd/){:target="_blank"}.

  The command as a built-in fee estimator, but to avoid overpaying fees, you can manually control the fees for the funding transaction by using the `sat_per_byte` argument as follows (to select the appropriate fee, in sats/vB, check [mempool.space](https://mempool.space/){:target="_blank"})
  ```sh
  $ lncli openchannel --sat_per_vbyte 8 03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f 100000 0
  ```

* **Check your funds**, both in the on-chain wallet and the channel balances.

  [`walletbalance`](https://api.lightning.community/#walletbalance){:target="_blank"} or [`channelbalance`](https://api.lightning.community/#channelbalance){:target="_blank"}

  ```sh
  $ lncli walletbalance
  $ lncli channelbalance
  ```

* **List active channels**. Once the channel funding transaction has been mined and gained enough confirmations, your channel is fully operational.
  That can take an hour or more.

  [`listchannels`](https://api.lightning.community/#listchannels){:target="_blank"}

  ```sh
  $ lncli listchannels
  ```

* **Make a Lightning payment**. These work with invoices, so everytime you buy something or want to send money, you need to get an invoice first.
  To try, why not send me a single satoshi to view my Twitter profile?

  * Click on this Tippin.me link: <https://tippin.me/@Stadicus3000>
  * Click on "Copy request" to copy the invoice data
  * Pay me 1 satoshi (~ $0.0001) 🤑

    ```sh
    * lncli payinvoice lnbc10n1pw......................gsj59
    ```

### Adding watchtowers

Lightning channels need to be monitored to prevent malicious behavior by your channel peers.
If your RaspiBolt goes down for a longer period of time, for instance due to a hardware problem, a node on the other side of one of your channels might try to close the channel with an earlier channel balance that is better for them.

Watchtowers are other Lightning nodes that can monitor your channels for you.
If they detect such bad behavior, they can react on your behalf, and send a punishing transaction to close this channel.
In this case, all channel funds will be sent to your LND on-chain wallet.

A watchtower can only send such a punishing transaction to your wallet, so you don't have to trust them.
It's good practice to add a few watchtowers, just to be on the safe side.

* With user "LND", add the [Lightning Network+ watchtower](https://lightningnetwork.plus/watchtower){:target="_blank"} as a first example

  ```sh
  $ sudo su - lnd
  $ lncli wtclient add 0301135932e89600b3582513c648d46213dc425c7666e3380faa7dbb51f7e6a3d6@tower4excc3jdaoxcqzbw7gzipoknzqn3dbnw2kfdfhpvvbxagrzmfad.onion:9911
  ```

* Check if the watchtower is active

  ```json
  $ lncli wtclient towers
  {
      "towers": [
          {
              "pubkey": "0301135932e89600b3582513c648d46213dc425c7666e3380faa7dbb51f7e6a3d6",
              "addresses": [
                  "tower4excc3jdaoxcqzbw7gzipoknzqn3dbnw2kfdfhpvvbxagrzmfad.onion:9911"
              ],
              "active_session_candidate": true,
              "num_sessions": 0,
              "sessions": [
              ]
          }
      ]
  }
  ```
* Check out this [list of altruistic public watchtowers](https://github.com/openoms/lightning-node-management/issues/4){:target="_blank"} maintained by Openoms, and add a few more.

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
  [`getinfo`](https://api.lightning.community/#getinfo){:target="_blank"}

  ```sh
  $ lncli getinfo
  ```

* Check the peers you are currently connected to:
  [`listpeers`](https://api.lightning.community/#listpeers){:target="_blank"}

  ```sh
  $ lncli listpeers
  ```

* Check the status of your pending channels:
  [`pendingchannels`](https://api.lightning.community/#pendingchannels){:target="_blank"}

  ```sh
  $ lncli pendingchannels
  ```

* Check the status of your active channels:
  [`listchannels`](https://api.lightning.community/#listchannels){:target="_blank"}

  ```sh
  $ lncli listchannels
  ```

* Before paying an invoice, you should decode it to check if the amount and other infos are correct:
  [`decodepayreq`](https://api.lightning.community/#decodepayreq){:target="_blank"}

  ```sh
  $ lncli decodepayreq [INVOICE]
  ```

* Pay an invoice:

  ```sh
  $ lncli payinvoice [INVOICE]
  ```

* Send a payment to a node without invoice using AMP (both sender and receiver nodes have to have AMP enabled):
  [`sendpayment`](https://api.lightning.community/#sendpayment){:target="_blank"}

  ```sh
  $ lncli sendpayment --amp --fee_limit 1 --dest=<node_pubkey> --final_cltv_delta=144 --amt=<amount_in_sats>
  ```

* Check the payments that you sent:
  [`listpayments`](https://api.lightning.community/#listpayments){:target="_blank"}

  ```sh
  $ lncli listpayments
  ```

* Create an invoice:
  [`addinvoice`](https://api.lightning.community/#addinvoice){:target="_blank"}

  ```sh
  $ lncli addinvoice [AMOUNT_IN_SATOSHIS]
  ```

* List all invoices:
  [`listinvoices`](https://api.lightning.community/#listinvoices){:target="_blank"}

  ```sh
  $ lncli listinvoices
  ```

* to close a channel, you need the following two arguments that can be determined with `listchannels` and are listed as "channelpoint": `FUNDING_TXID`:`OUTPUT_INDEX`

  [`closechannel`](https://api.lightning.community/#closechannel){:target="_blank"}

  ```sh
  $ lncli listchannels
  $ lncli closechannel --sat_per_vbyte <fee> [FUNDING_TXID] [OUTPUT_INDEX]
  ```

* to force close a channel (if your peer is offline or not cooperative), use `--force`

  ```sh
  $ lncli closechannel --force [FUNDING_TXID] [OUTPUT_INDEX]
  ```

🔍 _more: full [LND API reference](https://api.lightning.community/){:target="_blank"}_

---

## Resilience

### Introduction to Static Channel Backup (SCB)

Static Channels Backup is a feature of LND that allows for the onchain recovery of lightning channel balances in the case of a bricked node. Despite its name, it does not allow the recovery of your LN channels but simply increases the chance that you'll recover all (or most) of your offchain (local) balances.  

The SCB contains all the necessary channel information used for the recovery process which is called the Data Loss Protection (DLP). It is a foolproof safe backup mechanism (*i.e.*, there is no risk of penalty transactions being triggered which would result in the entire local). During recovery, the SCB is used by LND to know who were you peers with whom you had channels. LND send all your online peers a request to force close the channel on their end. Without this method, you would need to either contact the peer yourself to ask them to force close the channel or else wait for them to force close on their own, resulting in probably several channels being kept opened for possible weeks or months. If one of these peers themselves have a technical issue and brick their node, then the channel becomes a zombie channel with possibly no chance of ever recovering the funds in it.  

This SCB-based recovery method has several consequences worth bearing in mind:

* It relies on the good will of the peer, *i.e.*, a malicious peer could refuse to force close the channel and the funds would remain in limbo until they do

* If a peer is offline, the request to force close cannot be sent, and therefore the funds in that channel will remain in limbo until this peer comes back online and initiate a force closure (with the additional danger of the peer *never* coming back online and the funds remaining locked in the 2-of-2 multisig forever)

* Since LND uses the SCB to know which peers to send the force closure request, the SCB file has to be updated each time you open a new channel, otherwise you encur the risk of having funds in channels

This is why it is recommended to set up an automatic SCB update mechanism that:

1. Create a new (or update an existing) SCB file each time you open a channel (and close, although this is less important)
1. Save the SCB file in another location than the SSD drive (to ensure that the SCB survive in case of drive failure)

You can read more about SCBs in [this section of 'Mastering the Lighning Network'](https://github.com/lnbook/lnbook/blob/ec806916edd6f4d1b2f9da2fef08684f80acb671/05_node_operations.asciidoc#node-and-channel-backups){:target="_blank"}.

### Automatic SCB on thumbdrive

A simple method is to save the SCB file on a small thumbdrive permanently plugged in the RaspBerry Pi.

#### Thumbdrive size

The `channel.backup` file is very small in size (<<1MB) so even the smallest thumbdrive will do the job.

#### Formatting

* To ensure that the thumbdrive does not contain malicious code, we will format it on our local computer (select a name easy to recognize, *e.g.*, "SCB backup").

  * On Linux, follow [this tutorial](https://phoenixnap.com/kb/linux-format-usb){:target="_blank"}
  
  * On Windows, follow [this tutorial](https://www.techsolutions.support.com/how-to/how-to-format-a-usb-drive-in-windows-12893){:target="_blank"}
  
  * On Mac, follow [this tutorial](https://www.techsolutions.support.com/how-to/how-to-format-a-usb-drive-on-a-mac-12899){:target="_blank"}

* Once formatted, plug it into one of the USB 2.0 (black) port. 

####  Set Up a "mounting Point" for the USB Drive

* Create the mounting directory

  ```sh
  $ sudo mkdir /mnt/thumbdrive
  ```

* List the devices and copy the `UUID` of the thumdrive into a text editor on your local computer (e.g. here `123456`).
  
  ```sh
  $ lsblk -o NAME,MOUNTPOINT,UUID,FSTYPE,SIZE,LABEL,MODEL
  > NAME   MOUNTPOINT UUID                                 FSTYPE   SIZE LABEL      MODEL
  > sda                                                           931.5G            SSD_PLUS_1000GB
  > |-sda1 /boot      DBF3-0E3A                            vfat     256M boot       
  > `-sda2 /          b73b1dc9-6e12-4e68-9d06-1a1892663226 ext4   931.3G rootfs     
  > sdb               123456                               vfat     1.9G SCB backup UDisk
  ```

* Edit the `fstab` file and add the following as a new line at the end, replacing `123456` with your own `UUID`.

  ```sh
  $ sudo nano /etc/fstab
  ```
  
  ```ini
  UUID=123456 /mnt/thumbdrive vfat auto,noexec,nouser,rw,sync,nosuid,nodev,noatime,nodiratime,nofail 0 0
  ```
  
  🔍 *more: [fstab guide](https://www.howtogeek.com/howto/38125/htg-explains-what-is-the-linux-fstab-and-how-does-it-work/){:target="_blank"}*

* Mount the drive and check the file system. Is “/mnt/thumdrive” listed?

  ```sh
  $ sudo mount /dev/sdb
  $ df -h /dev/sdb
  > Filesystem      Size  Used Avail Use% Mounted on
  > /dev/sdb        1.9G  4.0K  1.9G   1% /mnt/thumbdrive
  ```

#### Create a backup SCB file

* Create an empty SCB file in the thumdrive

  ```sh
  $ sudo touch /mnt/thumbdrive/channel.backup
  ```

#### Install inotify-tools

`inotify-tools` allows to use `inotify` (a tool that monitors files and directories) within shell scripts. We'll use it to monitor changes in our node's `channel.backup` (i.e. new updates by LND when a channel is opened or closed).

* Install `inotify-tools`

  ```sh
  $ sudo apt update
  $ sudo apt install inotify-tools
  ```

#### Create script

We create a shell script that uses `inotify` to monitor changes in `channel.backup` and make a copy of it on change.

* Create a new shell script file

  ```sh
  $ cd /tmp
  $ nano thumbdrive-scb-backup.sh
  ```

* Check the following line code and paste them in nano. Save and exit.

  ```sh
  #!/bin/bash
  
  # The script waits for a change in channel.backup. When a change happens (channel opening or closing), a copy of the file is sent to the thumdrive
  
  # Location of the channel.backup file used by LND
  SOURCEFILE=/data/lnd/data/chain/bitcoin/mainnet/channel.backup
  
  # Location of the backup file in the mounted thumbdrive
  BACKUPFILE=/thumb/channel.backup
  
  # Backup function
  run_backup_on_change () {
    echo "Copying backup file..."
    sudo cp $SOURCEFILE $BACKUPFILE
  }

  # Monitoring function
  run () {
    while true; do
        inotifywait $SOURCEFILE
        run_backup_on_change
    done
  }

  run
  ```

* Make the script executable and move it to the standard bin(ary) directory

  ```sh
  $ sudo chmod +x thumbdrive-scb-backup.sh
  $ sudo cp thumbdrive-scb-backup.sh /usr/local/bin
  $ rm thumbdrive-scb-backup.sh
  ```
  
#### Run backup script in background

We'll setup the backup script as a systemd service to run in the background and start automatically on system startup.

* Create a new service file
  
  ```sh
  sudo nano /etc/systemd/system/thumbdrive-scb-backup.service
  ```

* Paste the following lines. Save and exit.

  ```ini
  [Service]
  ExecStart=/usr/local/bin/thumbdrive-scb-backup.sh
  Restart=always
  RestartSec=1
  StandardOutput=syslog
  StandardError=syslog
  SyslogIdentifier=backup-channels
  User=root
  Group=root

  [Install]
  WantedBy=multi-user.target
  ```
  
* Enable and start the service, check its status (it should be 'active')
  
  ```sh
  $ sudo systemctl enable thumbdrive-scb-backup.service
  $ sudo systemctl start thumbdrive-scb-backup.service
  $ sudo systemctl status thumbdrive-scb-backup.service
  ```
  
#### Test

We now cause the `channel.backup` to change and see if a copy gets uploaded to the thumbdrive.

* Open the live logging output of the service
  
  ```sh
  $ sudo journalctl -f -u thumbdrive-scb-backup.service
  ```

* Open a second SSH session (we'll usse $2 to indicate inputs in this second session). Exit the session.
  
  ```sh
  $2 sudo touch /data/lnd/data/chain/bitcoin/mainnet/channel.backup
  $2 exit
  ```
  
* Go back to the first SSH session, in the logs, you should see the following new entries
  ```
  > [...]
  > Dec 15 11:28:55 raspibolt backup-channels[158516]: Copying backup file...
  > Dec 15 11:28:55 raspibolt sudo[158557]:     root : PWD=/ ; USER=root ; COMMAND=/usr/bin/cp /home/admin/.lnd/data/chain/bitcoin/mainnet/channel.backup /mnt/thumbdrive/channel.backup
  > [...]
  ```

* Check the last time the backup file was updated (it should be the same time you did the `touch` command above)
  
  ```sh
  $ cd /mnt/thumbdrive
  $ ls -la
  > -rwxr-xr-x 1 root root 16445 Dec 15 11:28 channel.backup
  ```
  
You're set! Each time you'll open a new channel or close a channel, the backup file in the thumbdrive will be updated.

### (Optional) Automatic SCB to remote location

The thumbdrive-based setup protects the backup from a SSD drive failure. However, it does not protect against a situation where both the SSD drive and USB thumbdrive are destroyed at the same time (*e.g.* fire, food, etc.).  

To protect against this situation, it is necessary to send the backup to a remote location. For example, [this bonus guide](https://raspibolt.org/bonus/lightning/static-backup-dropbox.html) explains how to automatically send the backup to your Dropbox.

---

## For the future: upgrade LND

Upgrading LND can lead to a number of issues.
**Always** read the [LND release notes](https://github.com/lightningnetwork/lnd/releases) completely to understand the changes. These also cover a lot of additional topics and many new features not mentioned here.

* Check your lnd version

  ```sh
  $ lnd --version
  ```

* As "admin" user, stop the LND service
  `$ sudo systemctl stop lnd`

* Download, verify and install the latest LND binaries as described in the [LND section](lnd.md) of this guide.

* Restart the services with the new configuration

  ```sh
  $ sudo systemctl restart lnd
  ```

<br /><br />

---

Next: [Ride The Lightning >>](rtl.md)
