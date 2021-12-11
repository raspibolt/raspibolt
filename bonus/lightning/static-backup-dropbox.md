---
layout: default
title: Static Channel Backups
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

## Bonus guide: Automatic backup of static.channel to your Dropbox
{: .no_toc }

Difficulty: Easy
{: .label .label-green }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

Since lnd V0.6, Static Channel Backups (SCB) is supported. In a nutshell, every time a channel changes, lnd writes a new copy of the channels.backup file. For more details, see v0.6-beta Release Notes
This guide explains one way to automatically upload the channels.backup file on changes, to your Dropbox
The following scripts were created by [Vindard](https://github.com/vindard)

#### *Risk : Minimal* 
The channel.backup file is encrypted so that it is safe to transmit over the Internet and to store on (e.g.) a cloud server.

#### *Requirements: lnd version higher than 0.6*

### Setup Dropbox API Key

In your web browser, do the following:

1. Go to https://www.dropbox.com/developers/apps/create and sign in
2. For section 1 (_Choose an API_), select **Scoped access NEW**
3. For section 2 (_Choose the type of access you need_), select **App Folder**
4. For section 3 (_Name your app_), name your app and click **Create App** to proceed<br/>![Dropbox API 1](https://i.postimg.cc/7hSqGFmL/pic1.jpg)
5. Go to the **Permission** tab, and in the **Files and folders** section, select **files.metadata.write**, **files.content.write** and **files.content.read**
6. Click the **Submit** button in the pop-up window at the bottom of the screen.<br/>![Dropbox API 1](https://i.postimg.cc/fRQkWKWC/pic2.jpg)
7. Go back to the **Settings** tab, scroll down to **OAuth 2**
8. For **Access token expiration**, select **No expiration**
9. Click **Generate**<br/>![Dropbox API 1](https://i.postimg.cc/xdJ6nn6B/pic3.jpg)
10. You will now see a string of letters, numbers and special characters appear. This is your **Api Token**. Copy this token and keep it safe for the next steps. This api token will be referenced as `<dropbox-api-token>` in the next step.

### Preparation on the RaspiBolt
As user "admin", download the script, make it executable and move to the global bin folder.

```bash
$ cd /tmp/
$ wget https://gist.githubusercontent.com/vindard/e0cd3d41bb403a823f3b5002488e3f90/raw/4bcf3c0163f77443a6f7c00caae0750b1fa0d63d/lnd-channel-backup.sh

# check script & modify with your <dropbox-api-token> (third line, place the token string inside the double quotes)
$ sudo nano lnd-channel-backup.sh

$ sudo chmod +x lnd-channel-backup.sh
$ sudo mv lnd-channel-backup.sh /usr/local/bin
```

### Setup script as `systemd` service (start automatically on system startup)

`$ sudo nano /etc/systemd/system/backup-channels.service`

```ini
[Service]
ExecStart=/usr/local/bin/lnd-channel-backup.sh
Restart=always
RestartSec=1
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=backup-channels
User=root
Group=root

[Install]
WantedBy=multi-user.target
```

Start

`$ sudo systemctl start backup-channels`

Monitor

`$ sudo journalctl -fu backup-channels`

Run at boot

`$ sudo systemctl enable backup-channels`

### Test
You will now cause the channel.backup to change and see if the copy gets uploaded to your webserver.

`$ sudo touch /home/bitcoin/.lnd/data/chain/bitcoin/mainnet/channel.backup`

Logon to your dropbox and see if you have a new file.

------

<< Back: [+ Lightning](index.md)
