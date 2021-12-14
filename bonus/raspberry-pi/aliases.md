---
layout: default
title: Aliases
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

## Bonus guide: Aliases
{: .no_toc }

---

The following script was created by [RobClark56](https://github.com/robclark56) and help getting a better system overview.

Difficulty: Easy
{: .label .label-green }

Status: Tested v3
{: .label .label-green }

![](images/60_balance.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

The following scripts were created by [RobClark56](https://github.com/robclark56) and help getting a better system overview.

### Install the script

* As user “admin”, download the script

  ```sh
  $ cd /tmp
  $ wget https://raw.githubusercontent.com/raspibolt/raspibolt/master/resources/lnbalance
  ```
  
* You can investigate the content of the script to ensure that there is no malicious code in it. Once done press q to quit.
  
  ```sh
  $ less balance
  > /bin/bash
  > spiBolt channel balance display, by robclark56
  > [...]
  ```
  
* Make the script executable (check by displaying the file name, it should have become green)
  
  ```sh
  $ chmod +x lnbalance
  $ ls -la
  ```

* Move the file to the  global bin(aries) folder

  ```sh
  $ sudo cp lnbalance /usr/local/bin
  $ rm lnbalance
  $ cd
  ```
 
### lnbalance in action

* With the "admin" user, run `lnbalance`

  ```sh
  $ lnbalance
  > mainnet (sat)        |       Local|      Remote|Commitment Fees|
  > Wallet               |      122236|            |               |
  > Active Channels    12|      919850|      822047|           5655|
  > Inactive Channels   0|           0|           0|              0|
  > Total              12|     1042086|      822047|           5655|
  ```

<br /><br />

---

<< Back: [+ Lightning](index.md)
