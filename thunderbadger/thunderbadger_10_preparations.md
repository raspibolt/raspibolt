[ [Intro](README.md) ] -- [ **Préparatifs** ] -- [ [Thunder Badger](thunderbadger_20_ThunderBadger.md) ] -- [ [Bitcoin](thunderbadger_30_bitcoin.md) ] -- [ [LND](thunderbadger_40_lnd.md) ] -- [ [Mainnet](thunderbadger_50_mainnet.md) ] -- [ [Bonus](thunderbadger_60_bonus.md) ]

-------
### Thunder Badger : un nœud Bitcoin et ⚡Lightning️⚡ dans votre vieux portable pourri !
--------

# Préparation

## Pré-requis technique

Pour ce guide, j'ai décidé de recycler un de mes anciens ordinateurs portables. Il s'agit d'un vieux HP de 2009 acheté dans une petite boutique d'informatique de Hangzhou, en Chine. Sa coque ne tient plus que par une ou deux vis, il n'a plus de batterie et dort au fond de mon placard depuis au moins 4 ans.

Il est le candidat parfait pour devenir notre premier Thunder Badger !

Votre ordinateur n'a certainement pas les mêmes caractéristiques que le mien, et je dois donc attirer votre attention sur quelques points précis qui vont nous permettre de nous assurer que votre ordinateur sera bien en mesure de devenir lui aussi un Thunder Badger (en tout cas sans trop d'encombres) !

* Processeur : si vous souhaitez faire la synchronisation initiale sur la machine-même, veillez à ce que votre machine dispose au minimum d'un quad-core de milieu-haut de gamme pas trop ancien. De mon expérience, un quad-core i7 de 2013 s'en sort à peu près honorablement, mais sur le vieux dual-core de mon Thunder Badger c'était la catastrophe !

* RAM : De ma propre expérience, je dirai qu'avec 8Go de mémoire vive allouées en quasi-totalité à bitcoin, on ne s'en sort pas trop mal. Si vous avez moins de 4Go, cela risque de vous ralentir considérablement pour la synchronisation initiale. En phase d'exécution Bitcoin Core et LND ne consomment presque rien, vous vous en sortirez très bien même avec 1Go de RAM.

* Votre disque dur contient-il 500Go ou davantage ? Si oui, vous pouvez envisager de vous passer d'un disque dur externe. Sinon, je vous conseille fortement d'investir dans un petit HDD de 500Go minimum. Si vous avez davantage de moyens et que vous êtes bricoleur, vous pouvez même carrément changer le disque dur interne pour un SDD, ce qui améliorera sensiblement les performances générales (mais pensez bien à prendre au moins 500Go).

* Une connexion internet. Placez votre nœud dans un endroit où il capte bien le signal wifi de votre box. Si vous pouvez le brancher en filaire, c'est encore mieux. Là encore, voulez-vous synchroniser votre nœud directement sur cette machine ? Si oui, alors il vous faut une connection plutôt bonne car Bitcoin va télécharger plus de 200 Go en quelques heures/jours. Sinon, la consommation de Bitcoin en _exécution_ est très modeste.

En fait, vous devez maintenant vous poser la question de la façon dont vous allez effectuer votre synchronisation initiale de la blockchain de Bitcoin, c'est-à-dire le téléchargement et la validation de l'intégralité de l'historique de transactions sur (quasiment) 10 ans !

En effet, c'est cette opération de synchronisation initiale qui peut être douloureuse pour des petites machines. Une fois synchronisé, la quantité d'informations à traiter par le nœud est très raisonnable et à la portée de machines vétustes et/ou modestes. 

Par conséquent, évaluez bien votre ordinateur avec les différents points ci-dessus pour déterminer s'il est raisonnable de lui faire effectuer cette opération. 

Dans ce guide, je vais partir du principe que la synchronisation initiale sera faite sur une machine à part, non seulement car je pense que ce sera souvent plus raisonnable (sauf si vous êtes très riche et que vous changez d'ordinateur haut-de-gamme tous les 2 ans :smile:), mais aussi car cela nous permet de jouer un peu avec le testnet pendant la synchronisation initiale.

## Installer Linux

Vous êtes aujourd'hui probablement comme moi il n'y a pas si longtemps que ça : vous utilisez Windows, ou MacOS, vous trouvez que c'est très bien comme ça et vous ne vous êtes jamais posé la question de changer, surtout pas pour ce truc de _geeks_ qu'est Linux. 

Comme pour moi, installer un nœud Bitcoin sur votre vieux portable est donc l'occasion rêvée de vous y mettre !

De toutes façons, vous n'avez pas vraiment le choix :
* Si vous utilisez un ordinateur un peu ancien, Linux est bien plus léger que Windows qui a tendance à faire tourner un peu n'importe quoi en arrière-plan. Installer Linux augmentera significativement les performances que vous pourrez tirer d'un matériel obsolète. 

* Linux est bien supérieur à Windows en termes de sécurité et de stabilité, vous n'aurez pas à vous embêtez avec un antivirus et vous aurez beaucoup moins de plantages.

* Notre objectif est de mettre en place un serveur que vous pourrez interroger y compris quand vous n'êtes pas chez vous. Vous vous imaginez devoir rouvrir l'écran juste pour vérifier que tout va bien avec l'interface graphique ? Je comprends que les lignes de commande vous fassent peur, mais elles ont l'avantage d'être une interface très légère qui vous permettra de contrôler votre nœud à distance, même dans des conditions de connectivité limitée. 

La première étape pour vous sera donc de virer l'installation vétuste de Windows qui se trouve sur votre ancien ordinateur pour [mettre un Linux flambant neuf à la place](thunderbadger_11_installLinux.md). 

Si vous êtes déjà un utilisateur de Linux, je vous laisse faire une nouvelle installation de votre distro préférée et passer directement à la suite. 

## Télécharger la blockchain de Bitcoin
La blockchain est ce fameux livre d'enregistrement de toutes les transactions jamais effectuées sur Bitcoin. Plus simplement, c'est un enregistrement complet et fiable de qui possède tant de bitcoins à un instant _t_. C'est évidemment une information cruciale, et vous ne voulez dépendre de personne d'autre pour l'obtenir !

Lorsque vous lancerez votre nœud tout neuf, il n'aura en mémoire que le block 0, ou _genesis block_, daté du 3 janvier 2009. La première tâche qu'il devra entreprendre sera donc de se synchroniser avec le reste du réseau, ce que l'on appelle une _synchronisation initiale_. 

Cette synchronisation initiale nécessite de réaliser les opérations suivantes :

* télécharger l'intégralité de la blockchain (plus de 200 Go en août 2018),

* valider l'intégralité des transactions ayant jamais eu lieu, ainsi que l'intégralité des blocs minés jusqu'à aujourd'hui,

* réaliser un index de toutes les transactions,

* calculer et enregistrer la balance (ou _unspent transaction output_, souvent abrégé en _UTXO_) de toutes les adresses Bitcoin connues du réseau. 

:point_right: Vous pouvez vous référer à cet article (en anglais) pour plus d'informations [Running a Full Node](https://bitcoin.org/en/full-node).

Comme vous pouvez le voir, la synchronisation initiale est une opération assez lourde qui peut se heurter à trois limitations de votre machine :
* bande-passante de votre connexion internet
* puissance processeur
* mémoire vive

Si vous êtes limité sur un de ces trois paramètres, la synchronisation peut prendre jusqu'à plusieurs semaines ! Il est alors beaucoup plus intéressant d'effectuer cette synchronisation initiale sur une machine plus puissante, et de donner une blockchain déjà validée à votre Thunder Badger, qui pourra ensuite valider les nouveaux blocs et les nouvelles transactions sans broncher.

### Synchronisation initiale sur une autre machine

Je pars du principe que vous êtes sur Windows (désolé pour nos amis riches qui ont un Mac). Installer Bitcoin Core n'a rien de compliqué, vous devriez trouver sans problèmes l'équivalent du tuto ci-dessous pour Mac. 

Bonne nouvelle : les données de Bitcoin sont parfaitement compatibles entre les différents systèmes d'exploitation, aucune question à se poser de ce point de vue. 

Le plus simple est donc de télécharger la blockchain sur le disque dur interne (temps d'accès plus rapide) si vous avez suffisamment de place (attention la blockchain continue de grandir, pour mes lecteurs du futur vérifiez d'abord sa taille actuelle), puis de copier ensuite les données sur le Thunder Badger via la commande `scp`. 

Si vous avez prévu d'utiliser un disque dur externe, vous pourriez aussi faire directement la synchronisation sur le disque en question, mais cela risque de poser des problèmes de compatibilité (avec Ubuntu nous formatons le disque dur au format ext4, qui n'est pas lu par Windows). Mais si votre ordinateur principal est déjà sous Linux, cela peut être une bonne option.  

###  Télécharger et installer Bitcoin Core

Bitcoin Core est l'implémentation de référence de Bitcoin. Comme Bitcoin est un logiciel libre, n'importe qui peut écrire sa propre version du logiciel, et plusieurs l'ont déjà fait. Quand vous serez devenu un expert, vous pourrez expérimenter avec d'autres implémentations, mais en attendant il est plus sage de ne pas sortir des sentiers battus.

Télécharger le fichier d'installation de Bitcoin Core depuirs [bitcoin.org/download](https://bitcoincore.org/en/download/) et déplacez-le dans le répertoire dans lequel vous souhaitez télécharger la blockchain. 

Une bonne habitude à prendre est de vérifier l'authenticité d'un programme que vous venez de télécharger, surtout quand il y a potentiellement beaucoup d'argent en jeu. Pour ce faire, nous allons calculer son _checksum_ et le comparer avec celui fourni par le développeur du logiciel. Cela permet de s'assurer que ce que vous avez téléchargé est bien conforme au logiciel d'origine, et qu'il ne lui a pas été substitué une version piratée. 

Pour ce faire, nous allons utiliser la tant redoutée _console de commande_. Respirez profondément, tout va bien se passer. 

Dans le terminal de Windows, chaque ligne que vous devez saisir sera précédée du signe `>`. Ainsi, si j'écris `> cd bitcoin` , vous ne devez saisir que `cd bitcoin` et presser Entrée.

Pour ouvrir la console dans Windows, vous pouvez presser `Win+R`, saisir `cmd`, et presser Entrée. 

Une fois la console ouverte, la première chose à faire est d'ouvrir le répertoire dans lequel vous venez de déplacer le fichier d'installation de Bitcoin Core (si vous n'êtes pas sûr, vérifiez où se trouve le répertoire dans une fenêtre).

Nous allons ensuite calculer le _checksum_ du programme que nous venons de télécharger. En supposant que vous allez utiliser le disque D:, voici toutes les commandes que vous devez saisir :
```
> D:
> cd \bitcoin [remplacer par le chemin de votre répertoire]
#> mkdir bitcoin_mainnet
#> dir
> certutil -hashfile bitcoin-0.17.0-win64-setup.exe sha256
b37f738ab17a93e24028fa74280b74c353653cf03fc2fb7da6ead8669e440b1a
```
![Commande Windows : vérification du checksum](images/10_blockchain_wincheck.png)

Comparer la valeur que vous obtenez avec celle que vous trouverez [ici](https://bitcoincore.org/bin/bitcoin-core-0.17.0/SHA256SUMS.asc) (**Attention, ce lien est pour la version 17.0, faites attention si vous téléchargez une autre version**. Pour les fichiers Windows v0.17.0, vous devriez voir :
```
1f4091f6f32685aac3f790edae8657abe0c96448720b165762399a31499f8ee7  bitcoin-0.17.0-win32-setup.exe
b37f738ab17a93e24028fa74280b74c353653cf03fc2fb7da6ead8669e440b1a  bitcoin-0.17.0-win64-setup.exe
```

### Installer Bitcoin Core
Exécuter le fichier d'installation de Bitcoin Core (clic-droit et "Exécuter en tant qu'administrateur") et lancer l'installation avec les paramètres par défaut. Lancez le programme `bitcoin-qt.exe` qui se trouve par défaut dans le répertoire "C:\Program Files\Bitcoin". Choisissez “D:\bitcoin_mainnet”  comme répertoire de données (_data-dir_).

![Bitcoin Core directory selection](images/10_bitcoinqt_directory.png)

Bitcoin Core va démarrer après quelques instants et commencer immédiatement la synchronisation. **Attention**, si vous souhaitez installer un nœud Lightning, il est très important de construire un index de transactions (cf ci-dessus). Il faut donc dire à Bitcoin Core de réaliser cette tâche. Cela se fait en modifiant un fichier texte “bitcoin.conf” qui est automatiquement créé dans le répertoire de données au lancement de Bitcoin (si ce n'est pas le cas, vous pouvez aussi le créer vous-même, prenez simplement garde à le nommer correctement pour que Bitcoin le reconnaisse). 

Pour modifier ce fichier, nous allons ouvrir le menu, puis `Paramètres` / `Options` et cliquer sur le bouton `Ouvrir le fichier de configuration`. Saisissez alors la ligne suivante pour dire à Bitcoin que vous voulez qu'il construise un index de transactions :

`txindex=1`

Si votre ordinateur a suffisament de mémoire vive, augmenter la quantité dédiée à Bitcoin permettra une synchronisation plus rapide. Pour ajuster la quantité de mémoire que vous voulez consacrer à Bitcoin, vous pouvez saisir la ligne suivante dans le même fichier :

`dbcache=6000`

**Note** : la mémoire est exprimée en Mo. Ici, "6000" signifie donc 6000 Mo, soit _environ_ 6 Go. Ajustez évidemment selon votre cas.

Sauvegardez et fermez le fichier de configuration, quittez Bitcoin Core avec `Fichier` / `Quitter`, et relancez le programme.

Voilà, vous pouvez désormais laisser la blockchain se synchroniser toute seule pendant que nous allons configurer notre Thunder Badger.

---

[ [Page précédente](README.md) ] -- [ [Page suivante](thunderbadger_20_ThunderBadger.md) ]
