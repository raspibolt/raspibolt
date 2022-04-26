---
layout: default
title: ThunderHub
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---
# Bonus Guide: Install ThunderHub
{: .no_toc }

---

[ThunderHub](https://github.com/apotdevin/thunderhub){:target="_blank"} is an open source LND node manager where you can manage and monitor your node on any device or browser. It allows you to take control of the lightning network with a simple and intuitive UX and the most up-to-date tech stack.

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

## Preparations

### Check Node.js

* Node.js v16 should have been installed for the BTC RPC Explorer and RTL. We can check our version of Node.js with user "admin": 
  
  ```sh
  $ node -v
  > v16.14.2
  ```
* If the version is v14.15 or above, you can move to the next section. If Node.js is not installed, follow [this guide](https://raspibolt.org/guide/bitcoin/blockchain-explorer.html#install-nodejs){:target="_blank"} to install it.

### Firewall & Reverse Proxy

* Configure firewall to allow incoming HTTP requests from your local network to the web server.

  ```sh
  $ sudo ufw allow from 192.168.0.0/16 to any port 4002 comment 'allow ThunderHub from local network'
  $ sudo ufw reload
  $ sudo ufw status
  ```
* Enable NGINX reverse proxy to route external encrypted HTTPS traffic internally to Thunderhub

  ```sh
  $ sudo nano /etc/nginx/streams-enabled/thunderhub-reverse-proxy.conf
  ```
  ```nginx
  upstream thunderhub {
    server 127.0.0.1:3010;
  }
  server {
    listen 4002 ssl;
    proxy_pass thunderhub;
  }
  ```
* Test and reload NGINX configuration
  ```sh
  $ sudo nginx -t
  $ sudo systemctl reload nginx
  ```
  
---

## ThunderHub

### Installation

We do not want to run Thunderhub code alongside `bitcoind` and `lnd` because of security reasons.
For that we will create a separate user and we will be running the code as the new user.
We are going to install Thunderhub in the home directory since it doesn't need too much space.

* Create a new "thunderhub" user. The new user needs read-only access to the `tls.cert` and our `admin.macaroon`, 
  so we add him to the "lnd" group. Open a new session.

  ```sh
  $ sudo adduser --disabled-password --gecos "" thunderhub
  $ sudo adduser thunderhub lnd
  $ sudo cp /data/lnd/data/chain/bitcoin/mainnet/admin.macaroon /home/thunderhub/admin.macaroon
  $ sudo chown thunderhub:thunderhub /home/thunderhub/admin.macaroon
  $ sudo su - thunderhub
  ```

* Download the source code directly from GitHub and install all dependencies using NPM.

  ```sh
  $ git clone https://github.com/apotdevin/thunderhub.git
  $ cd thunderhub
  $ npm install
  $ npm run build
  ```

### Configuration

* Still with user "thunderhub", create a symbolic link pointing to your lnd data directory.
  Check if the link is working. If nothing is displayed in red you are good to go.

  ```sh
  $ ln -s /data/lnd /home/thunderhub/.lnd
  $ ls -la
  ```

* Copy and open the configuration file

  ```sh
  $ cd ~/thunderhub
  $ cp .env .env.local
  $ nano .env.local
  ```


* Edit the following lines, save and exit:

  ```ini
  # -----------
  # Server Configs
  # -----------
  LOG_LEVEL='debug'
  TOR_PROXY_SERVER=socks://127.0.0.1:9050
  NODE_ENV=production
  PORT=3010

  # -----------
  # Interface Configs
  # -----------
  THEME='dark'

  # -----------
  # Account Configs
  # -----------
  ACCOUNT_CONFIG_PATH='/home/thunderhub/thunderhub/thubConfig.yaml'
  ```

* If not already done, change your directory and edit your `thubConfig.yaml`. Change your `accountpassword`.

  ```sh
  $ cd ~/thunderhub
  $ nano thubConfig.yaml 
  ```
  ```ini
  masterPassword: 'PASSWORD' # Default password unless defined in account
  accounts:
    - name: 'RaspiBolt'
      serverUrl: '127.0.0.1:10009'
      macaroonPath: '/home/thunderhub/admin.macaroon'
      certificatePath: '/home/thunderhub/.lnd/tls.cert'
      password: 'accountpassword'
  ```

---

## First Start

Test starting Thunderhub manually first to make sure it works.

* Let's do a first start to make sure it's running as expected.
  Make sure we are in the Thunderhub directory and start the web server.

 ```sh
  $ cd ~/thunderhub
  $ npm run start
  ```

* Now point your browser to `https://raspibolt.local:4002` (or whatever you chose as hostname) or the ip address (e.g. `https://192.168.0.20:4002`).
  You should see the home page of ThunderHub.

* Stop ThunderHub in the terminal with `Ctrl`-`C` and exit the "thunderhub" user session.

  ```sh
  $ exit
  ```

---

## Autostart on boot

Now we'll make sure ThunderHub starts as a service on the Raspberry Pi so it's always running.
In order to do that we create a systemd unit that starts the service on boot directly after LND.

* As user "admin", create the service file.

  ```sh
  $ sudo nano /etc/systemd/system/thunderhub.service
  ```

* Paste the following configuration. Save and exit.

  ```ini
  # RaspiBolt: systemd unit for Thunderhub
  # /etc/systemd/system/thunderhub.service

  [Unit]
  Description=Thunderhub
  Wants=lnd.service
  After=network.target lnd.service

  [Service]
  WorkingDirectory=/home/thunderhub/thunderhub
  ExecStart=/usr/bin/npm run start
  User=thunderhub
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
  $ sudo systemctl enable thunderhub.service
  $ sudo systemctl start thunderhub.service
  $ sudo journalctl -f -u thunderhub
  ```

* You can now access ThunderHub from within your local network by browsing to <https://raspibolt.local:4002> (or your equivalent ip address).

---

## Remote access over Tor (optional)

Do you want to access ThunderHub remotely?
You can easily do so by adding a Tor hidden service on the RaspiBolt and accessing ThunderHub with the Tor browser from any device.

* Add the following three lines in the section for "location-hidden services" in the `torrc` file.
  Save and exit.

 ```sh
  $ sudo nano /etc/tor/torrc
  ```

  ```ini
  HiddenServiceDir /var/lib/tor/thunderhub
  HiddenServiceVersion 3
  HiddenServicePort 80 127.0.0.1:3010
  ```

* Restart Tor and get your connection address.

  ```sh
  $ sudo systemctl restart tor
  $ sudo cat /var/lib/tor/thunderhub/hostname
  > abcdefg..............xyz.onion
  ```

* With the [Tor browser](https://www.torproject.org), you can access this onion address from any device.
  Please be aware that this access is not password protected and should not be shared widely.

**Congratulations!**
You now have Thunderhub up and running.

---

## Upgrade

Updating to a [new release](https://github.com/apotdevin/thunderhub/releases) should be straight-forward.

* From user "admin", stop the service and open a "thunderhub" user session.

  ```sh
  $ sudo systemctl stop thunderhub
  $ sudo su - thunderhub
  ```

* Run the update command provided within the package:

  ```sh
  $ cd ~/thunderhub
  $ npm run update
  $ exit
  ```

* Start the service again.

  ```sh
  $ sudo systemctl start thunderhub
  ```
  
  <br /><br />
  
---

## Uninstall

* Remove user `thunderhub` entirely with

  ```sh
  $ sudo deluser -r thunderhub
  ```
* Remove Tor hidden service from `/etc/tor/torrc` and `sudo systemctl reload tor`

<<Back: [+ Lightning](index.md)
