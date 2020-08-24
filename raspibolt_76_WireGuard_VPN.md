---
layout: default
title: WireGuard VPN
parent: Bonus Section
nav_order: 76
---
<!-- markdownlint-disable MD014 MD022 MD025 MD040 -->

## Bonus guide: WireGuard: a simple yet fast VPN 
*Difficulty: advanced*

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---


[WireGuard](https://www.wireguard.com) is a VPN you can install to access your RaspiBolt from outside without openning more than one port of your router. 
It makes easier to run many more services on the Pi without exposing them to the public Internet and it also gives you a good security overall as you can connect to your node but also surf on the web from public networks safely. 
It has support on all computer OS, and an Android app. But you will need to be able to forward a port on the router of the local network to the RaspiBolt.


![https://www.wireguard.com](https://www.wireguard.com/img/wireguard.svg)

---

## Why using WireGuard and trade-off

A VPN is an encrypted tunnel between two computers over the internet. In our case, the RaspiBolt will play the role of the server and you will be able to access your home network from outside with configurated client devices.
Depending on the configuration of the client, you can redirect all your internet traffic through the VPN which will hide the true destination from the internet provider your client is currently using (the classical case is public network). 
However, your home internet provider (where your RaspiBolt is connected) will be able to tell what you are doing, but it will see it coming from your home.

There are several trade-off using a VPN against using Tor:

 * The connection with the VPN is a lot faster than using Tor (bitcoin and lnd will still use Tor if already the case)
 * WireGuard has an incredible low ressource usage. It will automatically go to sleep when not use and instantaneously reconnect if needed whereas Tor has a significant initialization time.
 * The attack surface on your home network and RaspiBolt is reduced as less ports are open on your router if you must use services without Tor.
 * However a VPN is not anonymous, a spy can see that you send encrypted traffic to your home router but he cannot know what you are doing
 * Someone inside your home network will see encrypted traffic going to your RaspiBolt and decrypted traffic going to the router back in your RaspiBolt
 * WireGuard is not censorship-resistant. The encrypted byte headers contain identifiable data which allows to tell that you are using WireGuard VPN.
 * You need to open one port on your router if you don't use IPv6, which is more than 0 when you rely only on Tor (notice that all services are not Tor-compatible like lndhub, Joule, Juggernaut....)

![A VPN simulates that you are connected from your home network](https://upload.wikimedia.org/wikipedia/commons/e/e8/VPN_overview-en.svg)

The primary function of the VPN is to protect your home network (and so your RaspiBolt). 
However an untrusted actor inside your home network (like the router furnished by your internet provider) may attempt to access critical services on your node. So you must still use good passwords even if the service is not exposed to internet anymore.

Finally WireGuard is still experimental (but soon officially in linux kernel).

This tutorial is almost complete. Copy-pasting command line instructions should work (except when you have to complete with private and public keys). However you need to know the public URL/IP of your home router where the RaspiBolt is connected and to forward a port (51820 if you just copy-paste command lines). The procedure can be different for each router so you are on your own to do it. If your router does support NAT Loopback, it must be active if you want to have be able to connect your VPN client from the local network of the RaspiBolt with IPv4 (which is useless in theory but disconnecting the VPN several time at home may be inconvenient if you enable VPN at boot on one client device).

---

## Installation of WireGuard on RaspiBolt

Connect to your RaspiBolt as admin.
WireGuard is not in Raspbian repo so we have to add the unstable debian repo and distro keys:

```
$ echo "deb http://deb.debian.org/debian/ unstable main" | sudo tee --append /etc/apt/sources.list
$ sudo apt-key adv --keyserver   keyserver.ubuntu.com --recv-keys 04EE7237B7D453EC
$ sudo apt-key adv --keyserver   keyserver.ubuntu.com --recv-keys 648ACFD622F3D138
```

We also want to avoid to use unstable package for other software:

```
$ sudo sh -c 'printf "Package: *\nPin: release a=unstable\nPin-Priority: 90\n" > /etc/apt/preferences.d/limit-unstable'
```

We update the packages and install WireGuard

```
$ sudo apt-get update
$ sudo apt install wireguard
```

You will need to install WireGuard on clients from which you want to access to your local home network.

---

## Configuration of the server on RaspiBolt

We generate a key pair for the server

```
$ sudo su
# cd /etc/wireguard
# umask 077
# wg genkey | tee server_private_key | wg pubkey > server_public_key
```

Take note of the value of the private and public keys ready to be used

```
# cat server_private_key
# cat server_public_key
```

For each client you wish to connect, you need to create another key pair using this set of command:

```
# wg genkey | tee client_private_key | wg pubkey > client_public_key
# cat client_private_key
# cat client_public_key
```
Take note of each private and public key. If you want to add more than one peer already, don't forget to change the file name to keep the first key pair when generating the second.
You will be able to add client later too.

We create and configure a new WireGuard interface.

```
# nano wg0.conf
```

Paste and complete the following:

```
[Interface]
Address = 10.42.2.1/24
PrivateKey = <insert server_private_key>
ListenPort = 51820

PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
PublicKey = <insert client_public_key>
AllowedIPs = 10.42.2.2/32
```
We need to understand what is happenning here, so let us explain what each line mean so that we know how to change them if you need:

 * `[Interface]` is the section where we configure the interface on this computer (the RaspiBolt)
 * `Address` is field with any IPs range `/24` for local network.  `10.42.2.1/24` means that the VPN server local IP address is `10.42.2.1`  and it will process all the IPs of the local network of the RapiBolt of the form `10.42.2.*` where `*` can be any number between 2 and 255.  They are the local IPs of the subnet of your local network that contain the VPN server and its clients. 
 **It MUST be different from the range of IPs used by the router for the home network.** (Do not set it to 192.168.1.1/24 if these IPs are used by your router already to find the RaspiBolt for example).
 * `PrivateKey` is the private key used by the server. You must set it with the result of `# cat server_private_key` you noted before
 * `ListenPort = 51820` is the port on which the VPN server is listening. **This is the port you must let open on your router** (and it should be the only one once WireGuard works)
 * The next two lines allow clients connected to the VPN server to access your home network (and other services of your Raspberry). 
 If your RaspiBolt is connected by the **WIFI you must change `eth0` with `wlan0`**
 * `[Peer]` is the section where you specified the peer that are allowed to use the VPN. You must add one section for each peer and it should start with this header.
 * `PublicKey` is the public key of the current peer. You must set it with the result of `# cat client_public_key` you noted before
 * ` AllowedIPs` must be the local IP of the client on the VPN network. It must be inside VPN network range specified in `Address` field and different from VPN server IP (which is `10.42.2.1` in this example). `\32` indicates it is not a range of IP.
 
The example above should work just by completing private and public keys but **it is highly recommanded to not use the same value for private IPs than the ones in this public guide** (you can change 42.2 part of the IP range 10.42.2.* by anything else or used IP in range specified [here](https://en.wikipedia.org/wiki/Private_network))

Save and quit text editor. Finally, we need to setup IP forwarding on the RaspiBolt:

```
# nano /etc/sysctl.conf
```

Uncomment the line "net.ipv4.ip_forward=1" in text editor and save/quit.
We start automatically WireGuard at boot:

```
# systemctl enable wg-quick@wg0
# chown -R root:root /etc/wireguard/
# chmod -R og-rwx /etc/wireguard/*
```

We must also enable connection to the VPN port of the RaspiBolt by `ufw`, change `51820` by what was set as `ListenPort` in the server configuration file:

```
# ufw allow 51820/udp comment 'allow WireGuard VPN'
# ufw enable
```

You may reboot your RaspiBolt to apply change correctly (don't forget to stop lnd and bitcoin properly). If it bother you too much, you can also start WireGuard and check it has started properly:

```
# wg-quick up wg0
# wg show
```

It should return:

```
> interface: wg0
>   public key: <server_public_key>
>   private key: (hidden)
>   listening port: 51820
```

---

## Communicate with the VPN server

We need to setup port forwarding on your router if our clients cannot use IPv6 so that we can send encrypted packet to the RaspiBolt from outside. There is no general method as it depends of your router.
You need to forward the port (here 51820) to the local IP addres of the RaspiBolt. You can obtain it by running `ifconfig` and use the first IP address of the interface `eth0` or `wlan0` or [here](https://stadicus.github.io/RaspiBolt/raspibolt_20_pi.html#connecting-to-the-raspberry-pi).
You may need to set a static local IP address to the RaspiBolt on your router (DHCP settings). More information [here](https://engineerworkshop.com/blog/connecting-your-raspberry-pi-web-server-to-the-internet/#port-forwarding)

You must install WireGuard on devices you want to connect to your local network through VPN. Once again you have to create a WireGuard interface that will route a part of your traffic to the VPN server.

The configuration file must be created in `/etc/wireguard` folder on Linux clients, use the `add empty tunnel` option for Windows clients, `/usr/local/etc/wireguard` for mac. On Android, install the application and use "+" button.

Name your file `raspibolt.conf` (`raspibolt` will be the name of the interface on the client device) and complete the file as such:

```
[Interface]
Address = 10.42.2.2/32
PrivateKey = <insert client_private_key>

[Peer]
PublicKey = <insert server_public_key>
Endpoint = <insert vpn_server_address>:51820
AllowedIPs = <to_be_completed>
```

Again, we need to explain what it means so that you know how to change the value if needed.

 * `[Interface]` is the section where we set the identity of the client in VPN subnet.
 * `Address` is the IP address of this client in the VPN subnet. It must match the one specified in `AllowedIP` field in `[Peer]` section of the configuration file we completed in the Raspberry Pi.
 * `PrivateKey` is the result of `# cat client_private_key` you noted before
 * `[Peer]` is the section where we declare the identity of the server and what we send to it.No matter how many clients there is, we need to declare only the server on each client.
 * `PublicKey` is the result of `# cat server_public_key` you noted before
 * `Endpoint` is the public URL or IP of your router (prefer an URL over IPv4). You must find it on the menu of your router. Change `51820` if you decide to open/use another port for the VPN server. If you want to use IPv6, you can find the complete IPv6 of the Raspibolt with `ifconfig` (if your client is not at a fixed place, it is possible that IPv6 may not be enable on other networks it will use so the VPN won't work, you can add a comment with IPv4 address to change th `Endpoint` easly just in case using `#` at the beginning of the line in the file).
 
If you made it until now, congratulation ! We're almost there !

We need to set up `AllowedIPs`. You have several possibilities and it depends of your needs, you may use two configuration files to change this setting quickly:
 1. You can set `AllowedIPs = 0.0.0.0/0, ::/0` in this case, all the internet traffic of the client is encrypted and send to the VPN server. This is useful to protect yourself on your phone when using a public network for example. You won't notice anything if your home network is working well except maybe a slightly higher latency.
 2. You can set `AllowedIPs = 10.42.2.0/24, <local_IP_RaspiBolt>/32` where you can get the local IP of the RaspiBolt with `ifconfig` and look at the first IP in `eth0` or `wlan0` interface or [here](https://stadicus.github.io/RaspiBolt/raspibolt_20_pi.html#connecting-to-the-raspberry-pi). The VPN is used on the client only when you try to access the RaspiBolt with its local IP from outside.
 3. You can set `AllowedIPs = 10.42.2.0/24, <local_IP_range>` where `<local_IP_range> is the range of IP of you local home network. Often it should be something like `10.0.0.0/24` or `192.168.1.0/24`. The VPN is used when you try to access to any computer in your home network as if you where there.

The IPs `10.42.2.0/24` must be the ones you set for the VPN subnet in server interface.

Start the tunnelling, on linux you must run (or the button "Connect" on the GUI)

```
$ sudo wg-quick up raspibolt
``` 

(and `sudo wg-quick down raspibolt` to stop the tunnelling)

---

## Test and eventual problems

From the client, ping the VPN server (replace IP with the one you use in `wg0.conf`), on linux command line:

```
$ ping 10.42.2.1
```

or monitor the VPN (you should see you have the VPN server as a peer and you must have received packets from him)

```
$ sudo wg show
```

If you received some packets, it works !

If not, check port forwarding is working correctly.

If not and you try it from the same local network as the RaspiBolt, try to ping the raspibolt using its local address (you got it [before](https://stadicus.github.io/RaspiBolt/raspibolt_20_pi.html#connecting-to-the-raspberry-pi)). 
If nothing happen (ping returns nothing) and moreover if you seems to not be able to connect to your RaspiBolt with ssh from your local network when tunnelling is up, the explanation may be that you need to set the NAT Loopback on your router.
If your router doesn't allow NAT Loopback then use the public in IPv6 in the field `Endpoint`.
If your router doesn't allow/you don't want to use IPv6 then stop the tunnelling (`sudo wg-quick down raspibolt` in Linux command line) on your client, you can only test your VPN from outside.

A good way to test your VPN from home is to use your smartphone on 4G with internet data (it will work on WIFI only if the RaspiBolt is connected in ethernet) with the [WireGuard application](https://play.google.com/store/apps/details?id=com.wireguard.android). If you can access services like electrs server or blockexplorer from your phone without Tor with local IP of the RaspiBolt, the VPN works !

---

## Easy configuration on smartphone

Instead of filling the form on the WireGuard app on the smartphone, you can use a qr code.

Completed the configuration file on the RaspiBolt or on the computer and use

```
$ qrencode -t ansiutf8 < /etc/wireguard/clients/mobile.conf
````

to print a qr code in command line that you can scan with the WireGuard app. Install `qrencode` with `apt install qrencode` if necessary.

---

## Adding more clients

For each new clients you have to:

 1. Generate a key pair
 ```
 # wg genkey | tee client_private_key | wg pubkey > client_public_key
 # cat client_private_key
 # cat client_public_key
 ```
 2. Add a `[Peer]` section to server configuration file, you must use the previously generated public key and choose a new local IP for the client (incrementing last number is fine):
 ```
 [Peer]
PublicKey = <insert client_public_key>
AllowedIPs = 10.42.2.3/32
```
3. Create a configuration file on your client with the same local IP and using the generated private key:
```
[Interface]
Address = 10.42.2.3/32
PrivateKey = <insert client_private_key>

[Peer]
PublicKey = <insert server_public_key>
Endpoint = <insert vpn_server_address>:51820
AllowedIPs = <to_be_completed>
```
complete the fields `AllowedIPs` as you think you will need for this client. You may replicate the configuration file with a different name and value for `AllowedIPs`to change quickly the interface used to redirect your internet traffic.

**You can't use two different clients with the same key pair at the same time**

---

## Clean up

If everything works fine, you can delete the files containing the key pairs of server and clients, except the public key of the server that may be useful when adding new clients.

You can now close all ports of your home router except the one used for the VPN (51820 for our example)

Enjoy all the advantages of a VPN on your node ! You can now access your block explorer or RTL by typing in a browser the local IP address of the RaspiBolt with the port associated to each from anywhere in the world (where WireGuard is not censored...) !
