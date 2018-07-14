# The perfect Bitcoin Lightning️ node: Part 2

![img](images/thundroid_banner_mainnet.jpg)

> This article was first published in the Odroid Magazine August 2018 issue. 
>
> [Part 1: Setup of Bitcoin & Lightning on testnet](https://github.com/Stadicus/guides/blob/master/thundroid/README.md)  
> Part 2: Move to Bitcoin mainnet & outlook (this guide)

## Introduction to Part 2: Mainnet!

Remember part one of this guide? We set up a Bitcoin full node with Lightning from scratch, went to quite some length to secure our box and started testing Bitcoin on the testnet. If you did not catch [Part 1](https://github.com/Stadicus/guides/blob/master/thundroid/README.md), please read it first, as this part won't make much sense without it.

The goal of this guide is to switch our Thundroid from Bitcoin testnet to mainnet and to transact with real money. At the end of the day, this box is a box without a screen and the command line is just not for everyday use. So we will explore a few extensions like a desktop or mobile wallet that use Thundroid as our own trusted backend.

#### Financial best pracices

Bitcoin is a bearer asset like physical cash, so transactions cannot be reversed. Controlling your bitcoin actually means controlling the private keys that allow you use them. This means that if someone has access to your private keys, this person has full control over your bitcoins and once they are sent to a different address, there's nothing you can do to get them back.

To manage your bitcoin, you need a wallet. This is an application that manages the private keys for you. There is an important discinction:

* <u>Hot wallet</u>: an application that manages your private key and is exposed to the internet. It's very convenient (eg. a mobile application), but could potentially be hacked. This type of wallet is used for smaller amounts and for everyday use.
* <u>Cold storage</u>: your private key is never been exposed to any network. Examples are paper wallets (created / printed using an offline computer) or hardware wallets like a [Ledger](https://www.ledgerwallet.com) or [Trezor](https://trezor.io/). This is how you secure your savings in bitcoin.

By definition, this project is a hot wallet as it is connected to the internet. That means: **do not store large amounts of money on your Thundroid**! 

* <u>Bitcoin</u>: don't use the wallet built into Bitcoin Core at all. The way to go is to use a small hardware wallet  to secure your private keys with Thundroid as your trusted backend to send / verify transactionsbut. More on that later.
* <u>Lightning</u>: as the whole network is still in beta, it goes without saying that you should not put your life savings into it. Experimenting with small amounts is fine, but do it at your own risk.

Also, please be aware that while Bitcoin has been battle-tested for almost a decade and is used to move billions of USD every day, the Lightning Network is still in beta and under heavy development. This guide also allows you to set up your Bitcoin node while just ignoring the Lightning part.

## Moving to Mainnet

The current setup of your Thundroid runs on Bitcoin testnet. Make sure that your box running smoothly so that we can move on to copy the mainnet blockchain that you already downloaded on a regular computer (see [Part 1](https://github.com/Stadicus/guides/blob/master/thundroid/README.md#outlook-prepare-for-bitcoin-mainnet)) to the box.

On your regular computer, check the verification progress in Bitcoin Core. To proceed, it  should be fully synced (see  status bar). Shut down Bitcoin Core on  Windows so that we can copy the whole data structure to the Thundroid.  This takes about 6 hours.

:information_source: **If you get stuck**, please [check out my GitHub repository](https://github.com/Stadicus/guides). You can search for already solved issues there, or open a new issue if necessary. 

#### Temporarily enable password login

In order to copy the data with the user "bitcoin", we need to temporarily enable the password login.

* As user "admin", edit the SSH config file and put a `#` in front of "PasswordAuthentication no" to disable the whole line. Save and exit.  
   `$ sudo nano /etc/ssh/sshd_config`  
   `# PasswordAuthentication no`
* Restart the SSH daemon.  
   `$ sudo systemctl restart ssh`

#### Copy mainnet blockchain using SCP

We are using "Secure Copy" (SCP), so [download and install WinSCP](https://winscp.net), a free open-source program. There are other SCP programs available for Mac or Linux that work similarly.

* With WinSCP, you can now connect to your Pi with the user "bitcoin". Both protocols SCP and SFTP work, in my experience SCP is a bit faster.  
   ![WinSCP connection settings](images/50_WinSCP.png)

* Accept the server certificate and navigate to the local and remote bitcoin directories:
  * Local: `d:\bitcoin\bitcoin_mainnet\`
  * Remote: `\mnt\hdd\bitcoin\`
* You can now copy the two subdirectories `blocks` and `chainstate` from Local to Remote. This will take about 6 hours.
   ![WinSCP copy](images/50_WinSCP_copy.png)

⚠️ The transfer must not be interupted. Make sure your computer does not go to sleep.

#### Disable password login again

As user "admin", remove the `#` in front of "PasswordAuthentication no" to enable the line. Save, exit the config file and restart the ssh daemon.

```
$ sudo nano /etc/ssh/sshd_config
PasswordAuthentication no

# Restart the SSH daemon.
$ sudo systemctl restart ssh
```

#### Send back your testnet Bitcoin

To avoid burning our testnet Bitcoin, and as a courtesy to the next  testers, we close all our channels and withdraw the funds to the address  stated on the website of the [Bitcoin Testnet Faucet](https://testnet.manu.backend.hamburg/faucet).

* `$ lncli closeallchannels`
* Wait unitl the the channel balance is zero and the funds to be back in our on-chain wallet.  
   `$ lncli channelbalance`  
   `$ lncli walletbalance`

* Send the amount provided by `walletbalance` minus 500  satoshis to account for fees. If you get an "insufficient funds" error,  deduct a bit more until the transaction gets broadcasted.  
   `$ lncli sendcoins 2N8hwP1WmJrFF5QWABn38y63uYLhnJYJYTF [amount]`

#### Adjust configuration

* Stop the Bitcoin and Lightning services.  
   `$ sudo systemctl stop lnd`  
   `$ sudo systemctl stop bitcoind`

* Edit "bitcoin.conf" file by commenting  `testnet=1` out. Save and exit.  
   `$ sudo nano /home/bitcoin/.bitcoin/bitcoin.conf`    

   ```
   # remove the following line to enable Bitcoin mainnet
   #testnet=1
   ```

* Copy updated "bitcoin.conf" to user "admin" for credentials  
   `$ sudo cp /home/bitcoin/.bitcoin/bitcoin.conf /home/admin/.bitcoin/`  

* Edit "lnd.conf" file by switching from `bitcoin.testnet=1` to `bitcoin.mainnet=1`. Save and exit.  
   `$ sudo nano /home/bitcoin/.lnd/lnd.conf`   

   ```
   # enable either testnet or mainnet
   #bitcoin.testnet=1
   bitcoin.mainnet=1
   ```

#### Restart bitcoind & lnd for mainnet

⚠️ **Do not proceed** until the copy task of the mainnet blockchain is completely finished.

* Start Bitcoind and check if it's operating on mainnet  

  ```
  $ sudo systemctl start bitcoind
  $ systemctl status bitcoind.service
  $ sudo tail -f /home/bitcoin/.bitcoin/debug.log  (exit with Ctrl-C)
  $ bitcoin-cli getblockchaininfo
  ```

* **Wait until the blockchain is fully synced**: "blocks" = "headers", otherwise you might run into performance / memory issues when creating a new lnd mainnet wallet.

* Start LND and check its operation   

   ```
   $ sudo systemctl start lnd
   $ systemctl status lnd
   $ sudo journalctl -f -u lnd
   ```

* If everything works fine, restart Thundroid and check the operations again.  
   `$ sudo shutdown -r now`

* Monitor the startup process of first  `bitcoind` and then `lnd`   

   ```
   $ sudo tail -f /home/bitcoin/.bitcoin/debug.log
   $ sudo journalctl -f -u lnd
   ```

* Create the mainnet wallet with the **exact same** `password [C]` as on testnet. If you use another password, you need to recreate your access credentials.  
   `$ lncli create`

* Copy permission files and TLS cert to user "admin" to use `lncli`    

   ```
   $ sudo cp /home/bitcoin/.lnd/tls.cert /home/admin/.lnd
   $ sudo cp /home/bitcoin/.lnd/admin.macaroon /home/admin/.lnd
   ```

* Restart `lnd` and unlock your wallet (enter `password [C]` )    

   ```
   $ sudo systemctl restart lnd   
   $ lncli unlock 
   ```

* Monitor the LND startup progress until it caught up with the mainnet  blockchain (about 515k blocks at the moment). This can take up to 2  hours, then you see a lot of very fast chatter (exit with `Ctrl-C`).  
   `$ sudo journalctl -f -u lnd`

* Make sure that `lncli` works by getting some node infos  
   `$ lncli getinfo`

#### Improve startup process

It takes a litte getting used to that everytime the LND daemon is restarted, you have to unlock the wallet again. This makes sense from a security perspective, as the wallet is encrypted and the key is not stored on the same machine. For reliable operations, however, this is not optimal, as you can easily recover LND after it restarts for some reason (crash or power outage), but it's stuck and cannot operate at all. 

This is why we implement a script that automatically unlocks the wallet. The password is stored in a root-only directory as plaintext, so clearly not so secure, but for reasonable amounts this is a good middle-ground in my opinion. You can always decide to stick to manual unlocking, or implement a solution that unlocks the wallet from a remote machine.





## Start using the Lightning Network

#### Fund your node

Congratulations, your Thundroid is now live on the Bitcoin mainnet! To  open channels and start using it, you need to fund it with some bitcoin.  For starters, put only on your node what you are willing to lose.  Monopoly money.

* Generate a new Bitcoin address to receive funds on-chain  
   `$ lncli newaddress np2wkh`  
   `> "address": "3.........................."`
* From your regular Bitcoin wallet, send a small amount of bitcoin to this address
* Check your LND wallet balance  
   `$ lncli walletbalance`
* Monitor your transaction on a Blockchain explorer: <https://smartbit.com.au>

#### LND in action

As soon as your funding transaction is mined and confirmed, LND will  start to open and maintain channels. This feature is called "Autopilot"  and is configured in the "lnd.conf" file. If you would like to maintain  your channels manually, you can disable the autopilot.

Some commands to try:

* list all arguments for the command line interface (cli)  
   `$ lncli`
* get help for a specific argument  
   `$ lncli help [ARGUMENT]`
* find out some general stats about your node:  
   `$ lncli getinfo`
* connect to a peer (you can find some nodes to connect to here: <https://1ml.com/>):  
   `$ lncli connect [NODE_URI]`
* check the peers you are currently connected to:  
   `$ lncli listpeers`
* open a channel with a peer:  
   `$ lncli openchannel [NODE_PUBKEY] [AMOUNT_IN_SATOSHIS] 0`  
   *keep in mind that [NODE_URI] includes @IP:PORT at the end, while [NODE_PUBKEY] doesn't*
* check the status of your pending channels:  
   `$ lncli pendingchannels`  
* check the status of your active channels:  
   `$ lncli listchannels`
* before paying an invoice, you should decode it to check if the amount and other infos are correct:  
   `$ lncli decodepayreq [INVOICE]`
* pay an invoice:  
   `$ lncli payinvoice [INVOICE]`
* check the payments that you sent:  
   `$ lncli listpayments`
* create an invoice:  
   `$ lncli addinvoice [AMOUNT_IN_SATOSHIS]`
* list all invoices:  
   `$ lncli listinvoices`
* to close a channel, you need the following two arguments that can be determined with `listchannels` and are listed as "channelpoint": `FUNDING_TXID` : `OUTPUT_INDEX` .  
   `$ lncli listchannels`
   `$ lncli closechannel [FUNDING_TXID] [OUTPUT_INDEX]`
* to force close a channel (if your peer is offline or not cooperative), use  
   `$ lncli closechannel --force [FUNDING_TXID] [OUTPUT_INDEX]`

👉 see [LND API reference](http://api.lightning.community/) for additional information

### Try it out and explore Lightning mainnet

There are a lot of great resources to explore the Lightning mainnet in regard to your own node.

* [Lightning Spin](https://www.lightningspin.com/): simple Wheel of Fortune game
* [Lightning Network Stores](http://lightningnetworkstores.com/): Stores and services accepting Lightning payments
* [Recksplorer](https://rompert.com/recksplorer/): Lightning Network Map
* [1ML](https://1ml.com): Lightning Network Search and Analysis Engine
* [lnroute.com](http://lnroute.com): comprehensive Lightning Network resources list



## What's next?

You now have your own Bitcoin / Lightning full node. THe initially stated goals were the follows and I we achieved them all:

* [x] is as fully validating Bitcoin Full Node and does not require any trust in a 3rd party
* [x] is reliably running 24/7
* [x] is part of and supports the decentralization of the Lightning network by routing payments
* [x] can be used to send and receive personal payments using the command line interface.

But still, it's cluky and the command line does just not cut it. We will therefore go on to extend the Thundroid with a 













------


