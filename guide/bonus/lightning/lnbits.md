---
layout: default
title: LNbits
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

# Bonus guide: LNbits, a lightning wallet/accounts system

{: .no_toc }

---

[LNbits](https://github.com/lnbits/lnbits-legend){:target="_blank"} is a free and open-source lightning-network wallet/accounts system.

⚠️ _USE WITH CAUTION - LNbits wallet is still in BETA_

Difficulty: Easy
{: .label .label-green }

Status: Tested v3
{: .label .label-green }

![LNbits](../../../images/lnbits.png)

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
  $ sudo apt update
  $ sudo apt install software-properties-common
  $ sudo add-apt-repository ppa:deadsnakes/ppa
  $ sudo apt install python3.9 python3.9-distutils
  ```
  
### Firewall & reverse proxy

* Enable NGINX reverse proxy to route external encrypted HTTPS traffic internally to LNbits.

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
  $ sudo ufw allow 4003/tcp comment 'allow LNbits SSL'
  $ sudo ufw status
  ```

---

## LNbits

### Installation

* Create a new user and add it to the "lnd" group.

  ```sh
  $ sudo adduser --disabled-password --gecos "" lnbits
  $ sudo adduser lnbits lnd
  ```

* Create a data directory for LNbits and give ownership to the new user.

  ```sh
  $ sudo mkdir /data/lnbits
  $ sudo chown -R lnbits:lnbits /data/lnbits
  ```

* Open a new "lnbits" user session and create symlinks to the LND and LNbits data directories.

  ```sh
  $ sudo su - lnbits
  $ ln -s /data/lnd /home/lnbits/.lnd
  $ ln -s /data/lnbits /home/lnbits/.lnbits
  ```
  
* Install poetry and update PATH environment variable.

  ```sh
  $ curl -sSL https://install.python-poetry.org | python3 -
  $ export PATH="/home/lnbits/.local/bin:$PATH"
  ```

* Download the source code directly from GitHub, create a virtual environment and install all dependencies.

  ```sh
  $ git clone https://github.com/lnbits/lnbits.git
  $ cd lnbits  
  $ git checkout 0.10.9
  $ poetry env use python3.9
  $ poetry install --only main
  ```

* Only if secp256k1 build fails, run:

  ```sh
  $ poetry add setuptools wheel
  ```

### Configuration

* Create data dir and copy the example configuration file and open it.

  ```sh
  $ cp .env.example .env
  $ nano .env
  ```

* Change the default path of the LNbits data folder

  ```ini
  #LNBITS_DATA_FOLDER="./data"
  LNBITS_DATA_FOLDER="/home/lnbits/.lnbits"
  ```
  
* Choose the colour theme for the webpage, _e.g._ "bitcoin". You can choose among the following options: `autumn`, `bitcoin`, `classic`, `flamingo`, `freedom`, `mint`, `monochrome` and  `salvador`.

![LNbits themes](../../../images/lnbits-themes.PNG)

  ```ini
  LNBITS_THEME_OPTIONS="bitcoin"
  ```

* Select the wallet that you want to use as backend, _e.g._ the LND REST API

  ```ini
  LNBITS_BACKEND_WALLET_CLASS=LndRestWallet
  ```

* Comment out all wallet parameters blocks execpt the one you selected just above, e.g. `LndRestWallet`

  ```ini
  # ClicheWallet
  #CLICHE_ENDPOINT=ws://127.0.0.1:12000
  
  # SparkWallet
  #SPARK_URL=http://localhost:9737/rpc
  #SPARK_TOKEN=myaccesstoken
  
  # CoreLightningWallet
  #CORELIGHTNING_RPC="/home/bob/.lightning/bitcoin/lightning-rpc"
  
  # LnbitsWallet
  #LNBITS_ENDPOINT=https://legend.lnbits.com
  #LNBITS_KEY=LNBITS_ADMIN_KEY
  
  # LndRestWallet
  LND_REST_ENDPOINT=https://127.0.0.1:8080/
  LND_REST_CERT="/home/bob/.config/Zap/lnd/bitcoin/mainnet/wallet-1/data/chain/bitcoin/mainnet/tls.cert"
  LND_REST_MACAROON="/home/bob/.config/Zap/lnd/bitcoin/mainnet/wallet-1/data/chain/bitcoin/mainnet/admin.macaroon or HEXSTRING"
  # To use an AES-encrypted macaroon, set
  # LND_REST_MACAROON_ENCRYPTED="eNcRyPtEdMaCaRoOn"
  
  [...]
  
  # EclairWallet
  #ECLAIR_URL=http://127.0.0.1:8283
  #ECLAIR_PASS=eclairpw
  ```

* Edit the LND REST wallet parameters with the following lines
  
  ```ini
  LND_REST_ENDPOINT=https://127.0.0.1:8080
  LND_REST_CERT="/home/lnbits/.lnd/tls.cert"
  LND_REST_MACAROON="/home/lnbits/.lnd/data/chain/bitcoin/mainnet/admin.macaroon"
  ```

* Save (Ctrl+o) and close (Ctrl+x).

* Restrict read/write permission to the "lnbits" user only.

  ```sh
  $ chmod 600 /home/lnbits/lnbits/.env
  ```

### First start

* Make sure we are in the LNbits app directory and start the application.

  ```sh
  $ cd ~/lnbits
  $ poetry run lnbits --port 5000 --host 0.0.0.0
  ```

Now point your browser to the secure access point provided by the nginx web proxy, for example <https://raspibolt.local:4003> (or your node's IP address like <https://192.168.0.20:4003>).

Your browser will display a warning because we use a self-signed SSL certificate. Click on "Advanced" and proceed to the LNbits web interface.

* Stop LNbits in the terminal with `Ctrl`-`C` and exit the "lnbits" user session.

  ```sh
  $ exit
  ```

### Autostart on boot

* As user "admin", create the service file.

  ```sh
  $ sudo nano /etc/systemd/system/lnbits.service
  ```

* Paste the following configuration. Save (Ctrl+o) and close the file (Ctrl+x) afterwards.

  ```sh
  # RaspiBolt: systemd unit for LNbits
  # /etc/systemd/system/lnbits.service

  [Unit]
  Description=LNbits
  After=lnd.service
  PartOf=lnd.service

  [Service]
  WorkingDirectory=/home/lnbits/lnbits

  ExecStart=/home/lnbits/.local/bin/poetry run lnbits --port 5000 --host 0.0.0.0 --debug --reload
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

* Enable the service, start it, and check the status and log output.

  ```sh
  $ sudo systemctl enable lnbits.service
  $ sudo systemctl start lnbits.service
  $ sudo systemctl status lnbits.service
  $ sudo journalctl -f -u lnbits
  ```

* You can now access LNbits from within your local network by browsing to <https://raspibolt.local:4003>{:target="_blank"} (or your equivalent IP address).

---

### LNbits in action

* Access the LNbits homepage in your browser by browsing to <https://raspibolt.local:4003>{:target="_blank"} (or your equivalent IP address)
* Type a wallet name, _e.g._ "My LNbits wallet #1"
* Click on "ADD NEW WALLET" button. You will land on the wallet homepage:

![LNbits wallet homepage](../../../images/lnbits-wallet-homepage.PNG)

You can fund your wallet and then send or receive lightning payments. You can also enable one or more extensions built by the community.
Below is a list of resources to learn how to use LNbits and the extensions:
* [Awesome LNbits](https://github.com/cryptoteun/awesome-lnbits){:target="_blank"}: a list of resources for the extensions and projects built on LNbits
* [the LNbits Youtube channel](https://www.youtube.com/channel/UCGXU2Ae5x5K-5aKdmKqoLYg){:target="_blank"}
* [the LNbits GitHub channel](https://github.com/lnbits/lnbits)

### Remote access over Tor (optional)

* Add the following three lines in the "location-hidden services" section in the `torrc` file.
  Save and exit.

  ```sh
  $ sudo nano /etc/tor/torrc
  ```

  ```sh
  ############### This section is just for location-hidden services ###
  # Hidden service LNbits
  HiddenServiceDir /var/lib/tor/hidden_service_lnbits/
  HiddenServiceVersion 3
  HiddenServicePort 80 127.0.0.1:5000
  ```

* Reload Tor configuration and get your connection address.

  ```sh
  $ sudo systemctl reload tor
  $ sudo cat /var/lib/tor/hidden_service_lnbits/hostname
  > abcdefg..............xyz.onion
  ```

* With the [Tor browser](https://www.torproject.org){:target="_blank"}, you can access this onion address from any device.

---

## For the future: LNbits update

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
  $ git tag | grep -E "v[0-9]+.[0-9]+.[0-9]+$" | sort --version-sort | tail -n 1
  > 0.10.9
  $ git checkout 0.10.9
  $ poetry install --only main
  $ exit
  ```

* Start the service again.

  ```sh
  $ sudo systemctl start lnbits
  ```

---

## Uninstall

🚨 Warning: Before uninstalling LNbits, you might want to empty all your LNbits wallets.

* Stop and disable the systemd service and then delete the service file
 
  ```sh
  $ sudo systemctl disable lnbits.service
  $ sudo systemctl stop lnbits.service
  $ sudo rm /etc/systemd/system/lnbits.service
  ```

* Display the UFW firewall rules and notes the numbers of the rules for LNbits (e.g., X and Y below)

  ```sh  
  $ sudo ufw status numbered
  > [...]
  > [X] 4003                   ALLOW IN    Anywhere                   # allow LNbits SSL
  > [...]
  > [Y] 4003 (v6)              ALLOW IN    Anywhere (v6)              # allow LNbits SSL
  ```

* Delete the two LNbits rules (check that the rule to be deleted is the correct one and type “y” and “Enter” when prompted)

  ```sh 
  $ sudo ufw delete Y
  $ sudo ufw delete X
  ```

* Delete the nginx reverse proxy configuration file

  ```sh 
  $ sudo rm /etc/nginx/streams-enabled/lnbits-reverse-proxy.conf
  ```

* Test and reload nginx configuration

  ```sh
  $ sudo nginx -t
  > nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
  > nginx: configuration file /etc/nginx/nginx.conf test is successful
  $ sudo systemctl reload nginx
  ```

* Delete the "lnbits" user. Do not worry about the `userdel: mempool mail spool (/var/mail/mempool) not found`.

  ```sh
  $ sudo su -
  $ rm -r /data/lnbits
  $ userdel -r lnbits
  > userdel: lnbits mail spool (/var/mail/lnbits) not found
  $ exit
  ```

<br /><br />

---

<< Back: [+ Lightning](index.md)
