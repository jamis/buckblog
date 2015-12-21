---
layout: post
title: Avoiding "Call Super" with Callbacks
categories:
- Essays and Rants
author: Jamis
comments: true
summary: The author demonstrates the use of ActiveSupport::Callbacks to avoid the Call Super anti-pattern
---

_Updated 2015-12-21. The example I originally used in this article was not very good, and apparently gave the false impression that I was encouraging the use of callbacks as a general replacement for `super`. I've updated the example with something closer to my original use case._

[Call Super](https://en.wikipedia.org/wiki/Call_super) is situation in which a superclass requires that subclasses invoke `super` when overriding a method. [Martin Fowler](http://www.martinfowler.com/bliki/CallSuper.html) is, I believe, among the first to have labelled this an anti-pattern ("minor code smell", in his words), and he's careful to point out the problem is not with the `super` call, but with the framework's requirement that you _must remember to call `super`_. (If a `super` call is optional, it's not a code smell.)

Here's a concrete example of where "Call Super" is a problem. Let's imagine we've got a library system that tracks grace periods and late fees. We have a "rules" class that tells us what the grace period for a particular book is, and what the corresponding late fee is.

{% highlight ruby %}
class LendingRules
  def initialize(book, options={})
    @book = book
    @options = options

    _initialize_defaults
    _configure_settings
  end

  def _initialize_defaults
    @default_grace_period = 2 #days
    @default_late_fee = 1 # dollars
  end

  def _configure_settings
    @grace_period =
      @options.fetch(:grace_period, @default_grace_period)
    @late_fee =
      @options.fetch(:late_fee, @default_late_fee)
  end
end
{% endhighlight %}

We've got the base class set up with a default grace period and default late fee, and we've got a method where the concrete values for those settings are pulled out of the options hash.

Now, let's say we have a special case when dealing with fiction, so we subclass our rules and override things. We want the subclass to have a different default grace period and late fee, _and_ we want the late fee to double if the book has a waiting list.

{% highlight ruby %}
class FictionRules < LendingRules
  def _initialize_defaults
    super # <-- DON'T FORGET THIS!!!
    @default_grace_period = 4 # days
    @default_late_fee = 2 # dollars
  end

  def _configure_settings
    super # <-- DON'T FORGET THIS!!!
    @late_fee *= 2 if @book.waiting_list?
  end
end
{% endhighlight %}

The anti-pattern is manifested here because we _must_ remember to call `super`. If we don't, some of our rules won't get initialized.

So what to do instead? Fowler recommends the use of a [Template Method](https://en.wikipedia.org/wiki/Template_method_pattern), where the superclass defines a (possibly empty) method, and then calls it at the point of extension. Subclasses can then override that template method, if needed.

{% highlight ruby %}
class LendingRules
  # ...

  def _initialize_defaults
    @default_grace_period = 2 #days
    @default_late_fee = 1 # dollars
    _customize_defaults
  end

  def _customize_defaults
  end

  def _configure_settings
    @grace_period =
      @options.fetch(:grace_period, @default_grace_period)
    @late_fee =
      @options.fetch(:late_fee, @default_late_fee)
    _customize_settings
  end

  def _customize_settings
  end
end

class FictionRules < LendingRules
  def _customize_defaults
    @default_grace_period = 4 # days
    @default_late_fee = 2 # dollars
  end

  def _customize_settings
    @late_fee *= 2 if @book.waiting_list?
  end
end
{% endhighlight %}

This works pretty well. I've been trying to use this pattern more recently, and I'm really happy with what it's done to my code. _However_... it falls down a bit when you're dealing with a more complex hierarchy of classes. For example, what happens when our rules change for a particular _type_ of fiction? Let's say the grace period is actually just a single day for vampire romance novels.

{% highlight ruby %}
class VampireRomanceRules < FictionRules
  def _customize_defaults
    super # <-- GOTTA REMEMBER THIS AGAIN?
    @default_grace_period = 1 # days
  end
end
{% endhighlight %}

If we want to change a default for our `VampireRomanceRules` objects, we have to override the template method, _and remember to call super!_ So what do we do? Well, we _could_ add a new template method for this second layer of inheritance:

{% highlight ruby %}
class FictionRules < LendingRules
  # ...
  def _customize_defaults
    # ...
    _customize_fiction_defaults
  end

  def _customize_fiction_defaults
  end
end

class VampireRomanceRules < FictionRules
  def _customize_fiction_defaults
    # ...
  end
end
{% endhighlight %}

But this quickly becomes a mess. The programmer using this framework has to keep track of which initialization method to implement based on what the superclass is, and that's not a happy situation.

This is where _callbacks_ have been really helpful for me. Specifically, ActiveSupport has a robust callback implementation that you can drop into any class. Then, your subclasses can define `initialize` callbacks (or any others that you need), which the superclass will call before or after the appropriate extension points.

Like this:

{% highlight ruby %}
require 'active_support/callbacks'

class LendingRules
  include ActiveSupport::Callbacks

  define_callbacks :initialize, :configure
  
  def initialize(book, options={})
    @book = book
    @options = options

    _initialize_defaults
    _configure_settings
  end

  def _initialize_defaults
    run_callbacks :initialize do
      @default_grace_period = 2 #days
      @default_late_fee = 1 # dollars
    end
  end

  def _configure_settings
    run_callbacks :configure do
      @grace_period =
        @options.fetch(:grace_period, @default_grace_period)
      @late_fee =
        @options.fetch(:late_fee, @default_late_fee)
    end
  end
end

class FictionRules < LendingRules
  set_callback :initialize, :after, :initialize_fiction_defaults
  set_callback :configure, :after, :configure_fiction_settings

  def initialize_fiction_defaults
    @default_grace_period = 4 # days
    @default_late_fee = 2 # dollars
  end

  def configure_fiction_settings
    @late_fee *= 2 if @book.waiting_list?
  end
end

class VampireRomanceRules < FictionRules
  set_callback :initialize, :after, :initialize_vampire_romance

  def initialize_vampire_romance
    @default_grace_period = 1 # days
  end
end
{% endhighlight %}

Every class can have it's own unique initialization code, without worrying about overriding a superclass' implementation, or even knowing what method is used to initialize the superclass. It's super clean, very self-documenting, and easy to use, too.

The only wart, in my opinion, is how ugly that `set_callback` invocation looks. In practice, I usually wrap that in a helper method on the superclass:

{% highlight ruby %}
class LendingRules
  # ...

  def self.initialize_with(*callbacks)
    set_callback :initialize, :after, *callbacks
  end

  def self.configure_with(*callbacks)
    set_callback :configure, :after, *callbacks
  end

  # ...
end

class FictionRules < LendingRules
  initialize_with :initialize_fiction_defaults
  configure_with :configure_fiction_settings

  # ...
end

class VampireRomanceRules < FictionRules
  initialize_with :initialize_vampire_romance

  # ...
end
{% endhighlight %}

Lastly, when using `ActiveSupport::Callbacks`, it's good to understand a few things:

* Callbacks registered with `:before` are called in _reverse declaration order_. That is to say, the last one registered is called first. Sometimes this is good, if you want a subclass to declare something that an earlier callback needs to consume. If you want a subclass to _override_ something, though, don't use `before` callbacks.
* Callbacks registered with `:after` are called in _declaration order_. The last one registered is called last. This is ideal when a subclass needs to override or alter something that an earlier callback has configured.
* You can call `run_callbacks` without a block, too. In this case, the `:before` callbacks are invoked, and then the `:after` callbacks are invoked immediately afterward.

Do you have any helpful tricks that you've used to avoid Call Super? Share them in the comments!
