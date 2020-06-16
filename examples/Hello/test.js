// {'a': b, 'c': d, 'e': f} -> ['a','c','e'] [b,d,f]
function split(keysAndValues, keys, values) {
  for (var prop in keysAndValues) {
    keys.push(prop);
    values.push(keysAndValues[prop]);
  }
}

function call2() {
 console.log( arguments );
}

function call1() {
 console.log( arguments );
 call2.apply( null, arguments );
}

call1( 1,2, "coucou" );