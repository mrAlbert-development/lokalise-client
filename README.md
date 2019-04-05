# Lokalise-client

[![build status](https://badgen.net/travis/ibitcy/lokalise-client?icon=travis)](https://travis-ci.org/ibitcy/lokalise-client)
[![npm downloads](https://badgen.net/npm/dt/lokalise-client?icon=npm&color=green)](https://www.npmjs.com/package/lokalise-client)

Easy fetch your translations from lokalise.co:
1. Install `npm i lokalise-client --save-dev` or `yarn add lokalise-client --dev`
2. Create configuration file `translations.json`
3. In your `package.json` file add command `"fetch-translations": "translations fetch --path ./translations.json"`
4. Run command `npm run fetch-translations`

### Basic configuration `translations.json`

```json
{
  "dist": "./src/locale/",
  "defaultLanguage": "en",
  "token": "%token%",
  "projects": [
    {
      "id": "%project_id%"
    }
  ]
}
```

### Fetch several projects

```json
{
  "dist": "./src/locale/",
  "defaultLanguage": "en",
  "token": "%token%",
  "projects": [
    {
      "id": "%project_id%",
      "prefix": "__PROJECT_1__"
    },
    {
      "id": "%another_project_id%",
      "prefix": "__PROJECT_2__"
    }
  ]
}
```

### Pro mode

* Create file `translations.js` in your project dir
```js
const lokaliseClient = new LokaliseClient({
  token: '%token%',
});

lokaliseClient
.fetchProject({
  id: %projectId%,
})
.then(project => {
  return project.save('./src/locales');
})
.then(languages => {
  languages.forEach(language => console.log('Locale successfully saved! ', language));
})
.catch(error => {
  console.log('Save locale failed! ', error)
});
```
* In your `package.json` file add command `"translations": "node translations"`
* In terminal run command `npm run translations`

### Load several projects. Merge projects. Save translations in file.

```js
lokaliseClient
.fetchProjects([
  {
    id: %projectId1%,
  },
  {
    id: %projectId2%,
  },
])
.then(projects => {
  projects.forEach(project => {
    project.defaultLanguage = 'en';
  });

  return projects;
})
.then(projects => {
  const project = LokaliseClient.mergeProjects(projects, '%new project id');

  return project.save('./src/locales')
})
.then(languages => {
  languages.forEach(language => console.log('Locale successfully saved! ', language));
})
.catch(error => {
  console.log('Save locale failed! ', error)
});
```

### Find unused translations in project.

```js
lokaliseClient
.fetchProject({
  id: %projectId%,
})
.then(project => {
  return project.getUnusedTranslationsKeys('./src/app/', 'en');
})
.then(notFoundKeys => {
  console.log(notFoundKeys);
});
```

### Add prefix for project translations.

```js
lokaliseClient
.fetchProject({
  id: %projectId%,
})
.then(project => {
  project.prefix = '__SOME_PREFIX__.'

  // Another actions with project
});
```

### Set default language in project. If no translation for some key, take it from default language.

```js
lokaliseClient
.fetchProject({
  id: %projectId%,
})
.then(project => {
  project.defaultLanguage = 'en';

  // Another actions with project
});
```

## Locale

| Field | Method | Description |
|-|-|-|
| language | `get` | Locale language |
| prefix | `get/set` | Prefix for translations keys |
| translations | `get` | Locale translations |

## Project

| Field | Method | Description |
|-|-|-|
| id | `get` | Project unique identifier |
| defaultLanguage | `get/set` | Default language of project |
| prefix | `set` | Prefix of all locales in project |
| languages | `get` | List of languages in project |
| getUnusedTranslationsKeys | `get` | Returns unused translations keys in your project directory |
