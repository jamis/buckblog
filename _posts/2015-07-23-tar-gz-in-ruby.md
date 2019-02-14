---
layout: post
title: tar.gz in Ruby
categories:
- tips & tricks
author: Jamis
comments: true
summary: >
  A method is described for reading and writing tar and gzip files, using
  only the Ruby standard library
---

I'm always surprised by the odds and ends that are tucked away inside a stock Ruby install. Recently, I was thinking about Rubygems and realized that since gem files are just tar files, and since Rubygems is cross-platform, that therefore Ruby must ship with some libraries for reading and writing tar files.

First of all: gem files are just tar files?! It's true. Try it:

{% highlight console %}
$ gem fetch chunky_png -v 1.3.4
  ...
$ mv chunky_png-1.3.4.gem chunky_png-1.3.4.tar
$ tar tf chunky_png-1.3.4.tar
metadata.gz
data.tar.gz
checksums.yaml.gz
{% endhighlight %}

(Technically, you don't even need to rename the file, first---that was just me making it more obvious what's going on.)

So, if that's the case, Ruby must have a way to read and write these tape archives ("tar" files). How, though? You'll grow old looking for a "tar" library in the Ruby standard library, because there isn't one. Nope---it's actually a feature of Rubygems itself.

If you go digging around in the Rubygems directory (for example, `lib/ruby/2.2.0/rubygems`, beneath wherever your Ruby is installed), you'll eventually find some handy classes called `Gem::Package::TarReader` and `Gem::Package::TarWriter`. Those are the magic bits. For example, let's unpack that gem file using Ruby:

{% highlight ruby %}
require 'rubygems/package'

File.open("chunky_png-1.3.4.gem", "rb") do |file|
  Gem::Package::TarReader.new(file) do |tar|
    tar.each do |entry|
      if entry.file?
        FileUtils.mkdir_p(File.dirname(entry.full_name))
        File.open(entry.full_name, "wb") do |f|
          f.write(entry.read)
        end
        File.chmod(entry.header.mode, entry.full_name)
      end
    end
  end
end
{% endhighlight %}

We're just opening the gem file, and then wrapping that file object with a `TarReader` instance. The `TarReader` lets us iterate over all the entries in the archive, and for each one we check to see if it is a file (tar archives can contain directory entries, too), and if it is, we ensure the path exists for the file, write the entry to disk, and then make sure the mode is set correctly on the file (that is, setting the read/write/execute bits appropriately).

Nothing to it! If you run that, those three component files (metadata.gz, data.tar.gz, and checksums.yaml.gz) will be written to the current directory, unpacked using nothing but Ruby.

But wait...there's more! Notice that those component files are all gzipped. Since these are components of a Ruby gem, that means that Rubygems must be able to read and write them, too. This might be less surprising to some of you, though, since Ruby has shipped with zlib bindings pretty much forever. Let's unpack that metadata.gz file, for instance:

{% highlight ruby %}
require 'zlib'

File.open("metadata.gz", "rb") do |file|
  Zlib::GzipReader.wrap(file) do |gz|
    File.write("metadata", gz.read)
  end
end
{% endhighlight %}

All this does is open the gz file, wrap it with a `Zlib::GzipReader` instance, and then write the uncompressed data to "metadata". Easy! You can do the same with checksums.yaml.gz if you want. It'll even work with the data.tar.gz file...but we can do even better there!

Why? Because both `Zlib::GzipReader` and `Gem::Package::TarReader` wrap an IO object, so we can treat them like filters in a pipeline. We open the data.tar.gz file, wrap that file in a `GzipReader`, and then wrap _that_ in a `TarReader`. Then we just iterate over all the elements of the tar file. Below, we're just showing all the entries in that data.tar.gz file:

{% highlight ruby %}
require 'rubygems/package'

File.open("data.tar.gz", "rb") do |file|
  Zlib::GzipReader.wrap(file) do |gz|
    Gem::Package::TarReader.new(gz) do |tar|
      tar.each { |entry| puts entry.full_name }
    end
  end
end
{% endhighlight %}

SO SLICK!

Of course, this all works the other way, too. You can create these gzipped tar files on the fly, by using `Zlib::GzipWriter` and `Gem::Package::TarWriter`, like this:

{% highlight ruby %}
require 'rubygems/package'

File.open("demo.tar.gz", "wb") do |file|
  Zlib::GzipWriter.wrap(file) do |gz|
    Gem::Package::TarWriter.new(gz) do |tar|
      awesome_stuff = "This is awesome!\n"
      tar.add_file_simple("awesome/stuff.txt",
        0444, awesome_stuff.bytesize
      ) do |io|
        io.write(awesome_stuff)
      end

      more_awesome = "This is awesome, too!\n"
      tar.add_file_simple("more/awesome.txt",
        0444, more_awesome.bytesize
      ) do |io|
        io.write(more_awesome)
      end
    end
  end
end
{% endhighlight %}

Once we have our tar writer, we just call `add_file_simple` to tell the archive what to call each file, as well as what mode to assign it, and how long it is. The associated block is given a pseudo-IO object that can be written to.

The result?

{% highlight console %}
$ tar tzf demo.tar.gz
awesome/stuff.txt
more/awesome.txt
{% endhighlight %}

Awesome, indeed. Consider the possibilities! Maybe you have a web app that sends users a collection of vCards, or images, or spreadsheets. Maybe you have some data spelunking script that needs to email someone a bunch of csv files. It's all possible, right from within Ruby.

I need to do some more exploring in the standard library. I wonder what I'll find next?
