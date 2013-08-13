import os, re

BASE_PATH = os.path.dirname(os.path.abspath(__file__))
LIBRARIES = ('model', 'pubsub', 'view',)
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

    with open(os.path.join(BASE_PATH, 'pilot.build.js'), 'w') as f:
        f.write(output)

if __name__ == '__main__':
     main()
