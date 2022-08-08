# RaspiBolt: aliases
# /resources/.bash_aliases

###########################
# GENERAL STATUS & OTHERS #
###########################

# SYSTEM
alias update='sudo apt update'
alias listupgradable='sudo apt list --upgradable'
alias upgrade='sudo apt upgrade'
alias livehealth='sudo watch -n 1 "vcgencmd measure_clock arm; vcgencmd measure_temp"'
alias clearcache='sudo sync && sudo /sbin/sysctl -w vm.drop_caches=3 ; echo Cleaned cache successfully'

alias showmainversion='echo The installed versions of the main services are as follows: ; \
  echo `bitcoind --version | grep version` ; \
  lnd --version ; \
  echo BTC RPC Explorer: `sudo head -n 3 /home/btcrpcexplorer/btc-rpc-explorer/package.json | grep version` ; \
  echo Electrs: `electrs --version` ; \
  echo RTL: `sudo head -n 3 /home/rtl/RTL/package.json | grep version` ; \
  tor --version ; \
  echo NPM: v`npm --version` ; \
  echo NodeJS: `node -v`; \
  htop --version ; \
  lntop --version ; \
  nginx -v'

# EXTRAS
alias showbonusversion='echo The installed versions of the bonus services are as follows: ; \
  circuitbreaker --version ; \
  echo Thunderhub: `sudo head -n 3 /home/thunderhub/thunderhub/package.json | grep version` ; \
  bos -V ; \
  litd --lnd.version ; \
  lightning-cli --version ; \
  ./Fulcrum --version | grep Fulcrum'

alias fail2banreport='sudo fail2ban-client status sshd'
alias overview='raspibolt'
alias testscb-backup='sudo touch /data/lnd/data/chain/bitcoin/mainnet/channel.backup'

# NETWORK
alias whatsLISTEN='echo The follows services are listening: ; \
  sudo lsof -i -P -n | grep LISTEN'
alias publicip='echo Your public real IP is: ; \
    curl icanhazip.com'
alias torcheck='echo Checking Tor in your host... ; \
  curl --socks5 localhost:9050 --socks5-hostname localhost:9050 -s https://check.torproject.org/ | cat | grep -m 1 Congratulations | xargs ; \
  echo Attention: This advice is really to check if you have correctly installed Tor in your host. If not appear anything it means that you need to install Tor with: sudo apt install tor'

################
# MAIN SECTION #
################

########################
# ENABLE MAIN SERVICES #
########################

alias enablebitcoind='sudo systemctl enable bitcoind'
alias enablelectrs='sudo systemctl enable electrs'
alias enablebtcrpcexplorer='sudo systemctl enable btcrpcexplorer'
alias enablelnd='sudo systemctl enable lnd'
alias enablertl='sudo systemctl enable rtl'
alias enabletor='sudo systemctl enable tor'
alias enablescbackup='sudo systemctl enable scb-backup'
alias enableallmain='sudo systemctl enable bitcoind electrs btcrpcexplorer lnd rtl scb-backup'

#######################
# START MAIN SERVICES #
#######################

alias startbitcoind='sudo systemctl start bitcoind'
alias startelectrs='sudo systemctl start electrs'
alias startbtcrpcexplorer='sudo systemctl start btcrpcexplorer'
alias startlnd='sudo systemctl start lnd'
alias startrtl='sudo systemctl start rtl'
alias startor='sudo systemctl start tor'
alias startscbackup='sudo systemctl start scb-backup'

#######################
# SERVICE MAIN STATUS #
#######################

alias statusbitcoind='sudo systemctl status bitcoind'
alias statuselectrs='sudo systemctl status electrs'
alias statusbtcrpcexplorer='sudo systemctl status btcrpcexplorer'
alias statuslnd='sudo systemctl status lnd'
alias statusrtl='sudo systemctl status rtl'
alias statustor='sudo systemctl status tor'
alias statuscbackup='sudo systemctl status scb-backup'
alias statusallmain='echo The status of the main services is as follows, press the space key to advance: ; \
  sudo systemctl status bitcoind electrs btcrpcexplorer lnd rtl tor scb-backup ssh ufw nginx fail2ban'

######################
# STOP MAIN SERVICES #
######################

alias stopbitcoind='sudo systemctl stop bitcoind'
alias stopelectrs='sudo systemctl stop electrs'
alias stopbtcrpcexplorer='sudo systemctl stop btcrpcexplorer'
alias stoplnd='sudo systemctl stop lnd'
alias stoprtl='sudo systemctl stop rtl'
alias stoptor='sudo systemctl stop tor'
alias stopscbackup='sudo systemctl stop scb-backup'
alias stopallmain='sudo systemctl stop btcrpcexplorer electrs scb-backup rtl lnd bitcoind'

#########################
# DISABLE MAIN SERVICES #
#########################

alias disablebitcoind='sudo systemctl disable bitcoind'
alias disablelectrs='sudo systemctl disable electrs'
alias disablebtcrpcexplorer='sudo systemctl disable btcrpcexplorer'
alias disablelnd='sudo systemctl disable lnd'
alias disablertl='sudo systemctl disable rtl'
alias disabletor='sudo systemctl disable tor'
alias disablescbackup='sudo systemctl disable scb-backup'
alias disableallmain='sudo systemctl disable bitcoind electrs btcrpcexplorer lnd rtl scb-backup'

######################
# MAIN SERVICES LOGS #
######################

alias bitcoindlogs='sudo tail -f /home/bitcoin/.bitcoin/debug.log'
alias electrslogs='sudo journalctl -f -u electrs'
alias btcrpcexplorerlogs='sudo journalctl -f -u btcrpcexplorer'
alias lndlogs='sudo journalctl -f -u lnd'
alias rtlogs='sudo journalctl -f -u rtl'
alias torlogs='sudo journalctl -f -u tor@default'
alias scbackuplogs='sudo journalctl -f -u scb-backup'

##################
#       LND      #
##################

alias unlock='lncli unlock'
alias newaddress='lncli newaddress p2wkh'
alias txns='lncli listchaintxns'
alias listpayments='lncli listpayments'
alias listinvoices='lncli listinvoices'
alias getinfo='lncli getinfo'
alias walletbalance='lncli walletbalance'
alias peers='lncli listpeers'
alias channels='lncli listchannels'
alias channelbalance='lncli channelbalance'
alias pendingchannels='lncli pendingchannels'
alias openchannel='lncli openchannel'
alias connect='lncli connect'
alias payinvoice='lncli payinvoice'
alias addinvoice='lncli addinvoice'
alias addAMPinvoice='lncli addinvoice --amp'

##################
# LND Watchtower #
##################

alias wtclientinfo='lncli wtclient towers'

#################
# BONUS SECTION #
#################

#########################
# ENABLE BONUS SERVICES #
#########################

alias enablehomer='sudo systemctl enable homer'
alias enablemempool='sudo systemctl enable mempool'
alias enablecircuitbreaker='sudo systemctl enable circuitbreaker'
alias enablelnbits='sudo systemctl enable lnbits'
alias enablethunderhub='sudo systemctl enable thunderhub'
alias enablelitd='sudo systemctl enable litd'
alias enablecln='sudo systemctl enable cln'
alias enablefulcrum='sudo systemctl enable fulcrum'
alias enableallbonus='sudo systemctl enable homer mempool circuitbreaker lnbits thunderhub litd cln fulcrum'

########################
# START BONUS SERVICES #
########################

alias starthomer='sudo systemctl start homer'
alias startmempool='sudo systemctl start mempool'
alias startcircuitbreaker='sudo systemctl start circuitbreaker'
alias startlnbits='sudo systemctl start lnbits'
alias starthunderhub='sudo systemctl start thunderhub'
alias startlitd='sudo systemctl start litd'
alias startcln='sudo systemctl start cln'
alias startfulcrum='sudo systemctl start fulcrum'

#########################
# STATUS BONUS SERVICES #
#########################

alias statushomer='sudo systemctl status homer'
alias statusmempool='sudo systemctl status mempool'
alias statuscircuitbreaker='sudo systemctl status circuitbreaker'
alias statuslnbits='sudo systemctl status lnbits'
alias statusthunderhub='sudo systemctl status thunderhub'
alias statuslitd='sudo systemctl status litd'
alias statuscln='sudo systemctl status cln'
alias statusfulcrum='sudo systemctl start fulcrum'
alias statusallbonus='echo The status of the bonus services is as follows, press the space key to advance: ; \
  sudo systemctl status homer mempool circuitbreaker lnbits thunderhub litd cln fulcrum'

#######################
# STOP BONUS SERVICES #
#######################

alias stophomer='sudo systemctl stop homer'
alias stopmempool='sudo systemctl stop mempool'
alias stopcircuitbreaker='sudo systemctl stop circuitbreaker'
alias stoplnbits='sudo systemctl stop lnbits'
alias stopthunderhub='sudo systemctl stop thunderhub'
alias stoplitd='sudo systemctl stop litd'
alias stopcln='sudo systemctl stop cln'
alias stopfulcrum='sudo systemctl stop fulcrum'
alias stopallbonus='sudo systemctl stop homer mempool circuitbreaker lnbits thunderhub litd cln fulcrum'

##########################
# DISABLE BONUS SERVICES #
##########################

alias disablehomer='sudo systemctl disable homer'
alias disablemempool='sudo systemctl disable mempool'
alias disablecircuitbreaker='sudo systemctl disable circuitbreaker'
alias disablelnbits='sudo systemctl disable lnbits'
alias disablethunderhub='sudo systemctl disable thunderhub'
alias disablelitd='sudo systemctl disable litd'
alias disablecln='sudo systemctl disable cln'
alias disablefulcrum='sudo systemctl disable fulcrum'
alias disableallbonus='sudo systemctl disable homer mempool circuitbreaker lnbits thunderhub litd cln fulcrum'

#######################
# BONUS SERVICES LOGS #
#######################

alias homerlogs='sudo journalctl -f -u homer'
alias mempoollogs='sudo journalctl -f -u mempool'
alias circuitbreakerlogs='sudo journalctl -f -u circuitbreaker'
alias lnbitslogs='sudo journalctl -f -u lnbits'
alias thunderhublogs='sudo journalctl -f -u thunderhub'
alias litdlogs='sudo journalctl -f -u litd'
alias clnlogs='sudo journalctl -f -u cln' 
alias fulcrumlogs='sudo journalctl -f -u fulcrum'
