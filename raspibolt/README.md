[ **Intro** ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [FAQ](raspibolt_faq.md) ]

-----
# Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

I like to tinker and build stuff myself. Recently I built my own Bitcoin / Lightning Node with a simple Raspberry Pi for less than US$100. That's right: take free open-source software and some cheap hardware, and basically become your own bank. It took me several iterations to get it right, and this project taught me a lot. This is my attempt to share my learnings and encourage you to run a node yourself.

## Why am I excited about Bitcoin and Lightning?

**Bitcoin** as a new *technology* is an incredibly interesting endeavor, especially because of its interdisciplinary nature. Bitcoin as *sound money* is going to have a major impact on economic principles and thus society as a whole. In my opinion, a solid, anti-fragile base layer for this future monetary network will be more important than the most novel feature of competing projects. Due to network effects, I can only see one major monetary blockchain - Bitcoin - evolving over time.

At the moment, Bitcoin is more of a store of value and not really suited for small everyday transactions. Due to limitations of the blockchain and the incredible growth of its usage, fees have risen and business models relying on cheap transactions are being priced out. This is fine. *Truly decentralized blockchains are a scarce resource* and cannot scale to accommodate all global transactions. The current scaling pains are a great motivator to build better technology to scale exponentially, as opposed to just making everything bigger for linear scaling.

This is where the **Lightning Network** comes in. As one of several new blockchain “extensions”, its promise is to accommodate nearly unlimited transactions, with instant confirmation, minimal fees and increased privacy. It sounds almost too good to be true, but in contrast to ubiquitous ICO with their own token, this technology is well researched, committed to the cypherpunk open-source ethos and leverages the solid underpinnings of Bitcoin.

To preserve the decentralized nature of this monetary system, I think it is important that everybody can run their own trustless Bitcoin node, preferably on cheap hardware like a Raspberry Pi.

![RaspiBolt Logo](https://github.com/Stadicus/guides/raw/raspibolt_initial/raspibolt/images/raspibolt_logo.png)

This is why I set out to run my **RaspiBolt** and think that I have now - through numerous iterations - quite a good configuration, that I would like to share as my modest contribution to the community. I am not a systems specialist, so please feel free to point out improvements.

## About this guide
### Purpose

My aim is to set up a trustless Bitcoin Core and Lightning node that 
* is available 24/7, 
* is part of and supports the decentralization of the Lightning network by routing payments and 
* can be used to send and receive personal payments using the command line interface.

This server is set up without graphical user interface and is used remotely using the Secure Shell (SSH) command line. In the future, this server should function as my personal backend for desktop and mobile wallets, but I haven’t found a good solution to this yet. So, command line it is for the moment.

Spoiler alert: this is the goal of this guide, simply buying a Blockaccino. 
[![
](https://raw.githubusercontent.com/Stadicus/guides/raspibolt_initial/raspibolt/images/blockaccino_goal.png)
](https://vimeo.com/252693058)
  
### Target audience
This guide strives to give simple and foolproof instructions. But the goal is also to do everything ourselves, no shortcuts that involve trust in a 3rd party allowed. This makes this guide quite technical and lengthy, but I try to make it as straightforward as possible and explain everything for you to gain a basic understanding of the how and why.

If you like to learn about Linux, Bitcoin and Lightning, this guide is for you.

### A word of caution
All components of the Lightning network are still under development and we are dealing with real money here. So this guide follows a conservative approach: first setup and test everything on Bitcoin testnet, then - once you are comfortable to put real money on the line - switch to Bitcoin mainnet with a few simple changes.
