---
layout: default
title: Additional scripts
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

## Bonus guide: Additional scripts
{: .no_toc }

Difficulty: Easy
{: .label .label-green }

Status: Not tested v3
{: .label .label-yellow }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

The following scripts were created by [RobClark56](https://github.com/robclark56) and help getting a better system overview.

As user "admin", download the scripts, make them executable and copy them to the global bin folder.

### Balance

![](images/60_balance.png)

```
$ cd /home/admin/download/
$ wget https://raw.githubusercontent.com/raspibolt/raspibolt/master/resources/lnbalance
$ chmod +x lnbalance
$ sudo cp lnbalance /usr/local/bin
$ cd
$ lnbalance
```


### Channels

![](images/60_channels.png)

```
$ cd /home/admin/download/
$ wget https://raw.githubusercontent.com/raspibolt/raspibolt/master/resources/lnchannels
$ chmod +x lnchannels
$ sudo cp lnchannels /usr/local/bin
$ cd
$ lnchannels
```

### Aliases
Aliases are shortcuts for commands that can save time and make it easier to execute common and frequent commands. The following aliases do not display information in a fancy way, but they make it easier to execute commands.

##### -- Testnet
* Logged in as Admin, open the .bashrc file in nano
``` > sudo nano /home/admin/.bashrc```
* Add the following lines to the end of the .bashrc file
```
alias lndstatus='sudo journalctl -f -u lnd'
alias bitcoindstatus='sudo tail -f /home/bitcoin/.bitcoin/testnet3/debug.log'
alias unlock='lncli unlock'
alias newaddress='lncli --network=testnet newaddress np2wkh'
alias txns='lncli --network=testnet listchaintxns'
alias getinfo='lncli --network=testnet getinfo'
alias walletbalance='lncli --network=testnet walletbalance'
alias peers='lncli --network=testnet listpeers'
alias channels='lncli --network=testnet listchannels'
alias channelbalance='lncli --network=testnet channelbalance'
alias pendingchannels='lncli --network=testnet pendingchannels'
alias openchannel='lncli --etwork=testnet openchannel'
alias connect='lncli --network=testnet connect'
alias payinvoice='lncli --network=testnet payinvoice'
alias addinvoice='lncli --network=testnet addinvoice'
```
* Execute a source command to register changes to the .bashrc file
``` > source /home/admin/.bashrc ```

##### -- Mainnet
When switching to mainnet, follow the **Testnet** section but removing all instances of --network=testnet from the code.

------

<< Back: [+ Lightning](index.md)
