---
layout: post
title: Mazes with Blockwise Geometry
categories:
- Essays and Rants
author: Jamis
comments: true
summary: >
  The author describes some techniques for rendering and generating mazes
  out of blocks.
---

Once you start [playing with mazes](https://pragprog.com/book/jbmaze/mazes-for-programmers), you soon discover that there are a _lot_ of different ways to draw them. The easiest way is what I call a _linewise_ rendering, and it looks something like this:

<img src="/images/20151031-linewise.png" width="154" height="152" class="center" />

The path to follow is the line itself, and whitespace becomes the walls. Straightforward to implement, but honestly, it's not the most friendly of representations. For one thing, because the paths have no thickness, it becomes difficult to represent the _contents_ of the maze: doors, stairs, obstacles, etc.

To add thickness to the paths, you can render what I call _linewise walls_. The following illustrates the same maze as before, but with linewise walls:

<img src="/images/20151031-linewise-walls.png" width="167" height="163" class="center" />

This flips it around, making the lines _the walls_, and the whitespace the actual passages of the maze. Now it's easier to draw on the cells themselves. (This happens to be the technique I use in [my book](https://pragprog.com/book/jbmaze/mazes-for-programmers), since it is my go-to representation for mazes. It's really a flexible way to do it.)

However, every once in a while I get asked how to render a maze where the walls have actual thickness. (This is often in the context of someone wanting to build a maze in a game like Minecraft.) I call this kind of representation a _blockwise_ rendering, because the simplest way to do it is to draw everything as blocks. Again, the same maze as before, this time drawn with blockwise geometry:

<img src="/images/20151031-blockwise.png" width="163" height="162" class="center" />

It's not hard at all to draw a maze in this style. For every cell in your grid, you just divide it into quarters, like this:

<img src="/images/20151031-cell-division.png" width="288" height="108" class="center" />

The northwest subcell (A) will always be a passage, and the southeast subcell (D) will always be a wall. Then, depending on whether the cell has a connection to the south and east cells, the southwest (C) and northeast (B) subcells will either be walls or passages, as follows:

1. If the original cell is linked to its southern neighbor, make the southwest subcell (C) a passage; otherwise, make it a wall.
2. If the original cell is linked to its eastern neighbor, make the northeast subcell (B) a passage; otherwise, make it a wall.

Then, because we're only considering south and east passages, we need to treat the north and west boundaries of the maze specially, by rendering them explicitly as a wall. The result of all this is that if you start with a grid that is _n_ cells on a side, the blockwise rendering will be 2<i>n</i>+1 blocks on a side: 2<i>n</i> because you double each cell, and +1 because of the extra wall on the north and west boundaries.

## But is it still the same maze?

Note that the maze remains exactly the same, topologically. Blockwise or linewise, it doesn't matter how you render it. Consider the following demonstration. All three mazes below are exactly the same, but the one on the left is rendered linewise, the one in the middle has linewise walls, and the one on the right is rendered blockwise:

<script type="text/javascript" src="/javascripts/mazes-20151031.js"></script>
<script type="text/javascript" src="/javascripts/demo-20151031.js"></script>
<img src="/images/try-me-tab.png" width="36" height="72" class="try-me" id="c20151031.1.try" />
<canvas width="500" height="160" id="c20151031.1"></canvas>
<script type="text/javascript">
  setupInteraction("c20151031.1", "drawMazes");
</script>

(Click or tap any of the renderings to generate another maze.)

## Can I generate a blockwise maze directly?

[My book](https://pragprog.com/book/jbmaze/mazes-for-programmers) describes representing a maze as, essentially, a graph--with cells for nodes and passages for edges. This maps directly to linewise renderings, and easily converts to linewise walls. You've seen, now, how to convert those to blockwise renderings, but what if you only care about the blockwise representation? Perhaps you want the walls themselves to have attributes (color, texture, hardness, etc.), or maybe you want players to be able to tunnel through walls, in which case they need to be entities in their own right.

Is it possible to skip the intermediate graph representation, and just build the maze directly in a blockwise format?

Absolutely!

You have two options. I call these _strict_ blockwise, and _relaxed_ blockwise.

### Strict Blockwise Mazes

A _strict_ blockwise representation can be converted back into linewise and linewise-wall renderings by throwing away the north and west walls, and then laying converting each 2x2 group of blocks back into lines, based on how they connect to neighboring 2x2 groups.

To generate a strict blockwise maze, the grid must have an odd number of rows and columns, and you're going to treat only blocks at odd-numbered rows and columns as actual cells, like this:

<img src="/images/20151031-odd-cells.png" width="144" height="144" class="center" />

The remaining cells are _intermediate locations_, which are used only to represent passages between cells. The process of generating a maze progresses using [your algorithm of choice](weblog.jamisbuck.org/2011/2/7/maze-generation-algorithm-recap), with passages being carved through those intermediate locations.

<img src="/images/20151031-carving.png" width="144" height="144" class="center" />

Just like that.

### Relaxed Blockwise Mazes

A _relaxed_ blockwise representation cannot usually be converted back into a linewise rendering. This is because it treats every block in the grid as a potential cell in the maze, which means you can no longer reliably overlay a larger grid on it and reduce those 2x2 clusters to single cells.

To generate a relaxed blockwise maze, start with a grid of any size you like, and the algorithm of your choice. Proceed as before, but now you are constrained in which neighbor cells you can choose: if a neighbor cell is horizontally or vertically adjacent to any other "open" (carved) cell (aside from the current cell), it may not be selected.

In the following illustration, the green cell may be carved from the west because it has no neighboring cells that are themselves already carved (aside from its neighbor to the west).

<img src="/images/20151031-carve-yes.png" width="144" height="108" class="center" />

But in the next illustration, the red cell may _not_ be carved from the west, because it _does_ have a neighboring cell that is already carved (its neighbor to the east).

<img src="/images/20151031-carve-no.png" width="144" height="108" class="center" />

Following these rules generates mazes like this:

<img src="/images/try-me-tab.png" width="36" height="72" class="try-me" id="c20151031.2.try" />
<canvas width="250" height="250" id="c20151031.2"></canvas>
<script type="text/javascript">
  setupInteraction("c20151031.2", "relaxedBlockwise");
</script>

(Tap the maze to generate another one.)

Note that you'll often wind up with "dead" cells--groups of wall that couldn't be carved because they violate that constraint about which cells can be selected. Sometimes that's an esthetic that you want; sometimes it isn't. It's something to keep in mind.

### Do the walls have to be the same size as the cells?

Definitely not! This post is getting much longer than I intended, though, so I'll leave this one as an exercise for the reader. Here's a hint, though: remember how we divided the cells into quarters? Think about what would happen if you divided them into _unequal_ quarters, like this:

<img src="/images/20151031-unequal-division.png" width="288" height="108" class="center" />

See what happens!

So, there you have it: mazes with blockwise geometry. You are now ready to create your own [Roguelike](https://en.wikipedia.org/wiki/Roguelike) dungeon. Go forth and carve some passages!
