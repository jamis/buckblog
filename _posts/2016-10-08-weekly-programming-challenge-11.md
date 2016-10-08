---
date: 2016-10-08
layout: post
title: "Weekly Programming Challenge #11"
categories:
- projects
author: Jamis
comments: true
summary: >
  Drawing Circles
---

Back in [week #4](https://medium.com/@jamis/weekly-programming-challenge-4-7fe42f28d5d4) ("Drawing Lines"), we applied ourselves to implementing the Bresenham line algorithm. One of the "hard mode" options was to implement the midpoint circle algorithm, which is kind of "Bresenham for circles". Sadly, no one gave it a try in week #4.

It's time to revisit it, and give it a week all for itself. Let's draw some circles!

First, though, let's recap week #10.

## Week #10 Recap

For the [10th weekly programming challenge](http://weblog.jamisbuck.org/2016/10/1/weekly-programming-challenge-10.html), we did some network programming. Three brave souls made the attempt:

1. **Lasse Ebert** gave it a go in Elixir, and got even got some of hard mode implemented (an HTTP client with GET support). **Two points** to Lasse! Check it out here: [https://github.com/lasseebert/jamis_challenge/tree/master/010_sock](https://github.com/lasseebert/jamis_challenge/tree/master/010_sock).
2. **Anders Engström**'s Clojure implementation satisfies normal mode, and makes a stab at hard mode in the form of having the normal mode server forward requests (via HTTP POST) to [Phteven.io](http://phteven.io), and return the response to the originating client. **Two points** to Anders! And possibly "surprise me", too...that was unexpected (but inevitable, perhaps?) that your normal mode server would act as an HTTP client! Explore his solution here: [https://github.com/metamorph/weekly-ten](https://github.com/metamorph/weekly-ten).
3. **Jérôme De Cuyper** implemented normal mode in C#, here: [https://github.com/jdecuyper/jamisbuck-10](https://github.com/jdecuyper/jamisbuck-10). **One point** for Jérôme!

My solution this week was in Erlang, and while I had hoped to tackle an HTTP client and/or server, the week was surprisingly busy and I had to be satisfied with simply normal mode. **One point** for me! You can see my Erlang client and server here: [https://github.com/jamis/weekly-challenges/tree/master/010-network-programming](https://github.com/jamis/weekly-challenges/tree/master/010-network-programming)

Awesome work, everyone!


## Weekly Challenge #11

The [midpoint circle algorithm](https://en.wikipedia.org/wiki/Midpoint_circle_algorithm) is an efficient way to rasterize (draw) circles. Like the Bresenham line algorithm, it works by iteratively incrementing the x and/or y coordinates for each pixel, and accumulating an error value to determine when each coordinate should be incremented. Also, it takes advantage of the radial symmetry of a circle, and is able to draw an entire circle by computing only a single octant.

It's pretty slick. :) There are lots of published implementations, and the Wikipedia article (linked above) even includes some sample code in a few languages. Feel free to use whatever resources you need to figure this algorithm out!


## Normal Mode

For normal mode, you must write a program that meets the following criteria:

1. Given an origin and a radius, draw the corresponding circle with the midpoint circle algorithm.
2. Produce an image of that circle in the format of your choice. (Maybe you might reuse the image code you wrote in week #4!)

That's it! Meeting the above criteria will give you one point.


## Hard Mode

Hard mode, now... Let's get our game on. For each of the following you can earn another point.

1. **Line Styles.** Allow the line to be dashed or dotted, or some combination.
2. **Partial arcs.** Your API should accept an origin, a start point, and an end point. (Alternatively, your API may accept a radius, a start angle and an end angle.) The corresponding arc should be drawn the image.
3. **Ellipses.** You may need to dig a bit (or experiment a bit) to adapt the midpoint circle algorithm for ellipses, but supposedly it can be done! If you've got time for some research, this could be a fun one to tackle.

Feel free to shoot for "surprise me" mode, too! It doesn't have to be any harder than normal mode, but it ought to implement the challenge (either normal mode or hard mode) in some surprising, clever, or otherwise delightful way. See what you can come up with!

This challenge will run until Saturday, October 15th, at 12:00pm MDT (18:00 UTC).

* * *

Post a link to your submission in the comments, but please: only link to your solution. Do not post source code in the comments. Comments that post source code directly will be removed. If you have any questions about this challenge, post them in the comments as well and I’ll try to clarify.

If Disqus (the comment system) gives you any grief, please feel free to email your solution to me directly, at jamis@jamisbuck.org.

