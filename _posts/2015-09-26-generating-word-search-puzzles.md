---
layout: post
title: Generating Word Search Puzzles
categories:
- projects
author: Jamis
comments: true
summary: |
  A walk-through of the author's word search puzzle generator
---

My daughter (age 11) was writing an article this week for a [local student newsletter](http://cachevalleyhomeschoolers.com/cache-chronicle-newsletter/), and had the idea to include a [word search puzzle](https://en.wikipedia.org/wiki/Word_search). After spending ten minutes looking online and being fairly disappointed in the quality of what we found, I decided to take a stab at writing a word search puzzle generator myself.

I mean, how hard could it be?

Fortunately for me it wasn't too hard at all, though I'm sure my implementation is far from optimal. It generates puzzles that look like this:

<img src="/images/20150926-puzzle.png" width="542" height="432" class="center" />

(Bonus: the letters left after finding all the words spell out one of my favorite features of Ruby...)

The core of the algorithm (after deciding on the word list and the size of the puzzle grid) is just this:

1. Pick the next word in the list.
2. Add it to a random location in the grid.
3. If the word fails to fit anywhere on the grid, backtrack and try from step #2 with the previous word.
4. If there is no previous word, fail (because the words cannot all fit on the grid).
5. Once the word has been placed successfully, repeat from step #1.
6. Once all words have been placed, fill in the unused squares with random letters.

The first thing to do was to represent the grid itself. Visually, it's a two-dimensional grid of rows and columns:

{% highlight ruby %}
grid = WordSearch::Grid.new(rows, columns)
{% endhighlight %}

Since the algorithm requires that I be able to try a word against every possible location in the grid, I chose to implement the grid as a one-dimensional array. This way I can represent each location as a single integer, which is cleaner than trying to juggle `(row, column)` tuples.

{% highlight ruby %}
module WordSearch
  class Grid
    attr_reader :rows, :columns, :size

    def initialize(rows, columns, grid=nil)
      @rows, @columns = rows, columns
      @size = @rows * @columns
      @grid = grid || Array.new(@rows * @columns)
    end

    def index(row_or_pos, column=nil)
      if column
        row_or_pos * @columns + column
      else
        row_or_pos
      end
    end

    def at(position)
      row = position / @columns
      col = position % @columns
      [row, col]
    end

    def [](row_or_pos, column=nil)
      @grid[index(row_or_pos, column)]
    end
  
    # ...
  end
end
{% endhighlight %}

It also makes it really easy to duplicate the grid, so that the state of the grid can be saved and restored as the algorithm backtracks:

{% highlight ruby %}
def dup
  self.class.new(@rows, @columns, @grid.dup)
end
{% endhighlight %}

The algorithm itself begins by initializing a list of possible directions that each word might be drawn in (right-to-left, top-to-bottom, etc.), as well as building a list of all possible positions in the grid:

{% highlight ruby %}
directions = %i(right down)
directions += %i(rightdown) if @diagonal
directions += %i(left up) if @backward
directions += %i(leftup leftdown rightup) if @diagonal && @backward

positions = (0...grid.size).to_a
{% endhighlight %}

I could implement this algorithm via recursive function calls, but I opted to use a stack, instead. I initialize it like this (`words` is the list of vocabulary words that will be used to build the puzzle):

{% highlight ruby %}
stack = [ { grid: grid,
            word: words.shift,
            dirs: directions.shuffle,
            positions: positions.shuffle } ]
{% endhighlight %}

Each stack element remembers the current state of the grid, the word that is currently being placed on the grid, the list of possible directions that haven't yet been tried, and the list of possible positions that haven't yet been tried.

Once all of that's ready, the algorithm itself runs in a loop:

{% highlight ruby %}
while true
  current = stack.last
  raise "no solution possible" unless current

  # get the next direction to try
  dir = current[:dirs].pop
  if dir.nil?
    # if we've tried all possible directions at
    # this position, pop the current position off
    # and reset the list of directions.
    current[:positions].pop
    current[:dirs] = directions.shuffle
    dir = current[:dirs].pop
  end

  # get the position in the grid that we're
  # trying the word against.
  pos = current[:positions].last

  if pos.nil?
    # If there are no more available positions,
    # put the current word back in the vocab
    # list and backtrack by popping the stack.
    words.unshift(current[:word])
    stack.pop
  else
    # otherwise, try to place the word on the grid,
    # at the given position, in the given direction.
    grid = _try_word(current[:grid], current[:word], pos, dir)

    # if it succeeded, grid will be a copy with the
    # word placed on it.
    if grid
      # If there are any more words left in the vocab
      # list, push the next one onto the stack.
      if words.any?
        stack.push(grid: grid,
                   word: words.shift,
                   dirs: directions.shuffle,
                   positions: positions.shuffle)
      else
        # Otherwise, we've placed all the words
        # successfully, and we're done!
        break
      end
    end
  end
end
{% endhighlight %}

That `_try_word` method isn't too magical:

{% highlight ruby %}
def _try_word(grid, word, position, direction)
  copy = grid.dup
  row, column = copy.at(position)

  # DIRS is a hash that maps a direction name
  # (like "right") into a tuple (like [0, 1])
  # which tells which directions the position
  # should move at each step.
  dr, dc = DIRS[direction]

  # break the word into its component letters
  letters = word.chars

  while (row.between?(0, rows-1) && column.between?(0, columns-1))
    letter = letters.shift || break

    # If there is no letter at the given position, or if the
    # letter matches what is already at that position, add
    # the letter to the grid and move to the next position.
    if copy[row, column].nil? || copy[row, column] == letter
      copy[row, column] = letter
      row += dr
      column += dc
    else
      # if the letter can't be placed, abort.
      return nil
    end
  end

  # If all the letters in the word were placed, return the
  # new grid.
  letters.any? ? nil : copy
end
{% endhighlight %}

Once all of the words have been placed, we just fill in the unused squares with random letters:

{% highlight ruby %}
letters = ('a'..'z').to_a
grid.size.times { |pos| grid[pos] ||= letters.sample }
{% endhighlight %}

All that's left, then, is to display the puzzle:

{% highlight ruby %}
rows.times do |row|
  columns.times do |col|
    print grid[row, col], " "
  end
  puts
end
{% endhighlight %}

Given a vocabulary list of "mazes," "word," "search," "puzzle," "games," and "program," and a 7x7 grid, our puzzle might look something like this:

{% highlight text %}
e e d r o w h
m g l m w c g
v a s z r k w
t m z a z w w
f e e e y u b
e s p m s n p
m a r g o r p
{% endhighlight %}

(For this puzzle, the words are drawn in all possible directions: forwards, backwards, and diagonally.)

The version I wrote for my daughter actually emits the puzzles as PDF (so that she could embed them in her article). If you'd like to check it out, it's hosted on GitHub here: [http://github.com/jamis/wordsearch](http://github.com/jamis/wordsearch).
