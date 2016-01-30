---
layout: post
title: Writing a Klondike Puzzle Solver
categories:
- essays and rants
author: Jamis
comments: true
summary: >
  In which the author presents a Ruby program that solves Sam Lloyd's
  famous "Back from the Klondike" puzzle
---

"[Back from the Klondike](https://en.wikipedia.org/wiki/Back_from_the_Klondike)" is a puzzle invented by [Sam Lloyd](https://en.wikipedia.org/wiki/Sam_Loyd), and first published in 1898. It looks like this:

<a href="https://commons.wikimedia.org/wiki/File:Back_from_the_klondike.svg"><img src="/images/20150804-back_from_the_klondike.svg" width="400" height="400" class="center" /></a>

You start in the middle (the "3" inside a heart), and can move in any of the eight compass directions (north, west, south, east, northwest, northeast, southwest, or southeast). The distance you may move is indicated by the number on the square, so your first move, starting from the middle, is always exactly three steps. You win when your last step takes you _just_ outside the circle. (That is, you are not allowed to step outside the circle, unless it is on your last step.)

It's a kind of maze, then, isn't it? You move from place to place, along well-defined passages, going from some start point to an exit. But it's a specialized maze, too, because each "corridor" is _unidirectional_. That is to say, just because you can move from cell A to cell B, does not necessarily imply that you can move from cell B to cell A! It depends on what the number is on cell B.

Traditional mazes are _bidirectional_. Corridors allow traffic in both directions, freely. With such a traditional maze, we might use any number of techniques to solve it, including using [Dijkstra's algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm). (I describe this very technique in my book, [Mazes for Programmers](https://pragprog.com/book/jbmaze/mazes-for-programmers).)

It turns out, though, that Dijkstra's works just as well on _unidirectional_ mazes as it does on _bidirectional_ mazes. It's very straightforward, in fact. I'll show you how it works.

We'll do this in two steps.

1. Convert the puzzle into a graph (with explicit connections between cells, or nodes).
2. Run Dijkstra's algorithm on the graph.

We're going to rely on several classes to realize this.

* `Node` - represents a single cell in the graph, with connections to neighbors.
* `Graph` - a collection of `Node` instances.
* `Field` - represents the puzzle itself, where connections between nodes are implied by the number on each node.
* `Solution` - computes and encapsulates a solution to the puzzle.

Once we have these four classes, the program itself looks like this:

{% highlight ruby %}
field = Field.from_file(ARGV.first || "grid.txt")
solution = Solution.new(field, field.rows/2, field.columns/2)

solution.path.each do |step|
  puts " - #{step}"
end
{% endhighlight %}

We instantiate a new `Field` instance, reading the puzzle itself from a text file, and then we instantiate a new `Solution` instance, to tell us each of the steps from the center to the goal.

The `grid.txt` file is just a simple textual representation of the puzzle. The underscore character is used to represent all "out of bounds" locations, "x" is used to show possible goals, and digits represent valid cells. The file I'm using is (more or less) the original puzzle given by Sam Lloyd (with one correction--see [the Wikipedia article](https://en.wikipedia.org/wiki/Back_from_the_Klondike)).

{% highlight text %}
__________xxx__________
_______xxx477xxx_______
_____xx544833463xx_____
____x1451114517135x____
___x494967555876685x___
__x37298356739187585x__
__x14784292711822763x__
_x7218553113133428613x_
_x4267252422543281773x_
_x4165111914344319827x_
x435232232425351135537x
x271511315332423775427x
x252261244634121265188x
_x4375193445294195748x_
_x4167834341312323624x_
_x7326153923215758954x_
__x16734811121228941x__
__x25478756135787293x__
___x656467252263474x___
____x2312333213211x____
_____xx744573447xx_____
_______xxx334xxx_______
__________xxx__________
{% endhighlight %}

Let's start with the `Field` class, then. It has a class method called `from_file`, which accepts the name of a file and instantiates and initializes a new `Field` instance accordingly:

{% highlight ruby %}
class Field
  def self.from_file(filename)
    lines = File.readlines(filename)
    lines.map! { |line| line.chomp }
    lengths = lines.map { |l| l.length }.uniq

    rows = lines.length
    cols = lengths.first

    new(rows, cols).tap do |field|
      lines.each_with_index do |line, row|
        line.each_char.with_index do |character, col|
          # Assign each location in the field, based on
          # the corresponding character in the file.
          field[row, col] = case character
            when "_" then nil
            when "x" then :goal
            when /[1-9]/ then character.to_i
            else raise "invalid (#{character.inspect})"
            end
        end
      end
    end
  end
{% endhighlight %}

In other words, the out of bounds locations are mapped to `nil`, goal locations are mapped to `:goal`, and everything else is an integer from 1 to 9.

The constructor is simple, just creating a two-dimensional array in which we'll eventually store our field data:

{% highlight ruby %}
# class Field
  attr_reader :rows, :columns

  def initialize(rows, columns)
    @rows, @columns = rows, columns
    @field = Array.new(rows) { Array.new(columns) }
  end
{% endhighlight %}

These `Field` instances need to look and act like a hash, with row/column as the key. We'd also like to be able to iterate over all of the entries in the field. The following methods ought to do the trick:

{% highlight ruby %}
# class Field
  def [](row, col)
    @field[row][col]
  end

  def []=(row, col, value)
    @field[row][col] = value
  end

  def each
    @field.each_with_index do |row, row_idx|
      row.each_with_index do |col, col_idx|
        yield col, row_idx, col_idx
      end
    end

    self
  end
{% endhighlight ruby %}

Lastly, we'll add a method to tell us whether a span of cells (from some starting location to an ending location) is valid. A span is valid if every cell along its length is within the field (excepting possibly the last cell, which may be a goal position).

{% highlight ruby %}
# class Field
  def valid_span?(row, col, to_row, to_col)
    drow = _delta(to_row - row)
    dcol = _delta(to_col - col)

    while row != to_row || col != to_col
      return false if row < 0 || row >= rows
      return false if col < 0 || col >= columns
      return false if self[row, col].nil?
      return false if self[row, col] == :goal
      row += drow
      col += dcol
    end

    row >= 0 && row < rows &&
      col >= 0 && col <= columns &&
      self[row, col]
  end

  def _delta(value)
    return 0 if value.zero?
    (value < 0) ? -1 : 1
  end
end 
{% endhighlight %}

There. That will let us represent a puzzle. The next step is to convert a field like this, into a graph. And in order to convert it into a graph, we need to be able to represent such a data structure.

At it's core, a graph is just a collection of nodes, so we'll start with those. A `Node` looks like this:

{% highlight ruby %}
class Node
  attr_reader :row, :col
  attr_accessor :distance
  attr_accessor :previous_dir
  attr_accessor :previous_node

  def initialize(row, col)
    @neighbors = {}
    @row, @col = row, col
    @goal = false
    @distance = 1_000_000_000
  end

  def [](direction)
    @neighbors[direction]
  end

  def []=(direction, neighbor)
    @neighbors[direction] = neighbor
  end

  def goal?
    @goal
  end

  def goal!
    @goal = true
  end
end
{% endhighlight %}

The `distance` attribute will be used later, by the solution phase; we just initialize it to a very large number to start. Also by default, the node does not represent a goal node.

Now, we can define a `Graph`.

{% highlight ruby %}
class Graph
  def initialize
    @nodes = {}
  end

  def add_node(node)
    @nodes[node.row] ||= {}
    @nodes[node.row][node.col] = node
  end

  def [](row, col)
    @nodes[row][col]
  end

  def each
    @nodes.each do |row, rows|
      rows.each do |col, node|
        yield node
      end
    end

    self
  end
end
{% endhighlight %}

There are many ways this might be implemented; I opted for a sparse grid using nested hashes, instead of a two-dimensional array. Go with whatever floats your boat. (Also, I might have prefered to abstract the "row/column" location information--using a trick I learned from the inimitable [Corey Haines](https://twitter.com/coreyhaines)--but for the sake of keeping things simple, I'm using row/column directly here.)

Now, we have enough to convert a `Field` into a `Graph`. The following class method on `Graph` ought to do the trick. (It's kind of a beast. Corey, forgive me...)

{% highlight ruby %}
# class Graph
  def self.from_field(field)
    graph = new

    # Create a new Node for every cell and goal position in
    # the field...
    field.each do |value, row, col|
      next unless value
      node = Node.new(row, col)
      graph.add_node(node)
    end

    # Iterate over all the nodes
    graph.each do |node|
      row, col = node.row, node.col

      # If the field is a goal at this position, mark the node as
      # a goal...
      if field[row, col] == :goal
        node.goal!
      else
        # Otherwise, construct the connections between the nodes
        # based on the distance for the cell at that position.

        distance = field[row, col]

        if field.valid_span?(row, col, row-distance, col)
          node[:n] = graph[row-distance, col]
        end

        if field.valid_span?(row, col, row-distance, col-distance)
          node[:nw] = graph[row-distance, col-distance]
        end

        if field.valid_span?(row, col, row-distance, col+distance)
          node[:ne] = graph[row-distance, col+distance]
        end

        if field.valid_span?(row, col, row+distance, col)
          node[:s] = graph[row+distance, col]
        end

        if field.valid_span?(row, col, row+distance, col-distance)
          node[:sw] = graph[row+distance, col-distance]
        end

        if field.valid_span?(row, col, row+distance, col+distance)
          node[:se] = graph[row+distance, col+distance]
        end

        if field.valid_span?(row, col, row, col-distance)
          node[:w] = graph[row, col-distance]
        end

        if field.valid_span?(row, col, row, col+distance)
          node[:e] = graph[row, col+distance]
        end
      end
    end

    graph
  end
{% endhighlight %}

It's really not so bad...just a lot of conditions. We need to check the distance recorded at each position in the field, determine whether we can safely move from that position in each of the eight possible directions, and if so, assign the corresponding node in the graph as a neighbor of the current node.

Once _that's_ all set, we've finished the first step! We've converted a Klondike puzzle into a graph. All that remains is to process that graph and find a solution to the puzzle. For this, we'll bring in our `Solution` class. (For simplicity's sake, this implementation will only look for a single solution. Finding all possible solutions is left as an exercise blah blah blah.)

{% highlight ruby %}
class Solution
  attr_reader :graph
  attr_reader :goal
  attr_reader :root

  def initialize(field, start_row, start_column)
    @graph = Graph.from_field(field)
    @root = @graph[start_row, start_column]

    _compute_solution
  end
{% endhighlight %}

It starts simple enough--the constructor accepts a field, and a starting position, creates a graph from the field, and stores the root (the node in the graph where the puzzle begins). The internal method `#_compute_solution` is then called to do the actual work of Dijkstra's algorithm. It looks like this:

{% highlight ruby %}
# class Solution
  def _compute_solution
    root.distance = 0
    frontier = [ root ]

    while frontier.any?
      new_frontier = []

      frontier.each do |node|
        %i(n s e w nw ne sw se).each do |dir|
          next unless node[dir]

          if node[dir].distance > node.distance+1
            node[dir].distance = node.distance + 1
            node[dir].previous_dir = dir
            node[dir].previous_node = node

            if node[dir].goal?
              if @goal.nil? || @goal.distance > node[dir].distance
                @goal = node[dir]
              end
            else
              new_frontier << node[dir]
            end
          end
        end
      end

      frontier = new_frontier
    end
  end
end
{% endhighlight %}

If you aren't familiar with Dijkstra's algorithm, here is a slightly simplified version in a nutshell. You start at some position (the `root`, here), and add it to a stack (`frontier`). The algorithm then loops for as long as there are any cells in that stack. Each iteration looks at each of those cells, checks all neighbors of each one, and if the neighbor has not yet been visited (or has been visited, but was assigned a greater distance from the root), we update that neighbor's `distance` attribute, store the current node and the direction we took to get here (for pathfinding purposes), and then (if the neighbor isn't a goal position) we add that neighbor to a new list of frontier cells (`new_frontier`). If, however, the neighbor was a goal, we save it as the goal (again, for pathfinding). After that internal loop, the new frontier list replaces the old frontier list, and the outer loop repeats.

When all is said and done, every cell will have been visited and assigned a distance value (how far it is from the `root`). We can use this information to present a solution path through the puzzle, which is just what the following `#path` method does:

{% highlight ruby %}
# class Solution
  def path
    path = []
    node = @goal

    while node != root
      path.unshift node.previous_dir
      node = node.previous_node
    end

    path
  end
{% endhighlight %}

We start at the goal, and as long as that node isn't the `root` (where the puzzle started), we prepend the `previous_dir` value that we saved (telling which direction was taken to get to that node), and then make the node's `previous_node` the current node. This repeats, all the way back to the root.

And that's it!

So, what's the answer to Lloyd's "Back from the Klondike" puzzle? Let's see...

{% highlight console %}
$ ruby klondike.rb grid.txt
 - sw
 - sw
 - ne
 - ne
 - ne
 - sw
 - sw
 - sw
 - nw
{% endhighlight %}

That is to say, from the center of the puzzle, move three steps to the southwest, then southwest again, then northeast three times, then southwest three times, and then northwest.

(It turns out that you can also win by going southeast at the very end, as well, but those are the only two possible solutions to this particular puzzle.)

The full implementation, as well as the `grid.txt` used to represent Sam Lloyd's original puzzle, are available in [this gist](https://gist.github.com/jamis/195cf7a4749922a192a9).

And now we're done! Or...are we? This suggests an interesting problem. How might we _randomly generate_ these Klondike-style puzzles? Hmmm! Stay tuned for a future blog post on the topic...
