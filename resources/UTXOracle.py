#!/usr/bin/env python3



#########################################################################################  
#                                                                                       #
#   /$$   /$$ /$$$$$$$$ /$$   /$$  /$$$$$$                               /$$            #
#  | $$  | $$|__  $$__/| $$  / $$ /$$__  $$                             | $$            #
#  | $$  | $$   | $$   |  $$/ $$/| $$  \ $$  /$$$$$$  /$$$$$$   /$$$$$$$| $$  /$$$$$$   #
#  | $$  | $$   | $$    \  $$$$/ | $$  | $$ /$$__  $$|____  $$ /$$_____/| $$ /$$__  $$  #
#  | $$  | $$   | $$     >$$  $$ | $$  | $$| $$  \__/ /$$$$$$$| $$      | $$| $$$$$$$$  #
#  | $$  | $$   | $$    /$$/\  $$| $$  | $$| $$      /$$__  $$| $$      | $$| $$_____/  #
#  |  $$$$$$/   | $$   | $$  \ $$|  $$$$$$/| $$     |  $$$$$$$|  $$$$$$$| $$|  $$$$$$$  #
#   \______/    |__/   |__/  |__/ \______/ |__/      \_______/ \_______/|__/ \_______/  #
#                                                                                       #
#########################################################################################  
#                     Version 8 - The Smooth Slider                                     



# UTXOracle is a decentralized alternative to estimating the USD price of bitcoin.
# Instead of relying on prices given by an exchange, UTXOracle determines the price
# by analyzing patterns of on-chain transactions. It connects only to a bitcoin
# node and no other outside sources. It works even with wifi turned off because
# there are no api or internet communications. Every individual who independently
# runs this code will produce identical price estimates because even though the algorithm
# is statistical in nature, both the code and input data are identical.
# There are no AI or machine learning aspects to this project because black-box style algorithms
# can create conflicts of interest amongst parties using the price to settle contracts.
# Every step of the algorithm is fully deterministic, human understandable, and
# thoroughly documented in the code below.

# This document is divided following sections:

# Quick Start) Run it right now
# Introduction) Background and general description of UTXOracle
# Part 1) Create a way to talk to your node
# Part 2) Get the latest block from the node
# Part 3) Ask the user for a price estimate date (the target date)
# Part 4) Hunt through blocks to find the first block on the target day
# Part 5) Build the container to hold the output amounts bell curve
# Part 6) Get all output amounts from all blocks on the target day
# Part 7) Remove non-usd related outputs from the bell curve
# Part 8) Construct the USD price finder stencils
# Part 9) Estimate the price using the best fit stencil slide 



###############################################################################  

#                        Quick Start          

###############################################################################  


# 1. Make sure you have python3 and bitcoin-cli installed
# 2. Make sure "server = 1" is in bitcoin.conf
# 3. Run this file as "python3 UTXOracle.py"

# If this doesn't work, try filling in your bitcon-cli configuration options:


# (Optional) configuration options for bitcoin-cli
datadir       = ""
rpcuser       = "" 
rpcpassword   = ""
rpccookiefile = ""
rpcconnect    = ""
rpcport       = ""
conf          = ""







###############################################################################  

#                   Introduction to the code          

###############################################################################  


# The code that follows is written in a minimalistic style to maximize readability over 
# efficiency. It is self contained in (this) single file and 
# defines only one function call so that it can be read top to bottom like reading a paper. 
# The same code is sometimes repeated instead of defining a function for the 
# purpose of flow and continuity. There are no dependencies other than standard python 
# imports because third party libraries improve efficiency at the cost of requiring 
# the user to download and install third party libraries. 

# Historical testing of the Oracle shows prices that are accurate within the variance 
# seen by different bitcoin exchanges themselves. The date and price ranges expected to work 
# for this version (version 8) are from 2023-12-15 to present and from $5k to $500k. 
# The previous version of the code (version 7) worked flawlessly from 2020 to 2024 before 
# ordinal related transactions dramatically changed the character of on-chain output patterns. 
#
# If obvious errors are seen in the current version, it will become apparent to everyone 
# (as everyone will get the same result) and a new version will be released. New versions 
# will not be released for slight accuracy improvements as these kinds of releases could be 
# used to manipulate contract settlements using the Oracle.

# A basic understanding of how UTXOracle works is as follows:
    
#  Take a day's distribution of bitcoin transaction amounts 
#
#                    * *   *
#                   *   * * *                        
#                  *     *   *   *           
#               * *           * * *           
#          *   * *                  * *      *
#         * * *                      *  * * * *       
#      * *                               * *    * * *
#     * *                                             *
#    *                                      
#   10k sats        0.01 btc           1 btc        10btc 

# Create a smooth stencil to align broadly with a typical output day
#
#                       *  *
#                    *         *
#                 *               * 
#              *                     *
#            *                          *
#          *                               *
#        *                                     *
#      *                                            *  
#   10k sats        0.01 btc           1 btc        10btc 

# Create a spike stencil that fine tunes the alignment on popular usd amounts
#
#                         *
#                     *   *                       
#                     *   *                   
#                *    *   *          *           
#           *    *    *   *    *     *              
#           *    *    *   *    *     *    *             
#       *   *    *    *   *    *     *    *     *       
#       *   *    *    *   *    *     *    *     *     
#      $1 $10  $20  $50  $100  $500  $1k  $2k   $10k
#
# Slide the smooth and spike stencil over the output data and look for the best fit











###############################################################################  

#  Part 1) Create a way to talk to your node      

###############################################################################  

# We begin by defining a shortcut for calling the node. We do this repeatedly
# throughout the program so it's better to define a function once and call it
# whenever we need it instead of copy and pasting the same code several times. 
# The function asks the node a question and returns the answer to the algorithm 
# where it is needed. If you get an error in this function, the problem is 
# likely that you don't have server=1 in your bitcoin conf file.


#first we add any node connections options specified by the user above
bitcoin_cli_options = []
if datadir      != "":
    bitcoin_cli_options.append('-datadir='+ datadir)
if rpcuser      != "":
    bitcoin_cli_options.append("-rpcuser="+ rpcuser)
if rpcpassword  != "":
    bitcoin_cli_options.append("-rpcpassword="+ rpcpassword)
if rpccookiefile != "":
    bitcoin_cli_options.append("-rpcookiefile="+ rpccookiefile)
if rpcconnect   != "":
    bitcoin_cli_options.append("-rpcconnect="+ rpcconnect)
if rpcport      != "":
    bitcoin_cli_options.append("-rpcport="+ rpcport)
if conf         != "":
    bitcoin_cli_options.append("-conf="+ conf)


#import built in python libraries for system commands
import subprocess, sys

# now define the function
def Ask_Node(command):
        
    #Here "command" can be any question that your node understands
    
    #We add to the command any configurations options given by the user
    for o in bitcoin_cli_options:
        command.insert(0,o)
    
    #Use Core's default "bitcoin-cli" method of node communication  
    command.insert(0,"bitcoin-cli")
    
    # get the answer from the node and return it to the program
    answer = None
    try:  #python try is used when we need to deal with errors after
        answer = subprocess.check_output(command)
    except Exception as e:
        # something went wrong while getting the answer
        print("Error connecting to your node. Troubleshooting steps:\n")
        print("\t 1) Make sure bitcoin-cli is working. Try command 'bitcoin-cli getblockcount'")
        print("\t 2) Make sure config file bitcoin.conf has server=1")
        print("\t 3) Explore the bitcoin-cli options at the top of UTXOracle.py")
        print("\nThe command was:"+str(command))
        print("\nThe error from bitcoin-cli was:\n")
        print(e)
        sys.exit()
        
    # answer received, return this answer to the program
    return answer








###############################################################################  

# Part 2)  Get the latest block from the node      

###############################################################################  

# The first request to the node is to ask it how many blocks it has. This
# lets us know the maximum possible day for which we can request a
# btc price estimate. The time information of blocks is listed in the block
# header, so we ask for the header only when we just need to know the time.

#import built in tools for dates/times and json style lists
from datetime import datetime, timezone, timedelta
import json 

#get current block height from local node and exit if connection not made
block_count_b = Ask_Node(['getblockcount'])
block_count = int(block_count_b)             #convert text to integer

#get block header from current block height
block_hash_b = Ask_Node(['getblockhash',block_count_b])
block_header_b = Ask_Node(['getblockheader',block_hash_b[:64],'true'])
block_header = json.loads(block_header_b)

#get the date and time of the current block height
latest_time_in_seconds = block_header['time']
time_datetime = datetime.fromtimestamp(latest_time_in_seconds,tz=timezone.utc)

#get the date/time of utc midnight on the latest day
latest_year  = int(time_datetime.strftime("%Y"))
latest_month = int(time_datetime.strftime("%m"))
latest_day   = int(time_datetime.strftime("%d"))
latest_utc_midnight = datetime(latest_year,latest_month,latest_day,0,0,0,tzinfo=timezone.utc)

#assign the day before as the latest possible price date
seconds_in_a_day = 60*60*24
yesterday_seconds = latest_time_in_seconds - seconds_in_a_day
latest_price_day = datetime.fromtimestamp(yesterday_seconds,tz=timezone.utc)
latest_price_date = latest_price_day.strftime("%Y-%m-%d")


# tell the user that a connection has been made and state the lastest price date
print("UTXOracle version 8")
print("\nConnected to local noode at block #:\t"+str(block_count))
print("Latest available price date:\t\t"+latest_price_date+" (pruned node ok)")
print("Earliest available price date:\t\t2023-12-15 (requires full node)")








###############################################################################  

# Part 3)  Ask the user for the desired date to estimate the price      

###############################################################################  

# In this section we ask the user for a date and make sure that date is in the
# acceptable range for this version.


date_entered = input("\nEnter date in YYYY-MM-DD format\nor Enter 'q' to quit "+ \
                     "\nor press ENTER for the most recent price:")

# quit if desired
if date_entered == 'q':
    sys.exit()
    
# run latest day if hit enter
elif (date_entered == ""):
    datetime_entered = latest_utc_midnight + timedelta(days=-1)
    
#user entered a specific date
else:
    
    #check to see if this is a good date
    try:
        year  = int(date_entered.split('-')[0])
        month = int(date_entered.split('-')[1])
        day = int(date_entered.split('-')[2])
        
        #make sure this date is less than the max date
        datetime_entered = datetime(year,month,day,0,0,0,tzinfo=timezone.utc)
        if datetime_entered.timestamp() > latest_utc_midnight.timestamp():
            print("\nThe date entered is not before the current date, please try again")
            sys.exit()
        
        #make sure this date is after the min date
        dec_15_2023 = datetime(2023,12,15,0,0,0,tzinfo=timezone.utc)
        if datetime_entered.timestamp() < dec_15_2023.timestamp():
            print("\nThe date entered is before 2023-12-15, please try again")
            sys.exit()
    
    except:
        print("\nError interpreting date. Please try again. Make sure format is YYYY-MM-DD")
        sys.exit()


#get the seconds and printable date string of date entered
price_day_seconds = int(datetime_entered.timestamp())
price_day_date_utc = datetime_entered.strftime("%B %d, %Y")


print("\n\n########   Starting Price Estimate   ########")







##############################################################################  

# Part 4)  Hunt through blocks to find the first block on the target day      

##############################################################################  

# Now that we have the target day we need to find which blocks were mined on this day.
# This would be easy if bitcoin Core blocks were organized by time
# instead of by block height. However there's no way to ask bitcoin Core for a block at a
# specific time. Instead one must ask for a block, look at it's time, then estimate
# the number of blocks to jump for the next guess. So we use this
# guess and check method to find all blocks on the target day.


#first estimate of the block height of the price day
seconds_since_price_day = latest_time_in_seconds - price_day_seconds
blocks_ago_estimate = round(144*float(seconds_since_price_day)/float(seconds_in_a_day))
price_day_block_estimate = block_count - blocks_ago_estimate

#check the time of the price day block estimate
block_hash_b = Ask_Node(['getblockhash',str(price_day_block_estimate)])
block_header_b = Ask_Node(['getblockheader',block_hash_b[:64],'true'])
block_header = json.loads(block_header_b)
time_in_seconds = block_header['time']

#get new block estimate from the seconds difference using 144 blocks per day
seconds_difference = time_in_seconds - price_day_seconds
block_jump_estimate = round(144*float(seconds_difference)/float(seconds_in_a_day))

#iterate above process until it oscillates around the correct block
last_estimate = 0
last_last_estimate = 0
while block_jump_estimate >6 and block_jump_estimate != last_last_estimate:
    
    #when we oscillate around the correct block, last_last_estimate = block_jump_estimate
    last_last_estimate = last_estimate
    last_estimate = block_jump_estimate
    
    #get block header or new estimate
    price_day_block_estimate = price_day_block_estimate-block_jump_estimate
    block_hash_b = Ask_Node(['getblockhash',str(price_day_block_estimate)])
    block_header_b = Ask_Node(['getblockheader',block_hash_b[:64],'true'])
    block_header = json.loads(block_header_b)
    
    #check time of new block and get new block jump estimate
    time_in_seconds = block_header['time']
    seconds_difference = time_in_seconds - price_day_seconds
    block_jump_estimate = round(144*float(seconds_difference)/float(seconds_in_a_day))
    
#the oscillation may be over multiple blocks so we add/subtract single blocks 
#to ensure we have exactly the first block of the target day
if time_in_seconds > price_day_seconds:
    
    # if the estimate was after price day look at earlier blocks
    while time_in_seconds > price_day_seconds:
        
        #decrement the block by one, read new block header, check time
        price_day_block_estimate = price_day_block_estimate-1
        block_hash_b = Ask_Node(['getblockhash',str(price_day_block_estimate)])
        block_header_b = Ask_Node(['getblockheader',block_hash_b[:64],'true'])
        block_header = json.loads(block_header_b)
        time_in_seconds = block_header['time']
        
    #the guess is now perfectly the first block before midnight
    price_day_block_estimate = price_day_block_estimate + 1

# if the estimate was before price day look for later blocks
elif time_in_seconds < price_day_seconds:
    
    while time_in_seconds < price_day_seconds:
        
        #increment the block by one, read new block header, check time
        price_day_block_estimate = price_day_block_estimate+1
        block_hash_b = Ask_Node(['getblockhash',str(price_day_block_estimate)])
        block_header_b = Ask_Node(['getblockheader',block_hash_b[:64],'true'])
        block_header = json.loads(block_header_b)
        time_in_seconds = block_header['time']

#assign the estimate as the price day block since it is correct now    
price_day_block = price_day_block_estimate








##############################################################################

#  Part 5) Build the container to hold the output amounts bell curve

##############################################################################

# We're almost ready to read in block data but first we must construct the 
# containers which will hold the distribution of transaction output amounts.
# In pure math a bell curve can be perfectly smooth. But to make a bell curve
# from a sample of data, one must specify a series of buckets, or bins, and then
# count how many samples are in each bin. If the bin size is too large, say just one
# large bin, a bell curve can't appear because it will have only one bar. The bell 
# curve also doesn't appear if the bin size is too small because then there will 
# only be one sample in each bin and we'd fail to have a distribution of bin heights. 
# Although several bin sizes would work, I have found over many years, that 200 bins 
# for every 10x of bitcoin amounts works very well. We use 'every 10x' because just 
# like a long term bitcoin price chart, viewing output amounts in log scale provides 
# a more comprehensive and detailed overview of the amounts being analyzed. 


# Define the maximum and minimum values (in log10) of btc amounts to use
first_bin_value = -6
last_bin_value = 6  #python -1 means last in list
range_bin_values = last_bin_value - first_bin_value 

# create a list of output_bell_curve_bins and add zero sats as the first bin
output_bell_curve_bins = [0.0] #a decimal tells python the list will contain decimals

# calculate btc amounts of 200 samples in every 10x from 100 sats (1e-6 btc) to 100k (1e5) btc
for exponent in range(-6,6): #python range uses 'less than' for the big number 
    
    #add 200 bin_width increments in this 10x to the list
    for b in range(0,200):
        
        bin_value = 10 ** (exponent + b/200)
        output_bell_curve_bins.append(bin_value)

# Create a list the same size as the bell curve to keep the count of the bins
number_of_bins = len(output_bell_curve_bins)
output_bell_curve_bin_counts = []
for n in range(0,number_of_bins):
    output_bell_curve_bin_counts.append(float(0.0))









##############################################################################

#  Part 6) Get all output amounts from all block on target day

##############################################################################

# This section of the program will take the most time as it requests all 
# blocks from Core on the price day. It readers every transaction (tx)
# from those blocks and places each tx output value into the bell curve.
# New in version 8 are filters that disallow the following types of transactions
# as they have been found to be unlikely to be round p2p usd transactions: coinbase,
# greater than 5 inputs, greater than 2 outputs, only one output, has op_return,
# has witness data > 500 bytes, and has an input created on the same day.



from math import log10 #built in math functions needed logarithms

#print header line of update table
print("\nReading all blocks on "+price_day_date_utc+"...")
print("This will take a few minutes (~144 blocks)...")
print("\nBlock Height\t Block Time(utc)\t\t\tCompletion %")

#get the full data of the first target day block from the node
block_height=price_day_block
block_hash_b = Ask_Node(['getblockhash',str(block_height)])
block_b = Ask_Node(['getblock',block_hash_b[:64],'2'])
block = json.loads(block_b)

#get the time of the first block
time_in_seconds = int(block['time'])
time_datetime = datetime.fromtimestamp(time_in_seconds,tz=timezone.utc)
time_utc = time_datetime.strftime(" %Y-%m-%d %H:%M:%S")
hour_of_day = int(time_datetime.strftime("%H"))
minute_of_hour = float(time_datetime.strftime("%M"))
day_of_month = int(time_datetime.strftime("%d"))
target_day_of_month = day_of_month

# start a list of unique txids using python's "set" variable type
todays_txids = set()


#read in blocks until we get a block on the day after the target day
while target_day_of_month == day_of_month:
    
    #get progress estimate
    progress_estimate = 100.0*(hour_of_day+minute_of_hour/60)/24.0
    print(str(block_height)+"\t\t"+time_utc+"\t\t"+f"{progress_estimate:.2f}"+"%")
    
    #go through all the txs in the block which are stored in a list called 'tx'
    for tx in block['tx']:
        
        #add txid to todays txids list
        todays_txids.add(tx['txid'][-8:]) #-8 because the tx is unique with only 8 characters
            
        #txs have more than one input which are stored in a list called 'vin'
        inputs = tx['vin']

        #txs have more than one output which are stored in a list called 'vout'
        outputs = tx['vout']

        #check for coinbase tx
        if "coinbase" in inputs[0]:
            continue  #continue means skip the rest of this transaction

        #check for many inputs
        if len(inputs) > 5:
            continue

        #check for one outputs
        if len(outputs) < 2:
            continue

        #check for many outputs
        if len(outputs) > 2: 
            continue

        #check for opreturn
        has_op_return = False
        for output in outputs:
            script_pub_key = output.get("scriptPubKey", {})
            if script_pub_key.get("type") == "nulldata" or "OP_RETURN" in script_pub_key.get("asm", ""):
                has_op_return = True
                break
        if has_op_return:
            continue

        #go through all inputs s in the tx
        has_sameday_input = False
        has_big_witness = False
        for inpt in inputs:
            
            #look for same day inputs
            if 'txid' in inpt and inpt['txid'][-8:] in todays_txids:
                has_sameday_input = True
                break
            
            #look for large witness data (> 500 bytes)
            if "txinwitness" in inpt:
                for witness in inpt["txinwitness"]:
                    if len(witness) > 500:
                        has_big_witness = True
                        break
            
            #break out of input loop if sameday input of big witness
            if has_sameday_input or has_big_witness:
                break
            
        #skip the rest of this tx if sameday input of big witness
        if has_sameday_input or has_big_witness:
            continue
            

        #go through all outputs in the tx and add the value to the bell curve
        for output in outputs:
            
            #the bitcoin output amount is called 'value' in Core, add this to the list
            amount = float(output['value'])

            #tiny and huge amounts aren't used by the USD price finder
            if 1e-5 < amount < 1e5:
                
                #take the log
                amount_log = log10(amount)
                
                #find the right output amount bin to increment
                percent_in_range = (amount_log-first_bin_value)/range_bin_values
                bin_number_est = int(percent_in_range * number_of_bins)
                
                #search for the exact right bin (won't be less than)
                while output_bell_curve_bins[bin_number_est] <= amount:
                    bin_number_est += 1
                bin_number = bin_number_est - 1
                
                #add this output to the bell curve
                output_bell_curve_bin_counts[bin_number] += 1.0   #+= means increment
    
    
    #get the full data of the next block
    block_height = block_height + 1
    block_hash_b = Ask_Node(['getblockhash',str(block_height)])
    block_b = Ask_Node(['getblock',block_hash_b[:64],'2'])
    block = json.loads(block_b)

    #get the time of the next block
    time_in_seconds = int(block['time'])
    time_datetime = datetime.fromtimestamp(time_in_seconds,tz=timezone.utc)
    time_utc = time_datetime.strftime(" %Y-%m-%d %H:%M:%S")
    day_of_month = int(time_datetime.strftime("%d"))
    minute_of_hour = float(time_datetime.strftime("%M"))
    hour_of_day = int(time_datetime.strftime("%H"))








##############################################################################

#  Part 7) Remove non-usd related outputs from the bell curve

##############################################################################

# This section aims to remove non-usd denominated samples from the bell curve
# of outputs. The two primary steps are to remove very large/small outputs
# and then to remove round btc amounts. We don't set the round btc amounts
# to zero because if the USD price of bitcoin is also round, then round
# btc amounts will co-align with round usd amounts. There are many ways to deal
# with this. One way we've found to work is to smooth over the round btc amounts
# using the neighboring amounts in the bell curve. The last step is to normalize
# the bell curve. Normalizing is done by dividing the entire curve by the sum 
# of the curve. This is done because it's more convenient for signal processing
# procedures if the sum of the signal integrates to one.


#remove outputs below 10k sat (increased from 1k sat in v6)
for n in range(0,201):
    output_bell_curve_bin_counts[n]=0

#remove outputs above ten btc
for n in range(1601,len(output_bell_curve_bin_counts)):
    output_bell_curve_bin_counts[n]=0

#create a list of round btc bin numbers
round_btc_bins = [
201,  # 1k sats
401,  # 10k 
461,  # 20k
496,  # 30k
540,  # 50k
601,  # 100k 
661,  # 200k
696,  # 300k
740,  # 500k
801,  # 0.01 btc
861,  # 0.02
896,  # 0.03
940,  # 0.04
1001, # 0.1 
1061, # 0.2
1096, # 0.3
1140, # 0.5
1201  # 1 btc
]

#smooth over the round btc amounts
for r in round_btc_bins:
    amount_above = output_bell_curve_bin_counts[r+1]
    amount_below = output_bell_curve_bin_counts[r-1]
    output_bell_curve_bin_counts[r] = .5*(amount_above+amount_below)


#get the sum of the curve
curve_sum = 0.0
for n in range(201,1601):
    curve_sum += output_bell_curve_bin_counts[n]

#normalize the curve by dividing by it's sum and removing extreme values
for n in range(201,1601):
    output_bell_curve_bin_counts[n] /= curve_sum
    
    #remove extremes (0.008 chosen by historical testing)
    if output_bell_curve_bin_counts[n] > 0.008:
        output_bell_curve_bin_counts[n] = 0.008
    








##############################################################################

#  Part 8) Construct the USD price finder stencils

##############################################################################

# We now have a bell curve of outputs which should contain round USD outputs
# as it's prominent features. To expose these prominent features more,
# and estimate a usd price, we slide two types of stencils over the bell curve and look 
# for where the slide location is maximized. There are several stencil designs
# and maximization strategies which could accomplish this. The one used here 
# is to have one smooth stencil that finds the general shape of a typical output
# distribution day, and a spike stencil which narrows in on exact locations
# of the round USD amounts. Both the smooth and spike stenciled have been created
# by an iterative process of manually sliding together round USD spikes in
# output distribtutions over every day from 2020 to 2024, and then taking the average
# general shape and round usd spike values over that period.

# Load the average smooth stencil to align broadly with a typical output day 
#
#                       *  *
#                    *         *
#                 *               * 
#              *                     *
#            *                          *
#          *                               *
#        *                                     *
#      *                                            *  
#   10k sats        0.01 btc           1 btc        10btc 

# Parameters
num_elements = 803
mean = 411 #(num_elements - 1) / 2  # Center of the array
std_dev = 201

smooth_stencil = []
for x in range(num_elements):
    exp_part = -((x - mean) ** 2) / (2 * (std_dev ** 2))
    smooth_stencil.append( (.00150 * 2.718281828459045 ** exp_part) + (.0000005 * x) )


# Load the average spike stencil that fine tunes the alignment on popular usd amounts
#
#                         *
#                     *   *                       
#                     *   *                   
#                *    *   *          *           
#           *    *    *   *    *     *              
#           *    *    *   *    *     *    *             
#       *   *    *    *   *    *     *    *     *       
#       *   *    *    *   *    *     *    *     *     
#      $1 $10  $20  $50  $100  $500  $1k  $2k   $10k

spike_stencil = []
for n in range(0,803):
    spike_stencil.append(0.0)
    
#round usd bin location   #popularity    #usd amount  
spike_stencil[40] = 0.001300198324984352  # $1
spike_stencil[141]= 0.001676746949820743  # $5
spike_stencil[201]= 0.003468805546942046  # $10
spike_stencil[202]= 0.001991977522512513  # 
spike_stencil[236]= 0.001905066647961839  # $15
spike_stencil[261]= 0.003341772718156079  # $20
spike_stencil[262]= 0.002588902624584287  # 
spike_stencil[296]= 0.002577893841190244  # $30
spike_stencil[297]= 0.002733728814200412  # 
spike_stencil[340]= 0.003076117748975647  # $50
spike_stencil[341]= 0.005613067550103145  # 
spike_stencil[342]= 0.003088253178535568  # 
spike_stencil[400]= 0.002918457489366139  # $100
spike_stencil[401]= 0.006174500465286022  # 
spike_stencil[402]= 0.004417068070043504  # 
spike_stencil[403]= 0.002628663628020371  # 
spike_stencil[436]= 0.002858828161543839  # $150
spike_stencil[461]= 0.004097463611984264  # $200
spike_stencil[462]= 0.003345917406120509  # 
spike_stencil[496]= 0.002521467726855856  # $300
spike_stencil[497]= 0.002784125730361008  # 
spike_stencil[541]= 0.003792850444811335  # $500
spike_stencil[601]= 0.003688240815848247  # $1000
spike_stencil[602]= 0.002392400117402263  # 
spike_stencil[636]= 0.001280993059008106  # $1500
spike_stencil[661]= 0.001654665137536031  # $2000
spike_stencil[662]= 0.001395501347054946  # 
spike_stencil[741]= 0.001154279140906312  # $5000
spike_stencil[801]= 0.000832244504868709  # $10000







##############################################################################

#  Part 9) Part 9) Estimate the price using the best fit stencil slide

##############################################################################

# This is the concluding step. We slide the stencil over the bell curve and see
# where it fits the best. The best fit location and it's neighbor are used
# in a weighted average to estimate the best fit USD price


# set up scores for sliding the stencil
best_slide        = 0
best_slide_score  = 0
total_score       = 0

#weighting of the smooth and spike slide scores
smooth_weight     = 0.65
spike_weight      = 1

#establish the center slide such that if zero slide then 0.001 btc is $100 ($100k price)
center_p001 = 601   # 601 is where 0.001 btc is in the output bell curve
left_p001   = center_p001 - int((len(spike_stencil) +1)/2)
right_p001  = center_p001 + int((len(spike_stencil) +1)/2)

#upper and lower limits for sliding the stencil
min_slide = -141   # $500k
max_slide =  201   # $5k
    
#slide the stencil and calculate slide score
for slide in range(min_slide,max_slide):
    
    #shift the bell curve by the slide
    shifted_curve = output_bell_curve_bin_counts[left_p001+slide:right_p001+slide]
    
    #score the smoothslide by multiplying the curve by the stencil
    slide_score_smooth = 0.0
    for n in range(0,len(smooth_stencil)):
        slide_score_smooth += shifted_curve[n]*smooth_stencil[n]
    
    #score the spiky slide by multiplying the curve by the stencil
    slide_score = 0.0
    for n in range(0,len(spike_stencil)):
        slide_score += shifted_curve[n]*spike_stencil[n]
    
    # add the spike and smooth slide scores, neglect smooth slide over wrong regions
    if slide < 150:
        slide_score = slide_score + slide_score_smooth*.65
        
    # see if this score is the best so far
    if slide_score > best_slide_score:
        best_slide_score = slide_score
        best_slide = slide
    
    # increment the total score
    total_score += slide_score
        
# estimate the usd price of the best slide
usd100_in_btc_best = output_bell_curve_bins[center_p001+best_slide]
btc_in_usd_best = 100/(usd100_in_btc_best)

#find best slide neighbor up
neighbor_up = output_bell_curve_bin_counts[left_p001+best_slide+1:right_p001+best_slide+1]
neighbor_up_score = 0.0
for n in range(0,len(spike_stencil)):
    neighbor_up_score += neighbor_up[n]*spike_stencil[n]

#find best slide neighbor down
neighbor_down = output_bell_curve_bin_counts[left_p001+best_slide-1:right_p001+best_slide-1]
neighbor_down_score = 0.0
for n in range(0,len(spike_stencil)):
    neighbor_down_score += neighbor_down[n]*spike_stencil[n]

#get best neighbor
best_neighbor = +1
neighbor_score = neighbor_up_score
if neighbor_down_score > neighbor_up_score:
    best_neighbor = -1
    neighbor_score = neighbor_down_score

#get best neighbor usd price
usd100_in_btc_2nd = output_bell_curve_bins[center_p001+best_slide+best_neighbor]
btc_in_usd_2nd = 100/(usd100_in_btc_2nd)

#weight average the two usd price estimates
avg_score = total_score/len(range(min_slide,max_slide))
a1 = best_slide_score - avg_score
a2 = abs(neighbor_score - avg_score)
w1 = a1/(a1+a2)
w2 = a2/(a1+a2)
price_estimate = int(w1*btc_in_usd_best + w2*btc_in_usd_2nd)

# Finally, report the price estimate
print("\nThe "+price_day_date_utc+" btc price estimate is: $" + f'{price_estimate:,}')







##############################################################################

#  License

##############################################################################

# This software is free to use, modify and distribute for non-financial gain purposes,
# so long as the full license is included with any use or redistribution.

# Any use of this software for financial gain, including but not limited to
# commercial applications, paid services, or monetized redistribution, requires
# the expressed written consent of the author (@SteveSimple on x.com).


