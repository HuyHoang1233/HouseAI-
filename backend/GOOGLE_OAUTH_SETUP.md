# Google OAuth setup

The Google login code is enabled only when all three environment variables below are set before the backend starts:

```powershell
$env:APP_GOOGLE_OAUTH_ENABLED = 'true'
$env:APP_GOOGLE_OAUTH_CLIENT_ID = 'your-client-id.apps.googleusercontent.com'
$env:APP_GOOGLE_OAUTH_CLIENT_SECRET = 'your-client-secret'
./mvnw.cmd spring-boot:run
```

In Google Cloud Console, create a **Web application** OAuth client and add this Authorized redirect URI for local development:

```
http://localhost:8080/api/login/oauth2/code/google
```

For a deployed app, set `APP_GOOGLE_OAUTH_FRONTEND_URL` to the public frontend origin and register the equivalent HTTPS backend callback URL with Google. Never commit a client secret to the repository.
