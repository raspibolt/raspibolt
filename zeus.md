---
layout: default
title: Zeus
nav_order: 60
parent: Lightning
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->
# Zeus
{: .no_toc }

We install [Zeus](https://zeusln.app/){:target="_blank"}, a cross-platform mobile app that connect to your LN node over Tor.  Make payments with lightning or on-chain and manage your channels wihle you're on the go.

![Zeus](images/zeus.png)

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Preparations

### Access over Tor

Zeus will access the node via Tor.

* Add the following three lines in the section for “location-hidden services” in the `torrc` file. Save and exit.

  ```sh
  $ sudo nano /etc/tor/torrc
  ```

  ```ini
  ############### This section is just for location-hidden services ###
  HiddenServiceDir /var/lib/tor/hidden_service_lnd_rest/
  HiddenServiceVersion 3
  HiddenServicePort 8080 127.0.0.1:8080
  ```

* Reload Tor configuration and get your connection address.

   ```sh
   $ sudo systemctl reload tor
   $ sudo cat /var/lib/tor/hidden_service_lnd_rest/hostname
   > abcdefg..............xyz.onion
   ```

* Save the onion address in a safe place (e.g., password manager)

### Install lndconnect

[lndconnect](https://github.com/LN-Zap/lndconnect){:target="_blank"}, created by Zap, is a utility that generates QR Code or URI to connect applications to lnd instances.

* Download the binary and install it

  ```sh
  $ cd /tmp
  $ wget https://github.com/LN-Zap/lndconnect/releases/download/v0.2.0/lndconnect-linux-arm64-v0.2.0.tar.gz
  $ tar -xvf lndconnect-linux-arm64-v0.2.0.tar.gz
  $ sudo install -m 0755 -o root -g root -t /usr/local/bin lndconnect-linux-arm64-v0.2.0/lndconnect
  $ rm lndconnect-linux-arm64-v0.2.0.tar.gz
  $ rm -R lndconnect-linux-arm64-v0.2.0
  $ cd ~/
  ```

### Create a lndconnect QR code

lnconnect can generate a URI and create a QR code that can then be read by Zeus.

* Still with the "lndconnect" user, use the following command. Make sure to replace the .onion address with the one you generated above.

  ```sh  
  $ lndconnect --host=abcdefg..............xyz.onion --port=8080
  ```
  
* It will be a big QR code so maximize your terminal window and use CTRL - to shrink the code further to fit the screen

* Keep the SSH session with the QR code opened, it will be needed later

---

## Installation

### Install the Zeus app

On Android, download the Zeus app on F-Droid or Google Play.  

On iOS, download it from the Apple App Store.

---

### Connect Zeus to your node

* Open Zeus and click on 'Get started'

* The screen proposes several settings, we'll come back to them later, for now select 'Connect a node' at the top, and then '+ Add a new node'

* Click on 'Use Tor'

* Click on 'Scan LNDConnect config' and when prompted, allow Zeus to take pictures

* Scan the QR code generated earlier

* Click on 'Save settings', Zeus is now connecting to your node, it might take a while the first time.

---

### Security

#### Add a password to access your node in the app

* In the app, go to the settings and select 'Security' and set a passphrase (save your passphrase somewhere safe, e.g., your password manager).

#### Temporarily disabling the Tor hidden service

* If you don't plan to use the Zeus app for a significant period of time, it is safer to disable the Tor hidden service. With user "admin", open the torrc configuration file, comment out the LND REST API Tor hidden service lines, save and exit and restart Tor.

  ```sh
  $ sudo nano /etc/tor/torrc
  ```

  ```ini
  #HiddenServiceDir /var/lib/tor/hidden_service_lnd_rest/
  #HiddenServiceVersion 3
  #HiddenServicePort 8080 127.0.0.1:8080
  ```
  
  ```sh
  $ sudo systemctl reload tor
  ```

* If you want to reuse Zeus later on, uncomment the three lines and restart Tor

---

## Zeus in action

Below is a list of Zeus existing (ticked) and coming soon (unticked) features:

![Zeus](images/zeus-features.png)

---

## Update

To update Zeus, update the app using F-Droid, Play Store or the Apple Store.

---

## Uninstall

To uninstall, you need to uninstall the app on your phone and deactivate the LND REST API Tor hidden service

* Uninstall the app on your phone

* To deactivate the LND REST API Tor hidden service, follow the guidelines in [this section](#temporarily-disabling-the-tor-hidden-service)

<br /><br />

---

Next: [Bonus Section >>](bonus/index.md)
