'use strict'

const mongoose = require('mongoose');
const app = require('./app');
const port = 3800;

// conexión database
mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost:27017/curso_mean_social", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(
      "La conexión a la base de datos curso_mean_social se ha realizado correctamente!"
    );

    // crear servidor
    app.listen(port, () => {
      console.log("Servidor corriendo en http://localhost:3800");
    });
  })
  .catch((err) => console.log(err));