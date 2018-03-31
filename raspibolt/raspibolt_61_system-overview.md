[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [**Bonus**](raspibolt_60_bonus.md) ] -- [ [FAQ](raspibolt_faq.md) ] -- [ [Updates](raspibolt_updates.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

## Bonus guide: System overview

*Difficulty: easy*

To get a quick overview over the system status, I created [a shell script](https://github.com/Stadicus/guides/blob/master/raspibolt/resources/20-raspibolt-welcome) that is shown on login or on demand.  

![MotD system overview](images/60_status_overview.png)

This script will run as root, so please check it before blindly trusting me.

```
$ cd /home/admin/download/
$ wget https://github.com/Stadicus/guides/blob/master/raspibolt/resources/20-raspibolt-welcome
  
# check script & exit
$ nano 20-raspibolt-welcome

# delete existing welcome scripts and install
$ sudo mv /etc/update-motd.d /etc/update-motd.d.bak
$ sudo mkdir /etc/update-motd.d
$ sudo cp 20-raspibolt-welcome /etc/update-motd.d/
$ sudo chmod +x /etc/update-motd.d/20-raspibolt-welcome
$ sudo ln -s /etc/update-motd.d/20-raspibolt-welcome /usr/local/bin/raspibolt
```

You can now start the script with `raspibolt` and it is shown every time you log in.

------

<< Back: [Bonus guides](raspibolt_60_bonus.md) 
