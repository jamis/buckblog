---
layout: post
title: 'Variations on a Theme: "I Becomes We..."'
categories:
- essays and rants
author: Jamis
comments: true
summary: >
  A light-hearted search for pithy sayings inspired by a
  church billboard
---

I was in Oregon last week, staying with my aunt and uncle, and on the way to their place I passed a church with a sign that read:

> When I becomes we,
> illness becomes wellness

Now, normally I really like pithy little sayings like that. I love playing with language, and discovering insights (intentional or otherwise) that come from changing the way we look at words and meanings.

This one just annoyed me, though. The more I thought about it, the more it irked me. It was _trying_ to be pithy and meaningful, but it fell short of the mark. It just didn't work for me.

But I wondered if I could find some that worked better. It seemed like it would be a simple matter of parsing a dictionary file, replacing substrings in each word and seeing which ones resulted in real words.

The [script](https://gist.github.com/jamis/91cb91a5a0106811b8e4) was easy enough to write. I started simple, working with the original "I becomes we" theme:

* When I becomes we, inch becomes wench.
* When I becomes we, it becomes wet.

Then I experimented a bit with puns:

* When I becomes eye, kid becomes keyed.

And with changing cases:

* When me becomes us, permeable becomes perusable.
* When me becomes us, homey becomes housy.

Those weren't quite going where I wanted (except for the "it becomes wet" one, which I actually kind of liked.)

So I started casting about for other small words that could be swapped:

* When a becomes the, nearmost becomes nethermost.

That one _almost_ crossed the threshold of pithiness, but the "a" versus "the" thing was too tenuous. I started wondering if I could play with the sentence itself, where "becomes" could be understood more than one way.

* When he becomes old, cheer becomes colder.
* When he becomes fat, heal becomes fatal.
* When it becomes cold, sit becomes scold.

Better... this was moving in the right direction. I next tried waxing proverbial, and experimented with other structures, moving away from "becomes":

* When he turns to ale, she turns to sale.
* When over is out, lover is lout.
* When she says no, masher becomes manor.

That "says" form inspired me especially:

* When pa says no, sparingly is snoringly.
* When ma says no, smart goes snort.
* When ma says you, mars is yours.

Well all was said and done, though, my favorite one used the original "becomes" form:

* He becomes rich, and theology becomes [trichology](https://en.wikipedia.org/wiki/Trichology).

<img src="/images/20160312-church-sign.jpg" width="400" height="300" class="center" />

I really hope someone puts that on a real church billboard somewhere.

* * *

_The script for searching the dictionary for a particular pairing was pretty trivial, but if you'd like to play with it, [I've posted it as a gist](https://gist.github.com/jamis/91cb91a5a0106811b8e4). If you find some good pairings, let me know!_
