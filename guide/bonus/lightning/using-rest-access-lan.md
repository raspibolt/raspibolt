---
layout: default
title: Using REST Access (LAN)
parent: + Lightning
grand_parent: Bonus Section
nav_exclude: true
has_toc: false
---

## Bonus guide: Using REST Access (LAN)
{: .no_toc }

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
### Introduction
This guide is built upon the earlier [work by Rob Clark](https://github.com/robclark56/RaspiBolt-Extras/blob/master/README.md){:target="_blank"} and is concerned with being able to interact with your lightning node locally (via your **L**ocal **A**rea **N**etwork) through a REST API, which uses a web-style access: e.g. http://my.raspibolt/do/something?parameter=value.

**Why would you need REST instead of rpc/lncli?**
* Access to your RaspiBolt is needed from a host that does not allow executables like lncli to run. E.g. - an online webstore on a shared host needing to create a Payment Request to give to customers.
* Easy to use from programming languages such as PHP.


### Explicity set rpc and REST access

* As user "admin", Determine LAN IP address of your RaspiBolt if you don't already know it
```
$ hostname -I
$ ifconfig
```

* Update *restlisten* in your lnd.conf files as below (replacing `CHANGE_ME` with `your.LAN.ip.address`)
```
$ sudo nano /home/lnd/.lnd/lnd.conf
```

```
[Application Options]
restlisten=localhost:8080
restlisten=CHANGE_ME:8080
```

### Restart lnd and Test REST access

* Restart lnd
```
$ sudo systemctl restart lnd
```
Note you should replace `CHANGE_ME` in the examples below with `your.LAN.ip.address`.

* Test access first using `lncli getinfo` then REST access to get equivalent information using the REST access.
```
$ lncli getinfo
{"version": "0.15.4-beta commit=v0.15.4-beta",....,"best_header_timestamp":"1667737643"}

$ sudo curl --insecure  --header "Grpc-Metadata-macaroon: $(xxd -ps -u -c 1000  /home/admin/.lnd/data/chain/bitcoin/mainnet/admin.macaroon)" https://CHANGE_ME:8080/v1/getinfo
{"version": "0.15.4-beta commit=v0.15.4-beta",....,"best_header_timestamp":"1667737643"}
```
Note that we're pointing toward the location of the *admin.macaroon* which is used to authenticate the request for information. For more information on Macaroons then consider reading the complete information in the [Lightning Labs Builder's Guide GitBook](https://docs.lightning.engineering/lightning-network-tools/lnd/macaroons).

* Now we can test again but this time generating a lightning invoice for 100sats (which is equivalent to executing `lncli addinvoice --memo test --amt 100` in the terminal.)
```
$ sudo curl --insecure  --header "Grpc-Metadata-macaroon: $(xxd -ps -u -c 1000  /home/admin/.lnd/data/chain/bitcoin/mainnet/admin.macaroon)"   https://CHANGE_ME:8080/v1/invoices -d '{"memo":"test","value":"100"}'

{"r_hash":"IFpuzzCgqTeshc/qTo5Mgo/+R/xdHKgao0QIexKoIR8=",....,"payment_addr":"6C.....s="}
```
Note that simply lifting out the content of the quoted string (beginning "ln...") immediately following "payment_request" and dropping this string into an online [QR code generator](https://www.the-qrcode-generator.com/) will allow you scan and make a payment to your node with a lightning wallet like Muun or Wallet of Satoshi. Go on and give it a try, afterall you're only sending funds to yourself!

* If we wish to decode the invoice into its component parts then we can do the following. This is analogous to `lncli decodepayreq "lntb.....rfez"`. Where `lntb.....rfez` should be replaced with the full payment_request obtained previously.
```
$ sudo curl --insecure  --header "Grpc-Metadata-macaroon: $(xxd -ps -u -c 1000  /home/admin/.lnd/data/chain/bitcoin/mainnet/admin.macaroon)"   https://CHANGE_ME:8080/v1/payreq/lntb.....rfez

{"destination":"022ecebcf3c95f39934b30d7d56c42d2fa1b110054f6672301ecdb56c5941020d4",
 "payment_hash":"5487a5d3860fdd8705981cbcd953022625207512f0edeca2eae93d11efe30c14",
 "num_satoshis":"100",
 "timestamp":"1524356901",
 "expiry":"3600",
 "description":"test",
 "cltv_expiry":"144"
}
```

### List of REST Commands

See [REST API](https://github.com/ndeet/php-ln-lnd-rest/tree/master/docs/Api).

------

<< Back: [+ Lightning](index.md)