---
layout: default
title: LNBits
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

# Bonus guide: LNBits, a lightning wallet/accounts system
{: .no_toc }

---

[LNBits](https://github.com/lnbits/lnbits-legend){:target="_blank"} is a free and open-source lightning-network wallet/accounts system.

⚠️ _USE WITH CAUTION - LNBits wallet is still in BETA_

Difficulty: Easy
{: .label .label-green }

Status: Tested v3
{: .label .label-green }

![LNBits](../../../images/lnbits.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Preparations

### Install dependencies
* Install necessary dependencies using the apt package manager.

  ```sh
  $ sudo apt install libffi-dev libpq-dev python3-venv
  ```

### Firewall & reverse proxy

* Enable NGINX reverse proxy to route external encrypted HTTPS traffic internally to LNBits.

  ```sh
  $ sudo nano /etc/nginx/streams-enabled/lnbits-reverse-proxy.conf
  ```

  ```nginx
  upstream lnbits {
    server 127.0.0.1:5000;
  }
  server {
    listen 4003 ssl;
    proxy_pass lnbits;
  }
  ```

* Test and reload NGINX configuration.

  ```sh
  $ sudo nginx -t
  $ sudo systemctl reload nginx
  ```

* Configure the firewall to allow incoming HTTPS requests.

  ```sh
  $ sudo ufw allow 4003/tcp comment 'allow LNBits SSL'
  $ sudo ufw status
  ```

---

## LNBits

### Installation

* Create a new user and add it to the "lnd" group.

  ```sh
  $ sudo adduser --disabled-password --gecos "" lnbits
  $ sudo adduser lnbits lnd
  ```

* Create a data directory for LNBits and give ownership to the new user.

  ```sh
  $ sudo mkdir /data/LNBits
  $ sudo chown -R lnbits:lnbits /data/LNBits
  ```

* Open a new "lnbits" user session and create symlinks to the LND and LNBits data directories.

  ```sh
  $ sudo su - lnbits
  $ ln -s /data/lnd /home/lnbits/.lnd
  $ ln -s /data/LNBits /home/lnbits/.LNBits
  ```

* Download the source code directly from GitHub, create a virtual environment, and install all dependencies with pip.

  ```sh
  $ git clone --branch 0.8.0 https://github.com/lnbits/lnbits-legend lnbits
  $ cd lnbits
  $ python3 -m venv venv
  $ ./venv/bin/pip install setuptools wheel --upgrade
  $ ./venv/bin/pip install -r requirements.txt
  $ ./venv/bin/pip install pylightning
  ```

### Configuration

* Create a new configuration file for LNBits and paste the following content. Save and exit.

  ```sh
  $ nano .env
  ```

  ```sh
  # RaspiBolt: LNBits configuration
  # /home/lnbits/lnbits/.env

  LNBITS_FORCE_HTTPS=true
  LNBITS_DATA_FOLDER=/home/lnbits/.LNBits

  LNBITS_BACKEND_WALLET_CLASS=LndRestWallet
  LND_REST_ENDPOINT=127.0.0.1:8080
  LND_REST_CERT=/home/lnbits/.lnd/tls.cert
  LND_REST_ADMIN_MACAROON=/home/lnbits/.lnd/data/chain/bitcoin/mainnet/admin.macaroon
  LND_REST_INVOICE_MACAROON=/home/lnbits/.lnd/data/chain/bitcoin/mainnet/invoice.macaroon
  LND_REST_READ_MACAROON=/home/lnbits/.lnd/data/chain/bitcoin/mainnet/readonly.macaroon
  ```

* Restrict read/write permission.

  ```sh
  $ chmod 600 /home/lnbits/lnbits/.env
  ```


### First start

* Make sure we are in the LNBits app directory and start the application.

  ```sh
  $ cd ~/lnbits
  $ ./venv/bin/uvicorn lnbits.__main__:app --port 5000
  ```

Now point your browser to the secure access point provided by the NGINX web proxy, for example <https://raspibolt.local:4003> (or your node's IP address like <https://192.168.0.20:4003>).

Your browser will display a warning because we use a self-signed SSL certificate. Click on "Advanced" and proceed to the LNBits web interface.

* Stop LNBits in the terminal with `Ctrl`-`C` and exit the "lnbits" user session.

  ```sh
  $ exit
  ```

### Autostart on boot

* As user "admin", create the service file.

  ```sh
  $ sudo nano /etc/systemd/system/lnbits.service
  ```

* Paste the following configuration. Save and exit.

  ```sh
  # RaspiBolt: systemd unit for LNBits
  # /etc/systemd/system/lnbits.service

  Description=lnbits
  Wants=lnd.service
  After=lnd.service

  [Service]
  WorkingDirectory=/home/lnbits/lnbits

  ExecStart=/bin/sh -c 'cd /home/lnbits/lnbits && ./venv/bin/uvicorn lnbits.__main__:app --port 5000'
  User=lnbits
  Restart=always
  TimeoutSec=120
  RestartSec=30
  StandardOutput=journal
  StandardError=journal

  # Hardening measures
  PrivateTmp=true
  ProtectSystem=full
  NoNewPrivileges=true
  PrivateDevices=true

  [Install]
  WantedBy=multi-user.target
  ```

* Enable the service, start it, and check the log output.

  ```sh
  $ sudo systemctl enable lnbits.service
  $ sudo systemctl start lnbits.service
  $ sudo journalctl -f -u lnbits
  ```

* You can now access LNBits from within your local network by browsing to <https://raspibolt.local:4003>{:target="_blank"} (or your equivalent IP address).

### Remote access over Tor (optional)

* Add the following three lines in the "location-hidden services" section in the `torrc` file.
  Save and exit.

  ```sh
  $ sudo nano /etc/tor/torrc
  ```

  ```sh
  ############### This section is just for location-hidden services ###
  HiddenServiceDir /var/lib/tor/hidden_service_lnbits/
  HiddenServiceVersion 3
  HiddenServicePort 443 127.0.0.1:4003
  ```

* Reload Tor configuration and get your connection address.

  ```sh
  $ sudo systemctl reload tor
  $ sudo cat /var/lib/tor/hidden_service_lnbits/hostname
  > abcdefg..............xyz.onion
  ```

* With the [Tor browser](https://www.torproject.org){:target="_blank"}, you can access this onion address from any device.

---

## For the future: LNBits update

Updating to a [new release](https://github.com/lnbits/lnbits-legend/releases){:target="_blank"} is straight-forward, but make sure to check out the release notes first.

* From user "admin", stop the service and open a "lnbits" user session.

  ```sh
  $ sudo systemctl stop lnbits
  $ sudo su - lnbits
  ```

* Fetch the latest GitHub repository information, display the release tags (use the latest `0.8.0` in this example), and update:

  ```sh
  $ cd /home/lnbits/lnbits
  $ git fetch
  $ git reset --hard HEAD
  $ git tag
  $ git checkout 0.8.0
  $ ./venv/bin/pip install -r requirements.txt
  $ exit
  ```

* Start the service again.

  ```sh
  $ sudo systemctl start lnbits
  ```

<br /><br />



---

<< Back: [+ Lightning](index.md)
