---
layout: post
title: Reducing a Number to Its Sign
categories:
- Tips & Tricks
author: Jamis
comments: true
summary: >
  A simple technique is presented for extracting the sign of a number
---

When implementing certain kinds of algorithms, I often seem to find myself needing to move a token a given number of steps toward some location. In the "Back from the Klondike" puzzle described [previously](http://weblog.jamisbuck.org/2015/8/4/writing-a-klondike-puzzle-solver.html), for example, I needed to verify that a given path between two cells was valid, which I did by walking the path between those cells.

To do that, I typically compute the difference between the two locations to get a vector, and then assign each component of the vector to `dx` and `dy` variables. If `dx` is positive, `x` will increment by one each step. If `dx` is negative, `x` will decrement by one at each step, instead. Likewise for `dy` and `y`, and if either is zero, that coordinate will not change.

In the past, I've implemented this calculation like this:

{% highlight ruby %}
dx = to_x - from_x
dy = to_y - from_y

if dx > 0
  dx = 1
elsif dx < 0
  dx = -1
end

if dy > 0
  dy = 1
elsif dy < 0
  dy = -1
end
{% endhighlight %}

This works, but it is annoyingly verbose. All I want, is for `dx` and `dy` to be `+1` or `-1` or `0`, depending on the sign of the difference between the two locations.

This brought to mind Ruby's `<=>` operator (sometimes affectionately referred to as the "spaceship" operator). As implemented on integers and floating point numbers, `a <=> b` will return -1 if `a` is less than `b`, +1 if `a` is greater than `b`, and `0` if they're equal. (This is used by the [Comparable](http://ruby-doc.org/core-2.2.2/Comparable.html) module to allow you to define how your own objects ought to be compared against each other.)

Using this operator, we can implement the above logic like this, now:

{% highlight ruby %}
dx = (to_x - from_x) <=> 0
dy = (to_y - from_y) <=> 0
{% endhighlight %}

Lovely! I love it when an overly verbose bit of code condenses down to a one-liner. Still, because `<=>` is not a commonly seen operator, if you use this trick you might want to add a comment to indicate what the purpose of the code is, or even better, encapsulate it in a method:

{% highlight ruby %}
# Numeric is the superclass of Float and Integer
class Numeric
  # -1 if self is negative
  #  0 if self is zero
  # +1 if self is positive
  def sign
    self <=> 0
  end
end
{% endhighlight %}

That snippet becomes even simpler (and more self-documenting) now:

{% highlight ruby %}
dx = (to_x - from_x).sign
dy = (to_y - from_y).sign
{% endhighlight %}

_Viva la Ruby!_
