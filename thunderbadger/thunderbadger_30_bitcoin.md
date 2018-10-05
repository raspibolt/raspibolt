[ [Intro](README.md) ] -- [ [Préparatifs](thunderbadger_10_preparations.md) ] -- [ [Thunder Badger](thunderbadger_20_ThunderBadger.md) ] -- [ **Bitcoin** ] -- [ [LND](thunderbadger_40_lnd.md) ] -- [ [Mainnet](thunderbadger_50_mainnet.md) ]

-------
### Thunder Badger : un noeud Bitcoin et ⚡Lightning️⚡ dans votre vieux portable pourri !
--------

# Bitcoin
À la base de Lightning se trouve un noeud [Bitcoin Core](https://bitcoin.org/en/bitcoin-core/). Ce noeud conserve une copie complète de la blockchain et valide toutes les transactions et les blocs. 

Bitcoin dispose d'un réseau de test, opportunément appelé "testnet". Avant de nous lancer sur le réseau principal, le "mainnet", il peut donc être utile de se familiariser d'abord aux diverses commandes en jouant avec des bitcoins de test (symbolisés par tBTC).

Le testnet fonctionne presque complètement de la même façon que le mainnet, et un de ses avantages est que sa blockchain est beaucoup plus légère que celle du mainnet (une quinzaine de Go), et peut donc être synchronisée en quelques heures, même sur un ordinateur qui mettrait littéralement des semaines à synchroniser le mainnet.

### Installation
Nous allons tout d'abord télécharger le dernier [fichier binaire](https://fr.wikipedia.org/wiki/Fichier_binaire) de Bitcoin Core (16.2 en août 2018), et comparer l'empreinte du fichier téléchargé avec le [checksum signé](https://bitcoin.org/bin/bitcoin-core-0.16.2/SHA256SUMS.asc) (souvenez-vous, nous l'avons fait également lorsque nous avons téléchargé Bitcoin Core pour Windows à [l'étape 1](old_laptop_10_preparations.md)).

* Se connecter en tant qu'utilisateur principal (celui qui a les droits d'administrateur grâce à la commande `sudo`) sur le Thunder Badger :
`$ ssh [utilisateur]@[votreip]`
* Aller dans le répertoire de l'utilisateur `bitcoin` :
`$ cd /home/bitcoin`
* Créer un nouveau dossier `bitcoin` :
`$ mkdir bitcoin`
* Entrer dans le dossier `bitcoin` :
`$ cd bitcoin`

**Note** : le nom de l'utilisateur avec lequel vous êtes connecté apparaît toujours dans le terminal sous la forme `user@host`. Si vous ne savez plus dans quel dossier vous vous trouvez, regardez ce qu'il y a avant le symbole `$`. En cas de besoin, la commande `$ pwd` vous donnera votre emplacement exact.

* Télécharger les différents fichiers dont nous avons besoin grâce à la commande `wget`. **Attention, le lien ci-dessous est valable pour la version actuelle (16.2)**, pensez à vous rendre sur [bitcoin.org/en/download](bitcoin.org/en/download) pour vérifier quelle est la dernière version.  
  `$ sudo wget https://bitcoin.org/bin/bitcoin-core-0.16.2/bitcoin-0.16.2-arm-linux-gnueabihf.tar.gz`  
  `$ sudo wget https://bitcoin.org/bin/bitcoin-core-0.16.2/SHA256SUMS.asc`  
  `$ sudo wget https://bitcoin.org/laanwj-releases.asc`

* Vérifier que le checksum de référence correspond à celui du fichier téléchargé :  
  `$ sha256sum --check SHA256SUMS.asc --ignore-missing`  
  `> bitcoin-0.16.0-arm-linux-gnueabihf.tar.gz: Réussi`
:warning: Si jamais vous n'avez pas le même message suite à cette dernière commande, **quelque chose ne va pas**, n'allez pas plus loin tant que vous n'avez pas compris ce qu'il se passe.

* Vérifier manuellement l'empreinte de la clé publique :  
  `$ gpg ./laanwj-releases.asc`  
  `> 01EA5486DE18A882D4C2684590C8019E36C2E964`

* Importer la clé publique de Wladimir van der Laan, vérifier le checksum signé et à nouveau l'empreinte juste au cas où la clé serait corrompue :  
  `$ gpg --import ./laanwj-releases.asc`  
  `$ gpg --verify SHA256SUMS.asc`  
  `> gpg: Good signature from Wladimir ...`  
  `> Primary key fingerprint: 01EA 5486 DE18 A882 D4C2  6845 90C8 019E 36C2 E964`  
:warning: Même remarque, si vous ne voyez pas `Good signature...`, c'est qu'il y a peut-être un problème, essayez d'abord de comprendre avant d'aller plus loin.

* Extraire le fichier binaire de l'archive que vous avez téléchargée (commande `tar`), puis l'installer et vérifier la version :  
  `$ tar -xvf bitcoin-0.16.2-arm-linux-gnueabihf.tar.gz`  
  `$ sudo install -m 0755 -o root -g root -t /usr/local/bin bitcoin-0.16.2/bin/*`  
  `$ bitcoind --version`  
  `> Bitcoin Core Daemon version v0.16.2`

### Premier lancement de Bitcoin Core
Nous allons utiliser le daemon de Bitcoin, “bitcoind”. Un daemon est une application qui tourne en arrière-plan sans interface graphique. Pour ce premier lancement, je vous propose d'ajouter l'option `--printtoconsole`, qui va écrire tout ce qu'il se passe :
`$ bitcoind --printtoconsole`

Attendez quelques instants pour vous assurer qu'il démarre correctement. Si vous ne comprenez rien à ce qui s'écrit dans le terminal, ce n'est pas grave, veillez simplement à ce que bitcoind ne quitte pas tout seul au bout de quelques secondes et que vous n'avez pas de message d'erreur (ils sont généralement facile à reconnaître).

Appuyez sur "Ctrl + c" pour arrêter Bitcoin (retenez cette combinaison, elle vous permet d'arrêter le programme en cours d'exécution dans le terminal). 

Bitcoind a créé un répertoire par défaut pour enregistrer toutes ses informations, `/home/bitcoin/.bitcoin`.

Si pour une raison quelconque ce répertoire par défaut ne vous convenait pas, vous pouvez toujours en créer un autre et dire à bitcoind de l'utiliser comme répertoire. Souvenez-vous, `cd` pour se déplacer, `mkdir` pour créer un répertoire. 

Instead of creating a real directory, we create a link that points to a directory on the external hard disk. 

* We add a symbolic link that points to the external hard disk.  
  `$ ln -s /mnt/hdd/bitcoin /home/bitcoin/.bitcoin`

* Navigate to the home directory an d check the symbolic link (the target must not be red). The content of this directory will actually be on the external hard disk.  
  `$ cd `  
  `$ ls -la`

![verify .bitcoin symlink](images/30_show_symlink.png)

### Configuration
Entrez dans le répertoire `.bitcoin` avec `$ cd .bitcoin`, puis `$ ls`. Vous devriez voir un fichier `bitcoin.conf`. Grâce à nano, nous allons ouvrir et modifier ce fichier (si le fichier n'y est pas, ne vous inquiétez pas nano va le créer pour vous) :  
`$ nano /home/bitcoin/.bitcoin/bitcoin.conf` (n'oubliez pas de mettre votre propre répertoire si vous n'avez pas gardé celui par défaut)

Maintenant, copiez-collez l'intégralité du texte ci-dessous, nous pourrons faire des modifications ensuite.

```bash
# /home/bitcoin/.bitcoin/bitcoin.conf

# Retirer la ligne ci-dessous pour activer Bitcoin sur le mainnet
testnet=1

# Ne touchez pas à ça
server=1
daemon=1
txindex=1
addresstype=p2sh-segwit

# Informations pour LND
zmqpubrawblock=tcp://127.0.0.1:28332
zmqpubrawtx=tcp://127.0.0.1:28332

# RAM consacrée à la base de données (en Mo), si vous faites la synchro initiale, montez-la au 3/4 de votre RAM disponible, sinon vous pouvez prendre une valeur plus basse
dbcache=1000

# Nombre de connexions maximum, comprenant 8 connexions "sortantes". À vous de voir selon votre machine et votre connexion internet, mais ce n'est pas la peine de mettre une valeur trop élevée
maxconnections=16
```

Pour neutraliser une ligne, vous n'avez pas besoin de l'effacer, vous pouvez simplement ajouter `#` devant elle. Le symbole `#` signifie que la ligne suivante est un commentaire et ne doit pas être prise en compte par le programme.

:point_right: vous trouverez plus d'informations sur le fichier de configuration [sur le Bitcoin wiki](https://en.bitcoin.it/wiki/Running_Bitcoin#Command-line_arguments).

### Configurer rpcauth

Nous devons créer un identifiant afin que bitcoind accepte d'exécuter les commandes que vous lui enverrez. Nous allons donc exécuter un petit programme avec la commande suivante :
`$ curl -sSL https://raw.githubusercontent.com/bitcoin/bitcoin/master/share/rpcauth/rpcauth.py | python - bitcoin`

En sortie, vous devriez voir quelque chose qui ressemble à ça :
```
String to be appended to bitcoin.conf:
rpcauth=sosthene:e6ddad141eaf206ea14e59496844745e$c624795dd4e42b4878e490c4b34cc5117338811f52762d2a7d5cc7d00a96164d
Your password:
viCrlZFPpKB1Wpt39tAklcqYr88xh7_d0XNMbGUZy2I=
```

Copiez la ligne qui commence par `rpcauth`, et exécutez la commande suivante (**en collant la ligne que vous avez obtenue à la place de la mienne bien sûr !** :
`$ echo 'rpcauth=sosthene:e6ddad141eaf206ea14e59496844745e$c624795dd4e42b4878e490c4b34cc5117338811f52762d2a7d5cc7d00a96164d' >> bitcoin.conf`

Quant au mot de passe, conservez-le il pourrait vous servir un jour si vous souhaitez faire des appels RPC depuis une autre machine (mais ce n'est vraiment pas la priorité pour le moment).

### Lancer bitcoind sur le testnet

Nous allons faire un premier test sans risque pour vous familiariser avec les commandes.

Si vous avez bien laissé la ligne `testnet=1` dans le fichier de configuration, vous pouvez lancer bitcoind :
`$ bitcoind`

Attendez quelques instants, et essayez les commandes suivantes :
`$ bitcoin-cli getblockchaininfo`
`$ bitcoin-cli getnetworkinfo`

![bitcoin-cli erreur](old_laptop_30_bitcoin-cli1.png)

Vous devriez voir un certain nombre d'informations, si vous ne comprenez rien ce n'est pas grave, l'essentiel c'est que vous n'ayez pas de message d'erreur. 

![bitcoin-cli getblockchaininfo](old_laptop_30_bitcoin-cli2.png)
_Remarquez que sur la première ligne, il y a `test`. Si nous étions sur le mainnet, ce serait `main`

![bitcoin-cli getnetworkinfo](old_laptop_30_bitcoin-cli3.png)

Pour avoir davantage d'informations, notamment si vous rencontrez des problèmes, vous pouvez suivre en temps réel les logs de bitcoind (c'est-à-dire, les messages générés à chaque événement) :
`$ tail -f /home/bitcoin/.bitcoin/testnet3/debug.log`

Quittez avec `Ctrl-C`.

### Apprendre les commandes de `bitcoin-cli`

Bitcoin-cli est le programme qui vous permet de communiquer avec votre noeud. Grâce à lui, vous pouvez lui donner des ordres très simples (comme les commandes que nous avons faites ci-dessus), mais aussi plus tard d'autres affreusement compliquées (comme construire vos propres transactions avec un contrôle total sur tous les paramètres). 

Les commandes sont toutes construites sur le modèle suivant :
`$ bitcoin-cli [commande] [argument 1] [argument 2] [argument n]`

Certaines commandes ne font qu'imprimer des informations à l'écran, d'autres provoquent l'exécution de certaines actions. 

Si vous voulez avoir la liste de toutes les commandes :
`$ bitcoin-cli help`

Pour avoir des instructions détaillées sur une commande en particulier :
`$ bitcoin-cli help [commande]`

:point_right: pour avoir plus d'informations sur les différentes commandes, vous pouvez aussi regardez [cette page](https://en.bitcoin.it/wiki/Original_Bitcoin_client/API_calls_list).

Jouez un petit peu avec les commandes en attendant que votre noeud de test soit synchronisé. Vous pouvez aussi demander des bitcoins de test sur un faucet, par exemple [ici](https://testnet.manu.backend.hamburg/faucet), mais il y en a d'autres. Cela vous permettra d'expérimenter les commandes de paiement, et aussi Lightning lors de la prochaine étape. 

Lorsque votre noeud est syunchronisé (et si vous êtes intéressé par Lightning), passez à l'étape suivante. 