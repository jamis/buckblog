---
date: 2016-10-22
layout: post
title: "Weekly Programming Challenge #13"
categories:
- projects
author: Jamis
comments: true
summary: >
  Poisson Disk Sampling with Bridson's Algorithm
---

Once upon a time, I wrote a fantasy trading simulator. You played a humble merchant, buying goods in one town and selling them in another. The goal was to make a profit, eventually upgrading your donkey to a caravan of wagons, with guards and magic wards to protect from brigands and dragons.

It was a fun project, but one of the weakest parts of it was generating the network of towns. I made it work, but imperfectly. It wasn't until years later that I learned a technique--called [Poisson disk sampling](https://en.wikipedia.org/wiki/Supersampling#Poisson_disc)--that does the job much more neatly. It generates a spread of points, none of which are within some specified distance of each other, and with a pleasingly even distribution.

This week, we're going to play with _Bridson's algorithm_ for Poisson disk sampling. But first, let's recap week #12.


## Week #12 Recap

For the [12th weekly programming challenge](http://weblog.jamisbuck.org/2016/10/15/weekly-programming-challenge-12.html), we fiddled with family trees and pedigree charts. Sadly, it must have been a busy week (or a boring topic!), as no one submitted a solution.

My own answer this week was again minimal. (Moving house, it turns out, is not a trivial thing, nor is it quickly over. I have hope that the end is in sight, though!) Once again, I went with a minimal Ruby implementation. I drew the pedgree as a PDF via [Prawn](http://prawnpdf.org/), and supported pedigree charts of aribtrary size. (Though the charts are only legible at 7 or fewer generations, unless you increase the page size.) That's two points for me! You can see what I've got here: [https://github.com/jamis/weekly-challenges/tree/master/012-family-trees](https://github.com/jamis/weekly-challenges/tree/master/012-family-trees).


## Weekly Challenge #13

Before you read any further, you really must check out Mike Bostock's hypnotizing demonstrations of Bridson's algorithm for Poisson disk sampling. The [first one](https://bl.ocks.org/mbostock/19168c663618b7f07158) shows the points growing outward from the starting point, and the [second one](https://bl.ocks.org/mbostock/dbb02448b0f93e4c82c3) gives a more detailed explanation of how the algorithm works.

The algorithm itself is detailed in [this PDF](http://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf)--a remarkably brief paper by Robert Bridson. It's actually quite straight forward to read and understand.

The general idea, though is this:

1. Place a point anywhere in the space you're wanting to sample. Add it to the list of _active samples_.
2. Choose a point at random from the list of active samples.
3. Generate up to some number (_k_) potential samples between _r_ and _2r_ distance from the current sample. Discard any that are closer than _r_ to any other sample.
4. If none of the potential samples are viable, remove the current sample from the active samples.
5. Otherwise, add one of the potential samples to the active samples.
6. If there are no more active samples, the algorithm terminates. Otherwise, repeat from #2.

Easy, right?

## Normal Mode

For normal mode (and one point), here's all you've got to do:

1. Generate an image of at least 256x256 pixels.
2. Sample the image using Bridson's algorithm for Poisson disk sampling, drawing a red dot at each sample's position.
3. The values _k_ (the number of potential samples at each point) and _r_ (the minimum distance separating each sample) ought to be configurable.

That's it!


## Hard Mode

For hard mode, you should be ready to stretch yourself a bit. Each of these will add one point to your score.

1. **Resample an existing image**. As described by Robert Bridson, each sample is mapped to a grid location (where each cell in the grid is _r/√2_ units on a side). If you treat each cell as a pixel in a second image, you can resample an image this way--converting an image of _r_ pixels on a side to _r/√2_ pixels on a side. Give it a try! Accept an image file as input. Run Bridson's algorithm, generating a new image where each pixel in the new image consists of the color corresponding to the sample position from the original image.
2. **Generate a spanning tree**. A [spanning tree](https://en.wikipedia.org/wiki/Spanning_tree) is just a tree that spans all nodes of it's corresponding graph. If the points we generate using Bridson's algorithm are taken to be the graph, then the goal is to generate a tree from them. And how do we do this, pray tell? Well, since a spanning tree just happens to be exactly what a _maze_ is, then we can generate a spanning tree from a series of points by randomly generating a maze from it. (You can [take your pick of maze algorithms](http://weblog.jamisbuck.org/2011/2/7/maze-generation-algorithm-recap).) The hardest part here will probably be determining the nearest neighbors of each point. What you're looking for is their [Delaunay triangulation](https://en.wikipedia.org/wiki/Delaunay_triangulation)...
3. **Animate it!** Create an animation demonstrating the progress of the algorithm. This doesn't have to be as complex as Mike Bostock's "Poisson Disc II" animation--shoot instead for something like [the first one](https://bl.ocks.org/mbostock/19168c663618b7f07158).
4. **Make a Voronoi Diagram**. Draw a polygon around each point, so that the polygons all fit together like pieces of a puzzle! There are various algorithms for generating Voronoi diagrams--I'll just point you to the [Wikipedia article](https://en.wikipedia.org/wiki/Voronoi_diagram) and let you go your own direction on this one.

Feel free to shoot for "surprise me" mode, too! It doesn't have to be any harder than normal mode, but it ought to implement the challenge (either normal mode or hard mode) in some surprising, clever, or otherwise delightful way. See what you can come up with!

This challenge will run until Saturday, October 29th, at 12:00pm MDT (18:00 UTC).

* * *

Post a link to your submission in the comments, but please: only link to your solution. Do not post source code in the comments. Comments that post source code directly will be removed. If you have any questions about this challenge, post them in the comments as well and I’ll try to clarify.

If you'd prefer not to post your solution as a comment, please feel free to email your solution to me directly, at jamis@jamisbuck.org.
