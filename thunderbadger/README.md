[ **Intro** ] -- [ [Préparatifs](thunderbadger_10_preparations.md) ] -- [ [Thunder Badger](thunderbadger_20_ThunderBadger.md) ] -- [ [Bitcoin](thunderbadger_30_bitcoin.md) ] -- [ [LND](thunderbadger_40_lnd.md) ] -- [ [Mainnet](thunderbadger_50_mainnet.md) ] -- [ [Bonus](thunderbadger_60_bonus.md) ]

-----
# Thunder Badger : un nœud Bitcoin et ⚡Lightning️⚡ dans votre vieux portable pourri !

_:warning: **Ce guide est encore en construction, et peut contenir des erreurs**. Si vous avez détecté une erreur, ou tout simplement que vous avez une proposition pour l'améliorer, merci d'ouvrir un ticket ci-dessus ("issue")._

Ce guide est en grande partie basé sur le travail de [Stadicus](https://github.com/Stadicus/guides), qui a réalisé deux tutoriels très complet expliquant comment installer un nœud Bitcoin ET Lightning sur du matériel très abordable, à savoir le Raspberry Pi et l'Odroid.

Je ne reviendrai pas sur les raisons de faire tourner son propre nœud Bitcoin, [j'en ai déjà parlé ici](https://www.sosthene.net/histoire-noeud/). En revanche, il peut être utile d'expliquer pourquoi il est intéressant de l'installer sur un ordinateur à part et dédié à cela :
* En l'état actuel de son développement, Lightning nécessite d'être en ligne en permanence afin de pouvoir servir de relai dans les transactions,
* La blockchain de Bitcoin croît à un rythme certes raisonnable, mais représente aujourd'hui plus de 200Go, ce qui peut être rédhibitoire sur l'ordinateur que vous utilisez quotidiennement (vous pouvez certes la pruner, même si cela risque de limiter votre utilisation de Lightning, en tout cas en l'état actuel de son développement),
* Un ordinateur polyvalent est soumis à davantage de risques de sécurité (virus, intrusion, vol...), utiliser un hardware dédié minimise ces risques. 

Un autre guide très utile a été réalisé par [StopAndDecrypt](https://hackernoon.com/a-complete-beginners-guide-to-installing-a-bitcoin-full-node-on-linux-2018-edition-cb8e384479ea) dans une optique légèrement différente, puisqu'il s'agit d'installer un nœud Bitcoin sur un ordinateur portable potentiellement non dédié à Bitcoin. 

Avoir votre propre nœud représente un gain extrêmement important en termes de sécurité et de confidentialité de vos transactions. La différence est la même qu'entre recevoir des pièces d'or garanties par une autorité quelconque, mettons l'[empereur de Rome par exemple](https://fr.wikipedia.org/wiki/Aureus#L'effondrement_de_l'aureus), et disposer du matériel et des compétences pour pouvoir tester vous-même l'aloi des pièces que l'on vous donne. Si vous n'avez pas votre propre nœud, vous dépendez _in fine_ d'une autorité pour vous garantir que les bitcoins que vous recevez en paiement proviennent bien d'une transaction valide selon les règles imposées dans le réseau.

Parlant de règles : en ayant votre propre nœud, vous décidez également des règles que vous voulez appliquer à vos transactions. Convaincu que les gros blocs sont la solution ? Pas de soucis, il vous suffit de télécharger un client compatible avec des blocs plus gros. Si vous n'avez pas votre propre nœud, cette décision est prise pour vous par quelqu'un d'autre.

Il faut donc que mettre en place un nœud soit le plus simple et le plus accessible possible, y compris pour des utilisateurs qui n'ont ni le temps, ni l'appétence d'apprendre toutes les subtilités techniques de Bitcoin.

Je ne suis pas informaticien, il y a un an j'étais encore un utilisateur de Windows très moyen. Bitcoin m'a donné une raison d'apprendre à être autonome et à participer pleinement au réseau, c'est-à-dire en tant que _pair_.

Ce guide vise donc à rendre plus simple d'accès pour les utilisateurs francophones la documentation aujourd'hui principalement disponible en anglais. J'ai décidé de le faire car je crois que la responsabilité individuelle est l'un des piliers de Bitcoin, et que rendre davantage d'utilisateurs autonomes avec leur propre nœud à un coût raisonnable renforce Bitcoin. 

La voie de la facilité serait de laisser les utilisateurs se débrouiller avec de simples applications qui ne vérifient pas elles-mêmes les transactions, mais se contentent d'interroger un nœud (_SPV_ pour _simplified payment verification_), ou encore pire des services avec lesquels ils ne sont même pas maître de leurs clés privés. Ces services ont le mérite d'exister et sont utiles dans certains cas, mais rendent leurs utilisateurs totalement dépendants des mineurs et de nœuds opérés par des tiers, ce qui va à l'encontre de l'esprit de liberté qui est la raison d'être de Bitcoin. 

Lorsque j'ai pris la décision de construire mon propre nœud, j'ai d'abord hésité à suivre à la lettre les guides et d'investir dans un Raspberry Pi. Puis je me suis souvenu de ce vieux portable qui traînait depuis au moins 4 ans au fond d'un de mes placards, et je me suis dit que je pouvais essayer de lui offrir une nouvelle vie. 

Stadicus a inauguré la tradition de donner un petit nom bien tarte à ce type de petit hardware dédié avec son Raspibolt et Thundroid. Pour ma part, j'ai donc choisi de l'appeler _Thunder Badger_.

## À propos de ce guide
### Structure

1. [Préparatifs](thunderbadger_10_preparations.md)
2. [Thunder Badger](thunderbadger_20_ThunderBadger.md)
3. [Bitcoin](thunderbadger_30_bitcoin.md)
4. [LND](thunderbadger_40_lnd.md)
5. [Mainnet](thunderbadger_50_mainnet.md)
6. [Bonus](thunderbadger_60_bonus.md)

### Objectifs

Mon but est d'installer un nœud Bitcoin et Lightning, afin de
* valider les transactions et les blocs de la blockchain en toute autonomie (aucun recours à un tiers),
* d'être opérationnel et en ligne 24h sur 24 et 7 jours sur 7, 
* de supporter la décentralisation du réseau Lightning naissant en aidant à router les paiements et 
* de recevoir et d'envoyer des paiements d'où vous voulez, quand vous voulez en apprenant à utiliser l'interface en ligne de commande.

Bien que vous puissiez toujours ouvrir votre Thunder Badger pour utiliser l'interface graphique, il sera beaucoup plus pratique d'utiliser [SSH](https://fr.wikipedia.org/wiki/Secure_Shell) pour contrôler votre nœud de n'importe où grâce aux lignes de commande.  

### À qui ce guide s'adresse-t-il ?

Ce guide est destiné à ceux qui souhaitent aller plus loin dans leur utilisation de Bitcoin et cesser complètement de dépendre de service tiers. Je ferai de mon mieux pour le rendre digeste y compris pour des utilisateurs avec peu de connaissances informatiques. Étant moi-même relativement amateur, si j'y suis arrivé vous devriez aussi pouvoir le faire.

Vous allez apprendre principalement trois choses : utiliser Linux (et notamment comment se connecter à une machine distante grâce à SSH), utiliser l'interface en ligne de commande de Bitcoin Core et celle de LND (l'implémentation de Lightning que j'ai choisie).

### Avertissement

Bitcoin et Lightning sont des technologies encore jeunes et dont l'utilisation comporte certains risques, d'autant plus qu'il s'agit de votre argent. Ce guide est fourni en l'état et peut comporter des erreurs ou ne pas envisager tous les cas de figure possibles, et je ne saurais en aucun cas être tenu responsable d'éventuelles pertes financières ou autres. 

Il est recommandé d'être prudent et d'expérimenter d'abord sur le [testnet](https://bitcoin.fr/testnet/), c'est-à-dire sans risquer votre argent. Ce tutorial vous indiquera par défaut comment vous connecter sur le testnet, mais je vous montrerai aussi comment passer sur le mainnet.

---

[ [Page suivante](thunderbadger_10_preparations.md) ]