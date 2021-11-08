---
layout: default
title: charge-lnd
parent: Bonus Section
nav_order: 140
has_toc: false
---
# Bonus guide: Charge-lnd

*Difficulty: simple*

[Charge-lnd](https://github.com/accumulator/charge-lnd) is a simple policy based fee manager for LND.

*Requirements:*

* LND (or LND as part of Lightning Terminal/litd)

*Acknowledgments:*

* This guide was built based on the guides by The Count on [nullcount.com](https://nullcount.com/install-charge-lnd-routing-fees-on-autopilot/) and by the [Plebnet Wiki guide](https://plebnet.wiki/wiki/Fees_And_Profitability#Installing_Charge-Lnd).

## Install charge-lnd

* As recommended in the [charge-lnd repository](https://github.com/accumulator/charge-lnd/blob/master/INSTALL.md#installation), we do not need to have full admin rights to use charge-lnd. The following access rights are used:
  * `offchain:read`
  * `offchain:write`
  * `onchain:read`
  * `info:read`

* We can create (or 'bake') a suitably limited macaroon with the "admin" user
 
  ```sh
  $ lncli bakemacaroon offchain:read offchain:write onchain:read info:read --save_to=~/.lnd/data/chain/bitcoin/mainnet/charge-lnd.macaroon
  ```
  
* We create a "charge-lnd" user and we make it part of the "bitcoin" group (to be able to interact with LND)  

  ```sh
  $ sudo adduser charge-lnd
  $ sudo /usr/sbin/usermod --append --groups bitcoin charge-lnd
  ```
  
* With the "charge-lnd" user, clone the charge-lnd repository, enter the directory and install the program and required packages using `pip3` (do _not_ forget the dot at the end of the pip command!)

  ```sh
  $ sudo su - charge-lnd
  $ git clone https://github.com/accumulator/charge-lnd.git
  $ cd charge-lnd
  $ pip3 install -r requirements.txt .
  ```

* Test if the installation was successful by running the program with the --help (or -h) flag

  ```sh
  $ ~/.local/bin/charge-lnd -h
  >usage: charge-lnd [-h] [--lnddir LNDDIR] [--grpc GRPC]
  >                  [--electrum-server ELECTRUM_SERVER] [--dry-run] [--check]
  >                  [-v] -c CONFIG
  >
  >optional arguments:
  >  -h, --help            show this help message and exit
  >  --lnddir LNDDIR       (default ~/.lnd) lnd directory
  >  --grpc GRPC           (default localhost:10009) lnd gRPC endpoint
  >  --electrum-server ELECTRUM_SERVER
  >                        (optional, no default) electrum server host:port .
  >                        Needed for onchain_fee.
  >  --dry-run             Do not perform actions (for testing), print what we
  >                        would do to stdout
  >  --check               Do not perform actions, only check config file for
  >                        valid syntax
  >  -v, --verbose         Be more verbose
  >  -c CONFIG, --config CONFIG
  >                        path to config file
  ```

* We are going to create a simlink to the LND directory. We'll place the link in the home directory of the "charge-lnd" user to match the default LND directory used by charge-lnd (~/.lnd) 

  ```sh
  $ ln -s /mnt/ext/lnd/ /home/charge-lnd/.lnd
  ```

## Configuration file

* Create a configuration file that we will call charge-lnd.config

  ```sh
  $ nano charge-lnd.config
  ```

* For this example, we will use a policy that: 
  1. Defines some default parameters
  2. Then starts by looking at channels with very low outbound to apply a very large base fee that will prevent any attempted forward through the channel (and therefore avoid failures)
  3. Then ignores some channels that we want to deal with manually (e.g. a large liquidity sink)
  4. And finally apply a fixed fee rate for two groups of channels
  
* Warning: The policy below is just an example, _do_ change the policy according to your own strategy and needs! All the options are listed and described [here](https://github.com/accumulator/charge-lnd)

  ```ini
  #################################################
  # Charge-lnd - Automatic fee policy adjustement #
  #################################################

  ## COMMANDS TO TEST YOUR FEE STRATEGY
  # ~/.local/bin/charge-lnd -c ~/charge-lnd/charge-lnd.config --check
  # ~/.local/bin/charge-lnd -c ~/charge-lnd/charge-lnd.config --dry-run

  ## FEE STRATEGY

  [1_defaults]
  # place holder for your defaults for your fee policies
  # no strategy, so this only sets some defaults
  base_fee_msat = 1000
  min_fee_ppm_delta = 20
  min_htlc_msat = 1000
  max_htlc_msat_ratio = 1
  time_lock_delta = 40

  [2_9999_basefee_policy]
  # '9999BaseFee' should be evaluated first before other fees are set
  # e.g. if local balance is <500,000 sats, increase base fees very high
  chan.max_local_balance = 500000
  strategy = static
  base_fee_msat = 9999000

  [3_ignore_policy]
  # This policy is for ignoring specific nodes (e.g. a LOOP channel that we want to control manually)
  # The pubkey of the choosen nodes have to be listed below, separated with a comma
  node.id = <node_pubkey_1>,
	<node_pubkey_2>
  strategy = ignore

  [4_low_fees_policy]
  node.id = <node_pubkey_3>,
	<node_pubkey_4>,
	<node_pubkey_5>
  strategy = static
  fee_ppm = 50
  
  [5_high_fees_policy]
  node.id = <node_pubkey_6>,
	<node_pubkey_7>
  strategy = static
  fee_ppm = 200
  ```

* We can first test if the syntax is correct or if it contains some errors using the --check option.
We also have to indicate where the config file is located using the --config (or -c) option

  ```sh
  $  ~/.local/bin/charge-lnd -c ~/charge-lnd/charge-lnd.config --check
  > Configuration file is valid
  ```

* Then we can do a dry-run test which will print out what changes the program would apply of it was to be run.
A small report will be displayed for each channel policy that should be updated.
Adding the --verbose (or -v) option would add aditional information such as if the channel is enabled or disabled.

  ```sh
  $  ~/.local/bin/charge-lnd -c ~/charge-lnd/charge-lnd.config --dry-run
  > 123456x123x1  [<noda_alias>|<node_pukkey>]
  >  policy:          2_9999_basefee_policy
  >  strategy:        static
  >  base_fee_msat:   0 ➜ 9999000
  >  [...]
  ```

* Check each channel to see if the proposed updates are the intended one.
If not, amend the charge-lnd config and re-do dry-run tests until you arrive to the desired results

* Once we are happy with our fee policy and logic, we can manually apply it to our node by running the same command but without the --dry-run test.
Then exit the charge-lnd user.

  ```sh
  $  ~/.local/bin/charge-lnd -c ~/charge-lnd/charge-lnd.config
  $ exit
  ```

* Double-check the fee policy on all your channels to ensure that you are happy with the changes!

## Automatic fee updates

We can make the script run automatically at regular time intervals by using a cron job. For example, we could run the charge-lnd program every 12 hours.

Warning: It is not in your interest, nor in the interest of the wider network, to set up very short intervals between each policay change. Frequent channel policy update spams the LN gossip network and results in less accurate LN graphs overall as it takes a long time for a policy update to reach most of the nodes in the network.

* We the admin user, create and edit (option -e) the crontab file of the charge-lnd user (option -u). 
If asked, select the /bin/nano text editor (type 1 and enter)

  ```sh
  $ sudo crontab -u charge-lnd -e
  ```

* At the end of the file, paste the following lines. Then save (Ctrl+o) and exit (Ctrl+x)

  ```ini
  ##########################################
  # 1 - Fee policy updates with charge-lnd #
  ##########################################

  # Run charge-lnd every 12 hours at the 21st minute; and log the updates in the /tmp/my_charge-lnd.log log file
  21 */12 * * * /home/charge-lnd/.local/bin/charge-lnd -c /home/charge-lnd/charge-lnd/charge-lnd.config > /tmp/my_charge-lnd.log 2>&1; date >> /tmp/my_charge-lnd.log 
  ```

  * The stars and numbers at the start defines the interval at which the job will be run. You can double-check it by using this online tool: [https://crontab.guru](https://crontab.guru/#21_*/4_*_*_*). 
  * `/home/umbrel/.local/bin/charge-lnd -c /home/umbrel/charge-lnd/myconfig` is the command to be run and where to find it (its path) together with the required option(s) (here the location of the configuration file). 
  * `> /tmp/charge-lnd.log 2>&1; date >> /tmp/charge-lnd.log` records the updates in a charge-lnd.log log file, including the Standard Error and Standard Out and with a timestamp.

## Checking the logs

If you need to check the log files:

* Use `less` to read the entire log file. Type "g" to go the start of the log, "G" to the end, use the arrows to move up and down and exit by pressing "q".
* You can search for a specific string by typing "?" followed by the string to be searched (e.g. a node alias) and then press enter.

  ```sh
  $ less /tmp/my_charge-lnd.log
  ```

* To look for updates of a specific channel

  ```sh
  $ cat /tmp/my_charge-lnd.log | grep -A 7 <node_alias>
  ```

# Upgrade

* Let's check what is the latest available version at [https://github.com/accumulator/charge-lnd/releases](https://github.com/accumulator/charge-lnd/releases) and let's find what version of charge-lnd we are running

  ```sh
  $ sudo su - charge-lnd
  $ pip3 show charge-lnd
  > Name: charge-lnd
  > Version: 0.2.5
  ```

* If a newer version exists (e.g. v0.X.X)
  
  ```sh
  $ git fetch
  $ git checkout v0.X.X
  $ python -m pip install --upgrade requirements.txt .
  ```

# Uninstall

If you want to uninstall charge-lnd:

* Log in with the "root" user and delete the "charge-lnd" user

  ```sh
  $ sudo su -
  $ userdel -r charge-lnd
  ```
