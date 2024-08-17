# Messaging app backend

This repository holds the back-end code for the [Messaging App](https://github.com/VMadhuranga/messaging-app).

## Run Locally

1. [Fork and clone](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) the project.

1. Go to the project directory.

   ```bash
   cd messaging-app-backend/
   ```

1. Create `.env` file with following environment variables.

   - `MONGODB_URI`
   - `ACCESS_TOKEN_SECRET`
   - `REFRESH_TOKEN_SECRET`
   - `FRONTEND_URL`

1. Install dependencies.

   ```bash
   npm install
   ```

1. Start the application.

   ```bash
   npm run serverStart
   ```

## Running Tests

To run tests, run the following command

```bash
npm run test
```
