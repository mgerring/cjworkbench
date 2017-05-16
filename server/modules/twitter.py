from twarc import Twarc
import pandas as pd
import os
import csv
import io
#import json
#import math
from .moduleimpl import ModuleImpl
from server.versions import bump_workflow_version


# ---- Twitter ----

class Twitter(ModuleImpl):

    # Get dataframe of last tweets fron our storage,
    @staticmethod
    def get_stored_tweets(wf_module):
        tablestr = wf_module.retrieve_text('csv')
        if (tablestr != None) and (len(tablestr) > 0):
            return pd.read_csv(io.StringIO(tablestr))
        else:
            return None

    # Get from Twitter, return as dataframe
    @staticmethod
    def get_new_tweets(querytype, query):
        consumer_key = os.environ['CJW_TWITTER_CONSUMER_KEY']
        consumer_secret = os.environ['CJW_TWITTER_CONSUMER_SECRET']
        access_token = os.environ['CJW_TWITTER_ACCESS_TOKEN']
        access_token_secret = os.environ['CJW_TWITTER_ACCESS_TOKEN_SECRET']

        tw = Twarc(consumer_key, consumer_secret, access_token, access_token_secret)

        if querytype == 'User':
            tweetsgen = tw.timeline(screen_name=query)
        else:
            tweetsgen = tw.search(query)

        # Columns to retrieve and store from Twitter
        # Also, we use this to figure ou the index the id field when merging old and new tweets
        cols = ['id', 'created_at', 'text', 'in_reply_to_screen_name', 'in_reply_to_status_id', 'retweeted',
                'retweet_count', 'favorited', 'favorite_count', 'source']

        tweets = [ [t[x] for x in cols] for t in tweetsgen]
        table = pd.DataFrame(tweets, columns=cols)
        return table


    # Combine this set of tweets with previous set of tweets
    def merge_tweets(wf_module, new_table):
        old_table = Twitter.get_stored_tweets()
        if old_table != None:
            new_table = pd.concat([new_table,old_table]).drop_duplicates().sort_values('id',ascending=False).reset_index(drop=True)
        return new_table

    # Render just returns previously retrieved tweets
    @staticmethod
    def render(wf_module, table):
        return Twitter.get_stored_tweets(wf_module)


    # Load specified user's timeline
    @staticmethod
    def event(parameter, e):
        wfm = parameter.wf_module
        table = None

        # fetching could take a while so notify clients/users that we're working on it
        wfm.set_busy(notify=True)
        querytype = wfm.get_param_menu_string('querytype')
        query = wfm.get_param_string('query')

        tweets = Twitter.get_new_tweets(querytype, query)

        if wfm.get_param_checkbox('accumulate'):
            tweets = Twitter.merge_tweets(wfm, tweets)

        wfm.store_text('csv', tweets.to_csv(index=False))  # index=False to prevent pandas from adding an index col

        # all done, set to ready and re-render workflow
        wfm.set_ready(notify=False)
        bump_workflow_version(wfm.workflow)