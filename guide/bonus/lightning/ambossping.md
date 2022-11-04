---
layout: default
title: ambossping
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

# Bonus guide: ambossping
{: .no_toc }

---

AmbossPing is a simple bash script that sends node health check pings to amboss.space. Additionally, if you have your telegram account linked to your profile in amboss.space, you will receive notifications every time the health check status of your node has been changed. For all of that, you don't need to have Thunderhub installed.
The script is based on Carsten Otto's [bash](https://gist.github.com/C-Otto/cd5d7b0e67fc2e3e212cf13a558b101f) with added reporting for better troubleshooting of the reported statuses if needed.

Difficulty: Easy
{: .label .label-green }

Status: Tested v3
{: .label .label-green }

---

Table of contents
{: .text-delta }

1. TOC
{:toc}

---

## Requirements

* LND
* cron

---

## Setup AmbossPing

* With user “admin”, create a new user “ambossping” and make it a member of the “lnd” group

  ```sh
  $ sudo adduser --disabled-password --gecos "" ambossping
  $ sudo adduser ambossping lnd
  ```

* With the “ambossping” user map the LND folder

  ```sh
  $ sudo su - ambossping
  $ ln -s /data/lnd /home/ambossping/.lnd
  ```

---

## Set the script

* Edit the config file and make sure you have the following changes in the beginning.

  ```sh
  $ nano /home/ambossping/ping.sh
  ```

  ```sh
  #!/bin/bash
  URL="https://api.amboss.space/graphql"
  NOW=$(date -u +%Y-%m-%dT%H:%M:%S%z)
  echo "Timestamp: ${NOW}"
  SIGNATURE=$(/usr/local/bin/lncli signmessage "$NOW" | jq -r .signature)
  echo "Signature: ${SIGNATURE}"
  JSON="{\"query\": \"mutation HealthCheck(\$signature: String!, \$timestamp: String!) { healthCheck(signature: \$signature, timestamp: \$timestamp) }\", \"variables\": {\"signature\": \"$SIGNATURE\", \"timestamp\": \"$NOW\"}}"
  echo "Sending ping..."
  echo "$JSON" | curl -s -f --data-binary @- -H "Content-Type: application/json" -X POST --output /dev/null $URL
  exitstatus=$?
  if [ $exitstatus -ne 0 ]
  then
   echo "${NOW} - Error: ${exitstatus}"
  else
   echo "${NOW} - Ping sent"
  fi
  echo " "
  ```

* Make the script executable (check by displaying the file name, it should have become green)

  ```sh
  $ chmod +x /home/ambossping/ping.sh
  ```
  
---

## Test run

* Run the script (while in "ambossping" user session)

  ```sh
  $ ./ping.sh
  ```

You should see something like this in terminal.

  ```ini
  Timestamp: 2022-10-27T15:53:33+0000
  Signature: d71y...uduf
  Sending ping...
  2022-10-27T15:53:33+0000 - Ping sent
  ```
 
---

## Schedule the ping

* While in an “ambossping” user session and open the crontab to create a new job.

  ```sh
  $ crontab -e
  ```

  Depending on what you have selected in your [amboss monitoring dashboard](https://amboss.space/owner?page=monitoring), you would like to schedule your script to send pings on preselected intervals. The ambossping crontab should be clean at this point, so add the following at the bottom:
 
  ```ini
  * * * * * /home/ambossping/ping.sh >> /home/ambossping/ping.log
  ```
  This will execute the bash script every minute.

  🚨 Setting up the cronjob like this will send the pings via clearnet - meaning amboss.space will know where the ping comes from. You can prevent revealing this information by either tunneling all traffic of your node via VPN or setup your cronjob to use Tor. Be aware that running the ping via Tor will cause some false-positives depending on the health of the Tor network status and availability, which will not represent the availability of your node.

  ```ini
  * * * * * /usr/bin/torsocks /home/ambossping/ping.sh >> /home/ambossping/ping.log
  ```

  Currently ambos.space gives the option to report every 1, 3, 5, 15, 30 minutes, and 1 hour. If you want to report on different than 1 min intervals, set the beginning of the line in your cron tab as follows:

  ```ini
  */3 * * * * - for sending a ping every 3 minutes
  */5 * * * * - for sending a ping every 5 minutes
  */5 * * * * - for sending a ping every 15 minutes
  */30 * * * * - for sending a ping every 30 minutes
  0 * * * * - for sending a ping every hour
  ```

---

## Error logs

* Ths script has an error reporting capability that will allow you to troubleshoot better if there are issues reported by the amboss health check.

You can check for errors in the log file with:

  ```sh
  $ cat ping.log | grep  Error
  ```

  This will show you a list with all collected errors along with the respective time stamp. 
  
  Here we use the curl exit statuses registered after the execution. The most common that can be observed are:

  - **Error: 6** - Couldn't resolve host. The given remote host's address was not resolved.
  - **Error: 22** - HTTP page not retrieved.
  - **Error: 35** - A TLS/SSL connect error. The SSL handshake failed.
  - **Error: 56** - Failure in receiving network data.

  You can find additional information about the Exit Statuses on the [curl documentation](https://everything.curl.dev/usingcurl/returns) site.

  Please remember that the error messages of curl are not explicit and are not always 100% correct. From the error messages, you could make some assumptions about the issues you may experience are caused. From the errors mentioned above, only **Error: 35** leads to remote side issues, though.

---

## Uninstall

* If you want to remove the ambossping and stop reporting health status with this script, delete the “ambossping” user with the “root” user.

  ```sh
  $ sudo su - root

  $ userdel -r ambossping
  ```