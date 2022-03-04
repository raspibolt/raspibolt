---
layout: default
title: Bitcoin Only
parent: + Resources
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---

## Bonus guide: Bitcoin Only
{: .no_toc }

---

[Bitcoin Only](https://github.com/bitcoin-only/bitcoin-only){:target="_blank"} is a collection of high quality Bitcoin & Ligthning resources. The website can be self-hosted on our node.

Difficulty: Easy
{: .label .label-green }

Status: Tested v3
{: .label .label-green }

![Bitcoin Only](../../images/bitcoin-only.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Requirements

* Node.js
* nginx

---

## Preparations

### Node.js

To build Bitcoin Only, we need Node.js.

* With user "admin", let's check our version of Node.js running on the node

  ```sh
  $ node -v
  > v16.14.0
  ```

* If Node.js is not installed, follow [this guide](../../bitcoin/blockchain-explorer.md#install-nodejs) to install it.

### Firewall

* Configure the UFW firewall to allow incoming HTTPS requests

  ```sh
  $ sudo ufw allow 4071/tcp comment 'allow Bitcoin Only SSL'
  $ sudo ufw status
  ```

---

## Bitcoin Minds

### Installation

For improved security, we create the new user "bitcoin-only". 
Using a dedicated user limits potential damage in case there's a security vulnerability in the code.
An attacker would not be able to do much within this user's permission settings.

* Create a new user and open a new session

  ```sh
  $ sudo adduser --disabled-password --gecos "" bitcoin-only
  $ sudo su - bitcoin-only
  ```

* Download the source code directly from GitHub

  ```sh
  $ git clone https://github.com/bitcoin-only/bitcoin-only
  $ cd bitcoin-only
  $ npm install
  $ npm run generate
  $ exit
  ```

* With user "admin", copy over the website to the nginx web server directory and change its ownership

  ```sh
  $ sudo rsync -av --delete /home/bitoin-only/bitcoin-only/dist/ /var/www/bitcoin-only/
  $ sudo chown -R www-data:www-data /var/www/bitcoin-only
  ```

---

## nginx

* Create a nginx configuration file for the Bitcoin Only website with a server listening on port 4071

  ```sh
  $ sudo nano /etc/nginx/sites-available/bitcoin-only-ssl.conf
  ```
  
* Paste the following configuration line. Save and exit.
  
  ```ini
  server {
      listen 4071 ssl;
      listen [::]:4071 ssl;
      server_name _;
      ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
      ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
      ssl_session_timeout 4h;
      ssl_protocols TLSv1.3;
      ssl_prefer_server_ciphers on;
  
      access_log /var/log/nginx/access_bitcoin-only.log;
      error_log /var/log/nginx/error_bitcoin-only.log;
  
      root /var/www/bitcoin-only;
      index index.html;

  }
  ```

* Create a symlink in the sites-enabled directory

  ```sh
  $ sudo ln -sf /etc/nginx/sites-available/bitcoin-only-ssl.conf /etc/nginx/sites-enabled/
  ```

* Test and reload nginx configuration

  ```sh
  $ sudo nginx -t
  > nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
  > nginx: configuration file /etc/nginx/nginx.conf test is successful
  $ sudo systemctl reload nginx
  ```

---

## Bitcoin Only in action

You can now access your self-hosted version of Bitcoin Only from within your local network by browsing to [https://raspibolt.local:4071] (or your equivalent IP address).

---

## Update

Once in while, reinstall the website to include the latest commits and resources.

* From user “admin”, open a “bitcoin-only” user session.

  ```sh
  $ sudo su - bitcoin-only
  ```

* Delete the existing repository, clone the latest version and install it.

  ```sh
  $ rm -rf bitcoin-only
  $ git clone https://github.com/bitcoin-only/bitcoin-only
  $ cd bitcoin-only
  $ npm install
  $ npm run generate
  $ exit
  ```

* With user "admin", copy over the website to the nginx web server directory and change its ownership

  ```sh
  $ sudo rsync -av --delete /home/bitcoin-only/bitcoin-only/dist/ /var/www/bitcoin-only/
  $ sudo chown -R www-data:www-data /var/www/bitcoin-only
  ```

* Launch the website or refresh it with `F5` if already opened in your browser.

---

## Uninstall

* With the "admin" user, delete all the Bitcoin Only-related nginx files and directories

  ```sh
  $ sudo rm /etc/nginx/sites-available/bitcoin-only-ssl.conf
  $ sudo rm /etc/nginx/sites-enabled/bitcoin-only-ssl.conf
  $ sudo rm -r /var/www/bitcoin-only
  ```

* Reload nginx configuration

  ```sh
  $ sudo nginx -t
  > nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
  > nginx: configuration file /etc/nginx/nginx.conf test is successful
  $ sudo systemctl reload nginx
  ```

* With the "root" user, delete the "bitcoin-only" user

  ```sh
  $ userdel -r bitcoin-only
  ```

<br /><br />

---

<< Back: [+ Others](index.md)
