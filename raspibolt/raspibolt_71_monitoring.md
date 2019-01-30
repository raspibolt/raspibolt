[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [**Bonus**](raspibolt_60_bonus.md) ] -- [ [Troubleshooting](raspibolt_70_troubleshooting.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

## Bonus guide: Performance Monitoring
*Difficulty: intermediate*

> Guide by [Badokun](https://github.com/badokun)  
> Reference: Thanks to Pete Shima's [medium post](https://medium.com/@petey5000/monitoring-your-home-network-with-influxdb-on-raspberry-pi-with-docker-78a23559ffea) that helped greatly in setting this up.

It's useful to have insights into RaspiBolt's performance metrics. This may help in debugging all sorts of potential problems, e.g. network latency, CPU performance, block propagation etc. 

Observing anomolies and doing performance tuning is greatly improved when you have these insights.

### Overview

There are a few required pieces to get this working. They are:
- Docker
- InfluxDB
- Telegraf
- Grafana

## Docker
[Docker](https://www.docker.com) is a computer program that performs operating-system-level virtualization, also known as "containerization". It was first released in 2013 and is developed by Docker, Inc. (source: [Wikipedia](https://en.wikipedia.org/wiki/Docker_(software)))

* Install Docker by executing the official install script.
  ```
  $ cd /home/admin/download
  $ curl -fsSL get.docker.com -o get-docker.sh
  $ sudo sh get-docker.sh
  ```

* Confirm that Docker is installed correctly.
  ```
  $ docker --version
  Docker version 18.09.0, build 4d60db4
  ```

* Restart your RaspiBolt for the changes to take effect and connect as user "admin".
  ```
  $ sudo shutdown -r now
  ```

* Now test Docker by running the "Hello world" image. As it is not yet locally available, Docker automatically retrieves it from the [Docker Hub](https://hub.docker.com/), starts it up and executes the container. You might need to use "sudo" if you skipped the "usermod" step above.
  ```
    $ sudo docker run hello-world
  ```
  ![Output of Docker hello-world container](images/71_Docker_hello-world.png)

## InfluxDB
[InfluxDB](https://www.influxdata.com/) is an open-source time series database (TSDB) developed by InfluxData. It is written in Go and optimized for fast, high-availability storage and retrieval of time series data in fields such as operations monitoring, application metrics, Internet of Things sensor data, and real-time analytics. (source: [Wikipedia](https://en.wikipedia.org/wiki/InfluxDB)) 

* Start the InfluxDB Docker image with auto-restart in the event of a system restart.
  ```
  $ sudo docker run -d --name=influxdb --net=host --restart always --volume=/var/influxdb:/data hypriot/rpi-influxdb 
  ```

* Add a retention policy so we don't have to worry about the InfluxDb growing in size
  ```
  $ sudo docker ps
  CONTAINER ID        IMAGE                       COMMAND                  CREATED             STATUS              PORTS               NAMES
  b9f31d893601        hypriot/rpi-influxdb        "/usr/bin/entry.sh /…"   5 minutes ago       Up 5 minutes                              influxdb
  ```

* Use the influxdb `CONTAINER ID`, in the example above it's `b9f31d893601`, to open the Influx commandline interface. Enter the commands on lines with `>` directly into the CLI, without the `>`. 
  ```
  $ docker exec -it b9f31d893601 /usr/bin/influx
  > CREATE DATABASE telegraf
  > USE telegraf
  Using database telegraf
  > CREATE RETENTION POLICY "six_months" ON "telegraf" DURATION 180d REPLICATION 1 DEFAULT
  > SHOW RETENTION POLICIES ON "telegraf"
  name       duration  shardGroupDuration replicaN default
  ----       --------  ------------------ -------- -------
  autogen    0s        168h0m0s           1        false
  six_months 4320h0m0s 168h0m0s           1        true
  
  > exit
  ```

## Telegraf 
[Telegraf](https://docs.influxdata.com/telegraf) is a plugin-driven server agent for collecting & reporting metrics. It has output plugins to send metrics to a variety of other datastores, services, and message queues, including InfluxDB. 

* Download and install the Telegraf package.
  ```
  $ cd /home/admin/download
  $ wget https://dl.influxdata.com/telegraf/releases/telegraf_1.7.0-1_armhf.deb
  $ sudo dpkg -i telegraf_1.7.0-1_armhf.deb
  $ rm telegraf_1.7.0-1_armhf.deb
  ```

* Telegraf is now installed service. Confirm and check if the program has been started successfully. Press `Ctrl-C` to exit.
  ```
  $ sudo systemctl status telegraf
  ```

* Configure Telegraf by downloading this custom [`telegraf.conf`](https://raw.githubusercontent.com/Stadicus/guides/master/raspibolt/resources/telegraf.conf) so that it publishes the data we can use later in the Grafana dashboard.

  ```
  $ cd /etc/telegraf/
  $ sudo mv telegraf.conf telegraf.conf.bak
  $ sudo wget https://raw.githubusercontent.com/Stadicus/guides/master/raspibolt/resources/telegraf.conf
  $ sudo systemctl restart telegraf
  ```

## Grafana
[Grafana](https://grafana.com/) is an open source platform for time series analytics and monitoring. 

* Write down a strong password to access Grafana administration features
  ```
  [ E ] Grafana Admin password
  ```

* Create persistent storage for your Grafana configurationso, keeping it also during future upgrades.
  ```
  $ sudo docker volume create grafana-storage
  ```

* Run the Grafana's docker image, replacing the `admin` password setting `PASSWORD_[E]` with your password. This will be used when logging into Grafana's UI. Copy / paste all lines at once into your terminal.

  ```
  $ sudo docker run \
    -d \
    -e "GF_SECURITY_ADMIN_PASSWORD=PASSWORD_[E]" \
    --name grafana \
    -v grafana-storage:/var/lib/grafana \
    --restart always \d
    --net=host \
    grafana/grafana:5.4.3
  ```

* Confirm Grafana is running as a docker container. 
  ```
  $ sudo docker ps
  ```
  ```
  CONTAINER ID        IMAGE                    COMMAND                  CREATED              STATUS              PORTS               NAMES
  3194df6aff01        grafana/grafana:master   "/run.sh"                About a minute ago   Up About a minute                       grafana
  b9f31d893601        hypriot/rpi-influxdb     "/usr/bin/entry.sh /…"   30 minutes ago         Up 30 minutes                              influxdb
  ```

* To access the analytics webpage, we need to modify the firewall configuration to allow incomming connections to port 3000. 
> Note the IP address range, yours may be 192.168.1.0/24 or different (see [base guide](raspibolt_20_pi.md#enabling-the-uncomplicated-firewall) for further information).
  ```
  $ sudo ufw allow from 192.168.0.0/24 to any port 3000 comment 'allow grafana from local LAN'
  ```

At this point the basic setup is complete and we can start to setup a Grafana Dashboard. Browse to `http://192.168.0.20:3000` in your browser (use the IP address of your RaspiBolt) and log in with `admin` and `PASSWORD_[E]`. 

![Grafana Home](images/71_grafana-home.jpg)

### Add a data source

Click on "Add data source", then "InfluxDB". Enter `telegraf` into the Database field

![Grafana Data Source](images/71_grafana-datasource.jpg)

### Add a Dashboard

* Locate the shortcut to the left of the page and click on Manage

  ![Grafana Dashboard Menu](images/71_grafana-manage-dashboard-menu.jpg)

* Importing an existing Dashboard

  ![Grafana Dashboard Menu](images/71_grafana-manage-dashboard-import-menu.jpg)

* Enter the Grafana Dashboard Id of `9653` and click Load
  ![Grafana Dashboard Menu](images/71_grafana-manage-dashboard-import.jpg)

* Select the InfluxDB from the drop down list and click on Import
  ![Grafana Dashboard Menu](images/71_grafana-manage-dashboard-import-done.jpg)

## You should see the dashboard in all its glory

![Grafana Dashboard Menu](images/71_grafana-manage-dashboard-success.jpg)

> Once you've successfully completed this guide on performance monitoring, you can take things to the next level by following 
[Running on RaspiBolt](https://github.com/badokun/lightning-metrics#running-on-raspibolt) section of the [lightning-metrics](https://github.com/badokun/lightning-metrics) project. This will give you additional metrics on the Lightning Network's status.

------

<< Back: [Bonus guides](raspibolt_60_bonus.md) 
