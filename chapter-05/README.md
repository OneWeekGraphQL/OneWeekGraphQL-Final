# Install and configure Docker Compose

We’re going to install a MySQL database to persist our data. And we’ll install it using Docker and Docker compose, which is a great platform agnostic way to install and manage development databases.

Keep in mind that we’ll only be using Docker for local development. We’ll use a hosted database for staging and production, and we’ll host our Next.js application using Vercel, which does not need Docker.

Install Docker if you don’t already have it by following their [getting started guide](https://docs.docker.com/get-started/), based on your operating system.

Create a file called `docker-compose.yml` and define a service called database. It will describe a MySQL image, along with environment variables like database name and credentials. It will also expose the service on port 3306.

Here’s what the final result should look like:

```yaml
version: "3"

services:
  database:
    platform: linux/x86_64
    image: mysql
    restart: always
    environment:
      - MYSQL_DATABASE=mydb
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_USER=user
      - MYSQL_PASSWORD=password
    ports:
      - "3307:3306"
```

Run `docker compose up` to start and expose the database. You can now access it using the following URL: `mysql://root:password@localhost:3307/mydb`
