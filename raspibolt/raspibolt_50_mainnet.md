[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ **Mainnet** ] -- [ [FAQ](raspibolt_faq.md) ]

-------
### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi
--------

# Mainnet
Are you feeling comfortable to put real bitcoin on the line? Here's how to do it. 
```
Personal disclaimer: This guide is provided as-is and without any guarantees. Most components
are under development and this guide may contain factual errors that result in the loss of your
bitcoin. Use this guide at your own risk.
```
```
Lightning Labs disclaimer: As this is the first mainnet release of lnd, we recommend that users
experiment with only small amounts (#craefulgang #craefulgang #craefulgang).
```

## Copy the mainnet blockchain
The current setup runs on Bitcoin testnet. Right at the beginning, however, we started downloading the Bitcoin mainnet blockchain on your regular computer. Check the verification progress directly in Bitcoin Core on this computer. To proceed, it  should be fully synced (see status bar). 

As soon as the verification is finished, shut down Bitcoin Core on Windows. We will now copy the whole data structure to the RaspiBolt. This takes about 6 hours.

### Temporarily enable password login
In order to copy the data with the user "bitcoin", we need to temporarily enable the password login.

* As user "admin", edit the SSH config file and put a `#` in front of "PasswordAuthentication no" to disable the whole line. Save and exit.  
  `$ sudo nano /etc/ssh/sshd_config`  
  `# PasswordAuthentication no` 

* Restart the SSH daemon.  
  `$ sudo systemctl restart ssh`
  
### Copy using WinSCP
We are using "Secure Copy" (SCP), so [download and install WinSCP](https://winscp.net), a free open-source program. 

* With WinSCP, you can now connect to your Pi with the user "bitcoin".  
![WinSCP connection settings](images/50_WinSCP_connection.png)

* Accept the server certificate and navigate to the local and remote bitcoin directories:  
  * Local: `d:\bitcoin\bitcoin_mainnet\`
  * Remote: `\mnt\hdd\bitcoin\`   

* You can now copy the two subdirectories `blocks` and `chainstate` from Local to Remote. This will take about 6 hours.  
![WinSCP copy](images/50_WinSCP_copy.png)

:warning: The transfer must not be interupted. Make sure your computer does not go to sleep. 

### Error regarding timestamps
When using an NTFS external hard disk, you might get the following error:  
**Upload of file '.....' was successful, but error occurred while setting the permissions and/or timestamp.**

You can safely ignore this and choose `Skip all` as NTFS does not support the necessary timestamp methods.

### Disable password login again
* As user "admin", remove the `#` in front of "PasswordAuthentication no" to enable the line. Save and exit.  
  `$ sudo nano /etc/ssh/sshd_config`  
  `PasswordAuthentication no` 

* Restart the SSH daemon.  
  `$ sudo systemctl restart ssh`

## Restart bitcoind & lnd for mainnet
Do not proceed until the copy task above is finished.

* As user "admin", stop the Bitcoin and Lightning services.  
  `$ sudo systemctl stop lnd`   
  `$ sudo systemctl stop bitcoind` 
  
* Edit "bitcoin.conf" file by commenting  `testnet=1` out. Save and exit.  
  `$ sudo nano /home/bitcoin/.bitcoin/bitcoin.conf`
```
# remove the following line to enable Bitcoin mainnet
#testnet=1
```

* Edit "lnd.conf" file by switching from `bitcoin.testnet=1` to `bitcoin.mainnet=1`. Save and exit.  
  `$ sudo nano /home/bitcoin/.lnd/lnd.conf`
```
# enable either testnet or mainnet
#bitcoin.testnet=1
bitcoin.mainnet=1
```
* Start Bitcoind and check if it's operating on mainnet  
  `$ sudo systemctl start bitcoind`  
  `$ systemctl status bitcoind.service`  
  `$ sudo su bitcoin`  
  `$ tail -f /home/bitcoin/.bitcoin/debug.log`  (exit with `Ctrl-C`)  
  `$ bitcoin-cli getblockchaininfo`  
  `$ exit`  
* Start LND and check its operation  
  `$ sudo systemctl start lnd`   
  `$ systemctl status lnd`  
  `$ sudo journalctl -f -u lnd`  
* If everything works fine, restart the RaspiBolt and check the operations again.
  `$ sudo shutdown -r now`  
* After the restart, LND will catch up with the whole Bitcoin blockchain, that can take up to two hours.
  * Monitor the system logs: `$ systemctl status lnd` 
  * Check the system load to see if your RaspiBolt is still working hard: `htop` 



## Start using the Lightning Network

### Fund your node
Congratulations, your RaspiBolt is live on the Bitcoin mainnet! To open channels and start using it, you need to fund it with some bitcoin. For starters, put only on your node what you are willing to lose. Monopoly money.

* Generate a new Bitcoin address to receive funds on-chain  
  `$ lncli newaddress np2wkh`   
  `> "address": "3.........................."`

* From your regular Bitcoin wallet, send a small amount of bitcoin to this address

* Check your LND wallet balance  
  `$ lncli walletbalance`

* Monitor your transaction on a Blockchain explorer:
  https://smartbit.com.au

### LND in action
As soon as your funding transaction is mined and confirmed, LND will start to open and maintain channels. This feature is called "Autopilot" and is configured in the "lnd.conf" file. If you would like to maintain your channels manually, you can disable the autopilot.

Some commands to try:  

* find out some general stats about your node:  
 `$ lncli getinfo`  
 
* connect to a peer (you can find some nodes to connect to here: https://1ml.com/):  
 `$ lncli connect [NODE_URI]`  
 
* check the peers you are currently connected to:  
 `$ lncli listpeers`  
 
* open a channel with a peer:  
 `$ lncli openchannel [NODE_PUBKEY]`  
 *keep in mind that [NODE__URI] includes @IP:PORT at the end, while [NODE_PUBKEY] doesn't*  
 
* check the status of your pending channels:  
 `$ lncli pendingchannels`  
 
* check the status of your active channels:  
 `$ lncli listchannels`  
 
* before paying an invoice, you should decode it to check if the amount and other infos are correct:  
 `$ lncli decodepayreq [INVOICE]`  
 
* pay an invoice:  
 `$ lncli payinvoice [INVOICE]`  
 
* create an invoice:   
 `$ lncli addinvoice [AMOUNT_IN_SATOSHIS]`  
 
* check the paid payments  
 `$ lncli listpayments`   
 


...more to come.

👉 see [LND API reference](http://api.lightning.community/) for additional information

### Explore Lightning mainnet
There are a lot of great resources to explore the Lightning mainnet in regard to your own node.

* [Recksplorer](https://rompert.com/recksplorer/): Lightning Network Map
* [1ML](https://1ml.com): Lightning Network Search and Analysis Engine
* [lnroute.com](http://lnroute.com): comprehensive Lightning Network resources list



---
Next: [FAQ >>](raspibolt_faq.md)
