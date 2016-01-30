---
layout: post
title: The Dynamic Def
categories:
- tips & tricks
author: Jamis
comments: true
summary: >
  Playing around with Ruby's def statement. Also, the author
  introduces a throw-away project for playing interactive
  fiction games in irb
---

Here's a quiz for you. Without actually trying it, consider the following Ruby code. What would you expect it to do?

{% highlight ruby %}
def foo
  def bar
  end
end
{% endhighlight %}

Here's a hint: it's syntactically (and semantically) valid. It parses, and runs. Given that, what does it do? What would happen if you were to call `bar`? What about `foo`? In what scope does that `bar` method exist? When does it actually get defined--at parse time, or run time?

Perhaps you already know exactly what it's going to do, but feel free to try it anyway. You'll see it goes something like this:

{% highlight ruby %}
def foo
  def bar
  end
end

bar #-> NameError!
foo #-> defines the `bar' method
bar #-> invokes the `bar' method
{% endhighlight %}

In other words, the method `bar` does not exist, until the method `foo` is invoked. At that point, the `bar` method is defined, and becomes available.

However!

Looking at the above example, you might think that the method `bar` becomes a method local to the specific object instance, but sadly this isn't so. The thing about `def` is that it tends to create methods at the class level. Just so here. Consider:

{% highlight ruby %}
class Example
  def foo
    def bar
    end
  end
end

Example.new.foo
Example.new.bar #<-- this works!!!
{% endhighlight %}

Note that the second time we instantiate `Example`, the `bar` method exists! This is because we invoked `foo` on the first instance, which defined the `bar` method for us everywhere. Now, if we really _wanted_ instance-local methods, we could declare those methods inside the object's singleton class:

{% highlight ruby %}
class Example
  def foo
    class <<self
      def bar
      end
    end
  end
end

e1, e2 = Example.new, Example.new
e1.foo
e1.bar
e2.bar #<-- BOOM! `bar' not yet defined on `e2'!
{% endhighlight %}

Still, that's a bit cumbersome. And besides, you may be asking yourself: what's the point? Why even bother?

I'm so glad you asked. :)


## Memoization

If you've spent any time at all looking at Ruby code, you've almost certainly encountered this idiom:

{% highlight ruby %}
def some_expensive_computation
  @some_expensive_computation ||= begin
    # .. perform computation
  end
end
{% endhighlight %}

This is one common way of accomplishing method _memoization_. You perform the actual work of the method once, and then save the result. The next time you invoke that method, the cached result is returned instead.

Well...it turns out that we can use the Dynamic Def to do memoization for us.

{% highlight ruby %}
def some_expensive_computation
  def some_expensive_computation
    @some_expensive_computation
  end

  @some_expensive_computation = # ...
end
{% endhighlight %}

Note, though, that you'll probably need to define the inner method inside the singleton class; otherwise, you've just added the memoized method to _every instance of the class_. (Which is probably not what you wanted.)

{% highlight ruby %}
def some_expensive_computation
  class <<self
    def some_expensive_computation
      @some_expensive_computation
    end

    # or, more concisely:
    attr_reader :some_expensive_computation
  end

  @some_expensive_computation = # ...
end
{% endhighlight %}

If you need justification for this, try a simple benchmark script. It turns out that using a nested `def` for memoization results in a memoized method that is about 30% faster...but honestly, that's not saying much. Both techniques are pretty blazing fast. On my computer, 500k iterations of accessing the memoized method took either 0.05s, or 0.07s, depending on which technique was used.

_Shrug_.

So, what else is it good for?


## Fibonacci!

Check this out:

{% highlight ruby %}
class Fib
  def next
    def next
      def next
        (@a, @b = @b, @a+@b).last
      end

      @b = 1
    end

    @a = 0
  end
end
{% endhighlight %}

Now, we can compute the Fibonacci sequence:

{% highlight ruby %}
seq = Fib.new
100.times { puts seq.next }
#-> 0
#-> 1
#-> 1
#-> 2
#-> 3
#-> 5
#-> 8
#-> 13
#-> 21
#-> 34
# ...
{% endhighlight %}

Fibonacci, without recursion, or conditions! Of course, if we try to instantiate a new `Fib` and run it again...

{% highlight ruby %}
seq2 = Fib.new
seq2.next #-> BOOM! "undefined method `+' for nil:NilClass"
{% endhighlight %}

It dies...because our successive `next` methods were defined on the _class_, rather than the _object_. Easily fixed, but a little cumbersome. So, alright. Perhaps this approach to Fibonacci is best left as a novelty...

What else?


## State Machines

Consider a coin-operated turnstyle. It has two states: locked, and unlocked. When locked, if you push on it, it won't turn. You have to put a coin into it, which adds a credit and puts it in the unlocked state. At that point, it will turn when pushed, subtracting a credit, and when the credits get back to zero, it returns to the locked state.

Lookit.

{% highlight ruby %}
def start
  @coins ||= 0

  def state
    :locked
  end

  def insert_coin
    @coins += 1

    def push
      @coins -= 1
      (@coins < 1) ? start : state
    end

    def state
      :unlocked
    end

    state
  end

  def push
    puts "Nope! Nice try, though."
    state
  end

  state
end
{% endhighlight %}

Start the state machine by invoking the `start` method. Here's a sample transcript:

{% highlight ruby %}
start       #-> :locked
push        #-> "Nope! Nice try, though."
insert_coin #-> :unlocked
push        #-> :locked
push        #-> "Nope! Nice try, though."
insert_coin #-> :unlocked
insert_coin #-> :unlocked
insert_coin #-> :unlocked
push        #-> :unlocked
push        #-> :unlocked
push        #-> :locked
push        #-> "Nope! Nice try, though."
# ...
{% endhighlight %}

That's fun. But it's just a tantalizing taste of my favorite use of state machines... _[interactive fiction](https://en.wikipedia.org/wiki/Interactive_fiction)_.


## Interactive Fiction

Here's a fun exercise. Let's write an interactive fiction game that you play entirely in irb!

Each scene (or "room") will be method. Within that method, other methods will be defined that will implement actions to be taken within that room. Then, before moving to another room (by calling the other room's function), we'll `undef` all the functions we added.

Here's a simple example:

{% highlight ruby %}
def start
  def look
    puts "Oh, look! You're in a sparkly room! You can go north."
  end

  def north
    puts "Right, then. North you go!"
    undef look
    undef north
    room_to_the_north
  end

  look
end

def room_to_the_north
  def look
    puts "Uh, huh. Look at that. Nothing here."
    puts "You can go south, if you want to."
  end

  def south
    puts "Southward!"
    undef look
    undef south
    start
  end

  look
end
{% endhighlight %}

Now, let's load that up in irb, and start the game by typing `start`.

{% highlight text %}
irb> start
Oh, look! You're in a sparkly room! You can go north.
=> nil
irb> look
Oh, look! You're in a sparkly room! You can go north.
=> nil
irb> north
Right, then. North you go!
Uh, huh. Look at that. Nothing here.
You can go south, if you want to.
=> nil
irb> south
Southward!
Oh, look! You're in a sparkly room! You can go north.
=> nil
# etc...
{% endhighlight %}

Not a bad start. We can make it more polished, though. Did you know that you can customize irb, to control things like the prompt, and how it displays return values?

{% highlight ruby %}
IRB.conf[:PROMPT][:GAME] = {
  :PROMPT_I => "%N> ",  # "initial" prompt
  :PROMPT_C => "..",    # continued command
  :PROMPT_S => "..",    # continued string
  :PROMPT_N => "..",    # nested command
  :RETURN => ""         # formatting for return values
}

# `context' is an object provided by irb, for
# configuring irb.
context.prompt_mode = :GAME
{% endhighlight %}

This will simpilfy the IRB prompt, and hide return values. (That way we don't get that distracting `=> nil` after every command.) The prompt will still say `irb`, though...because of that `%N` in the `PROMPT_I` setting.

Let's change that. Instead of saying `irb`, let's have it say the name of the room we're in. It's as easy as telling irb what the "irb name" is, every time we enter a room:

{% highlight ruby %}
def start
  context.irb_name = "sparkly room"
  # ...
end

def room_to_the_north
  context.irb_name = "north room"
  # ...
end
{% endhighlight %}

The transcript starts to look quite a bit cleaner now:

{% highlight text %}
irb> start
Oh, look! You're in a sparkly room! You can go north.
sparkly room> look
Oh, look! You're in a sparkly room! You can go north.
sparkly room> north
Right, then. North you go!
Uh, huh. Look at that. Nothing here.
You can go south, if you want to.
north room> south
Southward!
Oh, look! You're in a sparkly room! You can go north.
# etc...
{% endhighlight %}

Note that because this is just an irb prompt, we can do some really cool things. Our interactive fiction platform lets us evaluate arbitrary Ruby code! This means we can have commands that accept lambdas and blocks, or iterate over commands. Let's say we want someone to give a man a fish, a hundred times:

{% highlight ruby %}
def start
  # ...

  @fish ||= 0
  def give(thing)
    if thing == :fish
      @fish += 1
      if @fish == 100
        puts "Thank you! I have 100 fish now!"
      elsif @fish < 100
        puts "Not there yet. I need #{100-@fish} more fish."
      else
        puts "Whoa! TOO MANY FISH!"
      end
    else
      puts "Um, I'm not sure what a #{thing} is..."
    end
  end

  # ...
end
{% endhighlight %}

The interaction might go something like this:

{% highlight text %}
sparkly room> give :fish
Not there yet. I need 99 more fish.
sparkly room> give :fish
Not there yet. I need 98 more fish.
sparkly room> 98.times { give :fish }
Not there yet. I need 97 more fish.
Not there yet. I need 96 more fish.
Not there yet. I need 95 more fish.
# ...
Thank you! I have 100 fish now!
sparkly room>
{% endhighlight %}

One last improvement. It kind of kills the mood to have to use a symbol like that. Wouldn't it be nice if we could just do `give fish` and have it work? Well, we can. I'm not normally one to endorse abuse of `method_missing`, but for a throw-away project like this, why not!

{% highlight ruby %}
class <<self
  def method_missing(sym, *args)
    if args.empty?
      sym
    else
      super
    end
  end
end
{% endhighlight %}

We declare `method_missing` inside the singleton class for irb, because otherwise it will get added to the `Object` class, and that wreaks all kinds of havoc. (You'll find irb won't be very happy with that.) Our new `method_missing` just takes every method call with zero arguments and has it return its name as a symbol. Thus `fish` returns `:fish`, and so forth. Our interaction now looks much nicer:

{% highlight text %}
sparkly room> give fish
Not there yet. I need 99 more fish.
{% endhighlight %}

Where else to take this? How about adding an inventory, and the ability to pick up and drop objects? How about adding some automation to the room transitions, so that we don't have to manually undef the methods we added? I'll leave all that as an exercise for you, Dear Reader, because this article is already nearly a novel.

However, because I can rarely leave well-enough alone, I'll close by showing you a little project I've called ["ifrb"](http://github.com/jamis/ifrb)--interactive fiction for irb. It's also a gem, so you can just `gem install ifrb`. Once installed, just run `ifrb basil` to enjoy a simple introductory adventure featuring [Basil Smockwhitener](http://blog.jamisbuck.org) (wizard and gentleman) and his stalwart manservant Fabian.

Or, you know. Write your own adventure. Enjoy!

[ifrb -- Interactive Fiction for Interactive Ruby](http://github.com/jamis/ifrb)
