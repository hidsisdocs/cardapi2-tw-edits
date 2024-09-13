module.exports = function(config) {
  const args = []

  config.set({
    files: [
        { pattern: 'src/**/*.ts*' }
    ],
    exclude: [
        'src/**/-*.ts*'
    ],
    frameworks: ['jasmine', 'karma-typescript'],
    preprocessors: {
        'src/**/*.ts*': ['karma-typescript']
    },
    reporters: [ 'progress', 'karma-typescript' ],
    browsers: ['Chrome'],

    karmaTypescriptConfig: {
      tsconfig: 'tsconfig.test.json',
    //   bundlerOptions: {
    //     transforms: [
    //         require("karma-typescript-es6-transform")()
    //     ]
    //   }
      /* bundlerOptions: {
        resolve: {
            alias: {},
            extensions: ['.js']
        }
      }*/
    },
    mime: {
        'text/x-typescript': ['ts','tsx']
    },
    browserNoActivityTimeout: 120000,
    browserDisconnectTolerance: 3,
    browserDisconnectTimeout : 120000,
    captureTimeout: 60000,
    client: {
      jasmine: {
        timeoutInterval: 60000,
        args
      }
    }
  })
}
