[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ **Bonus** ] -- [ [Troubleshooting](raspibolt_70_troubleshooting.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

## Bonus guide: Anonymous node with Tor
*Difficulty: medium*

### What is Tor?

Tor is a free software that allows you to anonymize internet traffic by routing traffic through a network of nodes to hide the location and usage profile of end points. 

It is called "Tor" for "The Onion Router": information is encrypted multiple times with the public keys of the nodes it passes through. Each node decrypts the layer of information that corresponds to its own private key, pretty much like peeling an onion, until the last that will reveal the clear message.

:point_right: To learn more : [Wikipedia](https://en.wikipedia.org/wiki/Tor_%28anonymity_network%29)

### Why do you want to run Tor?

Tor is mainly useful as a way to impede traffic analysis, which means analyzing your internet activity (websites you're browsing, services you're using, from which IP address) to learn about you and your interests. Traffic analysis is useful for advertisement and you might want to hide this kind of information merely out of privacy concerns. But it is also being used by outright malvolent actors, criminals or governments, to harm you in a lot of possible ways.

Tor allows you to share data on the internet without revealing your location or identity, which can definitely be useful when running a Bitcoin node.

Out of all the reasons why you should run Tor, here are the most relevant to Bitcoin:
* By exposing your home IP address with your node, you are literally saying the whole planet "in this home we run a node". That's only one short step from "in this home, we do have bitcoins", which could potentially turn you and your loved ones into a target for thieves.
* In the eventuality of a full fledged ban and crackdown on Bitcoin owners in the country where you live, you will be an obvious target for law enforcement.
* Coupled with other privacy method like CoinJoin you can gain more privacy for your transactions, as it eliminates the risk of someone being able to snoop on your node traffic, analyze which transactions you relay and try to figure out which UTXOs are yours, for example.

All the above mentioned arguments are of course relevant to both Bitcoin and Lightning, as someone that sees a Lightning node running on your home IP address could easily infer that there's a Bitcoin node at the same location. 

### Installing Tor

**Only Raspberry Pi 3 or better**
This guide assumes that you're running a Raspberry Pi 3 or better. If your RaspiBolt is built on an earlier version, it won't work as described below and you might want to [look at this](https://tor.stackexchange.com/questions/242/how-to-run-tor-on-raspbian-on-the-raspberry-pi) instead.

For additional reference, the original instructions are available on the Tor project website: [https://www.torproject.org/docs/debian.html.en#ubuntu](https://www.torproject.org/docs/debian.html.en#ubuntu).

* Connect to the RaspiBolt as user "admin", as [described in the main guide](raspibolt_20_pi.md#connecting-to-the-pi). 

* Add the torproject repository. 
  ```
  $ sudo echo 'deb https://deb.torproject.org/torproject.org bionic main' >> /etc/apt/sources.list
  $ sudo echo 'deb-src https://deb.torproject.org/torproject.org bionic main' >> /etc/apt/sources.list
  ```
* In order to check Tor files integrity, download and add the signing keys of the torproject using the network certificate management service (dirmngr).
  ```
  $ sudo apt install dirmngr
  $ gpg --keyserver keys.gnupg.net --recv A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89
  $ gpg --export A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89 | sudo apt-key add -
  ```

* Now the latest version of Tor can be installed. While not required, `tor-arm` provides a dashboard that you could find useful.
  ```
  $ sudo apt update
  $ sudo install tor tor-arm
  ```

* Check that Tor is up and running.
  ```
  $ systemctl status tor.service
  ```
* Read the tor-service-defaults-torrc file, check the "user" name (must be "debian-tor")
  ```
  $ cat /usr/share/tor/tor-service-defaults-torrc
  ```

* Check which users belong to the debian-tor group. If "bitcoin" is not there, which is most likely the case, you will need to add it and check again.
  ```
  $ cat /etc/group | grep debian-tor
  $ sudo usermod -a -G debian-tor bitcoin
  $ cat /etc/group | grep debian-tor
  debian-tor:x:123:bitcoin
  ```
* Modify the Tor configuration by uncommenting (removing the #) or adding the following lines.
  ```
  $ nano /etc/tor/torrc
  ```
  ```
  ControlPort 9051
  CookieAuthentication 1
  CookieAuthFileGroupReadable 1
  ```

* Restart Tor to activate modifications
  ```
  $ sudo systemctl restart tor.service
  ```

### Configure Bitcoin Core

In the "admin" user session, stop Bitcoin and Lightning.

``` 
$ sudo systemctl stop bitcoind
$ sudo systemctl stop lnd
```

Open the Bitcoin configuration and add the following lines:
```
$ sudo nano /home/bitcoin/.bitcoin/bitcoin.conf
```
```
proxy=127.0.0.1:9050
bind=127.0.0.1
listenonion=1
```

Restart services:  
```
$ sudo systemctl start bitcoind
$ sudo systemctl start lnd
```

:point_right: If you're a bit lost, you can watch [this video](https://youtu.be/57GW5Q2jdvw) that is very clear and shows pretty much the same process (there are also some extra optional steps that I describe below).

### Configure LND

:warning: LND needs **Tor3.6.6 or newer**. If you followed this tutorial to install Tor this shouldn't be an issue.  
:warning: In case you have been running a node on clearnet before, I recommend you to close all your channels and start a brand new node on Tor, as I suspect that if your public key is known to your peers with your IP address, you would still be pretty easy to deanonymize. I never read anything about that though, if someone knows better I would be very happy to hear from him.

* With the "admin" user, stop LND:
  ```
  $ sudo systemctl stop lnd
  ```

* Open the LND configuration file and add the following lines:  
  ```
  $ sudo nano /home/bitcoin/.lnd/lnd.conf`
  ```
  ```
  tor.active=1
  tor.v3=1
  listen=localhost
  ```

* Restart LND as usual, give it some time and unlock the wallet:
  ```
  $ sudo systemctl start lnd
  $ lncli unlock
  ```

:point_right: More information is available [on the LND project Github repository](https://github.com/lightningnetwork/lnd/blob/master/docs/configuring_tor.md).

### How do I check my Bitcoin traffic is correctly routed through Tor?

####1. Bitcoin
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
​	
* You can also check the output of `getnetworkinfo`:

![networkinfo](./images/69_networkinfo.png)

If you see the 3 different networks are all binded to proxy `127.0.0.1:9050`, which is Tor on your localhost, then it should be fine. Note the `onion` network is now `reachable: true`.

* Are you reachable by other nodes in the network?

To find out, go to [this site](https://bitnodes.earn.com/) and copy/paste your `.onion` address here:

![bitnodes](./images/69_bitnodes.png)

Don't freak out if the result is negative, sometimes bitnodes will fail to contact your node for some reasons, just try again a minute later and most of the time it will come up green. 


* Last but not least, you can check the address that other peers see you with by running this command (if you don't know, the `|` is Alt Gr + 6):  
`$ bitcoin-cli getpeerinfo | grep  local`

You should know see a list of unknown IP addresses. If you still see your true public IP somewhere, something is wrong, as **one of your peers is currently connected with you on clearnet, meaning that you're effectively deanonymized**.

2. LND
* The output of `lncli getinfo` or `lncli getnodeinfo [YOUR_PUBKEY]` commands should not display your IP address anymore. 

### Go a little further

Your Bitcoin and Lightning nodes are now connected to the world through Tor network, and are much harder to isolate and identify with a geographical location. 

But you should be aware that Tor is no [silver bullet](https://security.stackexchange.com/questions/147402/how-do-traffic-correlation-attacks-against-tor-users-work), and that you are still vulnerable to a range of attacks that go from "simple" DoS to total deanonymization of users.

I hope that the configuration proposed here would be a good compromise between performance and security for an average user that is exposed to average risks.

Meanwhile, you can still choose to reduce even further your attack surface, the price to pay being your ability to connect with other peers, which can be a very serious risk as it could potentially makes you fall out-of-sync with the rest of the network.

For example, you can:

* Accept to connect only with peers that have a `.onion` address:

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

With this configuration, your node is not capable to find peers on its own. That's why it is necessary to bootstrap him with a hardcoded list of a few nodes he can contact with on startup in the `bitcoin.conf` file:

`addnode=[ADDRESS].onion(:port)`

You need to add one line for each address. You can find address lists online, for example [here](https://bitcoin.stackexchange.com/questions/70069/how-can-i-setup-bitcoin-to-be-anonymous-with-tor), but it raises other risks so be careful...

Don't forget to restart bitcoind each time you change something. 

------

<< Back: [Bonus guides](raspibolt_60_bonus.md) 
