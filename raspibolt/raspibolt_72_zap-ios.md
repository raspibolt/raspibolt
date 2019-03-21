[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [**Bonus**](raspibolt_60_bonus.md) ] -- [ [Troubleshooting](raspibolt_70_troubleshooting.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

## Bonus guide: Zap IOS Lightning Wallet
*Difficulty: medium*

This guide describes how to use Zap IOS from within your own network, the same that also connects your RaspiBolt.

<p align='center'>
![Zap IOS](images/72_zapios.png)
</p>

Zap is a free Lightning Network wallet focused on user experience and ease of use.  
👉 More details here: https://github.com/LN-Zap/zap-iOS  
⚠️ At the moment this app is in alpha testing.  
👉 If you find bugs, you can contribute to this project by reporting them here: https://github.com/LN-Zap/zap-iOS/issues  

### Preparation on the Pi 

STEP A)  "Prepare LND Node for gRPC access"  

* Login as admin 

* Allow connections to the RaspiBolt from your own network. Check how the ip address of your Pi is starting with, eg. 192.168.0 or 192.168.1 , and use the address accordingly. Ending with .0/24 will allow all IP addresses from that network.  

   Add the following lines to the section `[Application Options]`:  
   `$ sudo nano /home/bitcoin/.lnd/lnd.conf` 
   ```
   tlsextraip=192.168.0.0/24
   rpclisten=0.0.0.0:10009
   ```
   
* Delete tls.cert (restarting LND will recreate it):  
  `$ sudo rm /home/bitcoin/.lnd/tls.*`

* Restart LND :  
  `$ sudo systemctl restart lnd`  
  
* Copy the new tls.cert to user "admin", as it is needed for lncli:  
  `$ sudo cp /home/bitcoin/.lnd/tls.cert /home/admin/.lnd`

* Unlock wallet  
  `$ lncli unlock` 

* Allow the ufw firewall to listen on 10009 from the LAN:  
  `$ sudo ufw allow from 192.168.0.0/24 to any port 10009 comment 'allow LND grpc from local LAN'`

* restart and check the firewall:  
  `$ sudo ufw enable`  
  `$ sudo ufw status`  

STEP B)  "Install GO"  

* First let’s ensure we have the latest security updates:  
  `$ sudo apt update`  
  `$ sudo apt upgrade`  
  
* Next , let’s download Go last version:  
  `$ cd download`  
  `$ wget https://dl.google.com/go/go1.12.linux-armv6l.tar.gz`  
  
* Next, let’s extract the files from the downloaded link and copy to env folder:  
  `$ sudo tar -xvf go1.11.linux-armv6l.tar.gz`  
  `$ sudo mv go /usr/local`  
  
* Setup environment variables (for this session only)  
  `$ export GOROOT=/usr/local/go`  
  `$ export GOPATH=$HOME/gocode`  
  `$ export PATH=$GOPATH/bin:$GOROOT/bin:$PATH`  
  
* Verify Go installation  
  `$ go version`  
  ```> go version go1.12 linux/arm```
  
  `$ go env`  
  ```
  > GOARCH="arm"
  > GOBIN=""
  > GOCACHE="/home/admin/.cache/go-build"
  > GOEXE=""
  > GOFLAGS=""
  > GOHOSTARCH="arm"
  > GOHOSTOS="linux"
  > GOOS="linux"
  > GOPATH="/home/admin/gocode"
  > GOPROXY=""
  > GORACE=""
  > GOROOT="/usr/local/go"
  > GOTMPDIR=""
  > GOTOOLDIR="/usr/local/go/pkg/tool/linux_arm"
  > GCCGO="gccgo"
  > GOARM="6"
  > CC="gcc"
  > CXX="g++"
  > CGO_ENABLED="1"
  > GOMOD=""
  > CGO_CFLAGS="-g -O2"
  > CGO_CPPFLAGS=""
  > CGO_CXXFLAGS="-g -O2"
  > CGO_FFLAGS="-g -O2"
  > CGO_LDFLAGS="-g -O2"
  > PKG_CONFIG="pkg-config"
  > GOGCCFLAGS="-fPIC -marm -pthread -fmessage-length=0 -fdebug-prefix-map=/tmp/go-build652420973=/tmp/go-build -gno-record-gcc-switches"
  ```
  
STEP C)  " Install LND Connect"  
  ```
  $ go get -d github.com/LN-Zap/lndconnect
  $ cd $GOPATH/src/github.com/LN-Zap/lndconnect
  $ make
  ```
  
### Generate QR code and read from Zap iphone app

* Now simply run lndconnect to generate the QRCode we’ll scan from our iPhone
  ```
  $ lndconnect --lnddir=/home/bitcoin/.lnd
  ```
  This will generate a QRCode.  
  Depending on your screen size use cmd + and cmd - to adjust the size of the QRCode  
  If you can't resize or have visualization problem you can add -j to display url instead of a QRCode  
  See https://github.com/LN-Zap/lndconnect for more details.  

* Open ZAP APP from your phone  

* Scan the QR code and check/modify the IP address you want to use to connect. (example 192.168.x.x)  

<p align='center'> ![Zap IOS scan example](images/72_zapios_scan.png) </p>

* A successful connection will take you into the Zap iOS application:

<p align='center'> ![Zap IOS succesful example](images/72_zapios_succesful.png) </p>


⚠️
REMEMBER: If you change lnd.conf you need to recreate tls.cert and also to re-create and re-scan qr from zap app.  
         In that case remeber also to copy the new TLS cert and admin macaroon files to the admin user.  
         If you log out from the session you need to setup go environment variables again to execute lndconnect or it will give you  
         `> -bash: lndconnect: command not found`.   

👉 It is perfectly possible to use Zap on-the-go (from internet) and connect to your node at home, but this involves creating new TLS certificates and reduce security. You need to set tlsextraip=<YOUR_PUBLIC_IP> and allow the ufw firewall to listen on 10009 from evrywhere.
