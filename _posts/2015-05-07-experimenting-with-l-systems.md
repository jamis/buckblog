---
layout: post
title: Experimenting with L-Systems
categories:
- Projects
author: Jamis
summary: >
  An overview of L-system fractals, with a simple implementation in
  Ruby. An argument is given in favor of exploration, experimentation,
  and play.
---

With my book out of the way, I've found myself with a bit more time to experiment, explore, and _play_. It's been a long time! I feel like I've almost forgotten how.

I've tinkered with some algorithms I'd never played with before, like Bridson's algorithm for [Poisson-disc sampling](https://www.jasondavies.com/poisson-disc/), and the [Bowyer-Watson algorithm](http://en.wikipedia.org/wiki/Bowyer%E2%80%93Watson_algorithm) for [Delaunay triangulation](http://en.wikipedia.org/wiki/Delaunay_triangulation). Those were fun---definitely challenging my limits and teaching me things I'd never considered before.

But while those were intriguing, they weren't necessarily _fun_. It's hard to take those algorithms and play "what-if" games with them. There's only so much you can do with a Delaunay triangulation, for instance, before it's just another mesh grid.

So while researching and writing an article for the May issue of [PragPub Magazine](http://theprosegarden.com/), I stumbled across this thing called a [Lindenmeyer system](http://en.wikipedia.org/wiki/L-system) (or "L-system" for short). I'd played with L-systems before, years ago, back when fractals were ubiquitous and the cool thing to do was to zoom Mandelbrots to the limits of your CPU. I'd never tried to implement these L-systems before, though.

It was time.

So I rolled up my sleeves and went to work, and you know what? This stuff is almost as fun as mazes!

I won't go into the whole background of L-systems (though it's worth reading about---who knew a study of algae could lead to a grammar for recursively generating fractals?). The gist of it is this: you start with some initial string, and then repeatedly apply transformations to it until the string is some desired length. Then you interpret the string as a series of commands (turtle-style) that draw the final pattern.

Here's a concrete example. Let's say you start with the string `FX`. To transform this string, we'll replace each instance of `X` with `X+YF+`, and (because we've introduced a `Y` there) we'll replace `Y` with `-FX-Y`. The other symbols (`F`, `+`, and `-`) we'll leave untouched.

So, after a few iterations, our string grows like this. (Parentheses are used to indicate expansions, and aren't actually part of the grammar, here.)

1. `FX`
2. `F(X+YF+)`
3. `F(X+YF+)+(-FX-Y)F+`
4. `F(X+YF+)+(-FX-Y)F++-F(X+YF+)-(-FX-Y)F+`

And so forth. (You can see that the string grows long quite rapidly!)

But so what? Well, look: treat those symbols in the string as turtle graphic commands, right? Let `F` mean "move forward", `+` mean "turn right 90 degrees", and `-' mean "turn left 90 degrees" (and ignore all the other symbols). Those strings become descriptions of curves! In this case, if you let the string get long enough, it becomes a fractal known as the [Dragon curve](http://en.wikipedia.org/wiki/Dragon_curve). The following was created by applying the transformation 14 times in succession:

<img src="/images/20150507-dragoncurve.png" width="687" height="457" class="center" />

Well, this totally tickles my inner geek. (And I'll be the first to admit, my inner geek is not buried very deeply at all.) I mean, heck, not only does this have the word _fractal_ in it, it also has _grammar_, _curve_, and _transformation_, and suggests things like _parser_ and _interpreter_. I gotta say---I kind of love those things.

And look at all the ways you can _experiment_ with this! I mean, you can start just by fiddling with the transformation rules, right? What if you switch a `-` for a `+`, or go whole-hog and replace an entire substitution rule? You can get all kinds of interesting effects. But you can go even further! Who's to say that a turn needs to be 90 degrees? Or that left and right turns need to be symmetrical? What if you add _more operations_, like push and pop to save and restore the turtle's position?

Well, you wind up with beautiful fractals like this one:

<img src="/images/20150507-seaweed.png" width="417" height="673" class="center" />

This is a seaweed pattern I grabbed off the Internet, which uses an initial starting string of `F`, and a substitution rule that changes every `F` into `FF-[-F+F+F]+[+F-F-F]`. (Those square brackets represent "push" and "pop" operations.)

But you know what _really_ makes me giggle? This whole thing is ridiculously easy to implement. The computer scientist in me had to try and abstract things all out, but here's a bare bones implementation that illustrates the basic idea.

{% highlight ruby %}
require 'chunky_png'

WHITE = ChunkyPNG::Color::WHITE
BLACK = ChunkyPNG::Color::BLACK

# Expand the given string, using the given rules. Any
# character in the string that does not match a rule
# is preserved, verbatim.
def expand(string, rules)
  string.
    each_char.
    map { |char| rules[char] || char }.
    join
end

# [face_x, face_y] describe a vector. Turn that vector
# through some angle theta, and return the resulting
# vector.
def turn(theta, face_x, face_y)
  [ face_x * Math.cos(theta) - face_y * Math.sin(theta),
    face_y * Math.cos(theta) + face_x * Math.sin(theta) ]
end

# Draw the given L-system:
# * canvas is a ChunkyPNG::Image instance
# * x and y are the position to being drawing from
# * string is the starting state of the L-system
# * order is how many times the string should be
#   transformed
# * rules is a hash of substitutions, where each key
#   expands to its corresponding value.
# * step is the distance a single move spans
# * angle is the magnitude (in degrees) of a turn
def draw(canvas, x, y, string, order, rules, step, angle)
  order.times { string = expand(string, rules) }

  stack = []
  face_x, face_y = 0, -1
  radians = angle * Math::PI / 180.0

  string.each_char do |char|
    case char
      when "F"
        new_x = x + face_x * step
        new_y = y + face_y * step

        canvas.line(x.round, y.round,
          new_x.round, new_y.round,
          BLACK)

        x, y = new_x, new_y

      when "+"
        face_x, face_y = turn(radians, face_x, face_y)

      when "-"
        face_x, face_y = turn(-radians, face_x, face_y)

      when "["
        stack.push [x, y, face_x, face_y]

      when "]"
        x, y, face_x, face_y = stack.pop
    end
  end
end

# Dragon curve
start = "FX"
rules = { "X" => "X+YF+", "Y" => "-FX-Y" }

canvas = ChunkyPNG::Image.new(600, 450, WHITE)
draw(canvas, 460, 150, start, 14, rules, 3, 90)

canvas.save("fractal.png")
{% endhighlight %}

I'll be playing with this stuff for a while, I'm sure, discovering and rediscovering things that others probably stumbled across years and years ago, and enjoying every minute of it. The entire premise of "what if I change this one small thing" is just so compelling!

If you're interested in tinkering, too, I'd encourage you to try your hand at implementing an L-system processor. Or, if you're impatient to just jump in and start playing with fractals, you can grab what I've done so far, a simple library I'm calling "Lindy", at [https://github.com/jamis/lindy](https://github.com/jamis/lindy).

Happy exploring!
