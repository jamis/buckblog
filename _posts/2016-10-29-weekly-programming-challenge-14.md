---
date: 2016-10-29
layout: post
title: "Weekly Programming Challenge #14"
categories:
- projects
author: Jamis
comments: true
summary: >
  Lindenmayer Systems
---

Fractals have been a long-standing interest of mine. I can remember playing with [Fractint](https://fractint.org/) for long hours at a time, zooming deeper and deeper into the [Mandelbrot set](https://en.wikipedia.org/wiki/Mandelbrot_set). Fractint was also what introduced me to [Lindenmayer systems](https://en.wikipedia.org/wiki/L-system) (or L-systems), a method of constructing fractals by recursively rewriting a statement according to some grammar, to form more and more complex statements.

This week, let's play with these L-systems a bit! But first, a recap of week #13...


## Week #13 Recap

For the [13th weekly programming challenge](http://weblog.jamisbuck.org/2016/10/22/weekly-programming-challenge-13.html), we dabbled with Poisson disc samples, constructing a sampling using Bridson's algorithm. I had a _lot_ of fun with this one!

Only one submission this week, but I know a few others worked on it, at least. Great work, **Lasse Ebert**, on his normal mode submission! He implemented Bridson's algorithm in Elixr, and generated the output using his image library from week #4. Check out his implementation here: [https://github.com/lasseebert/jamis_challenge/tree/master/013_bridson](https://github.com/lasseebert/jamis_challenge/tree/master/013_bridson).

I went...a bit overboard on mine this week. Making up for previous weeks, maybe? I implemented Bridson's algorithm, and then implemented the Bowyer-Watson algorithm](https://en.wikipedia.org/wiki/Bowyer%E2%80%93Watson_algorithm) to generate a [Delaunay triangulation](https://en.wikipedia.org/wiki/Delaunay_triangulation) from those points. Then, with that triangulation, I converted it to it's dual graph: a [Voronoi diagram](https://en.wikipedia.org/wiki/Voronoi_diagram). My favorite part was taking the Mona Lisa and creating a "stained glass" effect, by sampling it and converting the samples to Voronoi polygons, like so:

<img src="/images/20161022-mona-lisa.png" width="256" height="382" class="center" />

Like I said, a bit overboard. But it was fun!


## Weekly Challenge #14

So, L-systems! The basic idea behind L-systems it that you start with some statement, and then using some given set of rules, you repeatedly rewrite that statement by substituting phrases for symbols in the statement.

Here's an example.

Let's say we start with this statement: `FX`.

Let's say, further, that we have two rules: `X` gets replaced with `X+YF+`, and `Y` gets replaced with `-FX-Y`.

So, given `FX`, the first time we rewrite, the `X` gets replaced, and we're left with `FX+YF+`.

Easy enough.

The second time, we replace both the `X`, and the `Y`, resulting in `FX+YF++-FX-YF+`.

The third time, we replace all of the `X`'s and all of the `Y`'s, giving us `FX+YF++-FX-YF++-FX+YF+--FX-YF+`.

And so forth. That's it, really. That's an L-system.

So what's the big deal? Well, it gets interesting when you assign meaning to the different symbols. For instance, suppose we hook this up to some simple turtle graphics system. Let's let `F` mean "move forward 1 unit", let `+` mean "turn right 90 degrees", and let `-` mean "turn left 90 degrees". If we repeat the above substitution 17 times, and then draw the result, we wind up with this:

<img src="/images/20161022-dragon.png" width="613" height="511" class="center" />

It's the [Dragon curve](https://en.wikipedia.org/wiki/Dragon_curve)!

For more examples, and a deeper explanation of how the grammars can work, check out [Wikipedia](https://en.wikipedia.org/wiki/L-system).

## Normal Mode

For normal mode (and one point), here's all you've got to do:

1. Given a starting statement and a set of rules, recursively perform the substitutions required by the rules. You must be able to specify how many times the substitutions will be performed.
2. Draw the resulting statement! The only commands you need to support are "F" (move forward), "+" (turn right), and "-" (turn left). You should be able to specify how much a "+" and "-" will turn the turtle.
3. Produce an image with the finished drawing.

That's it! You're going to have to tackle some math to make this work, and figuring out how large your canvas needs to be may be a bit of a puzzle, but it can be done! Try the dragon curve (above) as a test.


## Hard Mode

For hard mode, you should be ready to stretch yourself a bit. Each of these will add one point to your score.

1. Support push and pop operations. Let "[" mean "push" (saving the current state of the turtle, such as it's current heading and position), and let "]" mean "pop" (restoring the turtle's state from the previous "push" operation. Try a [fractal plant](https://en.wikipedia.org/wiki/L-system#Example_7:_Fractal_plant) pattern to test your implementation!
2. Add new operations that change the color of the turtle. Can you modify the dragon curve so that portions of it are drawn in a different color?
3. Produce a grammar where the symbols have _audible_ meaning, instead of visual! You decide what that means. Maybe some symbols change the duration of the tone, and others change the pitch. Fractal music!
4. Produce a grammar where the symbols produce changes in color over time. Make an animation, perhaps of a simple shape, that changes color according to the L-system grammar!

Feel free to shoot for "surprise me" mode, too! It doesn't have to be any harder than normal mode, but it ought to implement the challenge (either normal mode or hard mode) in some surprising, clever, or otherwise delightful way. See what you can come up with!

This challenge will run until Saturday, November 5th, at 12:00pm MDT (18:00 UTC).

* * *

The deadline for this challenge has passed, but feel free to try your hand at it anyway! Go ahead and submit a link to your solution in the comments, anytime. If you’re following along, the next week's challenge is "[Turtle Graphics](http://weblog.jamisbuck.org/2016/11/05/weekly-programming-challenge-15.html)". See you there!
