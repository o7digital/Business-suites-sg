"""Validate the rendered SEO, local links and optimized image output after an Astro build."""
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, unquote
import xml.etree.ElementTree as ET

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--directory', default='.vercel/output/static')
parser.add_argument('--production', action='store_true', help='Expect an indexable production build')
args = parser.parse_args()
root = Path(args.directory)
origin = 'https://www.businesssuitessg.com'
families = [('/', '/en/', '/zh/'), ('/ubicacion/', '/en/location/', '/zh/location/'),
            ('/privacy-policy/', '/en/privacy-policy/', '/zh/privacy-policy/')]
routes = [route for family in families for route in family]


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.tags = []
        self.ids = []
        self.schema = []
        self.collect_schema = False
        self.schema_text = ''
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.collect_schema = True
            self.schema_text = ''

    def handle_data(self, data):
        if self.collect_schema:
            self.schema_text += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.collect_schema:
            self.schema.append(json.loads(self.schema_text))
            self.collect_schema = False

    def elements(self, tag):
        return [attrs for name, attrs in self.tags if name == tag]


pages = {route: Page((root / route.lstrip('/') / 'index.html').read_text()) for route in routes}


def check_link(route, reference):
    url = urlsplit(urljoin(origin + route, reference))
    if url.netloc != urlsplit(origin).netloc:
        return
    path = unquote(url.path)
    target = root / path.lstrip('/')
    if path.endswith('/'):
        target /= 'index.html'
    assert target.is_file(), f'{route}: missing local target {reference}'
    if url.fragment and path in pages:
        assert unquote(url.fragment) in pages[path].ids, f'{route}: missing anchor {reference}'


for family in families:
    for route, language in zip(family, ('es', 'en', 'zh-Hans')):
        page = pages[route]
        assert page.elements('html')[0]['lang'] == language, route
        assert len(page.elements('title')) == len(page.elements('h1')) == 1, route
        assert len(page.ids) == len(set(page.ids)), f'{route}: duplicate IDs'
        metadata = {meta.get('name', meta.get('property')): meta.get('content') for meta in page.elements('meta')}
        assert metadata['robots'] == ('index, follow' if args.production else 'noindex, follow'), route
        assert metadata['description'] and metadata['og:title'] and urlsplit(metadata['og:image']).path.endswith('.webp'), route
        assert metadata['og:url'] == origin + route, route
        check_link(route, metadata['og:image'])
        links = page.elements('link')
        assert [link['href'] for link in links if link.get('rel') == 'canonical'] == [origin + route], route
        alternates = {link['hreflang']: link['href'] for link in links if link.get('rel') == 'alternate'}
        assert alternates == dict(zip(('es', 'en', 'zh-Hans', 'x-default'), [origin + p for p in (*family, family[0])])), route
        keyword_links = [link for link in page.elements('a') if any(link.get('href', '').startswith(path + '#') for path in families[1])]
        assert len(keyword_links) == 25, f'{route}: expected 25 keyword links'
        for tag, attrs in page.tags:
            if tag == 'a' and attrs.get('href'):
                check_link(route, attrs['href'])
            if tag in ('link', 'script'):
                reference = attrs.get('src') if tag == 'script' else attrs.get('href')
                if reference:
                    check_link(route, reference)
            for reference in attrs.get('data-images', '').split('|'):
                if reference:
                    assert urlsplit(reference).path.endswith('.webp'), reference
                    check_link(route, reference)
        for image in page.elements('img'):
            assert urlsplit(image['src']).path.endswith('.webp'), f'{route}: unoptimized image {image["src"]}'
            assert int(image['width']) > 0 and int(image['height']) > 0, route
            assert 'alt' in image, route
            check_link(route, image['src'])
            if image['src'].startswith('/_astro/') and image.get('id') != 'lightbox-image':
                assert image.get('sizes') and len(image.get('srcset', '').split(',')) >= 2, route
                for candidate in image['srcset'].split(','):
                    check_link(route, candidate.strip().split()[0])
        if route not in families[2]:
            assert len(page.schema) == 1, route
            assert page.schema[0]['@type'] == 'LodgingBusiness', route
            assert page.schema[0]['address']['postalCode'] == '06500', route
        print(f'{route}: metadata, languages, 25 keywords, links and WebP verified')

sitemap = ET.parse(root / 'sitemap.xml').getroot()
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9', 'x': 'http://www.w3.org/1999/xhtml'}
assert {url.find('s:loc', ns).text for url in sitemap} == {origin + route for route in routes}
for url in sitemap:
    route = url.find('s:loc', ns).text.removeprefix(origin)
    family = next(family for family in families if route in family)
    assert {link.attrib['hreflang']: link.attrib['href'] for link in url.findall('x:link', ns)} == dict(
        zip(('es', 'en', 'zh-Hans', 'x-default'), [origin + path for path in (*family, family[0])]))
robots = (root / 'robots.txt').read_text()
assert 'Disallow: /api/' in robots and f'Sitemap: {origin}/sitemap.xml' in robots
print('Sitemap: 9 canonical URLs and reciprocal language alternates verified; robots.txt verified')
