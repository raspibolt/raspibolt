---
layout: default
title: regolancer
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

# Bonus guide: regolancer
{: .no_toc }

---

[regolancer](https://github.com/rkfg/regolancer){:target="_blank"} simple LND rebalancer written in GO.

Difficulty: Easy
{: .label .label-green }

Status: Tested v3
{: .label .label-green }

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

![regolancer](https://github.com/rkfg/regolancer/blob/master/screenshot.png)

---

## Requirements

* LND
* GO

---

## Install GO

* Check the latest stable version of the arm64 binary at https://golang.org/dl/ and download it

  ```sh
  $ cd /tmp
  $ wget https://go.dev/dl/go1.19.2.linux-arm64.tar.gz
  ```

* Check on the download page what is the SHA256 checksum of the file, e.g. for the above:
b62a8d9654436c67c14a0c91e931d50440541f09eb991a987536cb982903126d. Calculate the SHA256 hash of the downloaded file. It should be the same number as the one on the website

  ```sh
  $ sha256sum go1.19.2.linux-arm64.tar.gz
  b62a8d9654436c67c14a0c91e931d50440541f09eb991a987536cb982903126d  go1.19.2.linux-arm64.tar.gz
  ```

* Install Go in the /usr/local directory

  ```sh
  $ sudo tar -xvf go1.19.2.linux-arm64.tar.gz  -C /usr/local
  $ rm go1.19.2.linux-arm64.tar.gz
  ```

* Add the binary to PATH to not have to type the full path each time you use it. For a global installation of Go (that users other than “admin” can use), open /etc/profile

  ```sh
  $ sudo nano /etc/profile
  ```

* Add the following line at the end of the file, save and exit.

  ```ini
  export PATH=$PATH:/usr/local/go/bin
  ```

* To make the changes effective immediately (and not wait for the next login), execute them from the profile using the following command.

  ```sh
  $ source /etc/profile
  ```

* Test that Go has been properly installed by checking its version

  ```sh
  $ go version
  go version go1.19.2 linux/arm64
  ```

---

## Install regolancer

* With user “admin”, create a new user “regolancer” and make it a member of the “lnd” group

  ```sh
  $ sudo adduser --disabled-password --gecos "" regolancer
  $ sudo adduser regolancer lnd
  ```

* With the “regolancer” user map the LND folder and install the program

  ```sh
  $ sudo su - regolancer

  $ ln -s /data/lnd /home/regolancer/.lnd

  $ go install github.com/rkfg/regolancer@v1.5.2
  ```
Note: Adjust the "regolancer@v1.5.1" part from the commands below to the actual version you have installed.

* Create a working copy of the sample config file. You can use either .json or .toml configs, up to your preference.  

  ```sh
  $ cp /home/regolancer/go/pkg/mod/github.com/rkfg/regolancer@v1.5.2/config.json.sample /home/regolancer/config.json
  ```

* Make the newly created config.json file writable.

  ```sh
  $ chmod 644 /home/regolancer/config.json
  ```

---

## Configuration

* Edit the config file and make sure you have the following changes in the beginning.

  ```sh
  $ nano /home/regolancer/config.json
  ```

  ```ini
    "macaroon_dir": "/home/regolancer/.lnd/data/chain/bitcoin/mainnet/",
	  "macaroon_filename": "admin.macaroon",
 	  "network": "mainnet",
 	  "tlscert": "/home/regolancer/.lnd/tls.cert",
  ```

Adjust the rest of the file as you wish with the options [regolancer config sample](https://github.com/rkfg/regolancer/blob/master/config.json.sample){:target="_blank"} provides, save, and exit.

---

## First run

* Run the Rebalancer (while in "regolancer" user session)

  ```sh
  $ go/bin/regolancer -f /home/regolancer/config.json
  ```

The regolancer will run until it finds a hit and will stop after that. To run it continuously, you will need to run it in a loop or a cron.

---

## Upgrade

* From user “admin”, open a “regolancer” user session and run the install script.

  ```sh
  $ sudo su - regolancer
  $ go install github.com/rkfg/regolancer@v1.5.x 
  ```

Please replace the v.1.5.x part with the version you would like to install.

---

## Uninstall

* If you want to uninstall regolancer, delete the “regolancer” user with the “root” user.

  ```sh
  $ userdel -r regolancer
  ```

Don't forget to remove any cronjobs or screens you may have set up in other users.