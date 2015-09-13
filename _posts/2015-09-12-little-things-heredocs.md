---
layout: post
title: "Little Things: Heredocs"
categories:
- Essays and Rants
author: Jamis
comments: true
summary: >
  Another minor-but-useful feature of Ruby&mdash;heredocs&mdash;is demonstrated
---

Ruby definitely did not invent [heredocs](https://en.wikipedia.org/wiki/Here_document) (Wikipedia says they originated with Unix shells), but they are one more of those [little things](/2015/9/5/little-things-hashes-and-procs.html) that I really appreciate in Ruby.

At their simplest, they are merely a means of defining a (potentially) multi-line string, thus:

{% highlight ruby %}
def lorem
  <<LOREM
Lorem ipsum dolor sit amet, consectetur adipiscing
elit, sed do eiusmod tempor incididunt ut labore
et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut
...
LOREM
end

p lorem #-> "Lorem ipsum dolor sit amet,..."
{% endhighlight %}

That odd-looking `<<LOREM` syntax introduces `LOREM` as the delimiter for the heredoc, and the parser then reads all subsequent lines of text up to (but not including) the final `LOREM` and treats them as a single string, including all whitespace. (You don't have to use the word `LOREM`, either--any valid identifier will do.)

With this syntax, the final delimiter (e.g. `LOREM`) _must_ appear on a line by itself with no leading whitespace, which can be kind of a bummer sometimes. (It tends to put a real cramp in one's neatly indented program.) Fortunately, there's a solution for that: prefix the first delimiter with a hyphen, and Ruby will ignore whitespace in front of the final delimiter.

{% highlight ruby %}
def lorem
  <<-LOREM
    Lorem ipsum dolor sit amet, consectetur adipiscing
    quis nostrud exercitation ullamco laboris nisi ut
    ...
  LOREM
end

p lorem #-> "    Lorem ipsum dolor sit amet,..."
{% endhighlight %}

This lets you indent the final delimiter...but remember that all whitespace is preserved inside the heredoc. If you indent the text inside the heredoc, those indentations will be in the final string. Sometimes you want that...other times, not so much.

This leads to a quirky (but oh, so useful!) little thing about heredocs: syntactically, _the first delimiter represents the entire heredoc_. That is to say, if you want to invoke a method on the string, you attach the method invocation to the first delimiter, not the last! Like this:

{% highlight ruby %}
def lorem
  <<-LOREM.gsub(/^\s*/, "")
    Lorem ipsum dolor sit amet, consectetur adipiscing
    quis nostrud exercitation ullamco laboris nisi ut
    ...
  LOREM
end

p lorem #-> "Lorem ipsum dolor sit amet,..."
{% endhighlight %}

Note how the `gsub` call is attached to the first delimiter. This will call gsub on the entire heredoc, stripping leading whitespace from each line of the string.

Quirky? Yes, perhaps, but really handy. Because that first delimiter can stand in for the entire heredoc, it lets you pass entire heredocs as arguments to methods:

{% highlight ruby %}
def lorem_sub(original)
  original.gsub(/secret text/, <<-LOREM.gsub(/^\s*/, ""))
    Lorem ipsum dolor sit amet, consectetur adipiscing
    quis nostrud exercitation ullamco laboris nisi ut
    ...
  LOREM
end

p lorem_sub("Beware the secret text in this string!")
#-> "Beware the Lorem ipsum dolor sit amet...in this string!"
{% endhighlight %}

See that? The first delimiter just drops right in as an argument, and the heredoc picks right up on the next line. You can even (though I don't recommend it) pass multiple heredocs to a single method invocation. (Pardon the contrived example here...this really is something you'll never want to do, but it's fun to know that it _can_ be done!)

{% highlight ruby %}
def replace(original, pattern, replacement)
  original.gsub(pattern, replacement)
end

result = replace(<<ORIGINAL, /secret text/, <<REPLACEMENT)
Beware the secret text in this really long
multiline string! The secret text is something
that should be kept secret.
ORIGINAL
Lorem ipsum dolor sit amet, consectetur adipiscing
quis nostrud exercitation ullamco laboris nisi ut
...
REPLACEMENT

p result #-> "Beware the Lorem ipsum dolor..."
{% endhighlight %}

Also, it's worth noting that by default, heredocs in Ruby are subject to string interpolation, just as if they were double-quoted strings:

{% highlight ruby %}
address = <<ADDRESS.gsub(/^\s*/, "")
  #{first_name} #{last_name}
  #{street_address1}
  #{street_address2}
  #{city}, #{state} #{zip}
ADDRESS
{% endhighlight %}

If you don't want a heredoc to be string-interpolated (that is, you want to treat it like a _single_-quoted string), just single-quote the first delimiter:

{% highlight ruby %}
template_string = <<-'TEMPLATE'
  My name is #{first_name}.
  I like #{favorite_food}.
TEMPLATE

p template_string #-> "  My name is \#{first_name}..."
{% endhighlight %}

You can use double-quotes, too, to get the default behavior (if you like being explicit). And if you use backticks, Ruby will execute each line in a shell and replace it with the output of that command:

{% highlight ruby %}
output = <<-`COMMANDS`
  echo first
  echo second
COMMANDS

p output #-> "first\nsecond\n"
{% endhighlight %}

Heredocs may not be a groundbreaking, game-changing feature of Ruby, but they certainly make me smile when I need them. Little things, I tell you!

(I'm sure there have got to be more tricks involving heredocs, ones I've never seen, so if you happen to have a favorite, please share it!)
