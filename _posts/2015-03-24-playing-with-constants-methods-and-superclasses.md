---
layout: post
title: Playing with Constants, Methods, and Superclasses
categories:
- tips & tricks
author: Jamis
comments: true
summary: >
  A few curious Rubyisms of dubious use, which may yet be worth
  knowing about
---

File this one under "Ruby Tricks of Questionable Usefulness." Still, it ought to be admitted that even questionably-useful tricks can sometimes inspire unexpectedly-creative solutions. To that end, I present the following, which I first saw used years ago in Why the Lucky Stiff's [Camping](https://github.com/camping/camping) web microframework. _(Kudos to [@vinbarnes](https://twitter.com/vinbarnes/status/581126249730314240) for helping me remember that!)_

Let's begin by observing the following (possibly unexpected) feature of Ruby. Did you know that you can have a constant and a method with the exact same name, and they won't collide?

Check this out.

{% highlight ruby %}
Sum = 0

def Sum(*args)
  args.inject(Sum) { |s,i| s + i }
end

p Sum      #-> 0
p Sum(1)   #-> 1
p Sum(1,2) #-> 3
{% endhighlight %}

See that? The first time we display `Sum`, we're actually printing the value of the _constant_. But as soon as we start adding arguments to the call, that's when we start hitting the method.

No errors, no warnings, no symbols shadowing other symbols. Just crazy Ruby fun.

The next (seemingly unrelated) tidbit is this: did you know that when you define a class, the bit where you specify the superclass is actually an _expression_? We usually just put a constant there, but it can be anything (as long as it evaluates to a class).

{% highlight ruby %}
class Shape
end

circle_is_shape = true
class Circle < (circle_is_shape ? Shape : Object)
end

p Circle.superclass #-> Shape
{% endhighlight %}

I know what you're thinking. "Whoa, that's pretty cool! But why would anyone ever want to do that?"

I'm glad you asked, because that segues neatly into the third little Ruby trick of the day.

You probably already knew that defining a class is the same as creating a new `Class` object and assigning it to a constant, right?

{% highlight ruby %}
# This:
class Shape
end

# is the same as this:
Shape = Class.new
{% endhighlight %}

This means that our class names are just constants...and we've already seen that we can have methods that share those same names. Further, we've also seen that the superclass expression in a class definition can be any expression at all... _We can stick a method invocation in there!_

Behold:

{% highlight ruby %}
class Shape
end

def Shape(which)
  require "shapes/#{which}"
  Shape.const_get(which.to_s.capitalize)
end

class Square < Shape
end

class Circle < Shape(:ellipse)
end
{% endhighlight %}

So, we have `Shape` declared as both a constant (our base `Shape` class) _and_ a method, where the method just does some work to load a hypothetical class from a file derived from the parameter.

Then, you can see that we can declare subclasses of `Shape` as normal, with the `Square` class being a typical example. However, we can get tricky. See that? `Circle` is a subclass of _whatever is returned by our `Shape` method_.

So what? Well, for one thing, it means you can do crazy things like data-driven class hierarchies, where an external configuration file lets you specify (for instance) the type of spline to be used, or the orientation and number of points on a star:

{% highlight ruby %}
require 'yaml'
config = YAML.load_file('definitions.yml')

class Spline < Shape(config[:spline])
end

class Star < Shape(config[:star])
end
{% endhighlight %}

As I said at the beginning, though, this may not have any real practical use. There are certainly other (possibly less-obscure) ways to accomplish this same thing. Still, you have to admit, it's rather fun to think about!
