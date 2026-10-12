# Library Books REST API Design

## Endpoints

* **List all books**
  * **Method:** `GET`
  * **Path:** `/books`
  * **Description:** Retrieves a list of all available books in the library.
  * **Success Status Code:** `200 OK`

* **Get one book**
  * **Method:** `GET`
  * **Path:** `/books/:id`
  * **Description:** Retrieves details of a specific book by its unique ID.
  * **Success Status Code:** `200 OK`

* **Create a new book**
  * **Method:** `POST`
  * **Path:** `/books`
  * **Description:** Adds a new book to the library catalog.
  * **Example Request Body:**
    ```json
    {
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "publishedYear": 1925,
      "genre": "Fiction"
    }
    ```
  * **Success Status Code:** `201 Created`

* **Update a book**
  * **Method:** `PUT`
  * **Path:** `/books/:id`
  * **Description:** Updates all details of an existing book by ID.
  * **Example Request Body:**
    ```json
    {
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "publishedYear": 1925,
      "genre": "Classic Fiction"
    }
    ```
  * **Success Status Code:** `200 OK`

* **Delete a book**
  * **Method:** `DELETE`
  * **Path:** `/books/:id`
  * **Description:** Removes a book record from the library by ID.
  * **Success Status Code:** `204 No Content`

* **List books by author (Query Parameter)**
  * **Method:** `GET`
  * **Path:** `/books?author={authorName}`
  * **Description:** Filters and returns books written by a specific author.
  * **Success Status Code:** `200 OK`

---

## Error Handling

* **400 Bad Request**
  * **When it occurs:** Sent when the request payload is malformed or missing required fields.
  * **Example:** Sending a `POST` request to `/books` missing the `title` field.

* **404 Not Found**
  * **When it occurs:** Sent when the requested resource or endpoint cannot be found.
  * **Example:** Sending a `GET` request to `/books/9999` when no book with ID `9999` exists.