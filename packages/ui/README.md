# Lectern UI

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
[<img hspace="5" src="https://img.shields.io/badge/chat--with--developers-overture--slack-blue?style=for-the-badge">](http://slack.overture.bio)
[<img hspace="5" src="https://img.shields.io/badge/License-AGPL--3.0-blue?style=for-the-badge">](https://github.com/overture-stack/lectern/blob/main/LICENSE)

This is a ReactJS Component Library of reusable components for visualizing and interacting with Lectern Dictionaries and Schemas.

## Features

- DictionaryTableView
- DictionaryEntityRelationshipView

## Installation

Requires React 19 and a bundler such as Vite or webpack.

```sh
npm install @overture-stack/lectern-ui
```

Render a dictionary from a Lectern server:

```tsx
import { DictionaryTable } from '@overture-stack/lectern-ui';

const DictionaryPage = () => <DictionaryTable lecternUrl="http://localhost:3000" dictionaryName="example-dictionary" />;
```

To check the install without a server, to read a hosted dictionary file, or to configure filters, custom columns, and theming, see the [Viewer setup guide](https://github.com/overture-stack/lectern/blob/main/docs/04-viewer/01-setup.md). The [Reference](https://github.com/overture-stack/lectern/blob/main/docs/04-viewer/02-reference.md) lists every export and which are in the published release.

## Developer Docs

Documentation for developers looking to contribute to the Lectern-UI component library can be found [here](./docs).
