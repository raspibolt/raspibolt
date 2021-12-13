---
layout: default
title: Specter Desktop
parent: + Bitcoin
grand_parent: Bonus Section
nav_exclude: true
has_children: false
has_toc: false
---

## Bonus guide: Specter Desktop
{: .no_toc }

Difficulty: Intermediate
{: .label .label-yellow }

Status: Not tested v3
{: .label .label-yellow }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

The Specter Desktop app is a project that's working on making a convenient and user-friendly GUI around Bitcoin Core with a focus on ***multisignature setup with hardware wallets and airgapped devices***.

The application communicates directly with a Bitcoin full node via its RPC interface. This guide lays out how to install the Specter application to a Raspibolt device and have it communicate with `bitcoind` to execute its operations.

The default setup guides you on how to allow for plugging in your hardware devices _directly to the Raspibolt device_ to do multisig operations. There are some additional guides linked further down that explain how to configure Specter differently to plug your hardware devices into the laptop/computer you're using instead of directly into the Pi.

## Preparation on the Pi

- Make the following changes to the bitcoin configuration file

  Open the `bitcoin.conf` file
  ```sh
  $ sudo nano /home/bitcoin/.bitcoin/bitcoin.conf
  ```

  Edit the following values, or add to the end of the file if not set
  ```sh
  server=1
  blockfilterindex=1
  disablewallet=0
  ```

  Save and exit the `bitcoin.conf` file

  Restart the bitcoin daemon
  ```sh
  $ sudo systemctl restart bitcoind
  ```

- Allow the UFW firewall to listen on 25441 from the LAN, restart and check it.
  ```sh
  $ sudo ufw allow from 192.168.0.0/16 to any port 25441 comment 'allow Specter Desktop from local network'
  $ sudo ufw enable
  $ sudo ufw status
  ```

- Install the following required system dependencies
  ```sh
  $ sudo apt update
  $ sudo apt install -y \
    git build-essential \
    libusb-1.0-0-dev libudev-dev libffi-dev libssl-dev \
    python3 python3-pip
  ```

## Specter Desktop

### Installation

These instructions will clone the repo to fetch the latest version and then "pip install" the project directly to a python virtual environment.

- Create a new user with your password [ A ] and open a new session
  ```sh
  $ sudo adduser specter
  $ sudo su - specter
  ```

- Install `virtualenv`
  ```sh
  $ python3 -m pip install virtualenv
  ```

  - _(Optional) Add `$HOME/.local/bin` to `$PATH`_
    _The `virtualenv` scripts are installed in the directory `$HOME/.local/bin`. Unfortunately, in Raspbian this directory is not in the system path, so the full path needs to be specified when calling these scripts. Alternatively, just add this directory to your `$PATH` environment variable, but it’s not necessary in this guide._

    In the appropriate config file (e.g. `~/.bashrc`) add the following:
    ```sh
    # set PATH so it includes user's private bin if it exists
    if [ -d "$HOME/.local/bin" ] ; then
        PATH="$HOME/.local/bin:$PATH"
    fi
    ```

- Download the source code directly from GitHub
  ```sh
  $ git clone https://github.com/cryptoadvance/specter-desktop
  $ cd specter-desktop
  ```

- Install to Python virtual environment
  ```sh
  $ VERSION=v1.3.0

  # Change to selected version
  $ git checkout $VERSION
  $ sed -i "s/vx.y.z-get-replaced-by-release-script/${VERSION}/g; " setup.py

  # Create virtualenv
  $ $HOME/.local/bin/virtualenv --python=python3 /home/specter/.env

  # Preparation for versions > v1.5.0 (i18n)
  $ /home/specter/.env/bin/python3 -m pip install babel
  $ /home/specter/.env/bin/python3 setup.py install

  # pip install to virtualenv
  # Note: make sure to include the trailing dot in the line below
  $ /home/specter/.env/bin/python3 -m pip install .
  ```


### Configuration

- Create the specter config file (or clear the default specter config file if it exists)
  ```sh
  $ mkdir -p /home/specter/.specter
  $ echo > /home/specter/.specter/config.json
  ```

- Open the specter config file for editing
  ```sh
  $ nano /home/specter/.specter/config.json
  ```

- Copy the following config to the file
  _**Note:** Be sure to change to your bitcoin rpc password on the **2 lines** that contain `"password": "PASSWORD_[B]"`_
  ```sh
  {
    "rpc": {
        "autodetect": false,
        "datadir": "",
        "user": "raspibolt",
        "password": "PASSWORD_[B]",
        "port": "8332",
        "host": "localhost",
        "protocol": "http",
        "external_node": false
    },
    "internal_node": {
        "autodetect": false,
        "datadir": "",
        "user": "raspibolt",
        "password": "PASSWORD_[B]",
        "host": "localhost",
        "protocol": "http",
        "port": "8332"
    },
    "auth": "none",
    "proxy_url": "socks5h://localhost:9050",
    "only_tor": "false",
    "hwi_bridge_url": "/hwi/api/",
    "unit": "btc",
    "price_check": false,
    "alt_rate": 1,
    "alt_symbol": "BTC",
    "price_provider": "",
    "validate_merkle_proofs": false
  }
  ```

- Save and exit `config.json`

- Exit the `specter` user session.
  ```sh
  $ exit
  ```

### Add `udev` rules to Pi

- Setup user permissions
    ```sh
    # Permission users to use new rules via 'plugdev' group
    $ sudo groupadd plugdev
    $ sudo usermod -aG plugdev bitcoin
    $ sudo usermod -aG plugdev specter
    ```


- Add the following udev rules based on the devices you require support for. The rules are based on [rules from the `bitcoin-core` repo](https://github.com/bitcoin-core/HWI/blob/master/hwilib/udev/README.md).

  - #### Ledger

    Open the Ledger rules file
    ```sh
    $ sudo nano /etc/udev/rules.d/20-hw1.rules
    ```

    Copy the following to the file
    ```sh
    # HW.1 / Nano
    SUBSYSTEMS=="usb", ATTRS{idVendor}=="2581", ATTRS{idProduct}=="1b7c|2b7c|3b7c|4b7c", TAG+="uaccess", TAG+="udev-acl", OWNER="specter"
    # Blue
    SUBSYSTEMS=="usb", ATTRS{idVendor}=="2c97", ATTRS{idProduct}=="0000|0000|0001|0002|0003|0004|0005|0006|0007|0008|0009|000a|000b|000c|000d|000e|000f|0010|0011|0012|0013|0014|0015|0016|0017|0018|0019|001a|001b|001c|001d|001e|001f", TAG+="uaccess", TAG+="udev-acl", OWNER="specter"
    # Nano S
    SUBSYSTEMS=="usb", ATTRS{idVendor}=="2c97", ATTRS{idProduct}=="0001|1000|1001|1002|1003|1004|1005|1006|1007|1008|1009|100a|100b|100c|100d|100e|100f|1010|1011|1012|1013|1014|1015|1016|1017|1018|1019|101a|101b|101c|101d|101e|101f", TAG+="uaccess", TAG+="udev-acl", OWNER="specter"
    # Aramis
    SUBSYSTEMS=="usb", ATTRS{idVendor}=="2c97", ATTRS{idProduct}=="0002|2000|2001|2002|2003|2004|2005|2006|2007|2008|2009|200a|200b|200c|200d|200e|200f|2010|2011|2012|2013|2014|2015|2016|2017|2018|2019|201a|201b|201c|201d|201e|201f", TAG+="uaccess", TAG+="udev-acl", OWNER="specter"
    # HW2
    SUBSYSTEMS=="usb", ATTRS{idVendor}=="2c97", ATTRS{idProduct}=="0003|3000|3001|3002|3003|3004|3005|3006|3007|3008|3009|300a|300b|300c|300d|300e|300f|3010|3011|3012|3013|3014|3015|3016|3017|3018|3019|301a|301b|301c|301d|301e|301f", TAG+="uaccess", TAG+="udev-acl", OWNER="specter"
    # Nano X
    SUBSYSTEMS=="usb", ATTRS{idVendor}=="2c97", ATTRS{idProduct}=="0004|4000|4001|4002|4003|4004|4005|4006|4007|4008|4009|400a|400b|400c|400d|400e|400f|4010|4011|4012|4013|4014|4015|4016|4017|4018|4019|401a|401b|401c|401d|401e|401f", TAG+="uaccess", TAG+="udev-acl", OWNER="specter"
    ```

    Save and exit

  - #### ColdCard

    Open the Coinkite rules file
    ```sh
    $ sudo nano /etc/udev/rules.d/51-coinkite.rules
    ```

    Copy the following to the file
    ```sh
    # Linux udev support file.
    #
    # This is a example udev file for HIDAPI devices which changes the permissions
    # to 0666 (world readable/writable) for a specific device on Linux systems.
    #
    # - Copy this file into /etc/udev/rules.d and unplug and re-plug your Coldcard.
    # - Udev does not have to be restarted.
    #
    # probably not needed:
    SUBSYSTEMS=="usb", ATTRS{idVendor}=="d13e", ATTRS{idProduct}=="cc10", GROUP="plugdev", MODE="0666"
    # required:
    # from <https://github.com/signal11/hidapi/blob/master/udev/99-hid.rules>
    KERNEL=="hidraw*", ATTRS{idVendor}=="d13e", ATTRS{idProduct}=="cc10", GROUP="plugdev", MODE="0666"
    ```

    Save and exit

  - #### Trezor

    Open the Trezor rules file
    ```sh
    $ sudo nano /etc/udev/rules.d/51-trezor.rules
    ```

    Copy the following to the file
    ```sh
    # Trezor: The Original Hardware Wallet
    # https://trezor.io/
    #
    # Put this file into /etc/udev/rules.d
    #
    # If you are creating a distribution package,
    # put this into /usr/lib/udev/rules.d or /lib/udev/rules.d
    # depending on your distribution
    # Trezor
    SUBSYSTEM=="usb", ATTR{idVendor}=="534c", ATTR{idProduct}=="0001", MODE="0660", GROUP="plugdev", TAG+="uaccess", TAG+="udev-acl", SYMLINK+="trezor%n"
    KERNEL=="hidraw*", ATTRS{idVendor}=="534c", ATTRS{idProduct}=="0001", MODE="0660", GROUP="plugdev", TAG+="uaccess", TAG+="udev-acl"
    # Trezor v2
    SUBSYSTEM=="usb", ATTR{idVendor}=="1209", ATTR{idProduct}=="53c0", MODE="0660", GROUP="plugdev", TAG+="uaccess", TAG+="udev-acl", SYMLINK+="trezor%n"
    SUBSYSTEM=="usb", ATTR{idVendor}=="1209", ATTR{idProduct}=="53c1", MODE="0660", GROUP="plugdev", TAG+="uaccess", TAG+="udev-acl", SYMLINK+="trezor%n"
    KERNEL=="hidraw*", ATTRS{idVendor}=="1209", ATTRS{idProduct}=="53c1", MODE="0660", GROUP="plugdev", TAG+="uaccess", TAG+="udev-acl"
    ```

    Save and exit

  - #### KeepKey

    Open the KeepKey rules file
    ```sh
    $ sudo nano /etc/udev/rules.d/51-usb-keepkey.rules
    ```

    Copy the following to the file
    ```sh
    # KeepKey: Your Private Bitcoin Vault
    # http://www.keepkey.com/
    # Put this file into /usr/lib/udev/rules.d or /etc/udev/rules.d
    # KeepKey HID Firmware/Bootloader
    SUBSYSTEM=="usb", ATTR{idVendor}=="2b24", ATTR{idProduct}=="0001", MODE="0666", GROUP="plugdev", TAG+="uaccess", TAG+="udev-acl", SYMLINK+="keepkey%n"
    KERNEL=="hidraw*", ATTRS{idVendor}=="2b24", ATTRS{idProduct}=="0001",  MODE="0666", GROUP="plugdev", TAG+="uaccess", TAG+="udev-acl"
    # KeepKey WebUSB Firmware/Bootloader
    SUBSYSTEM=="usb", ATTR{idVendor}=="2b24", ATTR{idProduct}=="0002", MODE="0666", GROUP="plugdev", TAG+="uaccess", TAG+="udev-acl", SYMLINK+="keepkey%n"
    KERNEL=="hidraw*", ATTRS{idVendor}=="2b24", ATTRS{idProduct}=="0002",  MODE="0666", GROUP="plugdev", TAG+="uaccess", TAG+="udev-acl"
    ```

    Save and exit

- Activate udev rules
  ```sh
    # Set ownership of new rules
    $ sudo chown root:root /etc/udev/rules.d/*

    # Activate new rules
    $ sudo udevadm trigger
    $ sudo udevadm control --reload-rules
  ```

### Store data to disk (optional)

- Move Specter data to disk
  ```sh
  # Move data folder to disk
  $ sudo mkdir -p /mnt/ext/app-data/.specter
  $ sudo mv -f /home/specter/.specter/* /mnt/ext/app-data/.specter/
  $ sudo chown -R specter:specter /mnt/ext/app-data/.specter

  # Symlink data folder back to 'specter' user
  $ sudo rm -rf /home/specter/.specter
  $ sudo ln -s /mnt/ext/app-data/.specter /home/specter/
  $ sudo chown -R specter:specter /home/specter/.specter
  ```

### First start

Test Specter Desktop manually first to make sure it works.

- Switch to `specter` user
  ```sh
  $ sudo su - specter
  ```

- Let’s do a first start to make sure it’s running as expected
  ```sh
  $ PATH=/home/specter/.env/bin:$PATH
  $ /home/specter/.env/bin/python3 -m cryptoadvance.specter server --host 0.0.0.0
  ```

- Now point your browser to http://raspibolt.local:25441 (or whatever you chose as hostname) or the ip address (e.g. http://192.168.0.20:25441). You should see the home page of Specter Desktop.

- Next we will test that Specter Desktop can detect your hardware wallet. Go to **Settings _(top right)_** -> **USB Devices _(tab)_** -> **Test connection _(bottom)_**. A blue popup should appear to the top of the page with the message `"Device detected successfully! USB connections configured correctly!"`

  ![Hardware device check](images/76_specter_desktop1.gif)

- Stop Specter Desktop in the terminal with Ctrl-C and exit the "specter" user session.
  ```sh
  $ exit
  ```

### Autostart on boot
Now we’ll make sure Specter Desktop starts as a service on the Raspberry Pi so it’s always running. In order to do that we create a systemd unit that starts the service on boot directly after Bitcoin Core.

- As user “admin”, create the service file.
  ```sh
  $ sudo nano /etc/systemd/system/specter.service
  ```

- Paste the following configuration. Save and exit.
  ```sh
  [Unit]
  Description=Specter Desktop Service
  After=multi-user.target
  Conflicts=getty@tty1.service

  [Service]
  Type=simple
  ExecStart=/home/specter/.env/bin/python -m cryptoadvance.specter server --host 0.0.0.0
  Environment="PATH=/home/specter/.env/bin:$PATH"
  StandardInput=tty-force

  # Run as specter:specter
  User=specter
  Group=specter

  [Install]
  WantedBy=multi-user.target

  ```

- Enable the service, start it and check log logging output.
  ```sh
  $ sudo systemctl enable specter.service
  $ sudo systemctl start specter.service
  $ sudo journalctl -f -u specter
  ```

---

## Connect Hardware Wallet to Laptop Instead

If you would like to connect your hardware wallets to your laptop/computer instead of directly to the Raspberry Pi, there are a few different ways that this can be done.

### Option 1: HWI Bridge mode

With this, Specter is also downloaded and installed on the laptop/computer and then connected to the instance running on the Raspberry Pi. The two instances then communicate with the local laptop/computer instance handling the direct USB connection and the remote instance handling the connection to `bitcoind` via its RPC interface.

**\> Instructions for configuring this setup can be found at [hwibridge.md](https://github.com/cryptoadvance/specter-desktop/blob/v1.3.0/docs/hwibridge.md).**

**Advantages**
  - The Bitcoin RPC ports remains locked down and local only to the Raspberry Pi

**Disadvantages**
  - Two running instances of Specter must be setup, which can sometimes be complicated configuration-wise

  - This option only works on the local network unless a port is opened, in which case the service is now available on the open web and must be secured with Sepcter's internal authentication

### Option 2: Connect directly to Bitcoin RPC

With this option, Specter is installed ***only*** on the user's laptop/computer and then made to talk directly to the Bitcoin RPC to get its blockchain data and access to the Bitcoin network.

**\> Instructions for configuring this setup can be found at [connect-your-node.md](https://github.com/cryptoadvance/specter-desktop/blob/v1.3.0/docs/connect-your-node.md).**

**Advantages**
  - Specter only needs to be setup and maintained in one place

**Disadvantages**
  - The Bitcoin RPC port must be made available outside of the Raspberry Pi's internal `localhost` network. It must first be made available to the local LAN network, and then optionally to the wider web via port forwarding if the user wishes to use Specter outside the local LAN network. 

    This comes with its own security considerations that the user should be wary of.

### Option 3: HWI Bridge mode over Tor

This is similar to **Option 1** in that two running instances of Specter Desktop are needed (one on the Pi and one on the user's laptop/computer).

This 3rd option is more involved though since the user must also install/configure Tor, setup Tor hidden services for each instance on it's machine, and then configure both instances to communicate with each other through a Tor proxy.

**\> Instructions for configuring this setup can be found at [tor.md](https://github.com/cryptoadvance/specter-desktop/blob/v1.3.0/docs/tor.md).**

**Advantages**
  - The Bitcoin RPC ports remains locked down and local only to the Raspberry Pi

  - No ports need to be forwarded of configured on the Raspberry Pi's firewall to be accessible from outside the Raspberry Pi's local LAN network

**Disadvantages**
  - Two running instances of Specter must be setup, which can sometimes be complicated configuration-wise. Tor hidden services and additional proxy settings must also be configured which can be a bit trickier than the other setups

---

## Enable QR Code scanning from the browser

For certain hardware wallets that are air-gapped and communicate via QR code only, an SSL certificate must be configure for the Specter Desktop service running inside the browser.

**\> Instructions for setting this up can be found at [self-signed-certificates.md](https://github.com/cryptoadvance/specter-desktop/blob/v1.3.0/docs/self-signed-certificates.md).**

---

# Upgrade

Updating to a [new release](https://github.com/cryptoadvance/specter-desktop/releases) should be straight-forward, but make sure to check out [the changes](https://github.com/cryptoadvance/specter-desktop/releases/latest) first.

- From user “admin”, stop the service and open a "specter" user session
  ```sh
  $ sudo systemctl stop specter
  $ sudo su - specter
  ```

- Fetch the latest GitHub repository information and check out the new release
  ```sh
  $ VERSION=v1.3.0

  $ cd ~/specter-desktop
  $ git fetch
  $ git checkout $VERSION

  # Update 'setup.py' version value
  $ sed -i "s/\(version=\"\).*\(\",\)/\1${VERSION}\2/g; " setup.py

  # Note: make sure to include the trailing dot in the line below
  $ /home/specter/.env/bin/python3 -m pip install --upgrade .

  $ exit
  ```

- Start the service again.
  ```sh
  $ sudo systemctl start specter
  ```
------

<< Back: [+ Bitcoin](index.md)
