---
layout: default
title: nosrt-wallet-connect-lnd
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

# Bonus Guide: Install nostr-wallet-connect-lnd

{: .no_toc }

---

[nostr-wallet-connect](https://github.com/benthecarman/nostr-wallet-connect-lnd){:target="_blank"} is an open source tool to allow seamless and instant zapping from your own LND node by using nostr clients that support [Nostr Wallet Connect](https://github.com/nostr-protocol/nips/blob/master/47.md).


---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Preparations

### Check cargo

* cargo should have already been installed during the electrs process . We can check the version of cargo with user "admin". Once verified, we will install cargo and system dependancies before proceeding with the installation.
  
  ```sh
  $ cargo -V
  > cargo 1.66.1
  $ sudo apt update
  $ sudo apt install pkg-config
  $ sudo apt install libssl-dev
  ```

---

## Installation

We do not want to run nostr-wallet-connect-lnd code alongside `lnd` for security purposes.
Therefore, we will create a separate user and we will be running the application as the new user.
We are going to install nostr-wallet-connect-lnd in it's home directoy, but we'll store the settings file in the /data/ directory.

* Create a new "nwc" user. The new user needs read-only access to the `tls.cert` and our `admin.macaroon`, so we add it to the "lnd" group.

  ```sh
  $ sudo adduser --disabled-password --gecos "" nwc
  $ sudo adduser nwc lnd
  $ sudo mkdir /data/nwc
  $ sudo chown -R nwc:nwc /data/nwc
  $ sudo cp /data/lnd/data/chain/bitcoin/mainnet/admin.macaroon /home/nwc/admin.macaroon
  $ sudo chown nwc:nwc /home/nwc/admin.macaroon
  ```

* Now let's switch over to the nwc account and begin insatllation of nostr-wallet-connect-lnd.

  ```sh
  $ sudo su - nwc
  ```

* Create an LND and NWC symlink so that we can access tls.cert and store the nostr-wallet-connect-lnd settings file.
  
  ```sh
  $ ln -s /data/lnd /home/nwc/.lnd
  $ ln -s /data/nwc /home/nwc/.nwc
  ```

  ```sh
  $ git clone https://github.com/benthecarman/nostr-wallet-connect-lnd.git
  $ cd nostr-wallet-connect-lnd
  $ cargo build --release
  $ cargo install --path .
  ```


---

## Testing nostr-wallet-connect-lnd

* Test starting nostr-wallet-connect-lnd manually first to make sure it works.

  ```sh
  $ export PATH=$PATH:/home/nwc/.cargo/bin
  $ nostr-wallet-connect-lnd --relay wss://relay.damus.io --lnd-host localhost --lnd-port 10009 --macaroon-file /home/nwc/admin.macaroon --cert-file /home/nwc/.lnd/tls.cert --keys-file /home/nwc/.nwc/keys.json
  ```

* You may change the relay above to a different relay if you prefer.
* You will now need to configure your nostr client to use your NWC installation. Each nostr client is different. In this example, we're using [Snort](https://snort.social).
* Choose the Nostr Wallet Connect option.
  
![Snort Wallet Picker](https://raw.githubusercontent.com/derekross/raspibolt/master/images/nwc-snort-1.png)

  
![Snort NWC Setup](https://raw.githubusercontent.com/derekross/raspibolt/master/images/nwc-snort-2.png)
* Copy the wallet connect pubkey and the wallet connect secret from the terminal window output and paste it into the input field in your Nostr client.
* You may also configure a daily limit by adding the following paramters to the end of the string above: --daily-limit <amount of satoshis> (eg. --daily-limit 10000). This limits you to Zapping only 10,000 sats per day from your node. This is not required, but is a safeguard feature.
* Stop nostr-wallet-connect-lnd in the terminal with `Ctrl`-`C` and exit the "nwc" user session.

  ```sh
  $ exit
  ```

---

## Autostart on boot

Now we'll make sure nostr-wallet-connect-lnd starts as a service on the Raspberry Pi so it's always running.
In order to do that we create a systemd unit that starts the service on boot directly after LND.

* As user "admin", create the service file.

  ```sh
  $ sudo nano /etc/systemd/system/nwc.service
  ```

* Paste the following configuration. Save and exit.
* Please note: If you modified the relay or the daily spending limits in your testing above, you'll want to modify the same paramters below before saving.

  ```ini
  # RaspiBolt: systemd unit for nostr-wallet-connect-lnd
  # /etc/systemd/system/nwc.service

  [Unit]
  [Unit]
  Description=NWC
  Wants=lnd.service
  After=network.target lnd.service

  [Service]
  WorkingDirectory=/home/nwc/.nwc
  ExecStart=/home/nwc/.cargo/bin/nostr-wallet-connect-lnd --relay wss://relay.damus.io --lnd-host localhost --lnd-port 10009 --macaroon-file /home/nwc/admin.macaroon --cert-file /home/nwc/.lnd/tls.cert --keys-file home/nwc/.nwc/keys.json --daily-limit 10000
  User=nwc
  Restart=always
  TimeoutSec=120
  RestartSec=30
  StandardOutput=null
  StandardError=journal

  [Install]
  WantedBy=multi-user.target
  ```

* Enable the service, start it and check log logging output.

  ```sh
  $ sudo systemctl enable nwc.service
  $ sudo systemctl start nwc.service
  $ sudo journalctl -f -u nwc
  ```

* You can now access use your favorite nostr client to perform zaps directly and instantly from your own node.


---

## Upgrade

Updating to a [new release](https://github.com/benthecarman/nostr-wallet-connect-lnd) should be straight-forward. You will need to watch the GitHub for new commits and updates as this project does not have an official releases page.

* From user "admin", stop the service and open a "nwc" user session.

  ```sh
  $ sudo systemctl stop nwc
  $ sudo su - nwc
  ```

* Run the update command provided within the package:

  ```sh
  $ cd nostr-wallet-connect-lnd
  $ git pull
  $ cargo build --release
  $ cargo install --path .
  $ exit
  ```

* Start the service again.

  ```sh
  $ sudo systemctl start nwc
  ```

---

## Uninstall

### Uninstall the service

* Stop, disable and delete the nwc systemd service

   ```sh
  $ sudo systemctl stop nwc
  $ sudo systemctl disable nwc
  $ sudo rm /etc/systemd/system/nwc.service
  ```

### Uninstall nostr-wallet-connect-lnd

* Delete the "nwc" user. It might take a long time as the nwc user directory is big. Do not worry about the `userdel: nwc mail spool (/var/mail/nwc) not found`.

  ```sh
  $ sudo su -
  $ userdel -r nwc
  > userdel: nwc mail spool (/var/mail/nwc) not found
  ```


---
  
<br /><br />

<<Back: [+ Lightning](index.md)
