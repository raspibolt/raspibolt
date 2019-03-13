Configure LND Node to work with ZAP for IOS wallet.

Step A: Prepare LND Node for gRPC access…

First use the same access settings as needed for the Shango wallet...
Tell LND to listen for gRPC communication. 
Login as admin onto the LND node.

Add the following line to your lnd configuration file in the section [Application Options]

$ sudo nano /home/bitcoin/.lnd/lnd.conf
rpclisten=0.0.0.0:10009

Open UFW port 10009 so that ZAP-IOS wallet can talk to your Lightning node.
Modify UFW to only from within the local network (The line sudo ufw allow from 192.168.0.0/24… below assumes that the IP address of your Pi is something like 192.168.0.???, the ??? being any number from 0 to 255. If, for example, your IP address is 12.34.56.78, you must adapt this line to sudo ufw allow from 12.34.56.0/24…., see more details)

$ sudo ufw allow from 192.168.0.0/24 to any port 10009 comment 'allow LND grpc from local LAN'

$ sudo ufw enable
$ sudo ufw status

Restart LND and unlock wallet

$ sudo systemctl restart lnd
$ lncli unlock

Step B: Install Go…
Install Go on Raspberry Pi….

Update your Pi...

$ sudo apt-get update
$ sudo apt-get upgrade

download Go binaries…

$ cd download
$ wget https://dl.google.com/go/go1.11.linux-armv6l.tar.gz

unpack Go…

$ sudo tar -xvf go1.11.linux-armv6l.tar.gz

copy Go to env folder…

$ sudo mv go /usr/local

Setup environment variables…(for this session only)

$ export GOROOT=/usr/local/go
$ export GOPATH=$HOME/gocode
$ export PATH=$GOPATH/bin:$GOROOT/bin:$PATH
 
Step C: Install LND Connect….

$ go get -d github.com/LN-Zap/lndconnect
$ cd $GOPATH/src/github.com/LN-Zap/lndconnect
$ make

Step D: Create QR code to read with ZAP for IOS wallet…

The next assumes you have copied the TLS cert and admin macaroon to the admin user as mentioned in the RaspiBolt Lightning guide.

run LNDConnect with path to the macaroon…

$ lndconnect --lnddir=/home/bitcoin/.lnd --adminmacaroonpath=/home/admin/.lnd/data/chain/bitcoin/mainnet/admin.macaroon

Scan QR code with ZAP wallet on IOS …

Scan the QR code and check/modify the IP address you want to use to connect.

Have fun.

ZAP-IOS supports to switch between multiple connected LND Nodes.



