---
layout: post
title: Introducing the Query Composer
categories:
- projects
author: Jamis
comments: true
summary: >
  A new gem is announced, which simplifies the creation and maintenance
  of complex SQL queries
---

Remember back in December, when I talked about [introspecting block parameters](http://weblog.jamisbuck.org/2015/12/12/little-things-proc-parameters.html)? I wasn't able to share my actual use-case at the time, because the work had been done for a client, and the client had not given permission to share it.

Well, the code is now unencumbered! I've released it as a gem called query-composer. [Check it out on GitHub](https://github.com/jamis/query-composer), or just install the gem:

{% highlight sh %}
$ gem install query-composer
{% endhighlight %}

It provides an API for programmatically generating complex SQL queries from their separate components. You specify each component and the dependencies between them, and `Query::Composer` will stitch them together into the final query.

In brief, it works like this:

{% highlight ruby %}
require 'query/composer'

# Create a composer object
composer = Query::Composer.new

# Add components to it. The blocks must return either
# ActiveRecord scopes, or Arel-compatible objects.
composer.use(:companies) { Company.where(...) }

# Dependent components use block parameter names to
# indicate the components they depend on.
composer.use(:companies_with_people) do |companies|
  people = Arel::Table.new(:people)

  people.
    project(Arel.star).
    join(companies).
      on(people[:company_id].eq(companies[:id]))
end

# Build the query by telling the composer which component
# is the "root" of the component tree. It will then
# determine the dependencies and return the resulting
# query as an Arel object:
query = composer.build(:companies_with_people)

# Convert the query to SQL to execute it:
companies = Company.find_by_sql(query.to_sql)
{% endhighlight %}

It can generate these queries either using derived tables (nested subqueries) or using [Common Table Expressions](https://en.wikipedia.org/wiki/Hierarchical_and_recursive_queries_in_SQL#Common_table_expression). (Be warned, however! CTEs are still non-standard and behave differently across DBMSs. I learned the hard way that PostgreSQL in particular does no optimization across the different components of a CTE!)

It is challenging to demonstrate succinctly how useful this tool is, because if you aren't dynamically generating significantly complex queries, `Query::Composer` will actually make _more_ work for you. And when you're dealing with sufficient complex queries...the examples needed to demonstrate them become fairly complex, too.

Despite that, I've put together an example, using a hypothetical library administration system: Libraries have Books and Patrons, Books have Topics, and Patrons may borrow Books. The example, then, builds and runs a report that asks how many books each patron borrowed during some period, and compares that to the number of books each patron borrowed during some prior period. The query may be scoped by Library, and by Topic.

The example may be seen [here](https://github.com/jamis/query-composer/blob/master/examples/library.rb) -- it creates an in-memory SQLite3 database, populates it, builds the query using the `Query::Composer`, and then displays both the query, and the result.

The final query (formatted separately using [sqlpp](https://github.com/jamis/sqlpp)) looks like this:

{% highlight sql %}
SELECT a.*,
       e."total" AS current_total,
       f."total" AS prior_total
FROM (
  SELECT "patrons".*
  FROM "patrons"
) a
INNER JOIN (
  SELECT "lendings"."patron_id",
         COUNT("lendings"."patron_id") AS total
  FROM "lendings"
  INNER JOIN (
    SELECT "books"."id"
    FROM "books"
    INNER JOIN (
      SELECT "libraries".*
      FROM "libraries"
      WHERE "libraries"."id" IN (1, 2)
    ) b
    ON "books"."library_id" = b."id"
    INNER JOIN (
      SELECT "topics".*
      FROM "topics"
      WHERE "topics"."id" IN (1, 2, 3, 4)
    ) c
    ON "books"."topic_id" = c."id"
  ) d
  ON "lendings"."book_id" = d."id"
  WHERE "lendings"."created_at" BETWEEN '2016-02-01' AND '2016-02-15'
  GROUP BY "lendings"."patron_id"
) e
ON e."patron_id" = a."id"
LEFT OUTER JOIN (
  SELECT "lendings"."patron_id",
         COUNT("lendings"."patron_id") AS total
  FROM "lendings"
  INNER JOIN (
    SELECT "books"."id"
    FROM "books"
    INNER JOIN (
      SELECT "libraries".*
      FROM "libraries"
      WHERE "libraries"."id" IN (1, 2)
    ) b
    ON "books"."library_id" = b."id"
    INNER JOIN (
      SELECT "topics".*
      FROM "topics"
      WHERE "topics"."id" IN (1, 2, 3, 4)
    ) c
    ON "books"."topic_id" = c."id"
  ) d
  ON "lendings"."book_id" = d."id"
  WHERE "lendings"."created_at" BETWEEN '2016-01-01' AND '2016-01-15'
  GROUP BY "lendings"."patron_id"
) f
ON f."patron_id" = a."id"
{% endhighlight %}

The composer may be configured to use descriptive aliases instead of brief ones, but in production, your logs will thank you for saving every possible byte. :) (The system this was extracted from was generating queries that were nearly 50KB each--for the SQL alone!)

So, [check it out](https://github.com/jamis/query-composer) and let me know what you think. Personally, I was thrilled with how block-parameter introspection simplified the dependency specification. I had also tried some other techniques, where the dependencies were explicitly (and separately) specified, but all were awkward, verbose, and made it difficult to see at a glance how a given component related to the others.

In all, `Query::Composer` has significantly simplified the reporting work I'm doing for my client. I hope it can simplify yours, too!
