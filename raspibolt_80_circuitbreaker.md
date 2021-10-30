---
layout: default
title: Circuit Breaker
parent: Bonus Section
nav_order: 130
has_toc: true
---
# Bonus guide: Circuit Breaker, a lightning 'firewall'

*Difficulty: simple*

[Circuit Breaker](https://github.com/lightningequipment/circuitbreaker) protects the node from being flooded with htlcs in what is known as a [griefing attack](https://bitcoinmagazine.com/technical/good-griefing-a-lingering-vulnerability-on-lightning-network-that-still-needs-fixing).

*Requirements:*

* LND (or LND as part of Lightning Terminal/litd)

## Install Go (for 32-bit OS)

* Check the latest stable version of the armv6 binary at [https://golang.org/dl/](https://golang.org/dl/), download, verify and extract it:

  ```sh
  $ wget https://golang.org/dl/go1.17.2.linux-armv6l.tar.gz
  # Check on the download page what is the SHA256 checksum of the file, e.g. for above: 04d16105008230a9763005be05606f7eb1c683a3dbf0fbfed4034b23889cb7f2
  # Now hash the downloaded file, it should be the same number as the one on the website
  $ sha256sum go1.17.2.linux-armv6l.tar.gz
  > 04d16105008230a9763005be05606f7eb1c683a3dbf0fbfed4034b23889cb7f2  go1.17.2.linux-armv6l.tar.gz
  $ sudo tar -C /usr/local -xzf go1.17.2.linux-armv6l.tar.gz
  $ rm go1.17.2.linux-armv6l.tar.gz

We add the binary to PATH to not have to type the full path each time we are using it

* For a global installation of Go (that users other than admin can use), open `/etc/profile`
  
  ```sh
  $ sudo nano /etc/profile
  ```

* Add the following line at the end of the file, save (Ctrl+o) and exit (Ctrl+x)
  
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
  > go version go1.17.2 linux/arm
  ```

  
## Install Circuit Breaker

* Create a new user named `circuitbreaker` and make it part of the `bitcoin` group

 ```sh
 $ sudo adduser circuitbreaker
 $ sudo /usr/sbin/usermod --append --groups bitcoin circuitbreaker
 $ sudo ln -s /mnt/ext/lnd/ /home/circuitbreaker/.lnd
 ```
 
* Create a symbolic link to the `lnd` directory, in order for circuitbreaker to be allowed to interact with lnd

```sh
 $ sudo ln -s /mnt/ext/lnd/ /home/circuitbreaker/.lnd
 ```
 
* Log in as user `cicuitbreaker` and test the Go is accessible by this new user

  ```sh
  $ sudo su - circuitbreaker
  $ go version 
  > go version go1.17.2 linux/arm
  ```

* Clone the project and install it 
 
 ```sh
 $ git clone https://github.com/lightningequipment/circuitbreaker.git
 $ cd circuitbreaker
 $ go install
 ``` 
 
## Configuration

A sample configuration file is located at `~/circuitbreaker/circuitbreaker-example.yaml`.
By default, Circuit Breaker reads its configuration file `~/.circuitbreaker/circuitbreaker.yaml`.

* Move and rename the sample configuration file to the location expected by Circuit Breaker, then open it
  
 ```sh
 $ cd ~/
 $ mkdir ~/.circuitbreaker
 $ cp ~/circuitbreaker/circuitbreaker-example.yaml ~/.circuitbreaker/circuitbreaker.yaml
 $ nano circuitbreaker.yaml
 ``` 
 
Edit the configuration file:
 
* Circuit Breaker suggests 5 maximum pending htlcs, set the number of htlcs that you feel comfortable with in case of griefing attack
 
 ```ini
 maxPendingHtlcs: 3
 ```
 
* If you don't want to use exception groups, uncomment the provided example.
 
 ```ini
 #groups:
  # For two peers, the pending and rate limits are
  # lowered.
  #  - maxPendingHtlcs: 2
  #    htlcMinInterval: 5s
  #    htlcBurstSize: 3
  #    peers:
  #    - 03901a1fcfbf621245d859fe4b8bfd93c9e8191a93612db3db0efd11af64e226a2
  #    - 03670eff2ccfd3a469536d8e3d38825313d266fa3c2d22b1f841beca30414586d0

  # A last peer is allowed to have more pending htlcs and no rate limit.
  #  - maxPendingHtlcs: 25
  #    peers:
  #    - 035cb74e3232e98ba6a866c485f1076dca5e42147dc1e3fbf9ea7241d359988e4d
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
* Once edited, save (Ctrl+o) and exit (Ctrl+x)

## First run

* Test if the program works by displaying the version and help menu

  ```sh
  $ cd ~/
  $ ~/go/bin/circuitbreaker --version
  > circuitbreaker version 0.11.1-beta.rc3 commit=
  $ ~/go/bin/circuitbreaker --help
  > NAME:
  > circuitbreaker - A new cli application
  > [...]
  ```
  
## Autostart on boot

* Exit the `circuitbreaker` user session back to `admin`

  ```sh
  $ exit
  ```

* Create circuitbreaker systemd unit with the following content. Save (Ctrl+o) and exit (Ctrl+x).
 
  ```sh
  $ sudo nano /etc/systemd/system/circuitbreaker.service
  ```
  
  ```ini
  # RaspiBolt: systemd unit for circuitbreaker
  # /etc/systemd/system/circuitbreaker.service

  [Unit]
  Description=Circuit Breaker, a lightning firewall
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
## Test

TBD

## Upgrade

TBD

## Uninstall

If you want to uninstall circuitbreaker:

* With the root user, delete the circuitbreaker user
```sh
$ userdel -r circuitbreaker
```  
