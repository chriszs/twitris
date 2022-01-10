import { TwitterApi } from "https://raw.githubusercontent.com/stefanuros/deno_twitter_api/master/twitterApi.ts";

class Twitter {
  constructor(keys = {
    consumerApiKey: Deno.env.get("TWITTER_CONSUMER_KEY"),
    consumerApiSecret: Deno.env.get("TWITTER_CONSUMER_SECRET"),
    accessToken: Deno.env.get("TWITTER_ACCESS_TOKEN_KEY"),
    accessTokenSecret: Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET"),
  }) {
    this.api = new TwitterApi(keys,{ apiVersion: "2" });
  }
  tweet(text) {
    this.api.post("tweets", { text });
  }
}

export default Twitter;
