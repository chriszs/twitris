import SimpleTwitter from "https://deno.land/x/simple_twitter_deno@0.05/simple_twitter_deno.ts";

class Twitter {
  constructor(
    keys = {
      consumer_key: Deno.env.get("TWITTER_CONSUMER_KEY"),
      consumer_secret: Deno.env.get("TWITTER_CONSUMER_SECRET"),
      access_token: Deno.env.get("TWITTER_ACCESS_TOKEN_KEY"),
      access_token_secret: Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET"),
    }
  ) {
    this.api = new SimpleTwitter(keys);
  }
  tweet(text) {
    return this.api.post("statuses/update", { status: text });
  }
}

export default Twitter;
