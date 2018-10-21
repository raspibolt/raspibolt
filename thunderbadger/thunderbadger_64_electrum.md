[ [Intro](README.md) ] -- [ [Préparatifs](thunderbadger_10_preparations.md) ] -- [ [Thunder Badger](thunderbadger_20_ThunderBadger.md) ] -- [ [Bitcoin](thunderbadger_30_bitcoin.md) ] -- [ [LND](thunderbadger_40_lnd.md) ] -- [ [Mainnet](thunderbadger_50_mainnet.md) ] -- [ **Bonus** ]

------

### Thunder Badger : un nœud Bitcoin et ⚡Lightning️⚡ dans votre vieux portable pourri !

------

## Bonus : Electrum Personal Server

*Difficulté: moyenne*

### Introduction

Le meilleur moyen de conserver vos bitcoins avec un bon compromis entre sécurité et accessibilité est d'utiliser un portefeuille _matériel_ (_hardware wallet_), comme [Ledger](https://www.ledgerwallet.com/) ou [Trezor](https://trezor.io/) en combinaison de votre noeud Bitcoin. En faisant ainsi, vous éliminez le besoin de passer par un tiers pour vérifier vos transactions.

Bien que rien ne vous empêche d'utiliser l'interface graphique avec votre Thunder Badger, dans la pratique cela sera souvent pénible. Bitcoin Core ne supporte pas à l'heure actuelle les portefeuilles matériels. Avec votre noeud, vous ne pouvez donc qu'utiliser par défaut un portefeuille _chaud_, c'est à dire exposé sur internet. 

Une possibilité pour profiter d'une interface graphique plus agréable et du support d'un portefeuille matériel serait d'installer un serveur [ElectrumX](https://github.com/kyuupichan/electrumx) sur le Thunder Badger et [Electrum](https://electrum.org/) sur votre ordinateur habituel. Cela peut toutefois s'avérer assez complexe, et pourrait également être trop gourmand pour les possibilités sans doute assez limité du Thunder Badger.

[Electrum Personal Server](https://github.com/chris-belcher/electrum-personal-server) vous permet de connecter Electrum (et avec lui votre portefeuille matériel) directement au Thunder Badger. Contrairement à ElectrumX, ce n'est pas un serveur destiné à répondre aux requêtes de multiples utilisateurs, mais uniquement aux vôtres.

Avant de commencer, il est recommandé de télécharger et de se familiariser avec [Electrum](https://electrum.org/#download). Vous pouvez aussi lire [cet article]((https://bitcoinmagazine.com/articles/electrum-personal-server-will-give-users-full-node-security-they-need/).

### Installer Electrum Personal Server

* Depuis votre ordinateur habituel, ouvrir une session via SSH avec l'utilisateur "bitcoin"  
  `$ ssh bitcoin@[VOTRE_IP]`  
* Télécharger, vérifier et extraire la dernière release (voir [cette page](https://github.com/chris-belcher/electrum-personal-server/releases) pour voir quelle est la plus récente et obtenir le bon lien)  

  ```
  # créer un nouveau répertoire
  $ mkdir electrum-personal-server
  $ cd electrum-personal-server
  
  # télécharger le code et les signatures
  $ wget https://github.com/chris-belcher/electrum-personal-server/archive/eps-v0.1.5.tar.gz
  $ wget https://github.com/chris-belcher/electrum-personal-server/releases/download/eps-v0.1.5/eps-v0.1.5.tar.gz.asc
  $ wget https://raw.githubusercontent.com/chris-belcher/electrum-personal-server/master/pgp/pubkeys/belcher.asc
  
  # vérifier la signature de Chris Belcher et l'intégrité du fichier téléchargé
  $ gpg belcher.asc
  > 0A8B038F5E10CC2789BFCFFFEF734EA677F31129
  
  $ gpg --import belcher.asc
  $ gpg --verify eps-v0.1.3.tar.gz.asc
  > gpg: Good signature from "Chris Belcher <false@email.com>" [unknown]
  > Primary key fingerprint: 0A8B 038F 5E10 CC27 89BF  CFFF EF73 4EA6 77F3 1129
  
  # Décompresser le fichier
  $ tar -xvf eps-v0.1.5.tar.gz  
  ```
* Faire une copie du fichier de configuration ; l'ouvrir  
  `$ cp config.cfg_sample config.cfg`  
  `$ nano config.cfg` 

  * Ajouter la clé publique principale ou adresse lecture seule (_watch only_) dans les se `[master-public-keys]` and `[watch-only-addresses]` sections. Master public keys for an Electrum wallet can be found in the Electrum client menu `Wallet` -> `Information`.

  * Uncomment and complete the lines  
    `rpc_user = raspibolt`  
    `rpc_password = [PASSWORD_B]`

  * Change the listening `host` to `0.0.0.0`, so that you can reach it from a remote computer. The firewall only accepts connections from within the home network, not from the internet.  
    `host = 0.0.0.0`
* Save and exit

### Initial blockchain scan

Before starting the server for real, the bitcoin addresses need to be generated and looked up on the blockchain.

* Start the server to generate addresses from your master public keys  
  `$ ./server.py`
  
* Scan the blockchain (this can take several hours, depending on the start date you choose)  
  `$ ./rescan-script.py`

[![initialize server and scan blockchain](https://github.com/Stadicus/guides/raw/master/raspibolt/images/60_eps_rescan.png)](https://github.com/Stadicus/guides/blob/master/raspibolt/images/60_eps_rescan.png)

* Exit the "bitcoin" user session  
  `$ exit`

### Automate startup

* As "admin", set up the systemd unit for automatic start on boot, save and exit  
  `$ sudo nano /etc/systemd/system/eps.service`

```
[Unit]
Description=Electrum Personal Server
After=bitcoind.service

[Service]
ExecStart=/usr/bin/python3 /home/bitcoin/electrum-personal-server/server.py  /home/bitcoin/electrum-personal-server
User=bitcoin
Group=bitcoin
Type=simple
KillMode=process
TimeoutSec=60
Restart=always
RestartSec=60

[Install]
WantedBy=multi-user.target
```

* Enable and start the eps.service unit  
  `$ sudo systemctl enable eps.service`  
  `$ sudo systemctl start eps.service`
  
* Check the startup process for Electrum Personal Server  
  `$ tail -f /home/bitcoin/electrum-personal-server/debug.log`

### Connect Electrum

On your regular computer, configure Electrum to use your RaspiBolt:

* In menu: `Tools > Network > Server`

* Uncheck "Select server automatically"

* Enter the IP of your RaspiBolt (eg. 192.168.0.20) in the address field

  [![Connect Electrum to RaspiBolt](https://github.com/Stadicus/guides/raw/master/raspibolt/images/60_eps_electrum-connect.png)](https://github.com/Stadicus/guides/blob/master/raspibolt/images/60_eps_electrum-connect.png)

* `Close` and check connection in tab "Console"

  [![Check Electrum console](https://github.com/Stadicus/guides/raw/master/raspibolt/images/60_eps_electrumwallet.png)](https://github.com/Stadicus/guides/blob/master/raspibolt/images/60_eps_electrumwallet.png)



### Don't trust, verify.

Congratulations, you have now one of the best Bitcoin desktop wallet, capable of securing your bitcoin with support of a hardware wallet, running with your own trustless Bitcoin full node! 



---

<< Back: [Bonus guides](raspibolt_60_bonus.md) 
