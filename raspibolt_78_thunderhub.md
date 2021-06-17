---
layout: default
title: Upgrade External Drive
parent: Bonus Section
nav_order: 140
has_toc: false
---
## Bonus Guide: Install Thunderhub

*Difficulty: medium*

This is a guide for the installation of [thunderhub](https://www.thunderhub.io/), manage your Lightning Node through a WebUI.

![](images/75_thunderhub.png)

---
## Preparations

### Check NodeJS Version

* Starting with user "admin", we switch to user "root" and check if [Node JS](https://nodejs.org) is installed already. 
  
  ```
  $ sudo su
  $ nodejs --version
  > v12.22.1
  $ exit
  ```
### Install NodeJS

* If that is not the case, we will install it. 
  We'll use version 12 which is the most recent stable one. Then, exit the "root" user session.

  ```
  $ curl -sL https://deb.nodesource.com/setup_12.x | bash -
  $ exit
  ```
* Install NodeJS using the apt package manager.

  ```
  $ sudo apt-get install nodejs
  ```

### Firewall 

* Configure firewall to allow incoming HTTP requests from your local network to the web server.

  ```
  $ sudo ufw allow from 192.168.0.0/16 to any port 3010 comment 'allow ThunderHub from local network'
  $ sudo ufw status
  ```

## ThunderHub

### Installation

We do not want to run the thunderhub code alongside `bitcoind` and `lnd` because of security reasons.
For that we will create a separate user and we will be running the code as the new user.
We are going to install thunderhub in the home directory since it doesn't take much space.

* Create a new user with  your `password[A]` and open a new session

  ```
  $ sudo adduser thunderhub
  $ sudo su - thunderhub
  ```

* Download the source code directly from GitHub and install all dependencies using NPM.

```
$ git clone https://github.com/apotdevin/thunderhub.git
$ cd thunderhub
$ npm install
$ npm run build
```

### Configuration

* Edit the configuration file.

  ```
  $ nano /home/thunderhub/thunderhub/.env
  ```

* Uncomment the following lines:

  ```
  # -----------
  # Server Configs
  # -----------
  LOG_LEVEL='debug'

  # -----------
  # Interface Configs
  # -----------
  THEME='dark'

  # -----------
  # Account Configs
  # -----------
  ACCOUNT_CONFIG_PATH='/home/thunderhub/thubConfig.yaml'
  ```
* Edit your `thubConfig.yaml`. Change your `accountpassword`.

  ```
  cd
  nano thubConfig.yaml 
  ```
  ```
  masterPassword: 'PASSWORD' # Default password unless defined in account
  accounts:
    - name: 'RaspiBolt'
      serverUrl: '127.0.0.1:10009'
      macaroonPath: '/home/bitcoin/.lnd/data/chain/bitcoin/mainnet/admin.macaroon'
      certificatePath: '/home/bitcoin/.lnd/tls.cert'
      password: 'accountpassword'
  ```
