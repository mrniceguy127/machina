const init = require('./initializer').init;

init()
.then((client) => {
  console.log('Login success!');
  console.log("Username#XXXX: " + client.user.username + "#" + client.user.discriminator + "\n" +
              "ID: " + client.user.id);
})
.catch((err) => {
  console.error("Login failed.");
  console.error(err.stack);
});
