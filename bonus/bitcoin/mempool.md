---
layout: default
title: The Mempool Open Source Project
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---

## Bonus guide: The Mempool Open Source Project
{: .no_toc }

---

[Mempool](https://github.com/mempool/mempool){:target="_blank"} is a self-hosted Bitcoin blockchain and mempool visualizer/explorer. Look up your onchain transactions and estimate transaction fees without any privacy leaks.

Difficulty: Medium
{: .label .label-yellow }

Status: Tested v3
{: .label .label-green }

![Mempool](../../images/mempool.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Requirements

* Bitcoin
* Electrs
* NodeJS v16+
* MariaDB
* nginx

---

## Preparations

### NodeJS v16+

* Let's check our version of NodeJS running on the node

  ```sh
  $ node -v
  > v16.13.1
  ```
* If the version is v14 or older, update it following this tutorial: TBD

### Firewall

* Configure the firewall to allow incoming HTTPS requests

  ```sh
  $ sudo ufw allow 4081/tcp comment 'allow Mempool SSL'
  $ sudo ufw status
  ```

## Installation

### Clone the repository

For improved security, we create the new user "mempool" that will run the Mempool explorer. Using a dedicated user limits potential damage in case there's a security vulnerability in the code. An attacker would not be able to do much within this user's permission settings.

* Create a new user, assign it to the "bitcoin" group, and open a new session

  ```sh
  $ sudo adduser --disabled-password --gecos "" mempool
  $ sudo adduser mempool bitcoin
  $ sudo su - mempool
  ```

* Download the source code directly from GitHub

  ```sh
  $ git clone https://github.com/mempool/mempool
  > Cloning into 'mempool'...
  > [...]
  $ exit
  ```

### MariaDB

[MariaDB](https://mariadb.org/){:target="_blank"} is an open source relational database.

* With user "admin", we update the `apt` packages index, install MariaDB on the node and check that it runs properly

  ```sh
  $ sudo apt update
  $ sudo apt install mariadb-server mariadb-client
  $ sudo systemctl status mariadb
  > * mariadb.service - MariaDB 10.5.12 database server
  >  Loaded: loaded (/lib/systemd/system/mariadb.service; enabled; vendor preset: enabled)
  >  Active: active (running) since Mon 2021-12-13 11:29:11 GMT; 23h ago
  >  [...]
  ```
  
* Now, open the MariaDB shell. The instructions to enter in the MariaDB shell with start with $2

  ```sh
  $ sudo mysql
  > Welcome to the MariaDB monitor.  Commands end with ; or \g.
  > [...]
  > MariaDB [(none)]>
  ```

* Enter the following commands in the shell and exit

  ```sh
  $$ drop database mempool;
  > ERROR 1008 (HY000): Can't drop database 'mempool'; database doesn't exist
  $$ create database mempool;
  > Query OK, 1 row affected (0.001 sec)
  $$ grant all privileges on mempool.* to 'mempool'@'%' identified by 'mempool';
  > Query OK, 0 rows affected (0.012 sec)
  $$ exit
  ```
  
* Still with user "admin", from the mempool repo's top-level folder, import the database structure:

  ```sh
  $ cd /home/mempool/mempool
  $ mariadb -umempool -pmempool mempool < mariadb-structure.sql
  $ cd ~/
  ```

### Installation of Mempool's backend

* With user "mempool", install the backend  
  
  ```sh
  $ sudo su - mempool
  $ cd mempool/backend
  $ npm install
  $ npm run build
  ```
  
* Copy and rename the sample configuration file
  
  ```sh
  $ cp mempool-config.sample.json mempool-config.json
  $ nano mempool-config.json
  ```
  
* Open the config file and paste the following text. In the CORE_RPC section, replace USERNAME by 'raspibolt' and PASSWORD by your password [B]
  
  ```sh
  {
    "MEMPOOL": {
      "NETWORK": "mainnet",
      "BACKEND": "electrum",
      "HTTP_PORT": 8999
    },
    "CORE_RPC": {
      "HOST": "127.0.0.1",
      "PORT": 8332,
      "USERNAME": "raspibolt",
      "PASSWORD": "Password[B]"
    },
    "ELECTRUM": {
      "HOST": "127.0.0.1",
      "PORT": 50002,
      "TLS_ENABLED": true
    },
    "DATABASE": {
      "ENABLED": true,
      "HOST": "127.0.0.1",
      "PORT": 3306,
      "USERNAME": "mempool",
      "PASSWORD": "mempool",
      "DATABASE": "mempool"
    }
  }
  ```

* Start the backend to check it is working properly

  ```sh
  npm run start
  ```
  
* After a few minutes, we should see outputs like this. 

  ```sh
  > Mempool updated in 0.189 seconds
  > Updating mempool
  > Mempool updated in 0.096 seconds
  > Updating mempool
  > Mempool updated in 0.099 seconds
  > Updating mempool
  > Calculated fee for transaction 1 / 10
  > Calculated fee for transaction 2 / 10
  > Calculated fee for transaction 3 / 10
  > Calculated fee for transaction 4 / 10
  > Calculated fee for transaction 5 / 10
  > Calculated fee for transaction 6 / 10
  > Calculated fee for transaction 7 / 10
  > Calculated fee for transaction 8 / 10
  > Calculated fee for transaction 9 / 10
  > Calculated fee for transaction 10 / 10
  > Mempool updated in 0.243 seconds
  > Updating mempool
  ```

* Press Ctrl+C to exit and come back to the repository root directory

  ```sh
  $ cd ~/mempool
  ```

### Installation of Mempool's frontend

* Still with user "mempool", install the frontend and exit back to the "admin" user

  ```sh
  $ cd frontend
  $ npm install
  $ npm run
  $ exit
  ```

* Install the output into nginx webroot folder

  ```sh
  $ sudo rsync -av --delete /home/mempool/mempool/frontend/dist/mempool/ /var/www/mempool/
  $ sudo chown -R www-data:www-data /var/www/mempool
  ```
  
### nginx

We now need to modify the nginx configuration to create a web server for the website on port 4081.

* Create a proxy server for the Mempool website on port 4081

  ```sh
  $ sudo nano /etc/nginx/sites-available/mempool-ssl.conf
  ```

* Paste the following configuration line. Save and exit

  ```ini
  ## mempool-ssl.conf
  
          proxy_read_timeout 300;
          proxy_connect_timeout 300;
          proxy_send_timeout 300;
  
          map $http_accept_language $header_lang {
                  default en-US;
                  ~*^en-US en-US;
                  ~*^en en-US;
                  ~*^ar ar;
                  ~*^ca ca;
                  ~*^cs cs;
                  ~*^de de;
                  ~*^es es;
                  ~*^fa fa;
                  ~*^fr fr;
                  ~*^ko ko;
                  ~*^it it;
                  ~*^he he;
                  ~*^ka ka;
                  ~*^hu hu;
                  ~*^mk mk;
                  ~*^nl nl;
                  ~*^ja ja;
                  ~*^nb nb;
                  ~*^pl pl;
                  ~*^pt pt;
                  ~*^ro ro;
                  ~*^ru ru;
                  ~*^sl sl;
                  ~*^fi fi;
                  ~*^sv sv;
                  ~*^th th;
                  ~*^tr tr;
                  ~*^uk uk;
                  ~*^vi vi;
                  ~*^zh zh;
                  ~*^hi hi;
          }
  
          map $cookie_lang $lang {
                  default $header_lang;
                  ~*^en-US en-US;
                  ~*^en en-US;
                  ~*^ar ar;
                  ~*^ca ca;
                  ~*^cs cs;
                  ~*^de de;
                  ~*^es es;
                  ~*^fa fa;
                  ~*^fr fr;
                  ~*^ko ko;
                  ~*^it it;
                  ~*^he he;
                  ~*^ka ka;
                  ~*^hu hu;
                  ~*^mk mk;
                  ~*^nl nl;
                  ~*^ja ja;
                  ~*^nb nb;
                  ~*^pl pl;
                  ~*^pt pt;
                  ~*^ro ro;
                  ~*^ru ru;
                  ~*^sl sl;
                  ~*^fi fi;
                  ~*^sv sv;
                  ~*^th th;
                  ~*^tr tr;
                  ~*^uk uk;
                  ~*^vi vi;
                  ~*^zh zh;
                  ~*^hi hi;
          }
  
  server {
      listen 4081 ssl;
      listen [::]:4081 ssl;
      server_name _;
  
      # TLS
      ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
      ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
      #ssl_session_cache shared:SSL:1m;
      ssl_session_timeout 4h;
      ssl_protocols TLSv1.2 TLSv1.3;
      ssl_prefer_server_ciphers on;
  
      include /etc/nginx/snippets/nginx-mempool.conf;
  
  }
  ```

* Create a symlink in the sites-enabled directpry

  ```sh
  $ sudo ln -sf /etc/nginx/sites-available/mempool-ssl.conf /etc/nginx/sites-enabled/
  ```

* Copy the conf file dedicated to the Mempool website in the nginx `snippets` directory

  ```sh
  $ sudo rsync -av /home/mempool/mempool/nginx-mempool.conf /etc/nginx/snippets
  ```

We modify this file to add a restriction that only allow access from the LAN and deny connections from the rest of the world

* Open the file and go to the first "location" context

  ```sh
  $ sudo nano /etc/nginx/snippets/nginx-mempool.conf 
  ```

  ```ini
  location / {
              try_files /$lang/$uri /$lang/$uri/ $uri $uri/ /en-US/$uri @index-redirect;
              expires 10m;
  }
  ```

* Add the following two lines (`allow 192.168.0.0/16;` and `deny all;`) for the context to now look like that. Save and exit.

  ```ini
  location / {
              allow 192.168.0.0/16;
              deny all;
              try_files /$lang/$uri /$lang/$uri/ $uri $uri/ /en-US/$uri @index-redirect;
              expires 10m;
  }
  ```

* Replace the main nginx configuration file

  ```sh
  $ sudo mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak2
  $ sudo nano /etc/nginx/nginx.conf
  ```

* Paste the following configuration lines. Save and exit.

  ```ini
  user www-data;
  worker_processes auto;
  pid /run/nginx.pid;
  include /etc/nginx/modules-enabled/*.conf;

  # worker_rlimit_nofile 100000;

  events {
          worker_connections 768;
          # multi_accept on;
  }

  http {
          ##
          # Basic Settings
          ##
          
          sendfile on;
          tcp_nopush on;
          tcp_nodelay on;
          keepalive_timeout 65;
          types_hash_max_size 2048;
          server_tokens off;
          
          # server_names_hash_bucket_size 64;
          # server_name_in_redirect off;
          
          include /etc/nginx/mime.types;
          default_type application/octet-stream;
          
          ##
          # SSL Settings
          ##
          
          ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POO>
          ssl_prefer_server_ciphers on;
          
          ##
          # Logging Settings
          ##
          
          access_log /var/log/nginx/access.log;
          error_log /var/log/nginx/error.log;
          
          ##
          # Gzip Settings
          ##
          
          gzip on;
          
          # gzip_vary on;
          # gzip_proxied any;
          # gzip_comp_level 6;
          # gzip_buffers 16 8k;
          # gzip_http_version 1.1;
          # gzip_types text/plain text/css application/json application/javascrip>
          
          ##
          # Virtual Host Configs
          ##
          
          include /etc/nginx/conf.d/*.conf;
          include /etc/nginx/sites-enabled/*;
  }
  
  stream {
          ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
          ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
          ssl_session_cache shared:SSL:1m;
          ssl_session_timeout 4h;
          ssl_protocols TLSv1.2 TLSv1.3;
          ssl_prefer_server_ciphers on;
          
          include /etc/nginx/streams-enabled/*.conf;
  
  }
  ```

* Test and reload nginx configuration
  
  ```sh
  $ sudo nginx -t
  > nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
  > nginx: configuration file /etc/nginx/nginx.conf test is successful
  $ sudo systemctl reload nginx
  ```

---

### Autostart on boot

Now we’ll make sure Mempool starts as a service on the Raspberry Pi so it’s always running. In order to do that, we create a systemd unit that starts the service on boot directly after Bitcoin Core.

* As user “admin”, create the service file

  ```sh
  $ sudo nano /etc/systemd/system/mempool.service
  ```
  
* Paste the following configuration. Save and exit.  
  
  ```ini 
  # RaspiBolt: systemd unit for Mempool           
  # /etc/systemd/system/mempool.service

  [Unit]
  Description=mempool
  After=bitcoind.service

  [Service]
  WorkingDirectory=/home/mempool/mempool/backend
  ExecStart=/usr/bin/node --max-old-space-size=2048 dist/index.js
  User=mempool

  # Restart on failure but no more than default times (DefaultStartLimitBurst=5) every 10 minutes (600 seconds). Otherwise stop
  Restart=on-failure
  RestartSec=600

  # Hardening measures
  PrivateTmp=true
  ProtectSystem=full
  NoNewPrivileges=true
  PrivateDevices=true

  [Install]
  WantedBy=multi-user.target
  ```

* Enable the service, start it and check log logging output.

  ```sh  
  $ sudo systemctl enable mempool
  $ sudo systemctl start mempool
  $ sudo journalctl -f -u mempool
  ```

---

## Mempool in action

Point your browser to the secure access point provided by the nginx web proxy, for example [https://raspibolt.local:4081](https://raspibolt.local:4081){:target="_blank"} (or your nodes ip address, e.g. https://192.168.0.20:4081).

---

## Upgrade

Updating to a new release is straight-forward. Make sure to read the release notes first.

* From user “admin”, stop the service and open a “mempool” user session.

  ```sh
  $ sudo systemctl stop mempool
  $ sudo su - mempool
  ```

* Fetch the latest GitHub repository information, display the latest release tag (v9.99.9 in this example), and update:

  ```sh 
  $ cd /home/mempool/mempool
  $ git fetch
  $ git describe --tags --abbrev=0
  $ git checkout v9.99.9
  $ git verify-tag v9.99.9
  $ npm install --only=prod
  $ exit
  
* Start the service again
 
  ```sh 
  $ sudo systemctl start mempool
  $ sudo journalctl -f -u mempool

* Point your browser to [https://raspibolt:4081/about](https://raspibolt:4081/about){:target="_blank"} and check that the displayed version is the newest version that you just installed.

---

## Uninstall

* Stop, disable and delete the Mempool systemd service
 
  ```sh 
  $ sudo systemctl stop mempool
  $ sudo systemctl disable mempool
  $ sudo rm /etc/systemd/system/mempool.service
  ```

* Display the UFW firewall rules and notes the numbers of the rules for Mempool (e.g., X and Y below)

  ```sh
  $ sudo ufw status numbered
  > [...]
  > [X] 4081/tcp                   ALLOW IN    Anywhere                   # allow Mempool SSL
  > [...]
  > [Y] 4081/tcp (v6)              ALLOW IN    Anywhere (v6)              # allow Mempool SSL
  ```

* Delete the two Mempool rules (check that the rule to be deleted is the correct one and type "y" and "Enter" when prompted)

  ```sh
  $ sudo ufw delete Y
  $ sudo ufw delete X  
  ```

* Remove the nginx configurations for Mempool

  ```sh 
  $ sudo rm -R /var/www/mempool
  $ sudo rm /etc/nginx/snippets/nginx-mempool.conf
  $ sudo rm /etc/nginx/sites-enabled/mempool-ssl.conf
  $ sudo rm /etc/nginx/sites-available/mempool-ssl.conf
  $ sudo rm /etc/nginx/nginx.conf
  $ sudo mv /etc/nginx/nginx.conf.bak2 /etc/nginx/nginx.conf
  
* Test and reload NGINX configuration
  
  ```sh
  $ sudo nginx -t
  > nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
  > nginx: configuration file /etc/nginx/nginx.conf test is successful
  $ sudo systemctl reload nginx
  ```
* Delete the "mempool" user. It might take a long time as the Mempool user directory is big. Do not worry about the `userdel: mempool mail spool (/var/mail/mempool) not found`.

  ```sh
  $ sudo su -
  $ userdel -r mempool
  > userdel: mempool mail spool (/var/mail/mempool) not found
  ```

<br /><br />

---

<< Back: [+ Bitcoin](index.md)
