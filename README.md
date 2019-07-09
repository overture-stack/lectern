<h1 align="center">Lectern</h1>

<p align="center">Data Dictionary Management</p>

<p align="center">
    <a href="https://github.com/overture-stack/lectern">
        <img alt="Under Development" 
            title="Under Development" 
            src="http://www.overture.bio/img/progress-horizontal-UD.svg" width="320" />
    </a>
</p>

## Introduction
Lectern is a web service for storing and managing data dictionaries that describe TSV files. The service is responsible for maintaining different versions of a dictionary as well as computing the diff between different versions.

The indended use of the data dictionaries is to describe the structure and validations of different TSV files of interest and to be consumed downstream by a submission system that will use the validation rules against submitted files.

## Development

### Technology
- Node.js 8.10+
- Typescript 3.5
- Express
- Mongoose
- Mocha
- Chai
    - Chai-HTTP
- Testcontainers

### Build & Run

Install dependencies, run tests, and build.
```node
npm i
npm run test
npm run build-ts
```

This will compile the typescript and place the output in the `dist/` directory.

To run after it is built:
```node
npm start
```

