[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ **Lightning** ] 

-------
### Thunder Badger : un noeud Bitcoin et ⚡Lightning️⚡ dans votre vieux portable pourri !
--------

# Lightning: LND

Nous allons télécharger et installer LND (Lightning Network Daemon) de [Lightning Labs](http://lightning.engineering/). Vous pouvez aussi aller voir leur [repo sur Github](https://github.com/lightningnetwork/lnd/blob/master/README.md) qui contient une mine d'informations sur le projet et Lightning en général.

:warning: J'ai décidé de réaliser ce tuto avec LND en particulier car c'est l'implémentation de Lightning que j'ai le plus utilisé jusqu'à aujourd'hui et avec laquelle je suis le plus à l'aise. Il existe au moins deux autres implémentations, [c-lightning](https://github.com/ElementsProject/lightning) et [Éclair](https://github.com/ACINQ/eclair) qui marchent toutes les deux très bien aussi et pourraient être utilisées pour ce tuto.

### Installer LND
Maintenant, les choses sérieuses : télécharger, vérifier, et installer le fichier binaire de LND.

Nous sommes toujours connecté avec l'utilisateur principal (administrateur).

Tout d'abord, allons dans le dossier de l'utilisateur `bitcoin` :
`$ cd /home/bitcoin`

Puis créons un dossier pour LND :
```
$ mkdir LND
$ cd LND
```

Ensuite, téléchargeons :
* La dernière release stable de LND (0.4.2 au moment de la rédaction de cet article, vous pouvez vérifier sur [cette page](https://github.com/lightningnetwork/lnd/releases)) :
`$ sudo wget https://github.com/lightningnetwork/lnd/releases/download/v0.5-beta/lnd-linux-amd64-v0.5-beta.tar.gz`
* Les empreintes cryptographiques qui vont nous permettre de vérifier que le logiciel que nous avons téléchargé est bien identique à celui signé par les développeurs :
```
$ sudo wget https://github.com/lightningnetwork/lnd/releases/download/v0.5-beta/manifest-v0.5-beta.txt
$ sudo wget https://github.com/lightningnetwork/lnd/releases/download/v0.5-beta/manifest-v0.5-beta.txt.sig
```
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

* Puis l'intégrité du fichier télécharger en comparant le résultat de cette commande :
`$ shasum -a 256 lnd-linux-amd64-v0.5-beta.tar.gz`
* Avec la ligne correspondant à `lnd-linux-amd64-v0.5-beta.tar.gz` dans le fichier `manifest-v0.5-beta.txt` :
`7e80f0daec6e8a2589f0a1d3d220b5f562792d1ec1fe3fcf10432a827cefeb54  lnd-linux-amd64-v0.5-beta.tar.gz`

Maintenant que nous sommes sûrs que notre fichier n'a pas été corrompu, nous pouvons l'extraire grâce à la commande `tar` que nous avons déjà vue :
`$ tar -xzf lnd-linux-amd64-v0.4.2-beta.tar.gz`

Vérifier que le nouveau dossier a bien été créé :
`$ ls`

Puis installer LND :
```
$ sudo install -m 0755 -o bitcoin -g bitcoin -t /usr/local/bin lnd-linux-arm-v0.5-beta/*
$ lnd --version`
> lnd version 0.5.0-beta commit=3b2c807288b1b7f40d609533c1e96a510ac5fa6d
```

### configuration de LND 
Maintenant que LND est installé, nous devons le configurer pour qu'il fonctionne avec Bitcoin Core.

* Basculer sur l'utilisateur `bitcoin` (vous devrez saisir le mot de passe de cet utilisateur) :  
`$ su bitcoin` 

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
alias=Thunder_Badger [LND] # il s'agit de votre pseudonyme sur le réseau Lightning, soyez créatif
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
autopilot.active=1
autopilot.maxchannels=5
autopilot.allocation=0.6
```

:point_right: des informations supplémentaires sont disponibles sur [le Github du projet](https://github.com/lightningnetwork/lnd/blob/master/sample-lnd.conf).

* Quitter la session de l'utilisateur `bitcoin` et retourner sur l'utilisateur principal :  
`$ exit`  

:point_right: Plus tard vous pourrez suivre les logs de LND en tapant la commande suivante (`Ctrl-C` pour sortir) :  
`$ tail -f /home/bitcoin/.lnd/logs/bitcoin/mainnet/lnd.log`

### Initialisation du portefeuille LND

Tout d'abord, nous devons nous assurer que Bitcoin Core a terminé sa synchronisation initiale :
* Basculer sur l'utilisateur `bitcoin` :   
`$ sudo su bitcoin`
* Interroger `bitcoind` sur l'avancement de la synchronisation :
`$ bitcoin-cli getblockchaininfo`

Les informations qui nous intéressent sont `blocks` et `headers`. Si ces deux valeurs sont identiques, alors votre noeud est synchronisé avec le réseau. 

Maintenant que LND est configuré, nous allons pouvoir effectuer le premier lancement sur le testnet.

Saisissez la commande suivante :
`$ lnd`

Et là... rien ne se passe ! LND attend en fait que nous créons le portefeuille qu'il utilisera pour ses transactions on-chain. 

Ouvrez une 2ème fenêtre de terminal, et effectuez une nouvelle connexion SSH sur l'utilisateur `bitcoin` (vous devriez commencer à connaître la chanson maintenant).

Créer le portefeuille LND :
* Tapez la commande ci-dessous :
`$ lncli create` 
* Entrez un mot de passe pour protéger l'accès à votre portefeuille (pas d'inquiétude, ce n'est qu'un portefeuille de test de toute façon).
* Quand LND vous demande si vous souhaitez restaurer un portefeuille existant, tapez `n`. Vous pouvez taper un mot de passe pour protéger la seed, mais ce n'est vraiment pas nécessaire, surtout pour un portefeuille de test. 
* Une liste de 24 mots apparaît à l'écran. 

Ces 24 mots sont appelés "seed", car ils permettent de restaurer le portefeuille lié à LND. Ainsi, grâce à lui, vous n'avez pas à craindre de tout perdre si votre Thunder Badger venait à rendre l'âme, vous pourriez retrouver vos fonds sur une autre machine. 

![LND new cipher seed](images/40_cipher_seed.png)

:warning: Cette information est extrêmement sensible, et doit être garder secrète. **Copiez soigneusement à la main ces 24 mots et éventuellement votre mot de passe sur une feuille de papier que vous conserverez dans un endroit sûr**. Un pirate qui viendrait à mettre la main sur ce bout de papier pourrait vider intégralement votre portefeuille ! Ne stockez pas cette liste sur un ordinateur. Ne prenez pas une photo avec votre téléphone. **Ces informations ne doivent jamais être conservées numériquement**.

### Ouvrir votre portefeuille et lancer LND

* Lancez à nouveau LND (cf ci-dessus). Ouvrez un autre terminal et déverrouillez votre portefeuille.   
`$ lncli unlock`
* Saisissez le mot de passe défini à l'étape précédente (celui du portefeuille, pas celui de la seed !).
* Surveillez les logs pour vous assurer que tout va bien (même si vous ne comprenez rien, chercher des messages marqués `[ERR]`).
`$ tail -f /home/bitcoin/.lnd/logs/bitcoin/mainnet/lnd.log`

### Récupérer des bitcoins de test

Votre noeud Lightning est prêt. Pour jouer un peu sur le testnet, vous pouvez vous faire envoyer des bitcoins de test gratuits depuis un site que l'on appelle un "faucet".
* Générer une nouvelle adresse Bitcoin pour recevoir des fonds sur le portefeuille LND :  
`$ lncli newaddress np2wkh`  
`> "address": "2NCoq9q7............dkuca5LzPXnJ9NQ"` 

* Rendez-vous sur un [faucet](https://testnet.manu.backend.hamburg/faucet) et suivez les instructions. 

* Vérifier le montant sur votre portefeuille.
`$ lncli walletbalance`  

* Vous pouvez aussi voir votre transaction sur un explorateur de blockchain, par exemple [celui-là](https://testnet.smartbit.com.au), il suffit de copier l'ID de transaction que vous aura donné le faucet dans le champ de recherche.  
  

### Ouvrir des canaux de paiement

Il faudra attendre quelques confirmations pour que vos fonds soient accessibles sur le portefeuille. Vous pourrez alors ouvrir des canaux vers d'autres noeuds et effectuer des paiements à la vitesse de l'éclair !

(Si vous aviez activé l'autopilot dans le ficher `lnd.conf`, le logiciel s'en chargera lui-même, vous n'avez rien à faire)

Un bon point de départ est [satoshi's place](https://testnet.satoshis.place/). Il s'agit d'une grande page blanche sur laquelle n'importe qui peut écrire n'importe quoi, à la condition de payer un satoshi (1/100 000 000 de bitcoin) pour chaque pixel dessiné.

Quand vous aurez fini de vous amuser, cliquez sur "Submit" en bas à droite de la page. Vous verrez alors une fenêtre de paiement contenant deux informations :
* Un énorme bloc de caractères inintelligibles appelé "payment request". C'est un peu comme une facture : elle contient le destinataire, le montant du paiement et un certain nombre d'informations qui lui permettront d'arriver à bon port.
* Une ligne appelé "node information". Il s'agit des données qui permettent de retrouver et d'identifier un noeud Lightning, et surtout de s'y connecter et d'ouvrir un canal avec lui. La première information est une longue série de caractères en apparence aléatoire et qui sont en réalité une clé cryptographique qui permet d'identifier le noeud sur le réseau. Après le "@", il y a l'adresse IP du noeud, et derrière les deux points le port réseau utilisé (ici celui par défaut).

Si vous n'avez toujours pas de canaux ouverts, c'est donc une bonne occasion de commencer.

* Se connecter avec le noeud de Satoshi's place :
`$ lncli connect 035fc91a8ba32729da031bde4543c7f247de3c8e67b483825ea64b32fd9664233d@51.15.113.51:9735`

* Ouvrir un canal :
`$ lncli openchannel 035fc91a8ba32729da031bde4543c7f247de3c8e67b483825ea64b32fd9664233d 100000`

:warning: Le deuxième argument est le montant avec lequel vous souhaitez initialiser le canal avec ce pair. Il sera déduit du montant disponible dans votre portefeuille. **Ce montant n'est pas exprimé en bitcoins, mais en satoshis**, ici j'envoie donc 0,00100000, soit un millième de bitcoin, pour initialiser le canal. 

:point_right: n'hésitez pas à taper `$ lncli help` pour avoir une présentation de l'ensemble des commandes, ou à faire `$ lncli help [command]` pour avoir une présentation détaillée d'une commande en particulier. 

-----

### Avant d'aller dans le grand bain

Vous avez maintenant un noeud Bitcoin + Lightning parfaitement opérationnel... sauf que vous jouez avec des billets de Monopoly ! 

Si quelque chose tourne mal, vous pouvez toujours tout effacer et recommencer à zéro. Alors profitez-en pour faire toutes les bêtises possibles, quand vous serez sur le mainnet elles pourraient vous coûter cher !

Ouvrez et fermez des canaux avec différents noeuds, essayez de trouver des démos qui utilisent le testnet (il y en a plusieurs) et d'effectuer des paiements.

Faites aussi quelques transactions "on-chain" avec votre noeud Bitcoin, voyez si vous êtes à l'aise avec les deux logiciels.

Arrêtez LND (`$ lncli stop`) et Bitcoin (`$ bitcoin-cli stop`), assurez-vous que vous savez les relancer et que tout fonctionne correctement. Redémarrez plusieurs fois le Thunder Badger et vérifiez que cela n'impacte pas vos applications.

Quand vous serez prêt vous n'aurez qu'une ligne à changer dans votre fichier de configuration pour activer le mainnet, et alors vous "jouez votre peau" :smile:.