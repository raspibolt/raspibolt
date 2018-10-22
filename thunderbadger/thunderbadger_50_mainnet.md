[ [Intro](README.md) ] -- [ [Préparatifs](thunderbadger_10_preparations.md) ] -- [ [Thunder Badger](thunderbadger_20_ThunderBadger.md) ] -- [ [Bitcoin](thunderbadger_30_bitcoin.md) ] -- [ [LND](thunderbadger_40_lnd.md) ] -- [ **Mainnet** ] -- [ [Bonus](thunderbadger_60_bonus.md) ]

-------
### Thunder Badger : un nœud Bitcoin et ⚡Lightning️⚡ dans votre vieux portable pourri !
--------

# Mainnet

Vous êtes suffisamment à l'aise pour commencer à jouer avec des vrais bitcoins ? Alors allons-y. 

:warning: **Avertissement** : ce guide est fourni sans aucune garantie, les logiciels décrits sont encore en développement et le guide lui-même peut contenir des erreurs, qui peuvent avoir pour conséquence la perte de vos bitcoins. Soyez prudent, en particulier en utilisant Lightning, et **n'envoyez sur le réseau que des petites sommes que vous pouvez vous permettre de perdre**.

## Copier la blockchain de Bitcoin

Notre installation actuelle utilise le testnet. Mais si vous vous souvenez, au début de ce guide je vous avais proposé de télécharger la blockchain de Bitcoin sur un autre ordinateur plus performant. 

Vous pouvez suivre les progrès de la synchronisation directement sur ce dernier. Pour pouvoir continuer, il faut que la synchronisation initiale soit complète. 

Dès que la synchronisation est terminée, vous pouvez éteindre Bitcoin Core. Nous allons ensuite copier l'intégralité des données vers le Thunder Badger, ce qui devrait prendre 6 heures environ.

### Activer temporairement l'authentification par mot de passe

Vous vous souvenez que nous avions configuré SSH pour ne plus avoir à saisir notre mot de passe lors de la connexion. Et bien nous allons temporairement réactiver le mot de passe pour pouvoir effectuer la copie de données.

* En tant que l'utilisateur "admin", modifiez le fichier de configuration de SSH en ajoutant un `#` devant `PasswordAuthentication no`, ce qui permet d'en faire un commentaire et donc de le désactiver. Enregistrez vos modifications.  
`$ sudo nano /etc/ssh/sshd_config`  
`#PasswordAuthentication no` 

* Pour que le changement soit effectif, vous devez ensuite redémarrer le service SSH.  
`$ sudo systemctl restart ssh`
  
### Copier avec WinSCP

Nous allons utiliser "Secure Copy" (SCP). Sous Windows, vous devez [télécharger et installer WinSCP](https://winscp.net), un petit programme open-source.

* Avec WinSCP, vous pouvez désormais vous connecter à votre Thunder Badger avec l'utilisateur "bitcoin".  
![WinSCP connection settings](images/50_WinSCP_connection.png)

* Accepter le certificat du serveur et naviguer jusqu'au répertoire bitcoin des deux machines, locale (windows) et distante (Thunder Badger) :  
  * Locale : `D:\bitcoin\bitcoin_mainnet\` (ou le dossier que vous avez vous-mêmes choisi)
  * Distante : `\home\bitcoin\.bitcoin`   

* Vous pouvez maintenant lancer la copie des deux sous-répertoires `blocks` et `chainstate`. L'opération devrait prendre environ 6 heures.  
![WinSCP copy](images/50_WinSCP_copy.png)

:warning: **Un transfert "Secure Copy" ne doit pas être interrompu**. Pensez notamment à désactiver la mise en veille des deux machines et à vous assurer qu'elles sont bien branchées et ne risquent pas de s'éteindre. 

:point_right: Si l'ordinateur sur lequel vous avez téléchargé la blockchain est déjà sous Linux, vous pouvez utiliser la commande `rsync` au lieu de `scp`. Plus performante, cette dernière a notamment l'avantage de permettre l'interruption du téléchargement.

_To Do : chercher une meilleure alternative, par exemple une qui pourrait utiliser rsync_

### Désactiver à nouveau l'authentification par mot de passe

* Sur votre Thunder Badger, en tant qu'utilisateur "admin", vous pouvez à nouveau supprimer le `#` devant "PasswordAuthentication no". Enregistrez vos modifications.  
  `$ sudo nano /etc/ssh/sshd_config`  
  `PasswordAuthentication no` 

* Redémarrez le service SSH.  
  `$ sudo systemctl restart ssh`

## Renvoyez vos bitcoins testnet

Il est de coûtume de renvoyer les bitcoins du testnet dont nous n'avons plus usage afin que d'autres utilisateurs puissent les utiliser. Si vous avez terminé avec le testnet, vous pouvez donc fermer tous vos canaux de paiement et renvoyer les fonds disponibles dans votre portefeuille sur l'adresse indiquée par [le faucet]([Bitcoin Testnet Faucet](https://testnet.manu.backend.hamburg/faucet).  

* `$ su bitcoin` (tapez le mot de passe de l'utilisateur "bitcoin")
* `$ lncli closeallchannels`

* Il faut ensuite attendre quelques temps pour que tous les canaux se ferment et que les fonds soient à nouveau disponibles (cela dépend notamment du fait que vos pairs sont en ligne ou non, s'ils sont hors-ligne la fermeture d'un canal peut être assez longue). Vérifiez que les fonds sont bien tous arrivés sur votre portefeuille avec les commandes suivantes :  
  `$ lncli channelbalance`  (doit être à 0)  
  `$ lncli walletbalance`

* Envoyez le montant indiqué par `walletbalance` moins 500 satoshis pour les frais de transactions. Si vous voyez une erreur `insufficient funds`, réessayez en enlevant un peu plus de satoshis jusqu'à ce que la transaction passe.  
  `$ lncli sendcoins [ADRESSE] [MONTANT]`

## Ajustez la configuration 

* Arrêtez Bitcoin et Lightning.  
  `$ lncli stop`   
  `$ bitcoin-cli stop` 
  
* Modifiez "bitcoin.conf" en ajoutant un `#` devant `testnet=1`. Enregistrez et fermez le fichier.  
`$ nano /home/bitcoin/.bitcoin/bitcoin.conf`  
`#testnet=1` 

* Modifiez "lnd.conf" en ajoutant `#` devant `bitcoin.testnet=1` et en le retirant de `bitcoin.mainnet=1`. Enregistrez et quittez.  
`$ nano /home/bitcoin/.lnd/lnd.conf`  
```
# enable either testnet or mainnet
#bitcoin.testnet=1
bitcoin.mainnet=1
```
## Redémarrez bitcoind & lnd sur le mainnet

:warning: **Attendez que la copie de la blockchain soit terminée pour poursuivre**.

* Démarrez Bitcoind et vérifiez que vous êtes bien sur le mainnet  

  `$ nohup bitcoind`  
  `$ tail -f /home/bitcoin/.bitcoin/debug.log`  (quittez avec `Ctrl-C`)  
  `$ bitcoin-cli getblockchaininfo` 

* **Vérifiez que vous êtes bien synchronisé** : il faut que la valeur indiquée derrière "blocks" soit égale à celle de "headers", si vous lancez LND alors que ce n'est pas le cas cela pourrait poser quelques problèmes.

* Démarrez LND et vérifiez que tout fonctionne

  `$ nohup lnd`  
  `$ tail -f /home/bitcoin/.lnd/logs/bitcoin/mainnet/lnd.log`  

* Si tout à l'air de fonctionner, arrêtez tout et redémarrez le Thunder Badger. Répétez les commandes ci-dessus et assurez-vous qu'il n'y a pas d'erreur.  
  `$ sudo shutdown -r now`  

* Créer un portefeuille pour le mainnet en utilisant **le même mot de passe** #3 que pour le testnet.  
  `$ lncli create`  

* Redémarrez `lnd` et déverouillez votre portefeuille (entrez le mot de passe)  
  `$ lncli stop`  
  `$ nohup lnd`  
  `$ lncli unlock`   

* Vous pouvez maintenant suivre la synchronisation initiale de LND. Cela peut prendre jusqu'à 2 heures.    
  `$ tail -f /home/bitcoin/.lnd/logs/bitcoin/mainnet/lnd.log`

* Vérifiez que la commande `lncli` fonctionne   
  `$ lncli getinfo`

:point_right: **Important** : il est nécessaire de déverouiller manuellement le portefeuille LND à chaque lancement. 

:warning: si vous avez un message d'erreur sur les commandes `lncli`, c'est peut-être que vous avez créé un alias pour éviter de retaper `--network=testnet`. Dans ce cas, ouvrez le fichier `.bash_aliases` et supprimez l'alias :  
`$ nano .bash_aliases`  
`$ source .bashrc`

## Se lancer sur le réseau Lightning

### Approvisionner le portefeuille de LND

Félicitations, le Thunder Badger est désormais opérationnel sur le mainnet ! Pour ouvrir des canaux de paiement, vous aurez besoin de bitcoins, comme sur le testnet, sauf que cette fois-ci on ne joue plus avec des billets de Monopoly ! Par prudence, ne mettez donc dans un premier temps qu'une petite somme que vous pouvez perdre sans vous mettre en danger.

* Générez une adresse pour recevoir les bitcoins _on-chain_.
`$ lncli newaddress np2wkh`   
`> "address": "3.........................."`

* Depuis le portefeuille de Bitcoin Core, envoyez une petite somme sur l'adresse ci-dessus.
`$ bitcoin-cli sendtoaddress [ADRESSE] [MONTANT BTC]`

* Vérifiez votre portefeuille LND.  
`$ lncli walletbalance`

* Si besoin, vous pouvez suivre votre transaction sur un explorateur de blockchain, par exemple [https://oxt.me/](https://oxt.me/). Il suffit de copier coller le `txid` que bitcoin-cli vous a donné lorsque vous avez réalisé la transaction.

### LND en action

Si vous avez activé "Autopilot" dans le fichier `lnd.conf`, LND commencera à créer des canaux de paiements aussitôt que votre transaction aura été minée et confirmée. Sinon vous pouvez désactiver l'autopilote et créer les canaux vous-mêmes, les commandes sont les mêmes que celles que nous avons vues pour le testnet. 

Pour étrenner votre nœud Lightning tout neuf, vous pouvez envoyer quelques sats à :  
* [Stadicus](https://mainnet.yalls.org/articles/97d67df1-d721-417d-a6c0-11d793739be9:0965AC5E-56CD-4870-9041-E69616660E6F/70858a49-d91c-40fb-ae34-bddc2e938704) l'auteur des deux guides pionniers [Raspibolt](https://github.com/Stadicus/guides/tree/master/raspibolt) et [Thundroid](https://github.com/Stadicus/guides/tree/master/thundroid),
* [Moi-même](https://www.sosthene.net/tip/), qui ai adapté ces guides en français pour le Thunder Badger.
* L'une des personnes qui a contribué à ce guide :
	* ...
	* ...
* ...quelqu'un que vous aimez bien !

### Explorer le réseau Lightning sur le mainnet

Il y a déjà un certain nombre de ressources pour vous aider à explorer le monde balbutiant de Lightning :

* [Recksplorer](https://rompert.com/recksplorer/): une carte du réseau Lightning
* [1ML](https://1ml.com): un moteur de recherche et d'analyse du réseau
* [lnroute.com](http://lnroute.com): une liste très complète des ressources disponibles

---

[ [Page précédente](thunderbadger_40_lnd.md) ] -- [ [Page suivante](thunderbadger_60_bonus.md) ]