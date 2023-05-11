---
layout: default
title: Samourai Whirlpool
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---

## Bonus guide: Samourai Whirlpool
{: .no_toc }

---

[Whirlpool](https://code.samourai.io/whirlpool/Whirlpool){:target="_blank"} Samourai Whirlpool is a free and open source (FOSS), non custodial, chaumian CoinJoin platform. Its goal is to mathematically disassociate the ownership of inputs to outputs in a given bitcoin transaction. This is to increase the privacy of the users involved, protect against financial surveillance, and to increase the fungibility of the Bitcoin network as a whole.

Difficulty: Medium {: .label .label-yellow }

Status: Tested v3 {: .label .label-green }

![Whirlpool](../../../images/whirlpool_logo.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Requirements

* Samourai Dojo
* OpenJDK
* Nginx

---

## Preparations

### OpenJDK
OpenJDK is a free and open-source implementation of the Java Platform, Standard Edition.

* With user "admin" update the `apt` packages index

  ```sh
  $ sudo apt update
  $ sudo apt full-upgrade
  ```

* Install OpenJDK and check that it runs properly

  ```sh
  $ sudo apt install default-jdk
  $ java -version
  ```

---

## Installation

### Download Whirlpool

* As a user “admin” move to a temporary directory which is cleared on reboot

  ```sh
  $ cd /tmp/
  ```

* Get the latest download links at [code.samourai.io/whirlpool](https://code.samourai.io/whirlpool/whirlpool-client-cli/-/releases){:target="_blank"}. They change with each update. Rename Whirlpool Client

  ```sh
  $ wget https://code.samourai.io/whirlpool/whirlpool-client-cli/uploads/63621e145967f536a562851853bd0990/whirlpool-client-cli-0.10.16-run.jar
  $ sudo mv whirlpool-client-cli-0.10.16-run.jar whirlpool.jar
  ```

### Create the whirlpool user and data directory

* Create the user "whirlpool" and add him to the group “bitcoin” as well

  ```sh
  $ sudo adduser --disabled-password --gecos "" whirlpool
  $ sudo adduser whirlpool bitcoin
  ```

* Create the Whirlpool data folder and move whirlpool client

  ```sh
  $ sudo mkdir -p /opt/whirlpool/
  $ sudo mv /tmp/whirlpool.jar /opt/whirlpool/
  $ sudo chown -R whirlpool:whirlpool /opt/whirlpool/
  ```

* Create a symlink to /home/whirlpool/.whirlpool

  ```sh
  $ sudo ln -s /opt/whirlpool/ /home/whirlpool/.whirlpool
  $ sudo chown -R whirlpool:whirlpool /home/whirlpool/.whirlpool
  ```

* Switch to user "whirlpool"

  ```sh
  $ sudo su - whirlpool
  ```

* Display the link and check that it is not shown in red (this would indicate an error)

  ```sh
  $ ls -la
  ```

* Exit "whirlpool" user session

  ```sh
  $ exit
  ```

---

## Configuration

### Whirlpool service

* Create Whirlpool service file, copy and paste following values

  ```sh
  $ sudo nano /etc/systemd/system/whirlpool.service 
  ```

  ```
  # RaspiBolt: systemd unit for Whirlpool
  # /etc/systemd/system/whirlpool.service
  [Unit]
  Description=Whirlpool
  After=tor.service

  [Service]
  WorkingDirectory=/opt/whirlpool
  ExecStart=/usr/bin/java -jar whirlpool.jar --listen --rescan --cli.api.http-enable=true --cli.api.http-port=9988 --cli.dojo.url=http://127.0.0.1:80/v2     --cli.torConfig.backend.enabled=false --cli.torConfig.backend.onion=false
  User=whirlpool
  Type=simple
  KillMode=process
  TimeoutSec=60
  Restart=always
  RestartSec=60

  [Install]
  WantedBy=multi-user.target
  ```

* Save and exit

### Tor hidden service

* Edit `torrc` file

  ```sh
  $ sudo nano /etc/tor/torrc
  ```

* Paste following values at the end of your `torrc` file

  ```
  # Whirlpool hidden service
  SocksPolicy accept 127.0.0.1

  HiddenServiceDir /var/lib/tor/whirlpool/
  HiddenServiceVersion 3
  HiddenServicePort 8900 127.0.0.1:8900
  ```

* Restart Tor

  ```sh
  $ sudo systemctl reload tor
  ```

* Print hostname and write it down to a safe place

  ```sh
  $ sudo cat /var/lib/tor/whirlpool/hostname
  > xyz.onion
  ```

### Nginx Reverse Proxy

Configure nginx.conf for Whirlpool

* Create a new file called "whirlpool.conf" inside "sites-enabled" directory and paste following values. Replace "xyz.onion" with your hostname

  ```sh
  $ sudo nano /etc/nginx/sites-enabled/whirlpool.conf
  ```

  ```
  # Raspibolt: Whirlpool configuration
  # /etc/nginx/sites-enabled/whirlpool.conf
  # https://code.samourai.io/dojo/samourai-dojo/-/blob/develop/docker/my-dojo/nginx/whirlpool.conf

  server {
    listen 8900;
    server_name xyz.onion;

    location / {
      set $upstream http://127.0.0.1:9988;
      proxy_pass $upstream;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }
  }
  ```

* Test Nginx configuration

  ```sh
  $ sudo nginx -t
  ```
  ```
  > nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
  > nginx: configuration file /etc/nginx/nginx.conf test is successful
  ```

* Reload Nginx configuration

  ```sh
  $ sudo systemctl reload nginx
  ```

---

## Run Whirlpool

### Start Whirlpool

* With user "admin" enable and start whirlpool service

  ```sh
  $ sudo systemctl enable whirlpool.service 
  $ sudo systemctl start whirlpool.service 
  ```

* Check if service works correctly. It can take up to several minutes before you can see following output

  ```sh
  $ sudo systemctl status whirlpool.service
  ```

  ```
  > [...] [...] : ------------ whirlpool-client-cli starting ------------
  > [...] [...] : Running whirlpool-client-cli 0.10.16 on java 11.0.16... [--listen, --rescan, --cli.api.http-enable=true, --cli.api.http-port=9988 ...]
  > [...] [...] : API is listening on https://127.0.0.1:8899 and http://127.0.0.1:9988
  > [...] [...] : Running Tor: /usr/sbin/tor -f /tmp/whirlpoolTorxxxxxxxxxxxx/to>
  > [...] [...] : <E2><A3><BF><E2><A3><BF><E2><A3><BF><E2><A3><BF><E2><A3><BF><E2><A3>  >
  > [...] [...] : <E2><A3><BF> AUTHENTICATION REQUIRED
  > [...] [...] : <E2><A3><BF> Whirlpool wallet is CLOSED.
  > [...] [...] : <E2><A3><BF> Please start GUI to authenticate and start mixing.
  > [...] [...] : <E2><A3><BF> Or authenticate with --authenticate       
  ```

## Authenticate Whirlpool

### Authenticate with Whirlpool GUI (recommended)
Download [Whirlpool GUI](https://samouraiwallet.com/download/whirlpool) at official Samourai site and verify software

* Run Tor Browser in the background and start GUI
* Paste hostname with following syntax: `http://xyz.onion:8900` and Tor proxy as seen on the picture. Click "connect"

![Samourai_GUI_connect](../../../images/Samourai_GUI_connect.png)

* Within the Samourai Wallet, go to `Settings > Transactions > Pair to Whirlpool GUI`. Copy and paste pairing payload

![Whirlpool_GUI_payload](../../../images/Whirlpool_GUI_payload.png)

* Turn on Dojo backend 

![Whirlpool_GUI_config](../../../images/Whirlpool_GUI_config.png)

* Authenticate using your Samourai Wallet passphrase

![Whirlpool_GUI_authenticate](../../../images/Whirlpool_GUI_authenticate.png)

* Set up complete! You can find additional information in [Samourai Documentation](https://docs.samourai.io/en/whirlpool)

### Authenticate with CLI (optional)
Authenticate with CLI for advanced users

* Stop Whirlpool service to avoid multiple instances error. Switch to user "whirlpool" who has necessary permissions

  ```sh
  $ sudo systemctl stop whirlpool.service
  $ sudo su - whirlpool
  ```

* Initialize Whirlpool and upon notification, paste your pairing payload from Samourai Wallet

  ```sh
  $ java -jar /opt/whirlpool/whirlpool.jar --init --cli.dojo.url=http://127.0.0.1:80/v2 --cli.torConfig.backend.enabled=false --cli.torConfig.backend.onion=false
  ```
  ```
  > xxxx-xx-xx xx:xx:xx.xxx  INFO 315017 --- [           main] c.samourai.whirlpool.cli.run.RunCliInit  : ?????????????????????????
  > xxxx-xx-xx xx:xx:xx.xxx  INFO 315017 --- [           main] c.samourai.whirlpool.cli.run.RunCliInit  : ? CLI INITIALIZATION
  > xxxx-xx-xx xx:xx:xx.xxx  INFO 315017 --- [           main] c.samourai.whirlpool.cli.run.RunCliInit  : ? This will intialize CLI by connecting an ...
  > xxxx-xx-xx xx:xx:xx.xxx  INFO 315017 --- [           main] c.samourai.whirlpool.cli.run.RunCliInit  : ? 
  > xxxx-xx-xx xx:xx:xx.xxx  INFO 315017 --- [           main] c.samourai.whirlpool.cli.run.RunCliInit  : ? Get your pairing payload in Samourai Wallet, go 
  > xxxx-xx-xx xx:xx:xx.xxx  INFO 315017 --- [           main] c.samourai.whirlpool.cli.run.RunCliInit  : ? ? Paste your pairing payload:
  > ? INPUT REQUIRED ? Pairing payload?>
  ```

* Upon notification, confirm your Samourai Wallet passphrase. Client may appear not responsive for several minutes

  ```
  > ? INPUT REQUIRED ? Passphrase?>
  ```
  ```
  > xxxx-xx-xx xx:xx:xx.xxx  INFO 314285 --- [       Thread-3] c.s.tor.client.TorOnionProxyInstance     : TorSocks started.
  > xxxx-xx-xx xx:xx:xx.xxx  INFO 314285 --- [       Thread-3] c.s.w.c.w.d.dataSource.DojoDataSource    :  ? Initializing wallet
  > [...]
  > xxxx-xx-xx xx:xx:xx.xxx  INFO 319042 --- [       Thread-3] c.s.whirlpool.cli.services.CliService    : ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
  > xxxx-xx-xx xx:xx:xx.xxx  INFO 319042 --- [       Thread-3] c.s.whirlpool.cli.services.CliService    : ⣿ AUTHENTICATION SUCCESS
  > xxxx-xx-xx xx:xx:xx.xxx  INFO 319042 --- [       Thread-3] c.s.whirlpool.cli.services.CliService    : ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
  > xxxx-xx-xx xx:xx:xx.xxx  INFO 319042 --- [       Thread-3] c.s.whirlpool.cli.services.CliService    : ⣿ Whirlpool is starting...
  ```

* You have now authenticated with CLI, happy mixing!
  

### Whirlpool API key
Once you have initialized Whirlpool for the first time, for the future pairing (restart etc.), you will be asked for a special apiKey

* Print apiKey and save it in a safe place

  ```sh
  $ sudo cat /opt/whirlpool/whirlpool-cli-config.properties | grep "cli.apiKey"
  > cli.apiKey=...
  ```
---

## Extras

### Verify your anonsets using WST (Linux/MacOS)
[Whirlpool Stats Tools](https://github.com/Samourai-Wallet/whirlpool_stats#whirlpool_stats) (WST for short) is a command line tool allowing to compute privacy-oriented statistics related to Whirlpool

* Open Tor Browser on your computer (on background)
* On your computer, open terminal and create a directory (can be done manually as well) and move there. Can be named for ex. "wst"

  ```sh
  $ sudo mkdir -p /path/to/your/file
  $ cd /path/to/your/file
  ```
  
* Clone the git repository under current directory. Install [brew](https://brew.sh/) and git, if not already done

  ```sh
  $ brew install git  # Optional (if not installed)
  $ sudo git clone https://github.com/Samourai-Wallet/whirlpool_stats.git
  ```

* Move to `/whirlpool_stats` directory and install the dependencies with pip3. Install pip3 if not already done

  ```sh
  $ cd whirlpool_stats
  $ brew install pip3  # Optional (if not installed)
  $ sudo pip3 install -r ./requirements.txt
  ```
  
* Move to `/whirlpool_stats` subdirectory and start WST

  ```sh
  $ cd whirlpool_stats
  $ python3 wst.py
  ```
  ```
  > python wst.py

  > Starting Whirlpool Stats Tool...
  > Type "help" for a list of available commands.

  wst#/tmp>
  ```
  
* While in the new shell, set proxy for Tor Browser to ensure anonymity. Note that Tor Browser uses port "9150"

  ```
  wst#/tmp> socks5 127.0.0.1:9150
  wst#/tmp>
  ```

* Change work directory for WST. You can create/use any directory you want

  ```
  wst#/tmp> workdir /path/to/workdir
  wst#/path/to/workdir>
  ```

* Download in the working directory a snaphot for the given pool. We will use for example "0.5 BTC" pool

  ```
  wst#/path/to/workdir> download 05
  ```
  ```
  > Start download of snapshot for 05 denomination
  > whirlpool_mix_txs_05.csv downloaded
  > whirlpool_tx0s_05.csv downloaded
  > whirlpool_links_05.csv downloaded
  > Download complete
  ```

* Load snapshot for "0.5 BTC" pool. This can take up to several minutes
  
  ```
  wst#/path/to/workdir> load 05
  ```
  ```
  > Start loading snapshot for 05 denomination
  > Mix txs loaded
  > Tx0s loaded
  > Tx links loaded
  
  > Done!
  > Start computing metrics (forward-looking)
  > Computed metrics for round 0
  [...]
  > Done!
  ```
  
* Plot a chart for a given metrics of the active snapshot (e.g.: forward-looking anonset)

  ```
  wst#/path/to/workdir> plot fwd anonset
  > Preparing the chart... 
  ```
[wst_chart](picture)

* Display the metrics computed for your transaction stored in the active snapshot

  ```
  wst#/path/to/workdir> score 4e72519d391ce83e0659c9022a00344bedbb253de1747cf290162b3d3ea51479
  ```
  ```
  > Backward-looking metrics for the outputs of this mix:
  >  anonset = 92
  >  spread = 89%

  > Forward-looking metrics for the outputs of Tx0s having this transaction as their first mix:
  >  anonset = 127
  >  spread = 76%
  ```

Learn more about [whirlpool anonymity sets](https://medium.com/samourai-wallet/diving-head-first-into-whirlpool-anonymity-sets-4156a54b0bc7)

---

## For the future: Whirlpool upgrade

* Stop the "whirlpool.service" and delete old client "whirlpool.jar" (You can as well rename it or move to backup directory)

  ```sh
  $ sudo systemctl stop whirlpool.service
  $ sudo rm /opt/whirlpool/whirlpool.jar
  ```

* Download the latest version of Whirlpool Client and rename it to "whirlpool.jar". Move it to `/data/whirlpool`. Make sure to replace several "x" in the third command according to latest whirlpool version.

  ```sh
  $ cd /tmp
  $ sudo wget https://code.samourai.io/whirlpool/whirlpool-client-cli/uploads/...
  $ sudo mv whirlpool-client-cli-x.xx.xx-run.jar whirlpool.jar
  $ sudo mv /tmp/whirlpool.jar /opt/whirlpool
  ```

* Start Whirlpool and check if everything works fine

  ```sh
  $ sudo systemctl start whirlpool.service
  $ sudo systemctl status whirlpool.service
  ```

* Authenticate in Whirlpool GUI using your passphrase

---

## Uninstall 

### Uninstall Whirlpool
Ensure you are logged with user “admin”

* Stop, disable and delete service

  ```sh
  $ sudo systemctl stop whirlpool.service
  $ sudo systemctl disable whirlpool.service
  $ sudo rm /etc/systemd/system/whirlpool.service
  ```

* Delete “whirlpool” user and directory

  ```sh
  $ sudo userdel -r whirlpool
  $ sudo rm -rf /opt/whirlpool/
  ```

### Uninstall Tor Hidden Service

* Comment or remove whirlpool hidden service in torrc. Save and exit

  ```sh
  $ sudo nano /etc/tor/torrc
  ```

  ```
  # Whirlpool hidden service
  #SocksPolicy accept 127.0.0.1

  #HiddenServiceDir /var/lib/tor/whirlpool/
  #HiddenServiceVersion 3
  #HiddenServicePort 8900 127.0.0.1:8900
  ```

* Restart Tor

  ```sh
  $ sudo systemctl restart tor
  ```

### Uninstall Nginx configuration

* Delete Whirlpool configuration and reload Nginx

  ```sh
  $ sudo rm /etc/nginx/sites-enabled/whirlpool.conf
  $ sudo systemctl reload nginx
  ```

### Uninstall OpenJDK (optional)

  ```sh
  $ sudo apt purge default-jdk
  ```

<br /><br />

---

<< Back: [+ Bitcoin](index.md)
