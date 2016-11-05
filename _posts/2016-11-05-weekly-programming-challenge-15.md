---
date: 2016-11-05
layout: post
title: "Weekly Programming Challenge #15"
categories:
- projects
author: Jamis
comments: true
summary: >
  Turtle Graphics
---

In considering week #14, I realized I should have split it up. It really ought to have built on the foundation of a [turtle graphics](https://en.wikipedia.org/wiki/Turtle_graphics) system, which would have then been used to draw the L-system fractals. Well, live and learn!

This week, we'll rectify that oversight. We'll implement a basic turtle graphics system, which is great fun all on its own! But first, a recap of week #14...

## Week #14 Recap

For the [14th weekly programming challenge](http://weblog.jamisbuck.org/2016/10/29/weekly-programming-challenge-14.html), we tackled L-system fractals. As I said, though, it was probably a bit too large of a challenge. Two people tackled it, and only one completed normal mode. (I tackled it, too, but wasn't able to fit the full project into my schedule, either.)

The normal mode winner this week is **Régis Kuckaertz**, who provided a Javascript implementation. You can see his work here: [https://github.com/regiskuckaertz/wc-14](https://github.com/regiskuckaertz/wc-14). Great job, Régis!

**Lasse Ebert** and I also tackled it, but neither of us quite managed to cross the finish line. Lasse's code (Elixr) is here: [https://github.com/lasseebert/jamis_challenge/tree/master/014_fract](https://github.com/lasseebert/jamis_challenge/tree/master/014_fract), and mine (Clojure) is here: [https://github.com/jamis/weekly-challenges/tree/master/014-lindenmayer-systems](https://github.com/jamis/weekly-challenges/tree/master/014-lindenmayer-systems).

Let's see what week #15 brings!


## Weekly Challenge #15

Most of you are probably already familiar with [turtle graphics](https://en.wikipedia.org/wiki/Turtle_graphics), but here's a speedy introduction if you're not. The basic idea is that there is a cursor (the "turtle") that follows instructions you give it. Instructions are things like:

* Turn left or right some number of degrees.
* Lift up or set down the "pen".
* Change the color or size of the line drawn by the pen.
* Move forward some distance.

The turtle then interprets those instructions and produces the corresponding image. Easy, yeah?


## Normal Mode

For normal mode (and one point), create a turtle graphics system that supports the following instructions:

1. `turn(degrees)` -- rotates the turtle, changing it's heading.
2. `pen(upOrDown)` -- lifts the pen up or sets it down, depending on the (boolean) argument.
3. `move(distance)` -- moves the turtle the given distance along its current heading. This only draws something to the canvas if the pen is currently down.

Assume the turtle starts in the center of the canvas, with a heading of 0 degrees corresponding to "up" (towards the top of the canvas). Produce an image drawn by your turtle.

That's it!


## Hard Mode

For hard mode, you get to add some additional operations to your turtle. Each of the following items will earn you an additional point:

1. `setColor(color)` -- sets the color that should be used to draw subsequent lines.
2. `setStyle(style)` -- sets the line style to be used for drawing. You should support at least solid lines, dashed lines, and dotted lines.
3. `setWidth(width)` -- sets the width of the line to be used for drawing.
4. `push()` and `pop()` -- these save the turtle's state (position, orientation, pen status, etc.), allowing you to return the turtle to an earlier position.
5. `definePrimitive(name, ...)` and `drawPrimitive(name)` -- `definePrimitive` allows you to describe and name a series of commands, and then execute those commands at a later date via `drawPrimitive`.
6. `setScale(scale)` -- scales all distances and sizes by the given amount, defaulting to 1.0. (This is especially useful with a `drawPrimitive` API, because you can define the primitive against some unit size, and then change the draw scale before drawing the primitive.)

Aside from new operations, you can earn additional points by adding any of the following features:

7. Read and execute instructions for the turtle from a separate file, to be fed to your program at run time.
8. Make your turtle interactive in some way, drawing in response to commands given in real time.
9. A 3D turtle! By adding a second heading, indicating the angle of the plane in which the turtle is moving, relative to the XZ plane, you can draw in three dimensions.

Feel free to shoot for "surprise me" mode, too! It doesn't have to be any harder than normal mode, but it ought to implement the challenge (either normal mode or hard mode) in some surprising, clever, or otherwise delightful way. See what you can come up with!

This challenge will run until Saturday, November 12th, at 12:00pm MST (19:00 UTC).

* * *

Post a link to your submission in the comments, but please: only link to your solution. Do not post source code in the comments. Comments that post source code directly will be removed. If you have any questions about this challenge, post them in the comments as well and I’ll try to clarify.

If you'd prefer not to post your solution as a comment, please feel free to email your solution to me directly, at jamis@jamisbuck.org.
