---
layout: default
title: Tor Bridge
parent: + Raspberry Pi
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

## Bonus guide: Tor Bridge

{: .no_toc }

---

The design of the Tor network means that the IP address of Tor relays is public. However, one of the ways Tor can be blocked by governments or ISPs is by blocklisting the IP addresses of these public Tor nodes. [Tor Bridges](https://tb-manual.torproject.org/bridges/){:target="_blank"} are nodes in the network that are not listed in the public Tor directory, which makes it harder for ISPs and governments to block them. We are going to use a kind of [pluggable transports](https://tb-manual.torproject.org/circumvention/){:target="_blank"} called obfs4, a special kind of bridge, address this by adding an additional layer of obfuscation.

Difficulty: Medium
{: .label .label-yellow }

Status: Tested v3
{: .label .label-green }

![Tor Bridge](../../../images/tor-bridge.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Requirements

* Tor

---

## Preparations

### Install dependencies

obfs4 makes Tor traffic look random, and also prevents censors from finding bridges by Internet scanning. One of the most important things to keep your relay secure is to install security updates timely and ideally automatically so we are to configured all.

* Ensure you are logged with user `"admin"` and install obfs4proxy

  ```sh
  $ sudo apt install obfs4proxy
  ```

## Installation

* Ensure you have Tor daemon installed in your system

  ```sh
  $ tor --version
  > Tor version 0.4.7.10.
  [...]
  ```

💡 If not obtain results, follow the [Privacy section](../../raspberry-pi/privacy.md#installation) to install it.

### Configuration

* Edit your Tor config file adding the next lines at the end of file

  ```sh
  $ sudo nano /etc/tor/torrc
  ```

  ```sh
  BridgeRelay 1
    
  # Replace "<address@email.com>" with your email address so we can contact you 
  # if there are problems with your bridge. This line
  # can be used to contact you if your relay or bridge is misconfigured or
  # something else goes wrong. Note that we archive and publish all
  # descriptors containing these lines and that Google indexes them, so
  # spammers might also collect them. You may want to obscure the fact that
  # it's an email address and/or generate a new address for this purpose.
  # e.g ContactInfo Random Person <nobody AT example dot com> 
  # You might also include your PGP or GPG fingerprint if you have one
  # This is optional but encouraged.
  ContactInfo <address@email.com>

  # Pick a nickname that you like for your bridge. Nicknames must be between 1 and 19 characters inclusive, 
  # and must contain only the characters [a-zA-Z0-9]. This is optional.
  Nickname PickANickname

  # Replace "TODO1" with a Tor port of your choice >1024.
  # Avoid port 9001 because it's commonly associated with Tor and censors may be scanning the Internet for this port.
  ORPort TODO1 IPv4Only
  ExtORPort auto
  
  # Replace "TODO2" with an obfs4 port of your choice.
  # This port must be externally reachable and must be different from the one specified for ORPort.
  # Avoid port 9001 because it's commonly associated with Tor and censors may be scanning the Internet for this port.
  ServerTransportListenAddr obfs4 0.0.0.0:TODO2
  ServerTransportPlugin obfs4 exec /usr/bin/obfs4proxy
  ```

🚨 Don't forget to change the ORPort, ServerTransportListenAddr, ContactInfo, and Nickname options.

### Configure Firewall and router NAT

Configure the firewall to allow incoming requests replacing `<TODO1>` and `<TODO2>` previously configured in the section before

```sh
$ sudo ufw allow <TODO1> comment 'allow OR port Tor bridge'
```

```sh
$ sudo ufw allow <TODO2> comment 'allow obsf4 port Tor bridge'
```

🚨 Note that both Tor's OR port and its obfs4 port must be reachable. If your bridge is behind a NAT, make sure to open both ports. See [portforward.com](https://portforward.com/) for directions on how to port forward with your NAT/router device. You can use our reachability [test](https://bridges.torproject.org/scan/) to see if your obfs4 port `"<TODO2>"` is reachable from the Internet. Enter in the website your public <IP ADDRESS> obtained with `"$ curl icanhazip.com"` or navigate directly with your regular browser to [icanhazip.com] in your personal computer in the same local network, and put your `"<TODO2>"` port.

### Systemd hardering

* To work around systemd hardening, you will also need to set Tor services, editing the next files

  ```sh
  $ sudo nano /lib/systemd/system/tor@default.service
  ```

* Change `"NoNewPrivileges=no"` to `"NoNewPrivileges=yes"`. Save and exit

  ```sh
  # Hardening
  NoNewPrivileges=yes
  ```

* Same for `"tor@.service"` file, change `"NoNewPrivileges=no"` to `"NoNewPrivileges=yes"`. Save and exit

  ```sh
  $ sudo nano /lib/systemd/system/tor@.service
  ```

  ```sh
  # Hardening
  NoNewPrivileges=yes
  ```

* Reload systemd manager configuration to apply changes

  ```sh
  $ systemctl daemon-reload
  ```

### Testing

* Check the systemd journal to see Tor logs since the last updates output logs. Press the `"space"` key to advance, press the `"q"` key to exit

  ```sh
  $ sudo journalctl -u tor@default --since '1 hour ago'
  ```

* Verify that your relay works, if your logfile (syslog) contains the following entry after starting your tor daemon your relay should be up and running as expected

  ```sh
  [...]
  Your Tor server's identity key fingerprint is '<YourNickname> <FINGERPRINT>'
  Your Tor bridge's hashed identity key fingerprint is '<YourNickname> <HASHED FINGERPRINT>'
  Your Tor server's identity key ed25519 fingerprint is '<YourNickname> <KEY ED25519 FINGERPRINT>'
  You can check the status of your bridge relay at https://bridges.torproject.org/status?id=<HASHED FINGERPRINT>
  [...]
  ```

  ```sh
  [...]
  > Now checking whether IPv4 ORPort <IP ADDRES:<TODO1>> is reachable... (this may take up to 20 minutes -- look for log messages indicating success)
  > Self-testing indicates your ORPort <IP ADDRES:<TODO1>> is reachable from the outside. > Excellent. Publishing server descriptor.
  > Performing bandwidth self-test...done
  [...]
  ```

🔍 About 3 hours after you start your relay, it should appear on [Relay Search](https://metrics.torproject.org/rs.html) on the Metrics portal. You can search for your relay using your nickname or IP address and can monitor your obfs4 bridge's usage on Relay Search. Just enter your bridge's <HASHED FINGERPRINT> in the form and click "Search".

* If you want to connect to your bridge manually, you will need to know the bridge's obfs4 certificate. See the file obfs4_bridgeline.txt.

  ```sh
  $ sudo cat /var/lib/tor/pt_state/obfs4_bridgeline.txt
  ```

* Paste the entire bridge line into Tor Browser

  ```sh
  Bridge obfs4 <IP ADDRESS>:<PORT> <FINGERPRINT> cert=<CERTIFICATE> iat-mode=0
  ```

💡 You'll need to replace <IP ADDRESS>, <PORT>, and <FINGERPRINT> with the actual values, which you can find in the tor log. Make sure to use <FINGERPRINT>, not <HASHED FINGERPRINT>; and that <PORT> is the obfs4 port `"<TODO2>"` you chose.

🔍 More info to connect Tor browser to your own Tor bridge in this [website](https://tb-manual.torproject.org/bridges/) in the `"ENTERING BRIDGE ADDRESSES"` section.

## Extras

### Enable automatic software updates (optional)

One of the most important things to keep your relay secure is to install security updates timely and ideally automatically so you can not forget about it. Follow the instructions to enable automatic software updates for your operating system.

* Install dependencies

  ```sh
  $ sudo apt install unattended-upgrades apt-listchanges
  ```

* Edit the next file and enter the nex lines at the end of file. save and exit

  ```sh
  $ sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
  ```

  ```sh
  Unattended-Upgrade::Origins-Pattern {
      "origin=Debian,codename=${distro_codename},label=Debian-Security";
      "origin=TorProject";
  };
  Unattended-Upgrade::Package-Blacklist {
  };
  ```

* If you want to automatically reboot add also the following at the end of the file (optional)

  ```sh
  Unattended-Upgrade::Automatic-Reboot "true";
  ```

* You can test your unattended-upgrades setup with the following command

  ```sh
  $ unattended-upgrade --debug
  ```

* If you just want to see the debug output but don't change anything use

  ```sh
  $ unattended-upgrade --debug --dry-run
  ```
  
### Install nyx

[Nyx](https://github.com/torproject/nyx) is a command-line monitor for Tor. With this you can get detailed real-time information about your relay such as bandwidth usage, connections, logs, and much more.

* With user `"admin"`, install the package

  ```sh
  $ sudo apt install nyx
  ````

* Execute with

  ```sh
  $ sudo nyx
  ```

* Press `q` key two times to exit

## Uninstall

### Uninstall Tor configuration

* Reverts "torrc" file configuration commenting previously configured lines. Save and exit

  ```sh
  $ sudo nano /etc/tor/torrc
  ```

  ```sh
  #BridgeRelay 1
  #ContactInfo <address@email.com>
  #Nickname PickANickname
  #ExtORPort auto
  #ServerTransportListenAddr obfs4 0.0.0.0:TODO2
  #ServerTransportPlugin obfs4 exec /usr/bin/obfs4proxy
  ```

### Uninstall FW configuration and router NAT

* Display the UFW firewall rules and notes the numbers of the rules for Tor bridge (e.g. W, Z, Y and Z below)

  ```sh
  $ sudo ufw status numbered
  > [...]
  > [W] <TODO1>                   ALLOW IN    Anywhere                   # allow OR port Tor bridge
  > [X] <TODO1> (v6)              ALLOW IN    Anywhere (v6)              # allow OR port Tor bridge
  > [Y] <TODO2>                   ALLOW IN    Anywhere                   # allow obsf4 port Tor bridge
  > [Z] <TODO2> (v6)              ALLOW IN    Anywhere (v6)              # allow obsf4 port Tor bridge
  ```

* Delete the rule with the correct number and confirm with "yes"

```sh
$ sudo ufw delete X
```

🚨 Reverts router NAT configuration following same "[Configure Firewall and NAT](https://raspibolt.org/guide/bonus/raspberry-pi/tor-bridge.html#configure-firewall-and-router-nat)" previous step but this time deleting the configuration setting.

### Uninstall systemd hardening

* Reverts "systemd hardening" in service files configuration changing the next files

  ```sh
  $ sudo nano /lib/systemd/system/tor@default.service
  ```

* Change `"NoNewPrivileges=yes"` to `"NoNewPrivileges=no"`. Save and exit

  ```sh
  # Hardening
  NoNewPrivileges=no
  ```

* Same for `"tor@.service"` file, change `"NoNewPrivileges=yes"` to `"NoNewPrivileges=no"`. Save and exit

  ```sh
  $ sudo nano /lib/systemd/system/tor@.service
  ```

  ```sh
  # Hardening
  NoNewPrivileges=no
  ```

* Reload systemd manager configuration to apply changes

  ```sh
  $ systemctl daemon-reload
  ```
