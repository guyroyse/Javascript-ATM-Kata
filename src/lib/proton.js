/**
 * json.js: This file defines functions JSON.parse() and JSON.serialize() for
 * decoding and encoding JavaScript objects and arrays from and to
 * application/json format.
 * 
 * The JSON.parse() function is a safe parser: it uses eval() for efficiency but
 * first ensures that its argument contains only legal JSON literals rather than
 * unrestricted JavaScript code.
 * 
 * This code is derived from the code at http://www.json.org/json.js which was
 * written and placed in the public domain by Douglas Crockford.
 */
// This object holds our parse and serialize functions
var JSON = {};

// The parse function is short but the validation code is complex.
// See http://www.ietf.org/rfc/rfc4627.txt
JSON.parse = function(s) {
	try {
		return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(s.replace(
				/"(\\.|[^"\\])*"/g, '')))
				&& eval('(' + s + ')');
	} catch (e) {
		return false;
	}
};

// Our JSON.serialize() function requires a number of helper functions.
// They are all defined within this anonymous function so that they remain
// private and do not pollute the global namespace.
(function() {
	var m = { // A character conversion map
		'\b' : '\\b',
		'\t' : '\\t',
		'\n' : '\\n',
		'\f' : '\\f',
		'\r' : '\\r',
		'"' : '\\"',
		'\\' : '\\\\'
	}, s = { // Map type names to functions for serializing those types
		'boolean' : function(x) {
			return String(x);
		},
		'null' : function(x) {
			return "null";
		},
		number : function(x) {
			return isFinite(x) ? String(x) : 'null';
		},
		string : function(x) {
			if (/["\\\x00-\x1f]/.test(x)) {
				x = x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
					var c = m[b];
					if (c) {
						return c;
					}
					c = b.charCodeAt();
					return '\\u00' + Math.floor(c / 16).toString(16)
							+ (c % 16).toString(16);
				});
			}
			return '"' + x + '"';
		},
		array : function(x) {
			var a = [ '[' ], b, f, i, l = x.length, v;
			for (i = 0; i < l; i += 1) {
				v = x[i];
				f = s[typeof v];
				if (f) {
					v = f(v);
					if (typeof v == 'string') {
						if (b) {
							a[a.length] = ',';
						}
						a[a.length] = v;
						b = true;
					}
				}
			}
			a[a.length] = ']';
			return a.join('');
		},
		object : function(x) {
			if (x) {
				if (x instanceof Array) {
					return s.array(x);
				}
				var a = [ '{' ], b, f, i, v;
				for (i in x) {
					v = x[i];
					f = s[typeof v];
					if (f) {
						v = f(v);
						if (typeof v == 'string') {
							if (b) {
								a[a.length] = ',';
							}
							a.push(s.string(i), ':', v);
							b = true;
						}
					}
				}
				a[a.length] = '}';
				return a.join('');
			}
			return 'null';
		}
	};

	// Export our serialize function outside of this anonymous function
	JSON.serialize = function(o) {
		return s.object(o);
	};
})(); // Invoke the anonymous function once to define JSON.serialize()

var proton = {};

proton.argumentsToArray = function(theArguments) {
	return Array.prototype.slice.call(theArguments);
};

proton.sets = function() {
	return proton.db('_meta').all();
};

proton.wipe = function() {
	proton.sets().forEach(function(item) {
		proton.db(item).clear();
	});
};

proton.dump = function() {
	var data = {};
	proton.sets().forEach(function(item) {
		data[item] = proton.db(item).all();
	});
	return data;
};
Array.prototype.sift = function() {

	var theQueries;
	var foundObjects = [];

	if (arguments[0] instanceof Array) {
		theQueries = arguments[0];
	} else {
		theQueries = proton.argumentsToArray(arguments);
	}

	if (!theQueries || theQueries.length === 0) {
		return this;
	} else {
		this.forEach(function(theObject) {
			if (proton.match(theObject, theQueries))
				foundObjects.push(theObject);
		});
		return foundObjects;
	}
};

Array.prototype.first = function() {
	return this.top()[0];
};

Array.prototype.last = function() {
	return this.bottom()[0];
};

Array.prototype.top = function(amount) {
	return this.slice(0, amount == null ? 1 : amount);
};

Array.prototype.bottom = function(amount) {
	return this.slice(amount == null ? -1 : -amount);
};

Array.prototype.page = function(page, pageCount) {
	start = (page - 1) * pageCount;
	end = start + pageCount;
	return this.slice(start, end);
};

Array.prototype.distinct = function() {

	var uniques = [];
	
	var areObjectsIdentical = function(theObject, theOtherObject) {
		return proton.match(theObject, theOtherObject)
				&& proton.match(theOtherObject, theObject);
	}

	var searchForMatch = function(theObject) {
		var matchFound = false;
		uniques.forEach(function(theUnique) {
			if (areObjectsIdentical(theObject, theUnique)) {
				matchFound = true;
				return;
			}
		});
		return matchFound;
	}

	this.forEach(function(theObject) {
		if (!searchForMatch(theObject))
			uniques.push(theObject);
	});
	
	return uniques;

};

Array.prototype.order = function(sort) {

	var extractKeysFromObject = function(object) {
		var keys = [];
		for ( var i in sort)
			keys.push(i);
		return keys;
	}

	var sortFunction = function(a, b) {
		var compareComplete = false;
		var compareResult = 0;
		var keys = extractKeysFromObject(sort);
		keys.forEach(function(key) {
			if (!compareComplete) {
				var result = sort[key](a[key], b[key]);
				if (result != 0) {
					compareComplete = true;
					compareResult = result;
				}
			}
		});
		return compareResult;
	}

	return this.sort(sortFunction);
};
proton.greaterThan = function(limit) {
	return function(value) {
		return value > limit;
	}
}

proton.greaterThanEqual = function(limit) {
	return function(value) {
		return value >= limit;
	}
}

proton.lessThan = function(limit) {
	return function(value) {
		return value < limit;
	}
}

proton.lessThanEqual = function(limit) {
	return function(value) {
		return value <= limit;
	}
}

proton.equal = function(limit) {
	return function(value) {
		return value == limit;
	}
}

proton.notEqual = function(limit) {
	return function(value) {
		return value != limit;
	}
}

proton.oneOf = function() {
	var limits = arguments;
	return function(value) {
		for ( var i = 0; i < limits.length; i++) {
			if (value == limits[i])
				return true;
		}
		return false;
	}
}

proton.notOneOf = function() {
	var limits = arguments;
	return function(value) {
		for ( var i = 0; i < limits.length; i++) {
			if (value == limits[i])
				return false;
		}
		return true
	}
}

proton.regex = function(limit) {
	return function(value) {
		return limit.test(value);
	}
}

proton.gt = proton.greaterThan;
proton.gte = proton.greaterThanEqual;
proton.lt = proton.lessThan;
proton.lte = proton.lessThanEqual;
proton.eq = proton.equal;
proton.not = proton.notEqual;
proton.ne = proton.notEqual;
proton.ascending = function(a, b) {
	if (a == b)
		return 0;
	if (a > b)
		return 1;
	return -1;
};

proton.descending = function(a, b) {
	if (a == b)
		return 0;
	if (a > b)
		return -1;
	return 1;
};
proton.match = function() {

	var internal = {};

	internal.matchesQueries = function(theQueries, theObject) {
		var matchFound = false;
		theQueries.forEach(function(theQuery) {
			if (internal.matchesQuery(theQuery, theObject)) {
				matchFound = true;
				return false;
			}
		});
		return matchFound;
	};

	internal.matchesQuery = function(theQuery, theObject) {
		var matchFound = true;
		for ( var i in theQuery) {
			matchFound = internal.doesMatchAttribute(theQuery[i], theObject[i]);
			if (!matchFound)
				break;
		}
		return matchFound;
	};

	internal.doesMatchAttribute = function(theQueryValue, theAttributeValue) {
		if (typeof theQueryValue == 'function') {
			return theQueryValue(theAttributeValue);
		} else if (theQueryValue instanceof RegExp) {
			return proton.regex(theQueryValue)(theAttributeValue);
		} else if (theQueryValue instanceof Object) {
			return internal.matchesQuery(theQueryValue, theAttributeValue);
		} else {
			return proton.equal(theQueryValue)(theAttributeValue);
		}
	};

	var theObject = null;
	var theQueries = new Array();

	var theArguments = proton.argumentsToArray(arguments);
	if (theArguments.length > 0) {
		theObject = theArguments[0];
		theQueries = theArguments.slice(1);
		if (theQueries.length == 1 && theQueries[0] instanceof Array) {
			theQueries = theQueries[0];
		}
	}
	;

	return internal.matchesQueries(theQueries, theObject);
}
proton.db = function(key) {

	var fullKey = 'proton_db_' + key, metaKey = 'proton_db__meta', internal = {};

	internal.save = function(theObjects) {
		internal.saveMeta();
		var existingObjects = internal.all();
		theObjects.forEach(function(theObject) {
			existingObjects.push(theObject);
		});
		internal.persistObjects(existingObjects);
	}

	internal.saveMeta = function() {
		var allObjects = internal.all(metaKey);
		if (allObjects.indexOf(key) == -1) {
			allObjects.push(key);
			internal.persistObjects(allObjects, metaKey);
		}
	};

	internal.remove = function(theQueries) {
		if (!theQueries || theQueries.length == 0) {
			window.localStorage.removeItem(fullKey);
			internal.removeMeta();
		} else {
			var remainingObjects = [];
			internal.all().forEach(function(existingObject) {
				if (!proton.match(existingObject, theQueries))
					remainingObjects.push(existingObject);
			})
			internal.persistObjects(remainingObjects);
		}
	};

	internal.removeMeta = function() {
		var existingObjects = internal.all(metaKey);
		var allObjects = [];
		for ( var i = 0; i < existingObjects.length; i++) {
			if (existingObjects[i] != key) {
				allObjects.push(existingObjects[i]);
			}
		}
		internal.persistObjects(allObjects, metaKey);
	};

	internal.find = function(theQueries) {
		if (!theQueries || theQueries.length == 0) {
			return internal.all();
		} else {
			return internal.all().sift(theQueries);
		}
	};

	internal.all = function(key) {
		var existingObjects;
		var allObjects = [];
		if (key != null) {
			existingObjects = JSON.parse(window.localStorage[key]);
		} else {
			existingObjects = JSON.parse(window.localStorage[fullKey]);
		}
		for ( var i = 0; i < existingObjects.length; i++) {
			allObjects.push(existingObjects[i]);
		}
		return allObjects;
	};

	internal.distinct = function() {
		return internal.all().distinct();
	};

	internal.update = function(theArguments) {
		if (theArguments.length > 0) {
			var theUpdate = theArguments[0]
			var theQueries = theArguments.slice(1);
			internal.updateObjects(theUpdate, theQueries);
		}
	};

	internal.updateObjects = function(theUpdate, theQueries) {
		internal.find(theQueries).forEach(function(foundObject) {
			internal.updateObject(theUpdate, foundObject);
		});
	};

	internal.updateObject = function(theUpdate, theObject) {
		internal.remove([ theObject ]);
		var theNewObject = internal
				.updateObjectAttributes(theUpdate, theObject);
		internal.save([ theNewObject ]);
	};

	internal.updateObjectAttributes = function(theUpdate, theObject) {
		for ( var i in theUpdate)
			theObject[i] = theUpdate[i];
		return theObject;
	};

	internal.persistObjects = function(theObjects, key) {
		if (key != null) {
			window.localStorage[key] = JSON.serialize(theObjects);
		} else {
			window.localStorage[fullKey] = JSON.serialize(theObjects);
		}
	};

	return {
		save : function() {
			internal.save(proton.argumentsToArray(arguments));
		},
		remove : function() {
			internal.remove(proton.argumentsToArray(arguments));
		},
		clear : function() {
			internal.remove();
		},
		find : function() {
			return internal.find(proton.argumentsToArray(arguments));
		},
		all : function() {
			return internal.all();
		},
		distinct : function() {
			return internal.distinct();
		},
		update : function() {
			internal.update(proton.argumentsToArray(arguments));
		}
	};

};
