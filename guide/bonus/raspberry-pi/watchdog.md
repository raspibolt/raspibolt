---
layout: default
title: Configure Watchdog Timer
parent: + Raspberry Pi
grand_parent: Bonus Section
nav_exclude: true
has_toc: false

---

# Bonus guide: Enabling Watchdog to monitor your hardware
{: .no_toc }

Enabling the watchdog timer on a Raspberry Pi ensures automatic system recovery in case of freezes or crashes, significantly enhancing system reliability and uptime, especially for remote or critical applications. It offers a straightforward, autonomous mechanism for maintaining operational stability without the need for manual intervention, making it essential for ensuring continuous, dependable service.

Difficulty: Intermediate
{: .label .label-yellow }

Status: TESTED V3
{: .label .label-green }

---
##  Preparing the watchdog device

1. **Check for Watchdog Device**: First, ensure that the watchdog device is correctly recognized by your system. The watchdog is enabled by default from the Raspberry Pi 3 onwards but you can verify it by running:
    ```bash
    ls /dev/watchdog*
    ```

    You may see:

    ```
    /dev/watchdog  /dev/watchdog0
    ``` 

    If you aren't able to see the watchdog devices, proceed with the next steps

2. **Enable the Watchdog Hardware**:  

    If the watchdog timer isn't working, the hardware needs to be enabled. This is done by editing the `/boot/config.txt` file:
   ```
   sudo nano /boot/config.txt
   ```
   Add the following line to the end of the file:
   ```
   dtoverlay=watchdog
   ```
   This enables the hardware watchdog.

3. **Reboot the Raspberry Pi**: Finally, reboot your Raspberry Pi to ensure all changes take effect:
   ```
   sudo reboot
   ```

---


## Enabling the watchdog

 Enabling the watchdog timer on a Raspberry Pi involves a few steps. The watchdog timer is a feature that can automatically reboot the system if it becomes unresponsive. Here's a general guide on how to enable it:

1. **Install the Watchdog Timer**: You'll need to install the watchdog daemon. Use the following command:
   ```
   sudo apt-get install watchdog
   ```

2. **Configure the Watchdog**: After installing the watchdog software, you need to configure it. You do this by editing the watchdog configuration file. Open the file with a text editor like nano:
   ```
   sudo nano /etc/watchdog.conf
   ```
   In the configuration file, you may need to uncomment (remove the `#` at the beginning of) the line that says `#watchdog-device = /dev/watchdog`. Also, you need to setup the timeout value  `watchdog-timeout= 10`. Do not use values greater than 15 seconds, as that's the limit for the RPi4's countdown timer.



4. **Activate the Watchdog Service**: After configuring the software and hardware, you need to activate the watchdog service. Use the following commands:
   ```
   sudo systemctl enable watchdog
   sudo systemctl start watchdog
   ```
---

Additionally, use caution when setting conditions for automatic reboots, as improper configuration could lead to unexpected system behavior.

------

<< Back: [+ Raspberry Pi](index.md)