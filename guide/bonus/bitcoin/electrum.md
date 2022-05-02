---
layout: default
title: Electrum Wallet
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---

## Bonus guide: Electrum wallet
{: .no_toc }

Difficulty: Easy
{: .label .label-yellow }

Status: Not tested v3
{: .label .label-yellow }

--

## Connect Electrum wallet

[Electrum wallet](https://electrum.org){:target="_blank"} is a well-established, feature-rich Bitcoin wallet for power-users that supports most hardware wallets.

![Electrum Wallet local](../../images/electrum-wallet-tor.png){:target="_blank"}

### Force single server connection

To make sure Electrum only uses your own server and does not connect to any other public server by accident, we'll hardcode the connection directly in the configuration file.

* On your regular computer, open the Electrum `config` file in a text editor.
  It is located in the Electrum data directory.
  Refer to the [official documentation](https://electrum.readthedocs.io/en/latest/faq.html#datadir){:target="_blank"} on how to find it.

* Change `"auto_connect": true,` to `"auto_connect": false,`.
  This prevents any automatic connection to public Electrum servers, which could potentially leak private information.

* Change `"oneserver": false,` to `"oneserver": true,`.
  This ensures that all data is only retrieved from one single server.

### Local connection

If you use Electrum only within your own home network, you can use the local connection details.
To connect from outside your network over Tor, skip to the next section.

* Add (or change) the line containing `"server":` to force Electrum to use your own server.
  You can use the hostname `raspibolt.local` or your IP address.

  ```sh
  "server": "raspibolt.local:50002:s",
  ```

If you start Electrum, the green LED in the bottom right indicates an active connection to your server.

### Remote connection over Tor

If you connect over Tor, make sure that Tor is installed on your regular computer.
There are two options:

* Easy: download, install and run [Tor Browser](https://www.torproject.org){:target="_blank"}.
  * The application must be started manually and run in the background whe you want to connect over Tor.
  * Tor proxy available on port `9150`

* Expert: install Tor as a background service
  * The background service must be installed, and is always active in the background.
  * Tor proxy available on port `9050`
  * See further installation instructions for [Windows](https://bitstobytes.org/tor){:target="_blank"}, [macOS](https://deepdarkweb.github.io/how-to-install-tor-on-macos-tutorial/){:target="_blank"}, and Linux (`sudo apt install tor`).

Now we need to specifiy the Tor address for Electrs and the local Tor proxy port in the Electrum configuration.

* Get the Electrs onion address directly on the RaspiBolt

  ```sh
  $ sudo cat /var/lib/tor/hidden_service_electrs/hostname
  > abcdefg..............xyz.onion
  ```

* Add (or change) the line containing `"server":` to force Electrum to use your own server over Tor.

  ```sh
  "server": "abcdefg..............xyz.onion:50002:s",
  ```

* Add (or change) the folowing line, using the correct port (either `9150` when using the Tor Browser, or `9050` for the Tor background service)

  ```sh
  "proxy": "socks5:127.0.0.1:9150::",
  ```

If you start Electrum, the blue LED in the bottom right indicates an active Tor connection to your server.

<< Back: [+ Bitcoin](index.md)
