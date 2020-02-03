# @reactioncommerce/migrator

![npm (scoped)](https://img.shields.io/npm/v/@reactioncommerce/migrator.svg)
 [![CircleCI](https://circleci.com/gh/reactioncommerce/migrator.svg?style=svg)](https://circleci.com/gh/reactioncommerce/migrator)

Command line interface for migrating MongoDB databases.

## Features

Although this CLI tool was created for [Reaction Commerce](https://reactioncommerce.com/), it is a general purpose MongoDB data migration tool that you can use for any project.

- Migrations are scoped to namespaced "tracks", allowing you to track the version of different areas of data within the same database.
- Store all desired versions in a config file, or different config files per environment. Commit these to version control to keep a record of what data versions are in each of your environments.
- Tracks are locked while they are being migrated, preventing two people or two migration runner workers from trying to run the same migration.
- Although each migration step for a single track necessarily runs in series, track migrations happen in parallel using Node worker threads, which means migrating data will take less time.
- Migration progress is reported on screen allowing you to estimate how long migrations will take to finish.
- Migration history is stored and can be viewed or cleared with CLI commands
- One level of version branching is supported. Versions can be either an integer or two integers separated with a dash (e.g., "2-1"). This causes the track to split, so that you can migrate up to "2-1" from "2-0", but if you migrate up to "3-0" from "2-0", the "2-1" migration will not run. This is useful if you need to migrate some data for an older release that you still support without affecting your current release.

## Usage

This CLI looks for a config file in the current directory. We recommend that you create a new directory in which this config file and a `package.json` file will live, and commit it to version control.

You can also have different config files per environment, which allows this one "migrations" repo to reflect the current "desired state" of all your data in all your environments.

To create the directory and install this package in it, run the following commands:

```sh
mkdir migrations
cd migrations
echo "12.14.1" > .nvmrc
nvm use
npm init -y
npm i @reactioncommerce/migrator
touch migrator.config.js
```

Then edit `package.json` and set `"type": "module"`.

The main thing in the object exported by the config file is an array of tracks:

```js
// migrator.config.js
export default {
  tracks: [
    // Migrations exported by an NPM package
    {
      namespace: "my-namespace",
      package: "npm-package-name",
      version: 2
    },
    // Ad-hoc migrations located in the current directory
    {
      namespace: "my-namespace",
      path: "./migrations/index.js",
      version: 5
    }
  ]
};
```

## Commands

### migrator report

To view a report of current data versions versus desired data versions and which migrations are needed, edit `migrator.config.js` to set all the versions to your desired versions. Then run:

```sh
MONGO_URL=mongodb://localhost:27017/dbname migrator report
```

*Important:* Set `MONGO_URL` to the MongoDB connection URL with correct database name.

To view the report for a specific environment, edit `migrator.config-<env>.js` and then run:

```sh
MONGO_URL=mongodb://localhost:27017/dbname migrator report <env>
```

### migrator migrate

To view a report of current data versions versus desired data versions and which migrations are needed and then choose whether to run migrations, edit `migrator.config.js` to set all the versions to your desired versions. Then run:

```sh
MONGO_URL=mongodb://localhost:27017/dbname migrator migrate
```

*Important:* Set `MONGO_URL` to the MongoDB connection URL with correct database name.

To view the report for a specific environment, edit `migrator.config-<env>.js` and then run:

```sh
MONGO_URL=mongodb://localhost:27017/dbname migrator migrate <env>
```

If you don't want to be prompted to decide whether to run them (recommended only for CI), add `-y`:

```sh
MONGO_URL=mongodb://localhost:27017/dbname migrator migrate -y
# OR
MONGO_URL=mongodb://localhost:27017/dbname migrator migrate <env> -y
```

### migrator history

To view a list of all previous migration runs for a track, run:

```sh
MONGO_URL=mongodb://localhost:27017/dbname migrator history <namespace>
```

### migrator clear-history

To clear the list of all previous migration runs for a track, run:

```sh
MONGO_URL=mongodb://localhost:27017/dbname migrator clear-history <namespace>
```

## How to Publish a Package with Migrations

To be compatible with this tool, an NPM package with migrations must have an ES module export named "migrations". This must be an object with the following structure:

```js
const migrations = {
  tracks: [
    {
      namespace: "something",
      migrations: {
        2: {
          up(context) {},
          down(context) {}
        }
      }
    }
  ]
}
```

The `namespace` should be something similar to your package name that will not collide with other packages that provide migrations.

The keys of the `migration` object are the database version numbers. These must be a single number (`2`) or two numbers separated by a dash (`2-1`) if you need to branch off your main migration path to support previous major releases. Only one branch level is allowed.

Version `1` is reserved as the assumed version before any migrations run. Versions 0 and below are invalid.

Each migration version must provide an `up` function.

Each migration version must provide one of the following for `down`:

- A `down` function
- `down: "unnecessary"` if a down function isn't needed
- `down: "impossible"` if migrating down isn't possible due to some information having been deleted

Both types of functions receive a migration context, which has a connection to the MongoDB database and a `progress` function for reporting progress.

The `up` and `down` functions should do whatever they need to do to move data from your N-1 or N+1 schema to your N schema. They must always be written as if there are millions of documents to convert, meaning they should use MongoDB bulk reads and writes and do updates in small batches.

While running, the migration function can and should report its progress by calling `context.progress(percentDone)`. The migration function must return a Promise and when that promise resolves, the migration is considered done and the version for this namespace in the database is incremented. If the Promise is rejected, the migration is considered failed and the data may be in a partially migrated state.

To avoid issues, we strongly suggest that you write idempotent migration code, that is, code that can be run multiple times and will do nothing, yet succeed, if the data is already migrated.

After you've created and exported migrations for you package, the final step is to check the current migration version for each of your namespaces somewhere in your top-level or startup code, after you are connected to MongoDB but before you run any database commands. Do this by depending on the [@reactioncommerce/migrator-version-check]() NPM package and calling the function it exports. Refer to the documentation for that package.

## Commit Messages

To ensure that all contributors follow the correct message convention, each time you commit your message will be validated with the [commitlint](https://www.npmjs.com/package/@commitlint/cli) package, enabled by the [husky](https://www.npmjs.com/package/husky) Git hooks manager.

Examples of commit messages: https://github.com/semantic-release/semantic-release

## Publication to NPM

The `@reactioncommerce/migrator` package is automatically published by CI when commits are merged or pushed to the `master` branch. This is done using [semantic-release](https://www.npmjs.com/package/semantic-release), which also determines version bumps based on conventional Git commit messages.

## License
Copyright 2020 Reaction Commerce

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

See the License for the specific language governing permissions and
limitations under the License.
