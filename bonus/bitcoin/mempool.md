---
layout: default
title: The Mempool Open Source Project
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---

## Bonus guide: The Mempool Open Source Project
{: .no_toc }

---

[Mempool](https://github.com/mempool/mempool){:target="_blank"} is a Bitcoin blockchain and mempool visualizer and explorer.

Difficulty: Easy
{: .label .label-green }

Status: Tested v3
{: .label .label-green }

![Mempool](../../images/mempool.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Requirements

* Bitcoin
* Electrs
* NodeJS
* MariaDB
* Nginx

---

## Preparations


## Mempool

### Installation

For improved security, we create the new user "mempool" that will run the Mempool explorer. Using a dedicated user limits potential damage in case there's a security vulnerability in the code. An attacker would not be able to do much within this user's permission settings.

* Create a new user, assign it to the "bitcoin" group, and open a new session

  ```sh
  $ sudo adduser --disabled-password --gecos "" mempool
  $ sudo adduser mempool bitcoin
  $ sudo su - mempool
  ```

* Download the source code directly from GitHub

  ```sh
  $ git clone https://github.com/mempool/mempool
  > Cloning into 'mempool'...
  > [...]
  $ cd mempool
  $ latestrelease=$(curl -s https://api.github.com/repos/mempool/mempool/releases/latest|grep tag_name|head -1|cut -d '"' -f4)
  $ git checkout $latestrelease
  > Note: switching to 'v2.2.2'.
  > [...]
  ```

### MariaDB

sudo apt install mariadb-server mariadb-client
sudo mariadb
> Welcome to the MariaDB monitor.  Commands end with ; or \g.
> [...]
> MariaDB [(none)]>

  $$ drop database mempool;
  > ERROR 1008 (HY000): Can't drop database 'mempool'; database doesn't exist
  $$ create database mempool;
  > Query OK, 1 row affected (0.001 sec)
  $$ grant all privileges on mempool.* to 'mempool'@'%' identified by 'mempool';
  > Query OK, 0 rows affected (0.012 sec)
  $$ exit


From the mempool repo's top-level folder, import the database structure:

cd /home/mempool/mempool
mariadb -umempool -pmempool mempool < mariadb-structure.sql

### Mempool Backend

sudo su - mempool
cd mempool/backend
npm install --prod
npm run build

<br /><br />

---

<< Back: [+ Bitcoin](index.md)
