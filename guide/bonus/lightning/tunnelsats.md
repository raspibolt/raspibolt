---
layout: default
title: Tunnel⚡️Sats
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

# Bonus guide: Tunnel⚡️Sats
{: .no_toc }

---

[Tunnel⚡️Sats](https://tunnelsats.com){:target="_blank"} is a paid service to enable hybrid mode on lightning nodes and run clearnet over VPNs all over the world. Tunnel⚡️Sats provides secured and LN-only configured VPNs which support port-forwarding to connect with other lightning nodes. This guide installs the underlying system from scratch. Alternatively an automated setup script can be found at the official [Tunnel⚡️Sats guide](https://blckbx.github.io/tunnelsats/){:target="_blank"}.

Difficulty: Advanced
{: .label .label-red }

Status: Tested v3
{: .label .label-green }

![TunnelSats](../../../images/tunnelsats.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Requirements

* LND / CLN latest
* OS: Debian-/Ubuntu-based (`apt` required)
* Linux kernel version: 5.10.102+ (`uname -r`)
* nftables version: 0.9.6+ (`nft -v` or `apt search nftables | grep "^nftables"`)

---

## Technical Overview

In order to understand the whole process, this is a short technical overview of how the parts play together:

  1. Get a WireGuard config file (`tunnelsatsv2.conf`) from tunnelsats.com by choosing continent and fixed timeframe and paying the LN invoice,

  2. installing required software and components to make VPN connection and Tor splitting work and

  3. setting up the node for hybrid mode by editing the lightning configuration file as described below.

This RaspiBolt bonus guide explicitly covers parts #2 and #3.


## Installation

## Configuration

## Test & Verification

## Activation

## Uninstallation

## Troubleshooting


<br /><br />

---

<< Back: [+ Lightning](index.md)
