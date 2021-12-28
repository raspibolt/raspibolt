---
layout: default
title: Lightning Terminal
nav_order: 14
parent: Lightning
---

# Bonus guide: Lightning Terminal
{: .no_toc }

---

We install [Lightning Terminal](https://github.com/lightninglabs/lightning-terminal){:target="_blank"}, a browser-based interface for managing channel liquidity.

![lightning-terminal](../../images/lightning-terminal.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Introduction

Lightning Terminal, developped by Lighining Labs, aims at providing additional tools for operators to manage their node and channel balances. Below is a summary of Lighting Terminal's features:

* Visualize your channel balances in a web GUI
* Run a single daemon (`litd`) that integrates the Loop (`loopd`), Pool (`poold`) and Faraday (`faraday`) daemons
* Loop client (`loop`): Perform submarine swaps with the LOOP node using the CLI or web GUI
* Pool client (`pool`): Buy and sell inbound liquidity using the peer-to-peer auction-based Pool exchange using the CLI or web GUI 
* Faraday client (`frcli`): Run the Faraday daemon on your node that provides a CLI-based LN node accounting service

Because Pool is alpha software, Lightning Terminal is alpha software too.  

---

## Installation

### Download Lightning Terminal

* With the "admin" user, download the latest arm64 binary and its checksum and verify the integrity of the binary

  ```sh
  $ cd /tmp
  $ wget https://github.com/lightninglabs/lightning-terminal/releases/download/v0.6.1-alpha/lightning-terminal-linux-arm64-v0.6.1-alpha.tar.gz
  $ wget https://github.com/lightninglabs/lightning-terminal/releases/download/v0.6.1-alpha/manifest-v0.6.1-alpha.txt
  $ sha256sum --check manifest-v0.6.1-alpha.txt --ignore-missing
  > lightning-terminal-linux-arm64-v0.6.1-alpha.tar.gz: OK

* Import the project's lead maintainer (Oliver Gugger) PGP key from Keybase 

  $ curl https://keybase.io/guggero/pgp_keys.asc | gpg --import
  >  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
  >                               Dload  Upload   Total   Spent    Left  Speed
  > 100 19417  100 19417    0     0  32578      0 --:--:-- --:--:-- --:--:-- 32524
  > gpg: key 8E4256593F177720: 1 signature not checked due to a missing key
  > gpg: key 8E4256593F177720: "Oliver Gugger <gugger@gmail.com>" 1 new signature
  > gpg: Total number processed: 1
  > gpg:         new signatures: 1
  > gpg: no ultimately trusted keys found
  
* Using the key, verify the authenticity of the checksums file

  $ wget https://github.com/lightninglabs/lightning-terminal/releases/download/v0.6.1-alpha/manifest-v0.6.1-alpha.sig
  $ gpg --verify manifest-v0.6.1-alpha.sig manifest-v0.6.1-alpha.txt
  > gpg: Signature made Fri Dec  3 22:58:37 2021 GMT
  > gpg:                using RSA key F4FC70F07310028424EFC20A8E4256593F177720
  > gpg: Good signature from "Oliver Gugger <gugger@gmail.com>" [unknown]
  > [...]

* Now that the authenticity and integrity of the binary has been proven, unzip the binary and install Lightning Terminal

  $ tar -xzf lightning-terminal-linux-arm64-v0.6.1-alpha.tar.gz
  $ sudo install -m 0755 -o root -g root -t /usr/local/bin lightning-terminal-linux-arm64-v0.6.1-alpha/*
  $ litd --lnd.version
  > litd version 0.14.1-beta commit=lightning-terminal-v0.6.1-alpha
  ```

### User and data directories

* Create the “lit” service user, and make it a member of the “bitcoin” and “lnd” groups

  ```sh
  $ sudo adduser --disabled-password --gecos "" lit
  $ sudo usermod -a -G bitcoin,lnd lit
  ```

* Create the Lightning Terminal, Loop, Pool and Faraday data directories

  ```sh
  $ sudo mkdir /data/lit /data/loop /data/pool /data/faraday
  $ sudo chown -R lit:lit /data/lit /data/loop /data/pool /data/faraday
  ```

* Open a “lit” user session
  
  ```sh 
  $ sudo su - lit
  ```

* Create symlinks to the LND, Lightning Terminal, Loop, Pool and Faraday directories

  ```sh
  $ ln -s /data/lnd /home/lit/.lnd
  $ ln -s /data/lit /home/lit/.lit
  $ ln -s /data/loop /home/lit/.loop
  $ ln -s /data/pool /home/lit/.pool
  $ ln -s /data/faraday /home/lit/.faraday
  ```

* Display the links and check that they’re not shown in red (this would indicate an error)

  ```sh
  $ ls -la
  ```

### Configuration

The Lightning Terminal daemon (`litd`) has its own configuration file. 
The settings for Pool, Faraday, Loop can all be put in the configuration file 

* Create the configuration file and paste the following content (set the `uipassword` with your password [G] and adjust to your alias; and paste password [B] as required in the Faraday section). Save and exit.

  ```sh
  $ cd ~/.lit
  $ nano lit.conf
  ```
  
  ```ini  
  # RaspiBolt: Lightning Terminal configuration
  # /home/lit/.lit/lit.conf
  
  #######################
  # Application Options #
  #######################
  
  # The host:port to listen for incoming HTTP/2 connections on for the web UI only. (default:127.0.0.1:8443)
  httpslisten=0.0.0.0:8443
  
  # Your password for the UI must be at least 8 characters long
  uipassword=Password[G]

  # Remote options
  remote.lit-debuglevel=debug

  # Remote lnd options
  remote.lnd.rpcserver=127.0.0.1:10009
  remote.lnd.macaroonpath=/home/lit/.lnd/data/chain/bitcoin/mainnet/admin.macaroon
  remote.lnd.tlscertpath=/home/lit/.lnd/tls.cert
  
  #################
  #     Loop      #
  #################
  
  loop.loopoutmaxparts=5
  
  #################
  #     Pool      #
  #################
  
  # This option avoids the creation of channels with nodes with whom you already have a channel (set to 0 if you don't mind)
  #pool.newnodesonly=1
    
  ##################
  #     Faraday    #
  ##################
  
  faraday.min_monitored=48h
    
  ###################
  # Faraday-Bitcoin #
  ###################
  
  # If connect_bitcoin is set to 1, Faraday can connect to a bitcoin node (with --txindex set) to provide node accounting services
  faraday.connect_bitcoin=1
  # The Bitcoin node IP is the IP address of the Raspibolt, i.e. an address like 192.168.0.20
  faraday.bitcoin.host=192.168.0.171
  # bitcoin.user provides to Faraday the bicoind RPC username, as specified in our bitcoin.conf
  faraday.bitcoin.user=raspibolt
  # bitcoin.password provides to Faraday the bitcoind RPC password, as specified in our bitcoin.conf
  faraday.bitcoin.password=Password[B]
  ```

🔍 *Notice that the options for Faraday, Loop and Pool can be set in this configuration file but you must prefix the software with a dot as we made here. Use samples configuration files shown in github repo of each software for more options*

---

## Run Lightning Terminal

### Manual start

Still with user “lit”, we first start Lightning Terminal manually to check if everything works fine.

  ```sh
  $ litd
  ```

* Test that Lightning Terminal is working by visiting the web UI at [https://raspibolt.local::8443/](https://raspibolt.local::8443/){:target="_blank"} (enter passworrd [G] when prompted.

* To stop Lightning Terminal, press Ctrl+C. Then exit the "lit" user.

  ```sh
  $ exit
  ```

### Autostart on boot

Now we’ll make sure Lightning Terminal starts as a service on the Raspberry Pi so it’s always running. In order to do that, we create a systemd unit that starts the service on boot directly after LND.

* Create the Lightning Terminal systemd unit with the following content. Save and exit.
  
  ```sh
  $ sudo nano /etc/systemd/system/litd.service
  ```

  ```ini
  # RaspiBolt: systemd unit for litd
  # /etc/systemd/system/litd.service
  
  [Unit]
  Description=Lightning Terminal Daemon
  After=lnd.service
  
  [Service]
  
  # Service execution
  ###################
  ExecStart=/usr/local/bin/litd
  
  # Process management
  ####################
  Type=simple
  Restart=always
  RestartSec=30
  TimeoutSec=240
  LimitNOFILE=128000
  
  # Directory creation and permissions
  ####################################
  User=lit
  
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
  
* Enable and start the service and check its status and logging output
  
  ```sh
  $ sudo systemctl enable litd
  $ sudo systemctl start litd
  $ sudo systemctl status litd
  >* litd.service - Lightning Terminal Daemon
  >   Loaded: loaded (/etc/systemd/system/litd.service; enabled; vendor preset: enabled)
  >   Active: active (running) since Mon 2021-12-27 19:16:10 GMT; 22h ago
  > [...]
  $ sudo journalctl -f -u litd
  ```
  
---

## Using other software packaged in LiT

### Admin user

* Add the "admin" user to the "lit" group

  ```sh
  $ sudo adduser admin lit
  ```

* With the "admin" user, create symlinks to the Lightning Terminal, Loop, Pool and Faraday directories

  ```sh
  $ ln -s /data/lit /home/admin/.lit
  $ ln -s /data/loop /home/admin/.loop
  $ ln -s /data/pool /home/admin/.pool
  $ ln -s /data/faraday /home/admin/.faraday
  ```

### Admin user

For now, softwares packaged in Lightning Terminal are all listening to the same port 10009. This is not the default behavior set in the code of these sofware so you must always indicate the RPC port when using them.

For example, the following will not work to look at the last auction snapshot:

  ```sh
  $2 pool auction snapshot
  ```
  
It will returns the following error:
  ```sh
  > [pool] rpc error: code = Unavailable desc = connection error: desc = "transport: Error while dialing dial tcp [::1]:12010: connect: connection refused"
  ```
It says that the `pool` command try to interact with your pool client on localhost's port 12010. However your instance of Pool is not listening to the default port 12010, but port 10009 ! It also needs to know where the TLS certificate to securely interact with LND is.

That's why this will work:

  ```sh
  $2 pool --rpcserver=localhost:10009 --tlscertpath=~/.lnd/tls.cert auction snapshot
  ```
It can be convenient to create alias to not have to type the rpc server address at every command. Use `alias` command in bash for that

  ```sh
  $2 alias poolit="pool --rpcserver=localhost:10009 --tlscertpath=~/.lnd/tls.cert"
  $2 poolit auction snapshot
  ```
You can add your aliases in `.bashrc` file of `admin`
  ```sh
  $2 nano ~/.bashrc
  ```
  
Add the following at the end of the file then save and exit:
  
  ```
  $2 alias poolit="pool --rpcserver=localhost:10009 --tlscertpath=~/.lnd/tls.cert"
  $2 alias loopit="loop --rpcserver=localhost:10009 --tlscertpath=~/.lnd/tls.cert"
  $2 alias frclit="frcli --rpcserver=localhost:10009 --tlscertpath=~/.lnd/tls.cert"
  ```
  
Use `help` and documentation on Pool, Loop and Faraday respectively for information on these command.
  
### Access LiT UI for easy Loop Out/In and Liquidity trading

LiT provides a UI that allows you to use Loop and Pool conveniently. The UI is running on port 8443. To access it you must be in your home network (or connected through a VPN like WireGuard) and `ufw` should allow access to the port 8443:

  ```sh
  $2 sudo su
  # ufw allow 8443 comment 'allow LiT UI'
  # ufw disable
  # ufw enable
  # exit
  ```
  
You can now connect from your home to `https://[your_pi_local_ip]:8443` with your browser and enjoy the nice GUI of LiT ! Use `PASSWORD_[B]` to log in.

---

## Upgrade

TBD

---

## Uninstall

🚨 Warning: Before uninstalling Lightning Terminal, you might want to make sure that there is no on-going channel leases or LOOP swaps and that you've closed your Pool account. You might also want to make some backup of key files (LSAT token, databases etc) located in the /data directories).

* Stop and disable the systemd service and then delete the service file

  ```sh
  $ sudo systemctl stop litd
  $ sudo systemctl disable litd
  $ cd /etc/systemd/system
  $ sudo rm litd.service
  ```
  
* Remove the Lightning Terminal binaries

  ```sh
  $ cd /usr/local/bin
  $ sudo rm frcli litcli litd loop pool
  ```
  
* Remove the "admin" user symlinks

  ```sh
  $ cd ~/
  $ rm .faraday .lit .loop .pool
  ```

* Remove the /data Lighting Terminal, Loop, Pool and Faraday directories

  ```sh
  $ cd /data
  $ sudo rm -R faraday lit loop pool
  ```

* Finally, with the "root" user, delete the "lit" user

  ```sh
  $ sudo su -
  $ userdel -r lit


<br /><br />

---

Next: [Ride The Lightning >>](rtl.md)
