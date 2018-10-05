[ **Intro** ] -- [ [Préparatifs](thunderbadger_10_preparations.md) ] -- [ [Thunder Badger](thunderbadger_20_ThunderBadger.md) ] -- [ [Bitcoin](thunderbadger_30_bitcoin.md) ] -- [ [LND](thunderbadger_40_lnd.md) ] -- [ [Mainnet](thunderbadger_50_mainnet.md) ]

-----
# Thunder Badger : un noeud Bitcoin et ⚡Lightning️⚡ dans votre vieux portable pourri !

Ce guide est en grande partie basé sur le travail de [Stadicus](https://github.com/Stadicus/guides), qui a réalisé deux tutoriels très complet expliquant comment installer un noeud Bitcoin ET un noeud Lightning sur du matériel très abordable, à savoir le Raspberry Pi et l'Odroid.

Je ne reviendrai pas sur les raisons de faire tourner son propre noeud Bitcoin ([le Bitcoin wiki donne déjà quelques arguments](https://en.bitcoin.it/wiki/Full_node)), en revanche il devient aujourd'hui intéressant d'utiliser un ordinateur dédié pour les raisons suivantes :
* En l'état actuel de son développement, Lightning nécessite d'être en ligne en permanence afin de pouvoir servir de relai dans les transactions,
* La blockchain de Bitcoin croît à un rythme certes raisonnable, mais représente aujourd'hui plus de 200Go, ce qui peut être rédhibitoire sur l'ordinateur que vous utilisez quotidiennement (et si vous voulez opérer un noeud lightning, vous ne pouvez malheureusement pas la pruner),
* Un ordinateur polyvalent est soumis à davantage de risques de sécurité (virus, intrusion, vol...), utiliser un hardware dédié vous met à l'abri d'un grand nombre de risques. 

Un autre guide très utile a été réalisé par [StopAndDecrypt](https://twitter.com/StopAndDecrypt) dans une optique légèrement différente, puisqu'il s'agit d'installer un noeud Bitcoin sur un ordinateur portable potentiellement non dédié à Bitcoin, avec davantage de précisions pour les néophytes de Linux. 

Pour rester décentralisé, et donc souverain, Bitcoin a besoin de deux choses :
1. qu'un maximum d'utilisateurs utilisent un noeud validant de façon autonome les transactions et les blocs reçus des mineurs, aussi plus simplement appelé en anglais _full node_, pour leurs transactions, 
2. que mettre en place un noeud soit le plus simple et le plus accessible possible, y compris pour des utilisateurs qui n'ont ni le temps, ni l'appétence d'apprendre toutes les subtilités techniques de Bitcoin.

Je ne suis pas informaticien, il y a un an j'étais encore un utilisateur de Windows très moyen. Bitcoin m'a donné une raison d'apprendre à être autonome et de participer pleinement au réseau, c'est-à-dire en tant que _pair_.

Ce guide vise donc à rendre plus simple d'accès pour les utilisateurs francophones la documentation aujourd'hui principalement disponible en anglais. J'ai décidé de le faire car je crois que la responsabilité individuelle est l'un des piliers de Bitcoin, et que rendre davantage d'utilisateurs autonomes avec leur propre full node à un coût raisonnable renforce Bitcoin. 

La voie de la facilité serait de laisser les utilisateurs se débrouiller avec de simples applications se contentant d'interroger des noeuds selon une procédure simplifiée (_SPV_ pour _simplified payment verification_), ou encore pire des services avec lesquels ils ne sont même pas maître de leurs clés privés. Ces services ont le mérite d'exister et sont utiles dans certains cas, mais rendent leurs utilisateurs totalement dépendants des mineurs et de noeuds opérés par des tiers, ce qui va à l'encontre de l'esprit de liberté qui est la raison d'être de Bitcoin. 

Lorsque j'ai pris la décision de construire mon propre noeud, j'ai d'abord hésité à suivre à la lettre les guides et d'investir dans un Raspberry Pi. Puis je me suis souvenu de ce vieux portable qui traînait depuis au moins 4 ans au fond d'un de mes placards, et je me suis dit que je pouvais essayer de lui offrir une nouvelle vie. 

## À propos de ce guide
### Structure

(à venir)

### Objectifs

Mon but est d'installer un noeud Bitcoin et Lightning, afin de
* valider les transactions et les blocs de la blockchain en toute autonomie (aucun recours à un tiers),
* d'être opérationnel et en ligne 24h sur 24 et 7 jours sur 7, 
* de supporter la décentralisation du réseau Lightning naissant en aidant à router les paiements et 
* de recevoir et d'envoyer des paiements d'où vous voulez, quand vous voulez en apprenant à utiliser l'interface en ligne de commande.

Bien que vous puissiez toujours ouvrir votre Thunder Badger pour utiliser l'interface graphique, il sera beaucoup plus pratique d'utiliser [SSH](https://fr.wikipedia.org/wiki/Secure_Shell) pour contrôler votre noeud de n'importe où grâce aux lignes de commande. À l'avenir, il sera même envisageable d'utiliser votre Thunder Badger comme serveur personnalisé pour vos wallets sur mobile ou desktop, mais nous verrons cela dans un 2e temps. 

### À qui ce guide s'adresse-t-il ?

Ce guide est destiné à ceux qui souhaitent aller plus loin dans leur utilisation de Bitcoin et cesser complètement de dépendre de service tiers. Je ferai de mon mieux pour le rendre digeste y compris pour des utilisateurs avec peu de connaissances informatiques. Étant moi-même relativement amateur, si j'y suis arrivé vous devriez aussi pouvoir le faire.

Vous allez apprendre principalement trois choses : utiliser Linux (et notamment comment se connecter à une machine distante grâce à SSH), utiliser l'interface en ligne de commande de Bitcoin Core et celle de LND (l'implémentation de Lightning que j'ai choisie).

### Avertissement

Bitcoin et Lightning sont des technologies encore jeunes et dont l'utilisation comporte certains risques, d'autant plus qu'il s'agit de votre argent. Ce guide est fourni en l'état et peut comporter des erreurs ou ne pas envisager tous les cas de figure possibles, et je ne saurais en aucun cas être tenu responsable d'éventuelles pertes financières ou autres. 

Il est recommandé d'être prudent et d'expérimenter d'abord sur le [testnet](https://bitcoin.fr/testnet/), c'est-à-dire sans risquer votre argent. Ce tutorial vous indiquera par défaut comment vous connecter sur le testnet, mais je vous montrerai aussi comment passer sur le mainnet.

---

[ [Page suivante](thunderbadger_10_preparations.md) ]