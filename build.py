USE_LIBRARIES = ('data', 'pubsub', 'router', 'jsonp')
NEW_FILE = 'pilot.build.js'

def main():
    output = ''

    with open ('pilot.js', 'r') as f:
            output += f.read() + '\n'

    for lib in USE_LIBRARIES:
        with open ('lib/%s.js' % lib, 'r') as f:
            contents = f.read()
            contents = contents.replace('define(', "define('pilot/%s', " % lib)
            output += contents + '\n'

    with open('pilot.build.js', 'w') as f:
        f.write(output)

if __name__ == '__main__': 
     main()

    
