---
layout: default
title: Configure UPS NUT
parent: + Raspberry Pi
grand_parent: Bonus Section
nav_exclude: true
has_toc: false

---

## Bonus Guide: Configure NUT to safely shutdown your node
{: .no_toc }

---

Have your RaspiBolt safely shutdown when a connected UPS reaches a critical power level.

Difficulty: Easy’ish
{: .label .label-yellow }

Status: Not tested v3
{: .label .label-red }

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

### Install NUT on a Single Device

This is to use Network UPS Tools (NUT; https://networkupstools.org/ ) in order to safely shutdown your node in the event of a power outage. This is confirmed to work on Raspberry Pi using Rasperry Pi Lite OS, but should work for those using other systems as well. Special attention may be needed to ensure the shutdown command is appropriate for your OS.

NUT is nice in that it allows for a single device to communicate to other devices to safely shut them down (client-server relationship). For this scenario, ensure your UPS data port is plugged into the Raspberry Pi.

Verify you can view the UPS device

`$ lsusb`

Install NUT.

`$ sudo apt-get install nut`

Go the NUT site https://networkupstools.org/stable-hcl.html and find the driver for your UPS. If you cannot find your device, try `usbhid-ups` as it appears to be a default driver that may or may not work for you.
It’s time to configure the UPS. The `UPS-Name` is whatever you want to call it. Port should be set to auto. Desc is whatever you want to describe it, though probably unnecessary unless you work with multiple UPS.

NOTE: Depending on the driver/hardware of your system, you may need to comment out maxretry. If you receive a fatal error during the process that 'maxretry' is not a valid variable name, you'll want to comment it out while performing the below step. You can also consult the NUT user manual online at https://networkupstools.org/docs/user-manual.chunked/index.html

`$ sudo nano /etc/nut/ups.conf`

```
[UPS-Name]
	driver = usbhid-ups
	port = auto
	desc = “UPS Make Model or whatever”
```

Configure the daemon to know what all it needs to run (ie. Server, client, etc). The assumption for this scenario is you’re running a single device directly connected to the data port of the UPS and do not care about any other devices connected to the UPS (in terms of shutting them down).

`$ sudo nano /etc/nut/nut.conf`

```
MODE=standalone
```

Start the service. If successful, you should get a list of drivers used.

`$ sudo upsdrvctl start`

Check status to verify service is active.

`$ sudo service nut-server restart`
`$ sudo service nut-server status`

Use the `upsc` command to view additional status. Replace `UPS-Name` with whatever you used in `ups.conf`. You should see the configuration of the UPS.

`$ upsc UPS-Name`

Configure the monitor that will alert watch, alert, and shutdown the device if needed. Define two users. The admin basically gets the rights to rwx while the monitor is more like r only. You can name them whatever you wish, but leave the configuration of `upsmon master` alone. This is identifying this device as being directly connected to the USB data port.

`$ sudo nano /etc/nut/upsd.users`

```
[admin]
	password = secretpassword
	actions = SET
	instcmds = ALL
[upsmon] 
	password = secretpassword1
	upsmon master
```

Modify upsmon.conf with what it should do as events occur. Pretty large config file, but the primary item to find is the MONITOR area (capital letters are necessary). You’re telling it to monitor your UPS that is locally connected. The 1 is the power value and shouldn’t be changed unless you’re connected to multiple UPS (not typical). You then use the `upsmon` username and password you configured in `upsd.users` and the master indicates that it’ll shut down this computer last (which is fine since this is a single node application)

`sudo nano /etc/nut/upsmon.conf`

```
MONITOR UPS-Name@localhost 1 upsmon secretpassword1 master
```

Other items of interest in `upsmon.conf`
	
* NOTIFYFLAG section. I like to uncomment ONLINE and ONBATT so that we see state changes in the UPS

* Review SHUTDOWNCMD and ensure it works based on your OS. I believe it determine best command during install

NUT creates user/group nut in install, so we’re going to limit access to nut and root to view UPS user permissions and configuration.

```
$ sudo chown nut:nut /etc/nut/*
$ sudo chmod 640 /etc/nut/upsd.users /etc/nut/upsmon.conf
```

Restart daemons

```
$ sudo service nut-server restart
$ sudo service nut-client restart
```

View available commands of UPS. Might come in handy to silence the alarm. Replace `UPS-Name` with the name you used in `ups.conf`.
```
$ upscmd –l UPS-Name
```
---

### Testing
Unplug the UPS from the wall and you should get a system alert on your console or terminal window (assuming you are logged in to your Raspibolt) that the system is now running on battery power. If you plug it back in, you should get notified that it’s back “on line power”.
For the real test, unplug the UPS and let it drain. To speed the process up, plug in a laptop, lamp, etc. Check for status of the battery by running the below.
```
$ upsc UPS-NAME
```
Most models will have a field that is called `battery.charge` that you can monitor progress on.
You may also want to recall you can disable the alarm on many models. Find the variable on your system with `upscmd –l UPS-Name`. You can then mute it using the applicable command. Common example below. You’ll be prompted for a username and password. Use the admin and password you defined in `upsd.users`.
```
upscmd UPS-Name beeper.mute
```
Note: If you see an option for `beeper.disable`, that will permanently turn off the audible alert. To re-enable, use `beeper.enable` or whatever applicable variable you see.

---
### Multiple Devices on a single UPS
Whichever system has the UPS data port plugged into it is the server/master and the device(s) plugged into the UPS, but not with a data connection to the UPS are the client/slave.

Reconfigure the server. Change the mode from `standalone` to `netserver`.

```
$ sudo nano /etc/nut/nut.conf
```
```
MODE=netserver
```
Add a new user for upsmon on the client to use to access the server status. Append it to the end after `upsmon` (or whatever you named your previous monitoring user). Note that we tag it as slave so it knows it’s has to get its status from the master (server).
```
$ sudo nano /etc/nut/upsd.users
```
```
[upsmon-remote]
	password = secretpassword2
	upsmon slave
```
Modify `upsd.conf` to tell the server to listen for connections. The loopback is for ‘localhost’ connections. Change 192.168.1.2 to be whatever address you have assigned to the server. If you get settings dynamically from DHCP, you’ll need to configure a means to set a static address. Or modify /etc/hosts on multiple systems. 3493 is the default port that NUT uses. It seems silly to have to use both addresses, but it’s been the only way I’ve had success in a server/client configuration.
```
$ sudo nano /etc/nut/upsd.conf
```
```
LISTEN 127.0.0.1 3493
LISTEN 192.168.1.2 3493
```

Modify the firewall to allow for 3493 to come into your system.
```
$ sudo ufw allow 3493/tcp comment ‘all UPS NUT Client’
$ sudo ufw status
```

Reload the server daemons to have it read the new configuration.
```
$ sudo service nut-server restart
$ sudo service nut-client restart
```

In another window, open a terminal to the client system.
```
client$ sudo apt-get install nut
```

Modify `nut.conf` to be the netclient.
```
client$ sudo nano /etc/nut/nut.conf
```
```
MODE=netclient
```

Modify `upsmon.conf` to get updates from the server. Modify `192.168.1.2` to match the IP of the server (that you added the LISTEN statement to `upsd.conf` on server). Note the slave designation. This will have NUT issue the shutdown command to the slave first and the master last.
```
client$ sudo nano /etc/nut/upsmon.conf
```
```
MONITOR UPS-Name@192.168.1.2 1 upsmon-remote secretpassword2 slave
```

Now permissions cleanup. No passwords in `upsd.users`, so no change of permissions for that file.
```
client$ sudo chown nut:nut /etc/nut/*
client$ sudo chmod 640 /etc/nut/upsmon.conf
```

Restart daemon
```
client$ sudo service nut-client restart
```

Check connectivity with NUT master
```
client$ sudo upsc UPS-Name@192.168.1.2
```

You should now see the configuration of the UPS.
Proceed to test the system with the disconnect/reconnect power or do the full outage testing. Be sure to keep terminal windows open to master and slave to watch as it happens. If configured properly, the client will shutdown first, followed by the server, when the UPS battery is approaching empty. The server will shutdown 5 seconds later (configurable on server’s `/etc/nut/upsmon.conf` with the `FINALDELAY` field if you want to run other scripts on the server prior to shutdown.

------

<< Back: [+ Raspberry Pi](index.md)
