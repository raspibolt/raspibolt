---
layout: default
title: LNTOP terminal dashboard
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

## Bonus guide: lntop: LNTOP terminal dashboard
{: .no_toc }

Difficulty: Easy
{: .label .label-green }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

[lntop](https://github.com/edouardparis/lntop) is an interactive text-mode channels viewer for Unix systems.

![lntop](../../images/74_lntop.png)

### Install lntop

* As user "admin", download and install application

```bash
$ cd /tmp/
$ wget https://github.com/edouardparis/lntop/releases/download/v0.1.0/lntop_Linux_arm64.tar.gz
$ tar -xzf lntop_Linux_arm64.tar.gz lntop
$ sudo install -m 0755 -o root -g root -t /usr/local/bin lntop && rm lntop
$ rm lntop_Linux_arm64.tar.gz
```

### Run lntop

```bash
$ lntop
```
------

<< Back: [+ Lightning](index.md)
