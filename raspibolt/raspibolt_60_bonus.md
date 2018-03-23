[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ **Bonus** ] -- [FAQ](raspibolt_faq.md) ] -- [ [Updates](raspibolt_updates.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

# Bonus

#### Add system overview

To get a quick overview over the system status, I created [a shell script](https://gist.github.com/Stadicus/ffbbd855d23cd068f7b739cae6440f4b) that is shown on login or on demand.

![MotD system overview](images/60_status_overview.png)

This script will run as root, so please check it before blindly trusting me.

```
$ cd /home/admin/download/
$ wget https://gist.githubusercontent.com/Stadicus/57122492cb3ea4b5ce606ac0df6db8ae/raw/66039dfd8428707051148bf5eebcbaabfff39200/20-raspibolt-welcome.sh
  
# check script & exit
$ nano 20-raspibolt-welcome.sh

# delete existing welcome scripts and install
$ sudo mv /etc/update-motd.d /etc/update-motd.d.bak
$ sudo mkdir /etc/update-motd.d
$ sudo cp 20-raspibolt-welcome.sh /etc/update-motd.d/
$ sudo chmod +x /etc/update-motd.d/20-raspibolt-welcome.sh
$ sudo ln -s /etc/update-motd.d/20-raspibolt-welcome.sh /usr/local/bin/raspibolt
```

You can now start the script with `raspibolt` and it is shown every time you log in.



### Pimp the command line prompt

You can prettify your command prompt for each user by enabling color output and setting a custom prompt. Use either the yellow or red user, not both.

I use the red prompt for user “admin”, and the yellow prompt for “bitcoin”.

```
# edit .bashrc with user "admin", use options from below.

$ nano /home/admin/.bashrc
$ sudo nano /home/bitcoin/.bashrc
# reload .bashrc (or just wait until next login)
$ source /home/admin/.bashrc
```

```bash
# enable color prompt (uncomment)
force_color_prompt=yes

# pimp prompt (replace the PS1 line), use only one yellow OR red, not both.
# yellow user
PS1="${debian_chroot:+($debian_chroot)}\[\e[33m\]\u \[\033[01;34m\]\w\[\e[33;40m\] ฿\[\e[m\] "
# red user
PS1="${debian_chroot:+($debian_chroot)}\[\e[31m\]\u \[\033[01;34m\]\w\[\e[33;40m\] ฿\[\e[m\] "

# set "ls" to always use the -la option
alias ls='ls -la --color=always'
```

![Pimp prompt](/images/60_pimp_prompt.png)

