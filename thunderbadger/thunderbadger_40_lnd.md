[ [Intro](README.md) ] -- [ [Préparatifs](thunderbadger_10_preparations.md) ] -- [ [Thunder Badger](thunderbadger_20_ThunderBadger.md) ] -- [ [Bitcoin](thunderbadger_30_bitcoin.md) ] -- [ **LND** ] -- [ [Mainnet](thunderbadger_50_mainnet.md) ] -- [ [Bonus](thunderbadger_60_bonus.md) ]

-------
### Thunder Badger : un nœud Bitcoin et ⚡Lightning️⚡ dans votre vieux portable pourri !
--------

# Lightning: LND

Nous allons télécharger et installer LND (Lightning Network Daemon) de [Lightning Labs](http://lightning.engineering/). Vous pouvez aussi aller voir leur [repo sur Github](https://github.com/lightningnetwork/lnd/blob/master/README.md) qui contient une mine d'informations sur le projet et Lightning en général.

:warning: J'ai décidé de réaliser ce tuto avec LND en particulier car c'est l'implémentation de Lightning que j'ai le plus utilisé jusqu'à aujourd'hui et avec laquelle je suis le plus à l'aise. Il existe au moins deux autres implémentations, [c-lightning](https://github.com/ElementsProject/lightning) et [Éclair](https://github.com/ACINQ/eclair) qui marchent toutes les deux très bien aussi et pourraient être utilisées pour ce tuto.

### Installer LND
Maintenant, les choses sérieuses : télécharger, vérifier, et installer le fichier binaire de LND.

* Connecté en tant que `bitcoin`, créez un dossier pour LND dans le répertoire utilisateur :  
`$ mkdir LND`  
`$ cd LND`

Ensuite, téléchargez :
* La dernière release stable de LND (0.5 au moment de la dernière révision de ce tuto, vous pouvez vérifier sur [cette page](https://github.com/lightningnetwork/lnd/releases)) :  
`$ wget https://github.com/lightningnetwork/lnd/releases/download/v0.5-beta/lnd-linux-amd64-v0.5-beta.tar.gz`

* Les empreintes cryptographiques qui vont vous permettre de vérifier que le logiciel que vous avez téléchargé est bien identique à celui signé par les développeurs :  
`$ sudo wget https://github.com/lightningnetwork/lnd/releases/download/v0.5-beta/manifest-v0.5-beta.txt`  
`$ sudo wget https://github.com/lightningnetwork/lnd/releases/download/v0.5-beta/manifest-v0.5-beta.txt.sig`

* La clé de Roasbeef, qui est le principal développeur du projet, ce qui permet de vérifier qu'il a bien signé le fichier :  
`$ sudo wget https://keybase.io/roasbeef/pgp_keys.asc | gpg --import`

Nous pouvons alors vérifier l'origine et l'intégrité du fichier téléchargé :
* D'abord en vérifiant la signature de la release :
```$ gpg --verify manifest-v0.5-beta.txt.sig
gpg: les données signées sont supposées être dans « manifest-v0.5-beta.txt »
gpg: Signature faite le ven. 14 sept. 2018 02:51:12 CEST
gpg:                avec la clef RSA F8037E70C12C7A263C032508CE58F7F8E20FD9A2
gpg: Bonne signature de « Olaoluwa Osuntokun <laolu32@gmail.com> » [inconnu]
gpg: Attention : cette clef n'est pas certifiée avec une signature de confiance.
gpg:          Rien n'indique que la signature appartient à son propriétaire.
Empreinte de clef principale : BD59 9672 C804 AF27 7086  9A04 8B80 CD2B B8BD 8132
     Empreinte de la sous-clef : F803 7E70 C12C 7A26 3C03  2508 CE58 F7F8 E20F D9A2
```

* Puis l'intégrité du fichier téléchargé en comparant le résultat de cette commande :  
`$ sha256sum --check manifest-v0.5-beta.txt --ignore-missing`

Maintenant que nous sommes sûrs que le fichier n'a pas été corrompu, nous pouvons l'extraire grâce à la commande `tar` :  
`$ tar -xzf lnd-linux-amd64-v0.4.2-beta.tar.gz`

Vérifier que le nouveau dossier a bien été créé :  
`$ ls`

Puis installer LND (nous avons besoin de basculer sur l'utilisateur admin) :  
```
$ su [ADMIN]
$ sudo install -m 0755 -o root -g root -t /usr/local/bin lnd-linux-arm-v0.5-beta/*
$ lnd --version`
> lnd version 0.5.0-beta commit=3b2c807288b1b7f40d609533c1e96a510ac5fa6d
$ exit
```

### Configuration de LND 
Maintenant que LND est installé, nous devons le configurer pour qu'il fonctionne avec Bitcoin Core.

* Dans le dossier de l'utilisateur, créer le répertoire de configuration pour LND et le fichier de configuration :  
```
$ mkdir .lnd
$ nano .lnd/lnd.conf
```

Copier/coller le texte ci-dessous :
```
# /home/bitcoin/.lnd/lnd.conf

[Application Options]
debuglevel=info
debughtlc=true
maxpendingchannels=5
alias=Thunder_Badger [LND] 
# il s'agit de votre pseudonyme sur le réseau Lightning, soyez créatif
color=#68F442

[Bitcoin]
bitcoin.active=1

# neutraliser l'une ou l'autre de ces deux lignes pour choisir entre testnet et mainnet. Soyez cohérent avec bitcoind !
bitcoin.testnet=1
#bitcoin.mainnet=1

# LND peut utiliser plusieurs implémentation de Bitcoin, nous devons donc lui signaler que nous utilisons Bitcoin Core.
bitcoin.node=bitcoind

[autopilot]
# l'autopilot ouvre et ferme des canaux de paiement en fonction des quelques paramètres ci-dessous, vous pouvez les modifier ou complètement désactiver cette fonctionnalité en neutralisant la 1ère ligne
#autopilot.active=1
autopilot.maxchannels=5
autopilot.allocation=0.6
```

:point_right: des informations supplémentaires sur les configuration sont disponibles sur [le Github du projet](https://github.com/lightningnetwork/lnd/blob/master/sample-lnd.conf).

:point_right: Plus tard vous pourrez suivre les logs de LND en tapant la commande suivante (`Ctrl-C` pour sortir) :  
`$ tail -f /home/bitcoin/.lnd/logs/bitcoin/mainnet/lnd.log`

### Initialisation du portefeuille LND

Tout d'abord, nous devons nous assurer que Bitcoin Core a terminé sa synchronisation initiale :
* Interroger `bitcoind` sur l'avancement de la synchronisation :  
`$ bitcoin-cli getblockchaininfo`

Les informations qui nous intéressent sont `blocks` et `headers`. Si ces deux valeurs sont identiques, alors votre nœud est synchronisé avec le réseau. 

Maintenant que LND est configuré, nous allons pouvoir effectuer le premier lancement sur le testnet.

Saisissez la commande suivante :
`$ lnd`

Et là... rien ne se passe ! Vous devez d'abord créer un portefeuille Bitcoin que LND utilisera pour ses transactions on-chain. 

Ouvrez une 2ème fenêtre de terminal, et effectuez une nouvelle connexion SSH sur l'utilisateur `bitcoin` (vous devriez commencer à connaître la chanson maintenant).

Créer le portefeuille LND :
* Tapez la commande ci-dessous :
`$ lncli --network=testnet create` 
* Entrez le mot de passe #3 pour l'accès à votre portefeuille.
* Quand LND vous demande si vous souhaitez restaurer un portefeuille existant, tapez `n`. Vous pouvez taper un mot de passe pour protéger la seed, mais c'est facultatif. 
* Une liste de 24 mots apparaît à l'écran. 

Ces 24 mots sont appelés "seed", car ils permettent de restaurer le portefeuille lié à LND. Ainsi, grâce à lui, vous n'avez pas à craindre de tout perdre si votre Thunder Badger venait à rendre l'âme, vous pourriez retrouver vos fonds sur une autre machine. 

:warning: Cette information est extrêmement sensible, et doit être garder secrète. **Copiez soigneusement à la main ces 24 mots et éventuellement votre mot de passe sur une feuille de papier que vous conserverez dans un endroit sûr**. Quiconque viendrait à mettre la main sur ce bout de papier pourrait vider intégralement votre portefeuille ! Ne stockez pas cette liste sur un ordinateur. Ne prenez pas une photo avec votre téléphone. **Ces informations ne doivent jamais être conservées numériquement**.

### Ouvrir votre portefeuille et lancer LND

* Lancez à nouveau LND (cf ci-dessus). Ouvrez un autre terminal et déverrouillez votre portefeuille.   
`$ lncli --network=testnet unlock`
* Saisissez le mot de passe défini à l'étape précédente (celui du portefeuille, pas celui de la seed !).
* Surveillez les logs pour vous assurer que tout va bien (même si vous ne comprenez rien, cherchez des messages marqués `[ERR]`).
`$ tail -f /home/bitcoin/.lnd/logs/bitcoin/mainnet/lnd.log`

### Récupérer des bitcoins de test

Votre nœud Lightning est prêt. Pour jouer un peu sur le testnet, vous pouvez vous faire envoyer des bitcoins de test gratuits depuis un site que l'on appelle un "faucet".
* Générer une nouvelle adresse Bitcoin pour recevoir des fonds sur le portefeuille LND :  
`$ lncli --network=testnet newaddress np2wkh`  
`> "address": "2NCoq9q7............dkuca5LzPXnJ9NQ"` 

* Rendez-vous sur un [faucet](https://testnet.manu.backend.hamburg/faucet) et suivez les instructions. 

* Vérifier le montant sur votre portefeuille.
`$ lncli --network=testnet walletbalance`  

* Vous pouvez aussi voir votre transaction sur un explorateur de blockchain, par exemple [celui-là](https://testnet.smartbit.com.au), il suffit de copier l'ID de transaction que vous aura donné le faucet dans le champ de recherche.  
  

### Ouvrir des canaux de paiement

Il faudra attendre quelques confirmations pour que vos fonds soient accessibles sur le portefeuille. Vous pourrez alors ouvrir des canaux vers d'autres nœuds et effectuer des paiements à la vitesse de l'éclair !

(Si vous aviez activé l'autopilot dans le ficher `lnd.conf`, le logiciel s'en chargera lui-même, vous n'avez rien à faire)

Un bon point de départ est [satoshi's place](https://testnet.satoshis.place/). Il s'agit d'une grande page blanche sur laquelle n'importe qui peut dessiner n'importe quoi, à la condition de payer un satoshi (1/100 000 000 de bitcoin) pour chaque pixel dessiné.

Quand vous aurez fini de vous amuser, cliquez sur "Submit" en bas à droite de la page. Vous verrez alors une fenêtre de paiement contenant deux informations :  
* Un énorme bloc de caractères inintelligibles appelé "payment request". C'est un peu comme une facture : elle contient le destinataire, le montant du paiement et un certain nombre d'informations qui lui permettront d'arriver à bon port.
* Une ligne appelé "node information". Il s'agit des données qui permettent de retrouver et d'identifier un nœud Lightning, et surtout de s'y connecter et d'ouvrir un canal avec lui. La première information est une longue série de caractères en apparence aléatoire et qui sont en réalité une clé cryptographique qui permet d'identifier le nœud sur le réseau. Après le "@", il y a l'adresse IP du nœud, et derrière les deux points le port réseau utilisé (ici celui par défaut).

Si vous n'avez toujours pas de canaux ouverts, c'est donc une bonne occasion de commencer.

* Se connecter avec le nœud de Satoshi's place :
`$ lncli --network=testnet connect 035fc91a8ba32729da031bde4543c7f247de3c8e67b483825ea64b32fd9664233d@51.15.113.51:9735`

* Ouvrir un canal :
`$ lncli --network=testnet openchannel 035fc91a8ba32729da031bde4543c7f247de3c8e67b483825ea64b32fd9664233d 100000`

Le deuxième argument est le montant avec lequel vous souhaitez initialiser le canal avec ce pair. Il sera déduit du montant disponible dans votre portefeuille. **Ce montant n'est pas exprimé en bitcoins, mais en satoshis**, ici j'envoie donc 0,00100000, soit un millième de bitcoin, pour initialiser le canal.

:warning: L'expérience Lightning sur le testnet peut être un peu frustrante, il est plus difficile de trouver des nœuds avec lesquels ouvrir un canal et les paiements échouent souvent faute de pouvoir trouver un chemin. Cela est dû au fait que, paradoxalement, **il y a beaucoup moins de nœuds sur le testnet que sur le mainnet, et que ces nœuds sont beaucoup plus souvent hors-ligne**, ce qui rend le réseau beaucoup moins fiable. 

### Listes des commandes utiles de LND

C'est le moment idéal pour vous familiariser avec les principales commandes de LND, d'autant plus que ce n'est pas malheureusement pas très intuitif pour les néophytes !

**Note** : vous avez sans doute remarqué que chaque commande était passée avec l'option `--network=testnet`. Pour le moment cela est nécessaire pour signaler à LND que la commande que vous voulez passer concerne le testnet. Lorsque vous serez sur le mainnet, vous n'aurez qu'à l'enlever. 

En attendant si cela vous paraît trop contraignant, vous pouvez créer ce qu'on appelle un alias pour éviter d'avoir à le retaper à chaque fois. Attention toutefois, **lorsque vous passerez sur le mainnet, il faudra bien penser à retirer cet alias, ou vos commandes tomberont en erreur !**

Voici comment faire, dans le dossier de l'utilisateur "bitcoin", tapez les commandes suivantes :  
```
$ echo 'alias lncli="lncli --network=testnet"' >> .bash_aliases
$ source .bashrc
```

* Obtenir la liste de toutes les commandes :  
   `$ lncli`

* Obtenir une aide plus détaillée sur une commande précise :  
   `$ lncli help [COMMANDE]`

* Obtenir une vue d'ensemble du fonctionnement de votre nœud :  
   `$ lncli getinfo`  

* Se connecter à un pair (vous pouvez trouver quelques nœuds auquel vous connecter sur [https://1ml.com/](https://1ml.com/)) :  
   `$ lncli connect [NODE_URI]`  

* Lister les pairs auxquels vous êtes connectés :  
   `$ lncli listpeers`  

* Ouvrir un canal avec un pair :  
   `$ lncli openchannel [NODE_PUBKEY] [MONTANT_EN_SATOSHIS] 0`   
    *[NODE_URI] est composé de [NODE_PUBKEY] auquel on ajoute @IP:PORT. Ici il faut donc **enlever** cette dernière partie.* 
	*Le `0` à la suite de `[MONTANT_EN_SATOSHIS]` est une valeur appelée `push amount`. Elle permet d'envoyer une partie de l'argent utilisé pour créer le canal directement chez le pair avec lequel vous l'ouvrez. Cela peut être intéressant quand vous souhaitez effectuer immédiatement un paiement ou dans une logique "altruiste" pour créer un peu de liquidité dans votre réseau. À manier malgré tout avec précaution.*

* Vérifier le statut des canaux en cours d'ouverture :  
   `$ lncli pendingchannels`  

* Vérifier le statut des canaux actifs :  
   `$ lncli listchannels`  

* Décoder une facture avant de la payer afin de s'assurer que le montant et les autres infos sont corrects :  
   `$ lncli decodepayreq [FACTURE]`  

* Payer une facture :  
   `$ lncli payinvoice [FACTURE]`  

* Vérifier les paiements déjà envoyés :      
   `$ lncli listpayments`   

* Créer une facture :   
   `$ lncli addinvoice [MONTANT_EN_SATOSHIS]`
   *Le montant est en fait optionnel. Vous pouvez créer des factures "blanches", charge à celui qui la paiera de préciser le montant qu'il souhaite vous envoyer.*
   
* Lister toutes les factures :  
  `$ lncli listinvoices`

* Pour fermer un canal, vous avez besoin de deux informations que vous pouvez trouver grâce à la commande `listchannels`. Vous verrez alors une valeur appelée "channelpoint" contenant `FUNDING_TXID` : `OUTPUT_INDEX`.  
   `$ lncli listchannels`  
   `$ lncli closechannel [FUNDING_TXID] [OUTPUT_INDEX]`

* Pour forcer la fermeture d'un canal (notamment quand le pair est hors-ligne pour de longues périodes) :   
   `$ lncli closechannel --force [FUNDING_TXID] [OUTPUT_INDEX] `
   
👉 Se référer à[LND API reference](http://api.lightning.community/) pour plus de détails.

-----

### Avant d'aller dans le grand bain

Vous avez maintenant un nœud Bitcoin + Lightning parfaitement opérationnel... sauf que vous jouez avec des billets de Monopoly ! 

Si quelque chose tourne mal, vous pouvez toujours tout effacer et recommencer à zéro. Alors profitez-en pour faire toutes les bêtises possibles, quand vous serez sur le mainnet elles pourraient vous coûter cher !

Ouvrez et fermez des canaux avec différents nœuds, essayez de trouver des démos qui utilisent le testnet (par exemple, [celui-ci](https://starblocks.acinq.co/)) et d'effectuer des paiements.

Faites aussi quelques transactions "on-chain" avec votre nœud Bitcoin, voyez si vous êtes à l'aise avec les deux logiciels.

Arrêtez LND (`$ lncli stop`) et Bitcoin (`$ bitcoin-cli stop`), assurez-vous que vous savez les relancer et que tout fonctionne correctement. Redémarrez plusieurs fois le Thunder Badger et vérifiez que cela n'impacte pas leur fonctionnement.

Quand vous lancez un programme dans un terminal, fermer ce dernier provoque l'interruption du programme. Pour éviter cela, vous pouvez ajouter `nohup` lorsque vous lancerez Bitcoin et LND :
`$ nohup bitcoind`
`$ nohup lnd`

Quand vous serez prêt vous n'aurez qu'une ligne à changer dans votre fichier de configuration pour activer le mainnet, et "jouer votre peau" :smile:.

--- 

[ [Page précédente](thunderbadger_30_bitcoin.md) ] -- [ [Page suivante](thunderbadger_50_mainnet.md) ]