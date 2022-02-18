---
layout: default
title: Web Dashboard
nav_order: 10
parent: Lightning
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->
# Node Management: Web Dashboard
{: .no_toc }

We set up [Homer](https://github.com/bastienwirtz/homer#readme){:target="_blank"}, a simple static web dashboard to keep our services on hand, from a simple yaml configuration file. 

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Preparations

### Firewall

* Configure the UFW firewall to allow incoming HTTPS requests

  ```sh
  $ sudo ufw allow 4091/tcp comment 'allow Homer SSL'
  $ sudo ufw status
  ```

## Installation

### Data directory

* Create the "homer" service user and open a new session 

  ```sh
  $ sudo adduser --disabled-password --gecos "" homer
  $ mkdir /data/homer
  $ sudo chown homer:homer /data/homer
  $ sudo su - homer
  ```

### Installation

* Retrieve the source code repository

  ```sh
  $ git clone https://github.com/bastienwirtz/homer.git
  $ cd homer
  $ npm install
  $ npm run build
  $ cp dist/assets/config.yml.dist dist/assets/config.yml
  $ cp dist/assets/config.yml /data/homer/config.yml
  $ exit
  ```

* Install the output into a webroot folder and change its ownership to the “www-data” user

  ```sh
  $ sudo rsync -av --delete /home/homer/homer/dist/ /var/www/homer/
  $ sudo chown -R www-data:www-data /var/www/homer
  ```

### nginx

* Create a nginx configuration file for the Homer website with a server listening on port 4091

  ```sh
  $ sudo nano /etc/nginx/sites-available/homer_ssl.conf
  ```

  ```sh
  $ ## homer-ssl.conf
  $
  $
  $ server {
  $     listen 4091 ssl;
  $     listen [::]:4091 ssl;
  $     server_name _;
  $ 
  $     #include /etc/nginx/snippets/ssl-params.conf;
  $     #include /etc/nginx/snippets/ssl-certificate-app-data.conf;
  $     ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
  $     ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
  $     ssl_session_timeout 4h;
  $     ssl_protocols TLSv1.3;
  $     ssl_prefer_server_ciphers on;
  $ 
  $     access_log /var/log/nginx/access_homer.log;
  $     error_log /var/log/nginx/error_homer.log;
  $ 
  $     root /var/www/homer;
  $     index index.html;
  $ 
  $ 
  $ }
  ```

  ```sh
  $ sudo ln -s /data/homer/config.yml /var/www/homer/assets/config.yml
  $ sudo chown www-data:www-data config.yml
  $ sudo chown www-data:www-data /data/homer/config.yml
  ```

*  Create a symlink in the sites-enabled directory

  ```sh
  $ sudo ln -sf /etc/nginx/sites-available/homer-ssl.conf /etc/nginx/sites-enabled/
  ```

* Test and reload nginx configuration

  ```sh
  $ sudo nginx -t
  > nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
  > nginx: configuration file /etc/nginx/nginx.conf test is successful
  $ sudo systemctl restart nginx
  ```



