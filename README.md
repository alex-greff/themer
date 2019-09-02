# Themer
A base library for setting up structured CSS/SCSS themes in frontend web applications. 

## Table of Contents
* [Table of Contents](#table-of-contents)
* [What is this package?](#what-is-this-package)
* [Installation](#installation)
* [Usage](#usage)
* [Documentation](#documentation)
    * [General Schema](#general-schema)
    * [Endpoints](#endpoints)
      * [Endpoint Configuration](#endpoint-configuration)
    * [Base Types](#base-types)
    * [Mixins](#mixins)
    * [Inheritance](#inheritance)
    * [Themes](#themes)
    * [Custom Types](#custom-types)
* [Extra Tools](#extra-tools)

## What is this package?

This package is the core package for my personal system for setting up structured color themes in the sites that I build. I have used this system (or variations of it) enough that it is evident that I needed to pull it out into a separate package.

## Installation

For the time being I haven't put this up on NPM yet (I want to finish the frontend library implementation packages for it first) so this repo must be reference directly in your package.json file. The `master` branch will contain the most up to date and stable version of it.

**package.json**
```js
{
    // ...
    "dependencies": {
        // ...
        "themer@core": "alex-greff/themer"
    }
}
```

## Usage

```js
// ES5
const Themer = require("themer@core");

// ES6+
import Themer from "themer@core";
```

## Documentation

The `generate` method computes and returns an object with key-value mappings to all the generated endpoint values based off the supplied schema and theme (along with optional mixins and extra registered types).

```js
Themer.generate(theme: Theme, schema: Schema, mixins: Mixins = {}, registeredTypes: RegisteredTypes = {});
```

### General Schema

The general format of the schema follows a nested property value approach.

```js
{
    "level-1": {
        "level-2": {
            "level-3": {}
            // And so on...
        }
    }
}
```

Any amount of different levels and combinations can be made and each level name can be anything as long as it does not start with the reserved control character, `$`.

```js
{
    "level-1a": {
        "level-2": {
            "level-3a": {}
        }
    },
    "level-1b": {
        "level-2b": {},
        "level-2c": {
            "level-3b": {
                "level-4a": {}
            }
        }
    }
}
```

### Endpoints

The end of each level nesting path is referred to as an `endpoint`. The simplist endpoint can be defined as an empty object `{}`.

The default endpoint configuration is as follows:
```js
{
    $required: true,
    $default: null,
    $type: "any",
    $validate: null
}
```

Adding any values manually will result in the respective default configuration options being overridden.

#### Endpoint Configuration

* `$required: Boolean`

    Indicates if the endpoint must have a value provided for it by the given theme. 
    
    *Note:* if `required=false` then a valid `$default` value must be supplied.

* `$default: Valid Value`

    The default filled in the endpoint if no endpoint value is supplied by the theme.

    *Note 1:* this will be ignored if `$required=true`

    *Note 2:* the value of `$default` must be valid with the given `$type` of the endpoint.

* `$type: Type Name String`

    The type of the endpoint. See [Base Types](#base-types) for the list of default types provided in the package.

* `$validate: Function | Null`

    Validates the endpoint with the given function. The first parameter passed in is the value of the endpoint. Expects a `Boolean` value returned indicating if the endpoint is valid or not.

    *Note:* `$validate` overrides the validator check for `$type`.

### Base Types

| Type     | $type Value  | Description          | Examples                                                                 |
|----------|:------------:|----------------------|--------------------------------------------------------------------------|
| Any      |   `"any"`    | Any value.           | -                                                                        |
| Boolean  | `"boolean"`  | Boolean values.      | `true`, `false`                                                          |
| Number   |  `"number"`  | Number values.       | `0`, `1.56`, `-1005`                                                     |
| Integer  | `"integer"`  | Integer values.      | `0`, `5`, `-5060`                                                        |
| String   |  `"string"`  | String values.       | `"foo"`, `"0"`, `"false"`                                                |
| Color    |  `"color"`   | CSS [color](https://www.w3schools.com/colors/default.asp) values.    | `"#567a3b"`, `"red"`, `"rgba(45, 200, 30, 0.5)"`, `"hsl(50, 100%, 50%)"` |
| Length   |  `"length"`  | CSS [length](https://www.w3schools.com/cssref/css_units.asp) values.   | `"5px"`, `"0"`, `0`, `"20rem"`, `"100vh"`                                     |
| Rotation | `"rotation"` | CSS [rotation](https://www.quackit.com/css/functions/css_rotate_function.cfm) values. | `"45deg"`, `"0"`, `0`, `"3.14rad"`, `"400grad"`, `"1turn"`                    |


### Mixins

TODO: complete

### Inheritance

TODO: complete

### Themes

TODO: complete

### Custom Types

TODO: complete

## Extra Tools

TODO: complete