---
layout: default
title: Lightning
nav_order: 40
has_children: true
---
<!-- markdownlint-disable MD014 MD022 MD025 MD040 -->
{% include_relative include_metatags.md %}

# Lightning
{: .no_toc }

Now you're all set up for Bitcoin.
But Bitcoin is not primarily designed for fast and cheap payments.
The blockchain that records all transactions cannot grow without limit if we want to keep the whole system decentralized and nodes like this RaspiBolt feasible.


Building on top of the Bitcoin base layer, the Lightning Network enables instant and cheap everyday payments.
Your coffee purchase doesn't necessarily need to be validated and recorded by all Bitcoin nodes worldwide if you think about it.

Check out [Understanding the Lightning Network](https://bitcoinmagazine.com/technical/understanding-the-lightning-network-part-building-a-bidirectional-payment-channel-1464710791){:target="_blank"} from Bitcoin Magazine to learn more about how it works.

---

To enable the Lightning Network on your RaspiBolt, we install LND, the "Lightning Network Daemon".
We'll then add "Ride The Lightning", a web-based node management tool.
Together, they make operating your node a breeze.
