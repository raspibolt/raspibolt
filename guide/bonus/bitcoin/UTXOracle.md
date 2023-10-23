---
layout: default
title: The UTXOracle python script
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---

## Bonus guide: The UTXOracle python script
{: .no_toc }

---

A very cool project by Daniel Hinton and Steve Jeffress that allows us to get a very precise approxiamation of the Bitcoin $USD price from the blockchain 
alone - without accessing any external site/exchange.

The sript is taken from the [UTXO.live](https://utxo.live/oracle){:target="_blank"} website run by the creators.
A Bitcoin Magazine article explaining the concepts available [here](https://bitcoinmagazine.com/technical/utxoracle-model-could-bring-use-cases-to-bitcoin){:target="_blank"}
In short the script is based on the fact that many utxo (15 percent on average) are in round $usd amounts ($100 and $50 mostly), so it should hold until
hyperbitcoinisation :)

Difficulty: Easy
{: .label .label-green }

Status: Tested v3
{: .label .label-green }

## Installation

This script can be run by user "admin" without root privileges, it requires access to bitcoin-cli and server=1 option in bitcoin.conf as well as python3

* Install

  ```sh
  $ sudo apt install python3
  ```

* Download the script. 

  ```sh
  $ cd /tmp/
  $ wget https://github.com/raspibolt/raspibolt/blob/master/resources/UTXOracle.py
  ```

* Read the script to see that it does (the script is very human readable so it is recommended)
  Exit with `Ctrl`-`X`

  ```sh
  $ nano /tmp/UTXOracle.py
  ```
  
* Install the script and make it executable

  ```sh
  $ sudo install UTXOracle.py /usr/local/bin
  ```

* You can now run the script with user "admin"

  ```sh
  $ cd ~
  $ UTXOracle.py
  ```

---