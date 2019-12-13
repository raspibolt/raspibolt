---
layout: default
title: Preparations
nav_order: 10
---
<!-- markdownlint-disable MD014 MD022 MD025 MD040 -->
# Preparations
{: .no_toc }

Let's get all the required parts and assemble the Raspberry Pi.

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

This guide builds on the easily available and very flexible Raspberry Pi 4.
This amazing piece of hardware is a tiny computer-on-a-chip, costs about $35 and consumes very little energy.

## Hardware requirements

It is advisable to get the latest Raspberry Pi for good performance:

* Raspberry Pi 4, 2+ GB RAM
* Micro SD card: 8 GB or more, incl. adapter to your regular computer
* strong USB power adapter: 5V/3A + USB-C cable
* External hard disk: 500 GB or more
* Optional: Raspberry Pi case

![Raspberry Pi](images/10_raspberrypi_hardware.png)
*Raspberry Pi 4: a tiny computer for $50*

To run a Lightning node, the full Bitcoin blockchain must be stored locally, which is ~250 GB and growing.
You can buy a cheap hard disk enclosure and reuse an old 500 GB hard disk.
I recommend getting a modern 2.5" SSD that can be powered through the USB connection to the Pi directly, which also speeds up initial sync time significantly.

## Assembly

TODO

## Write down your passwords

You will need several passwords and I find it easiest to write them all down in the beginning, instead of bumping into them throughout the guide.
They should be unique and very secure, at least 12 characters in length. Do **not use uncommon special characters**, spaces or quotes (‘ or “).

```console
[ A ] Master user password
[ B ] Bitcoin RPC password
[ C ] LND wallet password
[ D ] LND seed password (optional)
```

![xkcd: Password Strength](images/20_xkcd_password_strength.png)

If you need inspiration for creating your passwords: the [xkcd: Password Strength](https://xkcd.com/936/) comic is funny and contains a lot of truth.
Store a copy of your passwords somewhere safe (preferably in a password manager like [KeePass](https://keepass.info/)) and keep your original notes out of sight once your system is up and running.

---
Next: [Raspberry Pi >>](raspibolt_20_pi.md)
