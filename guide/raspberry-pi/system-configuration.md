---
layout: default
title: System configuration
nav_order: 30
parent: Raspberry Pi
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->
{% include include_metatags.md %}

# System configuration
{: .no_toc }

You are now on the command line of your own Bitcoin node.
Let's start with the configuration.


---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Add the admin user (and log in with it)

We will use the primary user "admin" instead of "pi" to make this guide more universal.

* Create a new user called "admin" with your `password [A]`

  ```sh
  $ sudo adduser --gecos "" admin
  ```

* Make this new user a superuser by adding it to the "sudo" group

  ```sh
  $ sudo adduser admin sudo
  ```


* Exit your current "pi" user session and exit SSH

  ```sh
  $ exit
  ```

* Create a new connection with the `admin` user

* Log in again using SSH (see [Access with Secure Shell](remote-access.md#access-with-secure-shell) section), but now with the user "admin" and your `password [A]`

  ```sh
  $ ssh admin@raspibolt.local
  ```

To change the system configuration and files that don't belong to user "admin", you have to prefix commands with `sudo`.
You will be prompted to enter your admin password from time to time for increased security.

---

## System update

It is important to keep the system up-to-date with security patches and application updates.
The “Advanced Packaging Tool” (apt) makes this easy.

* Instruct your shell to always use the default language settings.
  This prevents annoying error messages.

  ```sh
  $ echo "export LC_ALL=C" >> ~/.bashrc
  $ source ~/.bashrc
  ```

* Update the operating system and all installed software packages

  ```sh
  $ sudo apt update
  $ sudo apt full-upgrade
  ```

  💡 Do this regularly every few months to get security-related updates.

* Make sure that all necessary software packages are installed:

  ```sh
  $ sudo apt install wget curl gpg git --install-recommends
  ```

---

## Check USB3 drive performance

A performant USB3 drive is essential for your node.
The Raspberry Pi 4 supports these out of the box, but is a bit picky.
Some USB3 adapters for external drives are not compatible and need a workaround to be usable.

Let's check if your drive works well as-is, or if additional configuration is needed.

* Install the software to measure the performance of your drive

  ```sh
  $ sudo apt install hdparm
  ```

* Your external disk should be connected as `/dev/sda`.
  Check if this is the case by listing the names of connected block devices

  ```sh
  $ lsblk -pli
  ```

* Measure the speed of your external drive

  ```sh
  $ sudo hdparm -t --direct /dev/sda
  > Timing O_DIRECT disk reads: 932 MB in  3.00 seconds = 310.23 MB/sec
  ```

If the measured speed is more than 50 MB/s, you're good, no further action needed.

If the speed of your USB3 drive is not acceptable, we need to configure the USB driver to ignore the UAS interface.

Check the [Fix bad USB3 performance](../troubleshooting.md#fix-bad-usb3-performance) entry in the Troubleshooting guide to learn how.

---

## Data directory

We'll store all application data in the dedicated directory `/data/`.
This allows for better security because it's not inside any user's home directory.
Additionally, it's easier to move that directory somewhere else, for instance to a separate drive, as you can just mount any storage option to `/data/`.

* Create the data directory

  ```sh
  $ sudo mkdir /data
  $ sudo chown admin:admin /data
  ```

---

## Increase swap file size

The swap file acts as slower memory and is essential for system stability.
The standard size of 100M is way too small.

* Edit the configuration file and comment the entry `CONF_SWAPSIZE` by placing a `#` in front of it.
  Save and exit.

  ```sh
  $ sudo nano /etc/dphys-swapfile
  ```
  ```
  # comment or delete the CONF_SWAPSIZE line. It will then be created dynamically
  #CONF_SWAPSIZE=100
  ```

* Recreate and activate new swapfile

  ```sh
  $ sudo dphys-swapfile install
  $ sudo systemctl restart dphys-swapfile.service
  ```

<br /><br />

---

Next: [Security >>](security.md)
