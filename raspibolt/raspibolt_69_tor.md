[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [**Bonus**](raspibolt_60_bonus.md) ] -- [ [FAQ](raspibolt_faq.md) ] -- [ [Updates](raspibolt_updates.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

## Bonus guide: Tor
*Difficulty: medium*

### What is Tor?

Tor is free software that allows you to anonymize internet trafic when used properly. The idea is to route trafic through a network of nodes to hide end points location and usage. 

It is called "Tor" for "The Onion Router" : information is encrypted multiple time with the public keys of the nodes it passes through. Each node decrypt the layer of information that corresponds to its own private key, pretty much like peeling an onion, until the last that will reveal the clear message.

:point_right: To learn more : [Wikipedia](https://en.wikipedia.org/wiki/Tor_%28anonymity_network%29)

### Why do you want to run Tor?

Tor is mainly useful as a way to impede trafic analysis, which means analysing your internet activity (websites you're browsing, services you're using, from which IP etc) to learn about you and your interests. Trafic analysis is obviously useful for advertisement, and you might want to hide this kind of information merely out of privacy concerns. But it is also being used by outright malvolent actors, criminals or governments, to harm you in a lot of possible ways.

Tor allows you to share data on the internet without revealing your location and/or identity, which can definitely be useful when you want to run a Bitcoin node.

Out of all the reasons why you should run Tor, here are the most relevant to Bitcoin:
* By exposing your home IP address with your node, you are literally saying the whole planet "in this home we run a node". That's only one short step to "in this home, we do have bitcoins", which could potentially turn you and your loved ones into a target for thieves.
* In the eventuality of a full fledge ban and crackdown on Bitcoin owners in the country where you live, you will be an obvious target for law enforcement.
* Coupled with other privacy method like Coinjoin, I think you could definitely gain some more privacy for your transactions as it eliminates the risk of someone being able to snoop on your node trafic, analyses which transactions you relay and correlates it with a set of UTXOs that he knows being yours, for example.

All the above mentioned arguments are of course relevant to both Bitcoin and Lightning, as someone that sees a Lightning node running on your home IP address could easily infer that there's a Bitcoin node on the same location. 

### Install Tor

Connect to the raspibolt's admin account through SSH:
`$ ssh admin@[YOUR_IP]`

Instructions are available on the tor project homepage: [https://www.torproject.org/docs/debian.html.en#ubuntu](https://www.torproject.org/docs/debian.html.en#ubuntu)

:warning: I assume that you run a Pi 3 or better. If your Raspibolt is built on an earlier version it won't work as described below.

```
# Add the torproject repo in /etc/apt/sources.list
$ sudo echo 'deb https://deb.torproject.org/torproject.org bionic main' >> /etc/apt/sources.list
$ sudo echo 'deb-src https://deb.torproject.org/torproject.org bionic main' >> /etc/apt/sources.list

# Install dirmngr
$ sudo apt install dirmngr

# In order to check Tor files integrity, we need to download and add the signing keys of the torproject
$ gpg --keyserver keys.gnupg.net --recv A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89
$ gpg --export A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89 | sudo apt-key add -

# We can now install Tor latest version
$ sudo apt update
$ sudo install tor tor-arm
```

:point_right: while not required, `tor-arm` provides a dashboard that you could find useful.

We should now check that Tor is up and running:
```
# Check there is a tor.service running
$ systemctl status tor.service

# Read the tor-service-defaults-torrc file, chack the "user" name ("debian-tor" in most cases)
$ cat /usr/share/tor/tor-service-defaults-torrc

# Check which users belong to the debian-tor group
$ cat /etc/group | grep debian-tor

# If "bitcoin" is not there, you will need to add it
$ sudo usermod -a -G debian-tor bitcoin
$ cat /etc/group | grep debian-tor
> debian-tor:x:123:bitcoin

# Modify some lines in /etc/tor/torrc
$ nano /etc/tor/torrc
> #ControlPort 9051 (delete "#")
> #CookieAuthentication 1 (same)
# Add this line if it is not already there
> CookieAuthFileGroupReadable 1

# Save and exit with ^X

# Restart tor.service to activate modifications
$ sudo systemctl restart tor.service
```

### Configure Bitcoin Core

Open a new session with "bitcoin" user. First, stop bitcoind:  
`$ bitcoin-cli stop`

We will now add the following lines in `bitcoin.conf`:
```
proxy=127.0.0.1:9050
bind=127.0.0.1
listenonion=1
```

Restart Bitcoin Core:
`$ nohup bitcoind`

:point_right: If you're a bit lost, you can watch [this video](https://youtu.be/57GW5Q2jdvw) that shows pretty much the same process (except for some extra configuration that you can ignore), except it's not on a Pi.

### Configure LND

:warning: LND needs **Tor3.6.6 or newer**. If you followed this tutorial to install Tor this shouldn't be an issue.  
:warning: In case you have been running a node on clearnet before, I recommend you to close all your channels and start a brand new node on Tor, as I suspect that if your public key is known to your peers with your IP address, you would still be pretty easy to deanonymize. I never read anything about that though, if someone knows better I would be very happy to hear from him.. 

With "bitcoin" user, stop LND:  
`$ lncli stop`

Open conf file:  
`$ nano .lnd/lnd.conf`

Add the following lines:
```
tor.active=1
tor.v3=1
listen=localhost
```

Restart LND as usual:
```
$ nohup lnd
$ lncli unlock
```

:point_right: More information [here](https://github.com/lightningnetwork/lnd/blob/master/docs/configuring_tor.md).

### How do I check my Bitcoin trafic is correctly routed through Tor?

1. Bitcoin :
* You can check some lines are printed in the `debug.log` file on startup:
```
InitParameterInteraction: parameter interaction: -proxy set -> setting -upnp=0
InitParameterInteraction: parameter interaction: -proxy set -> setting -discover=0
[...]
torcontrol thread start
[...]
tor: Got service ID [YOUR_ID] advertising service [YOUR_ID]:8333
addlocal([YOUR_ID].onion:8333,4)
```

![startup](./images/69_startup.png)

![startup2](./images/69_startup2.png)
	
* You can also check the output of `getnetworkinfo`:

![networkinfo](./images/69_networkinfo.png)

If you see the 3 different networks are all binded to proxy `127.0.0.1:9050`, which is Tor on your localhost, then it should be fine. Note the `onion` network is now `reachable: true`.

* Are you reachable by other nodes in the network?

To find out, go to [this site](https://bitnodes.earn.com/) and copy/paste your `.onion` address here:

![bitnodes](./images/69_bitnodes.png)

Don't freak out if the result is negative, sometimes bitnodes will fail to contact your node for some reasons, just try again a minute later and most of the time it will come up green. 


* Last but not least, you can check the address that other peers see you with by running this command (if you don't know, the `|` is Alt Gr + 6):  
`$ bitcoin-cli getpeerinfo | grep  local`

You should know see a list of unknown IP addresses. If you still see your true public IP somewhere, somethings wrong, as **one of your peers is currently connected with you outside of the Tor network, meaning that you're effectively deanonymized**.

2. LND
* The output of `lncli getinfo` ou `lncli getnodeinfo [YOUR_PUBKEY]` commands should not display your IP address anymore. 

### Go a little further

Your Bitcoin and Lightning nodes are now connected to the world through Tor network, and are much harder to isolate and identify with a geographical location. 

But you should be aware that Tor is no [silver bullet](https://security.stackexchange.com/questions/147402/how-do-traffic-correlation-attacks-against-tor-users-work), and that you are still vulnerable to a range of attacks that go from "simple" DoS to total deanonymization of users.

I hope that the configuration proposed here would be a good compromise between performance and security for an average user that is exposed to average risks.

Meanwhile, you can still choose to reduce even further your attack surface, the price to pay being your ability to connect with other peers, which can be a very serious risk as it could potentially makes you fall out-of-sync with the rest of the network.

For example, you can:

* Accept to connect only with peers with a `.onion` address:

In `bitcoin.conf` file, add the following line:
`onlynet=onion`

You will notice that `ipv4` and `ipv6` networks are now unreachable, meaning that you can connect only to peers on the Tor network.

* Deactivate DNS for look-up for other peers:

DNS could potentially be used to deanonymize you, or at least it happened in the past, and some people might want to deactivate DNS request usually used to find other nodes on the network.

In `bitcoin.conf`, add the following lines:
```
dnsseed=0
dns=0
```

If you want to know more about DNS, you can have a look at [Wikipedia](https://fr.wikipedia.org/wiki/Domain_Name_System) or this [very well-done comic](https://wizardzines.com/zines/networking/).

With this configuration, your node is not capable to find peers on its own. That's why it is necessary to give him a hardcoded list of a few nodes he can contact with on startup in the `bitcoin.conf` file:

`addnode=[ADDRESS].onion(:port)`

You need to add one line for each address. You can find address lists online, for example [here](https://bitcoin.stackexchange.com/questions/70069/how-can-i-setup-bitcoin-to-be-anonymous-with-tor), but it raises other risks so be careful...

Don't forget to restart bitcoind each time you change something. 

------

<< Back: [Bonus guides](raspibolt_60_bonus.md) 