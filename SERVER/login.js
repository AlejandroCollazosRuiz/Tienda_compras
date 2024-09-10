import express from 'express';
import sql from 'mssql';
import session from 'express-session';
import bodyParser from 'body-parser';
import { config } from './config.js';

const inicioSesion = express.Router();
const usuarioInside = express.Router();

inicioSesion.use(bodyParser.urlencoded({ extended: true }));
inicioSesion.use(bodyParser.json());

inicioSesion.use(
  session({
    secret: 'secreto',
    resave: false,
    saveUninitialized: true
  })
);

// Formulario de inicio de sesión
inicioSesion.get('/', (req, res) => {
  res.send(`
    <form method="POST" action="/login">
      <input type="email" name="correo" placeholder="Correo Electrónico" required>
      <input type="password" name="passw" placeholder="Contraseña" required>
      <input type="submit" value="Iniciar Sesión">
    </form>
  `);
});

// Procesar inicio de sesión
inicioSesion.post('/', async (req, res) => {
  const correo = req.body.correo;
  const passw = req.body.passw;
  const {idUsuario} = req.params;
  

  console.log('correo:', correo);
  console.log('passw:', passw);
  console.log('idUsuario:', idUsuario)

  if(correo===''||passw===''){
    console.log('Los campos no pueden estar vacios');
    
   }
   else{
    await sql.connect(config)
    .then(() => {
      const request = new sql.Request();
      request.input('correo', sql.VarChar, correo);
      request.input('passw', sql.NVarChar, passw);
    
      console.log('Ya entro a la consulta')

         const resultado = request
        .query('SELECT  idUsuario, nombreUsuario, telefono, correo, direccion FROM usuarios WHERE correo = @correo AND passw = @passw')
        .then((resultado) => {
          
          if (resultado.recordset.length === 0) {
            req.session.loggedin = true;
            req.session.correo = resultado.correo;
            res.redirect('/Registrado');
            res.send('Inicio de session exitoso')
        
          } else {
            
            res.send('Nombre de usuario o contraseña incorrectos');
        }
        })
        .catch((error) => {
          throw error;
        })
        .finally(() => {
          
          sql.close();
        });
         
    })
    .catch((error) => {
      throw error;
    });
   }
  
   
 
});

// Ruta protegida que requiere inicio de sesión
inicioSesion.get('/Registrado', (req, res) => {
  if (req.session.loggedin) {
    res.send('Bienvenido, ' + req.session.correo + '!');
  } else {
    res.redirect('/login');
  }
});



export { inicioSesion, usuarioInside };
