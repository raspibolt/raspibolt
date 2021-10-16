---
layout: default
title: charge-lnd
parent: Bonus Section
nav_order: 130
has_toc: false
---
# Bonus guide: Charge-lnd

*Difficulty: simple*

[Charge-lnd](https://github.com/accumulator/charge-lnd) is a simple policy based fee manager for LND.

*Requirements:*

* LND (or LND as part of Lightning Terminal/litd)

*Acknowledgments:*

* This guide is modified from the [manual install guide](https://gist.github.com/openoms/823f99d1ab6e1d53285e489f7ba38602) for the Raspiblitz by @openoms.

## Install charge-lnd

* As recommended in the [repo](https://github.com/accumulator/charge-lnd/blob/master/INSTALL.md#installation), we don't need to have full admin rights to use charge-lnd. The following access rights are used:
    ** `offchain:read`
    ** `offchain:write`
    ** `onchain:read`
    ** `info:read`
We can create a suitably limited macaroon by issuing
  
  ```sh
  $ lncli bakemacaroon offchain:read offchain:write onchain:read info:read --save_to=~/.lnd/data/chain/bitcoin/mainnet/charge-lnd.macaroon
  ```
  
* We create a charge-lnd user, make it part of the bitcoin group (to be able to interact with LND)  

  ```sh
  $ sudo adduser charge-lnd
  $ sudo /usr/sbin/usermod --append --groups bitcoin charge-lnd
  ```
  
* As charge-lnd user, clone the charge-lnd repository, enter the charge-lnd directory and install the program and required packages using pip3 (don't forget the dot at the end of the pip command!)
  ```sh
  $ sudo su - charge-lnd
  $ git clone https://github.com/accumulator/charge-lnd.git
  $ cd charge-lnd
  $ pip3 install -r requirements.txt .
  ```

## Configuration file

* Create a configuration file that we will call charge-lnd.config

```sh
$ nano charge-lnd.config
```

* We can test the program by using a very simple config file

```sh
$ nano charge.config
```

* As an example, we are going to choose one channel and set up a fee policy that changes proportinally with the channel balance ratio
* The channel balance ratio is calculated as local_capacity/total_capacity. So the ratio is equal to 1 when all the capacity is on our side (e.g. after initiating a channel opening to a node) and 0 whenn all the capacity is remote.
* Let's choose a channel that we want to use as a test for this fee policy. Find the channel ID (a 18 digits number)
* Paste the folliwing in the charge.config file. Change the CHANNEL_IDEA with your own selected channel ID. You can also chosse your own min and max fee rates (in ppm). Then exit with Ctrl+C

```sh
[ignored_channels]
# don't let charge-lnd set fees (strategy=ignore) for channels to/from the specified nodes
node.id = [NODE_1_PUKEY],
  [NODE_2_PUBKEY],
  [NODE_3_PUBKEY]


[proportional]
# 'proportional' can also be used to auto balance (lower fee rate when low remote balance & higher rate when higher remote balance)
# fee_ppm decreases linearly with the channel balance ratio (min_fee_ppm when ratio is 1, max_fee_ppm when ratio is 0)
chan.id = [CHANNEL_ID]

strategy = proportional
min_fee_ppm = 10
max_fee_ppm = 200
```

* Exit the bitcoin user

```sh
$ exit
```


## First run

* We are now ready to run the program for the first time 

```sh
$ sudo -u bitcoin /home/bitcoin/.local/bin/charge-lnd -c /home/bitcoin/charge-lnd/charge.config
```

(same in a cronjob)


