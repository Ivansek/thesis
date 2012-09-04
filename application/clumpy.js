/*
http://www.tumuski.com/code/clumpy/
Copyright (c) 2009 Thomas Peri

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Good Parts plus Browser:
/*jslint
	white: true, undef: true, nomen: true, eqeqeq: true, plusplus: true,
	bitwise: true, regexp: true, onevar: true, newcap: true,
	browser: true
*/

/**
 * Model incremental asynchronous processes after traditional loops.
 * version 2009-10-24
 *
 * To-do: update comments to be consistent with the terminology in the implementation docs.
 */
var Clumpy = (function () {

	var constructor, // Gets returned and set as global Clumpy.
		
		// public prototype methods
		do_while_loop, for_in_loop, while_loop,

		// private "class" functions
		fn, nothing, num, spawn;
		
	/**
	 * Construct an object for modeling asynchronous loops.
	 */
	constructor = function (options) {
	
		var self = this,
		
			// public instance methods
			break_loop, continue_loop, label, for_loop, 
			init, interrupt, once, pause, resume,
			set, setNow, sleep, wait, 
			
			// private instance functions
			advance, clump, enqueue, findLoop, iterate, 
			perform, schedule, wait_callback, 
			
			// private instance variables
			inside, nextLabel, paused, queue, waiting, stop,
			clumpTimeout, sleepTimeout,
			
			// user options
			between, delay, duration, manual;
		
	
		// Public Methods
		
		/**
		 * Emulate the 'break' keyword inside a Clumpy loop.
		 */
		break_loop = function (label) {
			return once(function () {
				findLoop(label);
				queue.head.loop.finished = true;
			});
		};
		
		/**
		 * Emulate the 'continue' keyword inside a Clumpy loop.
		 */
		continue_loop = function (label) {
			return once(function () {
				findLoop(label);
			});
		};
		
		/**
		 * Label the next loop.  Must precede a loop.
		 */
		label = function (newLabel) {
			nextLabel = newLabel;
			return self;
		};
		
		/**
		 * Enqueue the supplied statements function and associated functions
		 * to be executed in the fashion of a 'for' loop.
		 */
		for_loop = function (init, test, inc, statements) {
			// All the other loop methods are written in terms of this one ultimately.
			enqueue(statements, {
				label: nextLabel,
				init: init,
				test: test,
				inc: inc,
				initialized: false,
				finished: false
			});
			return self;
		};
		
		/**
		 * Enqueue the supplied statements function to be executed exactly once.
		 */
		once = function (statements) {
			enqueue(statements, null);
			return self;
		};
	
		/**
		 * Enqueue the act of [performing of an asynchronous operation,
		 * and then waiting for the callback before proceeding].
		 */
		wait = function (statements) {
			return once(function () {
				waiting = true;
				statements(wait_callback);
			});
		};
		
		/**
		 * Enqueue a sleep of delay milliseconds.
		 */
		sleep = function (delay) {
			return wait(function (callback) {
				sleepTimeout = setTimeout(callback, delay);
			});
		};
		
		/**
		 * Freeze this Clumpy instance in its tracks.
		 */
		pause = function () {
			paused = true;
			clearTimeout(clumpTimeout);
			clearTimeout(sleepTimeout);
			return self;
		};
		
		/**
		 * Resume after pause.
		 */
		resume = function () {
			if (paused) {
				paused = false;
				if (!waiting) {
					schedule();
				}
			}
			return self;
		};
		
		/**
		 * Set some options.
		 */
		set = function (options) {
			return once(function () {
				setNow(options);
			});
		};
		
		/**
		 * Set some options now, without enqueueing the act of doing so.
		 */
		setNow = function (options) {
			options = options || {};
			
			function defined(key) {
				return typeof options[key] !== 'undefined';
			}
			if (defined('between')) {
				between = fn(options.between);
			}
			if (defined('delay')) {
				delay = num(options.delay, 0);
			}
			if (defined('duration')) {
				duration = num(options.duration, 0);
			}
			if (defined('manual')) {
				manual = options.manual ? true : false;
			}

			// Pause and resume the Clumpy to make the changes take effect immediately.
			if (queue.head && !paused && !waiting) {
				pause();
				setTimeout(resume, 0);
			}
			
			return self;
		};
		
		/**
		 * Enqueue an end to the current clump.
		 */
		interrupt = function () {
			return once(function () {
				stop = true;
			});
		};
		
		/**
		 * Stop and forget everything this Clumpy instance is doing,
		 * but don't reset the options.
		 */
		init = function () {
			inside = false;
			nextLabel = null;
			paused = false;
			queue = spawn(null);
			stop = false;
			waiting = false;
			clearTimeout(clumpTimeout);
			clearTimeout(sleepTimeout);
		};
		
		
		// Private "Class" Functions
		
		/*
		 * Advance to the next iteration.
		 */
		advance = function () {
			var loop;
			
			// Keep advancing until we shouldn't anymore.
			while (true) {
			
				// If the current node is a loop that hasn't finished,
				// just increment the loop and stop advancing.
				loop = queue.head.loop;
				if (loop && !loop.finished) {
					loop.inc.call();
					
				// Otherwise -- since it's not a loop that hasn't finished --
				// it must be either a one-off node, or a loop that has finished...
				} else {

					// ...so move on to the next node.
					queue.head = queue.head.next;
					
					// If it turns out that there was no next node 
					// in this queue to move on to...
					if (!queue.head) {
					
						// ...clear the tail also.
						queue.tail = null;
						
						// Then, if there's a parent queue to go back to, go back to it.
						if (queue.parent) {
							queue = queue.parent;
							
							// Once we're back at the parent queue, though, we 
							// can't just stay there, because the very fact that 
							// we were running code inside a child queue means 
							// that the current node in the parent queue has already
							// been performed.  Therefore, we need to continue
							// this advancing loop to decide where to go from there.
							continue;
						}
						
						// If there's no parent queue, and there are no more nodes
						// in this queue, that means there are no more nodes left 
						// at all.  The current clump will exit without scheduling.
					}
				}
				
				// End this advancing loop.
				break;
			}
		};
	
		/*
		 * Do a synchronous clump of statements blocks, 
		 * and schedule another clump after a timeout.
		 */
		clump = function () {
			var end = new Date().getTime() + duration;
			
			if (queue.head) {
				while (true) {
					iterate();
	
					// If there's nothing left to do after this iteration,
					// then don't bother calling between or schedule.
					if (!queue.head) {
						break;
					}
					
					// If this Clumpy has been paused, or if this iteration 
					// caused it to be waiting, then don't schedule a new clump
					// right now.  Do call between, though, because we expect 
					// another clump eventually.
					if (paused || waiting) {
						between();
						break;
					}
					
					// If this clump is over its time limit, or has been interrupted,
					// schedule a new one.
					if (stop || (!manual && (new Date().getTime() > end))) {
						stop = false;
						between();
						// only delay here, when scheduling from within a clump
						schedule(delay);
						break;
					}
				}
			}
		};
		
		/*
		 * The callback for wait.
		 */
		wait_callback = function () {
			if (waiting) {
				waiting = false;
				if (!paused) {
					schedule();
				}
			}
		};
		
		/*
		 * Put a node -- either a loop or not -- 
		 * into the Clumpy queue to be performed eventually.
		 */
		enqueue = function (statements, loop) {
			var node;
			nextLabel = null;
			node = {
				loop: loop,
				statements: statements,
				next: null
			};
			
			// If this is the first node that was enqueued inside a statements
			// block, start a new queue using the current one as its parent.
			if (inside) {
				inside = false;
				queue = spawn(queue);
			}
	
			// If there's anything in the (now-)current queue, 
			// add the new node to the end of it.
			if (queue.tail) {
				queue.tail.next = node;
				queue.tail = node;
				
			// Otherwise, mark this new node as the beginning and end.
			} else {
				queue.head = node;
				queue.tail = node;
				
				// If this is the beginning of the outermost queue,
				// the the timeouts need to be started.
				if (!queue.parent) {
					schedule();
				}
			}
		};
		
		/*
		 * Back out to the nearest loop, or if a label is supplied,
		 * the nearest loop with that label.
		 */
		findLoop = function (label) {
			// Back out until we find a loop.
			while (!queue.head.loop) {
				queue = queue.parent;
				if (!queue) {
					throw "'break_loop' and 'continue_loop' can only be used inside a Clumpy loop!";
				}
			}
			if (label) {
				// If the loop we've found isn't the one with the specified label,
				// keep backing out until we find it.
				while (!queue.head.loop || queue.head.loop.label !== label) {
					queue = queue.parent;
					if (!queue) {
						throw "Clumpy couldn't find the label '" + label + "'.";
					}
				}
			}
		};
		
		/*
		 * Perform the current code unit.
		 */
		iterate = function () {
			var loop;
			
			queue.begun = true;
			
			loop = queue.head.loop;
			if (loop) {
				if (!loop.initialized) {
					loop.init.call();
					loop.initialized = true;
				}
				if (loop.test.call()) {
					perform();
				} else {
					loop.finished = true;
				}
			} else {
				perform();
			}
			
			// Advance only if the latest statements function 
			// didn't push a new queue that hasn't begun yet.
			if (queue.begun) {
				advance();
			}
		};
		
		
		/*
		 * Perform the current node's statements.
		 */
		perform = function () {
			inside = true;
			queue.head.statements.call();
			inside = false;
		};
		
		/*
		 * Add the next clump to the browser's event queue.
		 */
		schedule = function (d) {
			// Only schedule it if there's something to do.
			if (queue.head) {
				clumpTimeout = setTimeout(clump, d || 0);
			}
		};
		
		
		// Set initial values for private instance variables.
		init();
	
	
		// Set defaults for user options.
		between = nothing;
		delay = 0;
		duration = 100;
		manual = false;
		
	
		// User can set options as argument to constructor.
		// The paused thing is a trick.
		setNow(options);
		
		
		// Publicize public methods.
		this.break_loop = break_loop;
		this.continue_loop = continue_loop;
		this.label = label;
		this.for_loop = for_loop;
		this.once = once;
		this.wait = wait;
		this.sleep = sleep;
		this.pause = pause;
		this.resume = resume;
		this.set = set;
		this.setNow = setNow;
		this.interrupt = interrupt;
		this.init = init;
		
	};
	
	
	// Stuff that doesn't need access to the private members
	// can go outside the constructor, and maybe save a lil' memory.
	
	
	// Public Prototype Methods
	
	/**
	 * Enqueue the supplied statements and associated test function
	 * to be executed in the fashion of a 'do...while' loop.
	 */
	do_while_loop = function (statements, test) {
		var first = true;
		return this.while_loop(
			function () {
				var proceed = first || test();
				first = false;
				return proceed;
			},
			statements);
	};
	
	// Tolerate unfiltered for...in in just this one method.  It needs to
	// be unfiltered in order to emulate the real behavior of a for...in loop.
	/*jslint forin: true */
	
	/**
	 * Enqueue the supplied statements function to be executed in the 
	 * fashion of a 'for...in' loop, iterating over the supplied object.
	 */
	for_in_loop = function (obj, statements) {
		var i, key, keys = [];
		for (key in obj) {
			keys.push(key);
		}
		return this.for_loop(
			function () {
				i = 0;
			},
			function () {
				return i < keys.length;
			},
			function () {
				i += 1;
			},
			function () {
				statements(keys[i]);
			}
		);
	};
	
	/*jslint forin: false */	

	/**
	 * Enqueue the supplied statements and associated test function
	 * to be executed in the fashion of a 'while' loop.
	 */
	while_loop = function (test, statements) {
		return this.for_loop(
			nothing,
			test,
			nothing,
			statements);
	};

	
	// Private Class Methods

	/*
	 * Clean an argument that's supposed to be a function.
	 */
	fn = function (value) {
		return typeof value === 'function' ? value : nothing;
	};

	/*
	 * Any empty function.  Go ahead, post this to The Daily WTF.
	 */
	nothing = function () {
	};

	/*
	 * Clean an argument that's supposed to be a number.
	 */
	num = function (value, min) {
		value = parseInt(value, 10) || 0;
		return typeof min === 'number' ? Math.max(min, value) : value;
	};

	/*
	 * Start a new queue, optionally specifying the parent.
	 */
	spawn = function (parent) {
		return {
			begun: false,
			parent: parent,
			head: null,
			tail: null
		};
	};


	// Attach prototype methods to the prototype.
	constructor.prototype.do_while_loop = do_while_loop;
	constructor.prototype.for_in_loop = for_in_loop;
	constructor.prototype.while_loop = while_loop;


	// Return the constructor to be set as the global member Clumpy.
	return constructor;

}());