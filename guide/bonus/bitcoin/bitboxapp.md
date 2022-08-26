---
layout: default
title: BitBoxApp
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---

# Bonus guide: BitBoxApp
{: .no_toc }

Difficulty: Easy
{: .label .label-green }

Status: Not tested v3
{: .label .label-yellow }

![BitBoxApp](../../images/electrum_BitBoxApp.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Connect BitBoxApp

The [BitBoxApp](https://shiftcrypto.ch/app/){:target="_blank"} is a beginner-friendly companion app to the BitBox02 hardware wallet by Shift Crypto.

### General

On your regular computer, configure the BitBoxApp to use your RaspiBolt:

* In the sidebar, select `Settings` > `Connect your own full node`
* In the field "Enter the endpoint" enter the hostname or ip address and the port, e.g. `raspibolt.local:50002`
* Click on "Download remote certificate"
* Click "Check", you should be prompted with the message "Successfully establised a connection"
* Click "Add" to add your server to the list on the top
* Remove the Shift servers to only connect to your own server

### Tor

If you have Tor installed on your computer, you can access your RaspiBolt remotely over Tor.

* In the sidebar, select `Settings` > `Enable tor proxy`
* Enable it and confirm the proxy address (usually the default `127.0.0.1:9050`)
* When adding your RaspiBolt full node as described above, use your Tor address (e.g. `gwdllz5g7vky2q4gr45zGuvopjzf33czreca3a3exosftx72ekppkuqd.onion:50002`)


<br /><br />

---

<< Back: [+ Bitcoin](index.md)
