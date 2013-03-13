#Pilot.js

##Why Pilot.js?

Pilot.js is a completely asynchronous framework for high-performance web applications. The initial payload is *very* small, requiring an end-user to only download the main pilot.js file. From there the whole application is then loaded asynchronously and managed by Pilot.js.

##Quick start

Modules are the core of Pilot.js, instantiated through DOM elements like this one:

	<div class="module" data-module="my_module"></div>
	            ^ required class     ^ module name

Each time Pilot.js renders it searches the DOM for elements like the one above and generally does the following:

1. Creates a base module and queues the 'load' method to run when the module is ready
2. Injects the javascript file asynchronously from *modules/my_module.js*
3. Once loaded, instantiates my_module and runs through the queued commands (usually only 'load').

At this point it would be up to the module to do whatever it wants to render. Let's look at a very basic sample module file.

    pilot.Module.define('my_module', function () {
    "use strict";
    
    return {
        load: function () {
            this.display();
        },
        display: function () {
            this.element.innerHTML = 'Hello World.';
        }
    };
    
    });

In the above example load() simply calls display(), which will change the contents of the module's div to Hello World.

	<div class="module" data-module="my_module">Hello World.</div>
	
Try it!
