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
    * [Themes](#themes)
    * [Mixins](#mixins)
    * [Inheritance](#inheritance)
    * [Custom Types](#custom-types)
    * [Options](#options)
* [Extra Tools](#extra-tools)
    * [SASS Tools](#sass-tools)

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
Themer.generate(theme: Theme, schema: Schema, mixins: Mixins = {}, registeredTypes: RegisteredTypes = {}, options: Options = DefaultOptions);
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

*Note:* This can be configured in the [options](#options) object.

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

### Themes

Themes are used populate the given schema models with values when generating the schema with `Themer.generate`.

**Example:**

```js
// schema
{
    "level-1a": {
        "level-2a": {}
        "level-2b": {
            "level-3a": {}
        }
    },
    "level-1b": {
        "level-2c": {}
    }
}

// theme
{
    "level-1a": {
        "level-2a": "foo",
        "level-2b": {
            "level-3a": "bar"
        }
    },
    "level-1b": {
        "level-2c": "foobar"
    }
}

// output from Themer.generate
{
    "level-1a__level-2a": "foo",
    "level-1a__level-2b__level-3a": "bar",
    "level-1b__level-2c": "foobar"
}
```

### Mixins

Mixins allow for injecting parts of schema configuration into the main schema allowing for greater reusability. 

*Note:* Mixins are injected **before** evaluation of the schema and the theme.

Multiple mixins can be injected in one location by using an array in the `$mixins` control.

Mixins are also injected relative to their location in the schema and their array order so common properties before it will be overridden and common properties after it will override it.


*Tip:* mixins can also be nested within mixins themselves - just be careful of circular mixins!

**Example:**
```js
// schema
{
    "GLOBAL": {
        $mixins: "section"
    }
}

// mixins
{
    "section": {
        "background-color": {
            $mixins: "background"
        },
        "text-color": {
            $mixins: "text"
        }
    },
    "background": {
        $mixins: ["base-modifiers", "extra-modifiers"]
    },
    "text": {
        $mixins: "base-modifiers"
    },
    "base-modifiers": {
        "primary": {
            $type: "color",
            $required: true
        },
        "secondary": {
            $type: "color",
            $required: true
        }
    },
    "extra-modifiers": {
        "tertiary": {
            $type: "color",
            $required: true
        },
        "quaternary": {
            $type: "color",
            $required: true
        }
    }
}

// evaluated as
{
    "GLOBAL": {
        "background-color": {
            "primary": {
                $type: "color",
                $required: true
            },
            "secondary": {
                $type: "color",
                $required: true
            },
            "tertiary": {
                $type: "color",
                $required: true
            },
            "quaternary": {
                $type: "color",
                $required: true
            }
        },
        "text-color": {
            "primary": {
                $type: "color",
                $required: true
            }, 
            "secondary": {
                $type: "color",
                $required: true
            }
        }
    }
}

// theme
{
    "GLOBAL": {
        "background-color": {
            "primary": "#FFFFFF",
            "secondary": "#E1E1E1",
            "tertiary": "#BDEFEA",
            "quaternary": "#8FC8C2"
        },
        "text-color": {
            "primary": "black",
            "secondary": "#4D4D4D"
        }
    }
}

// output from Themer.generate
{
    "GLOBAL__background-color__primary": "#FFFFFF",
    "GLOBAL__background-color__secondary": "#E1E1E1",
    "GLOBAL__background-color__tertiary": "#BDEFEA",
    "GLOBAL__background-color__quaternary": "#8FC8C2",
    "GLOBAL__text-color__primary": "black",
    "GLOBAL__text-color__secondary": "#4D4D4D"
}
```

### Inheritance

Inheritance allows sections of the schema to inherit the values from already computed sections of the schema. 

They can be thought of as similar to mixins but are injected **after** evaluation. 

*Note #1:* at the moment only single inheritance is supported.

*Note #2*: dot-path accessors can also be used to select nested inheritance sections (i.e. `"level-1.level-2"`).

**Example:**
```js
// Let's take the previous mixins example and add more sections to the base schema

// schema
{
    "GLOBAL": {
        $mixins: "section"
    },
    "Button": {
        $inherits: "GLOBAL"
    }
}

// mixins
{
    "section": {
        "background-color": {
            $mixins: "background"
        },
        "text-color": {
            $mixins: "text"
        }
    },
    "background": {
        $mixins: ["base-modifiers", "extra-modifiers"]
    },
    "text": {
        $mixins: "base-modifiers"
    },
    "base-modifiers": {
        "primary": {
            $type: "color",
            $required: true
        },
        "secondary": {
            $type: "color",
            $required: true
        }
    },
    "extra-modifiers": {
        "tertiary": {
            $type: "color",
            $required: true
        },
        "quaternary": {
            $type: "color",
            $required: true
        }
    }
}

// evaluated as
{
    "GLOBAL": {
        "background-color": {
            "primary": {
                $type: "color",
                $required: true
            },
            "secondary": {
                $type: "color",
                $required: true
            },
            "tertiary": {
                $type: "color",
                $required: true
            },
            "quaternary": {
                $type: "color",
                $required: true
            }
        },
        "text-color": {
            "primary": {
                $type: "color",
                $required: true
            }, 
            "secondary": {
                $type: "color",
                $required: true
            }
        }
    },
    "Button": {
        $inherits: "GLOBAL"
    }
}

// theme
{
    "GLOBAL": {
        "background-color": {
            "primary": "#FFFFFF",
            "secondary": "#E1E1E1",
            "tertiary": "#BDEFEA",
            "quaternary": "#8FC8C2"
        },
        "text-color": {
            "primary": "black",
            "secondary": "#4D4D4D"
        }
    },
    "Button": {
        "background-color": {
            "primary": "#2CDEF0",
            "secondary": "#1D8D99",
            "tertiary": "#29A2E2",
            "quaternary": "#3592C4"
        }
        // By leaving "text-color" out, it will just be evaluated to the same value as it is in "GLOBAL"
    }
}

// output from Themer.generate
{
    "GLOBAL__background-color__primary": "#FFFFFF",
    "GLOBAL__background-color__secondary": "#E1E1E1",
    "GLOBAL__background-color__tertiary": "#BDEFEA",
    "GLOBAL__background-color__quaternary": "#8FC8C2",
    "GLOBAL__text-color__primary": "black",
    "GLOBAL__text-color__secondary": "#4D4D4D",
    "Button__background-color__primary": "#2CDEF0",
    "Button__background-color__secondary": "#1D8D99",
    "Button__background-color__tertiary": "#29A2E2",
    "Button__background-color__quaternary": "#3592C4",
    "Button__text-color__primary": "black",
    "Button__text-color__secondary": "#4D4D4D",
}
```

### Custom Types

Added custom types is supported via the `registeredTypes` parameter in `Themer.generate`.

Adding custom types can be done manually by adding object key-values with the following form:
```js
[name]: {
    name: String, // The $type
    validator: Function // The validation function
}
```

To make adding custom types simpler the `TypeBuilder` builder class can be used.

**Usage:**
```js
// ES5
const TypeBuilder = require("themer@core").TypeBuilder;

// ES6+
import { TypeBuilder } from "themer@core";

// Create instance
const tb = new TypeBuilder();

// Add custom types
tb.add("isFoo", (val) => val.includes("foo"));

// Build the object to pass into Themer.generate
const registeredTypes = tb.build();

// registeredTypes = {
//     "isFoo": {
//         name: "isFoo",
//         validator: (val) => val.includes("foo")     
//     }   
// }
```

### Options

Options can be used to configure the behavior of `Themer.generate`.


**Default Options:**
```js
{
    // The level separator in the generated object
    SEPARATOR: "__",
    // The prefix of each item in the generated object
    PREFIX: "",
    // The default endpoint
    DEFAULT_ENDPOINT: {
        $required: false,
        $type: "any",
        $default: null,
        $validate: null
    },
    // Standardizes any color values
    // Note: this allows the SASS color-link function to work properly
    // Ex: "rgb(25, 60, 80)" becomes "25, 60, 80"
    STANDARDIZE_COLORS: true,
    // When enabled, generated values from sections with with inherits are only
    // included if an override value exists for that specific generated value.
    // This option is meant to be used when the redundant section-specific 
    // generated keys that using $inherits causes is not wanted.
    CONDENSE_VALUES: false
}
```


## Extra Tools

### SASS Tools

To make linking to the theme easier the following SCSS functions have been built. 

*Note:* this assumes that [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) with the generated theme values is in scope of the styles using these functions.

**Usage:**
```scss
@import "[path to themer]/tools/sass/index.scss";
```

**Functions:**
```scss
// Generates a CSS var reference of the given path partials.
// base-link also provides a default fallback value which is the given link but with the root replaced with 'GLOBAL'
// Ex: base-link("level-1", "level-2") -> var(--level-1__level-2, var(--GLOBAL__level-2))
some-propety: base-link($path-partials...);


// Generates a CSS var reference specifically for colors
// Note: color-link only supports rgba color values so non-rgba values must be converted when injected the CSS variables
// Ex: color-link("level-1", "level-2", 0.5) -> rgba(var(--level-1__level-2, var(--GLOBAL__level-2)), 0.5)
// Note: color-link will only work if STANDARDIZE_COLORS=true in the generate options
some-propety: color-link($path-partials...[, $opacity: 1]);
```

**Example:**
```scss
// Assume that the previous theme example has been generated and injected as CSS variables

@import "[path to themer]/tools/sass/index.scss";

.some-selector {
    color: color-link("Button", "text-color", "primary");
    background-color: color-link("Button", "background-color", "secondary", 0.5);
}
```