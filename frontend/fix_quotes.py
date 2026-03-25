import codecs

with codecs.open('I:/pokemon/lib/translations.ts.backup', 'r', 'utf-8') as f:
    content = f.read()

content = content.replace('\u201c', '"').replace('\u201d', '"')

with codecs.open('I:/pokemon/lib/translations.ts', 'w', 'utf-8') as f:
    f.write(content)

print('Fixed successfully')
