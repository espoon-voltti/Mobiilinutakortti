# Mobiilinutakortti backend

The backend directory includes the server side code for running Mobiilinutakortti app.

## Development

Check the README of the root directory for instructions on how to run the backend for development.

Suomi.fi authentication doesn't work locally without some extra configuration. **The below are original instructions
for the city of Vantaa. They will probably not work as-is.**

**Network configuration**

Since the Suomi.fi identity provider for SSO is configured against a test environment in AWS cloud, it expects to talk
with the AWS. Therefore it responds with AWS URLs. To make them work locally, the easiest way is to override the Amazon
hostname in `/etc/hosts` file:

127.0.0.1 api.mobiilinuta-admin-test.com

Since Suomi.fi expects to communicate over HTTPS and not HTTP, we will also need to have:

- The RSA private key of the test environment. When you have it, store it in
  `backend/certs/nutakortti-test_private_key.pem`. This will make the backend service use that for TLS communication
  also, enabling HTTPS automatically.
- The default HTTPS port 443 redirected to your local backend port.

In many systems (e.g. Linux), port numbers below 1024 are privileged. If you don't want to run the service with elevated
privileges, in Linux you could forward the port for example with _iptables_:

sudo iptables -t nat -A OUTPUT -p tcp -o lo --dport 443 -j REDIRECT --to-ports 3000

Or, in Mac OSX (might not work exactly like this, check out if you have lo0):

echo "rdr pass on lo0 inet proto tcp from any to 127.0.0.1 port 443 -> 127.0.0.1 port 3000" | sudo pfctl -ef -

## Environment variables / secrets

**This list might not be comprehensive.** Search for `process.env` to find all environment variables used in the code.

The secrets are:

- `AUTH_SIGNKEY`: Secret string used to sign and validate the auth tokens. Arbitrary.
- `RDS_PASSWORD`: Amazon RDS password.
- `SP_PKEY`: Private key of the service for SAML2.0 communication with Suomi.fi. Note: not the TLS private key. If
  entering this as an environment variable, separate new lines using "\n" - they are converted to real newline
  characters while reading the key.
- `TELIA_PASSWORD`: Telia SMS service password.
- `TELIA_USERNAME`: Telia SMS service user name.

The environment variables are:

- `CERT_SELECTION`: Possible values are `test` and `prod`. Determines which set of certificates to use in SAML2.0
  communication with Suomi.fi. The certificates are stored in the `certs` directory.
- `FRONTEND_BASE_URL`: Base URL for frontend. Used e.g. in redirecting the user during SSO process.
- `IDP_ENTITY_ID`: Entity ID of the identity provider, Suomi.fi in this case. Defined in the IdP metadata XML.
- `RDS_DB_NAME`: Amazon RDS database name.
- `RDS_HOSTNAME`: Amazon RDS URL host part.
- `RDS_PORT`: Amazon RDS port.
- `RDS_USERNAME`: Amazon RDS user name.
- `SP_ASSERT_ENDPOINT`: Endpoint address for Assertion Consumer Service in SAML2.0 communication. Defined in metadata
  XML.
- `SP_ENTITY_ID`: Entity ID of the service. Defined in metadata XML.
- `SSO_LOGIN_URL`: Identity provider's login URL. Defined in the IdP metadata XML.
- `SSO_LOGOUT_URL`: Identity provider's logout URL. Defined in the IdP metadata XML.
- `SUPER_ADMIN_FEATURES`: If "yes", allows creating a new super admin via _registerSuperAdmin_ endpoint and enables
  creating test junior data via endpoints. See the project root readme for details.
- `TELIA_ENDPOINT`: Telia SMS service endpoint URL.
- `TELIA_USER`: The name of the sender as it appears on SMS messages.

Additionally, the frontend apps require these environment variables:

- `REACT_APP_ENDPOINT`: the base API URL
- `REACT_APP_ADMIN_FRONTEND_URL`: (only for admin-frontend) URL where to go when an admin logouts

New env variables added for ad integration

- `API_BASE_URL`: API base url form ad-saml login callbacks
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `REDIS_PASSWORD`: Redis password
- `REDIS_TLS_SERVER_NAME`:
- `REDIS_DISABLE_SECURITY`:
- `AD_SAML_ENTRYPOINT_URL`: Ad saml address
- `AD_SAML_LOGOUT_URL`: Ad saml logout address
- `AD_SAML_ISSUER`:
- `AD_SAML_PUBLIC_CERT`:
- `AD_SAML_IDP_CERT`:
- `AD_SAML_PRIVATE_CERT`:
- `CRYPTO_SECRET_KEY`: Secret key for encryption (32 characters for AES-256-CBC)
- `COOKIE_SECRET`: Secret key for cookies

Use the variable AD_MOCK if you want to mock the AD for the local development

- `AD_MOCK=true`

## Swagger documentation

Swagger documentation endpoint located at "api/swagger". The documentation is configured so that endpoints are auto
generated, along with their comments. Future endpoint only need to mark which tag it belong to and which authentication
level it have. Optional comments can be added for context.

There are 3 authentication level corespond to 3 level of user: super admin, admin (normal youth worker), and junior.
Each level of user get access to different endpoint.

Swagger documentation does not document api response. If desire api response can be documented manually in the future.
