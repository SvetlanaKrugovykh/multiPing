module.exports = {
  apps: [{
    name: 'multiping',
    script: './index.js',
    watch: true,
    cwd: '/intelligence/multiPing',
    env: {
      NODE_ENV: 'production'
    }
  }]
}