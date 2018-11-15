[ [Intro](README.md) ] -- [ [Preparations](raspibolt_10_preparations.md) ] -- [ [Raspberry Pi](raspibolt_20_pi.md) ] -- [ [Bitcoin](raspibolt_30_bitcoin.md) ] -- [ [Lightning](raspibolt_40_lnd.md) ] -- [ [Mainnet](raspibolt_50_mainnet.md) ] -- [ **Bonus** ] -- [ [FAQ](raspibolt_faq.md) ] -- [ [Updates](raspibolt_updates.md) ]

------

### Beginner’s Guide to ️⚡Lightning️⚡ on a Raspberry Pi

------

# Bonus (optional)

In this section, you can find various optional topics that make your RaspiBolt running even smoother. I split this up in various subsections, as the individual tasks can be quite long.

## [**System overview**](raspibolt_61_system-overview.md)

*Difficulty: easy*

Your RaspiBolt will greet you with a quick system summary on login:

[![MotD system overview](images/60_status_overview.png)](raspibolt_61_system-overview.md)

## [Auto unlock LND on startup](raspibolt_6A_auto-unlock.md)

*Difficulty: easy*

Manually unlocking the LND wallet every time the system starts is not really feasible if your RaspiBolt is meant to run reliably somewhere in a closet. This script automatically unlocks the wallet on startup or service-restart. This comes at a minimal security cost, however, as the password needs to be stored on the device.



## [**Electrum Personal Server**](raspibolt_64_electrum.md)

*Difficulty: intermediate*

The RaspiBolt is the perfect trustless Bitcoin backend for your regular on-chain transactions. Together with the Electrum wallet, it works even with your Ledger or Trezor hardware wallet.

[![Electrum](images/60_eps_electrumwallet.png)](raspibolt_64_electrum.md)

## [**Shango Mobile Wallet**](raspibolt_68_shango.md)

*Difficulty: intermediate*

The iOS & Android app Shango provides a neat interface for the RaspiBolt, to manage peers & channels, make payments and create invoices.

[![Electrum](images/60_shango.png)](raspibolt_68_shango.md)

## [**Lightning web interface**](raspibolt_69_lncli-web.md)

*Difficulty: intermediate*

This web client lets you manage your Lightning node from your browser. Administer channels, send and receive payments. It's configured to be accessible only from inside your home network.

[![Electrum](images/60_lncliweb_gui_small.png)](raspibolt_69_lncli-web.md)

## [**Pimp the command line**](raspibolt_62_commandline.md)

*Difficulty: easy*

Make your command line prompt shine with a golden ฿ and use more colors overall:

[![Pimped prompt](images/60_pimp_prompt_result.png)](raspibolt_62_commandline.md)

## [**Use `lncli` on a different computer**](raspibolt_66_remote_lncli.md)

*Difficulty: easy*

Control your Lightning node from a different computer within you network, eg. from a Windows machine.

## [**System recovery**](raspibolt_65_system-recovery.md)

Difficulty: easy

In case your SD card gets corrupted or you brick your node, it's handy to have a quick recovery image at hand. It's not a full backup solution, but allows a system recovery.

## [Additional scripts: show balance & channels](raspibolt_67_additional-scripts.md)

Difficulty: easy

These additional bash scripts display a balance overview (on-chain & in channels, active & inactive) as well as a nicely formatted channels overview.

## Even more Extras 

**[RaspiBolt-Extras](https://github.com/robclark56/RaspiBolt-Extras/blob/master/README.md)** by Rob Clark
* Lights-Out: automatic unlocking of wallet and dynamic ip
* RaspiBoltDuo: testnet & mainnet running simultaneously
* Using REST access
* Receiving Lightning payments: automatically create invoices / qr codes

------

Next: [FAQ >>](raspibolt_faq.md)
