# ASCOM: Async/Agnostic Client Operations Manager

Welcome to the Async/Agnostic Client Operations Manager (ASCOM) repository. ASCOM is a modular solution for managing client operations in an asynchronous and agnostic manner.

## Modules Overview

### HTTP
This module provides functionality for handling HTTP operations in an agnostic manner.

- **request**: Build HTTP requests easily using this module.
- **cookies-jar**: Manage and store HTTP cookies efficiently.
- **client**: Implementation of an HTTP client with asynchronous support.
- **cors**: Middleware for handling Cross-Origin Resource Sharing (CORS) in HTTP requests.


### ACP (Async Communication Protocol)
This module provides functionality for handling ACP operations. It's not agnostic, working only in `Node.JS` environments.