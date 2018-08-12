[ **Intro** ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [Bonus](raspibolt_60_bonus.md) ] -- [ [FAQ](raspibolt_faq.md) ] -- [ [Updates](raspibolt_updates.md) ]

-----
# Un guide pour recycler votre vieux portable en noeud Bitcoin et ⚡Lightning️⚡

Ce guide est en grande partie basé sur le travail de [Stadicus](https://github.com/Stadicus/guides), qui a réalisé deux tutoriels très complet expliquant comment installer un noeud Bitcoin ET un noeud Lightning sur du matériel très abordable, à savoir le Raspberry Pi et l'Odroid.

Je ne reviendrai pas sur les raisons de faire tourner son propre noeud Bitcoin ([le Bitcoin wiki donne déjà quelques arguments](https://en.bitcoin.it/wiki/Full_node)), en revanche il devient aujourd'hui intéressant d'utiliser un ordinateur dédié pour les raisons suivantes :
* En l'état actuel de son développement, Lightning nécessite d'être en ligne en permanence afin de pouvoir servir de relai dans les transactions,
* La blockchain de Bitcoin croît à un rythme certes raisonnable, mais représente aujourd'hui plus de 200Go, ce qui peut être rédhibitoire sur l'ordinateur que vous utilisez quotidiennement (et si vous voulez opérer un noeud lightning, vous ne pouvez malheureusement pas la pruner),
* Un ordinateur polyvalent est soumis à davantage de risques de sécurité (virus, intrusion, vol...), utiliser un hardware dédié vous met à l'abri d'un grand nombre de risques. 

Un autre guide très utile a été réalisé par [StopAndDecrypt](https://twitter.com/StopAndDecrypt) dans une optique légèrement différente, puisqu'il s'agit d'installer un noeud Bitcoin sur un ordinateur portable potentiellement non dédié à Bitcoin, avec davantage de précisions pour les néophytes de Linux. 

Pour rester décentralisé, et donc souverain, Bitcoin a besoin de deux choses :
1. qu'un maximum d'utilisateurs utilise un noeud _complet_ (_full node_) pour leurs transactions, 
2. que mettre en place un noeud soit le plus simple et le plus accessible possible, y compris pour des utilisateurs qui n'ont ni le temps, ni l'appétence d'apprendre toutes les subtilités techniques de Bitcoin.

Je ne suis pas informaticien, il y a un an j'étais encore un utilisateur de Windows très moyen. Bitcoin m'a donné une raison d'apprendre à être autonome et de participer pleinement au réseau, c'est-à-dire en tant que _pair_.

Ce guide vise donc à rendre plus simple d'accès pour les utilisateurs francophones la documentation aujourd'hui principalement disponible en anglais. J'ai décidé de le faire car je crois que la responsabilité individuelle est l'un des piliers de Bitcoin, et que tout ce qui peut aider ses utilisateurs à être davantage autonome le renforce. 

La voie de la facilité, qui serait de laisser les utilisateurs avec de simples applications se contentant d'interroger des noeuds selon une procédure simplifiée (_SPV_ pour _simplified payment verification_), rend au contraire les utilisateurs totalement dépendants des mineurs et de noeuds opérés par des inconnus, et va à l'encontre de cet esprit de liberté. 

Lorsque j'ai pris la décision de construire mon propre noeud, j'ai d'abord hésité à suivre à la lettre les guides et d'investir dans un Raspberry Pi. Puis je me suis souvenu de ce vieux portable qui traîne depuis au moins 4 ans au fond d'un de mes placards, et je me suis dit que je pouvais essayer de lui offrir une nouvelle vie. 

## Why am I excited about Bitcoin and Lightning?

**Bitcoin as new technology** is an incredibly interesting endeavor, especially because of its interdisciplinary nature. **Bitcoin as sound money** is going to have a major impact on economic principles and society as a whole. In my opinion, a solid, anti-fragile base layer for this future monetary network is the killer app for blockchains and will be more important than the most novel feature of competing altcoin projects.

At the moment, Bitcoin is more of a store of value and not really suited for small everyday transactions. Due to limitations of the blockchain and the growth of its usage, fees have risen and business models relying on cheap transactions are being priced out. This is fine. **Truly decentralized blockchains are a scarce resource** and cannot scale to accommodate all global transactions. The current scaling pains are a great motivator to build better technology to scale exponentially, as opposed to just making everything bigger for linear scaling.

This is where the **Lightning Network** comes in. As one of several new blockchain “extensions”, its promise is to accommodate nearly unlimited transactions, with instant payment confirmation, minimal fees and increased privacy. It sounds almost too good to be true, but in contrast to ubiquitous ICO with their own token, this technology is well researched, committed to the cypherpunk open-source ethos and leverages the solid underpinnings of Bitcoin.

Bitcoin's security model requires both full nodes and miners to be decentralized. While the full-node-using economy must be decentralized to stop fake bitcoins that do not abide to consensus from being accepted as payments, the miners must be  decentralized to stop censorship of transactions and to make  transactions irreversible. 

To preserve the decentralized nature of this monetary system, I think it is important that everybody can run their own trustless Bitcoin full node, preferably on cheap hardware like a Raspberry Pi. If Bitcoin is digital gold, then a full node wallet is your own personal goldsmith who checks for you that received payments are genuine. 

![RaspiBolt Logo](images/00_raspibolt_banner_440.png)

This is why I set out to build my **RaspiBolt** and think that I have now - through numerous iterations - quite a good configuration that I would like to share as my modest contribution to the community. I am not a systems specialist, so please feel free to point out improvements.

## About this guide
### Structure

1. Introduction (this page)
2. [Preparations](raspibolt_10_preparations.md): get all required parts and start downloading the mainnet Blockchain
3. [Raspberry Pi](raspibolt_20_pi.md): set up and configure the Pi as a secure Linux server
4. [Bitcoin](raspibolt_30_bitcoin.md): install and configure the Bitcoin Core software as a Full Node, on testnet
5. [Lightning](raspibolt_40_lnd.md): install and configure the Lightning Network Daemon (LND), on testnet
6. [Mainnet](raspibolt_50_mainnet.md): after you are comfortable with your setup, switch to Bitcoin mainnet
7. [FAQ](raspibolt_faq.md): frequently asked questions and further reading
8. [Updates](raspibolt_updates.md): keep track of changes

### Purpose

My aim is to set up a Bitcoin and Lightning node that
* is as fully validating Bitcoin Full Node and does not require any trust in a 3rd party,
* is reliably running 24/7, 
* is part of and supports the decentralization of the Lightning network by routing payments and 
* can be used to send and receive personal payments using the command line interface.

This server is set up without graphical user interface and is used remotely using the Secure Shell (SSH) command line. In the future, this server should function as my personal backend for desktop and mobile wallets, but I haven’t found a good solution to this yet. So, command line it is for the moment.

**Spoiler alert**: this is the goal of this guide, simply buying a Blockaccino.

[![](images/00_blockaccino_goal.png)](https://vimeo.com/258395303)

**Wishlist for further enhancements**

- [ ] Bitcoin desktop wallet support
- [ ] Bitcoin mobile wallet support
- [ ] Hardware wallet support
- [ ] Lightning web interface
- [ ] Email alerts
- [ ] Full backup, incl. Lightning channel states
- [ ] VPN access from public internet

### Target audience

This guide strives to give simple and foolproof instructions. But the goal is also to do everything ourselves, no shortcuts that involve trust in a 3rd party allowed. This makes this guide quite technical and lengthy, but I try to make it as straightforward as possible and explain everything for you to gain a basic understanding of the how and why.

If you like to learn about Linux, Bitcoin and Lightning, this guide is for you.

### A word of caution
All components of the Lightning network are still under development and we are dealing with real money here. So this guide follows a conservative approach: first setup and test everything on Bitcoin testnet, then - once you are comfortable to put real money on the line - switch to Bitcoin mainnet with a few simple changes.

---
Get started: [Preparations >>](raspibolt_10_preparations.md)
