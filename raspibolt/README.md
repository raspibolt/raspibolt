[ **Intro** ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [FAQ](raspibolt_faq.md) ]

-----
# Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

I love to tinker and build stuff. I am also fascinated with digital currencies, so I recently built my own Bitcoin / Lightning Full Node with a simple low-cost Raspberry Pi. I now basically run my own bank using free open-source software and some cheap hardware. 

This project was as much about the learning process as about the result. And I think I succeeded: I learned a lot and my node runs very well. This guide is my attempt to share my learnings and encourage you to run a node yourself.

## Why am I excited about Bitcoin and Lightning?

**Bitcoin as new technology** is an incredibly interesting endeavor, especially because of its interdisciplinary nature. **Bitcoin as sound money** is going to have a major impact on economic principles and society as a whole. In my opinion, a solid, anti-fragile base layer for this future monetary network is the killer app for blockchains and will be more important than the most novel feature of competing altcoin projects.

At the moment, Bitcoin is more of a store of value and not really suited for small everyday transactions. Due to limitations of the blockchain and the growth of its usage, fees have risen and business models relying on cheap transactions are being priced out. This is fine. **Truly decentralized blockchains are a scarce resource** and cannot scale to accommodate all global transactions. The current scaling pains are a great motivator to build better technology to scale exponentially, as opposed to just making everything bigger for linear scaling.

This is where the **Lightning Network** comes in. As one of several new blockchain “extensions”, its promise is to accommodate nearly unlimited transactions, with instant payment confirmation, minimal fees and increased privacy. It sounds almost too good to be true, but in contrast to ubiquitous ICO with their own token, this technology is well researched, committed to the cypherpunk open-source ethos and leverages the solid underpinnings of Bitcoin.

To preserve the decentralized nature of this monetary system, I think it is important that everybody can run their own trustless Bitcoin full node, preferably on cheap hardware like a Raspberry Pi.

![RaspiBolt Logo](images/00_raspibolt_logo.png)

This is why I set out to build my **RaspiBolt** and think that I have now - through numerous iterations - quite a good configuration that I would like to share as my modest contribution to the community. I am not a systems specialist, so please feel free to point out improvements.

## About this guide
### Purpose

My aim is to set up a Bitcoin and Lightning node that
* is as fully validating Bitcoin Full Node and does not require any trust in a 3rd party,
* is reliably running 24/7, 
* is part of and supports the decentralization of the Lightning network by routing payments and 
* can be used to send and receive personal payments using the command line interface.

This server is set up without graphical user interface and is used remotely using the Secure Shell (SSH) command line. In the future, this server should function as my personal backend for desktop and mobile wallets, but I haven’t found a good solution to this yet. So, command line it is for the moment.

Spoiler alert: this is the goal of this guide, simply buying a Blockaccino. 
[![
](images/00_blockaccino_goal.png)
](https://vimeo.com/252693058)
  
### Target audience
This guide strives to give simple and foolproof instructions. But the goal is also to do everything ourselves, no shortcuts that involve trust in a 3rd party allowed. This makes this guide quite technical and lengthy, but I try to make it as straightforward as possible and explain everything for you to gain a basic understanding of the how and why.

If you like to learn about Linux, Bitcoin and Lightning, this guide is for you.

### Structure 
As the guide is quite lengthy, I split it in several parts. 

1. Introduction (this page)
2. [Preparations](raspibolt_10_preparations.md): get all required parts and start downloading the mainnet Blockchain
3. [Raspberry Pi](raspibolt_20_pi.md): set up and configure the Pi as a secure Linux server
4. [Bitcoin](raspibolt_30_bitcoin.md): install and configure the Bitcoin Core software as a Full Node, on testnet
5. [Lightning](raspibolt_40_lnd.md): install and configure the Lightning Network Daemon (LND), on testnet
6. [Mainnet](raspibolt_50_mainnet.md): after you are comfortable with your setup, switch to Bitcoin mainnet
7. [FAQ](raspibolt_faq.md): frequently asked questions and further reading

### A word of caution
All components of the Lightning network are still under development and we are dealing with real money here. So this guide follows a conservative approach: first setup and test everything on Bitcoin testnet, then - once you are comfortable to put real money on the line - switch to Bitcoin mainnet with a few simple changes.

---
Get started: [Preparations >>](raspibolt_10_preparations.md)
<!--stackedit_data:
eyJoaXN0b3J5IjpbNzIzMzI1MDQwXX0=
-->
