var _ = require('utility');
var Grid = require('grid').Grid;
var Block = require('cell').Block;
var Layout = require('layout/orthogonal').Layout;
var Algorithm = require('algorithm/aldous_broder').Algorithm;
var Paths = require('geometry/orthogonal/paths').Paths;
var Outlines = require('geometry/orthogonal/outlines').Outlines;
var Blockwise = require('geometry/orthogonal/blockwise').Blockwise;
var Blocks = require('geometry/orthogonal/blocks').Blocks;
var Style = require('geometry/style').Style;

function setupInteraction(canvasId, action) {
  var canvas = document.getElementById(canvasId);
  var tryMe = document.getElementById(canvasId + ".try");

  var events = ["click", "touchstart"];
  var objects = [canvas, tryMe];

  _.each(objects, function(object) {
    if (object) {
      _.each(events, function(e) {
        object.addEventListener(e, function(event) {
          event.preventDefault();
          window[action](canvas);
        });
      });
    }
  });

  window[action](canvas);
}

function drawMazes(canvas) {
  var maze = buildMaze();

  var ctx = canvas.getContext('2d');

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(5, 5);

  drawLinewise(maze, ctx);
  ctx.translate(170, 0);
  drawLinewiseWalls(maze, ctx);
  ctx.translate(170, 0);
  drawBlockwise(maze, ctx);
}

function buildMaze() {
  var grid = new Grid(new Layout(10, 10));

  var algorithm = new Algorithm();
  algorithm.run(grid);

  return grid;
}

function drawLinewise(grid, ctx) {
  var paths = new Paths(grid, 15);
  drawLayers(paths.layers, ctx);
}

function drawLinewiseWalls(grid, ctx) {
  var outlines = new Outlines(grid, 15);
  drawLayers(outlines.layers, ctx);
}

function drawBlockwise(grid, ctx) {
  var blocks = new Blockwise(grid, (30.0/31.0)*15);
  drawLayers(blocks.layers, ctx);
}

function drawLayers(layers, ctx) {
  var layers = layers[0][0];

  for(var i = 0; i < layers.length; i++) {
    var layer = layers[i];
    for(var j = 0; j < layer.length; j++) {
      var element = layer[j];
      element.render(ctx);
    }
  }
}

function isValidBlock(block, source) {
  // already carved
  if (block.isOpen()) return false;

  var d = block.neighbor;
  // on grid boundary (mandatory wall)
  if (!d.north || !d.south || !d.east || !d.west) return false;

  if (d.north != source && d.north.isOpen()) return false;
  if (d.south != source && d.south.isOpen()) return false;
  if (d.east != source && d.east.isOpen()) return false;
  if (d.west != source && d.west.isOpen()) return false;

  return true;
}

function generateRelaxedBlockwise() {
  var grid = new Grid(new Layout(20, 20), Block);
  var col = _.random(1, grid.layout.columns-1);
  var row = _.random(1, grid.layout.rows-1);
  var stack = [ grid.at(Layout.location(row, col)) ];

  while(stack.length > 0) {
    var current = stack[stack.length-1];
    var neighbors = current.neighbors();
    var validNeighbors = [];

    _.each(neighbors, function(n) {
      if (isValidBlock(n, current)) validNeighbors.push(n);
    });

    if(validNeighbors.length == 0) {
      stack.pop();
    } else {
      var winner = _.sample(validNeighbors);
      winner.isCarved = true;
      stack.push(winner);
    }
  }

  return grid;
}

function relaxedBlockwise(canvas) {
  var maze = generateRelaxedBlockwise();
  var ctx = canvas.getContext('2d');

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  var blocks = new Blocks(maze, canvas.height/maze.layout.rows);
  drawLayers(blocks.layers, ctx);
}
