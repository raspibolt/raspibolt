---
layout: default
title: Samourai Dojo
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---

## Bonus guide: Samourai Dojo
{: .no_toc }

---

[Samourai Dojo](https://code.samourai.io/dojo/samourai-dojo){:target="_blank"} is the backing server for Samourai Wallet. Provides HD account & loose addresses (BIP47) balances & transactions lists. 
Provides unspent output lists to the wallet. PushTX endpoint broadcasts transactions through the backing bitcoind node.

Difficulty: Medium
{: .label .label-yellow }

Status: Not tested v3
{: .label .label-yellow }

![dojo_profile](../../../images/dojo_profile.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Requirements

* Minimum RAM: 4 GB
* Bitcoin Core
* Fulcrum
* Node.js v16+
* Nginx

---

## Preparations

### Write down your passwords 

Samourai Dojo requires several new passwords. They should be unique and very secure, at least 12 characters in length. Do not use uncommon special characters, spaces, or quotes (‘ or “).

```sh
[ F ] MYSQL_ROOT_PASSWORD
[ G ] MYSQL_PASSWORD
[ H ] NODE_API_KEY_1, NODE_API_KEY_2
[ I ] NODE_ADMIN_KEY
[ J ] NODE_JWT_SECRET
```

Store a copy of your passwords somewhere safe (preferably in an open-source password manager like [KeePassXC](https://keepassxc.org/){:target="_blank"}) or whatever password manager you're already using

### Node.js

To run Dojo, we need to run Node.js v16 or above.

* With user "admin", let's check our version of Node.js running on the node

```sh
$ node -v
> v16.13.1
```

* If Node.js is not installed, follow [this guide](../../bitcoin/blockchain-explorer.md#install-nodejs) to install it. If the version is v14 or older, update it following [this tutorial](https://phoenixnap.com/kb/update-node-js-version){:target="_blank"}.

### npm & PM2

npm is the default package manager for the JavaScript runtime environment and PM2 is a process manager for the JavaScript runtime Node.js

* If not already installed, install npm package manager

```sh
$ sudo apt install npm
```

* update npm to the latest version

```sh
$ sudo npm install latest-version
```

* Install PM2 process manager

```sh
$ sudo npm i -g pm2
```

---

## Installation

### Download Samourai Dojo

* As a user “admin” move to a temporary directory which is cleared on reboot

```sh
$ cd /tmp/
```

* Get the latest download links at [code.samourai.io/dojo](https://code.samourai.io/dojo/samourai-dojo/-/releases){:target="_blank"}. They change with each update

```sh
$ sudo wget https://code.samourai.io/dojo/samourai-dojo/-/archive/v1.17.0/samourai-dojo-v1.17.0.tar.gz
$ sudo tar -xvf samourai-dojo-v1.17.0.tar.gz
```

### MariaDB

[MariaDB](https://mariadb.org/){:target="_blank"} is an open source relational database.

* With user “admin”, update the `apt` packages index and install MariaDB

```sh
$ sudo apt update; sudo apt full-upgrade
$ sudo apt install mariadb-server
```

* Run the secure installation

```sh
$ sudo mysql_secure_installation
```

* Enter the following answers in the shell and exit

```sh
Enter current password for root (enter for none): [ F ] MYSQL_ROOT_PASSWORD
Switch to unix_socket authentication [Y/n]: n
Change the root password? [Y/n]: n
Remove anonymous users? [Y/n]: Y
Disallow root login remotely? [Y/n]: Y
Remove test database and access to it? [Y/n]: Y
Reload privilege tables now? [Y/n] Y
```

* Now, open the MariaDB shell 

```sh
$ sudo mysql
> Welcome to the MariaDB monitor.  Commands end with ; or \g.
> [...]
MariaDB [(none)]>
```

* The instructions to enter in the MariaDB shell with start with "MDB$". Enter each command one by one including ";". Make sure to change "[ G ] MYSQL_PASSWORD" in the second command

```sh
MDB$ CREATE DATABASE dojo_db;
> Query OK, 1 row affected (0.001 sec)

MDB$ CREATE USER 'dojo'@'localhost' IDENTIFIED BY '[ G ] MYSQL_PASSWORD';
> Query OK, 0 rows affected (0.005 sec)

MDB$ GRANT ALL PRIVILEGES ON dojo_db.* TO 'dojo'@'localhost';
> Query OK, 0 rows affected (0.006 sec)

MDB$ FLUSH PRIVILEGES;
> Query OK, 0 rows affected (0.001 sec)
```

* Exit MySQL shell

```sh
MDB$ exit
```

### Create the dojo user and data directory

* Create the user "dojo" and add him to the group “bitcoin” as well

```sh
$ sudo adduser --disabled-password --gecos "" dojo
$ sudo adduser dojo bitcoin
```

* Create the Dojo data folder

```sh
$ sudo mv /tmp/samourai-dojo-v1.17.0 /data/dojo/
$ sudo chown -R dojo:dojo /data/dojo/
```

* Create a symlink to /home/dojo/.dojo

```sh
$ sudo ln -s /data/dojo /home/dojo/.dojo
$ sudo chown -R dojo:dojo /home/dojo/.dojo
```

* Switch to user "dojo"

```sh
$ sudo su - dojo
```

* Display the link and check that it is not shown in red (this would indicate an error)

```sh
$ ls -la
```

---

## Configuration

### index.js

* With user "dojo" move to "conf" directory. Rename mainnet.js to index.js

```sh
$ cd /data/dojo/static/admin/conf
$ mv index-mainnet.js index.js
```

* With user "dojo" move to "keys" directory. Rename index-example.js to index.js

```sh
$ cd /data/dojo/keys
$ mv index-example.js index.js
```

* As user "dojo" open "index.js"

```sh
$ nano index.js
```

* Find and edit these lines inside "bitcoind" part to following values, they have to be inside single quotes ''

```sh
bitcoind: {
[...]

// Login
user: 'raspibolt',
// Password
pass: '[ B ] Bitcoin RPC password',
// ZMQ Tx notifications
zmqTx: 'tcp://127.0.0.1:28333',
// ZMQ Block notifications
zmqBlk: 'tcp://127.0.0.1:8433',
```

* Find and edit these lines inside "db" part to following values

```sh
db: {
[...]

// User
user: 'dojo',
// Password
pass: '[ G ] MYSQL_PASSWORD',
// Db name
database: 'dojo_db',
```

* Find and edit these lines inside "auth" configuration to following values

```sh
auth: {
[...]

// List of API keys (alphanumeric characters)
apiKeys: ['[ H ] NODE_API_KEY_1', '[ H ] NODE_API_KEY_2'],
// Admin key (alphanumeric characters)
adminKey: '[ I ] NODE_ADMIN_KEY',
```

Find and edit these lines inside "jwt" configuration to following values

```sh
jwt: {
[...]

// Secret passphrase used by the server to sign the jwt
// (alphanumeric characters)
secret: '[ J ] NODE_JWT_SECRET',
```

* Find and edit these lines inside "indexer" configuration to following values

```sh
* Indexer or third party service
[...]

// Values: local_bitcoind | local_indexer | third_party_explorer
active: 'local_indexer',
// Port
port: 50002,
// Protocol for communication (TCP or TLS)
protocol: 'tls'
```

* Save and exit

### pm2.config

* Still as user "dojo", move to the dojo directory and rename pm2 config file

```sh
$ cd /data/dojo
$ mv pm2.config.cjs.example pm2.config.cjs
```

* Open the renamed config file and change following value in the third line.

```sh
$ nano pm2.config.cjs

[...]
const INTERPRETER = 'node' // OR binary name like `node`
```

* Save and exit "dojo" user session

```sh
$ exit
```

### Dependencies

* With user "admin", install necessary dependencies while inside the Dojo folder

```sh
$ cd /data/dojo/
$ sudo npm install --only=prod
```

* Import Dojo scripts to the MariaDB database

```sh
$ sudo mysql -u"root" -p"[ F ] MYSQL_ROOT_PASSWORD" "dojo_db" < ./db-scripts/1_db.sql.tpl
```

### Tor Hidden Service

Tor is used to access "Dojo API and Maintanence tool" and to reach Dojo in an anonymous way.

* Edit "torrc" file

```sh
$ sudo nano /etc/tor/torrc
```

* Paste following values at the end of your `torrc` file

```sh
# Dojo hidden service
SocksPort 9050
SocksPolicy accept 127.0.0.1
SocksPolicy reject *

HiddenServiceDir /var/lib/tor/hsv3/
HiddenServiceVersion 3
HiddenServicePort 80 127.0.0.1:80
```

* Restart Tor 

```sh
$ sudo systemctl reload tor
```

* Print hostname and write it down to a safe place

```sh
$ sudo cat /var/lib/tor/hsv3/hostname
> xyz.onion
```

### Nginx Reverse Proxy

Configure nginx.conf for Dojo Maintanence Tool.

* Open "nginx.conf" file

```sh
$ sudo nano /etc/nginx/nginx.conf
```

* Add following block at the end of your configuration file

```sh
# RaspiBolt: Dojo configuration 
# /etc/nginx/nginx.conf
# https://code.samourai.io/dojo/samourai-dojo/-/blob/develop/docker/my-dojo/nginx/nginx.conf

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Disable activity logging for privacy.
    access_log  off;

    # Do not reveal the version of server
    server_tokens  off;

    sendfile  on;

    keepalive_timeout  95;

    # Enable response compression
    gzip  on;
    # Compression level: 1-9
    gzip_comp_level  1;
    # Disable gzip compression for older IE
    gzip_disable  msie6;
    # Minimum length of response before gzip kicks in
    gzip_min_length  128;
    # Compress these MIME types in addition to text/html
    gzip_types  application/json;
    # Help with proxying by adding the Vary: Accept-Encoding response
    gzip_vary  on;

    include  /etc/nginx/sites-enabled/*.conf;
}
```

* Create a new file called "dojo.conf" inside `sites-enabled` directory

```sh
$ sudo nano /etc/nginx/sites-enabled/dojo.conf
```

* Paste following values and change "xyz.onion" under "Tor Site Configuration" to your hostname address

```sh
# RaspiBolt: Dojo configuration 
# /etc/nginx/sites-enabled/dojo.conf
# https://code.samourai.io/dojo/samourai-dojo/-/blob/develop/docker/my-dojo/nginx/mainnet.conf

# Proxy WebSockets
# https://www.nginx.com/blog/websocket-nginx/
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

# WebSocket server listening here
upstream websocket {
    server localhost:8080;
}

# Tor Site Configuration
server {
    listen 80;
    server_name xyz.onion;
    server_tokens off;

    # Set proxy timeouts for the application
    proxy_connect_timeout 600;
    proxy_read_timeout 600;
    proxy_send_timeout 600;
    send_timeout 600;

    # Proxy WebSocket connections first
    location /v2/inv {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }

    # PushTX server is separate, so proxy first
    location /v2/pushtx/ {
        proxy_pass http://localhost:8081/;
    }

    # Tracker server is separate, so proxy first
    location /v2/tracker/ {
        proxy_pass http://localhost:8082/;
    }

    # Proxy requests to maintenance tool
    location /admin/ {
        proxy_pass http://localhost:8080/static/admin/;
    }

    # Proxy all other v2 requests to the accounts server
    location /v2/ {
        proxy_pass http://localhost:8080/;
    }

    # Redirect onion address to maintenance tool
    location = / {
        return 301 /admin;
    }
}
```

* Test and restart nginx configuration

```sh
$ sudo nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
$ sudo systemctl restart nginx
```

---

## Run Dojo

* With user "dojo", run Dojo

```sh
$ sudo su - dojo
$ cd /data/dojo
$ pm2 start pm2.config.cjs
```
```sh
┌─────┬─────────────────────────────────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name                                            │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼─────────────────────────────────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 4   │ Samourai Dojo - Accounts (mainnet)              │ mainnet     │ 1.17.0  │ fork    │ 1137300  │ 45s    │ 733… │ online    │ 0%       │ 98.6mb   │ dojo     │ disabled │
│ 5   │ Samourai Dojo - PushTX (mainnet)                │ mainnet     │ 1.17.0  │ fork    │ 1137301  │ 45s    │ 941… │ online    │ 0%       │ 72.0mb   │ dojo     │ disabled │
│ 6   │ Samourai Dojo - PushTX orhestrator (mainnet)    │ mainnet     │ 1.17.0  │ fork    │ 1137328  │ 42s    │ 103… │ online    │ 0%       │ 66.7mb   │ dojo     │ disabled │
│ 7   │ Samourai Dojo - Tracker (mainnet)               │ mainnet     │ 1.17.0  │ fork    │ 1137337  │ 41s    │ 766… │ online    │ 0%       │ 191.4mb  │ dojo     │ disabled │
└─────┴─────────────────────────────────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

* Check the logs, you should expect following output (it will take a while for blocks to synchronise):

```sh
$ pm2 logs mainnet

7|Samourai | 2022-09-26T16:26:08Z  INFO  Tracker :  Added block header 409 (id=409)
7|Samourai | 2022-09-26T16:26:08Z  INFO  Tracker : Beginning to process new block header.
7|Samourai Dojo - Tracker (mainnet)  | 2022-09-26T16:26:10Z  INFO  Tracker :  Added block header 410 (id=410)
7|Samourai Dojo - Tracker (mainnet)  | 2022-09-26T16:26:10Z  INFO  Tracker : Beginning to process new block header.
```

* Once finished, following output is expected

```sh
7|Samourai Dojo - Tracker (mainnet)  | 2022-09-26T19:13:15Z  INFO  Tracker : Processing active Mempool (7 transactions)
7|Samourai Dojo - Tracker (mainnet)  | 2022-09-26T19:13:17Z  INFO  Tracker : Processing active Mempool (2 transactions)
7|Samourai Dojo - Tracker (mainnet)  | 2022-09-26T19:13:19Z  INFO  Tracker : Processing active Mempool (8 transactions)
```

### Autostart on boot

Now we’ll make sure Dojo starts as a service on the Raspberry Pi so it’s always running. 

* Still logged as a "dojo" user, save running processes with following command

```sh
$ pm2 save
```

* Run these processes at reboot automatically. Copy entire generated output starting with "sudo"

```sh
$ pm2 startup
[PM2] Init System found: systemd
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/usr/local/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u dojo --hp /home/dojo
```

* Exit "dojo" user session

```sh
$ exit
```

* Paste your own output into the CLI as user "admin", who has sudo privileges

```sh
$ sudo env PATH=$PATH:/usr/local/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u dojo --hp /home/dojo
```

---

## Connect to Dojo

### Erase Samourai Wallet
To connect, you need to delete and restore already existing samourai wallet. Backend configuration can only be modified at the start of wallet creation/restore process. Following steps are recommended!

Check Mnemonic Phrase
* Navigate to the settings by tapping "⋮" on the top right of the Samourai toolbar and then tapping "Settings"
* Once in the settings screen tap on "Wallet" and then "Show Mnemonic"
* Check if Mnemonic phrase is correct

Check Passphrase
* Move back to "Settings" and then tap "Troubleshoot"
* Tap "Passphrase test" to begin the test
* You will be asked to enter your passphrase. Upon success you will be notified

Erase Wallet
* In "Settings" tap "Wallet"
* At the bottom of this screen, tap "Secure erase wallet"

### Connect to Dojo

Connect samourai wallet to your own backend

* Paste your hostname generated in Tor Hidden Service section into Tor browser with following syntax: "xyz.onion/admin". You can bookmark this page for easier future access

* Authenticate with "[I] NODE_ADMIN_KEY".

![maintancetool_auth.png](/images/maintancetool_auth.png)

* You will find your QR code for samourai wallet under the "pairing section".

![dojo_pairing.png](/images/dojo_pairing.png)

* From the Samourai Wallet start screen, select mainnet and activate Tor
* Toggle the Dojo button on to connect to your own Dojo server
* Scan the pairing QR code displayed by your chosen Dojo implementation
* Tap Restore an existing wallet
* Restore your wallet

### (optional) Rescan public keys using Dojo Maintenance Tool
If no balance is shown in your samourai wallet, it is neccessary to rescan public keys as they are not tracked by Dojo yet.

* Log into `Dojo API and Maintenance Tool` using Tor browser
* Move to `xpubs tool`, under `Tools` section
* In samourai wallet go to `Settings > Wallet`, here you can find your public keys
* Copy and paste all "zpubs" into `xpub tool` and rescan each public key separately

Samourai wallet uses zpubs by default, however if you use other address format than "bc", it is neccessary to rescan other pubs as well

---

## For the future: Dojo upgrade 

* Switch to "dojo" user

```sh
$ sudo su - dojo
```

* Stop Dojo

```sh
$ pm2 stop mainnet
```

* Following the installation section, download and install latest Dojo version. You will overwrite several files.

---

## Uninstall

### Uninstall Dojo

* Stop Dojo

```sh
$ sudo pm2 stop mainnet
```

* Remove Dojo directory

```sh
$ sudo rm -R /data/dojo
```

* Remove dojo user

```sh
$ sudo userdel -r dojo
```

* Remove Tor configuration. Comment or delete following lines

```sh
$ sudo nano /etc/tor/torrc
```

```sh
# Dojo hidden service
#SocksPort 9050
#SocksPolicy accept 127.0.0.1
#SocksPolicy reject *

#HiddenServiceDir /var/lib/tor/hsv3/
#HiddenServiceVersion 3
#HiddenServicePort 80 127.0.0.1:8080
```

* Save and exit

### Remove MySQL (Optional)

```sh
$ sudo service mysql stop
$ sudo apt-get --purge remove "mysql*"
```

### Remove NodeJS and dependencies (Optional)

```sh
$ npm remove pm2 -g
$ sudo apt remove npm
$ sudo apt remove nodejs
```

<br /><br />

---

<< Back: [+ Bitcoin](index.md)