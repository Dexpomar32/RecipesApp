# RecipesApp

This is a web application for managing culinary recipes, allowing users to register, log in, view, and add their own recipes.

## Technologies Used

* Frontend: HTML5, CSS3, JavaScript
* Backend: Node.js, Express.js
* Database: SQLite3

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone [repository_url]
    cd my-recipes-app/
    ```

2.  **Install Node.js dependencies:**

    ```bash
    npm install
    ```

3.  **Run the application:**

    ```bash
    node server.js
    ```

    The server should start on port 3000 (or the port specified in `server.js`).

## Database Setup

The application uses SQLite3. The database file (`recipes.db`) is created automatically if it doesn't exist. The database schema (tables `users` and `recipes`) is defined in `db.js`.

## API Endpoints

* `POST /api/register` - Registers a new user.
* `POST /api/login` - Authenticates a user and returns a JWT.
* `GET /api/recipes` - Returns a list of all recipes.
* `GET /api/recipes/:id` - Returns the details of a specific recipe.
* `POST /api/recipes` - Creates a new recipe (requires authentication).

## Notes

* Image uploads are handled by `multer`, and images are stored in the `public/uploads/` directory.
* User authentication is implemented using JWT.
* Password hashing is done with `bcrypt`.

## Further Development

* Implement CRUD (Update/Delete) operations for recipes.
* Add search and filtering functionality.
* Implement a favorites feature.
* Add pagination for recipe lists.
* Implement user reviews/comments for recipes.
* Deploy the application to a hosting service.
