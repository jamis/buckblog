---
layout: post
title: "Little Things: Hashes & Procs"
categories:
- Essays and Rants
author: Jamis
comments: true
summary: >
  The interchangability of hashes and arity-1 procs is demonstrated as
  one of the endearing little features of Ruby
---

<a href="http://confreaks.tv/videos/mwrc2012-it-s-the-little-things"><img src="/images/20150905-little-things.png" width="300" height="225" class="right" /></a>

A few years ago, I gave a presentation at Mountain West Ruby Conference entitled ["It's the Little Things"](http://confreaks.tv/videos/mwrc2012-it-s-the-little-things), in which I described "some of the littlest things that make Ruby big". The point of the talk was really to highlight some of my favorite features of Ruby, and to emphasize that these seemingly small features add up to great things.

I keep coming back to that idea, that Ruby is what it is not because of any single "killer feature", but because of all the little details it gets right. (There's a lesson there, which I won't go into here because I already beat you over the head with it in the aforementioned presentation.)

Here's another example of one of those "little things", something I keep running into and appreciating every single time: isn't it great how hashes and procs both respond to `#[]`?

Seriously. It's not a relationship we often _need_ to appreciate, but there are times where the ability to treat them as duck-type-compatible is really, really handy. A simplistic example involves testing, where you might have a method that accepts a proc, and all you want to do is test the behavior of the method when the proc returns a particular value.

{% highlight ruby %}
frob = Frobnicator.new
selector = Proc.new { |arg| arg+1 }
assert_equal 6, frob.frobnicate(5, selector)
{% endhighlight %}

But what we want to test here is not the behavior of `selector`, right? We just want to make sure `#frobnicate` is doing what it needs to do. So we can use a hash to simplify things:

{% highlight ruby %}
frob = Frobnicator.new
assert_equal 6, frob.frobnicate(5, 5 => 6)
{% endhighlight %}

That is, given a function that turns 5 into 6, and given 5, make sure `#frobnicate` returns 6. As long as `#frobnicate` is limiting itself to the `[]` interface of `Proc`, this will work. (If, on the other hand, it decides to invoke `#call`, we'd be toast. But that's what [contracts](https://en.wikipedia.org/wiki/Design_by_contract) are all about, right?)

This equivalence goes both ways. Let's say you have a hash that is used to convert values for display. ("Favorite colors", say.)

{% highlight ruby %}
colors = { bob: "blue", mary: "green", alice: "orange" }
%i(bob mary alice).each do |who|
  puts "#{who} likes #{colors[who]}"
end
{% endhighlight %}

Easy enough. But what if suddenly we have a coworker who is particularly difficult, whose favorite color depends on the phase of the moon? Suddenly our hash is no longer sufficient...we need more logic there.

{% highlight ruby %}
color_map = { bob: "blue", mary: "green", alice: "orange" }
colors = ->(who) do
  if who == :trevor
    case phase_of_moon(Time.now)
      when :new      then "sarcoline"
      when :crescent then "coquelicot"
      when :half     then "smaragdine"
      when :gibbous  then "glaucous"
      when :full     then "wenge"
    end
  else
    color_map[who]
  end
end

%i(bob mary alice trevor).each do |who|
  puts "#{who} likes #{colors[who]}"
end
{% endhighlight %}

Our display code is virtually unchanged, right? And yet, Trevor's favorite color will now change depending on the phase of the moon.

I love that! The interchangability of hashes and (arity-1) procs is one of those little things that just tickles me. Even after almost fifteen years, Ruby still makes me smile.
