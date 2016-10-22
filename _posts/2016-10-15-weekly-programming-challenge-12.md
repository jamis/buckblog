---
date: 2016-10-15
layout: post
title: "Weekly Programming Challenge #12"
categories:
- projects
author: Jamis
comments: true
summary: >
  Family Trees and Pedigree Charts
---

I've been a genealogy nut for years--perhaps back as far as nearly 20 years, when I discovered that I was descended from many of royal houses of medieval Europe. (Of course, at the time, I took that information at face value...I now know better, but it was still fun to contemplate!)

One of my favorite programming projects was taking a lineage-linked list of my ancestors and building an enormous pedigree chart, going back dozens of generations. I had to get creative in printing it out (chopping it up, printing it piecemeal on standard printer sheets, and then pasting it all back together), but the result was impressive.

This week, let's give pedigree charts a go!

First, though, a recap of week #11...

## Week #11 Recap

For the [11th weekly programming challenge](http://weblog.jamisbuck.org/2016/10/8/weekly-programming-challenge-11.html), we explored the midpoint circle algorithm and drew some circles.

1. **Jeff Erlandsson** implemented normal mode, as well as line styles and partial arcs, earning **three points**! There's even an interactive Javascript demo you can play with, here: [https://jsfiddle.net/ogbqtvzb/](https://jsfiddle.net/ogbqtvzb/). Check out the code itself here: [https://github.com/erljef/weekly-challenges/tree/master/week-11](https://github.com/erljef/weekly-challenges/tree/master/week-11).
2. **Martin Moberg** got normal mode working, as well as line styles, for **two points**! You can see his implementation here: [https://github.com/indifferen7/casual-drawing](https://github.com/indifferen7/casual-drawing).
3. **Lasse Ebert** implemented normal mode this week, earning **one point**. His code is here: [https://github.com/lasseebert/jamis_challenge/tree/master/011_circle](https://github.com/lasseebert/jamis_challenge/tree/master/011_circle).
4. **Jérôme De Cuyper** also nailed normal mode and earned **one point**. You can play with his solution here: [http://jdecuyper.github.io/jamis-buck/Midpoint-Circle-Algorithm.html](http://jdecuyper.github.io/jamis-buck/Midpoint-Circle-Algorithm.html), and the code itself is here: [https://github.com/jdecuyper/jamisbuck-11](https://github.com/jdecuyper/jamisbuck-11).
5. **Marcus Edvinsson** did normal mode, too, with a nice interactive interface. His Elm implementation can be seen here: [https://github.com/MarEdv/wpc-week11](https://github.com/MarEdv/wpc-week11).

My solution this week was minimal, as we're moving houses and things are *crazy*. I went with a dead simple Ruby implementation, drawing the image via [ChunkyPNG](http://chunkypng.com/). That's one point for me! You can see what I've got here: [https://github.com/jamis/weekly-challenges/tree/master/011-draw-circles](https://github.com/jamis/weekly-challenges/tree/master/011-draw-circles).

Awesome work, everyone!


## Weekly Challenge #12

There are a lot of different ways to draw a pedigree chart. Just [Google it](https://www.google.com/search?q=pedigree+chart&tbm=isch), to see what I mean.

To give this challenge some structure, though, we're going to focus on a traditional pedigree style, where the tree moves left to right, like this:

<img src="/images/20161015-pedigree-chart.png" width="500" height="386" class="center" />

## Normal Mode

For normal mode, we'll generate at least a four-generation pedigree chart. (The preceding image is five generations--feel free to go that route if you wish, but it isn't necessary for normal mode). You may hard-code the data itself, using either your own pedigree, or inventing one. (The tree for the [British Royal Family](http://www.britroyals.com/royaltree.htm) is always fun, too.)

For one point, then:

1. Construct and render at least four generations of a pedigree of your choice, in the style given above.
2. You do *not* need to include any information other than names. No dates, no places--let's keep normal mode simple!
3. The tree need not be produced as an image--you can render it however you like, so long as it is recognizable as a pedigree chart. HTML elements, SVG, PDF--whatever works.

That's it!


## Hard Mode

For hard mode, you should be ready to stretch yourself a bit. Each of these will add one point to your score.

1. **Metadata**. For at least the first three generations, display corresponding birth and death information (dates and places). This is traditionally displayed below the line containing the person's name, but you may do whatever you like, so long as the information is legible.
2. **Additional generations**. Present (legibly!) up to 7 generations in a single chart.
3. **Efficient display of aribitrarily many generations**. Not every line in a tree is known, and some actually intersect with others. (Intentionally or not, sometimes our ancestors intermarried!) You can make most trees more managable by removing unknowns (blank entries), and by collapsing duplicate trees.
4. **Accept GEDCOM files**. [GEDCOM](https://en.wikipedia.org/wiki/GEDCOM) (Genealogical Data Communication) files are a standard way for encoding genealogical data. Make your program able to parse these files, and build a pedigree chart for a given individual. (Check out [Famous Family Trees](http://famousfamilytrees.blogspot.ca/) for some sample GEDCOM files to play with.)
5. **Other chart formats**. In addition to the traditional pedigree format required by normal mode, see if you can generate additional chart formats, like [sun charts](http://blog.myheritage.com/2016/06/new-innovation-sun-charts/), or [fan charts](https://www.familytreetemplates.net/category/fan), or [bowtie charts](https://www.familytreetemplates.net/category/bowtie), or [hourglass trees](https://www.familytreetemplates.net/category/hourglass). Earn **one point** for each additional chart format.

Feel free to shoot for "surprise me" mode, too! It doesn't have to be any harder than normal mode, but it ought to implement the challenge (either normal mode or hard mode) in some surprising, clever, or otherwise delightful way. See what you can come up with!

This challenge will run until Saturday, October 22th, at 12:00pm MDT (18:00 UTC).

* * *

The deadline for this challenge has passed, but feel free to try your hand at it anyway! Go ahead and submit a link to your solution in the comments, anytime. If you’re following along, the next week's challenge is "[Poisson Disk Sampling with Bridson's Algorithm](http://weblog.jamisbuck.org/2016/10/22/weekly-programming-challenge-13.html)". See you there!
