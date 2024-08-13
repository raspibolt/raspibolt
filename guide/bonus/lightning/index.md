---
layout: default
title: + Lightning
nav_order: 3000
parent: Bonus Section
has_children: false
has_toc: false
---

# Bonus Section: Lightning guides

---

## Lightning clients
* **[Core Lightning (CLN)](cln.md)** - An alternative lightning client to LND or if you want to run a Core Lightning node alongside your LND node.

---

## Maintenance
* **[Use lncli on a different computer](remote-lncli.md)** - control your Lightning node from a different computer within you network, eg. from a Windows machine

---

## Security
* **[Circuit Breaker](circuit-breaker.md)** - a lightning firewall to protect your node against HTLC flooding attacks

---

## Monitoring
* **[AmbossPing](ambossping.md)** - easy to use script to send heartbeat pings to the amboss.space monitoring service

---

## Dashboards & Wallets

#### *CLI-only*
* **[lntop](lntop.md)** - lntop is an interactive text-mode channels viewer for Unix systems
* **[lnbalance](lnbalance.md)** -  a simple node balances viewer
* **[lnchannels](lnchannels.md)** - a simple channels viewer

#### *GUI - Desktop*
* **[Zap](zap-desktop.md)** - a cross platform Lightning Network wallet focused on user experience and ease of use

#### *GUI - Mobile*
* **[Zap (iOS)](zap-ios.md)** - a neat interface to manage peers & channels, make payments and create invoices

#### *GUI, API - Web*
* **[LNBits](lnbits.md)** - a lightning wallet/accounts system
* **[LNDg](lndg.md)** - a simple web GUI for power users to automate the management of routing nodes
* **[ThunderHub](thunderhub.md)** - a browser interface to manage all parts of your LN node like forwarding fees, channel opening/closing, usage of lnurl and much more.

---

## Liquidity management
* **[Balance of Satoshis](balance-of-satoshis.md)** - a tool to rebalance your channels and set up a LN node monitoring Telegram bot
* **[Lightning Terminal](lightning-terminal.md)** - a browser-based GUI for managing channel liquidity with Loop and Pool
* **[rebalance-lnd](rebalance-lnd.md)** - a simple script to manage your channel liquidity by doing circular rebalancing
* **[CLBoss](clboss.md)** - an automated node management tool for CLN
* **[regolancer](regolancer.md)** - light, quick and efficient LND rebalancer written in Go

---

## Fee management
* **[charge-lnd](charge-lnd.md)** - a simple policy-based fee manager for LND

---

## Even more Extras 

### [RaspiBolt Extras by Rob Clark](https://github.com/robclark56/RaspiBolt-Extras/blob/master/README.md){:target="_blank"}

* **[Lights-Out](https://github.com/robclark56/RaspiBolt-Extras/#the-lights-out-raspibolt){:target="_blank"}** - automatic unlocking of wallet and dynamic ip
* **[RaspiBoltDuo](https://github.com/robclark56/RaspiBolt-Extras/#raspiboltduo){:target="_blank"}** - testnet & mainnet running simultaneously
* **[Using REST access](https://github.com/robclark56/RaspiBolt-Extras/#using-rest-access){:target="_blank"}** - to enable and demonstrate using the REST interface instead of rpc/lncli
* **[Receiving Lightning payments](https://github.com/robclark56/RaspiBolt-Extras/#receive-ln-payments){:target="_blank"}** - automatically create invoices / qr codes

---

<< Back: [Bonus Section](../index.md)
