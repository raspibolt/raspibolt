[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [**Bonus**](raspibolt_60_bonus.md) ] -- [ [Troubleshooting](raspibolt_70_troubleshooting.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

## Bonus guide: Performance Monitoring
*Difficulty: intermediate*

> Please note: this guide has not been updated to LND 0.5 yet and might not work as intended.

It's useful to have insights into the performance of your
bitcoin and lightning node.

Observing anomolies and doing performance tuning is greatly
improved when you know what is running.

As an added bonus feature you can now have high level 
blockchain analysis and metrics. How big is the mempool,
how many open channels does your lightning node have, etc.

### Overview

There are a few required pieces to get this working
- Docker
- InfluxDB
- Telegraf
- Grafana
- dotNet Influx Metrics Publisher

### Reference:
Thanks to Pete Shima's [medium post](https://medium.com/@petey5000/monitoring-your-home-network-with-influxdb-on-raspberry-pi-with-docker-78a23559ffea) that helped greatly in setting this up.

# [Docker](https://www.docker.com)

Install docker by running the following commands
```
$ cd download/
$ curl -fsSL get.docker.com -o get-docker.sh
$ sudo sh get-docker.sh
```

Confirm that it's working
```
$ sudo docker --version
Docker version 18.09.0, build 4d60db4
```

If you're willing to take the security risk as [outlined here](https://docs.docker.com/engine/security/security/#docker-daemon-attack-surface) you can execute `docker` commands without the `sudo` prefix

```
$ sudo usermod -aG docker $USER
```

Logout and connect again for the changes to take effect, and test with the command below
```
$ docker run hello-world
```

# [InfluxDB](https://www.influxdata.com/)

Running InfluxDB with auto-restart in the event of a 
restart
```
$ sudo docker run -d --name=influxdb --net=host --restart always --volume=/var/influxdb:/data hypriot/rpi-influxdb 
```

# [Telegraf](https://docs.influxdata.com/telegraf)

```
$ wget https://dl.influxdata.com/telegraf/releases/telegraf_1.7.0-1_armhf.deb
$ sudo dpkg -i telegraf_1.7.0-1_armhf.deb
$ rm telegraf_1.7.0-1_armhf.deb
$ sudo systemctl status telegraf
```

This would have installed Telegraf as a service, so let's confirm this:
```
$ sudo systemctl status telegraf
```

Note the `-config` parameter value of `/etc/telegraf/telegraf.conf`. We are going to want to update this.

# [Grafana](https://grafana.com/)

```
[ A ] Grafana Admin password
```

Persistent storage for Grafana so it all comes back to
life when we reboot, or when the docker image is upgraded in future 
```
$ sudo docker run -d -v /var/lib/grafana --name grafana-storage busybox:latest
```
Running Grafana with auto-restart

> Consider using the official Grafana Docker imagine instead.
Currently it's yet to be released so need to pull the master image. Replace the `fg2it/grafana-armhf:v4.1.2` with `grafana/grafana:master`

```
$ sudo docker run -d --net=host --restart always --name grafana --volumes-from grafana-storage fg2it/grafana-armhf:v4.1.2
```

## Bleeding edge
```
docker volume create grafana-storage-master
```

> You can add the `-e "GF_SECURITY_ADMIN_PASSWORD=PASSWORD_[A]" \` right after the `-d \` argument to change the `admin` user's default password of `admin`. 

```
 docker run \
    -d \
    --name grafana-master \
    -v grafana-storage-master:/var/lib/grafana \
    --restart always \
    --net=host \
    grafana/grafana:master
```

# Handy commands

Copy putty text to clipboard
* *Clear Scrollback*
* *Reset Terminal*
* cat file.txt
* *Copy All to Clipboard*

------

<< Back: [Bonus guides](raspibolt_60_bonus.md) 
