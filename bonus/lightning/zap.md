---
layout: default
title: Zap Desktop
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

## Bonus guide: Zap Desktop Lightning Wallet
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

The desktop app Zap (https://github.com/LN-Zap/zap-desktop) is a cross platform Lightning Network wallet focused on user experience and ease of use.

Download Zap for your operating sytem:
https://github.com/LN-Zap/zap-desktop/releases  
Install instructions: https://github.com/LN-Zap/zap-desktop#install

### Preparation on the Pi

* Allow connections to the RaspiBolt from your own network (the netmask `/16` restricts access to all computers with an ip address of 192.168.*.*).  
  ```
  $ sudo nano /home/bitcoin/.lnd/lnd.conf
  ```

  Add the following lines to the section `[Application Options]`:  
  ```
  tlsextraip=192.168.0.0/16
  rpclisten=0.0.0.0:10009
  ```
  
* Delete the `tls.cert` file and restart LND to recreate it. 
  ```
  $ sudo rm /home/bitcoin/.lnd/tls.*
  $ sudo systemctl restart lnd
  ```
  
* Copy the new `tls.cert` to the user "admin".  
  ```
  $ sudo cp /home/bitcoin/.lnd/tls.cert /home/admin/.lnd
  ```

* Unlock the LND wallet.  
  ```
  $ lncli unlock
  ```

* Allow the UFW firewall to listen on 10009 from the LAN, restart and check it.  
  ```
  $ sudo ufw allow from 192.168.0.0/16 to any port 10009 comment 'allow LND grpc from local LAN'
  $ sudo ufw enable 
  $ sudo ufw status
  ```

### Connect Zap Desktop with a Connection String 
We will connect Zap to the RaspiBolt using a connection string that includes the connection and authentication information. This   option is available starting with Zap 0.4.0 beta.

#### On the Pi:

* Install LndConnect:  
  ```
  $ cd /tmp
  $ wget https://github.com/LN-Zap/lndconnect/releases/download/v0.1.0/lndconnect-linux-armv7-v0.1.0.tar.gz
  $ sudo tar -xvf lndconnect-linux-armv7-v0.1.0.tar.gz --strip=1 -C /usr/local/bin
  ```

* Generate the Connection String  
  ```
  $ sudo lndconnect --lnddir=/home/admin/.lnd -i -j
  ```
  Copy the resulting text starting with `lndconnect://...`

#### Configure Zap: 

  * Start Zap on your desktop
  * Create a new wallet
  * Choose the `Connect to your node` option  
    ![Zap welcome screen](images/71_zap_desktop1.png)
  * Paste the Connection String generated with LndConnect
  * Confirm and Connect
  * Confirm the settings on the following screen and you are done!
    ![Zap Desktop wallet](images/71_zap_desktop4.png)

------

<< Back: [+ Lightning](index.md)
