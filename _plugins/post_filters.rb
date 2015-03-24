module PostFilters
  def minutes_to_read(input)
    words = number_of_words(input)
    (words / 250.0).ceil
  end

  def debug(input)
    p input
    input
  end
end

Liquid::Template.register_filter(PostFilters)
