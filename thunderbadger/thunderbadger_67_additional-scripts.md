[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [**Bonus**](raspibolt_60_bonus.md) ] -- [ [FAQ](raspibolt_faq.md) ] -- [ [Updates](raspibolt_updates.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

## Bonus guide: Additional scripts

*Difficulty: easy*

The following scripts were created by [RobClark56](https://github.com/robclark56) and help getting a better system overview. 

As user "admin", download the scripts, make them executable and copy them to the global bin folder.

### Balance

![](images/60_balance.png)

```
$ cd /home/admin/download/
$ wget https://raw.githubusercontent.com/Stadicus/guides/master/raspibolt/resources/lnbalance
$ chmod +x lnbalance
$ sudo cp lnbalance /usr/local/bin
$ cd
$ lnbalance
```


### Channels

![](images/60_channels.png)

```
$ cd /home/admin/download/
$ wget https://raw.githubusercontent.com/Stadicus/guides/master/raspibolt/resources/lnchannels
$ chmod +x lnchannels
$ sudo cp lnchannels /usr/local/bin
$ cd
$ lnchannels
```
------

<< Back: [Bonus guides](raspibolt_60_bonus.md) 
