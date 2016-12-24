---
layout: post
title: Process Roulette
categories:
- projects
author: Jamis
comments: true
summary: >
  Announcing a party game for developers, but with a few caveats
---

A week or so ago I posted a throw-away tweet with an idea that (I'm sure) is neither original, nor worthy of actually spending time on:

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Party game idea. Each person randomly kills processes on their laptop. Last person standing wins.</p>&mdash; Jamis Buck (@jamis) <a href="https://twitter.com/jamis/status/808779302468665344">December 13, 2016</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

However, once posted, I couldn't stop thinking about it, and so here we are, a week and a half later, and I'm announcing the initial release of "Process Roulette". It gave me a chance to experiment with the [atom](https://atom.io/) editor, as well as to try and finally learn the pros and cons of [rubocop](http://rubocop.readthedocs.io/en/latest/). (I'll try and do a separate post for each of those in the near future.)

But right now, we're here because of process roulette. The premise is just what I said in my tweet: each player whacks random processes on their machine until their player process goes away. Whoever lasts the longest, wins.

There are three parts to this game:

1. The *croupier*. This is the supervisor process that manages the game, tracks the rounds, and ultimately decides the winner.
2. The *controller*. This is a separate process that connects to the croupier and declares when each bout should start. The controller is notified whenever a new player joins, as well as when a game ends. (There are also *spectators*, who are like controllers, but read-only.)
3. The *players*. These are the processes that actually whack processes. These should always be run on machines that you hate. Or, you know, virtual machines. The players connect to the croupier, and when the signal is given, they proceed to kill processes at random.

Want to give it a try? It's easy! First, install the gem:

{% highlight text %}
$ gem install process-roulette
{% endhighlight %}

You'll need to install it on every computer that will be involved.

Then, fire up the croupier. Just tell it which port to listen on, and what password the controllers should use to authenticate:

{% highlight text %}
$ croupier -p 8192 password
{% endhighlight %}

Once the croupier is running, start up at least one controller. Tell it where the croupier is running, and give the password as well:

{% highlight text %}
$ roulette-ctl localhost:8192 password
Starting controller process...
connecting...

waiting for bout to begin
controller>
{% endhighlight %}

This will give you a command prompt--for now, just leave it be. We'll talk about what you can do as the controller in a moment.

Optionally, you can also start up multiple spectators, to watch the game. (This is useful for people who are starting up the player processes, since otherwise they won't know who won the game!) The spectators are just controllers, minus the password.

{% highlight text %}
$ roulette-ctl localhost:8192
{% endhighlight %}

Lastly, on each virtual machine (or otherwise despised host), fire up a player process. _Make sure and run it as a superuser_, otherwise it won't be able to kill the really important processes! Tell it where the croupier is, and what username should identify the player.

{% highlight text %}
$ sudo roulette-player username@host:port
{% endhighlight %}

The player will then display "connecting", and will wait for the signal from the croupier. As each player connects, the controllers should display the username of the player, along with the total number of registered players.

When everyone has joined and the game is ready, one of the controllers should type "GO" at their prompt, and press return:

{% highlight text %}
$ roulette-ctl localhost:8192 password
Starting controller process...
connecting...

waiting for bout to begin
controller> GO

telling croupier to start game
controller>
BOUT BEGINS
{% endhighlight %}

At this point, the players will all begin whacking processes, and the controllers (and spectators) will indicate the beginning of each subsequent round. As players die, the controllers will show that as well. When the last player dies, the controllers will summarize the bout with a scoreboard, and then return to the command prompt, ready to start a new game when players (re)join.

{% highlight text %}
BOUT FINISHED
   | Name       | Killer     | Rounds
---+------------+------------+-------
 1 | bob        | bash       |    63
 2 | crazy      | login      |    51
 3 | juliet     | ruby       |    49
 4 | grinch     | login      |    13

waiting for bout to begin
controller>
{% endhighlight %}

The controller itself may be terminated by typing "QUIT" (or ^D). Typing "EXIT" will tell the croupier process itself to terminate.

Give it a try and let me know what you think! If you want to tinker with it a bit yourself, check out the source code on [GitHub](http://github.com/jamis/process_roulette).
