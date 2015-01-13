class CategoryPage < Jekyll::Page
  def initialize(site, base, slug, category)
    @site = site
    @base = base
    @dir  = slug
    @name = "index.html"

    self.process(@name)
    self.read_yaml(File.join(base, '_layouts'), 'category_index.html')
    self.data['category'] = category

    category_title_prefix = site.config['category_title_prefix'] || 'Category: '
    self.data['title'] = "#{category_title_prefix}#{category}"
  end
end

class CategoryPageGenerator < Jekyll::Generator
  safe true

  def generate(site)
    if site.layouts.key? 'category_index'
      site.config['category_dict'].each do |key, meta|
        site.pages << CategoryPage.new(site, site.source, meta['slug'], key)
      end
    end
  end
end
