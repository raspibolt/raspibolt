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

Paid service
{: .label .label-yellow }

Difficulty: Intermediate
{: .label .label-yellow }

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

  1. Get a WireGuard config file (`tunnelsatsv2.conf`) from [tunnelsats.com](https://tunnelsats.com){:target="_blank"} by choosing continent and fixed timeframe and paying the LN invoice,

  2. installing required software and components to make VPN connection and Tor splitting work and

  3. setting up the node for hybrid mode by editing the lightning configuration file as described below.

This RaspiBolt bonus guide explicitly covers parts #2 and #3.


## Installation

⚠️ This guide can be applied to both LND and CLN implementations! Although most commands refer to LND commands, they can be exchanged for CLN likewise. If you are intending to run CLN, make sure to only run CLN (one implementation at a time is supported) AND set CLN's lightning port number to 9735!

- In this step we prepare the wireguard configuration file that we got from [tunnelsats.com](https://tunnelsats.com){:target="_blank"} website and install requirements for the setup. We need to have `sudo` rights throughout the whole process, so we will do this as user `admin`:

  ```sh
  $ sudo su - admin
  $ sudo apt update
  $ sudo apt install -y cgroup-tools wireguard nftables
  ```
  
- After installing required components we create a tunnelsatsv2.conf file and add some additional configuration and a nftables ruleset for the traffic splitting setup. Copy the content from the obtained `tunnelsatsv2.conf` file into the newly created `tunnelsatsv2.conf` file in the home directory on your node.

  ```sh
  $ nano tunnelsatsv2.conf
  ```
  
- Paste the content into the file. The following shows a **sample** configuration, please use your personal wireguard file!

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
- Copy the file to the wireguard directory:

  ```sh
  $ cp tunnelsatsv2.conf /etc/wireguard/tunnelsatsv2.conf
  ```

- Set and done! Now we are setting up the technical requirements for traffic-splitting (Tor and clearnet). To achieve this, we need to set up some systemd services and scripts to catch and mark the lightning P2P traffic. Therefore we create a cgroup. 
- Create a shell script: `tunnelsats-create-cgroup.sh`

  ```sh
  $ sudo nano /etc/wireguard/tunnelsats-create-cgroup.sh
  ```
  
- Insert:

  ```bash
  #!/bin/sh
  set -e
  dir_netcls="/sys/fs/cgroup/net_cls"
  splitted_processes="/sys/fs/cgroup/net_cls/splitted_processes"
  modprobe cls_cgroup
  if [ ! -d "$dir_netcls" ]; then
    mkdir $dir_netcls
    mount -t cgroup -o net_cls none $dir_netcls
    echo "> Successfully added cgroup net_cls subsystem"
  fi
  if [ ! -d "$splitted_processes" ]; then
    mkdir /sys/fs/cgroup/net_cls/splitted_processes
    echo 1118498  > /sys/fs/cgroup/net_cls/splitted_processes/net_cls.classid
    chmod 666  /sys/fs/cgroup/net_cls/splitted_processes/tasks
    echo "> Successfully added Mark for net_cls subsystem"
  else
    echo "> Mark for net_cls subsystem already present"
  fi
  ```
  
- Save and exit. Run the script once initially: 

  ```sh
  $ bash /etc/wireguard/tunnelsats-create-cgroup.sh
  ```
  
- Create a systemd service to run it automatically:

  ```sh
  $ sudo nano /etc/systemd/system/tunnelsats-create-cgroup.service
  ```

- Insert:

  ```ini
  [Unit]
  Description=Creating CGroup for Splitting Lightning Traffic
  StartLimitInterval=200
  StartLimitBurst=5
  [Service]
  Type=oneshot
  RemainAfterExit=yes
  ExecStart=/usr/bin/bash /etc/wireguard/tunnelsats-create-cgroup.sh
  [Install]
  WantedBy=multi-user.target
  ```
  
- Save and exit. Reload daemon, enable and start the service:

  ```sh
  $ sudo systemctl daemon-reload
  $ sudo systemctl enable tunnelsats-create-cgroup.service
  $ sudo systemctl start tunnelsats-create-cgroup.service
  ```
  
- Now we create a dependency for LND:

  ```sh
  $ sudo mkdir /etc/systemd/system/lnd.service.d
  $ sudo nano /etc/systemd/system/lnd.service.d/tunnelsats-cgroup.conf
  ```

- Insert:

  ```ini
  #Don't edit this file! It is generated by TunnelSats
  [Unit]
  Description=lightning needs cgroup before it can start
  Requires=tunnelsats-create-cgroup.service
  After=tunnelsats-create-cgroup.service
  Requires=wg-quick@tunnelsatsv2.service
  After=wg-quick@tunnelsatsv2.service
  ```
  
- Save and exit. Reload the daemon.

  ```sh
  $ sudo systemctl daemon-reload
  ```
  
- So now we created a cgroup that we can use to catch and mark the lightning P2P traffic. The following ensures that the lightning process is caught whenever changes happen: automatically on every restart of lightning and/or the system.
- Create the shell script: `tunnelsats-splitting-processes.sh`

  ```sh
  $ sudo nano /etc/wireguard/tunnelsats-splitting-processes.sh
  ```
  
- Insert:

  ```ini
  #!/bin/sh
  # add Lightning pid(s) to cgroup
  pgrep -x lnd | xargs -I % sh -c 'echo % >> /sys/fs/cgroup/net_cls/splitted_processes/tasks' &> /dev/null
  pgrep -x lightningd | xargs -I % sh -c 'echo % >> /sys/fs/cgroup/net_cls/splitted_processes/tasks' &> /dev/null
  count=$(cat /sys/fs/cgroup/net_cls/splitted_processes/tasks | wc -l)
  if [ $count -eq 0 ];then
    echo "> no lightning processes available for tunneling"
  else
    echo "> ${count} Process(es) successfully excluded"
  fi
  ```

- Save and exit. Make it executable and run the script once initially:

  ```sh
  $ sudo chmod +x /etc/wireguard/tunnelsats-splitting-processes.sh
  $ sudo bash /etc/wireguard/tunnelsats-splitting-processes.sh
  ```
  
- Create a systemd service to automate the script:

  ```sh
  $ sudo nano /etc/systemd/system/tunnelsats-splitting-processes.service
  ```
  
- Insert:

  ```ini
  [Unit]
  Description=Adding Lightning Processes to the Tunnel
  [Service]
  Type=oneshot
  ExecStart=/bin/bash /etc/wireguard/tunnelsats-splitting-processes.sh
  [Install]
  WantedBy=multi-user.target
  ```
  
- Save and exit. Create a timer for the service:

  ```sh
  $ sudo nano /etc/systemd/system/tunnelsats-splitting-processes.timer
  ```
  
- Insert:

  ```ini
  [Unit]
  Description=Timer for tunnelsats-splitting-processes.service
  [Timer]
  OnBootSec=10
  OnUnitActiveSec=10
  Persistent=true
  [Install]
  WantedBy=timers.target
  ```
  
- Save and exit. Reload the daemon, enable and start the services and the timer:

  ```sh
  $ sudo systemctl daemon-reload
  $ sudo systemctl enable tunnelsats-splitting-processes.service
  $ sudo systemctl start tunnelsats-splitting-processes.service
  
  $ sudo systemctl enable tunnelsats-splitting-processes.timer
  $ sudo systemctl start tunnelsats-splitting-processes.timer
  ```

- Set and done. Now we have to ensure the lightning process starts within the cgroup. Beforehand we create a copy of lightning service.

  ```sh
  $ sudo cp /etc/systemd/system/lnd.service /etc/systemd/system/lnd.service.bak
  ```
  
- Edit `ExecStart` in `lnd.service` and add `/usr/bin/cgexec -g net_cls:splitted_processes` to the command:

  ```ini
  ExecStart=/usr/bin/cgexec -g net_cls:splitted_processes /usr/local/bin/lnd
  ```

- Save and exit. Reload the daemon:

  ```sh
  $ sudo systemctl daemon-reload
  ```
  
- Alright. We set the lightning process to start within the cgroup to enable traffic splitting. The following part enables and starts the wireguard service:

  ```sh
  $ sudo systemctl enable wg-quick@tunnelsatsv2
  $ sudo systemctl start wg-quick@tunnelsatsv2
  ```
  
- If the wireguard connection has successfully been established. We now verify if it's working as intended. Therefore we call our own IP through the tunnel and outside of it:

  ```sh
  $ curl --silent https://api.ipify.org
  ```
  
- This should return the real clearnet IP.

  ```sh
  $ cgexec -g net_cls:splitted_processes curl --silent https://api.ipify.org
  ```
  
- And this should return the VPN IP. If it does, everything is set up correctly and we can proceed with the configuration of our lightning implementation.
- ⚠️ Notice: Up to this step nothing has changed on your RaspiBolt setup. Lightning is still running in background, no changes have been made. You can revert these steps without restarting the lightning implementation.

## Configuration

 **Important notice: Tunnel⚡️Sats currently supports only one running lightning implementation at a time. The running lightning implementation MUST use lightning P2P port 9735!**
  
- After successful installation, we continue to configure the current lightning implementation. But before any changes happen, we create a backup:

  ```sh
  $ sudo cp /data/lnd/lnd.conf /data/lnd/lnd.backup
  ```

- Then we need to gather information from the tunnelsatsv2.conf file manually:
  - Retrieve the DNS address of the VPN. We gonna call it `vpnExternalDNS`:

    ``` sh
    $ sudo grep "Endpoint" /etc/wireguard/tunnelsatsv2.conf | awk '{ print $3 }' | cut -d ":" -f1
    ```
  
  - Retrieve the personal VPN port as `vpnExternalPort`:

    ```sh
    $ sudo grep "#VPNPort" /etc/wireguard/tunnelsatsv2.conf | awk '{ print $3 }'
    ```
  
- This is what we need to edit the lightning implementation plus some additional hybrid parameters described in the following part:

  Configuration for LND (`/data/lnd/lnd.conf`):
  
  ⚠️ Replace existing entry `listen=localhost` with `listen=0.0.0.0:9735`!
  
  ```ini
  [Application Options]
  externalhosts=${vpnExternalDNS}:${vpnExternalPort}
  listen=0.0.0.0:9735
                                               
  [Tor]                                            
  tor.streamisolation=false
  tor.skip-proxy-for-clearnet-targets=true
  ```
  
  Configuration for CLN (`/data/lightningd/config`):
  ```ini
  # Tor
  addr=statictor:127.0.0.1:9051/torport=9735
  proxy=127.0.0.1:9050
  always-use-proxy=false
  
  # VPN
  bind-addr=0.0.0.0:9735
  announce-addr=${vpnExternalDNS}:${vpnExternalPort}
  ```

- Afterwards restart LND / CLN for these changes to take effect:

  ```sh
  $ sudo systemctl restart lnd.service
  ```

## Test & Verification

- If everything went well so far and the lightning implementation started up successfully, we verify that the changes have been accepted:

  ```sh
  $ lncli getinfo
  ```

- The output shows two URIs: one Tor onion address and the VPN ipv4 address that has been resolved by LND at startup. CLN keeps displaying the DNS as entered in the config file.

  ```
  "uris": [
    "{pubkey}@{onion-address}.onion:9735",
    "{pubkey}@{vpnExternalIP}:{vpnExternalPort}"
  }
  ```

- The VPN connection can be verified by running:

  ```sh
  $ sudo wg show
  ```
  
- The output: 

  ```ini
  interface: tunnelsatsv2
  public key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=
  private key: (hidden)
  listening port: 11111
  fwmark: 0x3333

  peer: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=
  endpoint: {VPNIP}:51820
  allowed ips: 0.0.0.0/0
  latest handshake: 9 seconds ago
  transfer: x.x MiB received, x.x MiB sent
  ```

## Uninstallation

Easy way: 

  ```sh
  $ wget -O uninstallv2.sh https://github.com/blckbx/tunnelsats/raw/main/scripts/uninstallv2.sh
  $ sudo bash uninstallv2.sh
  ```
  
Manual way:

- Restore your configuration from with the backup file (`lnd.backup`) you created on setting up hybrid mode.

  ```sh
  $ sudo mv /data/lnd/lnd.backup /data/lnd/lnd.conf
  ```

- Stop lightning implementation:

  ```sh
  $ sudo systemctl stop lnd.service
  ```
  
- Remove systemd dependencies and services:

  ```sh
  $ sudo rm /etc/systemd/system/lnd.service.d/tunnelsats-cgroup.conf
  
  $ sudo systemctl stop tunnelsats-splitting-processes.timer
  $ sudo systemctl disable tunnelsats-splitting-processes.timer
  $ sudo rm /etc/systemd/system/tunnelsats-splitting-processes.timer
  
  $ sudo systemctl stop tunnelsats-splitting-processes.service
  $ sudo systemctl disable tunnelsats-splitting-processes.service
  $ sudo rm /etc/systemd/system/tunnelsats-splitting-processes.service
  
  $ sudo systemctl stop tunnelsats-create-cgroup.service
  $ sudo systemctl disable tunnelsats-create-cgroup.service
  $ sudo rm /etc/systemd/system/tunnelsats-create-cgroup.service
  ```
  
- Restore `lnd.service`:

  ```sh
  $ sudo nano /etc/systemd/system/lnd.service
  ```
  
  Replace
  ```ini
  ExecStart=/usr/bin/cgexec -g net_cls:splitted_processes /usr/local/bin/lnd
  ```
  with
  ```ini
  ExecStart=/usr/local/bin/lnd
  ```
  
- Reload daemon:

  ```sh
  $ sudo systemctl daemon-reload
  ```

- Remove cgroup details:

  ```sh
  $ sudo cgdelete net_cls:/splitted_processes
  ```

- Remove Wireguard service:

  ```sh
  $ sudo systemctl stop wg-quick@tunnelsatsv2
  $ sudo systemctl disable wg-quick@tunnelsatsv2
  ```
  
- Uninstall packages:

  ```sh
  $ sudo apt-get remove -yqq cgroup-tools nftables wireguard-tools
  ```
  
- ⚠️ Before firing up the lightning implementation, we make sure that we don't leak the real IP, so any hybrid setting should either be set to false or not present (LND) or true (CLN). So we look for:

  LND:
  ```ini
  tor.skip-proxy-for-clearnet-targets=false
  ```
  
  CLN:
  ```ini
  always-use-proxy=true
  ```
  
  Then restart:
  ```sh
  $ sudo systemctl start lnd.service
  ```
  

## Troubleshooting

Please review the [FAQ](https://github.com/blckbx/tunnelsats/blob/main/FAQ.md){:target="_blank"} for further help. If you need help setting up hybrid mode / clearnet over VPN, join the Tunnel⚡️Sats [Telegram group](https://t.me/+NJylaUom-rxjYjU6){:target="_blank"}.


<br /><br />

---

<< Back: [+ Lightning](index.md)
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTIwMTM0ODE1NjhdfQ==
-->
