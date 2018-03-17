[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ **Mainnet** ] -- [ [FAQ](raspibolt_faq.md) ]

-------
### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi
--------

# Mainnet
Are you feeling comfortable to put real bitcoin on the line? Here's how to do it. 
```
Disclaimer: This guide is provided AS IS and without any guarantees. Most components are under
heavy development and this guide may contain factual errors that results in the loss of your bitcoin.
```
## Copy the mainnet blockchain
The current setup runs on Bitcoin testnet. Right at the beginning, however, we started downloading the Bitcoin mainnet blockchain on your regular computer. Check the verification progress directly in Bitcoin Core on this computer. To proceed, it  should be fully synced (see status bar). 

As soon as the verification is finished, shut down Bitcoin Core on Windows. We will now copy the whole data structure to the RaspiBolt. This takes about 6 hours.

We are using "Secure Copy" (SCP), so [download and install WinSCP](https://winscp.net), a free open-source program. 

* With WinSCP, you can now connect to your Pi with the user "bitcoin".  
![WinSCP connection settings](https://github.com/Stadicus/guides/raw/raspibolt_initial/raspibolt/images/7_WinSCP_connection.png)

* Accept the server certificate and navigate to the local and remote bitcoin directories:  
  * Local: `d:\bitcoin\bitcoin_mainnet\`
  * Remote: `\mnt\hdd\bitcoin\`   

* You can now copy the two subdirectories `blocks` and `chainstate` from Local to Remote. This will take about 6 hours.  
![WinSCP copy](https://github.com/Stadicus/guides/raw/raspibolt_initial/raspibolt/images/7_WinSCP_copy.png)

:warning: The transfer must not be interupted. Make sure your computer does not go to sleep. 

## Restart bitcoind & lnd for mainnet
Do not proceed until this copy task is finished.

* As user "admin", stop the Bitcoin and Lightning services.  
  `$ udo systemctl stop lnd`   
  `$ sudo systemctl stop bitcoind` 
  
* Edit "bitcoin.conf" file by commenting  `testnet=1` out  
  `$ sudo nano /home/bitcoin/.bitcoin/bitcoin.conf`
```
# remove the following line to enable Bitcoin mainnet
#testnet=1
```
  
* Edit "lnd.conf" file by switching from `bitcoin.testnet=1` to `bitcoin.mainnet=1`  
  `$ sudo nano /home/bitcoin/.bitcoin/bitcoin.conf`
```
# enable either testnet or mainnet
#bitcoin.testnet=1
bitcoin.mainnet=1
```
* Double check the ".bitcoin" directory: was the blockchain copied correctly?  
  `???`

* Start Bitcoind and check if it's operating on mainnet
  `$ sudo systemctl start bitcoind`  
  `$ systemctl status bitcoind.service`  
  `$ tail -f /home/bitcoin/.bitcoin/debug.log`  (exit with `Ctrl-C`)
  `$ sudo su bitcoin`  
  `$ bitcoin-cli getblockchaininfo`  
  `$ exit`  

* Start LND and check its operation  
  `$ sudo systemctl start lnd`   
  `$ systemctl status lnd`
  `$ sudo journalctl -f -u lnd`  

* If everything works fine, restart the RaspiBolt and check the operations again.
  `$ sudo shutdown -r now`  

## Start using the Lightning Network

coming soon.
