import os

BASE_PATH = os.path.dirname(os.path.realpath(__file__))
PACKAGES = (
    #'controller',
    #'promise',
    'utils',
    'data',
    'pubsub',
    'widget',
    #'model',
)
MINIFY = True
YUI_COMPRESSOR = os.path.join(BASE_PATH, 'yuicompressor', 'yuicompressor-2.4.7.jar')
PROD_FILE = 'lib.js'

def main():
    print 'Opening lib.js...'
    with open(os.path.join(BASE_PATH, PROD_FILE), 'w') as f:
        for package in PACKAGES:
            with open(os.path.join(BASE_PATH, 'lib/%s.js' % package), 'r') as p:
                print 'Adding lib/%s.js...' % package
                f.write(p.read() + '\n')
    print 'Files combined'

    if MINIFY:
        print 'Minifying %s...' % PROD_FILE
        os.system('java -jar "%s" -o "%s" "%s"' % (YUI_COMPRESSOR, PROD_FILE, PROD_FILE))
        print 'Minfied %s' % PROD_FILE

if __name__ == '__main__':
    main()
