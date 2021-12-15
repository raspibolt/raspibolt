---
layout: default
title: Trezor Agent
parent: + Raspberry Pi
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

## Bonus guide: Trezor Agent
{: .no_toc }

Difficulty: Easy
{: .label .label-green }

Status: Not tested v3
{: .label .label-yellow }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

It is possible to SSH to your device using your Trezor (It should be possible with Ledger and Keepkey but I haven't tried)

* Using romanz's trezor-agent https://github.com/romanz/trezor-agent and Trezor's documentation https://wiki.trezor.io/Apps:SSH_agent
* This Process is currently only available on Linux

On your main machine -
Instal pre-requisites:
  ```sh
  $ sudo apt update && sudo apt install python3-pip libusb-1.0-0-dev libudev-dev pinentry-curses
  ```
Install trezor-agent
  ```sh
  $ pip3 install trezor_agent
  ```
Set up udev rules on your machine: While your device is disconnected, open a file with nano and paste the udev rules. Save and exit.
```sh
  $ sudo nano /etc/udev/rules.d/51-trezor.rules
```
```
# Trezor: The Original Hardware Wallet
# https://trezor.io/
#
# Put this file into /etc/udev/rules.d
#
# If you are creating a distribution package,
# put this into /usr/lib/udev/rules.d or /lib/udev/rules.d
# depending on your distribution
# Trezor
SUBSYSTEM=="usb", ATTR{idVendor}=="534c", ATTR{idProduct}=="0001", MODE="0660", GROUP="plugdev", TAG+="uaccess", TAG+="udev-acl", SYMLINK+="trezor%n"
KERNEL=="hidraw*", ATTRS{idVendor}=="534c", ATTRS{idProduct}=="0001", MODE="0660", GROUP="plugdev", TAG+="uaccess", TAG+="udev-acl"
# Trezor v2
SUBSYSTEM=="usb", ATTR{idVendor}=="1209", ATTR{idProduct}=="53c0", MODE="0660", GROUP="plugdev", TAG+="uaccess", TAG+="udev-acl", SYMLINK+="trezor%n"
SUBSYSTEM=="usb", ATTR{idVendor}=="1209", ATTR{idProduct}=="53c1", MODE="0660", GROUP="plugdev", TAG+="uaccess", TAG+="udev-acl", SYMLINK+="trezor%n"
KERNEL=="hidraw*", ATTRS{idVendor}=="1209", ATTRS{idProduct}=="53c1", MODE="0660", GROUP="plugdev", TAG+="uaccess", TAG+="udev-acl"
```
Generate a public keys for 'admin' and 'root' users, when asked enter the pin of your trezor and a passphrase
* You can use PASSWORD[A], or come up with a diffrent passphrase
```sh
$ trezor-agent admin@192.168.0.20
> ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBByrPrzZXq3ysny74YhYC3AQLBEx7ocjG7oy3C0r+dYui772sOxjDjTj+Ra+Pi7tDjO+m0kcfiMcRjxbB9eF/dg= <ssh://admin@192.168.0.20|nist256p1>
$ trezor-agent root@192.168.0.20
> ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBCD4lnzAIDCcMbA3MRjBALsAl4oQf2A1ILYyC/HtB6MeyPo5znrfuxcRdSSPHQ3AuN3/i7taZB2uZukPxZ+zbLA= <ssh://root@192.168.0.60|nist256p1>
```
Login to your pi as admin and add the public keys to your authorized keys file
```sh
$ sudo nano .ssh/authorized_keys
```
Substitute with the public keys you produced on your machine
```
...
ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBByrPrzZXq3ysny74YhYC3AQLBEx7ocjG7oy3C0r+dYui772sOxjDjTj+Ra+Pi7tDjO+m0kcfiMcRjxbB9eF/dg= <ssh://admin@192.168.0.20|nist256p1>
ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBCD4lnzAIDCcMbA3MRjBALsAl4oQf2A1ILYyC/HtB6MeyPo5znrfuxcRdSSPHQ3AuN3/i7taZB2uZukPxZ+zbLA= <ssh://root@192.168.0.60|nist256p1>
```
Copy the authorized keys file to the root user as well and exit
```sh
$ sudo su -
$ cp -r /home/admin/.ssh .ssh
$ exit
```
Exit from you pi
```sh
$ exit
```
SSH from your trezor as admin, enter pin and the password that you chosen
```sh
$ trezor-agent -c admin@192.168.0.20
```
or as root
```sh
$ trezor-agent -c root@192.168.0.20
```
If the SSH succeeded go to your authorized keys file and delete/comment out all other public keys
That's it, Now you can only SSH to your raspibolt using your trezor.

------

<< Back: [+ Raspberry Pi](index.md)
