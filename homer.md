---
layout: default
title: Web Dashboard
nav_order: 10
parent: Node Management
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->

# Web Dashboard
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

---

## Homer

### Installation

* Create the "homer" service user, create the data directory and open a new session 

  ```sh
  $ sudo adduser --disabled-password --gecos "" homer
  $ mkdir /data/homer
  $ sudo chown homer:homer /data/homer
  $ sudo su - homer
  ```

* Retrieve the source code repository and install Homer

  ```sh
  $ git clone https://github.com/bastienwirtz/homer.git
  $ cd homer
  $ npm install
  $ npm run build
  ```

* Move the distributable output into a webroot folder and change its ownership to the “www-data” user.

  ```sh
  $ sudo rsync -av --delete /home/homer/homer/dist/ /var/www/homer/
  $ sudo chown -R www-data:www-data /var/www/homer
  ```

### nginx

* Create a nginx configuration file for the Homer website with a HTTPS server listening on port 4091

  ```sh
  $ sudo nano /etc/nginx/sites-available/homer-ssl.conf
  ```

  ```ini
  ## homer-ssl.conf
  
  
  server {
      listen 4091 ssl;
      listen [::]:4091 ssl;
      server_name _;
  
      ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
      ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
      ssl_session_timeout 4h;
      ssl_protocols TLSv1.3;
      ssl_prefer_server_ciphers on;

      access_log /var/log/nginx/access_homer.log;
      error_log /var/log/nginx/error_homer.log;
 
      root /var/www/homer;
      index index.html;
  
  
  }
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

### Configuration

A sample configuration file is available at `/home/homer/homer/dist/assets/config.yml.dist`. We will create a configuration file derived from this default configuration but tailored to the RaspiBolt.

* Create a new configuration file in the Homer data directory and paste the following configuration settings. Save and exit.

  ```sh
  $ sudo nano /data/homer/config.yml
  ```

  ```ini
  --
  # Homepage configuration
  
  title: "RaspiBolt Dashboard"
  subtitle: "Homer"
  logo: "logo.png"
  
  header: true
  footer: '<p>Created with <span class="has-text-danger">❤️</span> with <a href="https://bulma.io/">bulma</a>, <a href="https://vuejs.org/">vuejs</a> & <a href="https://fontawesome.com/">font awesome</a> // Fork me on <a href="https://github.com/bastienwirtz/homer"><i class="fab fa-github-alt"></i></a></p>' # set false if you want to hide it.
  
  # Optional theme customization
  theme: default
  colors:
    light:
      highlight-primary: "#3367d6"
      highlight-secondary: "#4285f4"
      highlight-hover: "#5a95f5"
      background: "#f5f5f5"
      card-background: "#ffffff"
      text: "#363636"
      text-header: "#ffffff"
      text-title: "#303030"
      text-subtitle: "#424242"
      card-shadow: rgba(0, 0, 0, 0.1)
      link: "#3273dc"
      link-hover: "#363636"
    dark:
    highlight-primary: "#3367d6"
      highlight-secondary: "#4285f4"
      highlight-hover: "#5a95f5"
      background: "#131313"
      card-background: "#2b2b2b"
      text: "#eaeaea"
      text-header: "#ffffff"
      text-title: "#fafafa"
      text-subtitle: "#f5f5f5"
      card-shadow: rgba(0, 0, 0, 0.4)
      link: "#3273dc"
      link-hover: "#ffdd57"
  
  # Optional message
  message:
    style: "is-dark"
    title: "RaspiBolt"
    icon: "fab fa-raspberry-pi"
    content: "Bitcoin & Lightning Node"
  
  # Optional navbar
  # links: [] # Allows for navbar (dark mode, layout, and search) without any links
  links:
    - name: "Guide"
      icon: "fas fa-book"
      url: "https://www.raspibolt.org/"
      target: "_blank"  
    - name: "Community"
      icon: "fab fa-telegram"
      url: "https://t.me/raspibolt/"
      target: "_blank"  
    - name: "Contribute"
      icon: "fab fa-github"
      url: "https://github.com/raspibolt/raspibolt"
      target: "_blank" # optional html a tag target attribute
  
  # Services
  # First level array represent a group.
  # Leave only a "items" key if not using group (group name, icon & tagstyle are optional, section separation will>
  services:
    - name: "Bitcoin"
      icon: "fab fa-bitcoin"
      items:
        - name: "BTC RPC Explorer"
          icon: "fab fa-wpexplorer"
          subtitle: "Blockchain explorer"
          tag: "app"
          url: "https://192.168.0.171:4000/"
          target: "_blank"
    - name: "Lightning"
      icon: "fas fa-bolt"
      items:
        - name: "Ride The Lightning"
          icon: "fas fa-horse-head"
          subtitle: "Web app"
          tag: "app"
          url: "https://192.168.0.171:4001/rtl/login"
          target: "_blank"
  
  ```
  
🔍 * If you want to tweak the dashboard to your own tatse, check the full configuration guidelines on the [Homer repository](https://github.com/bastienwirtz/homer/blob/main/docs/configuration.md){:target="_blank"}. Search for compatible icons on the [Font Awesome webpage](https://fontawesome.com/icons){:target="_blank"}. Read about styling options on the [Bulma CSS framework webapge](https://bulma.io/documentation/components/message/#colors){:target="_blank"}.

* Create a symlink to the configuration file and change its ownshership to the "www-data" user

  ```sh
  $ sudo ln -s /data/homer/config.yml /var/www/homer/assets/config.yml
  $ sudo chown www-data:www-data /var/www/homer/assets/config.yml
  ```

### First start

Test starting Homer manually first to make sure it works.

  ```sh
  $ sudo su - homer
  $ cd homer
  $ npm run serve
  ```
  
Now point your browser to the secure access point provided by the nginx server, for example https://raspibolt.local:4091 (or your nodes IP address, e.g. https://192.168.0.20:4091).  

Your browser will display a warning, because we use a self-signed SSL certificate. There’s nothing we can do about that, because we would need a proper domain name (e.g. https://yournode.com) to get an official certificate which browsers recognize. Click on “Advanced” and proceed to the Homer dashboard interface.

If everything worked, stop Homer in the terminal with `Ctrl`+`C` and exit the "homer" user session.

  ```sh
  $ exit
  ```

### Autostart on boot

Now we’ll make sure Homer starts as a service on the Raspberry Pi so it’s always running. In order to do that, we create a systemd unit that starts the service on boot directly.

* As user “admin”, create the service file.

  ```sh
  $ sudo nano /etc/systemd/system/homer.service
  ```

  ```ini
  # RaspiBolt: systemd unit for Homer
  # /etc/systemd/system/homer.service
  
  [Unit]
  Description=Homer
  After=lnd.service
  
  [Service]
  WorkingDirectory=/home/homer/homer
  ExecStart=/usr/bin/npm run serve
  User=homer
  
  Restart=always
  RestartSec=30
  
  [Install]
  WantedBy=multi-user.target
  ```

* Enable the service, start it and check log logging output.

  ```sh
  $ sudo systemctl enable homer
  $ sudo systemctl start homer
  $ sudo journalctl -f -u homer
  ```

---

## For the future: Homer upgrade

Updating to a [new release](https://github.com/bastienwirtz/homer/releases){:target="_blank"} is straight-forward. Make sure to read the release notes first.

* From user “admin”, stop the service and open a "homer" user session.

  ```sh
  $ sudo systemctl stop homer
  $ sudo su - homer
  ```

* Fetch the latest GitHub repository information (v9.99.9 in this example), and update:

  ```sh
  $ cd homer
  $ git fetch
  $ git describe --tags --abbrev=0
  $ git checkout v9.99.9
  $ npm install
  $ npm run build
  $ exit
  ```
  
* With the "admin" user, copy over the updated distributable output and re-create the symlink to the configuration file

  ```sh
  $ sudo rsync -av --delete /home/homer/homer/dist/ /var/www/homer/
  $ sudo chown -R www-data:www-data /var/www/homer
  $ sudo ln -s /data/homer/config.yml /var/www/homer/assets/config.yml
  $ sudo chown www-data:www-data /var/www/homer/assets/config.yml
  ```

* Start the service again.

  ```sh
  $ sudo systemctl start homer
  $ sudo journalctl -f -u homer
  ```

<br /><br />

---

Next: [Bonus Section >>](bonus/index.md)
