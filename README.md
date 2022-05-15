# SCP Webpack Plugin

A webpack plugin to copy build/sourcemaps to a remote server. Uses [NodeSSH](https://www.npmjs.com/package/node-ssh) to connect and upload files.

## Use Cases
1. **Private Sourcemaps**: Upload source maps to a remote server behind VPN so that source maps are only available to developers.
2. **Host build**: Upload the build to a remote server for hosting. 

## Installation
`webpack-scp-plugin` requires at least webpack 4 or greater.

Using npm:

```npm install webpack-scp-plugin --save-dev```

Using yarn:

```yarn add webpack-scp-plugin --dev```

## Usage

#### 1. Upload Complete Build
```
const WebpackScpPlugin = require('webpack-scp-plugin');

const config = {
  plugins: [
    new WebpackScpPlugin({
        destPath: '/var/www/',
        connect: {
          host: 'IP or URL',
          username: 'ubuntu',
          privateKey: 'Path to private key'
        }
    }),
  ],
};
```
#### 2. Upload Source Maps Only
Use the [SourceMapDevToolPlugin](https://webpack.js.org/plugins/source-map-dev-tool-plugin/) to ouput source maps to a seperate directory.
```
new webpack.SourceMapDevToolPlugin({
  filename: `sourcemaps/[name].js.map`,
  publicPath: 'url of your server',
  fileContext: 'public'
})
```
Specify the srcPath to be the path to sourcemaps folder
```
const config = {
  plugins: [
    new WebpackScpPlugin({
        srcPath: path.join(__dirname, "build", "sourcemaps"),
        destPath: '/var/www/',
        connect: {
          host: 'IP or URL',
          username: 'ubuntu',
          privateKey: 'Path to private key'
        }
    }),
  ],
};
```


### Options
|Option     |Type    |Required   |Description 
|-----------|--------|-----------|-----------
|srcPath       |`string`|options   | Path of the directory from where the files will be recursively uploaded. If not specified it will use the `output.path` value in webpack configuration. 
|destPath    |`string`|required   | Path to upload files to in remote server
|connect     |`object`|required   | SSH Connection [options](https://github.com/steelbrain/node-ssh)


