# TypeSDK - Node.js SDK

JSpower is a comprehensive Node.js SDK designed for diverse projects. Please note that the project is currently in development, and using it in a production environment is not recommended.


## Modules Overview


### Async
- **async-retry** Retry a function until it returns a truthy value.

- **deferred** A promise that can be resolved or rejected by another function (Not working 100%).

- **delay** Delay a promise by a specified amount of time.

### Crypto
- **Asymmetric (Not Implemented)**
  - ECDSA
  - ECDH
  - RSA

- **LayeredEncryption** A class for encrypting and decrypting data with multiple layers of encryption that supports both symmetric and asymmetric encryption. __(asymmetric encryption is not implemented yet)__

- **Symmetric**
  - **AES** Encryption and decryption with payload signature.

- **pbkdf2** Password-based key derivation.

- **nonce** Generate a random nonce string with a specified length.

- **random bytes** Generate a `Uint8Array` filled with cryptographically secure random bytes.

- **UUID** Generate a unique universal identifier string.

- **sha256** Generate a SHA256 hash.

- **sha512** Generate a SHA512 hash.

- **Password**
  - **password generator** Generate a random, fully customizable password or passphrase.

- **Crypto Key** A class that contains a key and its metadata, useful for generating symmetric or asymmetric key pairs for `rsa` and `ec` algorithms.

- **base64 (Not Implemented)** Encode and decode base64 strings.

- **hex (Not Implemented)** Encode and decode hex strings.

- **UTF-8 (Not Implemented)** Encode and decode UTF-8 strings.

### Database
- **Postgres** A class for connecting to a Postgres database and executing queries, get opened connections, check if the database is online and do transactions.

### Errors
- **exception** An exception class for throwing errors with custom messages and context.

- **http** An exception class for throwing common HTTP errors with custom messages and context.
  - Bad Request (400)

  - Unauthorized (401)

  - Forbidden (403)

  - Not Found (404)

  - Method Not Allowed (405)

  - Not Acceptable (406)

  - Request timeout (408)

  - Conflict (409)

  - Internal Server Error (500)

  - Service Unavailable (503)

  - Gateway Timeout (504)


### Events
- **event emitter** An event emitter class for emitting and listening to events.

- **base event** An event class for creating custom events.

### HTTP
- **http client** An HTTP client class for making HTTP requests.

- **simple request** A simple HTTP request class for making HTTP requests.

### Cookies
- Set, read, and delete cookies in the browser.

### Math
- **built-in lib** The `node-js` built-in `Math` library.

- **comparator** A comparator class for comparing numbers and strings.

- **activation** Activation functions like sigmoid, leaky, etc.

- **point** A point class for creating points in a 2D space.

- **vector** A vector class for creating vectors in a 3D space.

- **vector 2D** A vector class for creating vectors in a 2D space.

- **random** A random class for generating pseudo-random numbers, random numbers with a specific range, strings, choosing random elements from an array, etc.


### Additional Math Functions
- **root** Calculate the nth root of a number.

- **factorial** Calculate the factorial of a number.

- **createArithmeticAverager** Create a function that calculates the arithmetic average of a series of numbers.

- **createGeometricAverager** Create a function that calculates the geometric average of a series of numbers.

- **arithmeticAverage** Calculate the arithmetic average of a variable number of input values.

- **geometricAverage** Calculate the geometric average of a variable number of input values.

- **clamp** Clamp a number within a specified range defined by the minimum and maximum values.

- **getFunctionValues** Evaluate a given function over a range of x values and return an object containing an array of points, minimum and maximum y values, and the string representation of the function.

- **isPowerOfTwo** Check if a number is a power of two.

- **isPrime** Check if a number is prime.

- **roundToPowerOfTwo** Round a number to the nearest power of two.

- **roundToNearestMultiple** Round a number to the nearest multiple of itself.

### Process
- **process promise** Create a fully customizable child process with the `spawn` method and return a promise with the process output.


### SSR
- **global constants** Constants like `ssrSafeDocument` or `ssrSafeLocation` that contain related objects with `undefined` fallbacks for server-side rendering.

- **safe-storage** A method to store data in the browser using the `localStorage` or `sessionStorage` object without throwing errors in server-side rendering. It also has a method called `jsonSafeStorage` for storing and retrieving JSON objects for both `localStorage` and `sessionStorage` safely with a set expiration time for the data.

### Types
- Type definitions for the project and some types that can be used in any project.

### Utils
- **assertions** A set of assertion functions for checking if a value is of a specific type or throwing an error if it is not.

- **is** Functions for checking if a value is of a specific type.

- **platform** Three constants for checking if the code is running in a browser-like environment.

- **string** Functions for manipulating strings like `strShuffle`, etc.

- **wordlist** The EFF Long Wordlist with 7776 words.


### Clipboard
- Async functions to copy and paste text from the clipboard and a `VirtualClipboard` class that can be used as a fallback to `navigator.clipboard`.


### Constants
- Util constants like `isNode` or `isProduction`.


### Speedometer
- Calculate data maxRate (Implementation incomplete).

### Array
- **shuffleArray** Asynchronous shuffle an array.

- **shuffleArraySync** Synchronous shuffle an array.

- **inorderTransversal** Generates an inorder traversal of a multidimensional array using a generator function

- **groupBy** Groups elements of an array based on the result of a grouping function

- **arrayLast** Returns the last element of an array

- **arrayFlat** Flattens a multidimensional array up to a specified depth

- **arrayChunk** Divides an array into chunks of a specified size.

- **ArrayWrapper** A class that wraps an array of numbers and provides utility methods.


### Date and Time
-  ### Parsers

    - **parseTimeString** Parse a time string into a `Date` object.

### Next.JS
- #### Middleware
  Middleware controller for Next.JS APIs.

  - **requestMethod** A middleware for checking the request method.

### Dotenv
- Load environment variables from a `.env` file into `process.env`.

### ASCI
- Constants for ASCII colors and styles.

### Logger
- A logger class for logging formated messages to the console or a file or database.

### Dataset
- **PredicativeFinder** A class for finding items in a dataset based on a predicative function.
- **DataFrame** A class for storing and manipulating data in a tabular format.

### Data Structures

#### Tree (Not Implemented)

### Validators
- **json** Check if a string is a valid JSON string.
- **serializable** Check if a value is serializable to JSON.
- **email** Check if a string is a valid email address.


### Stack
A stack data structure with a `Stack` class.


### Algorithms
- **crc32** A CRC32 algorithm for calculating the CRC32 checksum of a string.


### Iterator
- **range** A range iterator class for iterating over a range of numbers.
- **isIterableIterator** Check if a value is an iterable iterator.


### Enumerator
- **enumerateIterableIterator** A function for enumerating over an iterable object.


### Queue (Not Implemented)
Process jobs asynchronously in a queue.


## Installation

```bash
npm install --save jspower
```

```bash
yarn add jspower
```
