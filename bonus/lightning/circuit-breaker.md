---
layout: default
title: Circuit Breaker
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

# Bonus guide: Circuit Breaker, a lightning 'firewall'
{: .no_toc }

---

[Circuit Breaker](https://github.com/lightningequipment/circuitbreaker){:target="_blank"} protects your node from being flooded with HTLCs in what is known as a [griefing attack](https://bitcoinmagazine.com/technical/good-griefing-a-lingering-vulnerability-on-lightning-network-that-still-needs-fixing){:target="_blank"}.

Difficulty: Easy
{: .label .label-green }

Status: Tested v3
{: .label .label-green }

![circuit-breaker-tweet](../../images/circuit-breaker-tweet.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Requirements

* LND v0.11+
* Go v1.13+

---

## Install Go

* Check the latest stable version of the arm64 binary at [https://golang.org/dl/](https://golang.org/dl/){:target="_blank"} and download it

  ```sh
  $ cd /tmp
  $ wget https://go.dev/dl/go1.17.7.linux-arm64.tar.gz
  ```
  
* Check on the download page what is the SHA256 checksum of the file, e.g. for above: a5aa1ed17d45ee1d58b4a4099b12f8942acbd1dd09b2e9a6abb1c4898043c5f5. 
Calculate the SHA256 hash of the downloaded file, it should be the same number as the one on the website
  
  ```sh 
  $ sha256sum go1.17.7.linux-arm64.tar.gz
  > a5aa1ed17d45ee1d58b4a4099b12f8942acbd1dd09b2e9a6abb1c4898043c5f5  go1.17.7.linux-arm64.tar.gz
  ```
  
* Install Go in the `/usr/local` directory
  
  ```sh 
  $ sudo tar -xvf go1.17.7.linux-arm64.tar.gz -C /usr/local
  $ rm go1.17.7.linux-arm64.tar.gz
  ```

* Add the binary to `PATH` to not have to type the full path each time you are using it. For a global installation of Go (that users other than "admin" can use), open `/etc/profile`
  
  ```sh
  $ sudo nano /etc/profile
  ```

* Add the following line at the end of the file, save and exit
  
  ```ini
  export PATH=$PATH:/usr/local/go/bin
  ```
  
* To make the changes effective immediately (and not wait for the next login), execute them from the profile using the following command
  
  ```sh
  $ source /etc/profile
  ```

* Test that Go has been properly installed by checking its version

  ```sh
  $ go version
  > go version go1.17.7 linux/arm64
  ```

---
  
## Install Circuit Breaker

* Create a new user "circuitbreaker" and make it part of the "lnd" group

  ```sh
  $ sudo adduser --disabled-password --gecos "" circuitbreaker
  $ sudo adduser circuitbreaker lnd
  ```
 
* With user "circuitbreaker", create a symbolic link to the `lnd` directory, in order for `circuitbreaker` to be allowed to interact with `lnd`

  ```sh
  $ sudo su - circuitbreaker
  $ ln -s /data/lnd /home/circuitbreaker/.lnd
  ```

* Clone the project and install it 
 
  ```sh
  $ git clone https://github.com/lightningequipment/circuitbreaker.git
  $ cd circuitbreaker
  $ go install
  ``` 
 
* Make Circuit Breaker executable without having to provide the full path to the Go binary directory

  ```sh 
  $ echo 'export PATH=$PATH:/home/circuitbreaker/go/bin' >> /home/circuitbreaker/.bashrc
  $ source /home/circuitbreaker/.bashrc
  ```

---

## Configuration

A sample configuration file is located at `~/circuitbreaker/circuitbreaker-example.yaml`.
By default, Circuit Breaker reads its configuration file located at `~/.circuitbreaker/circuitbreaker.yaml`.

* Still with  the "circuitbreaker" user, move and rename the sample configuration file to the location expected by Circuit Breaker, then open it
  
  ```sh
  $ cd ~/
  $ mkdir ~/.circuitbreaker
  $ cp ~/circuitbreaker/circuitbreaker-example.yaml ~/.circuitbreaker/circuitbreaker.yaml
  $ nano .circuitbreaker/circuitbreaker.yaml
  ``` 
 
* Circuit Breaker suggests 5 maximum pending htlcs, set the number of htlcs that you feel comfortable with in case of a griefing attack
 
  ```ini
  maxPendingHtlcs: 3
  ```
 
* If you don't want to use exception groups, uncomment the entire section
 
  ```ini
  #groups:
   # For two peers, the pending and rate limits are
   # lowered.
     #- maxPendingHtlcs: 2
       #htlcMinInterval: 5s
       #htlcBurstSize: 3
       #peers:
       #- 03901a1fcfbf621245d859fe4b8bfd93c9e8191a93612db3db0efd11af64e226a2
       #- 03670eff2ccfd3a469536d8e3d38825313d266fa3c2d22b1f841beca30414586d0
 
   # A last peer is allowed to have more pending htlcs and no rate limit.
     #- maxPendingHtlcs: 25
       #peers:
       #- 035cb74e3232e98ba6a866c485f1076dca5e42147dc1e3fbf9ea7241d359988e4d
   ```
  
* If you don't want to use the hold fees simulation, uncomment the entire section

  ```ini
  #holdFee:
    # Set the base hold fee to 500 sat per hour to compensate for the usage of an
    # htlc slot. If an imaginary channel of 1 BTC would have all of its 483 slots
    # occupied for a full year, the total hold fee would be 24 * 365 * 483 =
    # 4231080 sats. This translates to a yearly return on the staked bitcoin of
    # ~4.2%.
  #  baseSatPerHr: 1
    # Set the hold fee rate to 5 parts per million. If an imaginary channel of 1
    # BTC would have all of its funds time-locked for a full year, the total hold
    # fee would be 24 * 365 * 100000000 * 5 / 1000000 = 4380000. This translates
    # to a yearly return on the staked bitcoin of ~4.4%.
  #  ratePpmPerHr: 5

    # Report (virtually) collected hold fees once per hour.
  #  reportingInterval: 1h*
  ```

* Once edited, save and exit.

---

## First run

* Still with user "circuitbreaker", test if the program works by displaying the version

  ```sh
  $ cd ~/
  $ circuitbreaker --version
  > circuitbreaker version 0.11.1-beta.rc3 commit=
  ```

* Display the help menu
  
  ```sh
  $ circuitbreaker --help
  > NAME:
  > circuitbreaker - A new cli application
  > [...]
  ```
* Finally, launch `circuitbreaker`
  
  ```sh 
  $ circuitbreaker
  $ 2021-12-08T18:33:28.557Z	INFO	Read config file	{"file": "/home/circuitbreaker/.circuitbreaker/circuitbreaker.yaml"}
  $ 2021-12-08T18:33:28.561Z	INFO	CircuitBreaker started
  $ 2021-12-08T18:33:28.561Z	INFO	Hold fee	{"base": 0, "rate": 0, "reporting_interval": "0s"}
  $ 2021-12-08T18:33:28.813Z	INFO	Connected to lnd node	{"pubkey": "YourNodePubkey"}
  $ 2021-12-08T18:33:28.814Z	INFO	Interceptor/notification handlers registered
  $ 2021-12-08T18:33:28.814Z	INFO	Hold fee reporting disabled
  ```
 
 *  Stop `circuitbreaker` with Ctrl+C

---
 
## Autostart on boot

* Exit the "circuitbreaker" user session back to "admin"

  ```sh
  $ exit
  ```

* Create a circuitbreaker systemd service unit with the following content, save and exit 
 
  ```sh
  $ sudo nano /etc/systemd/system/circuitbreaker.service
  ```
  
  ```ini
  # RaspiBolt: systemd unit for circuitbreaker
  # /etc/systemd/system/circuitbreaker.service

  [Unit]
  Description=Circuit Breaker
  After=lnd.service

  [Service]
  
  # Service execution
  ###################

  WorkingDirectory=/home/circuitbreaker/circuitbreaker
  ExecStart=/home/circuitbreaker/go/bin/circuitbreaker
  User=circuitbreaker
  Group=circuitbreaker
  
  # Process management
  ####################
  
  Type=simple
  KillMode=process
  TimeoutSec=60
  Restart=always
  RestartSec=60
  
  [Install]
  WantedBy=multi-user.target
  ```
  
* Enable and start the service and check that the status is `active`

  ```sh
  $ sudo systemctl enable circuitbreaker
  $ sudo systemctl start circuitbreaker
  $ systemctl status circuitbreaker
  > circuitbreaker.service - Circuit Breaker, a lightning firewall
  > Loaded: loaded (/etc/systemd/system/circuitbreaker.service; enabled; vendor preset: enabled)
  > Active: active (running) since Sat 2021-10-30 16:53:04 BST; 6s ago
  > [...]
  ```

* Circuit Breaker is now running in the background. To check the live logging output, use the following command

  ```sh
  $ sudo journalctl -f -u circuitbreaker
  ```

---

## Upgrade

Updating to a new release should be straight-forward, but make sure to check out the [release notes](https://github.com/lightningequipment/circuitbreaker/tags){:target="_blank"} first.

* From user "admin", stop the service and open a "circuitbreaker" user session

  ```sh
  $ sudo systemctl stop circuitbreaker
  $ sudo su - circuitbreaker
  ```
  
* Fetch the latest GitHub repository information and check out the new release
 
  ```sh
  $ cd ~/circuitbreaker
  $ git fetch
  $ git checkout master
  $ go install
  $ exit
  ```
  
* Start the service again

  ```sh
  $ sudo systemctl start circuitbreaker
  ```

---

## Uninstall

If you want to uninstall circuitbreaker

* With the "root" user, delete the "circuitbreaker" user

  ```sh
  $ userdel -r circuitbreaker
  ```

<br /><br />

---

<< Back: [+ Lightning](index.md)
