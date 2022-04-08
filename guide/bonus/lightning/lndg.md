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

Now we’ll make sure LNDgg starts as a service on the Raspberry Pi so it’s always running. 
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

* Enable the service, start it and check log logging output.

  ```sh
  $ sudo systemctl enable lndg.service
  $ sudo systemctl start lndg.service
  $ sudo journalctl -f -u lndg
  ```

### Backend refreshes

LNDg uses a Python script (`~/lndg/jobs.py`), to gather data about your node that is then displayed in the GUI dashboard. 
To have updated information in the GUI, it is necessary to regularly run the script to collect new data.

* As user “lndg”, create a simple bash file to call `jobs.py`

  ```sh
  $ sudo su - lndg
  $ nano ~/lndg/jobs.sh
  
  ```ini
  #!/bin/bash
  
  /home/lndg/lndg/.venv/bin/python /home/lndg/lndg/jobs.py
  ```

* Make the script executable by user “lndg”

  ```sh
  $ chmod u+x jobs.sh
  ```

* Create a service file for the `jobs.sh` script

  ```sh
  $ sudo nano /etc/systemd/system/lndg-jobs.service
  ```

  ```ini
  # RaspiBolt: systemd unit for LNDg
  # /etc/systemd/system/lndg.service
  
  [Unit]
  Description=LNDg
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

* Create a timer file to run `jobs.sh` every 60 seconds

  ```sh
  $ sudo nano /etc/systemd/system/lndg.timer
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

* Enable the timer to run the jobs service file at the specified interval

  ```sh
  $ sudo systemctl enable lndg.timer
  $ sudo systemctl start lndg.timer
  ```

