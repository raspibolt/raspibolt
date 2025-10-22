---
layout: default
title: Privacy
nav_order: 50
parent: Raspberry Pi
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->
{% include include_metatags.md %}

# Privacy
{: .no_toc }

We configure Tor to run your node anonymously.

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

Running your own Bitcoin and Lightning node at home makes you a direct, sovereign peer on the Bitcoin network.
However, if not configured without privacy in mind, it also tells the world that there is someone with Bitcoin at that address.

True, it's only your IP address that is revealed, but using services like [iplocation.net](https://www.iplocation.net){:target="_blank"}, your physical address can be determined quite accurately.
Especially with Lightning, your IP address would be widely used.
We need to make sure that you keep your privacy.

We'll also make it easy to connect to your node from outside your home network as an added benefit.

---

## Tor Project

We use Tor, a free software built by the [Tor Project](https://www.torproject.org){:target="_blank"}.
It allows you to anonymize internet traffic by routing it through a network of nodes, hiding your location and usage profile.

It is called "Tor" for "The Onion Router": information is routed through many hops and encrypted multiple times.
Each node decrypts only the layer of information addressed to it, learning only the previous and the next hop of the whole route. The data package is peeled like an onion until it reaches the final destination.

---

## Installation

Log in to your RaspiBolt via SSH as user "admin" and install Tor.

* Install apt-transport-https

  ```sh
  $ sudo apt install apt-transport-https
  ```

* Create a new file called `tor.list`
  
  ```sh
  $ sudo nano /etc/apt/sources.list.d/tor.list
  ```

* Add the following entries. Save and exit

  ```sh
  deb     [arch=arm64 signed-by=/usr/share/keyrings/tor-archive-keyring.gpg] https://deb.torproject.org/torproject.org bookworm main
  deb-src [arch=arm64 signed-by=/usr/share/keyrings/tor-archive-keyring.gpg] https://deb.torproject.org/torproject.org bookworm main
  ```

* Then up to `"root"` user temporarily to add the gpg key used to sign the packages by running the following command at your command prompt. Return to `admin` using `exit` command

  ```sh
  $ sudo su
  $ wget -qO- https://deb.torproject.org/torproject.org/A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89.asc | gpg --dearmor | tee /usr/share/keyrings/tor-archive-keyring.gpg >/dev/null
  $ exit
  ```

* Install tor and tor debian keyring

   ```sh
   $ sudo apt update
   $ sudo apt install tor deb.torproject.org-keyring
   ```

* Check Tor has been correctly installed

  ```sh
  $ tor --version
  > Tor version 0.4.7.10.
  [...]
  ```

## Configuration

Bitcoin Core will communicate directly with the Tor daemon to route all traffic through the Tor network.
We need to enable Tor to accept instructions through its control port, with the proper authentication.

* Modify the Tor configuration by uncommenting (removing the `#`) or adding the following lines.
Save and exit

  ```sh
  $ sudo nano /etc/tor/torrc
  ```

  ```sh
  # uncomment:
  ControlPort 9051
  CookieAuthentication 1

  # add:
  CookieAuthFileGroupReadable 1
  ```

* Reload Tor configuration to activate the modifications

  ```sh
  $ sudo systemctl reload tor
  ```

* Ensure that the Tor service is working and listening at the default ports `9050` and `9051`

  ```sh
  $ sudo ss -tulpn | grep tor | grep LISTEN
  ```

Expected output:

  ```sh
  tcp   LISTEN 0      4096           127.0.0.1:9050       0.0.0.0:*    users:(("tor",pid=1847,fd=6))
  tcp   LISTEN 0      4096           127.0.0.1:9051       0.0.0.0:*    users:(("tor",pid=1847,fd=7))
  ```

* Check the systemd journal to see Tor real time updates output logs.
  
  ```sh
  $ sudo journalctl -f -u tor@default
  ```

Not all network traffic is routed over the Tor network.
But we now have the base to configure sensitive applications to use it.

---

## SSH remote access through Tor (optional)

If you want to log into your RaspiBolt with SSH when you're away, you can easily do so by adding a Tor hidden service.
This makes "calling home" very easy, without the need to configure anything on your internet router.

### SSH server

* Add the following three lines in the "location-hidden services" section of the `torrc` file.
Save and exit

  ```sh
  $ sudo nano /etc/tor/torrc
  ```

  ```sh
  ############### This section is just for location-hidden services ###
  # Hidden Service SSH server
  HiddenServiceDir /var/lib/tor/hidden_service_sshd/
  HiddenServiceVersion 3
  HiddenServicePort 22 127.0.0.1:22
  ```

* Reload Tor configuration and look up your Tor connection address

  ```sh
  $ sudo systemctl reload tor
  $ sudo cat /var/lib/tor/hidden_service_sshd/hostname
  > abcdefg..............xyz.onion
  ```

* Save the Tor address in a secure location, e.g., your password manager.

### SSH client

You also need to have Tor installed on your regular computer where you start the SSH connection.
Usage of SSH over Tor differs by client and operating system.

A few examples:

* **Windows**: configure PuTTY as described in this guide [Torifying PuTTY](https://gitlab.torproject.org/legacy/trac/-/wikis/doc/TorifyHOWTO/Putty){:target="_blank"} by the Tor Project.

  * **Note:** If you are using PuTTy and fail to connect to your Pi by setting port 9050 in the PuTTy proxy settings, try setting port 9150 instead. When Tor runs as an installed application instead of a background process it uses port 9150.

* **Linux**: use `torify` or `torsocks`.
  Both work similarly; just use whatever you have available:

  ```sh
  $ torify ssh admin@abcdefg..............xyz.onion
  ```

  ```sh
  $ torsocks ssh admin@abcdefg..............xyz.onion
  ```

* **macOS**: Using `torify` or `torsocks` may not work due to Apple's *System Integrity Protection (SIP)* which will deny access to `/usr/bin/ssh`.

  To work around this, first make sure Tor is installed and running on your Mac:

  ```sh
  $ brew install tor && brew services start tor
  ```

  You can SSH to your Pi "out of the box" with the following proxy command:

  ```sh
  $ ssh -o "ProxyCommand nc -X 5 -x 127.0.0.1:9050 %h %p" admin@abcdefg..............xyz.onion
  ```

  For a more permanent solution, add these six lines below to your local SSH config file. Choose any HOSTNICKNAME you want, save and exit.

  ```sh
  $ sudo nano .ssh/config
  ```

  ```sh
  Host HOSTNICKNAME
    Hostname abcdefg..............xyz.onion
    User admin
    Port 22
    CheckHostIP no
    ProxyCommand /usr/bin/nc -x localhost:9050 %h %p
  ```

  Restart Tor

  ```sh
  $ brew services restart tor
  ```

  You should now be able to SSH to your Pi with

  ```sh
  $ ssh HOSTNICKNAME
  ```

<br /><br />

---

Next: [Bitcoin >>](../bitcoin/index.md)
