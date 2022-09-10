---
layout: default
title: LNDg
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

# Bonus guide: LNDg
{: .no_toc }

---

[LNDg](https://github.com/cryptosharks131/lndg){:target="_blank"} is a lite GUI web interface to help you manually manage your node and automate operations such as rebalancing, fee adjustemnts and channel node opening.

Difficulty: Hard
{: .label .label-red }

Status: Tested v3
{: .label .label-green }

![LNDg](../../../images/lndg.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Requirements

* LND
* virtualenv

---

## Preparations

### Python virtual environment

[Virtualenv](https://virtualenv.pypa.io/en/latest/){:target="_blank"} is a tool to create isolated Python environments. 

* With user "admin", check if `virtualenv` is already installed on yout node. If not, use `apt` to install it.

  ```sh
  $ virtualenv --version
  > -bash: virtualenv: command not found
  $ sudo apt install virtualenv
  ```

### Firewall

* Configure firewall to allow incoming HTTP requests:

  ```sh
  $ sudo ufw allow 8889/tcp comment 'allow LNDg'
  $ sudo ufw status
  ```

---

## LNDg

### Installation

We do not want to run LNDg alongside bitcoind and lnd because of security reasons. 
For that we will create a separate user and we will be running the code as the new user. 

* Create a new user and make it a member of the "lnd" group to give it read access to the LND macaroons and data
  
  ```sh
  $ sudo adduser --disabled-password --gecos "" lndg
  $ sudo adduser lndg lnd
  ```
  
* Log in with the lndg user and create a symbolic link to the LND data directory

  ```sh
  $ sudo su - lndg
  $ ln -s /data/lnd /home/lndg/.lnd
  ```

* Clone the project GitHub repository and enter it

  ```sh
  $ git clone https://github.com/cryptosharks131/lndg.git
  $ cd lndg

* Setup a Python virtual environment

  ```sh
  $ virtualenv -p python .venv
  ```

* Install required dependencies and initialize some settings for your django site. 
A first time password will be output, save it somewhere safe (e.g., your password manager).

  ```sh
  $ .venv/bin/pip install -r requirements.txt
  $ .venv/bin/python initialize.py
  [...]
  > FIRST TIME LOGIN PASSWORD:abc...123
  ```

* Generate some initial node data for your dashboard.

  ```sh
  $ .venv/bin/python jobs.py
  ```

### First start

* Still with the "lndg" user, start the server

  ```sh
  $ cd ~/lndg
  $ .venv/bin/python manage.py runserver 0.0.0.0:8889
  > [...]
  > Starting development server at http://0.0.0.0:8889/
  > Quit the server with CONTROL-C.
  ```

* Now point your browser to the LNDg Python server, for example http://raspibolt.local:8889 
(or your nodes ip address, e.g. http://192.168.0.20:8889). 

* The initial login user is "lndg-admin" and the password is the one generated just above. 
If you didn't save the password, you can get it again with: `nano /home/lndg/lndg/data/lndg-admin.txt`

* Shut down the server with `Ctrl+c` 

* For extra security, delete the text file that contains the password

  ```sh
  $ rm /home/lndg/lndg/data/lndg-admin.txt
  ```

* Exit the "lndg" user session

  ```sh
  $ exit
  ```

### Autostart on boot  

Now we’ll make sure LNDg starts as a service on the Raspberry Pi so it’s always running. 
In order to do that, we create a systemd unit that starts the service on boot directly after LND.

* As user “admin”, create the service file.

  ```sh
  $ sudo nano /etc/systemd/system/lndg.service
  ```

  ```ini
  # RaspiBolt: systemd unit for LNDg
  # /etc/systemd/system/lndg.service
  
  [Unit]
  Description=LNDg
  After=lnd.service

  [Service]
  WorkingDirectory=/home/lndg/lndg
  ExecStart=/home/lndg/lndg/.venv/bin/python manage.py runserver 0.0.0.0:8889
  User=lndg
  
  StandardError=append:/var/log/lnd_jobs_error.log
  
  Restart=always
  RestartSec=30

  [Install]
  WantedBy=multi-user.target
  ```

* Enable, start and then check the status of the service. Exit with `Ctrl`+`c`.

  ```sh
  $ sudo systemctl enable lndg.service
  $ sudo systemctl start lndg.service
  $ sudo systemctl status lndg.service
  ```

* Check LNDg logs
 
  ```sh
  $ sudo journalctl -f -u lndg.service
  ```

You can now access LNDg from within your local network by browsing to http://raspibolt.local:8889 (or your equivalent IP address).

### Enable Nginx and SSL for LNDg

This will allow Nginx to serve the LNDg site securely over SSL.

* Connect as the "lndg" user

  ```sh
  $ sudo su - lndg
  ```

* Create `lndg.ini` file

  ```sh
  $ nano /home/lndg/lndg/lndg.ini
  ```
  
  ```
  # lndg.ini file
  [uwsgi]

  # Django-related settings
  # the base directory (full path)
  chdir           = /home/lndg/lndg
  # Django's wsgi file
  module          = lndg.wsgi
  # the virtualenv (full path)
  home            = /home/lndg/lndg/.venv
  #location of log files
  logto           = /var/log/uwsgi/%n.log

  # process-related settings
  # master
  master          = true
  # maximum number of worker processes
  processes       = 1
  # the socket (use the full path to be safe
  socket          = /home/lndg/lndg/lndg.sock
  # ... with appropriate permissions - may be needed
  chmod-socket    = 660
  # clear environment on exit
  vacuum          = true
  ```

* Create uwsgi parameters file

  ```sh
  $ nano /home/lndg/lndg/uwsgi_params
  ```
  
  ```sh
  uwsgi_param  QUERY_STRING       "$query_string";
  uwsgi_param  REQUEST_METHOD     "$request_method";
  uwsgi_param  CONTENT_TYPE       "$content_type";
  uwsgi_param  CONTENT_LENGTH     "$content_length";
  
  uwsgi_param  REQUEST_URI        "$request_uri";
  uwsgi_param  PATH_INFO          "$document_uri";
  uwsgi_param  DOCUMENT_ROOT      "$document_root";
  uwsgi_param  SERVER_PROTOCOL    "$server_protocol";
  uwsgi_param  REQUEST_SCHEME     "$scheme";
  uwsgi_param  HTTPS              "$https if_not_empty";

  uwsgi_param  REMOTE_ADDR        "$remote_addr";
  uwsgi_param  REMOTE_PORT        "$remote_port";
  uwsgi_param  SERVER_PORT        "$server_port";
  uwsgi_param  SERVER_NAME        "$server_name";
  ```

* Return to the "admin" account

  ```sh
  $ exit
  ```

* Enable uwsgi as a service

  ```sh
  $ sudo nano /etc/systemd/system/uwsgi.service
  ```
  
  ```
  [Unit]
  Description=Lndg uWSGI app
  After=lnd.service

  [Service]
  ExecStart=/home/lndg/lndg/.venv/bin/uwsgi --ini /home/lndg/lndg/lndg.ini
  User=lndg
  Group=www-data
  Restart=on-failure
  # Wait 4 minutes before starting to give LND time to fully start.  Increase if needed.
  TimeoutStartSec=240
  RestartSec=30
  KillSignal=SIGQUIT
  Type=notify
  StandardError=syslog
  NotifyAccess=all
  
  [Install]
  WantedBy=sockets.target
  ```
  
  
* Create new Nginx site

  ```sh
  $ sudo nano /etc/nginx/sites-available/lndg-ssl.conf
  ```
  
  ```sh
  upstream django {
    server unix:///home/lndg/lndg/lndg.sock; # for a file socket
  }

  server {
    # the port your site will be served on
    listen 8889 ssl;
    listen [::]:8889 ssl;
    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
    ssl_session_timeout 4h;
    ssl_protocols TLSv1.3;
    ssl_prefer_server_ciphers on;

    # the domain name it will serve for
    server_name _; 
    charset     utf-8;

    # max upload size
    client_max_body_size 75M;

    # max wait for django time
    proxy_read_timeout 180;

    # Django media
    location /static {
        alias /home/lndg/lndg/gui/static; # your Django project's static files - amend as required
    }

    # Finally, send all non-media requests to the Django server.
    location / {
        uwsgi_pass  django;
        include     /home/lndg/lndg/uwsgi_params; # the uwsgi_params file
    }
  }
  ```

* Verfiy site syntax

  ```sh
  $ sudo nginx -t
  ```

* Enable newly created site
  
  ```sh
  $ sudo ln -sf /etc/nginx/sites-available/lndg-ssl.conf /etc/nginx/sites-enabled/
  ```

* Create log and sock files
  
  ```sh
  $ sudo touch /var/log/uwsgi/lndg.log
  $ sudo chgrp www-data /var/log/uwsgi/lndg.log
  $ sudo chmod 660 /var/log/uwsgi/lndg.log
 
  $ sudo touch /home/lndg/lndg/lndg.sock
  $ sudo chown lndg:www-data /home/lndg/lndg/lndg.sock
  $ sudo chmod 660 /home/lndg/lndg/lndg.sock
  ```

* Verify Nginx service is enabled.

  ```sh
  $ sudo systemctl enable nginx
  ```
  
* Enable uwsgi service

  ```sh
  $ sudo systemctl enable uwsgi
  $ sudo systemctl start uwsgi
  ```
  
* Verfiy uwsgi service has started and is running

  ```sh
  $ sudo systemctl status uwsgi
  $ sudo journalctl -f -u uwsgi
  ```
  
* Restart Nginx service

  ```sh
  $ sudo systemctl restart nginx
  ```
  
Now point your browser to the secure access point provided by NGINX, for example https://raspibolt.local:8889 (or your nodes IP address like https://192.168.0.20:8889).

Note that the lndg-admin password can be changed here: https://raspibolt.local:8889/lndg-admin

If you recieve a '502 Bad Gateway' error when attempting to access the secure site, it may be that LNDg tried to start before the LND service was fully initialized.  If this is the case, wait a few minutes and restart the uwsgi service:
  ```sh
  $ sudo systemctl restart uwsgi
  ```
After it has restarted, try accessing the secure site again.  Once all the services have started and initialized, you should have no trouble.

If you receive the 502 error after a node restart, you may want to increase the TimeoutStartSec value in the uwsgi.service file:
  
  ```sh
  $ sudo vi /etc/systemd/system/uwsgi.service
  ```

### Backend refreshes

LNDg uses a Python script (`~/lndg/jobs.py`), to gather data about your node that is then displayed in the GUI dashboard. 
To have updated information in the GUI, it is necessary to regularly run the script to collect new data.

* As user “lndg”, create a bash file to call `jobs.py` and paste the following lines. Save and exit.

  ```sh
  $ sudo su - lndg
  $ cd lndg
  $ nano ~/lndg/jobs.sh
  ```

  ```ini
  #!/bin/bash
  
  /home/lndg/lndg/.venv/bin/python /home/lndg/lndg/jobs.py
  ```

* Make the script executable by user “lndg” then exit the "lndg" user session

  ```sh
  $ chmod u+x jobs.sh
  $ exit
  ```

* Create a service file for the `jobs.sh` script

  ```sh
  $ sudo nano /etc/systemd/system/jobs-lndg.service
  ```

  ```ini
  # RaspiBolt: systemd unit for LNDg
  # /etc/systemd/system/jobs-lndg.service
  
  [Unit]
  Description=LNDg jobs
  After=lnd.service

  [Service]
  WorkingDirectory=/home/lndg/lndg
  ExecStart=/usr/bin/bash /home/lndg/lndg/jobs.sh
  User=lndg
  
  StandardError=append:/var/log/lnd_jobs_error.log
  
  Restart=always
  RestartSec=30

  [Install]
  WantedBy=multi-user.target
  ```

* Create a timer file to run `jobs.sh` every 60 seconds. Save and exit.

  ```sh
  $ sudo nano /etc/systemd/system/jobs-lndg.timer
  ```

  ```ini
  [Unit]
  Description=Run Lndg Jobs Every 60 Seconds

  [Timer]
  OnBootSec=300
  OnUnitActiveSec=60
  AccuracySec=1
  
  [Install]
  WantedBy=timers.target
  ```

* Enable the timer to run the jobs service file at the specified interval. Check the status of the timer and exit with `Ctrl`+`c`.

  ```sh
  $ sudo systemctl enable jobs-lndg.timer
  $ sudo systemctl start jobs-lndg.timer
  $ sudo systemctl status jobs-lndg.timer
  ```

### Rebalancer runs

LNDg uses a Python script (`~/lndg/rebalancer.py`), to automatically create circular rebalancing payments based on user-defined parameters.

* Log in with user "lndg" and enter the LNDg repository

  ```sh
  $ sudo su - lndg
  $ cd lndg
  ```

* As user “lndg”, create a bash file to call `rebalance.py` and paste the following lines. Save and exit.

  ```sh
  $ nano /home/lndg/lndg/rebalancer.sh
  ```
  
  ```ini
  #!/bin/bash

  /home/lndg/lndg/.venv/bin/python /home/lndg/lndg/rebalancer.py
  ```
* Make the script executable by user “lndg” then exit the "lndg" user session

  ```sh
  $ chmod u+x rebalancer.sh
  $ exit
  ```

* Create a service file for the `rebalancer.sh` script

  ```sh
  $ sudo nano /etc/systemd/system/rebalancer-lndg.service
  ```

  ```ini
  [Unit]
  Description=Run Rebalancer For Lndg

  [Service]
  User=lndg
  Group=lndg
  ExecStart=/usr/bin/bash /home/lndg/lndg/rebalancer.sh
  StandardError=append:/var/log/lnd_rebalancer_error.log
  RuntimeMaxSec=3600
  ```

* Create a timer file to run `jobs.sh` every 60 seconds. Save and exit.

  ```sh
  $ sudo nano /etc/systemd/system/rebalancer-lndg.timer
  ```

  ```ini
  [Unit]
  Description=Run Lndg Jobs Every 60 Seconds

  [Timer]
  OnBootSec=300
  OnUnitActiveSec=60
  AccuracySec=1
  
  [Install]
  WantedBy=timers.target
  ```

* Enable and start the timer to run the rebalancer service file at the specified interval. Check the status of the timer and exit with `Ctrl`+`c`.

  ```sh
  $ sudo systemctl enable rebalancer-lndg.timer
  $ sudo systemctl start rebalancer-lndg.timer
  $ sudo systemctl status rebalancer-lndg.timer
  ```

### HTLC failure stream data

* Log in with user "lndg" and enter the LNDg repository

  ```sh
  $ sudo su - lndg
  $ cd lndg
  ```

* As user “lndg”, create a bash file to call `htlc_stream.py` and paste the following lines. Save and exit.

  ```sh
  $ nano /home/lndg/lndg/htlc_stream.sh
  ```
  
  ```ini
  #!/bin/bash

  /home/lndg/lndg/.venv/bin/python /home/lndg/lndg/htlc_stream.py
  ```

* Make the script executable by user “lndg” then exit the "lndg" user session

  ```sh
  $ chmod u+x htlc_stream.sh
  $ exit
  ```

* Create a service file for the `htlc_stream.sh` script

  ```sh
  $ sudo nano /etc/systemd/system/htlc-stream-lndg.service
  ```

  ```ini
  [Unit]
  Description=Run HTLC Stream For Lndg

  [Service]
  User=lndg
  Group=lndg
  ExecStart=/usr/bin/bash /home/lndg/lndg/htlc_stream.sh
  StandardError=append:/var/log/lnd_htlc_stream_error.log
  Restart=on-failure
  RestartSec=60s
  
  [Install]
  WantedBy=multi-user.target
  ```

* Enable, start and then check the status of the service. Exit with `Ctrl`+`c`.

  ```sh
  $ sudo systemctl enable htlc-stream-lndg.service
  $ sudo systemctl start htlc-stream-lndg.service
  $ sudo systemctl status htlc-stream-lndg.service
  ```

---

## For the future: LNDg update

* With user "admin", stop all the LNDg services and open a “lndg” user session.

  ```sh
  $ sudo systemctl stop htlc-stream-lndg.service
  $ sudo systemctl stop rebalancer-lndg.timer
  $ sudo systemctl stop jobs-lndg.timer
  $ sudo systemctl stop lndg.service
  $ sudo su - lndg
  ```

* Fetch the latest GitHub repository information, display the release tags (use the latest 1.3.0 in this example), and update:

  ```sh
  $ cd /home/lndg/lndg
  $ git fetch
  $ git reset --hard HEAD
  $ git tag
  $ git checkout 1.3.0
  $ ./venv/bin/pip install -r requirements.txt
  $ exit
  ```
  
* Start the services again.

  ```sh
  $ sudo systemctl start lndg.service
  $ sudo systemctl start jobs-lndg.timer
  $ sudo systemctl start rebalancer-lndg.timer
  $ sudo systemctl start htlc-stream-lndg.service
  ```

<br /><br />

---

<< Back: [+ Lightning](index.md)
