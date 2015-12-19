---
layout: post
title: Avoiding "Call Super" with Callbacks
categories:
- Essays and Rants
author: Jamis
comments: true
summary: The author demonstrates the use of ActiveSupport::Callbacks to avoid the Call Super anti-pattern
---

[Call Super](https://en.wikipedia.org/wiki/Call_super) is situation in which a superclass requires that subclasses invoke `super` when overriding a method. [Martin Fowler](http://www.martinfowler.com/bliki/CallSuper.html) is, I believe, among the first to have labelled this an anti-pattern ("minor code smell", in his words), and he's careful to point out the problem is not with the `super` call, but with the framework's requirement that you _must remember to call `super`_. (If a `super` call is optional, it's not a code smell.)

Concretely, this is bad:

{% highlight ruby %}
class Animal
  def initialize
    # mandatory initialization here
  end
end

class Dog < Animal
  def initialize
    super # <-- MUST REMEMBER THIS OR ELSE!
    # other initialization here
  end
end
{% endhighlight %}

So what to do instead? Fowler recommends the use of a [Template Method](https://en.wikipedia.org/wiki/Template_method_pattern), where the superclass defines a (possibly empty) method, and then calls it at the point of extension. Subclasses can then override that template method, if needed.

{% highlight ruby %}
class Animal
  def initialize
    # mandatory initialization here, and then...
    _init_animal
  end

  # our empty template method
  def _init_animal
  end
end

class Dog < Animal
  # concrete implementation of template method
  def _init_animal
    # other initialization here
  end
end
{% endhighlight %}

This works great. I've been trying to use this pattern more since reading about Call Super, and I'm really happy with what it's done to my code. _However_... it falls down a bit when you're dealing with a more complex hierarchy of classes. For example, what happens when we add a specific kind of dog?

{% highlight ruby %}
class Schnauzer < Dog
  def _init_animal
    super # <-- ugh!
    # ...
  end
{% endhighlight %}

If we want to initialize our `Schauzer` objects, we have to override the template method, _and remember to call super!_ So what do we do? Well, we _could_ add a new template method for this second layer of inheritance:

{% highlight ruby %}
class Dog < Animal
  def _init_animal
    # ...
    _init_dog
  end

  def _init_dog
  end
end

class Schauzer < Dog
  def _init_dog
    # ...
  end
end
{% endhighlight %}

But this quickly becomes a mess. The programmer using this framework has to keep track of which initialization method to implement based on what the superclass is, and that's not a happy situation.

This is where _callbacks_ have been really helpful for me. Specifically, ActiveSupport has a robust callback implementation that you can drop into any class. Then, your subclasses can define `initialize` callbacks (or any others that you need), which the superclass will call before or after the appropriate extension points.

Like this:

{% highlight ruby %}
require 'active_support/callbacks'

class Animal
  include ActiveSupport::Callbacks

  define_callbacks :initialize

  def initialize
    run_callbacks :initialize do
      # mandatory initialization
    end
  end
end

class Dog < Animal
  set_callback :initialize, :after, :initialize_dog

  def initialize_dog
    # dog initialization
  end
end

class Schnauzer < Dog
  set_callback :initialize, :after, :initialize_schnauzer

  def initialize_schnauzer
    # schnauzer initialization
  end
end
{% endhighlight %}

Every class can have it's own unique initialization code, without worrying about overriding a superclass' implementation, or even knowing what method is used to initialize the superclass. It's super clean, very self-documenting, and easy to use, too.

The only wart, in my opinion, is how ugly that `set_callback` invocation looks. In practice, I usually wrap that in a helper method on the superclass:

{% highlight ruby %}
class Animal
  # ...

  def self.initialize_with(*callbacks)
    set_callback :initialize, :after, *callbacks
  end

  # ...
end

class Dog < Animal
  initialize_with :initialize_dog

  def initialize_dog
    # ...
  end
end
{% endhighlight %}

Lastly, when using `ActiveSupport::Callbacks`, it is important to note a few things:

* Callbacks registered with `:before` are called in _reverse declaration order_. That is to say, the last one registered is called first. Sometimes this is good, if you want a subclass to declare something that an earlier callback needs to consume. If you want a subclass to _override_ something, though, don't use `before` callbacks.
* Callbacks registered with `:after` are called in _declaration order_. The last one registered is called last. This is ideal when a subclass needs to override or alter something that an earlier callback has configured.
* You can call `run_callbacks` without a block, too. In this case, the `:before` callbacks are invoked, and then the `:after` callbacks are invoked immediately afterward.

Do you have any helpful tricks that you've used to avoid Call Super? Share them in the comments!
