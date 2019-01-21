[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [**Bonus**](raspibolt_60_bonus.md) ] -- [ [Troubleshooting](raspibolt_70_troubleshooting.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

## Bonus guide: System overview

*Difficulty: easy*

To get a quick overview over the system status, I created [a shell script](https://github.com/Stadicus/guides/blob/master/raspibolt/resources/20-raspibolt-welcome) that is run as "message of the day" (motd) to be shown on login or on demand.  

![MotD system overview](images/60_status_overview.png)

This script will run as root, so please check it before blindly trusting me.

```
$ sudo apt-get install jq net-tools
$ cd /home/admin/download/
$ wget https://raw.githubusercontent.com/Stadicus/guides/master/raspibolt/resources/20-raspibolt-welcome
  
# check script & exit
$ nano 20-raspibolt-welcome

# delete existing welcome scripts and install
$ sudo mv /etc/update-motd.d /etc/update-motd.d.bak
$ sudo mkdir /etc/update-motd.d
$ sudo cp 20-raspibolt-welcome /etc/update-motd.d/
$ sudo chmod +x /etc/update-motd.d/20-raspibolt-welcome
$ sudo ln -s /etc/update-motd.d/20-raspibolt-welcome /usr/local/bin/raspibolt
```

In case the script runs into problems, it could theoretically prevent you from logging in. We therefore disable all motd execution for the "root" user, so you will always be able to login as "root" to disable it.

```
$ sudo su 
$ touch /root/.hushlogin
$ exit
```

You can now start the script with `sudo raspibolt` and it is shown every time you log in.

------

<< Back: [Bonus guides](raspibolt_60_bonus.md) 
