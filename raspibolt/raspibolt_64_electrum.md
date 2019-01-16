[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [**Bonus**](raspibolt_60_bonus.md) ] -- [ [Troubleshooting](raspibolt_70_troubleshooting.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

## Bonus guide: Electrum Personal Server

*Difficulty: intermediate*

### Introduction

The best way to safekeep your bitcoin (meaning the best combination of security and usability) is to use a hardware wallet (like [Ledger](https://www.ledgerwallet.com/) or [Trezor](https://trezor.io/)) in combination with your own Bitcoin node. This gives you security, privacy and eliminates the need to trust a third party to verify transactions.

With the RaspiBolt setup, the Bitcoin Core wallet on the node can only be used from the command line as no graphical user interface is installed. As Bitcoin Core does not offer support for hardware wallets, only a "hot wallet" (exposed to the internet) can be realized. 

One possibility to use Bitcoin Core with more functionality is to set up an additional [ElectrumX](https://github.com/kyuupichan/electrumx) server and then use the great [Electrum wallet](https://electrum.org/) (on your regular computer) that integrates with hardware wallets. But this setup is not easy, and the overhead is more than a Raspberry Pi can handle.

The new [Electrum Personal Server](https://github.com/chris-belcher/electrum-personal-server) makes it possible to connect Electrum (using your hardware wallet) directly to your RaspiBolt. In contrast to ElectrumX, this is not a full server that serves multiple users, but your own dedicated backend. 

Before using this setup, please familiarize yourself with all components by setting up your own Electrum wallet, visiting the linked project websites and reading [The Electrum Personal Server Will Give Users the Full Node Security They Need](https://bitcoinmagazine.com/articles/electrum-personal-server-will-give-users-full-node-security-they-need/) in Bitcoin Magazine.

### Preparations

* With user 'admin', make sure Python3 and PIP are installed  
  `$ sudo apt install -y python3 python3-pip`

* Configure firewall to allow incoming requests (please check if you need to adjust the subnet mask as [described in original setup](raspibolt_20_pi.md#enabling-the-uncomplicated-firewall))
  ```
  $ sudo ufw allow from 192.168.0.0/24 to any port 50002 comment 'allow EPS from local network'
  $ sudo ufw enable
  $ sudo ufw status
  ```

Electrum Personal Server uses the Bitcoin Core wallet with "watch-only" addresses to monitor the blockchain for you.

* Make sure that in "bitcoin.conf", `disablewallet=1` is not set (it can be either missing, or set to `0`). Save and exit.  
  `$ sudo nano /home/bitcoin/.bitcoin/bitcoin.conf`

* If you changed `bitcoin.conf`, restart bitcoind   
  `$ sudo systemctl restart bitcoind`

### Install Electrum Personal Server

* Open a "bitcoin" user session and change into the home directory  
  `$ sudo su - bitcoin`  

* Download, verify and extract the latest release (check the [Releases page](https://github.com/chris-belcher/electrum-personal-server/releases) on Github for the correct links)  

  ```
  # create new directory on external hdd
  $ mkdir /mnt/hdd/electrum-personal-server
  $ ln -s /mnt/hdd/electrum-personal-server /home/bitcoin/electrum-personal-server
  $ cd electrum-personal-server
  
  # download release
  $ wget https://github.com/chris-belcher/electrum-personal-server/archive/eps-v0.1.6.tar.gz
  $ wget https://github.com/chris-belcher/electrum-personal-server/releases/download/eps-v0.1.6/eps-v0.1.6.tar.gz.asc
  $ wget https://raw.githubusercontent.com/chris-belcher/electrum-personal-server/master/pgp/pubkeys/belcher.asc
  
  # verify that the release is signed by Chris Belcher (check the fingerprint)
  $ gpg --import belcher.asc
  $ gpg --verify eps-v0.1.6.tar.gz.asc
  > gpg: Good signature from "Chris Belcher <false@email.com>" [unknown]
  > Primary key fingerprint: 0A8B 038F 5E10 CC27 89BF  CFFF EF73 4EA6 77F3 1129
  
  $ tar -xvf eps-v0.1.6.tar.gz  
  $ rm *.gz*
  ```

* Copy and edit configuration template (skip this step when updating)  
  ``` 
  $ cp electrum-personal-server-eps-v0.1.6/config.cfg_sample config.cfg
  $ nano config.cfg
  ```

  * Add your wallet master public keys or watch-only addresses to the `[master-public-keys]` and `[watch-only-addresses]` sections. Master public keys for an Electrum wallet can be found in the Electrum client menu `Wallet` -> `Information`.
  > Note the format when adding settings - name followed by value

  * In `[bitcoin-rpc]`, uncomment and complete the lines.  
    ```
    rpc_user = raspibolt
    rpc_password = [PASSWORD_B]
    ```
  > If you're still running on the testnet, update the `port = 18332`

  * In `[electrum-server]`, change the listening `host` to `0.0.0.0`, so that you can reach it from a remote computer. The firewall only accepts connections from within the home network, not from the internet.  
    ```
    host = 0.0.0.0
    ```
    
* Save and exit

* Install Electrum Personal Server
  ```
  $ cd electrum-personal-server-eps-v0.1.6/
  $ pip3 install --user .
  ```
  
  ![Install Electrum Personal Server with Python Pip](./images/60_eps_pip_install.png)

### First start 
The Electrum Personal Server scripts are installed in the directory `/home/bitcoin/.local/bin/`. Unfortunately, in Raspbian this directory is not in the system path, so the full path needs to be specified when calling these scripts. Alternatively, just [add this directory to your $PATH environment variable](https://unix.stackexchange.com/questions/26047/how-to-correctly-add-a-path-to-path), but it's not necessary in this guide.

  * The first time the server is run it will import all configured addresses as watch-only into the Bitcoin node. This can take up to 10 minutes, after that the program will exit. 
    ```
    $ /home/bitcoin/.local/bin/electrum-personal-server /home/bitcoin/electrum-personal-server/config.cfg
    ```
  
  * If your wallet has previous transactions, Electrum Personal Server needs to rescan the Bitcoin blockchain to get the historical information. This can take a long time for the whole blockchain, therefore you can set the start date of the scan (it will still take more than 1 hour per year of history).
    ```
    $ /home/bitcoin/.local/bin/electrum-personal-server-rescan /home/bitcoin/electrum-personal-server/config.cfg
    ```  
  
  * You can monitor the rescan progress in the Bitcoin Core logfile from a second SSH session:  
    ```
    $ sudo tail -f /home/bitcoin/.bitcoin/debug.log
    ```

  * Run Electrum Personal Server again and connect your Electrum wallet from your regular computer.
    ```
    $ /home/bitcoin/.local/bin/electrum-personal-server /home/bitcoin/electrum-personal-server/config.cfg
    ``` 

  [![Run Electrum Personal Server manually](images/60_eps_first-start.png)](https://github.com/Stadicus/guides/blob/master/raspibolt/images/60_eps_first-start.png)

### Connect Electrum

On your regular computer, configure Electrum to use your RaspiBolt:

* In menu: `Tools > Network > Server`
* Uncheck "Select server automatically"
* Enter the IP of your RaspiBolt (eg. 192.168.0.20) in the address field

  [![Connect Electrum to RaspiBolt](images/60_eps_electrum-connect.png)](https://github.com/Stadicus/guides/blob/master/raspibolt/images/60_eps_electrum-connect.png)

* `Close` and check connection in tab "Console"

  [![Check Electrum console](images/60_eps_electrumwallet.png)](https://github.com/Stadicus/guides/blob/master/raspibolt/images/60_eps_electrumwallet.png)
  
* This can also be achived by starting the Electrum wallet with the following command line arguments:  
  `--oneserver --server 192.168.0.20:50002:s`
  > If you're running against testnet add `--testnet` to the command above, else the Electrum Wallet will remain disconnected

### Automate startup
If everything works as expected, we will now automate the start of Electrum Personal Server on the RaspiBolt.

* On the Pi, exit Electrum Personal Server by pressing `Ctrl-C`  

* Exit the "bitcoin" user session back to user "admin"
  `exit`

* As "admin", set up the systemd unit for automatic start on boot, save and exit  
  `$ sudo nano /etc/systemd/system/eps.service`

```
[Unit]
Description=Electrum Personal Server
After=bitcoind.service

[Service]
ExecStart=/usr/bin/python3 /home/bitcoin/.local/bin/electrum-personal-server /home/bitcoin/electrum-personal-server/config.cfg
User=bitcoin
Group=bitcoin
Type=simple
KillMode=process
TimeoutSec=60
Restart=always
RestartSec=60

[Install]
WantedBy=multi-user.target
```

* Enable and start the eps.service unit  
  `$ sudo systemctl enable eps.service`  
  `$ sudo systemctl start eps.service`
  
* Check the startup process for Electrum Personal Server  
  `$ tail -f  /tmp/electrumpersonalserver.log`

---

### Don't trust, verify.

Congratulations, you have now one of the best Bitcoin desktop wallet, capable of securing your bitcoin with support of a hardware wallet, running with your own trustless Bitcoin full node! 

---

<< Back: [Bonus guides](raspibolt_60_bonus.md) 
