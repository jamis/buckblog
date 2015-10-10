---
layout: post
title: Bulk Inserts in ActiveRecord
categories:
- Projects
author: Jamis
comments: true
summary: >
  A new ActiveRecord extension is introduced, which enables efficient
  multi-row inserts
---

This last week I finally sat down and scratched an itch that has been bothering me for some time. The result is called [BulkInsert](http://github.com/jamis/bulk_insert), and lets you insert multiple rows at a time using ActiveRecord.

Have you ever been in a situation where your app needs to insert dozens or hundreds (or thousands!) of rows at a time? Maybe it's an importer, which needs to suck down a CSV or two, or a log processor, or a dictionary. Regardless, if you've ever found yourself doing this:

{% highlight ruby %}
inputs.each do |input|
  Model.create(input)
end
{% endhighlight %}

you've probably noticed that it is not very fast. Wrapping it all in a transaction helps some:

{% highlight ruby %}
Model.transaction do
  inputs.each do |input|
    Model.create(input)
  end
end
{% endhighlight %}

but it's still not as fast as it _might_ be. This is because it is creating one insert statement for each call to `create`:

{% highlight sql %}
INSERT INTO models (...) VALUES (...);
INSERT INTO models (...) VALUES (...);
INSERT INTO models (...) VALUES (...);
INSERT INTO models (...) VALUES (...);
...
{% endhighlight %}

But SQL lets you insert multiple rows in a single statement, using this syntax:

{% highlight sql %}
INSERT INTO models (...) VALUES
  (...),
  (...),
  (...),
  (...),
  ...
{% endhighlight %}

Sadly, no such feature exists for that in ActiveRecord natively. You have to drop down to SQL directly and build (and execute) the statement yourself...

But be of good cheer! Today, I introduce [BulkInsert](http://github.com/jamis/bulk_insert), a library for performing multi-row inserts! It works like this:

{% highlight ruby %}
Model.bulk_insert do |worker|
  worker.add(...)
  worker.add(...)
  ...
end
{% endhighlight %}

Each item is added to the queue, and the whole is accumulated into a single insert at the end of the block. (For lots of rows, it might not actually be a single insert statement, though. Some backends, like SQLite, don't like you to insert more than some number of rows at a time. For that reason, the worker will save up to 500 rows at a time by default, though you can change that set size if you need to.)

Give it a try and let me know what you think. It's an itch that has bothered me for years, so hopefully others will find it useful, too.

[Bulk Insert -- Multi-Row Inserts for ActiveRecord](http://github.com/jamis/bulk_insert)
