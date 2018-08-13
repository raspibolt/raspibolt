[ [Intro](README.md) ] -- [ **Preparations** ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [Bonus](raspibolt_60_bonus.md) ] -- [ [FAQ](raspibolt_faq.md) ] -- [ [Updates](raspibolt_updates.md) ]

-------
### Un guide pour recycler votre vieux portable en noeud Bitcoin et ⚡Lightning️⚡
--------

# Préparation

## Pré-requis technique

Pour ce guide, j'ai décidé de recycler un de mes anciens ordinateurs portables. 

Votre ordinateur n'a certainement pas les mêmes caractéristiques que le mien, il n'y a donc pas beaucoup de sens à ce que je vous en parle. En revanche, je dois attirer votre attention sur quelques points précis qui vont nous permettre de nous assurer que votre ordinateur sera bien en mesure de faire tourner notre noeud !
* Processeur : si vous souhaitez faire la synchronisation initiale sur la machine-même, veillez à ce que votre machine dispose au minimum d'un quad-core de milieu-haut de gamme pas trop ancien. De mon expérience, un quad-core i7 de 2013 s'en sort à peu près honorablement, mais sur un vieux dual-core de 2009 c'était la catastrophe !
* RAM : De ma propre expérience, je dirai qu'avec 8Go de mémoire vive allouées en quasi-totalité à bitcoin, on ne s'en sort pas trop mal. Si vous avez moins de 4Go, cela risque d'être problématique. 
* Votre disque dur contient-il 500 Go ou davantage ? Si oui, vous pouvez envisager de vous passer d'un disque dur externe. Sinon, je vous conseille fortement d'investir dans un petit HDD de 500 Go minimum. Une alimentation externe est **fortement recommandée** (on parle d'un disque qui va rester sous tension H24, je ne fais pas confiance à l'alimentation fournie par la plupart des ports USB de laptop pour ce type d'utilisation). 
* Une connexion internet. Placez votre noeud dans un endroit où il capte bien le signal wifi de votre box. Si vous pouvez le brancher en filaire, c'est encore mieux. Là encore, voulez-vous synchronisez votre noeud directement sur cette machine ? Si oui, alors il vous faut une connection plutôt bonne car Bitcoin va télécharger plus de 200 Go en quelques heures/jours. Sinon, la consommation de Bitcoin en _run_ est très modeste. 

En fait, vous devez maintenant vous poser la question de la façon dont vous allez effectuer votre synchronisation initiale de la blockchain de Bitcoin, c'est-à-dire le téléchargement et la validation de l'intégralité de l'historique de transactions sur (quasiment) 10 ans !

En effet, c'est cette opération de synchronisation initiale qui peut être douloureuse pour des petites machines. Une fois synchronisé, la quantité d'informations à traiter par le noeud est très raisonnable et à la portée de machines vétustes et/ou modestes. 

Par conséquent, évaluez bien votre ordinateur avec les différents points ci-dessus pour déterminer s'il est raisonnable de lui faire effectuer cette opération. 

Si la réponse est négative, ce n'est pas grave, nous en reparlerons un peu plus bas. 

## Installer Linux

Vous êtes aujourd'hui probablement comme moi il n'y a pas si longtemps que ça : vous utilisez Windows, ou MacOS, vous trouvez que c'est très bien comme ça et vous ne vous êtes jamais posé la question de changer, surtout pas pour ce truc de _geeks_ qu'est Linux. 

Comme pour moi, installer un noeud Bitcoin sur votre vieux portable est donc l'occasion rêvée de vous y mettre !

De toutes façons, vous n'avez pas vraiment le choix :
* Si vous utilisez un ordinateur un peu ancien, Linux est bien plus léger que Windows qui a tendance à faire tourner un peu n'importe quoi en arrière-plan. Installez Linux augmentera significativement les performances que vous pourrez tirer d'un matériel obsolète. 
* Linux est bien supérieur à Windows en termes de sécurité et de stabilité, vous n'aurez pas à vous embêtez avec un antivirus et vous aurez beaucoup moins de plantages.
* Notre objectif est de mettre en place un serveur que vous pourrez interroger y compris quand vous n'êtes pas chez vous. Vous vous imaginez devoir rouvrir l'écran juste pour vérifier que tout va bien avec l'interface graphique ? Je comprends que les lignes de commande vous fassent peur, mais elles ont l'avantage d'être une interface très légère qui vous permettra de contrôler votre noeud à distance, même dans des conditions de connectivité limitées. 

La première étape pour vous sera donc de virer l'installation vétuste de Windows qui se trouve sur votre ancien ordinateur pour [mettre un Linux flambant neuf à la place](old_laptop_11_installLinux.md). 

Si vous êtes déjà un utilisateur de Linux, je vous laisse faire une nouvelle installation de votre distro préférée et passer directement à la suite. 

## Télécharger la blockchain de Bitcoin
La blockchain est ce fameux livre d'enregistrement de toutes les transactions jamais effectuées sur Bitcoin. Plus simplement, c'est un enregistrement complet et fiable de qui possède tant de bitcoins à un instant _t_. C'est évidemment une information cruciale, et vous ne voulez dépendre de personne d'autre pour l'obtenir !

Lorsque vous lancerez votre noeud tout neuf, il n'aura en mémoire que le block 0, ou _genesis block_, daté du 3 janvier 2009. La première tâche qu'il devra entreprendre sera donc de se synchroniser avec le reste du réseau, ce que l'on appelle une _synchronisation initiale_. 

Cette synchronisation initiale nécessite de réaliser les opérations suivantes :

* télécharger l'intégralité de la blockchain (plus de 200 Go en août 2018)
* valider l'intégralité des transactions ayant jamais eu lieu, ainsi que l'intégralité des blocs minés jusqu'à aujourd'hui
* réaliser un index de toutes les transactions (**Attention : cette opération n'est pas nécessaire pour notre noeud Bitcoin en tant que tel, mais est indispensable pour Lightning. Si vous n'êtes pas intéressé par Lightning, vous pouvez désactiver cet index, je vous expliquerai comment faire le moment venu**.
* Calculer et enregistrer la balance (ou _unspent transaction output_, souvent abrégé en _UTXO_) de toutes les adresses Bitcoin connues du réseau. 

:point_right: Vous pouvez vous référer à cet article (en anglais) pour plus d'informations [Running a Full Node](https://bitcoin.org/en/full-node).

Comme vous pouvez le voir, la synchronisation initiale est une opération assez lourde qui peut se heurter à trois limitations de votre machine :
* Bande-passante
* puissance processeur
* mémoire vive

Si vous êtes limité sur un de ces trois paramètres, la synchronisation peut prendre jusqu'à plusieurs semaines ! Il est alors beaucoup plus intéressant d'effectuer cette synchronisation initiale sur une machine plus puissante, et de donner une blockchain déjà validée à votre Zorilla, qui pourra ensuite valider les nouveaux blocs et les nouvelles transactions sans difficulté.

### Synchronisation initiale sur une autre machine
Je pars du principe que vous êtes sur Windows (désolé pour nos amis riches qui ont un Mac). De toutes façons installer Bitcoin Core n'a rien de compliqué. Autre bonne nouvelle : les données de Bitcoin sont parfaitement compatibles entre les différents systèmes d'exploitation. 

Le téléchargement peut se faire de préférence sur le disque dur interne (temps d'accès plus rapide) si vous avez suffisamment de place (attention la blockchain continue de grandir, pour mes lecteurs du futur vérifiez d'abord sa taille actuelle). Si vous avez prévu d'utiliser un disque dur externe, vous pouvez aussi faire directement la synchronisation sur le disque en question (mais dans ce cas-là il faudra faire attention à la compatibilité des différents formats de disque). 

Selon la configuration que vous choisirez, vous devrez :

* copier la blockchain depuis votre ordinateur Windows (ou Apple) vers votre Zorilla via le réseau local. 

* brancher directement le disque dur externe contenant les données sur le Zorilla.

###  Télécharger et installer Bitcoin Core
Bitcoin Core est l'implémentation de référence de Bitcoin. Comme Bitcoin est un logiciel libre, n'importe qui peut écrire sa propre version du logiciel, et plusieurs l'ont fait. Quand vous serez devenu un expert, vous pourrez expérimenter avec d'autres implémentations, mais en attendant il est plus sage de ne pas sortir des sentiers battus.

Télécharger le fichier d'installation de Bitcoin Core depuirs bitcoin.org/download et déplacez-le dans le répertoire dans lequel vous souhaitez télécharger la blockchain. 

Une bonne habiture à prendre est de vérifier l'authenticité d'un programme que vous venez de télécharger, surtout quand il y a potentiellement beaucoup d'argent en jeu. Pour ce faire, nous allons calculer son _checksum_ et le comparer avec celui fourni par le développeur du logiciel. Cela permet de s'assurer que ce que vous avez téléchargé est bien conforme au logiciel d'origine, et qu'il ne lui a pas été substitué une version piratée. 

Pour ce faire, nous allons utiliser la tant redoutée _console de commande_. Respirez profondément, tout va bien se passer. 

Chaque ligne que vous devez saisir sera précédée du signe `>`. Ainsi, si j'écris `> cd bitcoin` , vous ne devez saisir que `cd bitcoin` et presser entrée.

Pour ouvrir la console dans Windows, vous pouvez presser `Win+R`, saisir `cmd`, et presser `Entrée`. 

Une fois la console ouverte, la première chose à faire est d'ouvrir le répertoire dans lequel vous venez de déplacer le fichier d'installation de Bitcoin Core (si vous n'êtes pas sûr, vérifier où se trouve le répertoire dans une fenêtre).

Nous allons ensuite calculer le _checksum_ du programme que nous venons de télécharger. Voici toutes les commandes que vous devez saisir :
```
> G:
> cd \bitcoin [remplacer par le chemin de votre répertoire]
#> mkdir bitcoin_mainnet
#> dir
> certutil -hashfile bitcoin-0.16.2-win64-setup.exe sha256
7e37736eeab61d806e6c1563db61eea09243807bc379f11c4b47f1568d81113c
```
![Commande Windows : vérification du checksum](images/10_blockchain_wincheck.png)

Comparer la valeur que vous obtenez avec celle que vous trouverez [ici](https://bitcoin.org/bin/bitcoin-core-0.16.2/SHA256SUMS.asc) (**Attention, ce lien est pour la version 16.2, faites attention si vous télécharger une autre version**. Pour les fichiers Windows v0.16.2, vous devriez voir :
```
32 bit:  09d149f7c8ef972b2d384b0a3ac7604a2ff39d9b1ccee84022ee08523bd6d9ef
64 bit:  7e37736eeab61d806e6c1563db61eea09243807bc379f11c4b47f1568d81113c
```
Normalement, nous devrions aussi vérifier la signature du fichier, mais comme c'est un peu pénible sur Windows, nous le ferons tout à l'heure sur Lubuntu.

### Installer Bitcoin Core
Exécuter le fichier d'installation de Bitcoin Core (il est possible que deviez faire un clic-droit et à sélectionner "Exécuter en tant qu'administrateur") et lancer l'installation avec les paramètres par défaut. Lancez le programme `bitcoin-qt.exe` dans le répertoire "C:\Program Files\Bitcoin" (replacer par votre répertoire si différent). Choisissez “bitcoin” (ou le répertoire que vous souhaitez utiliser pour stocker les données de Bitcoin) comme répertoire de données (_data-dir_).

![Bitcoin Core directory selection](images/10_bitcoinqt_directory.png)

Bitcoin Core va démarrer après quelques instants et commencer immédiatement la synchronisation. **Attention**, si vous souhaitez installer un noeud Lightning, il est très important de construire un index de transactions (cf ci-dessus). Il faut donc dire à Bitcoin Core de réaliser cette tâche. Cela se fait en modifiant un fichier texte “bitcoin.conf” qui est automatiquement créé dans le répertoire de données au lancement de Bitcoin (si ce n'est pas le cas, vous pouvez aussi le créer vous-même, prenez simplement garde à le nommer correctement pour que Bitcoin le reconnaisse). 

Pour modifier ce fichier, nous allons ouvrir le menu, puis `Paramètres` / `Options` et cliquer sur le bouton `Ouvrir le fichier de configuration`. Saisissez alors la ligne suivante pour dire à Bitcoin que vous voulez qu'il construire un index de transactions :
```
txindex=1
```
Si votre ordinateur a suffisament de mémoire vive, augmenter la quantité dédiée à Bitcoin permettra une synchronisation plus rapide. Pour ajuster la quantité de mémoire que vous voulez consacrer à Bitcoin, vous pouvez saisir la ligne suivante dans le même fichier :
```
dbcache=6000
```
**Note** : la mémoire est exprimée en Mo. Ici, "6000" signifie donc 6000 Mo, soit _environ_ 6 Go.

Sauvegardez et fermez le fichier de configuration, quittez Bitcoin Core avec `Fichier` / `Quitter`, et relancez le programme. La synchronisation devrait reprendre là où elle s'était arrêtée. 

Voilà, vous pouvez désormais laisser la blockchain se synchroniser toute seule pendant que nous allons configurer notre Zorilla.

---
Next: [Raspberry Pi >>](raspibolt_20_pi.md)
