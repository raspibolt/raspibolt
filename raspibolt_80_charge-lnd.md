$ sudo adduser charge-lnd
$ sudo /usr/sbin/usermod --append --groups bitcoin charge-lnd
$ sudo su - charge-lnd
$ git clone https://github.com/accumulator/charge-lnd
$ cd charge-lnd
$ pip3 install -r requirements.txt
