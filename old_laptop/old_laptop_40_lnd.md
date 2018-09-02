[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ **Lightning** ] 

-------
### Un guide pour recycler votre vieux portable en noeud Bitcoin et ⚡Lightning️⚡
--------

# Lightning: LND

Nous allons télécharger et installé LND (Lightning Network Daemon) de [Lightning Labs](http://lightning.engineering/). Vous pouvez aussi aller voir leur [repo sur Github](https://github.com/lightningnetwork/lnd/blob/master/README.md) qui contient une mine d'informations sur le projet et Lightning en général.

### Installer LND
Maintenant, les choses sérieuses : télécharger, vérifier, et installer le fichier binaire de LND.

Nous sommes toujours connecté avec l'utilisateur principal (administrateur).

Tout d'abord, allons dans le dossier de l'utilisateur `bitcoin` (si ce n'est pas déjà fait) :
`$ cd /home/bitcoin`

Puis créons un dossier pour LND :
`$ mkdir LND`
`$ cd LND`

Ensuite, téléchargeons :
* La dernière release stable de LND (0.4.2 au moment de la rédaction de cet article, vous pouvez vérifier sur [cette page](https://github.com/lightningnetwork/lnd/releases)) :
`$ sudo wget https://github.com/lightningnetwork/lnd/releases/download/v0.4.2-beta/lnd-linux-amd64-v0.4.2-beta.tar.gz`
* Les empreintes cryptographiques qui vont nous permettre de vérifier que le logiciel que nous avons téléchargé est bien identique à celui signé par les développeurs :
`$ sudo wget https://github.com/lightningnetwork/lnd/releases/download/v0.4.2-beta/manifest-v0.4.2-beta.txt`
`$ sudo wget https://github.com/lightningnetwork/lnd/releases/download/v0.4.2-beta/manifest-v0.4.2-beta.txt.sig`
* La clé de Roasbeef, qui est le principal développeur du projet :
`$ sudo curl https://keybase.io/roasbeef/pgp_keys.asc | gpg --import`

Nous pouvons alors vérifier l'origine et l'intégrité du fichier téléchargé :
* D'abord en vérifiant la signature de la release :
`$ gpg --verify manifest-v0.4.2-beta.txt.sig`
```
gpg: les données signées sont supposées être dans « manifest-v0.4.2-beta.txt »
gpg: Signature faite le mer. 30 mai 2018 02:25:24 CEST
gpg:                avec la clef RSA 964EA263DD637C21
gpg: Bonne signature de « Olaoluwa Osuntokun <laolu32@gmail.com> » [inconnu]
gpg: Attention : cette clef n'est pas certifiée avec une signature de confiance.
gpg:          Rien n'indique que la signature appartient à son propriétaire.
Empreinte de clef principale : 6531 7176 B685 7F98 834E  DBE8 964E A263 DD63 7C21
```

* Puis l'intégrité du fichier télécharger en comparant le résultat de cette commande :
`$ shasum -a 256 lnd-linux-amd64-v0.4.2-beta.tar.gz`
* Avec la ligne correspondant à `lnd-linux-amd64-v0.4.2-beta.tar.gz` dans le fichier `manifest-v0.4.2-beta.txt` (regardez les 3 premiers chiffres et les 3 derniers, si ils correspondent parfaitement cela suffit) :
`2b6b617d804bfee5352aefcabaae9e27e58013084f9c5654d3f1185222f604c8  lnd-linux-amd64-v0.4.2-beta.tar.gz`

Maintenant que nous sommes sûrs que notre fichier n'a pas été corrompu, nous pouvons l'extraire grâce à la commande `tar` que nous avons déjà vue :
`$ tar -xzf lnd-linux-amd64-v0.4.2-beta.tar.gz`

Vérifier que le nouveau dossier a bien été créé :
`$ ls`

Puis installer LND :
`$ sudo install -m 0755 -o root -g root -t /usr/local/bin lnd-linux-arm-v0.4.2-beta/*`
`$ lnd --version`
`> lnd version 0.4.2-beta commit=7cf5ebe2650b6798182e10be198c7ffc1f1d6e19`

![Checksum LND](images/40_checksum_lnd.png)

### configuration de LND 
Maintenant que LND est installé, nous devons le configurer pour qu'il fonctionne avec Bitcoin Core.

* Basculer sur l'utilisateur `bitcoin`  
`$ sudo su bitcoin` 

* Créer le répertoire de configuration pour LND et le fichier de configuration :  
`mkdir .lnd`
`$ nano /home/bitcoin/.lnd/lnd.conf`

Copier/coller le texte ci-dessous :
```
# /home/bitcoin/.lnd/lnd.conf

[Application Options]
debuglevel=info
debughtlc=true
maxpendingchannels=5
alias=Thunder_Badger [LND] # il s'agit de votre pseudonyme sur le réseau Lightning, soyez créatif
color=#68F442

[Bitcoin]
bitcoin.active=1

# neutraliser l'une ou l'autre de ces deux lignes pour choisir entre testnet et mainnet
bitcoin.testnet=1
#bitcoin.mainnet=1

bitcoin.node=bitcoind

[autopilot]
# l'autopilot ouvre et ferme des canaux de paiement en fonction des quelques paramètres ci-dessous, vous pouvez les modifier ou complètement désactiver cette fonctionnalité
autopilot.active=1
autopilot.maxchannels=5
autopilot.allocation=0.6
```
:point_right: des informations supplémentaires sont disponibles sur [le Github du projet](https://github.com/lightningnetwork/lnd/blob/master/sample-lnd.conf).

* Quitter la session de l'utilisateur `bitcoin` et retourner sur l'utilisateur principal :  
`$ exit`  

* Pour suivre les logs de LND (`Ctrl-C` pour sortir) :  
`$ sudo tail -f /home/bitcoin/.lnd/logs/bitcoin/mainnet/lnd.log`

### Initialisation du portefeuille LND

Tout d'abord, nous devons nous assurer que Bitcoin Core a terminé sa synchronisation initiale :
* Basculer sur l'utilisateur `bitcoin` :   
`$ sudo su bitcoin`
* Interroger `bitcoind` sur l'avancement de la synchronisation :
`$ bitcoin-cli getblockchaininfo`

Les informations qui nous intéressent sont `blocks` et `headers`. Si ces deux valeurs sont identiques, alors votre noeud est synchronisé avec le réseau. 

Maintenant que LND est configuré, nous allons pouvoir effectuer le premier lancement.

Saisissez la commande suivante :
`$ lnd`

Et là... rien ne se passe ! LND attend en fait que nous créons le portefeuille qu'il utilisera pour ses transactions on-chain. 

Ouvrez une 2ème fenêtre de terminal, et effectuez une nouvelle connexion SSH sur l'utilisateur `bitcoin` (vous devriez commencer à connaître la chanson maintenant).

Créer le portefeuille LND :
* Tapez la commande ci-dessous :
`$ lncli create` 
* Entrez un mot de passe pour protéger l'accès à votre portefeuille (ne vous prenez pas la tête, ce n'est qu'un portefeuille de test de toute façon).
* Quand LND vous demande si vous souhaitez restaurer un portefeuille existant, tapez `n`. Vous pouvez taper un mot de passe pour protéger la seed, mais ce n'est pas obligé. 
* Une liste de 24 mots apparaît à l'écran. 

Ces 24 mots sont appelés "seed", car ils permettent de retrouver votre portefeuille et l'intégralité de vos canaux de paiement existant. Ainsi, grâce à lui, vous n'avez pas à craindre de tout perdre si votre Thunder Badger venait à rendre l'âme, vous pourriez retrouver votre noeud sur une autre machine. 

![LND new cipher seed](images/40_cipher_seed.png)

:warning: Cette information est extrêmement sensible, et doit être garder secrète. **Copiez soigneusement à la main ces 24 mots et éventuellement votre mot de passe sur une feuille de papier que vous conserverez dans un endroit sûr**. Un pirate qui viendrait à mettre la main sur ce bout de papier pourrait vider intégralement votre portefeuille ! Ne stockez pas cette liste sur un ordinateur. Ne prenez pas une photo avec votre téléphone. **Ces informations ne doivent jamais être conservées numériquement**.

### Ouvrir votre portefeuille et lancer LND

* Lancez à nouveau LND (cf ci-dessus). Ouvrez un autre terminal et déverrouillez votre portefeuille.   
`$ lncli unlock`
* Saisissez le mot de passe défini à l'étape précédente (celui du portefeuille, pas celui de la seed !).
* Surveillez les logs pour vous assurer que tout va bien (même si vous ne comprenez rien, chercher des messages marqués `[ERR]`).
`$ tail -f /home/bitcoin/.lnd/logs/bitcoin/mainnet/lnd.log`

### r

Now your Lightning node is ready. To use it in testnet, you can get some free testnet bitcoin from a faucet.
* Generate a new Bitcoin address to receive funds on-chain  
  `$ lncli newaddress np2wkh`  
  `> "address": "2NCoq9q7............dkuca5LzPXnJ9NQ"` 

* Get testnet bitcoin:  
  https://testnet.manu.backend.hamburg/faucet

* Check your LND wallet balance  
  `$ lncli walletbalance`  

* Monitor your transaction (the faucet shows the TX ID) on a Blockchain explorer:  
  https://testnet.smartbit.com.au

### LND in action
As soon as your funding transaction is mined and confirmed, LND will start to open and maintain channels. This feature is called "Autopilot" and is configured in the "lnd.conf" file. If you would like to maintain your channels manually, you can disable the autopilot.

Get yourself a payment request on [StarBlocks](https://starblocks.acinq.co/#/) or [Y’alls](https://yalls.org/) and move some coins!

* `$ lncli listpeers`  
* `$ lncli listchannels`  
* `$ lncli sendpayment --pay_req=lntb32u1pdg7p...y0gtw6qtq0gcpk50kww`  
* `$ lncli listpayments`  

:point_right: see [Lightning API reference](http://api.lightning.community/) for additional information

-----

### Before proceeding to mainnet 
This is the point of no return. Up until now, you can just start over. Experiment with testnet bitcoin. Open and close channels on the testnet. 

Once you switch to mainnet and send real bitcoin to your RaspiBolt, you have "skin in the game". 

* Make sure your RaspiBolt is working as expected.
* Get a little practice with `bitcoin-cli` and its options (see [Bitcoin Core RPC documentation](https://bitcoin-rpc.github.io/))
* Do a dry run with `lncli` and its many options (see [Lightning API reference](http://api.lightning.community/))
* Try a few restarts (`sudo shutdown -r now`), is everything starting fine?

---
Next: [Mainnet >>](raspibolt_50_mainnet.md)
