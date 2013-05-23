import os, re

BASE_PATH = os.path.dirname(os.path.abspath(__file__))
LIBRARIES = ('data', 'pubsub', 'router','view',)
NEW_FILE = 'pilot.build.js'

try:
    os.remove(os.path.join(BASE_PATH, 'pilot.build.js'))
except:
    pass

def main():
    output = ''

    with open (os.path.join(BASE_PATH, 'pilot.js'), 'r') as f:
            output += f.read() + '\n'

    for lib in LIBRARIES:
        with open (os.path.join(BASE_PATH, 'lib', '%s.js' % lib), 'r') as f:
            contents = f.read()
            contents = contents.replace('define(', "define('pilot/%s', " % lib)
            output += contents + '\n'

    """
    define1 = re.compile(r'define\s*\(\s*([^,\)]+)')

    for dirpath, dirnames, filenames in os.walk(os.path.join(BASE_PATH, 'tests')):
        for filename in filenames:
            print filename
            if filename.endswith('.js') and filename != 'pilot.build.js' and filename != 'pilot.js':
                with open (os.path.join(dirpath, filename), 'r') as f:
                    contents = f.read()
                    for match in define1.finditer(contents):
                        if match.group(1).find('[') != -1 or (match.group(1).find('"') == -1 and match.group(1).find("'") == -1):
                            print match.group(1)
                            contents = contents[:match.start(1)] + '"' + dirpath[len(BASE_PATH) + 1:] + '/' + filename[:-3] + '",' + contents[match.start(1):]
            output += contents + '\n'
    """

    with open(os.path.join(BASE_PATH, 'pilot.build.js'), 'w') as f:
        f.write(output)

if __name__ == '__main__': 
     main()
