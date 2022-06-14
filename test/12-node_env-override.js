var requireUncached = require('./_utils/requireUncached');

'use strict';

var NODE_CONFIG_DIR = __dirname + '/12-config'

// Dependencies
var vows = require('vows'),
    assert = require('assert');

['NODE_CONFIG_ENV', 'APP_CONFIG_ENV'].forEach(envName => {
  vows.describe(`Tests for *_CONFIG_ENV load order: ${envName}`)
      .addBatch({
        'Library initialization': {
          topic: function() {
            // other test suites modify process.env, let's reset
            // the following batches with known values and
            // make sure we have a valid CONFIG object.
            delete process.env.NODE_ENV;
            delete process.env[envName];

            process.env.NODE_CONFIG_DIR = NODE_CONFIG_DIR;

            return requireUncached(__dirname + '/../lib/config');
          },
          'Library is available': function(config) {
            assert.isObject(config);
          }
        }
      })
      .addBatch({
        'Verify behavior of undefined *_CONFIG_ENV and undefined NODE_ENV': {
          topic: function() {
            delete process.env.NODE_ENV;
            delete process.env[envName];

            return requireUncached(__dirname + '/../lib/config');
          },
          'default \'development\' deployment should be used': function(CONFIG) {
            assert.equal(CONFIG.util.getEnv('NODE_ENV'), 'development');
            assert.equal(CONFIG.get('deploymentUsed'), 'default');
          }
        }
      })
      .addBatch({
        'Verify behavior of undefined *_CONFIG_ENV with defined NODE_ENV': {
          topic: function() {
            process.env.NODE_ENV = 'apollo';

            return requireUncached(__dirname + '/../lib/config');
          },
          'NODE_CONFIG_ENV by itself should be used': function(CONFIG) {
            assert.equal(CONFIG.util.getEnv('NODE_CONFIG_ENV'), 'apollo');
            assert.equal(CONFIG.get('deploymentUsed'), 'node-config-env-provided');
          },
          'Revert process runtime changes': function() {
            delete process.env.NODE_ENV;
          }
        }
      })
      .addBatch({
        'Verify behavior of a defined *_CONFIG_ENV and undefined NODE_ENV': {
          topic: function() {
            process.env[envName] = 'mercury';

            return requireUncached(__dirname + '/../lib/config');
          },
          'NODE_ENV by itself should be used': function(CONFIG) {
            assert.equal(CONFIG.util.getEnv(envName), 'mercury');
            assert.equal(CONFIG.get('deploymentUsed'), 'node-env-provided');
          },
          'Revert process runtime changes': function() {
            delete process.env.NODE_ENV;
          }
        }
      })
      .addBatch({
        'Verify behavior of specified *_CONFIG_ENV overriding NODE_ENV': {
          topic: function() {
            process.env[envName] = 'apollo';
            process.env.NODE_ENV = 'mercury';

            return requireUncached(__dirname + '/../lib/config');
          },
          'NODE_*_ENV value should be used': function(CONFIG) {
            assert.equal(CONFIG.get('deploymentUsed'), 'node-config-env-provided');
          },
          'Revert process runtime changes': function() {
            delete process.env[envName];
            delete process.env.NODE_ENV;
          }
        }
      })
      .addBatch({
        'Library destructor': {
          'Revert process runtime changes': function() {
            delete process.env.NODE_CONFIG_DIR;
            delete process.env[envName];
            delete process.env.NODE_ENV;
          }
        }
      })
      .export(module);
})
