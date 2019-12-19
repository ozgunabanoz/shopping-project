# A basic shopping site project designed to test some Node.js features

- Uses Express.js in server side, MongoDB with mongoose for database operations but in the earlier commits, MySQL has been used with Sequelize.
- Ejs used for basic front end design.
- SendGrid integrated for confirmation emails.
- Stripe for basic payment operations.
- CSRF tokens has been used for protection.
- Express-validator used for request validation.
- Basic image upload/download operations integrated. Also pdf generation has been added after order confirmation.
- In the authentication side of the application, passwords are hashed with bcryptjs package before saved into database.
- Sessions used for authorization. Session objects are stored in both local storage and database.
