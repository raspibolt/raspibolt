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

- In this step we prepare the wireguard configuration file that we got from tunnelsats.com website and install requirements for the setup. We need to have `sudo` rights throughout the whole process, so we will do this as user `admin`:

  ```sh
  $ sudo su - admin
  $ sudo apt install -y cgroup-tools wireguard nftables
  ```
  
- After installing required components we create a tunnelsatsv2.conf file and add some additional configuration and a nftables ruleset for the traffic splitting setup. Copy the content from the obtained `tunnelsatsv2.conf` file into the newly created `tunnelsatsv2.conf` file in the home directory on your node.

  ```sh
  $ nano tunnelsatsv2.conf
  ```
  
- Paste the content into the file. The following will show a sample configuration:

  ```ini
  [Interface]
  PrivateKey = xxxxxxxxxxxxxxxxxxxxxxxx=
  Address = 10.9.0.2/32
   
  #VPNPort = 21212
  #ValidUntil (UTC time) = 2022-10-25T11:22:34.396Z
  #myPubKey = xxxxxxxxxxxxxxxxxxxxxxxx=
   
  [Peer]
  PublicKey = xxxxxxxxxxxxxxxxxxxxxxxx=
  PresharedKey = xxxxxxxxxxxxxxxxxxxxxxxx=
  Endpoint = us1.tunnelsats.com:51820
  AllowedIPs = 0.0.0.0/0, ::/0
  PersistentKeepalive = 25
  ```
  
- Append additional ruleset at the end of the file:

  ```ini
  [Interface]
  FwMark = 0x3333
  Table = off
  
  PostUp = ip rule add from all fwmark 0xdeadbeef table 51820;ip rule add from all table main suppress_prefixlength 0
  PostUp = ip route add default dev %i table 51820;
  PostUp = ip route add  10.9.0.0/24 dev %i  proto kernel scope link; ping -c1 10.9.0.1
  PostUp = sysctl -w net.ipv4.conf.all.rp_filter=0
  PostUp = sysctl -w net.ipv6.conf.all.disable_ipv6=1
  PostUp = sysctl -w net.ipv6.conf.default.disable_ipv6=1
  
  PostUp = nft add table ip %i
  PostUp = nft add chain ip %i prerouting '{type filter hook prerouting priority mangle -1; policy accept;}'; nft add rule ip %i prerouting meta mark set ct mark
  PostUp = nft add chain ip %i mangle '{type route hook output priority mangle -1; policy accept;}'; nft add rule ip %i mangle tcp sport != { 8080, 10009 } meta mark != 0x3333 meta cgroup 1118498 meta mark set 0xdeadbeef
  PostUp = nft add chain ip %i nat'{type nat hook postrouting priority srcnat -1; policy accept;}'; nft insert rule ip %i nat fib daddr type != local oif != %i ct mark 0xdeadbeef drop;nft add rule ip %i nat oif != "lo" ct mark 0xdeadbeef masquerade
  PostUp = nft add chain ip %i postroutingmangle'{type filter hook postrouting priority mangle -1; policy accept;}'; nft add rule ip %i postroutingmangle meta mark 0xdeadbeef ct mark set meta mark
  PostUp = nft add chain ip %i input'{type filter hook input priority filter -1; policy accept;}'; nft add rule ip %i input iifname %i  ct state established,related counter accept; nft add rule ip %i input iifname %i tcp dport != 9735 counter drop; nft add rule ip %i input iifname %i udp dport != 9735 counter drop
  
  PostDown = nft delete table ip %i
  PostDown = ip rule del from all table  main suppress_prefixlength 0; ip rule del from all fwmark 0xdeadbeef table 51820
  PostDown = ip route flush table 51820
  PostDown = sysctl -w net.ipv4.conf.all.rp_filter=1
  ```
  
- Save and exit with Ctrl+O followed by Ctrl+X.
- Now copy the file to the wireguard directory:

  ```sh
  $ cp tunnelsatsv2.conf /etc/wireguard/
  ```
  
  


## Configuration

## Test & Verification

## Activation

## Uninstallation

## Troubleshooting


<br /><br />

---

<< Back: [+ Lightning](index.md)
