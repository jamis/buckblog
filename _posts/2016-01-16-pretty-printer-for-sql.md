---
layout: post
title: A Pretty-Printer for SQL
categories:
- Projects
author: Jamis
comments: true
summary: >
  A project is announced that provides a simplistic parser and pretty-printer
  for a subset of SQL
---

Lately, I've been up to my elbows in enormous SQL queries. I can't share the details, but suffice to say that it's for a reporting app, and the SQL for these queries frequently run as much as 50,000 characters each. This happens because the queries are built up modularly, with each module forming a subselect that a higher query selects from...and there are quite a few of these little query modules.

I'm actually pretty happy with the architecture behind it all, but happy or not, debugging a small novel's worth of SQL is not a fun thing. The query builder just emits it all as a single line, which makes locating a typo or logic error excruciatingly difficult.

This week, I finally bit the bullet and wrote a pretty-printer for SQL. It's not perfect, and it's far from complete, but it works well enough for what I've needed.

I'm calling it [SQLPP](http://github.com/jamis/sqlpp) -- the SQL Pretty-Printer.

Install it via RubyGems:

{% highlight sh %}
$ gem install sqlpp
{% endhighlight %}

The idea is that you pass the SQL to the tool via stdin, and it writes the pretty-printed query to stdout:

{% highlight sh %}
$ sqlpp < query.sql
SELECT a, b, sum(c)
FROM (
  SELECT d, e, f
  FROM (
    SELECT g, h, i
    FROM table
    WHERE id IN (1, 2, 3)
  ) a
  WHERE a.e = 5
  OR a.e = 7
) b
WHERE b.c > 5
GROUP BY a, b
ORDER BY a ASC, b DESC
{% endhighlight %}

You can do it programmatically, too, of course:

{% highlight ruby %}
require 'sqlpp'

sql = "..."
ast = SQLPP::Parser.parse(sql)
str = SQLPP::Formatter.new.format(ast)
{% endhighlight %}

As I said, it's far from complete, though. It is not (necessarily) a validating parser (so it may format entirely invalid SQL), and it is missing significant bits of SQL syntax (like inserts, updates, deletes, unions, etc.) If you find yourself missing some functionality, I appreciate pull requests!

Find it on [GitHub](http://github.com/jamis/sqlpp), or install `sqlpp` via RubyGems. Let me know what you think!
