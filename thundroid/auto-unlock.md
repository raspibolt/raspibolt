### Improve startup process

It takes a litte getting used to the fact that the LND wallet needs to be manually unlocked everytime the LND daemon is restarted. This makes sense from a security perspective, as the wallet is encrypted and the key is not stored on the same machine. For reliable operations, however, this is not optimal, as you can easily recover LND after it restarts for some reason (crash or power outage), but then it's stuck with a locked wallet and cannot operate at all. 

This is why a script that automatically unlocks the wallet is helpful. The password is stored in a root-only directory as plaintext, so clearly not so secure, but for reasonable amounts this is a good middle-ground in my opinion. You can always decide to stick to manual unlocking, or implement a solution that unlocks the wallet from a remote machine.

* As user "admin", create a new directory and save your LND wallet password [C] into a text file  
  `$ sudo mkdir /etc/lnd`   
  `$ sudo nano /etc/lnd/pwd` 

* The following script unlocks the LND wallet through its web service (REST interface). Copy it into a new file.    
  `$ sudo nano /etc/lnd/unlock`   

  ```
  #!/bin/sh
  # LND wallet auto-unlock script
  # 2018 by meeDamian, robclark56
  
  /bin/sleep 180s
  LN_ROOT=/home/bitcoin/.lnd
  
  curl -s \
          -H "Grpc-Metadata-macaroon: $(xxd -ps -u -c 1000 ${LN_ROOT}/admin.macaroon)" \
          --cacert ${LN_ROOT}/tls.cert \
          -X POST -d "{\"wallet_password\": \"$(cat /etc/lnd/pwd | tr -d '\n' | base64 -w0)\"}" \
          https://localhost:8080/v1/unlockwallet > /dev/null 2>&1
  
  echo "$? $(date)" >> /etc/lnd/unlocks.log
  exit 0
  ```

* Make the directory and all content accessible only for "root"  

  ```
  $ sudo chmod 400 /etc/lnd/pwd
  $ sudo chmod 100 /etc/lnd/unlock
  $ sudo chown root:root /etc/lnd/*
  ```

* Edit the LND systemd unit. This starts the script directly after LND is running.  
  `$ sudo nano /etc/systemd/system/lnd.service `

  ```
  # remove this line:
  # PIDFile=/home/bitcoin/.lnd/lnd.pid
  
  # add this line directly below ExecStart:
  ExecStartPost=+/etc/lnd/unlock
  ```

* Edit the LND config file to enable the REST interface on port 8080  
  `$ sudo nano /home/bitcoin/.lnd/lnd.conf`  

  ```
  # add the following line in the [Application Options] section
  restlisten=localhost:8080
  ```

* Reload the systemd unit, restart LND and watch the startup process to see if the wallet is automatically unlocked

  ```
  $ sudo systemctl daemon-reload
  $ sudo systemctl restart lnd
  $ sudo journalctl -u lnd -f
  ```

