---
layout: default
title: RaspiBolt on Testnet
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---

# Bonus guide: RaspiBolt on Testnet
{: .no_toc }

You can run your RaspiBolt node on testnet to develop and experiment with new applications, without putting real money at risk. This bonus guide highlights all configuration changes compared to the main guide.

Difficulty: Medium
{: .label .label-yellow }

Status: Tested v3
{: .label .label-green }

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Introduction
Running a testnet node is a great way to get acquainted with the RaspiBolt and the suite of Bitcoin-related software typical of these powerful setups. Moreover, testnet empowers users to tinker with the software and its many configurations without the threat of losing funds. Helping bitcoiners run a full testnet setup is a goal worthy of the RaspiBolt, and this page should provide you with the knowledge to get there.

The great news is that most of the RaspiBolt guide can be used as-is. The small adjustments come in the form of changes to the config files and ports for testnet. You can follow the guide and simply replace the following configurations in the right places as you go.

## Bitcoin daemon
File location: `/data/bitcoin/bitcoin.conf`
```ini
# RaspiBolt: bitcoind configuration for testnet node

# [chain]
# main, test, signet, regtest
chain=test

# [core]
sysperms=1
blocksonly=1
txindex=1
# disable dbcache after full sync
dbcache=2000

# [wallet]
disablewallet=1

# [network]
listen=1
listenonion=1
proxy=127.0.0.1:9050
maxconnections=40
maxuploadtarget=5000
whitelist=download@127.0.0.1          # for Electrs

# [rpc]
rpcauth=your_string_from_the_rpcauth_script
server=1

# [zeromq]
zmqpubrawblock=tcp://127.0.0.1:28332
zmqpubrawtx=tcp://127.0.0.1:28333

# Options specific to chain, rpcport set to default values
[main]
# rpcport=8332
bind=127.0.0.1
rpcbind=127.0.0.1

[test]
rpcport=18332
bind=127.0.0.1
rpcbind=127.0.0.1

[signet]
# rpcport=38332

[regtest]
# rpcport=18443
```

Note that the testnet data is stored in `/data/bitcoin/testnet3`. To check the log file, use `tail -f /data/bitcoin/testnet3/debug.log`.

Because the authentication cookie now located in `/data/bitcoin/testnet3/.cookie`, the command in the `systemd` unit `bitcoind.service` to grant the group `bitcoin` read permissions in `/etc/systemd/system/bitcoind.service` needs to be changed to:
```ini
-startupnotify="chmod g+r /home/bitcoin/.bitcoin/testnet3/.cookie"
```

## Electrs
File location: `/data/electrs/electrs.conf`
```ini
# RaspiBolt: electrs configuration for testnet node
# /data/electrs/electrs.conf

# Bitcoin Core settings
network = "testnet"
daemon_dir= "/home/bitcoin/.bitcoin/"
daemon_rpc_addr = "127.0.0.1:18332"
daemon_p2p_addr = "127.0.0.1:18333"
cookie_file = "/data/bitcoin/testnet3/.cookie

# Electrs settings
electrum_rpc_addr = "127.0.0.1:60001"
db_dir = "/data/electrs/db/"
index_lookup_limit = 1000

# Logging
log_filters = "INFO"
timestamp = true
```

Check the logs using
```sh
$ sudo journalctl -u electrs -f
```

### NGINX
File location: `/etc/nginx/streams-enabled/electrs-testnet-reverse-proxy.conf`
```ini
upstream electrs {
  server 127.0.0.1:60001;
}

server {
  listen 60002 ssl;
  proxy_pass electrs;
}
```

Your nginx might need to be reloaded using:
```sh
$ sudo nginx -t
$ sudo systemctl reload nginx
$ sudo ufw allow 60002/tcp comment 'allow Electrum SSL Testnet'
```

### Tor
Create a separate service for testnet over Tor by adding the following lines in the `location-hidden services` section:

File location: `/etc/tor/torrc`
```ini
############### This section is just for location-hidden services ###
HiddenServiceDir /var/lib/tor/hidden_service_electrs_testnet/
HiddenServiceVersion 3
HiddenServicePort 60002 127.0.0.1:60002
```

Once that's done, you'll need to start the service using:
```sh
$ sudo systemctl reload tor
$ sudo cat /var/lib/tor/hidden_service_electrs_testnet/hostname
```

## LND
The following are the lines that need changing in the LND configuration file.

File location: `/data/lnd/lnd.conf`
```ini
[Bitcoin]
bitcoin.active=1
#bitcoin.mainnet=1
bitcoin.testnet=1
bitcoin.node=bitcoind
```

And the following command gives members of the group `lnd` permission to traverse the LND directories to reach the macaroons:
```sh
$ sudo chmod -R g+X /data/lnd/data/
```

### Interacting with the LND daemon
Note that when interacting with the LND daemon, you'll need to use the `--network testnet` option like so:
```sh
$ lncli --network testnet walletbalance
```

---

<< Back: [+ Bitcoin](index.md)
