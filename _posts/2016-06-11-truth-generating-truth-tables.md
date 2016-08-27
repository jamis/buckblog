---
date: 2016-06-11
layout: post
title: "Truth: Generating Truth Tables"
categories:
- projects
author: Jamis
comments: true
summary: >
  A new library for generating truth tables is announced
---

The post I was _going_ to write today decided it needed some [truth tables](https://en.wikipedia.org/wiki/Truth_table) to support it, so of course (being the sort of programmer I am) I decided I would first write a utility to parse an expression and display the associated truth table.

(There are other tools out there that do this, some probably better than what I came up with, but I _love_ writing parsers and I really just wanted to write my own. So there.)

So, as a result, I didn't have time to write the post I was originally intending to write. That's the bad news. The good news is that instead of that post, you get a post announcing my truth-table generator!

(And I still plan to write that other post. It'll have to wait for next week, though.)

So, without further ado, allow me to introduce [Truth](https://github.com/jamis/truth)!

There's no gem for it (for various reasons, the most embarrassing being that the code has no tests yet...), and there are other gems called "truth", and "truth-table", so I need to figure out the best way to name it.

If _that_ doesn't scare you away, and you manage to download the code anyway, you can generate truth tables using the `truth` utility (in the `bin` directory):

{% highlight sh %}
$ ruby -Ilib bin/truth "(A || B) && C"
Expression:
(A || B) && C

 A  B  C | =
---------+---
 f  f  f | f 
 t  f  f | f 
 f  t  f | f 
 t  t  f | f 
 f  f  t | f 
 t  f  t | t 
 f  t  t | t 
 t  t  t | t 
 {% endhighlight %}

Or, you can do so programmatically:

{% highlight ruby %}
require 'truth'

table = Truth::Table.new "(A || B) && C"
table.display
{% endhighlight %}

Next week's post will hopefully be more interesting. In the meantime, give this a try and let me know what you think.

_The truth shall make you free!_
