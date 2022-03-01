---
layout: default
title: Remote access
nav_order: 20
parent: Raspberry Pi
---
<!-- markdownlint-disable MD014 MD022 MD025 MD033 MD040 -->
{% include include_metatags.md %}

# Remote access
{: .no_toc }

We connect to your Raspberry Pi by using the Secure Shell.

---

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Find your Raspberry Pi

The Pi is starting and gets a new address from your home network.
Give it a few minutes to come to life.

* On your regular computer, open the Terminal (also known as "command line").
  Here are a few links with additional details how to do that for [Windows](https://www.computerhope.com/issues/chusedos.htm){:target="_blank"}, [MacOS](https://macpaw.com/how-to/use-terminal-on-mac){:target="_blank"} and [Linux](https://www.howtogeek.com/140679/beginner-geek-how-to-start-using-the-linux-terminal/){:target="_blank"}.

* Try to ping the Raspberry Pi using the hostname you configured above (e.g., `raspibolt`).
  Press `Ctrl`-`C` to interrupt.

  ```sh
  $ ping raspibolt.local
  > PING raspibolt.local (192.168.0.20) 56(84) bytes of data.
  > 64 bytes from 192.168.0.20 (192.168.0.20): icmp_seq=1 ttl=64 time=88.1 ms
  > 64 bytes from 192.168.0.20 (192.168.0.20): icmp_seq=2 ttl=64 time=61.5 ms
  ```

* If the `ping` command fails or does not return anything, you need to manually look for your Pi.
  This is a common challenge: just follow the official Raspberry Pi guidance on [how to find your IP Address](https://www.raspberrypi.org/documentation/remote-access/ip-address.md){:target="_blank"}.

* You should now be able to reach your Pi, either with the hostname `raspibolt.local` or an IP address like `192.168.0.20`.

## Access with Secure Shell

Now it’s time to connect to the Pi via Secure Shell (SSH) and get to work.
For that, we need an SSH client.

Install and start the SSH client for your operating system:

* Windows: PuTTY ([Website](https://www.putty.org){:target="_blank"})
* MacOS and Linux: from the Terminal, use the native command:
  * `ssh pi@raspibolt.local` or
  * `ssh pi@192.168.0.20`

If you need to provide connection details, use the following settings:

* host name: `raspibolt.local` or the ip address like `192.168.0.20`
* port: `22`
* username: `pi`
* password:  `password [A]`

🔍 *more: [using SSH with Raspberry Pi](https://www.raspberrypi.org/documentation/remote-access/ssh/README.md){:target="_blank"}*

---

## The command line

We will work on the command line of the Pi, which may be new to you.
Find some basic information below.
It will help you navigate and interact with your Pi.

You enter commands and the Pi answers by printing the results below your command.
To clarify where a command begins, every command in this guide starts with the `$` sign. The system response is marked with the `>` character.

Additional comments begin with `#` and must not be entered.

In the following example, just enter `ls -la` and press the enter/return key:

```sh
$ ls -la
> example system response
# This is a comment, don't enter this on the command line
```

* **Auto-complete commands**:
  You can use the `Tab` key for auto-completion when you enter commands, i.e., for commands, directories, or filenames.

* **Command history**:
  by pressing ⬆️ (arrow up) and ⬇️ (arrow down) on your keyboard, you can recall previously entered commands.

* **Common Linux commands**:
  For a very selective reference list of Linux commands, please refer to the [FAQ](../faq.md) page.

* **Use admin privileges**:
  Our regular user has no direct admin privileges.
  If a command needs to edit the system configuration, we must use the `sudo` ("superuser do") command as a prefix.
  Instead of editing a system file with `nano /etc/fstab`, we use `sudo nano /etc/fstab`.

  For security reasons, service users like "bitcoin" cannot use the `sudo` command.

* **Using the Nano text editor**:
  We use the Nano editor to create new text files or edit existing ones.
  It's not complicated, but to save and exit is not intuitive.

  * Save: hit `Ctrl-O` (for Output), confirm the filename, and hit the `Enter` key
  * Exit: hit `Ctrl-X`

* **Copy / Paste**:
  If you are using Windows and the PuTTY SSH client, you can copy text from the shell by selecting it with your mouse (no need to click anything), and paste stuff at the cursor position with a right-click anywhere in the ssh window.

  In other Terminal programs, copy/paste usually works with `Ctrl`-`Shift`-`C` and `Ctrl`-`Shift`-`V`.

<br /><br />

---

Next: [System configuration >>](system-configuration.md)
