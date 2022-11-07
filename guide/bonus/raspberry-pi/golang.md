---
layout: default
title: Install / Update / Uninstall Go
parent: + Raspberry Pi
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

## Install / Update / Uninstall Go
{: .no_toc }

Difficulty: Easy
{: .label .label-green }

Status: Tested v3
{: .label .label-green }

![golang](../../../images/golang.png)

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Install Go

* Check the latest stable version of the arm64 binary at https://golang.org/dl/ and download it.

  ```sh
  $ cd /tmp
  $ wget https://go.dev/dl/go1.19.3.linux-arm64.tar.gz
  ```

* Check on the download page what is the SHA256 checksum of the file, e.g. for the above:
99de2fe112a52ab748fb175edea64b313a0c8d51d6157dba683a6be163fd5eab. Calculate the SHA256 hash of the downloaded file. It should give an "OK" as an output.

  ```sh
  $ $ echo "99de2fe112a52ab748fb175edea64b313a0c8d51d6157dba683a6be163fd5eab go1.19.3.linux-arm64.tar.gz" | sha256sum --check
  > go1.19.3.linux-arm64.tar.gz: OK
  ```

* Install Go in the `/usr/local` directory.

  ```sh
  $ sudo tar -xvf go1.19.3.linux-arm64.tar.gz -C /usr/local
  $ rm go1.19.3.linux-arm64.tar.gz
  ```

* Add the binary to `PATH` to not have to type the full path each time you use it. For a global installation of Go (that users other than “admin” can use), open /etc/profile.

  ```sh
  $ sudo nano /etc/profile
  ```

* Add the following line at the end of the file, save and exit.

  ```ini
  export PATH=$PATH:/usr/local/go/bin
  ```

* To make the changes effective immediately (and not wait for the next login), execute them from the profile using the following command.

  ```sh
  $ source /etc/profile
  ```

* Test that Go has been properly installed by checking its version.

  ```sh
  $ go version
  > go version go1.19.3 linux/arm64
  ```

## Update Go

* Check the currently installed version of GO.

  ```sh
  $ go version
  > go version go1.19.3 linux/arm64
  ```

* Check for the most recent version of Go on their site [Downloads](https://go.dev/dl/) section.

* Remove the current installation.

  ```sh
  sudo rm -rvf /usr/local/go/
  ```

* Download, verify and install the latest Go binaries as described in the [Install Go](golang.md#install-go) section of this guide.

## Remove Go

* Remove the current installation.

  ```sh
  sudo rm -rvf /usr/local/go/
  ```