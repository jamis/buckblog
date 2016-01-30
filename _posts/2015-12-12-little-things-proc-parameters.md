---
layout: post
title: "Little Things: Introspecting Block Parameters"
categories:
- essays and rants
author: Jamis
comments: true
summary: |
  The author uses Ruby's `Proc#parameters` feature to implement a
  simple way to access data in a Hash
---

This week I stumbled across a rather esoteric feature of Ruby, but one that actually proved really, really useful with something I'm doing for a client of mine. The feature? [`Proc#parameters`](http://ruby-doc.org/core-2.2.3/Proc.html#method-i-parameters). From the Ruby docs:

{% highlight ruby %}
prc = lambda{|x, y=42, *other|}
prc.parameters  #=> [[:req, :x], [:opt, :y], [:rest, :other]]
{% endhighlight %}

Since I don't yet have permission from my client to share the actual code I wrote, I'll demonstrate this esoteric little feature by monkeypatching `Hash` and adding a `using` method. The end result will let us access Hash keys that match the names of the parameters we pass to the block, like this:

{% highlight ruby %}
hash = {
  first_name: "John",
  last_name:  "Smith",
  age: 35,
  # ...
}

hash.using do |first_name, last_name|
  puts "Hello, #{first_name} #{last_name}."
end

# or even...

circle = {
  radius: 5,
  color: "blue",
  # ...
}

area = circle.using { |radius| Math::PI * radius**2 }
{% endhighlight %}

(Admittedly, these examples are a bit contrived, but I'm really quite in love with this idea. Hopefully I get to share the _real_ use case eventually!)

The implementation of `#using` is delightfully simple:

{% highlight ruby %}
class Hash
  module Using
    def using(&block)
      values = block.parameters.map do |(type, name)|
        self[name]
      end

      block.call(*values)
    end
  end

  include Using
end
{% endhighlight %}

That's it! We just inspect the parameters of the block, map the parameter names to the corresponding values, and invoke the block with those values as arguments.

I love Ruby. Fifteen years, and going strong.
