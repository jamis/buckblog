---
layout: post
title: Writing a Simple Recursive Descent Parser
categories:
- essays and rants
author: Jamis
comments: true
summary: >
  A simple implementation of a field-based query string, with binary
  operations, using a recursive descent parser
---

Someone asked a question recently on the local ruby list. They were looking for an implementation of a parser that would handle keywords and field specifications, like this:

{% highlight text %}
country:(ru OR cn OR "South Korea")
state:(texas OR ok)
company:"ACME Products"
last:smith AND first:john
{% endhighlight %}

Now, you have to understand that the compiler class I took in college (almost 20 years ago?!) was one of my favorites. It completely blew my mind. I still have (and love) the [Dragon Book](http://www.amazon.com/Compilers-Principles-Techniques-Tools-2nd/dp/0321486811) by Aho, et. al., and every once in a while--for old time's sake--I take it off the shelf, thumb through it, and wax nostalgic. Ten-plus years ago I even invented and implemented some simple programming languages...but my career, as a whole, has been remarkably void of opportunities to implement parsers.

So, when this query came along, I perked up. _A parser?_ Hmmm!

There are lots of different ways to implement these, but I decided to go with a [recursive descent parser](https://en.wikipedia.org/wiki/Recursive_descent_parser). These have always been my favorite, and--frankly--I couldn't remember off the top of my head how to do any of the others.

So, first, I took the informal specification that was given by the OP, and converted it into [Backus-Naur Form](https://en.wikipedia.org/wiki/Backus%E2%80%93Naur_Form) (BNF). (Technically, I guess I used an EBNF--[Extended Backus-Naur Form](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_Form)--but this was just for my own use anyway.)

{% highlight text %}
expr := term
      | term AND expr
      | term OR expr
term := value
      | atom ':' value
atom := word+
      | quoted_string
value := atom
       | '(' expr ')'
{% endhighlight %}

*Caveat*: I intentionally avoided operator precedence, so in this implementation `AND` and `OR` have equivalent precedence. Also, the string parsing is very naive, for simplisity's (and demonstration's) sake.

Honestly, converting the description into a BNF is usually the hardest part, but once you've got that, the rest of the parser flows very naturally. Each of the left-hand sides of those BNF definitions becomes a method, which recursively calls the appropriate methods corresponding to the items on the right-hand side. (Thus, the "recursive" in "recursive descent".)

The idea here is that the parse process will return an AST--an [abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree)--which represents the input. To support that tree, I defined two simple structures: one for an expression with an operator, and one for a field specification:

{% highlight ruby %}
class Expression < Struct.new(:op, :left, :right)
end

class Field < Struct.new(:name, :value)
end
{% endhighlight %}

Then, I jumped right in at the top and wrote the `#parse` method. It accepts a single argument, the input to parse (as a string). I used Ruby's [`StringScanner`](http://ruby-doc.org/stdlib-2.2.2/libdoc/strscan/rdoc/index.html) class to do the [lexical analysis](https://en.wikipedia.org/wiki/Lexical_analysis) (scanning), because there's rarely a reason not to, really. `StringScanner` is awesome!

{% highlight ruby %}
def parse(string)
  scanner = StringScanner.new(string)
  parse_expr(scanner)
end
{% endhighlight %}

Recall the BNF from before. The `expr` element is the top-level, so my `#parse` method calls that. The implementation for `#parse_expr` is nice and simple:

{% highlight ruby %}
def parse_expr(scanner)
  left = parse_term(scanner)

  scanner.skip(/\s+/)
  op = scanner.scan(/AND|OR/i)

  if op
    Expression.new(op.downcase.to_sym, left, parse_expr(scanner))
  else
    left
  end
end
{% endhighlight %}

Our `expr` element (in the BNF) may be a `term`, or a `term` followed by an operator. Since it always starts with a `term`, we first call the corresponding `#parse_term` method. Then, we skip any whitespace, and look for an operator. If we find one, we instantiate a new `Expression`, give it the operator, the left operand, and parse the right operatand (as an `expr`--note the recursion!). Otherwise, we simply return the operand we parsed at the start.

Easy!

Next, let's look at how `#parse_term` is defined:

{% highlight ruby %}
def parse_term(scanner)
  scanner.skip(/\s+/)

  value = parse_value(scanner)
  return value if value.is_a?(Expression)

  if scanner.skip(/:/)
    Field.new(value, parse_value(scanner))
  else
    value
  end
end
{% endhighlight %}

We start by skipping (or "eating", as its called) any whitespace. Then we look for a value. Look at the BNF again: see how a `value` may be either an `atom`, or a parenthesized `expr`? Comparing that with the `term` definition, we can see that a `term` may start with either an `atom`, or an `expr`. This means we can call `parse_value`, and if the result is an `Expression`, then we're done and we just return it. Otherwise, we need to consider the case where we've got a field specification.

To do that, we check the next character. If it's a colon, we instantiate a new `Field` and return it, parsing a new value in the process. Otherwise, we just return the value we already parsed.

So, what about `parse_value`, then? Surely it'll be a beast? I mean, it can't _all_ be this easy, right?

Ha ha! You're hilarious. Check this out.

{% highlight ruby %}
def parse_value(scanner)
  start = scanner.pos
  if scanner.skip(/\(/)
    parse_expr(scanner).tap do
      scanner.scan(/\)/) or
        raise "expression not terminated (start at #{start})"
    end
  else
    parse_atom(scanner)
  end
end
{% endhighlight %}

We do have our first instance of error handling, here. We save the current position in the scanner, and then look for an opening parenthesis. If we find one, we parse (and return) an `expr`, and then eat a closing parenthesis. If no closing parenthesis is found, though, that's an error! We raise an exception, telling where in the string the expression began.

If, on the other hand, there was no opening parenthesis to begin with, the value must be an `atom`, and we parse that instead.

Two more methods to go! The `atom` parser is really straight-forward:

{% highlight ruby %}
def parse_atom(scanner)
  scanner.scan(/\w+/) ||
    parse_quoted_string(scanner) ||
    raise("expected an atom at #{scanner.pos}")
end
{% endhighlight %}

An `atom` is either a word (`/\w+/`) or a quoted string. If it is neither of those, we raise an exception and show where the error occurred.

Last method, then: parsing quoted strings.

{% highlight ruby %}
def parse_quoted_string(scanner)
  start = scanner.pos
  delim = scanner.scan(/['"]/)
  if delim
    scanner.scan(/[^#{delim}]*/).tap do
      scanner.scan(/#{delim}/) or
        raise "quoted string not terminated (start at #{start})"
    end
  end
end
{% endhighlight %}

We save the position (for error reporting), and then look to see what kind of quotation marks we're dealing with. We then scan all characters up to (but not including) the next instance of that quotation mark, and return them, making sure to eat the closing quotation mark in the process. If there was no closing quotation mark, we report that error.

And that's it! Seriously. We can now parse queries like this:

{% highlight ruby %}
# simple words
parse "compilers"
#-> "compilers"

# field specifications
parse "subject:compilers"
#-> Field.new("subject", "compilers")

# boolean operations
parse "subject:compilers or author:Aho"
#-> Expression.new(:or,
#      Field.new("subject", "compilers"),
#      Field.new("author", "Aho"))

# boolean operations within field specifications
parse "subject:(compilers OR parsers)"
#-> Field.new("subject",
#      Expression.new(:or, "compilers", "parsers")
{% endhighlight %}

Recursive descent parsers are so elegant! There is just something about how naturally they mimic the grammar...and how clearly the recursion describes the relationship between the different elements of the syntax... It's not ideal for every grammar, but for simple cases like this, I really, really dig it.

If parsers have been intimidating to you in the past, hopefully this has shown you how straightforward they can be. In fact, they can be quite fun!

Here's a gist of my complete implementation, even with a few specs (intended more as examples than actual tests). Enjoy!

<script src="https://gist.github.com/jamis/a34659d072e96bc9d940.js"></script>
