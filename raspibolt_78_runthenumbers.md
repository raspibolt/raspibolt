---
layout: default
title: Run the Numbers
nav_order: 78
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->

# Run The Numbers
{: .no_toc }


Based on ... URL and name of script

By default, this script will `Run The Numbers` every 5000 blocks, saving output in the /run/runthenumbers folder, accessible by the bitcoin user.  

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Simplified Script

As user "admin", create the runthenumbers script by copy/paste the following. Save and exit.
```sh
sudo nano /usr/local/bin/runthenumbers
```

```bash
#!/bin/bash

# Every N Blocks, we run the numbers
NBLOCK=5000

last_run_block=-1
while true
do
    current_block=$(bitcoin-cli getblockcount)
    current_block=$(expr $current_block + 1 - 1)
    mod_block=$(expr $current_block % $NBLOCK)
    if [[ $mod_block -eq "0" ]]; then
        if [[ $current_block -gt $last_run_block ]]; then
            last_run_block=$current_block
            txoutsetinfo=$(bitcoin-cli gettxoutsetinfo)
            echo "${txoutsetinfo}" > "the_numbers_${current_block}.txt"
            echo "${txoutsetinfo}" > "the_numbers_latest.txt"
        fi
    fi
    # Query block height every n seconds
    sleep 5
done
```


## Autostart on boot

We want this script to start automatically on system boot.

* As user "admin", create the runthenumbers systemd unit and copy/paste the following configuration. Save and exit.

  ```sh
  $ sudo nano /etc/systemd/system/runthenumbers.service
  ```

  ```ini
  # RaspiBolt: systemd unit for runthenumbers
  # /etc/systemd/system/runthenumbers.service

  [Unit]
  Description=Run The Numbers Daemon
  Wants=bitcoind.service
  After=bitcoind.service

  [Service]

  # Service execution
  ###################
  ExecStart=/usr/local/bin/runthenumbers


  # Process management
  ####################

  Type=simple
  Restart=always
  RestartSec=30
  TimeoutSec=240

  # Directory creation and permissions
  ####################################

  # Run as bitcoin:bitcoin
  User=bitcoin
  Group=bitcoin

  # /run/runthenumbers
  RuntimeDirectory=runthenumbers
  RuntimeDirectoryMode=0710

  # Hardening measures
  ####################

  # Provide a private /tmp and /var/tmp.
  PrivateTmp=true

  # Mount /usr, /boot/ and /etc read-only for the process.
  ProtectSystem=full

  # Disallow the process and all of its children to gain
  # new privileges through execve().
  NoNewPrivileges=true

  # Use a new /dev namespace only populated with API pseudo devices
  # such as /dev/null, /dev/zero and /dev/random.
  PrivateDevices=true

  # Deny the creation of writable and executable memory mappings.
  MemoryDenyWriteExecute=true

  [Install]
  WantedBy=multi-user.target
  ```

* Enable and start RunTheNumbers.

  ```sh
  $ sudo systemctl enable runthenumbers
  $ sudo systemctl start runthenumbers
  ```

* Check the systemd journal to see runthenumbers' log output.
  Exit with `Ctrl`-`C`.

  ```sh
  $ sudo journalctl -f -u runthenumbers
  ```
## Display Results

The latest results from running the numbers can be displayed as follows

```sh
cat /run/runthenumbers/the_numbers_latest.txt
```

