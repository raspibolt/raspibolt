[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [**Bonus**](raspibolt_60_bonus.md) ] -- [ [Troubleshooting](raspibolt_70_troubleshooting.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

## Bonus guide: Auto-unlock LND on startup
*Difficulty: medium*

> Please note: this guide has not been updated to LND 0.5 yet and might not work as intended.

It takes a litte getting used to the fact that the LND wallet needs  to be manually unlocked everytime the LND daemon is restarted. This  makes sense from a security perspective, as the wallet is encrypted and  the key is not stored on the same machine. For reliable operations,  however, this is not optimal, as you can easily recover LND after it  restarts for some reason (crash or power outage), but then it's stuck  with a locked wallet and cannot operate at all.

This is why a script that automatically unlocks the wallet is  helpful. The password is stored in a root-only directory as plaintext,  so clearly not so secure, but for reasonable amounts this is a good  middle-ground in my opinion. You can always decide to stick to manual  unlocking, or implement a solution that unlocks the wallet from a remote  machine.

:warning: Important: this works only for "systemd" version 230+. You can check this as follows:  
`$ systemd --version` 


* As user "admin", create a new directory and save your LND wallet password [C] into a text file  
  `$ sudo mkdir /etc/lnd`   
  `$ sudo nano /etc/lnd/pwd` 

* The following script unlocks the LND wallet through its web service (REST interface). Some additional information:
  * The script checks if the Pi has just booted or if just the service restarted. Depending on that, it waits for either 3 minutes (180s) or 10 seconds for `lnd` to be ready. This seem to work fine, but you can be adjust the sleep time if you run into timeout issues.
  * This script automatically detects whether you are on Bitcoin testnet or mainnet.
  * The output of the API call is appended to the file `debug.log`. Check here first if your wallet just does not unlock (you won't see another error).
  * All automatic unlocks are recorded in `audit.log`.

* Copy the following script it into a new file.  
 `$ sudo nano /etc/lnd/unlock`   

  ```bash
  #!/bin/sh
  # LND wallet auto-unlock script (Updated for LND 0.5 and above)
  # 2018 by meeDamian, robclark56 (Updated by zwarbo, martinatime, CodingMuziekwijk)
  
  LN_ROOT="/home/bitcoin/.lnd"
  BITCOIN_DIR="/home/bitcoin/.bitcoin"
  
  upSeconds="$(cat /proc/uptime | grep -o '^[0-9]\+')"
  upMins=$((${upSeconds} / 60))
  
  if [ "${upMins}" -lt "5" ]
  then
    /bin/sleep 180s
  else
    /bin/sleep 10s
  fi
  
  chain="$(bitcoin-cli -datadir=${BITCOIN_DIR} getblockchaininfo | jq -r '.chain')"
  
  curl -s \
          -H "Grpc-Metadata-macaroon: $(xxd -ps -u -c 1000 ${LN_ROOT}/data/chain/bitcoin/${chain}net/admin.macaroon))" \
          --cacert ${LN_ROOT}/tls.cert \
          -X POST -d "{\"wallet_password\": \"$(cat /etc/lnd/pwd | tr -d '\n' | base64 -w0)\"}" \
          https://localhost:8080/v1/unlockwallet >> /etc/lnd/debug.log 2>&1
  
  echo "$? $(date)" >> /etc/lnd/audit.log
  exit 0
  ```

* Make the directory and all content accessible only for "root"  

  ```bash
  $ sudo chmod 400 /etc/lnd/pwd
  $ sudo chmod 100 /etc/lnd/unlock
  $ sudo chown root:root /etc/lnd/*
  ```

* Edit the LND systemd unit. This starts the script directly after LND is running.  
  `$ sudo nano /etc/systemd/system/lnd.service `

  ```bash
  # remove this line (if present):
  # PIDFile=/home/bitcoin/.lnd/lnd.pid
  
  # add this line directly below ExecStart:
  ExecStartPost=+/etc/lnd/unlock
  
  # make sure that the overall timeout is longer than the script wait time, eg. 240s
  TimeoutSec=240
  ```

* Edit the LND config file to enable the REST interface on port 8080  
  `$ sudo nano /home/bitcoin/.lnd/lnd.conf`  

  ```bash
  # add the following line in the [Application Options] section
  restlisten=localhost:8080
  ```

* Reload the systemd unit, restart LND and watch the startup process to see if the wallet is automatically unlocked

  ```bash
  $ sudo systemctl daemon-reload
  $ sudo systemctl restart lnd
  ```

* You can observe how the LND starts and the wallet is unlocked by loggin into a second session and watching the log file:  
  `$ sudo journalctl -u lnd -f`

------

<< Back: [Bonus guides](raspibolt_60_bonus.md) 
