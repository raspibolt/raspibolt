[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ [**Bonus**](raspibolt_60_bonus.md) ] -- [ [FAQ](raspibolt_faq.md) ] -- [ [Updates](raspibolt_updates.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

## Bonus guide: Email alerts

*Difficulty: easy*

If LND restarts, it would be nice to get an email alert to unlock the wallet. The key is to use `sendmail` in combination with a simple, free SMTP service.

I use https://www.easy-smtp.com, they offer a free plan and you can register using an alias. This works with any SMTP service, although some are harder to configure (eg. Gmail requires special certificates). We will follow [this guide](https://www.easy-smtp.com/smtp-sendmail).

* Install `sendmail`
  `$ sudo apt-get install sendmail`
* ​

---

<< Back: [Bonus guides](raspibolt_60_bonus.md) 