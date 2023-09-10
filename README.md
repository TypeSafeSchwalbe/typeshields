# TypeShields

Add runtime type checking to your Javascript code without writing a bunch of boilerplate.

### Shields

- `any`
    - Does not do any checks.
- `unit`
    - Requires the checked value to be `undefined`.
- `number`
    - Requires the checked value to be a number.
- `string`
    - Requires the checked value to be a string.
- `boolean`
    - Requires the checked value to be a boolean.
- `symbol`
    - Requires the value to be a symbol.
- `instance(c)`
    - Requires the value to be an instance of the provided class `c`.
- `array(e)`
    - Requires the value to be an array.
    - `e` is expected to be a type shield where every element in the checked value is checked against `e`.
- `object(m)`
    - Requires the value to be an object.
    - `m` is expected to be an object where every member has to be a type shield, and all members of the checked value are then checked against the type shields stored in the member of `m` with the same name.
- `func(p, r)`
    - Requires the value to be a function.
    - `p` is expected to be an array where every element has to be a type shield, and (when the function is called) every parameter value will be checked against the type shield stored in `p` at the same index.
    - `r` is expected to a type shield where (when the function is called) the return type will be checked against `r`.

### How to use

To check a value against a type shield, call the type shield and pass the value as the only parameter. The value will be returned.
```js
let pi = number(3.14);
let tau = (number) (6.28); // if you want it to look like a C type cast
```
<br>

If the type is invalid, an error will be thrown at runtime:
```js
let g = (string) (9.81);
```
```
type mismatch: expected type 'string', got 'number' instead
```
<br>

The `instance`-shield accepts the class that the value must be an instance of:
```js
let a = (instance(Map)) (new Map());
let b = (instance(Map)) (25); 
```
```
Uncaught type mismatch: expected type 'instance(Map)', got 'number' instead
```
<br>

The `array`-shield accepts the type that is required for each element:
```js
let abc = (array(string)) (["A", "B", "C", "D", "E"]);
let primes = (array(number)) ([1, 2, 3, 5, 7, "11", 13]);
```
```
Uncaught type mismatch (6th element of 'array(number)'): expected type 'number', got 'string' instead
```
<br>

The `object`-shield accepts the types that each member is required to have:
```js
let book = (object({ name: string, pages: number })) ({
    name: "The Art of War",
    pages: 260
});

const Cat = object({
    name: string,
    age: number
});

let cookie = (Cat) ({
    name: "Cookie",
    hunger: 0.5
});
```
```
type mismatch (member 'age' of 'object {name: string, age: number}'): expected type 'number', got 'undefined' instead
```
<br>

The `func`-shield accepts a list of parameter types and a return type. When passed a function, the function it returns isn't the same - it has type checking built into it!
```js
const add = (func([number, number], number)) ((a, b) => a + b);
add("Hello, ", 10);
```
```
Uncaught type mismatch (1st parameter of 'func([number, number], number)'): expected type 'number', got 'string' instead
```
If you want to check a function to have no parameters, then make the parameter type list an empty array.
To check a function to return nothing, make the return type `unit`.
<br>

The `any`-shield can come in handy when you need to provide a shield, but don't want to do any checks. For example, it can be used to check for an array that contains values of any type:
```js
let stuff = (array(any)) ([3, 8, "Hi", null, {}, 42]);
```
Or maybe you want an object that has to have a property, but the type of that property does not matter:
```js
const Container = object({
    value: any
});

let c = (Container) ({
    value: "Hello!"
});
```

### Generics

If you want to model a generic object type, use this pattern, where you define a function that takes one or more shields as parameters, and then return the resulting shield:
```js
const Box = (T) => object({
    value: T
});

let a = (Box(number)) ({ value: 65536 });
let b = (Box(string)) ({ value: "Hi!" });
```
<br>

And for generic functions, use the same pattern, but instead return the function itself:
```js
const push_onto_array = (T) => (func([array(T), T], unit)) ((arr, v) => {
    arr.push(v);
});

let a = [0, 1, 2, 3];
push_onto_array(number)(a, 4);
```