[ [Intro](README.md) ] -- [ [Préparatifs](thunderbadger_10_preparations.md) ] -- [ [Thunder Badger](thunderbadger_20_ThunderBadger.md) ] -- [ [Bitcoin](thunderbadger_30_bitcoin.md) ] -- [ [LND](thunderbadger_40_lnd.md) ] -- [ [Mainnet](thunderbadger_50_mainnet.md) ] -- [ **Bonus** ]

------

### Thunder Badger : un nœud Bitcoin et ⚡Lightning️⚡ dans votre vieux portable pourri !

------

## Bonus : Tor

*Difficulté: moyenne*

### Qu'est-ce que Tor ?

Tor est un logiciel libre d'anonymisation de trafic internet, dont le principe est de faire transiter une information par un certain nombre de relais afin de masquer l'emplacement respectif des points de départ et d'arrivée. 

Il fonctionne sur le principe d'un "réseau en oignon" : l'information est encryptée avec plusieurs clés publiques appartenant aux différents relais par lesquels elle transite. Chaque relai décrypte la couche correspondant à sa clé privée avant de la passer au suivant, d'où le terme "oignon".

:point_right: Pour en savoir plus : [https://fr.wikipedia.org/wiki/Tor_(r%C3%A9seau)](https://fr.wikipedia.org/wiki/Tor_(r%C3%A9seau))

### Pourquoi utiliser Tor ?

Tor est principalement utilisé afin d'assurer une relative immunité contre l'analyse de trafic, qui permet par la simple analyse de votre activité sur internet (quels sites vous visitez, quels services vous utilisez, combien de temps etc) d'apprendre énormément de choses sur votre vie et vos centres d'intérêt. Ce type d'analyse est évidemment massivement utilisé par les publicitaires, au premier rang desquels Google, mais peut aussi être utilisé par des acteurs malveillant, étatiques ou criminels, afin de vous nuire. 

Un autre usage de Tor est de permettre la mise à disposition d'informations sans révéler son emplacement et son identité, et c'est cet usage qui nous intéresse davantage dans le cas de Bitcoin. 

Sans rentrer dans toutes les raisons que vous pourriez avoir d'utiliser Tor, voici celles qui me semblent pertinentes par rapport à l'utilisation de Bitcoin : 
* En exposant l'adresse IP de votre domicile avec votre nœud, vous dites à tout le monde "il y a un nœud Bitcoin dans cette maison". Certains pourraient en déduire qu'il y a aussi des bitcoins, faisant de vous et de vos proches une cible potentielle pour des malfaiteurs.
* Cela pourrait un jour également attirer un autre type de voleurs, notamment dans l'hypothèse d'une véritable interdiction de la possession de bitcoins...
* Cela vous permet sans doute de gagner un peu en confidentialité pour vos transactions (à la condition évidemment de prendre d'autres mesures pour anonymiser vos UTXO, sans quoi l'analyse de chaîne risque de vous rattrapper très vite).

Tous ces arguments s'appliquent évidemment aussi à Lightning, dissimuler son nœud Bitcoin derrière Tor n'a en effet que peu d'intérêt si vous ne faites pas de même avec votre nœud Lightning, car sa présence est un indice fort de celle d'un nœud Bitcoin.

### Installer Tor

Connectez-vous via ssh en tant que admin :
`$ ssh admin@[VOTRE_IP]`

Les instruction d'installation de Tor se trouve à l'adresse suivante : [https://www.torproject.org/docs/debian.html.en#ubuntu](https://www.torproject.org/docs/debian.html.en#ubuntu)

```
# Ajoutez le repo du torproject dans /etc/apt/sources.list
$ sudo echo 'deb https://deb.torproject.org/torproject.org bionic main' >> /etc/apt/sources.list
$ sudo echo 'deb-src https://deb.torproject.org/torproject.org bionic main' >> /etc/apt/sources.list

# Afin de pouvoir vérifier l'intégrité des fichiers, nous allons également télécharger les clés du torproject
$ gpg2 --recv A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89
$ gpg2 --export A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89 | apt-key add -

# Nous allons maintenant installer la dernière version de Tor
$ sudo apt update
$ sudo install tor deb.torproject.org-keyring
```

Arrivé à cette étape, Tor devrait déjà être actif sur votre ordinateur.
```
# Vérifiez qu'un service "tor" a bien été créé et qu'il est actif
$ systemctl status tor.service

# Ouvrez le fichier tor-service-defaults-torrc, vérifiez que "user" est bien "debian-tor"
$ cat /usr/share/tor/tor-service-defaults-torrc

# Vérifiez les utilisateurs correspondants au groupe
$ cat /etc/group | grep debian-tor
> debian-tor:x:123:bitcoin

# Si l'utilisateur "bitcoin" n'apparaît pas comme ci-dessus
$ sudo adduser bitcoin debian-tor
$ cat /etc/group | grep debian-tor
> debian-tor:x:123:bitcoin

# Enfin, il faut activer une option dans /etc/tor/torrc
$ nano /etc/tor/torrc
> #ControlPort 9051 (retirez le "#")
> #CookieAuthentication 1 (idem)
# Ajoutez cette ligne si vous ne la trouvez pas dans le fichier
> CookieAuthFileGroupReadable 1

# Redémarrez tor.service pour que le changement soit pris en compte
$ sudo systemctl restart tor.service
```

### Configurer Bitcoin Core

Ouvrez une nouvelle session avec l'utilisateur "bitcoin". Tout d'abord, arrêtez Bitcoin Core :  
`$ bitcoin-cli stop`

Nous allons désormais ajouter les lignes suivantes dans `bitcoin.conf` :
```
proxy=127.0.0.1:9050
bind=127.0.0.1
listenonion=1
```
Redémarrez Bitcoin Core pour que les changements soient pris en compte :
`$ nohup bitcoind`

:point_right: Une [très bonne vidéo](https://youtu.be/57GW5Q2jdvw) qui montre (presque) le même processus

### Configurer LND

:warning: LND ne fonctionnera qu'avec **la version 3.6.6 ou supérieure de Tor**. Si vous avez bien respecté mes instructions ci-dessus, vous ne devriez pas avoir de problème.  
:warning: Je vous recommande d'utiliser dans la mesure du possible un nouveau nœud, ou au minimum de fermer tous vos canaux existant avant de passer sur Tor. En effet, je pense que si votre clé publique est déjà connue par d'autres pairs avec votre URL, il leur sera toujours possible de vous reconnaître même derrière Tor. Je n'ai toutefois jamais rien lu sur le sujet, et je suis preneur de toute information qui confirmerait ou invaliderait mes craintes. 

Toujours avec l'utilisateur "bitcoin", arrêtez LND :  
`$ lncli stop`

Ouvrez le fichier de configuration :  
`$ nano .lnd/lnd.conf`

Ajoutez les lignes suivantes :
```
tor.active=1
tor.v3=1
listen=localhost
```

Redémarrez LND comme d'habitude :
```
$ nohup lnd
$ lncli unlock
```

:point_right: Plus d'information [ici](https://github.com/lightningnetwork/lnd/blob/master/docs/configuring_tor.md).

### Comment vérifier que le trafic est bien masqué derrière Tor ?

1. Bitcoin :
* Vous pouvez vérifier la présence de certaines lignes dans le fichier `debug.log` au démarrage de bitcoind :
```
InitParameterInteraction: parameter interaction: -proxy set -> setting -upnp=0
InitParameterInteraction: parameter interaction: -proxy set -> setting -discover=0
[...]
torcontrol thread start
[...]
tor: Got service ID [VOTRE_ID] advertising service [VOTRE_ID]:8333
addlocal([VOTRE_ID].onion:8333,4)
```

![startup](./images/69_startup.png)

![startup2](./images/69_startup2.png)
	
* Vous pouvez aussi contrôler les informations retournées par la commande `getnetworkinfo` :

![networkinfo](./images/69_networkinfo.png)

On voit ici que les 3 réseaux sont liés au proxy `127.0.0.1:9050`, qui correspond à Tor. On voit également que le réseau `onion` est ouvert grâce à la ligne `reachable: true`.

* Enfin, vous pouvez également vérifier l'adresse à laquelle vos pairs vous voient grâce à cette commande (pour faire le `|`, Alt Gr + 6)  :  
`$ bitcoin-cli getpeerinfo | grep  local`

Vous devriez voir une liste d'adresse IP inconnues. Si vous voyez encore votre véritable adresse IP publique dans cette liste, cela signifie **qu'un de vos pairs est connecté avec vous sans passer par le réseau Tor, et donc que votre adresse IP est visible par le réseau**.

2. LND
* Votre adresse IP ne devrait plus apparaître avec les commandes `lncli getinfo` ou `lncli getnodeinfo [VOTRE_CLÉ_PUBLIQUE]`

### Aller plus loin

Vos nœuds Bitcoin et Lightning sont désormais en contact avec le reste du monde via le réseau Tor, et donc beaucoup plus difficile à repérer et à associer à votre emplacement physique. 

Il faut néanmoins avoir conscience que Tor [n'est pas une panacée](https://security.stackexchange.com/questions/147402/how-do-traffic-correlation-attacks-against-tor-users-work), et reste vulnérable à un certain nombre d'attaques qui peuvent aller de la simple interruption du service à la désanonymisation complète de l'utilisateur.

J'espère que la configuration que j'ai proposée ici constitue un bon compromis entre performance et sécurité pour un utilisateur exposé à des risques disons "normaux".

Toutefois, vous pouvez choisir de diminuer encore davantage votre exposition au prix d'une plus grande difficulté à contacter d'autres nœuds (et donc potentiellement au risque de vous retrouver isolé du reste du réseau).

Pour ce faire, vous pouvez par exemple :

* N'accepter que les connexions avec d'autres nœuds ayant une adresse en `.onion` :

Dans `bitcoin.conf`, ajoutez la ligne suivante :
`onlynet=onion`

Vous ne pouvez désormais vous connecter qu'à des pairs qui possèdent une adresse en `.onion`.

* Désactiver totalement la recherche de pairs via DNS :

Dans `bitcoin.conf`, ajoutez les lignes suivantes :
```
dnsseed=0
dns=0
```

Si vous ne savez pas ce que signifie DNS, vous pouvez [lire la page Wikipédia](https://fr.wikipedia.org/wiki/Domain_Name_System).

Avec cette configuration, votre nœud est incapable de trouver des pairs par lui-même. C'est pourquoi il est vital de lui fournir une liste de quelques nœuds à contacter au lancement en ajoutant la ligne suivante toujours dans `bitcoin.conf` :

`addnode=[ADRESSE].onion(:port)`

Il faut ajouter une ligne par adresse. Vous pouvez trouver des listes en ligne, par exemple sur [cette page](https://bitcoin.stackexchange.com/questions/70069/how-can-i-setup-bitcoin-to-be-anonymous-with-tor), mais personnellement je trouve que cela crée d'autres risques...

Pensez bien à redémarrer bitcoind pour que vos changements soient pris en compte. 

---

<< Back: [Bonus](thunderbadger_60_bonus.md) 
