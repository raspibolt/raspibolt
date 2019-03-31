[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [**Bonus**](raspibolt_60_bonus.md) ] -- [ [Troubleshooting](raspibolt_70_troubleshooting.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

## Bonus guide: Pimp the command line  
*Difficulty: easy*

### Command prompt
You can prettify your command prompt for each user by enabling color output and setting a custom prompt. 

* Open and edit `.bashrc`  as shown below, save and exit
  `$ nano /home/admin/.bashrc`

```bash
# enable color prompt (uncomment)
force_color_prompt=yes

# pimp prompt (replace the PS1 line)
PS1="${debian_chroot:+($debian_chroot)}\[\e[33m\]\u \[\033[01;34m\]\w\[\e[33;40m\] ₿\[\e[m\] "

# set "ls" to always use the -la option (insert at the end of the file)
alias ls='ls -la --color=always'
```

![Pimp prompt](images/60_pimp_prompt.png)

* Reload configuration  
  `source /home/admin/.bashrc`

![Pimped prompt](images/60_pimp_prompt_result.png)

### Bash completion
As user “admin”, install bash completion scripts for Bitcoin Core and all Lightning projects. You then can complete commands by pressing the Tab key (e.g. bitcoin-cli getblockch [Tab] → bitcoin-cli getblockchaininfo )

```
$ cd /home/admin/download
$ wget https://raw.githubusercontent.com/bitcoin/bitcoin/master/contrib/bitcoin-cli.bash-completion 
$ wget https://raw.githubusercontent.com/lightningnetwork/lnd/master/contrib/lncli.bash-completion
$ sudo cp *.bash-completion /etc/bash_completion.d/
```

Bash completion will be enabled after your next login.

------

<< Back: [Bonus guides](raspibolt_60_bonus.md) 
