---
layout: default
title: LNTOP terminal dashboard
parent: Bonus Section
nav_order: 85
has_toc: false
---
## Bonus guide: lntop: LNTOP terminal dashboard
*Difficulty: easy*

[lntop](https://github.com/edouardparis/lntop) is an interactive text-mode channels viewer for Unix systems.

![lntop](images/74_lntop.png)

### Install lntop

```bash
$ wget https://github.com/edouardparis/lntop/releases/download/v0.1.0/lntop_Linux_armv6.tar.gz
$ tar -xzf lntop_Linux_armv6.tar.gz lntop
$ sudo install -m 0755 -o root -g root -t /usr/local/bin lntop && rm lntop
$ rm lntop_Linux_armv6.tar.gz
```
### Run lntop

```bash
$ lntop
```
------

<< Back: [Bonus guides](raspibolt_60_bonus.md) 

